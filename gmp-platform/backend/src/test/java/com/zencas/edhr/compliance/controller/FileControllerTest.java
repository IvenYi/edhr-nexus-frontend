package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FileControllerTest {

    private FileObjectRepository fileObjectRepository;
    private IconAssetRepository iconAssetRepository;
    private SystemSettingRepository systemSettingRepository;
    private FileController controller;
    private Path tempDir;

    @BeforeEach
    void setUp() throws Exception {
        fileObjectRepository = mock(FileObjectRepository.class);
        iconAssetRepository = mock(IconAssetRepository.class);
        systemSettingRepository = mock(SystemSettingRepository.class);
        controller = new FileController(fileObjectRepository, iconAssetRepository, systemSettingRepository, mock(SnowflakeIdGenerator.class));
        tempDir = Files.createTempDirectory("edhr-file-preview-test");
    }

    @Test
    void publicPreviewAllowsIconAssetFiles() throws Exception {
        Path file = tempDir.resolve("icon.svg");
        Files.writeString(file, "<svg></svg>");
        when(fileObjectRepository.findById(101L)).thenReturn(Optional.of(fileObject(101L, file, "image/svg+xml", "ICON_ASSET")));
        when(iconAssetRepository.existsByFileId(101L)).thenReturn(true);

        var response = controller.publicPreview(101L);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("image/svg+xml");
        assertThat(response.getHeaders().getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(response.getHeaders().getFirst("Content-Security-Policy")).contains("script-src 'none'");
        assertThat(response.getHeaders().getFirst("Content-Disposition")).contains("inline");
    }

    @Test
    void publicPreviewRejectsSpoofedIconAssetTargetTypeWhenNoIconReferencesFile() throws Exception {
        Path file = tempDir.resolve("spoofed.svg");
        Files.writeString(file, "<svg></svg>");
        when(fileObjectRepository.findById(303L)).thenReturn(Optional.of(fileObject(303L, file, "image/svg+xml", "ICON_ASSET")));
        when(iconAssetRepository.existsByFileId(303L)).thenReturn(false);

        assertThatThrownBy(() -> controller.publicPreview(303L))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getErrorCode()).isEqualTo(ErrorCode.GENERAL_003))
                .hasMessageContaining("文件不允许公开预览");
    }

    @Test
    void publicPreviewRejectsNonPublicFileTargets() throws Exception {
        Path file = tempDir.resolve("document.pdf");
        Files.writeString(file, "pdf");
        when(fileObjectRepository.findById(202L)).thenReturn(Optional.of(fileObject(202L, file, "application/pdf", "DHR_ATTACHMENT")));

        assertThatThrownBy(() -> controller.publicPreview(202L))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getErrorCode()).isEqualTo(ErrorCode.GENERAL_003))
                .hasMessageContaining("文件不允许公开预览");
    }

    private FileObject fileObject(Long id, Path file, String mimeType, String targetType) {
        return FileObject.builder()
                .id(id)
                .originalName(file.getFileName().toString())
                .storedPath(file.toString())
                .mimeType(mimeType)
                .fileSize(1L)
                .targetType(targetType)
                .build();
    }
}
