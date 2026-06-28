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
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FileControllerTest {

    private FileObjectRepository fileObjectRepository;
    private IconAssetRepository iconAssetRepository;
    private SystemSettingRepository systemSettingRepository;
    private UserAccountRepository userAccountRepository;
    private FileController controller;
    private Path tempDir;

    @BeforeEach
    void setUp() throws Exception {
        fileObjectRepository = mock(FileObjectRepository.class);
        iconAssetRepository = mock(IconAssetRepository.class);
        systemSettingRepository = mock(SystemSettingRepository.class);
        userAccountRepository = mock(UserAccountRepository.class);
        controller = new FileController(fileObjectRepository, iconAssetRepository, systemSettingRepository, userAccountRepository, mock(SnowflakeIdGenerator.class));
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

    @Test
    void publicPreviewRejectsFormTemplateBackgroundFiles() throws Exception {
        Path file = tempDir.resolve("form-template-background.png");
        Files.write(file, new byte[] {1, 2, 3});
        when(fileObjectRepository.findById(302L)).thenReturn(Optional.of(fileObject(302L, file, "image/png", "FORM_TEMPLATE_BACKGROUND")));

        assertThatThrownBy(() -> controller.publicPreview(302L))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getErrorCode()).isEqualTo(ErrorCode.GENERAL_003))
                .hasMessageContaining("文件不允许公开预览");
    }

    @Test
    void publicPreviewAllowsUserAvatarFilesReferencedByUserAccount() throws Exception {
        Path file = tempDir.resolve("avatar.png");
        Files.write(file, new byte[] {1, 2, 3});
        when(fileObjectRepository.findById(404L)).thenReturn(Optional.of(fileObject(404L, file, "image/png", "USER_AVATAR")));
        when(userAccountRepository.existsByAvatarFileId(404L)).thenReturn(true);

        var response = controller.publicPreview(404L);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("image/png");
    }

    @Test
    void publicPreviewRejectsUserAvatarFileWhenNoUserReferencesIt() throws Exception {
        Path file = tempDir.resolve("spoofed-avatar.png");
        Files.write(file, new byte[] {1, 2, 3});
        when(fileObjectRepository.findById(405L)).thenReturn(Optional.of(fileObject(405L, file, "image/png", "USER_AVATAR")));
        when(userAccountRepository.existsByAvatarFileId(405L)).thenReturn(false);

        assertThatThrownBy(() -> controller.publicPreview(405L))
                .isInstanceOf(BusinessException.class)
                .satisfies(error -> assertThat(((BusinessException) error).getErrorCode()).isEqualTo(ErrorCode.GENERAL_003))
                .hasMessageContaining("文件不允许公开预览");
    }

    @Test
    void uploadReturnsStringFileIdToAvoidFrontendLargeNumberPrecisionLoss() throws Exception {
        SnowflakeIdGenerator uploadIdGenerator = mock(SnowflakeIdGenerator.class);
        when(uploadIdGenerator.nextId()).thenReturn(341657966238777344L);
        controller = new FileController(
                fileObjectRepository,
                iconAssetRepository,
                systemSettingRepository,
                userAccountRepository,
                uploadIdGenerator);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("file", "id-card-front.png", "image/png", new byte[] {1, 2, 3});

        var response = controller.upload(file, "SIGNATURE_EVIDENCE", "1");

        assertThat(response.getData()).isInstanceOf(Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) response.getData();
        assertThat(data.get("fileId")).isEqualTo("341657966238777344");
        assertThat(data.get("id")).isEqualTo("341657966238777344");
        assertThat(data.get("targetType")).isEqualTo("SIGNATURE_EVIDENCE");
    }

    @Test
    void uploadAllowsMissingTargetIdForSignatureEvidenceUploads() throws Exception {
        SnowflakeIdGenerator uploadIdGenerator = mock(SnowflakeIdGenerator.class);
        when(uploadIdGenerator.nextId()).thenReturn(341657966238777345L);
        controller = new FileController(
                fileObjectRepository,
                iconAssetRepository,
                systemSettingRepository,
                userAccountRepository,
                uploadIdGenerator);
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "storagePath", tempDir.toString());
        MockMultipartFile file = new MockMultipartFile("file", "id-card-back.png", "image/png", new byte[] {1, 2, 3});

        var response = controller.upload(file, "SIGNATURE_EVIDENCE", null);

        assertThat(response.getData()).isInstanceOf(Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) response.getData();
        assertThat(data.get("fileId")).isEqualTo("341657966238777345");
        assertThat(data.get("targetType")).isEqualTo("SIGNATURE_EVIDENCE");
        assertThat(data).containsKey("targetId");
        assertThat(data.get("targetId")).isNull();
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
