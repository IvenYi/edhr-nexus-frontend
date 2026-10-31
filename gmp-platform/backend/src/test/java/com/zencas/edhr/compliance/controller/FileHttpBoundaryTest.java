package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Actual JWT/filter/MVC and response bytes; repositories are controlled, not database integration. */
@WebMvcTest(value = FileController.class, properties = {
        "app.jwt.secret=file-boundary-synthetic-secret-at-least-32-characters",
        "app.jwt.expiration-ms=60000"})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
class FileHttpBoundaryTest {
    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;
    @Autowired FileController controller;
    @MockBean FileObjectRepository files;
    @MockBean IconAssetRepository icons;
    @MockBean SystemSettingRepository settings;
    @MockBean UserAccountRepository users;
    @MockBean SnowflakeIdGenerator ids;
    @TempDir Path directory;
    private FileObject file;

    @BeforeEach void setup() throws Exception {
        Path path = directory.resolve("文件.txt");
        Files.writeString(path, "original bytes");
        file = FileObject.builder().id(77L).originalName("文件.txt").storedPath(path.toString())
                .mimeType("text/plain").fileSize(Files.size(path)).build();
    }

    @Test void anonymousNullTargetPublicPreviewIsBusinessRejectionNotServerFailure() throws Exception {
        when(files.findById(77L)).thenReturn(Optional.of(file));
        mvc.perform(get("/api/v1/files/77/public-preview"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("message").value("文件不允许公开预览"));
        verifyNoInteractions(icons, settings, users);
    }

    @ParameterizedTest @ValueSource(strings = {"ICON_ASSET", "USER_AVATAR", "SYSTEM_LOGO", "SYSTEM_FAVICON"})
    void anonymousPublicPreviewRequiresActualReference(String target) throws Exception {
        file.setTargetType(target);
        when(files.findById(77L)).thenReturn(Optional.of(file));
        mvc.perform(get("/api/v1/files/77/public-preview")).andExpect(status().isBadRequest());
        if (target.equals("ICON_ASSET")) when(icons.existsByFileId(77L)).thenReturn(true);
        else if (target.equals("USER_AVATAR")) when(users.existsByAvatarFileId(77L)).thenReturn(true);
        else when(settings.existsBySystemLogoFileIdOrBrowserIconFileId(77L, 77L)).thenReturn(true);
        mvc.perform(get("/api/v1/files/77/public-preview"))
                .andExpect(status().isOk()).andExpect(content().string("original bytes"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"));
    }

    @ParameterizedTest @ValueSource(strings = {"download", "preview", "page-preview"})
    void privateReadsRequireLoginAndReturnOriginalBytes(String action) throws Exception {
        mvc.perform(get("/api/v1/files/77/" + action)).andExpect(status().isUnauthorized());
        verifyNoInteractions(files);
        when(files.findById(77L)).thenReturn(Optional.of(file));
        mvc.perform(get("/api/v1/files/77/" + action)
                        .header("Authorization", "Bearer " + tokens.generateToken("user-1", "reader")))
                .andExpect(status().isOk()).andExpect(content().string("original bytes"));
        // No claim of object-level authorization: this records only the existing login boundary.
    }

    @Test void anonymousMutationAndListAreRejectedBeforeRepository() throws Exception {
        mvc.perform(delete("/api/v1/files/77")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/files")).andExpect(status().isUnauthorized());
        mvc.perform(multipart("/api/v1/files/upload").file("file", new byte[]{1})).andExpect(status().isUnauthorized());
        verifyNoInteractions(files);
    }

    @ParameterizedTest @ValueSource(strings = {"uploader-A", "uploader-B"})
    void uploadedByUsesAuthenticatedUserIdRatherThanSystemOrSubmittedIdentity(String userId) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(controller, "storagePath", directory.toString());
        when(ids.nextId()).thenReturn(88L);
        mvc.perform(multipart("/api/v1/files/upload")
                        .file(new org.springframework.mock.web.MockMultipartFile("file", "evidence.txt", "text/plain", "original".getBytes(java.nio.charset.StandardCharsets.UTF_8)))
                        .param("uploadedBy", "spoofed-identity")
                        .header("Authorization", "Bearer " + tokens.generateToken(userId, "display-account")))
                .andExpect(status().isOk());
        var saved = org.mockito.ArgumentCaptor.forClass(FileObject.class);
        verify(files).save(saved.capture());
        org.assertj.core.api.Assertions.assertThat(saved.getValue().getUploadedBy()).isEqualTo(userId);
        org.assertj.core.api.Assertions.assertThat(Files.readString(Path.of(saved.getValue().getStoredPath()))).isEqualTo("original");
    }
}
