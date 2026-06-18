package com.zencas.edhr.system.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.system.entity.SystemSetting;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SystemSettingsControllerTest {

    @Mock private SystemSettingRepository systemSettingRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private UserAccountRepository userAccountRepository;
    @Mock private SystemSettingsController.MailSenderFactory mailSenderFactory;
    @Mock private JavaMailSender mailSender;
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
        assertThat(response.getData().getLoginSubtitle()).isEqualTo("电子设备历史记录平台");
        assertThat(response.getData().getLoginDescription()).isEqualTo("面向医疗器械生产的 GMP 合规数字化解决方案，确保每一批次全程可追溯、可审计。");
        assertThat(response.getData().getLoginComplianceItems()).isEqualTo("21 CFR Part 11|合规标准\nISO 13485|质量体系\nGAMP 5|验证框架");
        assertThat(response.getData().getForcePasswordChangeOnFirstLogin()).isTrue();
        assertThat(response.getData().getPasswordChangeCycleEnabled()).isFalse();
        assertThat(response.getData().getPasswordChangeCycleDays()).isEqualTo(90);
        assertThat(response.getData().getPasswordComplexity()).isEqualTo("MEDIUM");
        assertThat(response.getData().getPasswordFailureLockThreshold()).isEqualTo(5);
        assertThat(response.getData().getPasswordFailureLockMinutes()).isEqualTo(30);
        assertThat(response.getData().getIdleLogoutMinutes()).isEqualTo(30);
        assertThat(response.getData().getTokenValidityMinutes()).isEqualTo(480);
        assertThat(response.getData().getForceSignatureOnFirstLogin()).isFalse();
        assertThat(response.getData().getSignatureChangeCycleEnabled()).isTrue();
        assertThat(response.getData().getSignatureChangeCycleDays()).isEqualTo(30);
        assertThat(response.getData().getEmailEnabled()).isTrue();
        assertThat(response.getData().getSmtpPort()).isEqualTo(25);
        assertThat(response.getData().getSmtpSslEnabled()).isFalse();
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
                "  新标题  ",
                48,
                40,
                "  新平台  ",
                "  新说明  ",
                "A|甲\nB|乙\nC|丙",
                true,
                true,
                60,
                "HIGH",
                4,
                45,
                20,
                240,
                true,
                false,
                30,
                true,
                "smtp.example.com",
                465,
                true,
                "mail@example.com",
                "secret",
                "eDHR 通知"));

        assertThat(response.getData().getSystemName()).isEqualTo("新系统");
        assertThat(response.getData().getBrowserTitle()).isEqualTo("新标题");
        assertThat(response.getData().getLogoWidth()).isEqualTo(48);
        assertThat(response.getData().getLogoHeight()).isEqualTo(40);
        assertThat(response.getData().getLoginSubtitle()).isEqualTo("新平台");
        assertThat(response.getData().getLoginDescription()).isEqualTo("新说明");
        assertThat(response.getData().getLoginComplianceItems()).isEqualTo("A|甲\nB|乙\nC|丙");
        assertThat(response.getData().getForcePasswordChangeOnFirstLogin()).isTrue();
        assertThat(response.getData().getPasswordChangeCycleEnabled()).isTrue();
        assertThat(response.getData().getPasswordChangeCycleDays()).isEqualTo(60);
        assertThat(response.getData().getPasswordComplexity()).isEqualTo("HIGH");
        assertThat(response.getData().getPasswordFailureLockThreshold()).isEqualTo(4);
        assertThat(response.getData().getPasswordFailureLockMinutes()).isEqualTo(45);
        assertThat(response.getData().getIdleLogoutMinutes()).isEqualTo(20);
        assertThat(response.getData().getTokenValidityMinutes()).isEqualTo(240);
        assertThat(response.getData().getForceSignatureOnFirstLogin()).isTrue();
        assertThat(response.getData().getSignatureChangeCycleEnabled()).isTrue();
        assertThat(response.getData().getSignatureChangeCycleDays()).isEqualTo(30);
        assertThat(response.getData().getEmailEnabled()).isTrue();
        assertThat(response.getData().getSmtpHost()).isEqualTo("smtp.example.com");
        assertThat(response.getData().getSmtpPort()).isEqualTo(465);
        assertThat(response.getData().getSmtpSslEnabled()).isTrue();
        assertThat(response.getData().getSmtpUsername()).isEqualTo("mail@example.com");
        assertThat(response.getData().getSmtpPasswordConfigured()).isTrue();
        assertThat(response.getData().getMailFromName()).isEqualTo("eDHR 通知");
        assertThat(existing.getSmtpPassword()).isEqualTo("secret");
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
        assertThat(after.get("logoWidth").asInt()).isEqualTo(48);
        assertThat(after.get("logoHeight").asInt()).isEqualTo(40);
        assertThat(after.get("loginSubtitle").asText()).isEqualTo("新平台");
        assertThat(after.get("loginDescription").asText()).isEqualTo("新说明");
        assertThat(after.get("loginComplianceItems").asText()).isEqualTo("A|甲\nB|乙\nC|丙");
        assertThat(after.get("passwordComplexity").asText()).isEqualTo("HIGH");
        assertThat(after.get("passwordFailureLockThreshold").asInt()).isEqualTo(4);
        assertThat(after.get("tokenValidityMinutes").asInt()).isEqualTo(240);
        assertThat(after.get("signatureChangeCycleEnabled").asBoolean()).isTrue();
        assertThat(after.get("signatureChangeCycleDays").asInt()).isEqualTo(30);
        assertThat(after.get("smtpPasswordConfigured").asBoolean()).isTrue();
        assertThat(after.has("smtpPassword")).isFalse();
        assertThat(after.has("imapPasswordConfigured")).isFalse();
        assertThat(after.has("imapPassword")).isFalse();
        assertThat(objectMapper.valueToTree(response.getData()).has("imapEnabled")).isFalse();
    }

    @Test
    void updateSettingsKeepsExistingSmtpPasswordWhenPasswordInputIsBlank() {
        SystemSetting existing = SystemSetting.builder()
                .id(10L)
                .tenantId("default")
                .systemName("旧系统")
                .browserTitle("旧标题")
                .smtpPassword("old-smtp")
                .build();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.save(existing)).thenReturn(existing);

        var response = controller.updateSettings(new SystemSettingsController.UpdateSettingsRequest(
                "新系统",
                "新标题",
                32,
                32,
                "电子设备历史记录平台",
                "说明",
                "21 CFR Part 11|合规标准",
                true,
                false,
                90,
                "MEDIUM",
                5,
                30,
                30,
                480,
                false,
                false,
                30,
                true,
                "smtp.example.com",
                25,
                false,
                "mail@example.com",
                "   ",
                "eDHR"));

        assertThat(existing.getSmtpPassword()).isEqualTo("old-smtp");
        assertThat(response.getData().getSmtpPasswordConfigured()).isTrue();
    }

    @Test
    void returnsOnlyUsersWithEmailAsTestMailRecipients() {
        when(userAccountRepository.findByEmailIsNotNull()).thenReturn(List.of(
                UserAccount.builder().id(1L).username("mail-user").displayName("有邮箱").email("user@example.com").build(),
                UserAccount.builder().id(2L).username("empty-user").displayName("无邮箱").email(" ").build()));

        var response = controller.getMailTestRecipients();

        assertThat(response.getData()).hasSize(1);
        assertThat(response.getData().getFirst().id()).isEqualTo("1");
        assertThat(response.getData().getFirst().username()).isEqualTo("mail-user");
        assertThat(response.getData().getFirst().email()).isEqualTo("user@example.com");
    }

    @Test
    void sendTestMailRejectsUserWithoutEmail() {
        when(userAccountRepository.findById(2L)).thenReturn(Optional.of(
                UserAccount.builder().id(2L).username("empty-user").displayName("无邮箱").email("").build()));

        assertThatThrownBy(() -> controller.sendTestMail(new SystemSettingsController.TestMailRequest(2L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只能选择配置了邮箱的用户发送测试邮件");
    }

    @Test
    void sendTestMailRequiresEnabledSmtpConfiguration() {
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(
                UserAccount.builder().id(1L).username("mail-user").displayName("有邮箱").email("user@example.com").build()));
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(SystemSetting.builder()
                .emailEnabled(false)
                .smtpHost("smtp.example.com")
                .smtpPort(25)
                .smtpUsername("mail@example.com")
                .smtpPassword("secret")
                .build()));

        assertThatThrownBy(() -> controller.sendTestMail(new SystemSettingsController.TestMailRequest(1L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("请先启用并完整配置 SMTP 邮箱服务");
    }

    @Test
    void sendTestMailUsesSmtpConfigurationAndSelectedUserEmail() {
        UserAccount recipient = UserAccount.builder()
                .id(1L)
                .username("mail-user")
                .displayName("有邮箱")
                .email("user@example.com")
                .build();
        SystemSetting setting = SystemSetting.builder()
                .emailEnabled(true)
                .smtpHost("smtp.example.com")
                .smtpPort(587)
                .smtpSslEnabled(true)
                .smtpUsername("mail@example.com")
                .smtpPassword("secret")
                .mailFromName("eDHR 通知")
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(recipient));
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(setting));
        when(mailSenderFactory.create(setting)).thenReturn(mailSender);
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));

        var response = controller.sendTestMail(new SystemSettingsController.TestMailRequest(1L));

        assertThat(response.getData().recipientEmail()).isEqualTo("user@example.com");
        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void rejectsLogoSizeGreaterThanSixtyPixels() {
        SystemSetting existing = SystemSetting.builder()
                .id(10L)
                .tenantId("default")
                .systemName("旧系统")
                .browserTitle("旧标题")
                .logoWidth(32)
                .logoHeight(32)
                .build();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> controller.updateSettings(new SystemSettingsController.UpdateSettingsRequest(
                "新系统",
                "新标题",
                61,
                32,
                "电子设备历史记录平台",
                "说明",
                "21 CFR Part 11|合规标准",
                true,
                false,
                90,
                "MEDIUM",
                5,
                30,
                30,
                480,
                false,
                false,
                365,
                false,
                "",
                25,
                false,
                "",
                "",
                "")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Logo 长度不能超过 60px");
    }

    @Test
    void rejectsInvalidSecurityPolicyRanges() {
        SystemSetting existing = SystemSetting.builder()
                .id(10L)
                .tenantId("default")
                .systemName("旧系统")
                .browserTitle("旧标题")
                .logoWidth(32)
                .logoHeight(32)
                .build();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> controller.updateSettings(new SystemSettingsController.UpdateSettingsRequest(
                "新系统",
                "新标题",
                32,
                32,
                "电子设备历史记录平台",
                "说明",
                "21 CFR Part 11|合规标准",
                true,
                true,
                0,
                "HIGH",
                0,
                30,
                30,
                480,
                false,
                true,
                365,
                false,
                "",
                25,
                false,
                "",
                "",
                "")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("密码修改周期不能小于 1 天");
    }

    @Test
    void rejectsSignatureChangeCycleGreaterThanThirtyDays() {
        SystemSetting existing = SystemSetting.builder()
                .id(10L)
                .tenantId("default")
                .systemName("旧系统")
                .browserTitle("旧标题")
                .logoWidth(32)
                .logoHeight(32)
                .build();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> controller.updateSettings(new SystemSettingsController.UpdateSettingsRequest(
                "新系统",
                "新标题",
                32,
                32,
                "电子设备历史记录平台",
                "说明",
                "21 CFR Part 11|合规标准",
                true,
                false,
                90,
                "MEDIUM",
                5,
                30,
                30,
                480,
                false,
                true,
                31,
                false,
                "",
                25,
                false,
                "",
                "",
                "")))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("签名密码修改周期不能超过 30 天");
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
        assertThat(response.getData().getLogoUrl()).isEqualTo("/api/v1/files/601/public-preview");
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

    @Test
    void uploadLogoAuditSnapshotIncludesReadableFilePreview() throws Exception {
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
                .build();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(existing));
        when(systemSettingRepository.save(existing)).thenReturn(existing);
        when(idGenerator.nextId()).thenReturn(601L, 901L);
        when(fileObjectRepository.findById(601L)).thenReturn(Optional.of(FileObject.builder()
                .id(601L)
                .originalName("logo.png")
                .mimeType("image/png")
                .fileSize(3L)
                .build()));

        controller.uploadLogo(file);

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        JsonNode after = objectMapper.readTree(auditCaptor.getValue().getContentAfter());
        assertThat(after.get("systemLogo").get("fileId").asLong()).isEqualTo(601L);
        assertThat(after.get("systemLogo").get("previewUrl").asText()).isEqualTo("/api/v1/files/601/public-preview");
        assertThat(after.get("systemLogo").get("originalName").asText()).isEqualTo("logo.png");
        assertThat(after.get("systemLogo").get("mimeType").asText()).isEqualTo("image/png");
    }

    @Test
    void uploadLogoCreatesSettingsWithDefaultLogoSizeWhenNoRowExists() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "logo.png",
                "image/png",
                new byte[] {1, 2, 3});
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());
        when(idGenerator.nextId()).thenReturn(10L, 601L, 901L);
        when(systemSettingRepository.save(any(SystemSetting.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.uploadLogo(file);

        assertThat(response.getData().getLogoWidth()).isEqualTo(32);
        assertThat(response.getData().getLogoHeight()).isEqualTo(32);
        ArgumentCaptor<SystemSetting> settingCaptor = ArgumentCaptor.forClass(SystemSetting.class);
        verify(systemSettingRepository).save(settingCaptor.capture());
        assertThat(settingCaptor.getValue().getLogoWidth()).isEqualTo(32);
        assertThat(settingCaptor.getValue().getLogoHeight()).isEqualTo(32);
    }
}
