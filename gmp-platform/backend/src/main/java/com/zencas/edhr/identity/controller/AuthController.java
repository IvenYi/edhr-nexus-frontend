package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.identity.entity.LoginLog;
import com.zencas.edhr.identity.entity.Department;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.Role;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.DepartmentRepository;
import com.zencas.edhr.identity.repository.LoginLogRepository;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.identity.service.GctPermissionCatalog;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String USER_PROFILE_TARGET_TYPE = "USER_PROFILE";
    private static final String USER_AVATAR_TARGET_TYPE = "USER_AVATAR";
    private static final String SIGNATURE_EVIDENCE_TARGET_TYPE = "SIGNATURE_EVIDENCE";
    private static final String TENANT_ID = "default";
    private static final int SIGNATURE_CONFIRMATION_STATEMENT_COUNT = 3;
    private static final long AVATAR_MAX_FILE_SIZE = 2L * 1024 * 1024;
    private static final List<String> AVATAR_MIME_TYPES = List.of("image/png", "image/jpeg", "image/webp", "image/gif");
    private static final java.util.regex.Pattern EMAIL_PATTERN = java.util.regex.Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final java.util.regex.Pattern CHINA_MOBILE_PATTERN = java.util.regex.Pattern.compile("^1[3-9]\\d{9}$");

    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final GctPermissionCatalog gctPermissionCatalog;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final LoginLogRepository loginLogRepository;
    private final FileObjectRepository fileObjectRepository;
    private final SignatureRepository signatureRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @Value("${edhr.file.storage-path:#{systemProperties['user.home'] + '/.edhr/files'}}")
    private String storagePath;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request,
                                                  HttpServletRequest servletRequest) {
        UserAccount user = userAccountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_001));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.AUTH_001);
        }

        if ("DISABLED".equals(user.getStatus()) || "LOCKED".equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.AUTH_003, "账户已被禁用或锁定");
        }

        UserPermissionSnapshot permissionSnapshot = resolveUserPermissionSnapshot(user.getId());
        List<String> permissions = permissionSnapshot.permissions();
        List<String> roleNames = permissionSnapshot.roleNames();

        String token = jwtTokenProvider.generateToken(
                user.getId().toString(), user.getUsername(), user.getDisplayName());

        // Update last login
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userAccountRepository.save(user);
        recordLoginEvent(user, "LOGIN", "PASSWORD", servletRequest);

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("displayName", user.getDisplayName());
        userMap.put("email", user.getEmail());
        userMap.put("phone", user.getPhone());
        userMap.put("gender", user.getGender());
        userMap.put("biography", user.getBiography());
        userMap.put("avatarFileId", idToString(user.getAvatarFileId()));
        userMap.put("avatarUrl", previewUrl(user.getAvatarFileId()));
        userMap.put("birthday", user.getBirthday() == null ? null : user.getBirthday().toString());
        putDepartmentSnapshot(userMap, user.getId());
        userMap.put("roleIds", permissionSnapshot.roleIds());
        userMap.put("roleNames", roleNames);
        userMap.put("permissions", permissions);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", token);
        result.put("user", userMap);

        return ApiResponse.success(result);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestAttribute(value = "userId", required = false) String userId,
                                    HttpServletRequest servletRequest) {
        if (StringUtils.hasText(userId)) {
            userAccountRepository.findById(Long.parseLong(userId))
                    .ifPresent(user -> recordLoginEvent(user, "LOGOUT", "TOKEN", servletRequest));
        }
        // Stateless JWT - client discards token
        return ApiResponse.success(null);
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(@RequestAttribute(value = "userId", required = false) String userId) {
        if (userId == null) {
            throw new BusinessException(ErrorCode.AUTH_004);
        }
        UserAccount user = userAccountRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new BusinessException(ErrorCode.IDN_002));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("displayName", user.getDisplayName());
        result.put("email", user.getEmail());
        result.put("phone", user.getPhone());
        result.put("gender", user.getGender());
        result.put("biography", user.getBiography());
        result.put("avatarFileId", idToString(user.getAvatarFileId()));
        result.put("avatarUrl", previewUrl(user.getAvatarFileId()));
        result.put("birthday", user.getBirthday() == null ? null : user.getBirthday().toString());
        putDepartmentSnapshot(result, user.getId());
        UserPermissionSnapshot permissionSnapshot = resolveUserPermissionSnapshot(user.getId());
        result.put("roleIds", permissionSnapshot.roleIds());
        result.put("roleNames", permissionSnapshot.roleNames());
        result.put("permissions", permissionSnapshot.permissions());
        Optional.ofNullable(signatureRepository.findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc(
                        USER_PROFILE_TARGET_TYPE,
                        String.valueOf(user.getId())))
                .orElse(Optional.empty())
                .ifPresent(signature -> {
                    result.put("latestSignatureId", idToString(signature.getId()));
                    result.put("signatureCertifiedAt", signature.getSignedAt() == null ? null : signature.getSignedAt().toString());
                    result.put("signatureAuthMethod", signature.getAuthMethod());
                });
        return ApiResponse.success(result);
    }

    @PostMapping("/me/avatar")
    @Transactional
    public ApiResponse<Map<String, Object>> uploadAvatar(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestParam("file") MultipartFile file) throws IOException {
        UserAccount user = findCurrentUser(userId);
        FileObject fileObject = storeAvatarFile(user, file);
        user.setAvatarFileId(fileObject.getId());
        user.setUpdatedAt(LocalDateTime.now());
        userAccountRepository.save(user);
        return me(String.valueOf(user.getId()));
    }

    @PutMapping("/me/profile")
    @Transactional
    public ApiResponse<Map<String, Object>> updateProfile(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestBody ProfileUpdateRequest request,
            HttpServletRequest servletRequest) {
        UserAccount user = findCurrentUser(userId);
        if (request != null) {
            Map<String, Object> contentBefore = profileAuditSnapshot(user);
            if (StringUtils.hasText(request.getDisplayName())) user.setDisplayName(request.getDisplayName().trim());
            if (request.getEmail() != null) {
                String email = normalizeNullableText(request.getEmail());
                if (StringUtils.hasText(email) && !EMAIL_PATTERN.matcher(email).matches()) {
                    throw new BusinessException(ErrorCode.GENERAL_001, "邮箱格式不正确");
                }
                user.setEmail(email);
            }
            if (request.getPhone() != null) {
                String phone = normalizeNullableText(request.getPhone());
                if (StringUtils.hasText(phone) && !CHINA_MOBILE_PATTERN.matcher(phone).matches()) {
                    throw new BusinessException(ErrorCode.GENERAL_001, "手机格式不正确");
                }
                user.setPhone(phone);
            }
            if (request.getGender() != null) user.setGender(normalizeNullableText(request.getGender()));
            if (request.getBiography() != null) user.setBiography(normalizeNullableText(request.getBiography()));
            user.setBirthday(request.getBirthday());
            user.setUpdatedAt(LocalDateTime.now());
            userAccountRepository.save(user);
            writeProfileUpdateAudit(user, contentBefore, profileAuditSnapshot(user), servletRequest);
        }
        return me(String.valueOf(user.getId()));
    }

    @PostMapping("/me/password")
    @Transactional
    public ApiResponse<Void> changeCurrentUserPassword(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestBody PasswordChangeRequest request,
            HttpServletRequest servletRequest) {
        UserAccount user = findCurrentUser(userId);
        if (request == null || !StringUtils.hasText(request.getCurrentPassword())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请输入当前密码");
        }
        if (!StringUtils.hasText(request.getNewPassword())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请输入新密码");
        }
        if (!Objects.equals(request.getNewPassword(), request.getConfirmPassword())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "两次输入的新密码不一致");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "当前密码不正确");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userAccountRepository.save(user);
        writePasswordChangeAudit(user, servletRequest);
        return ApiResponse.success(null);
    }

    @PostMapping("/me/signature")
    @Transactional
    public ApiResponse<Map<String, Object>> createPersonalSignature(
            @RequestAttribute(value = "userId", required = false) String userId,
            @RequestBody PersonalSignatureRequest request,
            HttpServletRequest servletRequest) {
        UserAccount user = findCurrentUser(userId);
        if (request == null || !StringUtils.hasText(request.getPassword())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请输入认证密码");
        }
        validateSignatureEvidence(request);
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "电子签名认证密码错误");
        }

        FileObject signatureImage = requireSignatureEvidenceFile(request.getSignatureImageFileId(), "请上传手写签名");
        FileObject idCardFront = requireSignatureEvidenceFile(request.getIdCardFrontFileId(), "请上传身份证正面");
        FileObject idCardBack = requireSignatureEvidenceFile(request.getIdCardBackFileId(), "请上传身份证反面");

        LocalDateTime signedAt = LocalDateTime.now();
        String meaning = StringUtils.hasText(request.getMeaning()) ? request.getMeaning().trim() : "个人设置确认";
        Map<String, Object> snapshot = signatureSnapshot(user, meaning, request.getStatements(), signatureImage, idCardFront, idCardBack, signedAt);
        String snapshotData = toJson(snapshot);
        Signature signature = Signature.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .targetType(USER_PROFILE_TARGET_TYPE)
                .targetId(String.valueOf(user.getId()))
                .meaning(meaning)
                .signerId(String.valueOf(user.getId()))
                .signerName(user.getDisplayName())
                .authMethod("PASSWORD")
                .authEventRef("PASSWORD_REAUTH:HANDWRITTEN_SIGNATURE_ID_CARD:" + signedAt)
                .snapshotHash(sha256(snapshotData))
                .snapshotData(snapshotData)
                .signedAt(signedAt)
                .createdAt(signedAt)
                .build();
        Signature saved = signatureRepository.save(signature);
        writeSignatureAudit(user, saved, snapshotData, servletRequest);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("signatureId", idToString(saved.getId()));
        response.put("signedAt", saved.getSignedAt() == null ? null : saved.getSignedAt().toString());
        response.put("authMethod", saved.getAuthMethod());
        response.put("snapshotHash", saved.getSnapshotHash());
        return ApiResponse.success(response);
    }

    private void validateSignatureEvidence(PersonalSignatureRequest request) {
        if (request.getStatements() == null || request.getStatements().size() != SIGNATURE_CONFIRMATION_STATEMENT_COUNT) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请逐条确认电子签名声明");
        }
        if (request.getStatements().stream().anyMatch(statement -> statement == null || !Boolean.TRUE.equals(statement.getConfirmed()))) {
            throw new BusinessException(ErrorCode.GENERAL_001, "请逐条确认电子签名声明");
        }
    }

    private FileObject requireSignatureEvidenceFile(String fileId, String message) {
        if (!StringUtils.hasText(fileId)) {
            throw new BusinessException(ErrorCode.GENERAL_001, message);
        }
        Long parsedFileId;
        try {
            parsedFileId = Long.parseLong(fileId);
        } catch (NumberFormatException ex) {
            throw new BusinessException(ErrorCode.GENERAL_001, message);
        }
        FileObject fileObject = fileObjectRepository.findById(parsedFileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, message));
        if (!SIGNATURE_EVIDENCE_TARGET_TYPE.equals(fileObject.getTargetType())) {
            throw new BusinessException(ErrorCode.GENERAL_001, message);
        }
        return fileObject;
    }

    private UserPermissionSnapshot resolveUserPermissionSnapshot(Long userId) {
        List<UserRole> userRoles = Optional.ofNullable(userRoleRepository.findByUserId(userId)).orElse(List.of());
        List<Long> roleIds = userRoles.stream()
                .map(UserRole::getRoleId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<Long, String> roleNameById = roleIds.isEmpty()
                ? Map.of()
                : roleRepository.findAllById(roleIds).stream()
                        .filter(role -> role.getId() != null && StringUtils.hasText(role.getName()))
                        .collect(LinkedHashMap::new, (map, role) -> map.put(role.getId(), role.getName()), Map::putAll);

        List<Long> permissionIds = roleIds.isEmpty()
                ? List.of()
                : rolePermissionRepository.findByRoleIdIn(roleIds).stream()
                        .map(RolePermission::getPermissionId)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        List<Long> persistedPermissionIds = permissionIds.stream()
                .filter(permissionId -> permissionId > 0)
                .toList();

        LinkedHashSet<String> permissions = new LinkedHashSet<>();
        if (!persistedPermissionIds.isEmpty()) {
            permissionRepository.findAllById(persistedPermissionIds).stream()
                    .map(Permission::getCode)
                    .filter(Objects::nonNull)
                    .forEach(permissions::add);
        }
        gctPermissionCatalog.findCodesByIds(permissionIds).forEach(permissions::add);

        return new UserPermissionSnapshot(
                roleIds.stream().map(String::valueOf).toList(),
                roleIds.stream().map(roleNameById::get).filter(Objects::nonNull).toList(),
                List.copyOf(permissions));
    }

    private void putDepartmentSnapshot(Map<String, Object> target, Long userId) {
        List<UserDepartment> memberships = Optional.ofNullable(userDepartmentRepository.findByUserId(userId)).orElse(List.of()).stream()
                .filter(item -> item.getDepartmentId() != null)
                .toList();
        List<String> departmentIds = memberships.stream()
                .map(UserDepartment::getDepartmentId)
                .map(String::valueOf)
                .toList();
        Long primaryDepartmentId = memberships.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsPrimary()))
                .findFirst()
                .map(UserDepartment::getDepartmentId)
                .orElse(memberships.isEmpty() ? null : memberships.getFirst().getDepartmentId());

        target.put("departmentIds", departmentIds);
        target.put("primaryDepartmentId", idToString(primaryDepartmentId));
        target.put("organizationName", primaryDepartmentId == null ? "-" : resolveDepartmentPath(primaryDepartmentId));
    }

    private String resolveDepartmentPath(Long departmentId) {
        Map<Long, Department> departmentsById = new LinkedHashMap<>();
        Optional.ofNullable(departmentRepository.findAllById(List.of(departmentId))).orElse(List.of()).forEach(department -> {
            if (department.getId() != null) departmentsById.put(department.getId(), department);
        });

        Long currentId = departmentId;
        List<String> names = new ArrayList<>();
        int guard = 0;
        while (currentId != null && guard++ < 20) {
            Department department = departmentsById.get(currentId);
            if (department == null) {
                Optional<Department> loaded = departmentRepository.findById(currentId);
                if (loaded.isEmpty()) break;
                department = loaded.get();
                departmentsById.put(department.getId(), department);
            }
            if (StringUtils.hasText(department.getName())) names.add(department.getName());
            currentId = department.getParentId();
        }
        if (names.isEmpty()) return "-";
        Collections.reverse(names);
        return String.join("/", names);
    }

    private void recordLoginEvent(UserAccount user, String eventType, String authMethod, HttpServletRequest request) {
        ClientInfo clientInfo = resolveClientInfo(request);
        loginLogRepository.save(LoginLog.builder()
                .id(idGenerator.nextId())
                .tenantId(user.getTenantId())
                .operatorId(user.getId())
                .operatorName(user.getDisplayName())
                .username(user.getUsername())
                .eventType(eventType)
                .authMethod(authMethod)
                .occurredAt(LocalDateTime.now())
                .platform(clientInfo.platform())
                .clientType(clientInfo.clientType())
                .browser(clientInfo.browser())
                .ipAddress(getClientIp(request))
                .userAgent(clientInfo.userAgent())
                .build());
    }

    private UserAccount findCurrentUser(String userId) {
        if (!StringUtils.hasText(userId)) {
            throw new BusinessException(ErrorCode.AUTH_004);
        }
        return userAccountRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new BusinessException(ErrorCode.IDN_002));
    }

    private FileObject storeAvatarFile(UserAccount user, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new BusinessException(ErrorCode.GENERAL_001, "上传文件不能为空");
        if (file.getSize() > AVATAR_MAX_FILE_SIZE) throw new BusinessException(ErrorCode.FILE_002, "头像文件大小不能超过 2MB");
        String contentType = file.getContentType();
        if (contentType == null || !AVATAR_MIME_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.FILE_003, "不支持的头像文件类型: " + contentType);
        }
        Long fileId = idGenerator.nextId();
        Path storageDir = Path.of(storagePath);
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
                .targetType(USER_AVATAR_TARGET_TYPE)
                .targetId(String.valueOf(user.getId()))
                .uploadedBy(String.valueOf(user.getId()))
                .createdAt(LocalDateTime.now())
                .build();
        fileObjectRepository.save(fileObject);
        return fileObject;
    }

    private Map<String, Object> signatureSnapshot(
            UserAccount user,
            String meaning,
            List<SignatureStatementRequest> statements,
            FileObject signatureImage,
            FileObject idCardFront,
            FileObject idCardBack,
            LocalDateTime signedAt) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("userId", String.valueOf(user.getId()));
        snapshot.put("username", user.getUsername());
        snapshot.put("displayName", user.getDisplayName());
        snapshot.put("email", user.getEmail());
        snapshot.put("phone", user.getPhone());
        snapshot.put("gender", user.getGender());
        snapshot.put("biography", user.getBiography());
        snapshot.put("avatarFileId", idToString(user.getAvatarFileId()));
        snapshot.put("birthday", user.getBirthday() == null ? null : user.getBirthday().toString());
        snapshot.put("meaning", meaning);
        snapshot.put("signatureImage", fileSnapshot(signatureImage));
        snapshot.put("idCardFront", fileSnapshot(idCardFront));
        snapshot.put("idCardBack", fileSnapshot(idCardBack));
        snapshot.put("statements", statements == null ? List.of() : statements.stream()
                .map(statement -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("key", statement.getKey());
                    item.put("text", statement.getText());
                    item.put("confirmed", statement.getConfirmed());
                    return item;
                })
                .toList());
        snapshot.put("authMethod", "PASSWORD+HANDWRITTEN_SIGNATURE+ID_CARD");
        snapshot.put("signedAt", signedAt.toString());
        return snapshot;
    }

    private Map<String, Object> fileSnapshot(FileObject fileObject) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("fileId", idToString(fileObject.getId()));
        snapshot.put("originalName", fileObject.getOriginalName());
        snapshot.put("mimeType", fileObject.getMimeType());
        snapshot.put("fileSize", fileObject.getFileSize());
        snapshot.put("md5Hash", fileObject.getMd5Hash());
        return snapshot;
    }

    private void writeSignatureAudit(UserAccount user, Signature signature, String snapshotData, HttpServletRequest request) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType("USER_ACCOUNT")
                .entityId(String.valueOf(user.getId()))
                .action("SIGN")
                .contentBefore(toJson(new LinkedHashMap<>()))
                .contentAfter(snapshotData)
                .operatorId(StringUtils.hasText(AuditContext.getOperatorId()) ? AuditContext.getOperatorId() : String.valueOf(user.getId()))
                .operatorName(StringUtils.hasText(AuditContext.getOperatorName()) ? AuditContext.getOperatorName() : user.getDisplayName())
                .operatorAccount(StringUtils.hasText(AuditContext.getOperatorAccount()) ? AuditContext.getOperatorAccount() : user.getUsername())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("个人设置")
                .functionName("电子签名认证")
                .dataSummary("账号 " + user.getUsername() + " 完成电子签名认证")
                .reason("电子签名认证记录 #" + signature.getId())
                .ipAddress(StringUtils.hasText(AuditContext.getIpAddress()) ? AuditContext.getIpAddress() : getClientIp(request))
                .createdAt(signature.getSignedAt())
                .build());
    }

    private Map<String, Object> profileAuditSnapshot(UserAccount user) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("displayName", user.getDisplayName());
        snapshot.put("email", user.getEmail());
        snapshot.put("phone", user.getPhone());
        snapshot.put("gender", user.getGender());
        snapshot.put("biography", user.getBiography());
        snapshot.put("birthday", user.getBirthday() == null ? null : user.getBirthday().toString());
        return snapshot;
    }

    private void writeProfileUpdateAudit(
            UserAccount user,
            Map<String, Object> beforeSnapshot,
            Map<String, Object> afterSnapshot,
            HttpServletRequest request) {
        Map<String, Object> contentBefore = new LinkedHashMap<>();
        Map<String, Object> contentAfter = new LinkedHashMap<>();
        beforeSnapshot.forEach((field, beforeValue) -> {
            Object afterValue = afterSnapshot.get(field);
            if (!Objects.equals(beforeValue, afterValue)) {
                contentBefore.put(field, beforeValue);
                contentAfter.put(field, afterValue);
            }
        });
        if (contentBefore.isEmpty()) return;
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType("USER_ACCOUNT")
                .entityId(String.valueOf(user.getId()))
                .action("UPDATE")
                .contentBefore(toJson(contentBefore))
                .contentAfter(toJson(contentAfter))
                .operatorId(StringUtils.hasText(AuditContext.getOperatorId()) ? AuditContext.getOperatorId() : String.valueOf(user.getId()))
                .operatorName(StringUtils.hasText(AuditContext.getOperatorName()) ? AuditContext.getOperatorName() : user.getDisplayName())
                .operatorAccount(StringUtils.hasText(AuditContext.getOperatorAccount()) ? AuditContext.getOperatorAccount() : user.getUsername())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("个人设置")
                .functionName("编辑个人设置")
                .dataSummary("账号 " + user.getUsername() + " 更新个人设置")
                .reason("当前用户更新个人基本信息")
                .ipAddress(StringUtils.hasText(AuditContext.getIpAddress()) ? AuditContext.getIpAddress() : getClientIp(request))
                .createdAt(LocalDateTime.now())
                .build());
    }

    private void writePasswordChangeAudit(UserAccount user, HttpServletRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Map<String, Object> contentBefore = new LinkedHashMap<>();
        contentBefore.put("password", "已设置");
        Map<String, Object> contentAfter = new LinkedHashMap<>();
        contentAfter.put("password", "已修改");
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId(TENANT_ID)
                .entityType("USER_ACCOUNT")
                .entityId(String.valueOf(user.getId()))
                .action("UPDATE")
                .contentBefore(toJson(contentBefore))
                .contentAfter(toJson(contentAfter))
                .operatorId(StringUtils.hasText(AuditContext.getOperatorId()) ? AuditContext.getOperatorId() : String.valueOf(user.getId()))
                .operatorName(StringUtils.hasText(AuditContext.getOperatorName()) ? AuditContext.getOperatorName() : user.getDisplayName())
                .operatorAccount(StringUtils.hasText(AuditContext.getOperatorAccount()) ? AuditContext.getOperatorAccount() : user.getUsername())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("个人设置")
                .functionName("修改密码")
                .dataSummary("账号 " + user.getUsername() + " 修改当前用户密码")
                .reason("当前用户主动修改登录密码")
                .ipAddress(StringUtils.hasText(AuditContext.getIpAddress()) ? AuditContext.getIpAddress() : getClientIp(request))
                .createdAt(now)
                .build());
    }

    private String normalizeNullableText(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
    }

    private String previewUrl(Long fileId) {
        return fileId == null ? "" : "/api/v1/files/" + fileId + "/public-preview";
    }

    private String idToString(Long id) {
        return id == null ? null : String.valueOf(id);
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
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException | IOException e) {
            return "";
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "电子签名哈希生成失败");
        }
    }

    private String toJson(Map<String, Object> content) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(content);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "电子签名内容序列化失败");
        }
    }

    private ClientInfo resolveClientInfo(HttpServletRequest request) {
        String userAgent = request == null ? "" : Optional.ofNullable(request.getHeader("User-Agent")).orElse("");
        String lowerUserAgent = userAgent.toLowerCase(Locale.ROOT);
        boolean mobile = lowerUserAgent.contains("mobile")
                || lowerUserAgent.contains("android")
                || lowerUserAgent.contains("iphone")
                || lowerUserAgent.contains("ipad");
        return new ClientInfo(
                mobile ? "MOBILE" : "PC",
                mobile ? "H5" : "WEB",
                resolveBrowser(lowerUserAgent),
                userAgent);
    }

    private String resolveBrowser(String lowerUserAgent) {
        if (!StringUtils.hasText(lowerUserAgent)) return "未知";
        if (lowerUserAgent.contains("micromessenger")) return "WeChat";
        if (lowerUserAgent.contains("edg/") || lowerUserAgent.contains("edge/")) return "Edge";
        if (lowerUserAgent.contains("chrome/") || lowerUserAgent.contains("crios/")) return "Chrome";
        if (lowerUserAgent.contains("firefox/") || lowerUserAgent.contains("fxios/")) return "Firefox";
        if (lowerUserAgent.contains("safari/")) return "Safari";
        return "未知";
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "-";
        String ip = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(ip) && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        ip = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(ip) && !"unknown".equalsIgnoreCase(ip)) {
            return ip.trim();
        }
        return StringUtils.hasText(request.getRemoteAddr()) ? request.getRemoteAddr() : "-";
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class ProfileUpdateRequest {
        private String displayName;
        private String email;
        private String phone;
        private String gender;
        private String biography;
        private java.time.LocalDate birthday;
    }

    @Data
    public static class PasswordChangeRequest {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;
    }

    @Data
    public static class PersonalSignatureRequest {
        private String password;
        private String meaning;
        private String signatureImageFileId;
        private String idCardFrontFileId;
        private String idCardBackFileId;
        private List<SignatureStatementRequest> statements;
    }

    @Data
    public static class SignatureStatementRequest {
        private String key;
        private String text;
        private Boolean confirmed;
    }

    private record UserPermissionSnapshot(List<String> roleIds, List<String> roleNames, List<String> permissions) {
    }

    private record ClientInfo(String platform, String clientType, String browser, String userAgent) {
    }
}
