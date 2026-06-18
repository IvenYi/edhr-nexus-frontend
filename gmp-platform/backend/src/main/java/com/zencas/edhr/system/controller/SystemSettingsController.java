package com.zencas.edhr.system.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.system.entity.SystemSetting;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;

@RestController
@RequestMapping("/api/v1/system/settings")
@RequiredArgsConstructor
public class SystemSettingsController {

    private static final String TENANT_ID = "default";
    private static final String DEFAULT_SYSTEM_NAME = "eDHR 系统";
    private static final String DEFAULT_BROWSER_TITLE = "eDHR - 医疗器械电子设备历史记录系统";
    private static final String DEFAULT_LOGIN_SUBTITLE = "电子设备历史记录平台";
    private static final String DEFAULT_LOGIN_DESCRIPTION = "面向医疗器械生产的 GMP 合规数字化解决方案，确保每一批次全程可追溯、可审计。";
    private static final String DEFAULT_LOGIN_COMPLIANCE_ITEMS = "21 CFR Part 11|合规标准\nISO 13485|质量体系\nGAMP 5|验证框架";
    private static final int DEFAULT_LOGO_SIZE = 32;
    private static final int LOGO_SIZE_MAX = 60;
    private static final int DEFAULT_PASSWORD_CHANGE_CYCLE_DAYS = 90;
    private static final String DEFAULT_PASSWORD_COMPLEXITY = "MEDIUM";
    private static final int DEFAULT_PASSWORD_FAILURE_LOCK_THRESHOLD = 5;
    private static final int DEFAULT_PASSWORD_FAILURE_LOCK_MINUTES = 30;
    private static final int DEFAULT_IDLE_LOGOUT_MINUTES = 30;
    private static final int DEFAULT_TOKEN_VALIDITY_MINUTES = 480;
    private static final int DEFAULT_SIGNATURE_CHANGE_CYCLE_DAYS = 30;
    private static final int SIGNATURE_CHANGE_CYCLE_DAYS_MAX = 30;
    private static final int DEFAULT_SMTP_PORT = 25;
    private static final List<String> PASSWORD_COMPLEXITY_LEVELS = List.of("LOW", "MEDIUM", "HIGH");
    private static final long BRAND_MAX_FILE_SIZE = 2L * 1024 * 1024;
    private static final List<String> LOGO_MIME_TYPES = List.of("image/svg+xml", "image/png", "image/jpeg", "image/webp");
    private static final List<String> FAVICON_MIME_TYPES = List.of("image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml");
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper();

    private final SystemSettingRepository systemSettingRepository;
    private final FileObjectRepository fileObjectRepository;
    private final AuditEventRepository auditEventRepository;
    private final UserAccountRepository userAccountRepository;
    private final MailSenderFactory mailSenderFactory;
    private final SnowflakeIdGenerator idGenerator;

    @Value("${edhr.file.storage-path:#{systemProperties['user.home'] + '/.edhr/files'}}")
    private String storagePath;

    @GetMapping("/public")
    public ApiResponse<SystemSettingResponse> getPublicSettings() {
        return ApiResponse.success(toResponse(findOrDefault()));
    }

    @GetMapping
    public ApiResponse<SystemSettingResponse> getSettings() {
        return ApiResponse.success(toResponse(findOrDefault()));
    }

