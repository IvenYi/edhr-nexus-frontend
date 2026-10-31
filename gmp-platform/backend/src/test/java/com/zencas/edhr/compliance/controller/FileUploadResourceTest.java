package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FileUploadResourceTest {
    @TempDir Path directory;
    private FileObjectRepository files;
    private FileController controller;
    private final List<ObservedStream> opened = new ArrayList<>();

    @BeforeEach void setup() {
        files = mock(FileObjectRepository.class);
        var ids = mock(SnowflakeIdGenerator.class);
        when(ids.nextId()).thenReturn(77L);
        controller = new FileController(files, mock(IconAssetRepository.class),
                mock(SystemSettingRepository.class), mock(UserAccountRepository.class), ids, FileTestTransactions.manager());
        ReflectionTestUtils.setField(controller, "storagePath", directory.toString());
    }

    @Test void successfulUploadClosesBothStreamsAndPreservesDigestAndBytes() throws Exception {
        controller.upload(upload("none"), "DOCUMENT_VERSION", null);
        assertThat(opened).hasSize(2).allSatisfy(stream -> assertThat(stream.closed).isTrue());
        var captured = org.mockito.ArgumentCaptor.forClass(FileObject.class);
        verify(files).save(captured.capture());
        assertThat(captured.getValue().getMd5Hash()).isEqualTo("5289df737df57326fcdd22597afb1fac");
        assertThat(captured.getValue().getFileSize()).isEqualTo(3L);
        assertThat(Files.readAllBytes(Path.of(captured.getValue().getStoredPath()))).containsExactly(1, 2, 3);
    }

    @ParameterizedTest @ValueSource(strings = {"read1", "close1", "read2", "close2"})
    void streamFailuresPropagateCloseOwnedResourcesAndNeverRegisterSuccess(String fault) throws Exception {
        MultipartFile file = upload(fault);
        assertThatThrownBy(() -> controller.upload(file, "DOCUMENT_VERSION", null))
                .isInstanceOf(IOException.class).hasMessageContaining(fault);
        assertThat(opened).hasSize(fault.endsWith("1") ? 1 : 2)
                .allSatisfy(stream -> assertThat(stream.closed).isTrue());
        verify(files, never()).save(any());
        if (fault.endsWith("1")) {
            try (var paths = Files.list(directory)) { assertThat(paths).isEmpty(); }
        }
        // A copy failure may leave partial bytes; cross-storage compensation is a separate review.
    }

    @ParameterizedTest @NullAndEmptySource @ValueSource(strings = {"DOCUMENT_VERSION", "UNKNOWN"})
    void targetsOutsidePublicWhitelistAreRejectedWithoutReadingDisk(String target) {
        when(files.findById(77L)).thenReturn(Optional.of(FileObject.builder()
                .id(77L).targetType(target).storedPath(directory.resolve("absent").toString()).build()));
        assertThatThrownBy(() -> controller.publicPreview(77L))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getErrorCode()).isEqualTo(ErrorCode.GENERAL_003));
    }

    private MultipartFile upload(String fault) throws IOException {
        MultipartFile file = mock(MultipartFile.class);
        when(file.getSize()).thenReturn(3L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("sample.pdf");
        when(file.getInputStream()).thenAnswer(call -> {
            var stream = new ObservedStream(new ByteArrayInputStream(new byte[]{1, 2, 3}), fault, opened.size() + 1);
            opened.add(stream);
            return stream;
        });
        return file;
    }

    private static class ObservedStream extends FilterInputStream {
        private final String fault;
        private final int number;
        private boolean closed;
        ObservedStream(InputStream input, String fault, int number) {
            super(input); this.fault = fault; this.number = number;
        }
        @Override public int read(byte[] bytes, int offset, int length) throws IOException {
            if (fault.equals("read" + number)) throw new IOException(fault);
            return super.read(bytes, offset, length);
        }
        @Override public void close() throws IOException {
            closed = true;
            super.close();
            if (fault.equals("close" + number)) throw new IOException(fault);
        }
    }
}
