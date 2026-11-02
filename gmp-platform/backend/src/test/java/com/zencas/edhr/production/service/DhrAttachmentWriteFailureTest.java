package com.zencas.edhr.production.service;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.MockedStatic;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.UnaryOperator;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

/** Real file bytes with explicitly injected stream faults; not a native disk-full or transaction test. */
class DhrAttachmentWriteFailureTest {
    @TempDir Path directory;
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final AuditEventRepository audits = mock(AuditEventRepository.class);
    private DhrAttachmentService service;
    private MockMultipartFile file;
    private Path stored;
    private ListAppender<ILoggingEvent> logs;
    private final Logger logger = (Logger) LoggerFactory.getLogger(DhrAttachmentService.class);

    @BeforeEach void setup() throws Exception {
        var ids = mock(SnowflakeIdGenerator.class); when(ids.nextId()).thenReturn(77L);
        when(jdbc.queryForList(anyString(), eq(1L))).thenReturn(List.of(Map.of("status", "COMPLETED", "summary_status", "DRAFT")));
        service = new DhrAttachmentService(jdbc, new ObjectMapper(), ids, audits);
        ReflectionTestUtils.setField(service, "storagePath", directory.toString());
        Files.createDirectory(directory.resolve("dhr")); stored = directory.resolve("dhr/77.png");
        Files.writeString(directory.resolve("unrelated"), "preserve");
        try (var bytes = new ByteArrayOutputStream()) {
            assertThat(ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes)).isTrue();
            file = new MockMultipartFile("file", "original.png", "image/png", bytes.toByteArray());
        }
        logs = new ListAppender<>(); logs.start(); logger.addAppender(logs);
    }
    @AfterEach void clear() { logger.detachAppender(logs); logs.stop(); }

    @Test void partialWriteFailureRemovesOnlyCurrentUnregisteredFragment() throws Exception {
        var partialBytes = new AtomicLong();
        try (var files = withFault(actual -> {
                return new FilterOutputStream(actual) {
                    @Override public void write(byte[] bytes, int offset, int length) throws IOException {
                        out.write(bytes, offset, 16); partialBytes.set(Files.size(stored));
                        throw new IOException("injected partial write");
                    }
                };
            })) {
            assertThatThrownBy(this::upload).isInstanceOf(IOException.class).hasMessage("injected partial write");
        }
        assertThat(partialBytes.get()).isEqualTo(16); assertThat(stored).doesNotExist(); assertNoRegistration();
    }

    @Test void closeFailureAlsoRemovesCurrentUnregisteredFile() throws Exception {
        var writtenBytes = new AtomicLong();
        try (var files = withFault(actual -> {
                return new FilterOutputStream(actual) {
                    @Override public void close() throws IOException {
                        super.close(); writtenBytes.set(Files.size(stored)); throw new IOException("injected close failure");
                    }
                };
            })) {
            assertThatThrownBy(this::upload).isInstanceOf(IOException.class).hasMessage("injected close failure");
        }
        assertThat(writtenBytes.get()).isEqualTo(file.getSize()); assertThat(stored).doesNotExist(); assertNoRegistration();
    }

    @Test void failedCleanupKeepsOriginalWriteErrorAndLocatesFragment() throws Exception {
        try (var files = withFault(actual -> {
                return new FilterOutputStream(actual) {
                    @Override public void write(byte[] bytes, int offset, int length) throws IOException {
                        out.write(bytes, offset, 16); out.close();
                        Files.delete(stored); Files.createDirectory(stored); Files.writeString(stored.resolve("child"), "retained");
                        throw new IOException("original write failure");
                    }
                };
            })) {
            assertThatThrownBy(this::upload).isInstanceOf(IOException.class).hasMessage("original write failure")
                    .satisfies(failure -> assertThat(failure.getSuppressed()).anySatisfy(suppressed ->
                            assertThat(suppressed).isInstanceOf(DirectoryNotEmptyException.class)));
        }
        assertThat(Files.readString(stored.resolve("child"))).isEqualTo("retained");
        assertThat(logs.list).anySatisfy(event -> {
            assertThat(event.getLevel()).isEqualTo(ch.qos.logback.classic.Level.ERROR);
            assertThat(event.getFormattedMessage()).contains("77", stored.toString());
            assertThat(event.getThrowableProxy()).isNotNull();
        });
        assertNoRegistration();
    }

    @ParameterizedTest @ValueSource(booleans = {false, true})
    void createCollisionNeverDeletesPreexistingFileOrDirectory(boolean isDirectory) throws Exception {
        Path original = stored;
        if (isDirectory) { Files.createDirectory(stored); original = stored.resolve("existing-child"); }
        Files.writeString(original, "preexisting original");
        assertThatThrownBy(this::upload).isInstanceOf(FileAlreadyExistsException.class);
        assertThat(Files.readString(original)).isEqualTo("preexisting original"); assertNoRegistration();
    }

    private void upload() throws Exception { service.upload(1L, file, "OTHER", "write fault", null, null); }
    private MockedStatic<Files> withFault(UnaryOperator<OutputStream> fault) {
        return mockStatic(Files.class, call -> {
            if (call.getMethod().getName().equals("newOutputStream") && stored.equals(call.getArgument(0)))
                return fault.apply((OutputStream) call.callRealMethod());
            return call.callRealMethod();
        });
    }
    private void assertNoRegistration() throws Exception {
        verify(jdbc, never()).update(anyString(), any(Object[].class)); verifyNoInteractions(audits);
        assertThat(Files.readString(directory.resolve("unrelated"))).isEqualTo("preserve");
    }
}
