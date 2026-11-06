package com.zencas.edhr.production.service;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.MockedStatic;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.function.UnaryOperator;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

/** Real files with synthetic stream/delete/concurrent-path faults, not native disk failure tests. */
class DhrAttachmentImageVerificationTest {
    @TempDir Path directory;
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final AuditEventRepository audits = mock(AuditEventRepository.class);
    private final Logger logger = (Logger) LoggerFactory.getLogger(DhrAttachmentService.class);
    private final List<Path> snapshots = new ArrayList<>();
    private ListAppender<ILoggingEvent> logs;
    private DhrAttachmentService service;
    private Path original;
    private byte[] originalBytes;
    private Map<String, Object> row;

    @BeforeEach void setup() throws Exception {
        original = directory.resolve("original.png");
        assertThat(ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", original.toFile())).isTrue();
        originalBytes = Files.readAllBytes(original);
        Files.writeString(directory.resolve("unrelated"), "preserve");
        row = new HashMap<>(Map.of("active", true, "stored_path", original.toString(), "sha256", digest(originalBytes), "mime_type", "image/png"));
        when(jdbc.queryForList(anyString(), eq(1L))).thenReturn(List.of(Map.of("status", "COMPLETED", "summary_status", "DRAFT")));
        when(jdbc.queryForList(anyString(), eq(1L), eq(77L))).thenReturn(List.of(row));
        service = new DhrAttachmentService(jdbc, new ObjectMapper(), mock(SnowflakeIdGenerator.class), audits);
        logs = new ListAppender<>(); logs.start(); logger.addAppender(logs);
    }

    @AfterEach void clear() { logger.detachAppender(logs); logs.stop(); }

    @Test void successfulVerificationRemovesOnlyOwnedSnapshotBeforeUpdating() throws Exception {
        try (var files = snapshotFault(UnaryOperator.identity(), false)) { service.verify(1L, 77L); }
        assertThat(snapshots).hasSize(1).allSatisfy(path -> assertThat(path).doesNotExist());
        verify(jdbc).update(startsWith("UPDATE dhr_attachment SET verification_status='VERIFIED'"), any(Object[].class));
        verify(audits).save(any()); assertOriginalUnchanged(); assertThat(logs.list).isEmpty();
    }

    @Test void partialSnapshotWriteIsRemovedWithoutUpdatingOrTouchingOriginal() throws Exception {
        try (var files = snapshotFault(actual -> new FilterOutputStream(actual) {
            @Override public void write(byte[] bytes, int offset, int length) throws IOException {
                out.write(bytes, offset, 16); throw new IOException("injected snapshot partial write");
            }
        }, false)) {
            assertThatThrownBy(() -> service.verify(1L, 77L)).isInstanceOf(BusinessException.class).hasMessage("附件无法读取");
        }
        assertThat(snapshots).hasSize(1).allSatisfy(path -> assertThat(path).doesNotExist());
        assertNoUpdate(); assertOriginalUnchanged();
    }

    @Test void cleanupFailureAfterValidImageBlocksVerificationAndLocatesOwnedSnapshot() throws Exception {
        try (var files = snapshotFault(UnaryOperator.identity(), true)) {
            assertThatThrownBy(() -> service.verify(1L, 77L)).isInstanceOf(BusinessException.class).hasMessage("附件无法读取");
        }
        assertCleanupFailure(); assertNoUpdate(); assertOriginalUnchanged();
    }

    @Test void digestMismatchRemainsPrimaryWhenCleanupAlsoFails() throws Exception {
        row.put("sha256", "0".repeat(64));
        try (var files = snapshotFault(UnaryOperator.identity(), true)) {
            assertThatThrownBy(() -> service.verify(1L, 77L)).isInstanceOf(BusinessException.class)
                    .hasMessage("附件文件丢失或摘要不一致").satisfies(this::assertSuppressedCleanup);
        }
        assertCleanupFailure(); assertNoUpdate(); assertOriginalUnchanged();
    }

    @Test void invalidImageRemainsPrimaryWhenCleanupAlsoFails() throws Exception {
        originalBytes = "not an image".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        Files.write(original, originalBytes); row.put("sha256", digest(originalBytes));
        try (var files = snapshotFault(UnaryOperator.identity(), true)) {
            assertThatThrownBy(() -> service.verify(1L, 77L)).isInstanceOf(BusinessException.class)
                    .hasMessage("图片无法读取").satisfies(this::assertSuppressedCleanup);
        }
        assertCleanupFailure(); assertNoUpdate(); assertOriginalUnchanged();
    }

    @Test void formatCheckConsumesSameCopiedViewEvenWhenExternalActorChangesOriginalPath() throws Exception {
        var checked = new ArrayList<Path>();
        try (var files = snapshotFault(UnaryOperator.identity(), false);
             var images = mockStatic(ImageIO.class, call -> {
                 if (call.getMethod().getName().equals("createImageInputStream") && call.getArgument(0) instanceof File file) {
                     checked.add(file.toPath()); Files.writeString(original, "externally changed after copy");
                 }
                 return call.callRealMethod();
             })) {
            service.verify(1L, 77L);
        }
        assertThat(checked).containsExactlyElementsOf(snapshots); assertThat(snapshots).hasSize(1);
        assertThat(Files.readString(original)).isEqualTo("externally changed after copy");
        assertThat(snapshots).allSatisfy(path -> assertThat(path).doesNotExist());
        verify(jdbc).update(startsWith("UPDATE dhr_attachment SET verification_status='VERIFIED'"), any(Object[].class));
        verify(audits).save(any()); assertThat(Files.readString(directory.resolve("unrelated"))).isEqualTo("preserve");
    }

    private MockedStatic<Files> snapshotFault(UnaryOperator<OutputStream> output, boolean failDelete) {
        return mockStatic(Files.class, call -> {
            if (call.getMethod().getName().equals("createTempFile") && call.getArgument(0) instanceof String prefix && prefix.equals("edhr-dhr-image-")) {
                Path snapshot = Files.createTempFile(directory, prefix, ".tmp"); snapshots.add(snapshot); return snapshot;
            }
            if (call.getMethod().getName().equals("newOutputStream") && snapshots.contains(call.getArgument(0)))
                return output.apply((OutputStream) call.callRealMethod());
            if (call.getMethod().getName().equals("deleteIfExists") && snapshots.contains(call.getArgument(0)) && failDelete)
                throw new IOException("injected snapshot cleanup failure");
            return call.callRealMethod();
        });
    }

    private void assertSuppressedCleanup(Throwable failure) {
        assertThat(failure.getSuppressed()).singleElement().satisfies(suppressed ->
                assertThat(suppressed).isInstanceOf(IOException.class).hasMessage("injected snapshot cleanup failure"));
    }

    private void assertCleanupFailure() throws Exception {
        assertThat(snapshots).hasSize(1).allSatisfy(path -> assertThat(path).exists());
        assertThat(logs.list).anySatisfy(event -> {
            assertThat(event.getLevel()).isEqualTo(ch.qos.logback.classic.Level.ERROR);
            assertThat(event.getFormattedMessage()).contains(snapshots.getFirst().toString());
            assertThat(event.getThrowableProxy()).isNotNull();
        });
        Files.delete(snapshots.getFirst()); // only the test's deliberately retained resource
    }

    private void assertNoUpdate() { verify(jdbc, never()).update(anyString(), any(Object[].class)); verifyNoInteractions(audits); }
    private void assertOriginalUnchanged() throws Exception {
        assertThat(Files.readAllBytes(original)).isEqualTo(originalBytes);
        assertThat(Files.readString(directory.resolve("unrelated"))).isEqualTo("preserve");
    }
    private static String digest(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
}
