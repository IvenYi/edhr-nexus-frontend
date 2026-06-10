package com.zencas.edhr.identity.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/identity/users")
@RequiredArgsConstructor
public class UserController {

    private static final String DEFAULT_INITIAL_PASSWORD = "Zencas@123";
    private static final String SYSTEM_SUPER_ADMIN_USERNAME = "admin";
    private static final String USER_AUDIT_ENTITY_TYPE = "USER_ACCOUNT";
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper();

    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserDepartmentRepository userDepartmentRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ApiResponse<PageResult<UserResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<UserAccount> result = userAccountRepository.findAll(pageable);
        List<UserResponse> content = toUserResponses(result.getContent());
        return ApiResponse.success(PageResult.of(
                content, page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getById(@PathVariable Long id) {
        UserAccount user = findUser(id);
        Map<Long, UserAuditOperators> auditOperatorsByUser = findUserAuditOperators(List.of(id));
        return ApiResponse.success(toUserResponse(
                user,
                userRoleRepository.findByUserId(id),
                userDepartmentRepository.findByUserId(id),
                auditOperatorsByUser.get(id)));
    }

    @PostMapping
    @Transactional
    public ApiResponse<UserResponse> create(@RequestBody UserRequest request) {
        if (userAccountRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException(ErrorCode.IDN_005);
        }
        UserAccount entity = UserAccount.builder()
                .id(idGenerator.nextId())
                .tenantId(request.getTenantId() == null ? 1L : request.getTenantId())
                .username(request.getUsername())
                .displayName(resolveDisplayName(request))
                .email(request.getEmail())
                .phone(request.getPhone())
                .status(StringUtils.hasText(request.getStatus()) ? request.getStatus() : "ACTIVE")
                .passwordHash(passwordEncoder.encode(
                        StringUtils.hasText(request.getPassword()) ? request.getPassword() : DEFAULT_INITIAL_PASSWORD))
                .build();

        UserAccount saved = userAccountRepository.save(entity);
        replaceUserRoles(saved.getId(), request.getRoleIds());
        replaceUserDepartments(saved.getId(), request.getDepartmentIds(), request.getPrimaryDepartmentId());
        writeUserCreateAudit(saved.getId(), captureUserSnapshot(
                saved,
                request.getRoleIds(),
                request.getDepartmentIds(),
                request.getPrimaryDepartmentId()));
        return getById(saved.getId());
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<UserResponse> update(@PathVariable Long id, @RequestBody UserRequest request) {
        UserAccount entity = findUser(id);
        UserAuditSnapshot beforeSnapshot = captureUserSnapshot(
                entity,
                userRoleRepository.findByUserId(id),
                userDepartmentRepository.findByUserId(id));

        entity.setUsername(request.getUsername());
        entity.setDisplayName(resolveDisplayName(request));
        entity.setEmail(request.getEmail());
        entity.setPhone(request.getPhone());
        entity.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : entity.getStatus());
        entity.setUpdatedAt(java.time.LocalDateTime.now());
        UserAuditSnapshot afterSnapshot = captureUserSnapshot(
                entity,
                request.getRoleIds(),
                request.getDepartmentIds(),
                request.getPrimaryDepartmentId());

        UserAccount saved = userAccountRepository.save(entity);
        replaceUserRoles(saved.getId(), request.getRoleIds());
        replaceUserDepartments(saved.getId(), request.getDepartmentIds(), request.getPrimaryDepartmentId());
        writeUserUpdateAudit(saved.getId(), beforeSnapshot, afterSnapshot);
        return getById(saved.getId());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        UserAccount user = findUser(id);
        ensureUserCanBeDeleted(user);
        userRoleRepository.deleteByUserId(id);
        userDepartmentRepository.deleteByUserId(id);
        userAccountRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/remove-from-organization")
    @Transactional
    public ApiResponse<Void> removeFromOrganization(@PathVariable Long id) {
        findUser(id);
        userDepartmentRepository.deleteByUserId(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/{id}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable Long id, @RequestBody ResetPasswordRequest request) {
        if (request == null || !StringUtils.hasText(request.getPassword())) {
            throw new BusinessException(ErrorCode.GENERAL_001, "新密码不能为空");
        }
        UserAccount user = findUser(id);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userAccountRepository.save(user);
        return ApiResponse.success(null);
    }

    private UserAccount findUser(Long id) {
        return userAccountRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.IDN_002));
    }

    private void ensureUserCanBeDeleted(UserAccount user) {
        if (isSystemSuperAdminUser(user)) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统超级管理员账号不允许删除");
        }
    }

    private boolean isSystemSuperAdminUser(UserAccount user) {
        return user != null
                && StringUtils.hasText(user.getUsername())
                && SYSTEM_SUPER_ADMIN_USERNAME.equalsIgnoreCase(user.getUsername().trim());
    }

    private String resolveDisplayName(UserRequest request) {
        if (StringUtils.hasText(request.getDisplayName())) return request.getDisplayName();
        if (StringUtils.hasText(request.getName())) return request.getName();
        return request.getUsername();
    }

    private List<UserResponse> toUserResponses(List<UserAccount> users) {
        if (users.isEmpty()) return List.of();
        List<Long> userIds = users.stream().map(UserAccount::getId).toList();
        Map<Long, List<UserRole>> rolesByUser = userRoleRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.groupingBy(UserRole::getUserId));
        Map<Long, List<UserDepartment>> departmentsByUser = userDepartmentRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.groupingBy(UserDepartment::getUserId));
        Map<Long, UserAuditOperators> auditOperatorsByUser = findUserAuditOperators(userIds);
        return users.stream()
                .map(user -> toUserResponse(
                        user,
                        rolesByUser.getOrDefault(user.getId(), List.of()),
                        departmentsByUser.getOrDefault(user.getId(), List.of()),
                        auditOperatorsByUser.get(user.getId())))
                .toList();
    }

    private UserResponse toUserResponse(
            UserAccount user,
            List<UserRole> roles,
            List<UserDepartment> departments,
            UserAuditOperators auditOperators) {
        List<Long> roleIds = roles.stream().map(UserRole::getRoleId).toList();
        List<Long> departmentIds = departments.stream().map(UserDepartment::getDepartmentId).toList();
        Long primaryDepartmentId = departments.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsPrimary()))
                .findFirst()
                .map(UserDepartment::getDepartmentId)
                .orElse(departmentIds.isEmpty() ? null : departmentIds.getFirst());

        return UserResponse.builder()
                .id(String.valueOf(user.getId()))
                .tenantId(String.valueOf(user.getTenantId()))
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .name(user.getDisplayName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roleIds(roleIds.stream().map(String::valueOf).toList())
                .departmentIds(departmentIds.stream().map(String::valueOf).toList())
                .primaryDepartmentId(primaryDepartmentId == null ? null : String.valueOf(primaryDepartmentId))
                .lastLoginAt(user.getLastLoginAt())
                .createdBy(auditOperators == null ? null : auditOperators.createdBy())
                .createdAt(user.getCreatedAt())
                .updatedBy(auditOperators == null ? null : auditOperators.updatedBy())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private Map<Long, UserAuditOperators> findUserAuditOperators(List<Long> userIds) {
        if (userIds.isEmpty()) return Map.of();

        List<String> entityIds = userIds.stream().map(String::valueOf).toList();
        List<AuditEvent> auditEvents = Optional
                .ofNullable(auditEventRepository.findByEntityTypeAndEntityIdIn(USER_AUDIT_ENTITY_TYPE, entityIds))
                .orElse(List.of());
        Map<Long, UserAuditOperatorAccumulator> operatorsByUser = new HashMap<>();
        auditEvents.stream()
                .sorted(Comparator.comparing(
                        AuditEvent::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .forEach(event -> {
                    Long userId = parseAuditUserId(event.getEntityId());
                    if (userId == null || !StringUtils.hasText(event.getOperatorName())) return;
                    operatorsByUser
                            .computeIfAbsent(userId, ignored -> new UserAuditOperatorAccumulator())
                            .accept(event);
                });

        return operatorsByUser.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        item -> item.getValue().toOperators()));
    }

    private Long parseAuditUserId(String value) {
        if (!StringUtils.hasText(value)) return null;
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void replaceUserRoles(Long userId, List<Long> roleIds) {
        userRoleRepository.deleteByUserId(userId);
        userRoleRepository.flush();
        List<Long> distinctRoleIds = roleIds == null ? List.of() : roleIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (distinctRoleIds.isEmpty()) return;
        userRoleRepository.saveAll(distinctRoleIds.stream()
                .map(roleId -> UserRole.builder()
                        .id(idGenerator.nextId())
                        .userId(userId)
                        .roleId(roleId)
                        .build())
                .toList());
    }

    private void replaceUserDepartments(Long userId, List<Long> departmentIds, Long primaryDepartmentId) {
        userDepartmentRepository.deleteByUserId(userId);
        userDepartmentRepository.flush();
        List<Long> distinctDepartmentIds = departmentIds == null ? List.of() : departmentIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (primaryDepartmentId != null && !distinctDepartmentIds.contains(primaryDepartmentId)) {
            distinctDepartmentIds = new java.util.ArrayList<>(distinctDepartmentIds);
            distinctDepartmentIds.add(primaryDepartmentId);
        }
        if (distinctDepartmentIds.isEmpty()) return;
        Long effectivePrimaryId = primaryDepartmentId == null ? distinctDepartmentIds.getFirst() : primaryDepartmentId;
        userDepartmentRepository.saveAll(distinctDepartmentIds.stream()
                .map(departmentId -> UserDepartment.builder()
                        .id(idGenerator.nextId())
                        .userId(userId)
                        .departmentId(departmentId)
                        .isPrimary(departmentId.equals(effectivePrimaryId))
                        .build())
                .toList());
    }

    private UserAuditSnapshot captureUserSnapshot(
            UserAccount user,
            List<UserRole> roles,
            List<UserDepartment> departments) {
        List<Long> departmentIds = normalizeIds(departments.stream()
                .map(UserDepartment::getDepartmentId)
                .toList());
        Long primaryDepartmentId = departments.stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsPrimary()))
                .findFirst()
                .map(UserDepartment::getDepartmentId)
                .orElse(departmentIds.isEmpty() ? null : departmentIds.getFirst());
        return new UserAuditSnapshot(
                user.getUsername(),
                user.getDisplayName(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus(),
                normalizeIdStrings(roles.stream().map(UserRole::getRoleId).toList()),
                idStringsFromNormalizedIds(departmentIds),
                idToString(primaryDepartmentId));
    }

    private UserAuditSnapshot captureUserSnapshot(
            UserAccount user,
            List<Long> roleIds,
            List<Long> departmentIds,
            Long primaryDepartmentId) {
        List<Long> normalizedDepartmentIds = normalizeDepartmentIds(departmentIds, primaryDepartmentId);
        Long effectivePrimaryDepartmentId = primaryDepartmentId == null
                ? (normalizedDepartmentIds.isEmpty() ? null : normalizedDepartmentIds.getFirst())
                : primaryDepartmentId;
        return new UserAuditSnapshot(
                user.getUsername(),
                user.getDisplayName(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus(),
                normalizeIdStrings(roleIds),
                idStringsFromNormalizedIds(normalizedDepartmentIds),
                idToString(effectivePrimaryDepartmentId));
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null) return List.of();
        return ids.stream()
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
    }

    private List<String> normalizeIdStrings(List<Long> ids) {
        return idStringsFromNormalizedIds(normalizeIds(ids));
    }

    private List<String> idStringsFromNormalizedIds(List<Long> ids) {
        return ids.stream().map(String::valueOf).toList();
    }

    private String idToString(Long id) {
        return id == null ? null : String.valueOf(id);
    }

    private List<Long> normalizeDepartmentIds(List<Long> departmentIds, Long primaryDepartmentId) {
        List<Long> normalizedDepartmentIds = new ArrayList<>(normalizeIds(departmentIds));
        if (primaryDepartmentId != null && !normalizedDepartmentIds.contains(primaryDepartmentId)) {
            normalizedDepartmentIds.add(primaryDepartmentId);
            normalizedDepartmentIds.sort(Long::compareTo);
        }
        return List.copyOf(normalizedDepartmentIds);
    }

    private void writeUserUpdateAudit(Long userId, UserAuditSnapshot before, UserAuditSnapshot after) {
        Map<String, Object> contentBefore = new LinkedHashMap<>();
        Map<String, Object> contentAfter = new LinkedHashMap<>();
        putChanged(contentBefore, contentAfter, "username", before.username(), after.username());
        putChanged(contentBefore, contentAfter, "displayName", before.displayName(), after.displayName());
        putChanged(contentBefore, contentAfter, "email", before.email(), after.email());
        putChanged(contentBefore, contentAfter, "phone", before.phone(), after.phone());
        putChanged(contentBefore, contentAfter, "status", before.status(), after.status());
        putChanged(contentBefore, contentAfter, "roleIds", before.roleIds(), after.roleIds());
        putChanged(contentBefore, contentAfter, "departmentIds", before.departmentIds(), after.departmentIds());
        putChanged(contentBefore, contentAfter, "primaryDepartmentId", before.primaryDepartmentId(), after.primaryDepartmentId());
        if (contentBefore.isEmpty()) return;

        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId("default")
                .entityType(USER_AUDIT_ENTITY_TYPE)
                .entityId(String.valueOf(userId))
                .action("UPDATE")
                .contentBefore(toAuditJson(contentBefore))
                .contentAfter(toAuditJson(contentAfter))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .source(AuditContext.getSource())
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(java.time.LocalDateTime.now())
                .build());
    }

    private void writeUserCreateAudit(Long userId, UserAuditSnapshot after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId("default")
                .entityType(USER_AUDIT_ENTITY_TYPE)
                .entityId(String.valueOf(userId))
                .action("CREATE")
                .contentBefore(toAuditJson(new LinkedHashMap<>()))
                .contentAfter(toAuditJson(toAuditContent(after)))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .source(AuditContext.getSource())
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(java.time.LocalDateTime.now())
                .build());
    }

    private Map<String, Object> toAuditContent(UserAuditSnapshot snapshot) {
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("username", snapshot.username());
        content.put("displayName", snapshot.displayName());
        content.put("email", snapshot.email());
        content.put("phone", snapshot.phone());
        content.put("status", snapshot.status());
        content.put("roleIds", snapshot.roleIds());
        content.put("departmentIds", snapshot.departmentIds());
        content.put("primaryDepartmentId", snapshot.primaryDepartmentId());
        return content;
    }

    private void putChanged(
            Map<String, Object> contentBefore,
            Map<String, Object> contentAfter,
            String field,
            Object before,
            Object after) {
        if (Objects.equals(before, after)) return;
        contentBefore.put(field, before);
        contentAfter.put(field, after);
    }

    private String toAuditJson(Map<String, Object> content) {
        try {
            return AUDIT_OBJECT_MAPPER.writeValueAsString(content);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "审计内容序列化失败");
        }
    }

    private record UserAuditSnapshot(
            String username,
            String displayName,
            String email,
            String phone,
            String status,
            List<String> roleIds,
            List<String> departmentIds,
            String primaryDepartmentId) {
    }

    private record UserAuditOperators(String createdBy, String updatedBy) {
    }

    private static class UserAuditOperatorAccumulator {
        private String createdBy;
        private LocalDateTime createdAt;
        private String updatedBy;
        private LocalDateTime updatedAt;

        void accept(AuditEvent event) {
            String action = event.getAction() == null ? "" : event.getAction().trim().toUpperCase();
            if ("CREATE".equals(action)) {
                if (createdBy == null || isBefore(event.getCreatedAt(), createdAt)) {
                    createdBy = event.getOperatorName();
                    createdAt = event.getCreatedAt();
                }
                return;
            }

            if (updatedBy == null || isAfter(event.getCreatedAt(), updatedAt)) {
                updatedBy = event.getOperatorName();
                updatedAt = event.getCreatedAt();
            }
        }

        UserAuditOperators toOperators() {
            return new UserAuditOperators(createdBy, updatedBy);
        }

        private boolean isBefore(LocalDateTime candidate, LocalDateTime current) {
            if (current == null) return true;
            if (candidate == null) return false;
            return candidate.isBefore(current);
        }

        private boolean isAfter(LocalDateTime candidate, LocalDateTime current) {
            if (current == null) return true;
            if (candidate == null) return false;
            return candidate.isAfter(current);
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRequest {
        private Long tenantId;
        private String username;
        private String displayName;
        private String name;
        private String email;
        private String phone;
        private String status;
        private String password;
        private List<Long> roleIds;
        private List<Long> departmentIds;
        private Long primaryDepartmentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private String id;
        private String tenantId;
        private String username;
        private String displayName;
        private String name;
        private String email;
        private String phone;
        private String status;
        private List<String> roleIds;
        private List<String> departmentIds;
        private String primaryDepartmentId;
        private java.time.LocalDateTime lastLoginAt;
        private String createdBy;
        private java.time.LocalDateTime createdAt;
        private String updatedBy;
        private java.time.LocalDateTime updatedAt;
    }
}