    @PutMapping
    @Transactional
    public ApiResponse<SystemSettingResponse> updateSettings(@RequestBody UpdateSettingsRequest request) {
        SystemSetting setting = findOrCreate();
        Map<String, Object> before = settingSnapshot(setting);
        setting.setSystemName(requireText(request == null ? null : request.systemName(), "系统名称不能为空"));
        setting.setBrowserTitle(requireText(request == null ? null : request.browserTitle(), "浏览器标题不能为空"));
        setting.setLogoWidth(normalizeLogoSize(request == null ? null : request.logoWidth(), "Logo 长度"));
        setting.setLogoHeight(normalizeLogoSize(request == null ? null : request.logoHeight(), "Logo 高度"));
        setting.setLoginSubtitle(normalizeOptionalText(request == null ? null : request.loginSubtitle(), DEFAULT_LOGIN_SUBTITLE));
        setting.setLoginDescription(normalizeOptionalText(request == null ? null : request.loginDescription(), DEFAULT_LOGIN_DESCRIPTION));
        setting.setLoginComplianceItems(normalizeOptionalText(request == null ? null : request.loginComplianceItems(), DEFAULT_LOGIN_COMPLIANCE_ITEMS));
        setting.setForcePasswordChangeOnFirstLogin(request == null || request.forcePasswordChangeOnFirstLogin() == null ? true : request.forcePasswordChangeOnFirstLogin());
        setting.setPasswordChangeCycleEnabled(request != null && Boolean.TRUE.equals(request.passwordChangeCycleEnabled()));
        setting.setPasswordChangeCycleDays(normalizePositiveInteger(request == null ? null : request.passwordChangeCycleDays(), DEFAULT_PASSWORD_CHANGE_CYCLE_DAYS, "密码修改周期", "天"));
        setting.setPasswordComplexity(normalizePasswordComplexity(request == null ? null : request.passwordComplexity()));
        setting.setPasswordFailureLockThreshold(normalizePositiveInteger(request == null ? null : request.passwordFailureLockThreshold(), DEFAULT_PASSWORD_FAILURE_LOCK_THRESHOLD, "密码输错锁定次数", "次"));
        setting.setPasswordFailureLockMinutes(normalizePositiveInteger(request == null ? null : request.passwordFailureLockMinutes(), DEFAULT_PASSWORD_FAILURE_LOCK_MINUTES, "账号锁定时间", "分钟"));
        setting.setIdleLogoutMinutes(normalizePositiveInteger(request == null ? null : request.idleLogoutMinutes(), DEFAULT_IDLE_LOGOUT_MINUTES, "无操作自动登出时间", "分钟"));
        setting.setTokenValidityMinutes(normalizePositiveInteger(request == null ? null : request.tokenValidityMinutes(), DEFAULT_TOKEN_VALIDITY_MINUTES, "登录有效期", "分钟"));
        setting.setForceSignatureOnFirstLogin(request != null && Boolean.TRUE.equals(request.forceSignatureOnFirstLogin()));
        setting.setSignatureChangeCycleEnabled(true);
        setting.setSignatureChangeCycleDays(normalizeBoundedInteger(request == null ? null : request.signatureChangeCycleDays(), DEFAULT_SIGNATURE_CHANGE_CYCLE_DAYS, SIGNATURE_CHANGE_CYCLE_DAYS_MAX, "签名密码修改周期", "天"));
        setting.setEmailEnabled(request != null && Boolean.TRUE.equals(request.emailEnabled()));
        setting.setSmtpHost(normalizeNullableText(request == null ? null : request.smtpHost()));
        setting.setSmtpPort(normalizePositiveInteger(request == null ? null : request.smtpPort(), DEFAULT_SMTP_PORT, "SMTP 端口", "端口"));
        setting.setSmtpSslEnabled(request != null && Boolean.TRUE.equals(request.smtpSslEnabled()));
        setting.setSmtpUsername(normalizeNullableText(request == null ? null : request.smtpUsername()));
        setting.setSmtpPassword(resolveSecret(setting.getSmtpPassword(), request == null ? null : request.smtpPassword()));
        setting.setMailFromName(normalizeNullableText(request == null ? null : request.mailFromName()));
        setting.setUpdatedBy(AuditContext.getOperatorId());
        SystemSetting saved = systemSettingRepository.save(setting);
        writeAudit(saved.getId(), "UPDATE", before, settingSnapshot(saved));
        return ApiResponse.success(toResponse(saved));
    }

