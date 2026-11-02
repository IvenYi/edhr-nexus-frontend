package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.channels.FileChannel;
import java.nio.ByteBuffer;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FileCopyOwnershipTest {
    @TempDir Path directory;
    private FileController controller;
    private FileObjectRepository files;
    private final AtomicBoolean closed = new AtomicBoolean();

    @BeforeEach void setup() {
        files = mock(FileObjectRepository.class);
        var ids = mock(SnowflakeIdGenerator.class);
        when(ids.nextId()).thenReturn(77L);
        controller = new FileController(files, mock(IconAssetRepository.class),
                mock(SystemSettingRepository.class), mock(UserAccountRepository.class), ids, FileTestTransactions.manager());
        ReflectionTestUtils.setField(controller, "storagePath", directory.toString());
    }

    @ParameterizedTest @ValueSource(strings = {"read", "close", "open"})
    void failedCopyRemovesOnlyItsOwnedFileAndNeverRegisters(String fault) throws Exception {
        Path unrelated = directory.resolve("unrelated-original");
        Files.writeString(unrelated, "keep original");
        MultipartFile upload = upload(fault);
        assertThatThrownBy(() -> controller.upload(upload, "DOCUMENT_VERSION", null))
                .isInstanceOf(IOException.class).hasMessage(fault);
        assertThat(Files.readString(unrelated)).isEqualTo("keep original");
        assertThat(Files.exists(target())).isFalse();
        if (!fault.equals("open")) assertThat(closed).isTrue();
        verify(files, never()).save(any());
    }

    @Test void existingStoredPathIsNeitherOverwrittenNorCleanedUp() throws Exception {
        Files.writeString(target(), "previous original bytes");
        MultipartFile upload = upload("none");
        assertThatThrownBy(() -> controller.upload(upload, "DOCUMENT_VERSION", null))
                .isInstanceOf(FileAlreadyExistsException.class);
        assertThat(Files.readString(target())).isEqualTo("previous original bytes");
        verify(upload, times(1)).getInputStream(); // digest only; never acquired copy ownership
        verify(files, never()).save(any());
    }

    @Test void failedCleanupPreservesOriginalFailureAndReportsTheCleanupFailure() throws Exception {
        MultipartFile upload = upload("cleanup");
        assertThatThrownBy(() -> controller.upload(upload, "DOCUMENT_VERSION", null))
                .isInstanceOf(IOException.class).hasMessage("cleanup")
                .satisfies(error -> assertThat(error.getSuppressed()).singleElement()
                        .isInstanceOf(DirectoryNotEmptyException.class));
        assertThat(closed).isTrue();
        verify(files, never()).save(any());
    }

    @Test void copyKeepsTheReservedFileObjectRatherThanUnlinkingAndRecreatingIt() throws Exception {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(3L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("paper.pdf");
        AtomicInteger opens = new AtomicInteger();
        AtomicReference<FileChannel> reservedHandle = new AtomicReference<>();
        when(file.getInputStream()).thenAnswer(call -> {
            if (opens.incrementAndGet() == 2) {
                assertThat(Files.exists(target())).as("copy must start with an owned reserved path").isTrue();
                reservedHandle.set(FileChannel.open(target(), StandardOpenOption.READ));
            }
            return new ByteArrayInputStream(new byte[]{7, 8, 9});
        });
        try {
            controller.upload(file, "DOCUMENT_VERSION", null);
            ByteBuffer contents = ByteBuffer.allocate(3);
            assertThat(reservedHandle.get().read(contents)).isEqualTo(3);
            assertThat(contents.array()).containsExactly(7, 8, 9);
        } finally {
            if (reservedHandle.get() != null) reservedHandle.get().close();
        }
    }

    private Path target() { return directory.resolve("77_paper.pdf"); }

    private MultipartFile upload(String fault) throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(6L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("paper.pdf");
        AtomicInteger opens = new AtomicInteger();
        when(file.getInputStream()).thenAnswer(call -> {
            InputStream bytes = new ByteArrayInputStream(new byte[]{1, 2, 3, 4, 5, 6});
            if (opens.incrementAndGet() == 1) return bytes;
            if (fault.equals("open")) throw new IOException(fault);
            return new FilterInputStream(bytes) {
                boolean copiedPrefix;
                @Override public int read(byte[] buffer, int offset, int length) throws IOException {
                    if (fault.equals("read") || fault.equals("cleanup")) {
                        if (!copiedPrefix) { copiedPrefix = true; return super.read(buffer, offset, Math.min(length, 2)); }
                        if (fault.equals("cleanup")) {
                            Files.delete(target()); Files.createDirectory(target());
                            Files.writeString(target().resolve("unremovable-child"), "fault injection");
                        }
                        throw new IOException(fault);
                    }
                    return super.read(buffer, offset, length);
                }
                @Override public void close() throws IOException {
                    closed.set(true); super.close();
                    if (fault.equals("close")) throw new IOException(fault);
                }
            };
        });
        return file;
    }
}
