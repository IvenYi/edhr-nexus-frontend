package com.zencas.edhr.system.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.system.entity.SystemSetting;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SystemSettingsControllerTest {

    @Mock private SystemSettingRepository systemSettingRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private SystemSettingsController controller;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void returnsDefaultPublicSettingsWhenNoRowExists() {
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());

        var response = controller.getPublicSettings();

        assertThat(response.getData().getSystemName()).isEqualTo("eDHR 系统");
        assertThat(response.getData().getBrowserTitle()).isEqualTo("eDHR - 医疗器械电子设备历史记录系统");
        assertThat(response.getData().getSystemLogoFileId()).isNull();
        assertThat(response.getData().getBrowserIconFileId()).isNull();
        assertThat(response.getData().getLogoUrl()).isBlank();
        assertThat(response.getData().getFaviconUrl()).isBlank();
    }

    @Test
    void updatesTextSettingsAndWritesAudit() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        SystemSetting existing = SystemSetting.builder()
                .id(10L)
                .tenantId("default")
                .systemName("旧系统")
                .browserTitle("旧标题")
                .build();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.save(existing)).thenReturn(existing);
        when(idGenerator.nextId()).thenReturn(900L);

        var response = controller.updateSettings(new SystemSettingsController.UpdateSettingsRequest(
                "  新系统  ",
                "  新标题  "));

        assertThat(response.getData().getSystemName()).isEqualTo("新系统");
        assertThat(response.getData().getBrowserTitle()).isEqualTo("新标题");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("SYSTEM_SETTING");
        assertThat(event.getAction()).isEqualTo("UPDATE");
        JsonNode before = objectMapper.readTree(event.getContentBefore());
        JsonNode after = objectMapper.readTree(event.getContentAfter());
        assertThat(before.get("systemName").asText()).isEqualTo("旧系统");
        assertThat(after.get("systemName").asText()).isEqualTo("新系统");
        assertThat(before.get("browserTitle").asText()).isEqualTo("旧标题");
        assertThat(after.get("browserTitle").asText()).isEqualTo("新标题");
    }

    @Test
    void uploadLogoUpdatesSettingsFileReference() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "logo.png",
                "image/png",
                new byte[] {1, 2, 3});
        SystemSetting existing = SystemSetting.builder()
                .id(10L)
                .tenantId("default")
                .systemName("eDHR 系统")
                .browserTitle("eDHR - 医疗器械电子设备历史记录系统")
                .systemLogoFileId(501L)
                .build();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.save(existing)).thenReturn(existing);
        when(idGenerator.nextId()).thenReturn(601L, 901L);

        var response = controller.uploadLogo(file);

        assertThat(response.getData().getSystemLogoFileId()).isEqualTo(601L);
        assertThat(response.getData().getLogoFileId()).isEqualTo(601L);
        assertThat(response.getData().getLogoUrl()).isEqualTo("/api/v1/files/601/preview");
        verify(fileObjectRepository).save(any());
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getAction()).isEqualTo("UPLOAD_LOGO");
        JsonNode before = objectMapper.readTree(event.getContentBefore());
        JsonNode after = objectMapper.readTree(event.getContentAfter());
        assertThat(before.get("systemLogoFileId").asLong()).isEqualTo(501L);
        assertThat(after.get("systemLogoFileId").asLong()).isEqualTo(601L);
    }
}
