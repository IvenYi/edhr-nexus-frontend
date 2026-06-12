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
import com.zencas.edhr.system.entity.SystemSetting;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system/settings")
@RequiredArgsConstructor
public class SystemSettingsController {

    private static final String TENANT_ID = "default";
    private static final String DEFAULT_SYSTEM_NAME = "eDHR 系统";
    private static final String DEFAULT_BROWSER_TITLE = "eDHR - 医疗器械电子设备历史记录系统";
    private static final int DEFAULT_LOGO_SIZE = 32;
    private static final int LOGO_SIZE_MAX = 60;
    private static final long BRAND_MAX_FILE_SIZE = 2L * 1024 * 1024;
    private static final List<String> LOGO_MIME_TYPES = List.of("image/svg+xml", "image/png", "image/jpeg", "image/webp");
    private static final List<String> FAVICON_MIME_TYPES = List.of("image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/svg+xml");
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper();

    private final SystemSettingRepository systemSettingRepository;
    private final FileObjectRepository fileObjectRepository;
    private final AuditEventRepository auditEventRepository;
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
        setting.setUpdatedBy(AuditContext.getOperatorId());
        SystemSetting saved = systemSettingRepository.save(setting);
        writeAudit(saved.getId(), "UPDATE", before, settingSnapshot(saved));
        return ApiResponse.success(toResponse(saved));
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
        return systemSettingRepository.findByTenantId(TENANT_ID).orElseGet(() -> SystemSetting.builder()
                .tenantId(TENANT_ID)
                .systemName(DEFAULT_SYSTEM_NAME)
                .browserTitle(DEFAULT_BROWSER_TITLE)
                .build());
    }

    private SystemSetting findOrCreate() {
        return systemSettingRepository.findByTenantId(TENANT_ID).orElseGet(() -> SystemSetting.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .systemName(DEFAULT_SYSTEM_NAME)
                .browserTitle(DEFAULT_BROWSER_TITLE)
                .createdBy(AuditContext.getOperatorId())
                .build());
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

    private Integer normalizeLogoSize(Integer value, String label) {
        int size = value == null ? DEFAULT_LOGO_SIZE : value;
        if (size < 1) throw new BusinessException(ErrorCode.GENERAL_001, label + "不能小于 1px");
        if (size > LOGO_SIZE_MAX) throw new BusinessException(ErrorCode.GENERAL_001, label + "不能超过 60px");
        return size;
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
                .browserIconFileId(setting.getBrowserIconFileId())
                .faviconFileId(setting.getBrowserIconFileId())
                .faviconUrl(previewUrl(setting.getBrowserIconFileId()))
                .updatedAt(setting.getUpdatedAt())
                .build();
    }

    private String previewUrl(Long fileId) {
        return fileId == null ? "" : "/api/v1/files/" + fileId + "/public-preview";
    }

    private Map<String, Object> settingSnapshot(SystemSetting setting) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", setting.getId());
        snapshot.put("systemName", setting.getSystemName());
        snapshot.put("systemLogoFileId", setting.getSystemLogoFileId());
        snapshot.put("logoWidth", normalizeLogoSize(setting.getLogoWidth(), "Logo 长度"));
        snapshot.put("logoHeight", normalizeLogoSize(setting.getLogoHeight(), "Logo 高度"));
        snapshot.put("browserTitle", setting.getBrowserTitle());
        snapshot.put("browserIconFileId", setting.getBrowserIconFileId());
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
                .source(AuditContext.getSource())
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

    public record UpdateSettingsRequest(String systemName, String browserTitle, Integer logoWidth, Integer logoHeight) {
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
        private Long browserIconFileId;
        private Long faviconFileId;
        private String faviconUrl;
        private LocalDateTime updatedAt;
    }
}