    @GetMapping("/mail/test-recipients")
    public ApiResponse<List<MailTestRecipientResponse>> getMailTestRecipients() {
        List<MailTestRecipientResponse> recipients = userAccountRepository.findByEmailIsNotNull().stream()
                .filter(user -> StringUtils.hasText(user.getEmail()))
                .sorted(Comparator.comparing(
                        user -> Optional.ofNullable(user.getDisplayName()).orElse(user.getUsername()),
                        Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(user -> new MailTestRecipientResponse(
                        String.valueOf(user.getId()),
                        user.getUsername(),
                        user.getDisplayName(),
                        user.getEmail().trim()))
                .toList();
        return ApiResponse.success(recipients);
    }

    @PostMapping("/mail/test")
    @Transactional
    public ApiResponse<TestMailResponse> sendTestMail(@RequestBody TestMailRequest request) {
        if (request == null || request.userId() == null) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请选择测试收件用户");
        }
        UserAccount recipient = userAccountRepository.findById(request.userId())
                .orElseThrow(() -> new BusinessException(ErrorCode.IDN_002));
        if (!StringUtils.hasText(recipient.getEmail())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "只能选择配置了邮箱的用户发送测试邮件");
        }

        SystemSetting setting = findOrDefault();
        validateSmtpConfiguration(setting);
        sendConfiguredTestMail(setting, recipient);
        writeMailTestAudit(setting.getId(), recipient);
        return ApiResponse.success(new TestMailResponse(
                String.valueOf(recipient.getId()),
                recipient.getUsername(),
                recipient.getEmail().trim(),
                LocalDateTime.now()));
    }

    @PostMapping("/logo")
    @Transactional
    public ApiResponse<SystemSettingResponse> uploadLogo(@RequestParam("file") MultipartFile file) throws IOException {
        SystemSetting setting = findOrCreate();
        Map<String, Object> before = settingSnapshot(setting);
        FileObject fileObject = storeFile(file, "SYSTEM_LOGO", LOGO_MIME_TYPES);
        setting.setSystemLogoFileId(fileObject.getId());
        setting.setUpdatedBy(AuditContext.getOperatorId());
        SystemSetting saved = systemSettingRepository.save(setting);
        writeAudit(saved.getId(), "UPLOAD_LOGO", before, settingSnapshot(saved));
        return ApiResponse.success(toResponse(saved));
    }

    @PostMapping("/favicon")
    @Transactional
    public ApiResponse<SystemSettingResponse> uploadFavicon(@RequestParam("file") MultipartFile file) throws IOException {
        SystemSetting setting = findOrCreate();
        Map<String, Object> before = settingSnapshot(setting);
        FileObject fileObject = storeFile(file, "SYSTEM_FAVICON", FAVICON_MIME_TYPES);
        setting.setBrowserIconFileId(fileObject.getId());
        setting.setUpdatedBy(AuditContext.getOperatorId());
        SystemSetting saved = systemSettingRepository.save(setting);
        writeAudit(saved.getId(), "UPLOAD_FAVICON", before, settingSnapshot(saved));
        return ApiResponse.success(toResponse(saved));
    }

    @DeleteMapping("/logo")
    @Transactional
    public ApiResponse<SystemSettingResponse> deleteLogo() {
        SystemSetting setting = findOrCreate();
        Map<String, Object> before = settingSnapshot(setting);
        Long fileId = setting.getSystemLogoFileId();
        setting.setSystemLogoFileId(null);
        setting.setUpdatedBy(AuditContext.getOperatorId());
        SystemSetting saved = systemSettingRepository.save(setting);
        cleanupFile(fileId);
        writeAudit(saved.getId(), "DELETE_LOGO", before, settingSnapshot(saved));
        return ApiResponse.success(toResponse(saved));
    }

    @DeleteMapping("/favicon")
    @Transactional
    public ApiResponse<SystemSettingResponse> deleteFavicon() {
        SystemSetting setting = findOrCreate();
        Map<String, Object> before = settingSnapshot(setting);
        Long fileId = setting.getBrowserIconFileId();
        setting.setBrowserIconFileId(null);
        setting.setUpdatedBy(AuditContext.getOperatorId());
        SystemSetting saved = systemSettingRepository.save(setting);
        cleanupFile(fileId);
        writeAudit(saved.getId(), "DELETE_FAVICON", before, settingSnapshot(saved));
        return ApiResponse.success(toResponse(saved));
    }

    private SystemSetting findOrDefault() {
        return systemSettingRepository.findByTenantId(TENANT_ID).orElseGet(this::defaultSetting);
    }

    private SystemSetting findOrCreate() {
        return systemSettingRepository.findByTenantId(TENANT_ID).orElseGet(() -> {
            SystemSetting setting = defaultSetting();
            setting.setId(idGenerator.nextId());
            setting.setCreatedBy(AuditContext.getOperatorId());
            return setting;
        });
    }

    private SystemSetting defaultSetting() {
        return SystemSetting.builder()
                .tenantId(TENANT_ID)
                .systemName(DEFAULT_SYSTEM_NAME)
                .browserTitle(DEFAULT_BROWSER_TITLE)
                .loginSubtitle(DEFAULT_LOGIN_SUBTITLE)
                .loginDescription(DEFAULT_LOGIN_DESCRIPTION)
                .loginComplianceItems(DEFAULT_LOGIN_COMPLIANCE_ITEMS)
                .logoWidth(DEFAULT_LOGO_SIZE)
                .logoHeight(DEFAULT_LOGO_SIZE)
                .forcePasswordChangeOnFirstLogin(true)
                .passwordChangeCycleEnabled(false)
                .passwordChangeCycleDays(DEFAULT_PASSWORD_CHANGE_CYCLE_DAYS)
                .passwordComplexity(DEFAULT_PASSWORD_COMPLEXITY)
                .passwordFailureLockThreshold(DEFAULT_PASSWORD_FAILURE_LOCK_THRESHOLD)
                .passwordFailureLockMinutes(DEFAULT_PASSWORD_FAILURE_LOCK_MINUTES)
                .idleLogoutMinutes(DEFAULT_IDLE_LOGOUT_MINUTES)
                .tokenValidityMinutes(DEFAULT_TOKEN_VALIDITY_MINUTES)
                .forceSignatureOnFirstLogin(false)
                .signatureChangeCycleEnabled(true)
                .signatureChangeCycleDays(DEFAULT_SIGNATURE_CHANGE_CYCLE_DAYS)
                .emailEnabled(true)
                .smtpPort(DEFAULT_SMTP_PORT)
                .smtpSslEnabled(false)
                .build();
    }

    private FileObject storeFile(MultipartFile file, String targetType, List<String> allowedTypes) throws IOException {
        if (file == null || file.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "上传文件不能为空");
        if (file.getSize() > BRAND_MAX_FILE_SIZE) throw new BusinessException(ErrorCode.FILE_002, "文件大小超出限制");
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BusinessException(ErrorCode.FILE_003, "不支持的文件类型: " + contentType);
        }
        Long fileId = idGenerator.nextId();
        Path storageDir = resolveStoragePath();
        Files.createDirectories(storageDir);
        Path targetPath = storageDir.resolve(fileId + "_" + sanitizeFileName(file.getOriginalFilename()));
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        FileObject fileObject = FileObject.builder()
                .id(fileId)
                .tenantId(TENANT_ID)
                .originalName(file.getOriginalFilename())
                .storedPath(targetPath.toString())
                .mimeType(contentType)
                .fileSize(file.getSize())
                .md5Hash(computeMd5(file.getInputStream()))
                .targetType(targetType)
                .uploadedBy(AuditContext.getOperatorId())
                .createdAt(LocalDateTime.now())
                .build();
        fileObjectRepository.save(fileObject);
        return fileObject;
    }

    private void cleanupFile(Long fileId) {
        if (fileId == null) return;
        fileObjectRepository.findById(fileId).ifPresent(file -> {
            try {
                if (StringUtils.hasText(file.getStoredPath())) Files.deleteIfExists(Path.of(file.getStoredPath()));
            } catch (IOException ignored) {
            }
            fileObjectRepository.deleteById(fileId);
        });
    }

    private String requireText(String value, String message) {
        if (!StringUtils.hasText(value)) throw new BusinessException(ErrorCode.GENERAL_001, message);
        return value.trim();
    }

    private String normalizeOptionalText(String value, String defaultValue) {
        return StringUtils.hasText(value) ? value.trim() : defaultValue;
    }

    private String normalizeNullableText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String resolveSecret(String currentValue, String nextValue) {
        return StringUtils.hasText(nextValue) ? nextValue.trim() : currentValue;
    }

    private Integer normalizeLogoSize(Integer value, String label) {
        int size = value == null ? DEFAULT_LOGO_SIZE : value;
        if (size < 1) throw new BusinessException(ErrorCode.GENERAL_001, label + "不能小于 1px");
        if (size > LOGO_SIZE_MAX) throw new BusinessException(ErrorCode.GENERAL_001, label + "不能超过 60px");
        return size;
    }

    private Integer normalizePositiveInteger(Integer value, int defaultValue, String label, String unit) {
        int normalized = value == null ? defaultValue : value;
        if (normalized < 1) throw new BusinessException(ErrorCode.GENERAL_001, label + "不能小于 1 " + unit);
        return normalized;
    }

    private Integer normalizeBoundedInteger(Integer value, int defaultValue, int maxValue, String label, String unit) {
        int normalized = normalizePositiveInteger(value, defaultValue, label, unit);
        if (normalized > maxValue) throw new BusinessException(ErrorCode.GENERAL_001, label + "不能超过 " + maxValue + " " + unit);
        return normalized;
    }

    private String normalizePasswordComplexity(String value) {
        String normalized = StringUtils.hasText(value) ? value.trim().toUpperCase() : DEFAULT_PASSWORD_COMPLEXITY;
        if (!PASSWORD_COMPLEXITY_LEVELS.contains(normalized)) {
            throw new BusinessException(ErrorCode.GENERAL_001, "登录密码复杂程度不正确");
        }
        return normalized;
    }

    private SystemSettingResponse toResponse(SystemSetting setting) {
        return SystemSettingResponse.builder()
                .id(setting.getId())
                .systemName(setting.getSystemName())
                .systemLogoFileId(setting.getSystemLogoFileId())
                .logoFileId(setting.getSystemLogoFileId())
                .logoUrl(previewUrl(setting.getSystemLogoFileId()))
                .logoWidth(normalizeLogoSize(setting.getLogoWidth(), "Logo 长度"))
                .logoHeight(normalizeLogoSize(setting.getLogoHeight(), "Logo 高度"))
                .browserTitle(setting.getBrowserTitle())
                .loginSubtitle(normalizeOptionalText(setting.getLoginSubtitle(), DEFAULT_LOGIN_SUBTITLE))
                .loginDescription(normalizeOptionalText(setting.getLoginDescription(), DEFAULT_LOGIN_DESCRIPTION))
                .loginComplianceItems(normalizeOptionalText(setting.getLoginComplianceItems(), DEFAULT_LOGIN_COMPLIANCE_ITEMS))
                .forcePasswordChangeOnFirstLogin(resolveBoolean(setting.getForcePasswordChangeOnFirstLogin(), true))
                .passwordChangeCycleEnabled(resolveBoolean(setting.getPasswordChangeCycleEnabled(), false))
                .passwordChangeCycleDays(resolveInteger(setting.getPasswordChangeCycleDays(), DEFAULT_PASSWORD_CHANGE_CYCLE_DAYS))
                .passwordComplexity(normalizePasswordComplexity(setting.getPasswordComplexity()))
                .passwordFailureLockThreshold(resolveInteger(setting.getPasswordFailureLockThreshold(), DEFAULT_PASSWORD_FAILURE_LOCK_THRESHOLD))
                .passwordFailureLockMinutes(resolveInteger(setting.getPasswordFailureLockMinutes(), DEFAULT_PASSWORD_FAILURE_LOCK_MINUTES))
                .idleLogoutMinutes(resolveInteger(setting.getIdleLogoutMinutes(), DEFAULT_IDLE_LOGOUT_MINUTES))
                .tokenValidityMinutes(resolveInteger(setting.getTokenValidityMinutes(), DEFAULT_TOKEN_VALIDITY_MINUTES))
                .forceSignatureOnFirstLogin(resolveBoolean(setting.getForceSignatureOnFirstLogin(), false))
                .signatureChangeCycleEnabled(true)
                .signatureChangeCycleDays(resolveBoundedInteger(setting.getSignatureChangeCycleDays(), DEFAULT_SIGNATURE_CHANGE_CYCLE_DAYS, SIGNATURE_CHANGE_CYCLE_DAYS_MAX))
                .emailEnabled(resolveBoolean(setting.getEmailEnabled(), true))
                .smtpHost(setting.getSmtpHost())
                .smtpPort(resolveInteger(setting.getSmtpPort(), DEFAULT_SMTP_PORT))
                .smtpSslEnabled(resolveBoolean(setting.getSmtpSslEnabled(), false))
                .smtpUsername(setting.getSmtpUsername())
                .smtpPasswordConfigured(StringUtils.hasText(setting.getSmtpPassword()))
                .mailFromName(setting.getMailFromName())
                .browserIconFileId(setting.getBrowserIconFileId())
                .faviconFileId(setting.getBrowserIconFileId())
                .faviconUrl(previewUrl(setting.getBrowserIconFileId()))
                .updatedAt(setting.getUpdatedAt())
                .build();
    }

    private String previewUrl(Long fileId) {
        return fileId == null ? "" : "/api/v1/files/" + fileId + "/public-preview";
    }

    private Boolean resolveBoolean(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }

    private Integer resolveInteger(Integer value, int defaultValue) {
        return value == null ? defaultValue : value;
    }

    private Integer resolveBoundedInteger(Integer value, int defaultValue, int maxValue) {
        int normalized = resolveInteger(value, defaultValue);
        if (normalized < 1) return defaultValue;
        return Math.min(normalized, maxValue);
    }

    private Map<String, Object> settingSnapshot(SystemSetting setting) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", setting.getId());
        snapshot.put("systemName", setting.getSystemName());
        snapshot.put("systemLogoFileId", setting.getSystemLogoFileId());
        snapshot.put("systemLogo", fileSnapshot(setting.getSystemLogoFileId()));
        snapshot.put("logoWidth", normalizeLogoSize(setting.getLogoWidth(), "Logo 长度"));
        snapshot.put("logoHeight", normalizeLogoSize(setting.getLogoHeight(), "Logo 高度"));
        snapshot.put("browserTitle", setting.getBrowserTitle());
        snapshot.put("loginSubtitle", normalizeOptionalText(setting.getLoginSubtitle(), DEFAULT_LOGIN_SUBTITLE));
        snapshot.put("loginDescription", normalizeOptionalText(setting.getLoginDescription(), DEFAULT_LOGIN_DESCRIPTION));
        snapshot.put("loginComplianceItems", normalizeOptionalText(setting.getLoginComplianceItems(), DEFAULT_LOGIN_COMPLIANCE_ITEMS));
        snapshot.put("forcePasswordChangeOnFirstLogin", resolveBoolean(setting.getForcePasswordChangeOnFirstLogin(), true));
        snapshot.put("passwordChangeCycleEnabled", resolveBoolean(setting.getPasswordChangeCycleEnabled(), false));
        snapshot.put("passwordChangeCycleDays", resolveInteger(setting.getPasswordChangeCycleDays(), DEFAULT_PASSWORD_CHANGE_CYCLE_DAYS));
        snapshot.put("passwordComplexity", normalizePasswordComplexity(setting.getPasswordComplexity()));
        snapshot.put("passwordFailureLockThreshold", resolveInteger(setting.getPasswordFailureLockThreshold(), DEFAULT_PASSWORD_FAILURE_LOCK_THRESHOLD));
        snapshot.put("passwordFailureLockMinutes", resolveInteger(setting.getPasswordFailureLockMinutes(), DEFAULT_PASSWORD_FAILURE_LOCK_MINUTES));
        snapshot.put("idleLogoutMinutes", resolveInteger(setting.getIdleLogoutMinutes(), DEFAULT_IDLE_LOGOUT_MINUTES));
        snapshot.put("tokenValidityMinutes", resolveInteger(setting.getTokenValidityMinutes(), DEFAULT_TOKEN_VALIDITY_MINUTES));
        snapshot.put("forceSignatureOnFirstLogin", resolveBoolean(setting.getForceSignatureOnFirstLogin(), false));
        snapshot.put("signatureChangeCycleEnabled", true);
        snapshot.put("signatureChangeCycleDays", resolveInteger(setting.getSignatureChangeCycleDays(), DEFAULT_SIGNATURE_CHANGE_CYCLE_DAYS));
        snapshot.put("emailEnabled", resolveBoolean(setting.getEmailEnabled(), true));
        snapshot.put("smtpHost", setting.getSmtpHost());
        snapshot.put("smtpPort", resolveInteger(setting.getSmtpPort(), DEFAULT_SMTP_PORT));
        snapshot.put("smtpSslEnabled", resolveBoolean(setting.getSmtpSslEnabled(), false));
        snapshot.put("smtpUsername", setting.getSmtpUsername());
        snapshot.put("smtpPasswordConfigured", StringUtils.hasText(setting.getSmtpPassword()));
        snapshot.put("mailFromName", setting.getMailFromName());
        snapshot.put("browserIconFileId", setting.getBrowserIconFileId());
        snapshot.put("browserIcon", fileSnapshot(setting.getBrowserIconFileId()));
        return snapshot;
    }

    private void validateSmtpConfiguration(SystemSetting setting) {
        if (!resolveBoolean(setting.getEmailEnabled(), false)
                || !StringUtils.hasText(setting.getSmtpHost())
                || !StringUtils.hasText(setting.getSmtpUsername())
                || !StringUtils.hasText(setting.getSmtpPassword())
                || resolveInteger(setting.getSmtpPort(), DEFAULT_SMTP_PORT) < 1) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请先启用并完整配置 SMTP 邮箱服务");
        }
    }

    private void sendConfiguredTestMail(SystemSetting setting, UserAccount recipient) {
        try {
            JavaMailSender sender = mailSenderFactory.create(setting);
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            String fromName = StringUtils.hasText(setting.getMailFromName()) ? setting.getMailFromName().trim() : DEFAULT_SYSTEM_NAME;
            helper.setFrom(setting.getSmtpUsername().trim(), fromName);
            helper.setTo(recipient.getEmail().trim());
            helper.setSubject("eDHR 系统测试邮件");
            helper.setText("这是一封来自 eDHR 系统设置的信息配置测试邮件，用于验证 SMTP 邮箱服务是否连通。", false);
            sender.send(message);
        } catch (MessagingException | MailException ex) {
            throw new BusinessException(ErrorCode.GENERAL_001, "测试邮件发送失败：" + ex.getMessage());
        } catch (java.io.UnsupportedEncodingException ex) {
            throw new BusinessException(ErrorCode.GENERAL_001, "测试邮件发件人名称不支持：" + ex.getMessage());
        }
    }

    private void writeMailTestAudit(Long entityId, UserAccount recipient) {
        Map<String, Object> contentAfter = new LinkedHashMap<>();
        contentAfter.put("recipientUserId", recipient.getId());
        contentAfter.put("recipientUsername", recipient.getUsername());
        contentAfter.put("recipientEmail", recipient.getEmail());
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType("SYSTEM_SETTING")
                .entityId(entityId == null ? "" : String.valueOf(entityId))
                .action("TEST_MAIL")
                .contentBefore(toAuditJson(new LinkedHashMap<>()))
                .contentAfter(toAuditJson(contentAfter))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("系统设置")
                .functionName("发送测试邮件")
                .dataSummary("测试邮件发送至 " + recipient.getEmail())
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private Map<String, Object> fileSnapshot(Long fileId) {
        if (fileId == null) return Map.of();
        Optional<FileObject> file = fileObjectRepository.findById(fileId);
        if (file.isEmpty()) return Map.of("fileId", fileId, "previewUrl", previewUrl(fileId));
        FileObject fileObject = file.get();
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("fileId", fileObject.getId());
        snapshot.put("originalName", fileObject.getOriginalName());
        snapshot.put("mimeType", fileObject.getMimeType());
        snapshot.put("fileSize", fileObject.getFileSize());
        snapshot.put("previewUrl", previewUrl(fileObject.getId()));
        return snapshot;
    }

    private void writeAudit(Long entityId, String action, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType("SYSTEM_SETTING")
                .entityId(entityId == null ? "" : String.valueOf(entityId))
                .action(action)
                .contentBefore(toAuditJson(before))
                .contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("系统设置")
                .functionName("编辑系统设置")
                .dataSummary(entityId == null ? "系统设置" : "系统设置 #" + entityId)
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String toAuditJson(Map<String, Object> content) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败");
        }
    }

    private Path resolveStoragePath() {
        String path = StringUtils.hasText(storagePath)
                ? storagePath
                : System.getProperty("java.io.tmpdir") + "/edhr-files";
        return Path.of(path);
    }

    private String sanitizeFileName(String name) {
        if (name == null) return "unnamed";
        return name.replaceAll("[^a-zA-Z0-9._\\-\\u4e00-\\u9fff]", "_");
    }

    private String computeMd5(InputStream inputStream) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) md.update(buffer, 0, bytesRead);
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException | IOException e) {
            return "";
        }
    }

    public record UpdateSettingsRequest(
            String systemName,
            String browserTitle,
            Integer logoWidth,
            Integer logoHeight,
            String loginSubtitle,
            String loginDescription,
            String loginComplianceItems,
            Boolean forcePasswordChangeOnFirstLogin,
            Boolean passwordChangeCycleEnabled,
            Integer passwordChangeCycleDays,
            String passwordComplexity,
            Integer passwordFailureLockThreshold,
            Integer passwordFailureLockMinutes,
            Integer idleLogoutMinutes,
            Integer tokenValidityMinutes,
            Boolean forceSignatureOnFirstLogin,
            Boolean signatureChangeCycleEnabled,
            Integer signatureChangeCycleDays,
            Boolean emailEnabled,
            String smtpHost,
            Integer smtpPort,
            Boolean smtpSslEnabled,
            String smtpUsername,
            String smtpPassword,
            String mailFromName) {
    }

    public record TestMailRequest(Long userId) {
    }

    public record MailTestRecipientResponse(String id, String username, String displayName, String email) {
    }

    public record TestMailResponse(String recipientUserId, String username, String recipientEmail, LocalDateTime sentAt) {
    }

    @Data
    @Builder
    public static class SystemSettingResponse {
        private Long id;
        private String systemName;
        private Long systemLogoFileId;
        private Long logoFileId;
        private String logoUrl;
        private Integer logoWidth;
        private Integer logoHeight;
        private String browserTitle;
        private String loginSubtitle;
        private String loginDescription;
        private String loginComplianceItems;
        private Boolean forcePasswordChangeOnFirstLogin;
        private Boolean passwordChangeCycleEnabled;
        private Integer passwordChangeCycleDays;
        private String passwordComplexity;
        private Integer passwordFailureLockThreshold;
        private Integer passwordFailureLockMinutes;
        private Integer idleLogoutMinutes;
        private Integer tokenValidityMinutes;
        private Boolean forceSignatureOnFirstLogin;
        private Boolean signatureChangeCycleEnabled;
        private Integer signatureChangeCycleDays;
        private Boolean emailEnabled;
        private String smtpHost;
        private Integer smtpPort;
        private Boolean smtpSslEnabled;
        private String smtpUsername;
        private Boolean smtpPasswordConfigured;
        private String mailFromName;
        private Long browserIconFileId;
        private Long faviconFileId;
        private String faviconUrl;
        private LocalDateTime updatedAt;
    }

    @Component
    public static class MailSenderFactory {
        public JavaMailSender create(SystemSetting setting) {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(setting.getSmtpHost());
            sender.setPort(resolvePort(setting.getSmtpPort()));
            sender.setUsername(setting.getSmtpUsername());
            sender.setPassword(setting.getSmtpPassword());
            Properties properties = sender.getJavaMailProperties();
            properties.put("mail.smtp.auth", "true");
            properties.put("mail.smtp.connectiontimeout", "10000");
            properties.put("mail.smtp.timeout", "10000");
            properties.put("mail.smtp.writetimeout", "10000");
            if (Boolean.TRUE.equals(setting.getSmtpSslEnabled())) {
                properties.put("mail.smtp.ssl.enable", "true");
                properties.put("mail.smtp.starttls.enable", "true");
            }
            return sender;
        }

        private int resolvePort(Integer value) {
            return value == null || value < 1 ? DEFAULT_SMTP_PORT : value;
        }
    }
}
