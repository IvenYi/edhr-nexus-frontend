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
import com.zencas.edhr.identity.entity.Role;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.zencas.edhr.identity.service.GctPermissionCatalog;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/identity/roles")
@RequiredArgsConstructor
public class RoleController {

    private static final String ROLE_AUDIT_ENTITY_TYPE = "ROLE";
    private static final String USER_AUDIT_ENTITY_TYPE = "USER_ACCOUNT";
    private static final String DISABLED_USER_STATUS = "DISABLED";
    private static final ObjectMapper AUDIT_OBJECT_MAPPER = new ObjectMapper();

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserAccountRepository userAccountRepository;
    private final PermissionRepository permissionRepository;
    private final GctPermissionCatalog gctPermissionCatalog;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<RoleResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<Role> result = roleRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent().stream().map(this::toRoleResponse).toList(),
                page,
                size,
                result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<RoleResponse> getById(@PathVariable Long id) {
        return roleRepository.findById(id)
                .map(this::toRoleResponse)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    @Transactional
    public ApiResponse<RoleResponse> create(@RequestBody Role entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());
        if (entity.getTenantId() == null || entity.getTenantId() == 0L) entity.setTenantId(1L);
        entity.setCode(generateRoleCode(entity.getId()));

        Role saved = roleRepository.save(entity);
        writeRoleCreateAudit(saved);
        return ApiResponse.success(toRoleResponse(saved));
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<RoleResponse> update(@PathVariable Long id, @RequestBody Role entity) {
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.IDN_003));
        RoleAuditSnapshot beforeSnapshot = captureRoleSnapshot(existing);
        existing.setName(entity.getName());
        existing.setDescription(entity.getDescription());
        if (entity.getTenantId() != null && entity.getTenantId() != 0L) {
            existing.setTenantId(entity.getTenantId());
        } else if (existing.getTenantId() == null || existing.getTenantId() == 0L) {
            existing.setTenantId(1L);
        }

        Role saved = roleRepository.save(existing);
        writeRoleUpdateAudit(saved.getId(), beforeSnapshot, captureRoleSnapshot(saved));
        return ApiResponse.success(toRoleResponse(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.IDN_003));
        if ("ADMIN".equalsIgnoreCase(existing.getCode())) {
            throw new BusinessException(ErrorCode.GENERAL_003, "系统管理员角色不允许删除");
        }
        disableUsersAssignedToDeletedRole(existing);
        rolePermissionRepository.deleteByRoleId(id);
        roleRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/permissions")
    public ApiResponse<PageResult<Permission>> listAssignablePermissions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sortSpec = Sort.by(direction, sort);
        List<Permission> permissions = new ArrayList<>(permissionRepository.findAll(sortSpec));
        permissions.addAll(gctPermissionCatalog.listPermissions());
        permissions.sort(permissionComparator(sort, direction));

        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int start = Math.min((safePage - 1) * safeSize, permissions.size());
        int end = Math.min(start + safeSize, permissions.size());
        return ApiResponse.success(PageResult.of(
                permissions.subList(start, end), page, size, permissions.size()));
    }

    @GetMapping("/{id}/permissions")
    public ApiResponse<List<Long>> getPermissions(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.IDN_003);
        }
        List<Long> permissionIds = rolePermissionRepository.findByRoleId(id).stream()
                .map(RolePermission::getPermissionId)
                .toList();
        return ApiResponse.success(permissionIds);
    }

    @PutMapping("/{id}/permissions")
    @Transactional
    public ApiResponse<List<Long>> updatePermissions(
            @PathVariable Long id,
            @RequestBody RolePermissionRequest request) {
        if (!roleRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.IDN_003);
        }
        List<Long> beforePermissionIds = rolePermissionRepository.findByRoleId(id).stream()
                .map(RolePermission::getPermissionId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        List<Long> permissionIds = request == null || request.getPermissionIds() == null
                ? List.of()
                : request.getPermissionIds().stream()
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        rolePermissionRepository.deleteByRoleId(id);
        rolePermissionRepository.flush();
        List<RolePermission> bindings = permissionIds.stream()
                .map(permissionId -> RolePermission.builder()
                        .id(idGenerator.nextId())
                        .roleId(id)
                        .permissionId(permissionId)
                        .build())
                .toList();
        rolePermissionRepository.saveAll(bindings);
        writeRolePermissionUpdateAudit(id, beforePermissionIds, permissionIds);
        return ApiResponse.success(permissionIds);
    }

    private RoleResponse toRoleResponse(Role role) {
        return RoleResponse.builder()
                .id(idToString(role.getId()))
                .tenantId(idToString(role.getTenantId()))
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .isBuiltin(isSystemAdministratorRole(role))
                .createdBy("系统管理员")
                .createdAt(role.getCreatedAt())
                .updatedBy("系统管理员")
                .updatedAt(role.getCreatedAt())
                .build();
    }

    private boolean isSystemAdministratorRole(Role role) {
        return role != null
                && (equalsIgnoreCase(role.getCode(), "ADMIN") || "系统管理员".equals(role.getName()));
    }

    private boolean equalsIgnoreCase(String value, String expected) {
        return value != null && value.equalsIgnoreCase(expected);
    }

    private String generateRoleCode(Long roleId) {
        return "ROLE_" + roleId;
    }

    private String idToString(Long id) {
        return id == null ? null : String.valueOf(id);
    }

    private Comparator<Permission> permissionComparator(String sort, Sort.Direction direction) {
        Comparator<Permission> comparator = switch (sort) {
            case "id" -> Comparator.comparing(Permission::getId, Comparator.nullsLast(Comparator.naturalOrder()));
            case "code" -> Comparator.comparing(Permission::getCode, Comparator.nullsLast(Comparator.naturalOrder()));
            case "name" -> Comparator.comparing(Permission::getName, Comparator.nullsLast(Comparator.naturalOrder()));
            case "type" -> Comparator.comparing(Permission::getType, Comparator.nullsLast(Comparator.naturalOrder()));
            case "createdAt" -> Comparator.comparing(Permission::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
            case "sortOrder" -> Comparator.comparing(Permission::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(Permission::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()));
        };
        if (direction == Sort.Direction.DESC) {
            comparator = comparator.reversed();
        }
        return comparator.thenComparing(Permission::getCode, Comparator.nullsLast(Comparator.naturalOrder()));
    }

    private void disableUsersAssignedToDeletedRole(Role deletedRole) {
        Long roleId = deletedRole.getId();
        List<Long> impactedUserIds = userRoleRepository.findByRoleId(roleId).stream()
                .map(UserRole::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (impactedUserIds.isEmpty()) return;

        Map<Long, List<String>> roleNamesByUser = findRoleNamesByUser(impactedUserIds);
        Map<Long, UserAccount> userById = new LinkedHashMap<>();
        userAccountRepository.findAllById(impactedUserIds).forEach(user -> {
            if (user.getId() != null) {
                userById.put(user.getId(), user);
            }
        });

        LocalDateTime operatedAt = LocalDateTime.now();
        List<UserAccount> usersToDisable = new ArrayList<>();
        for (Long userId : impactedUserIds) {
            UserAccount user = userById.get(userId);
            if (user == null) continue;

            UserRoleDeleteImpactSnapshot before = new UserRoleDeleteImpactSnapshot(
                    user.getStatus(),
                    roleNamesByUser.getOrDefault(userId, List.of()));
            user.setStatus(DISABLED_USER_STATUS);
            user.setUpdatedAt(operatedAt);
            usersToDisable.add(user);
            writeUserRoleDeleteImpactAudit(
                    user.getId(),
                    before,
                    new UserRoleDeleteImpactSnapshot(user.getStatus(), List.of()));
        }
        if (!usersToDisable.isEmpty()) {
            userAccountRepository.saveAll(usersToDisable);
        }

        impactedUserIds.forEach(userRoleRepository::deleteByUserId);
        userRoleRepository.flush();
    }

    private Map<Long, List<String>> findRoleNamesByUser(List<Long> userIds) {
        Map<Long, List<Long>> roleIdsByUser = new LinkedHashMap<>();
        userRoleRepository.findByUserIdIn(userIds).forEach(binding -> {
            if (binding.getUserId() == null || binding.getRoleId() == null) return;
            roleIdsByUser
                    .computeIfAbsent(binding.getUserId(), ignored -> new ArrayList<>())
                    .add(binding.getRoleId());
        });

        List<Long> allRoleIds = normalizePermissionAuditIds(roleIdsByUser.values().stream()
                .flatMap(List::stream)
                .toList());
        Map<Long, String> roleNamesById = new LinkedHashMap<>();
        roleRepository.findAllById(allRoleIds).forEach(role -> {
            if (role.getId() == null) return;
            roleNamesById.put(role.getId(), role.getName());
        });

        Map<Long, List<String>> normalizedRoleNamesByUser = new LinkedHashMap<>();
        userIds.forEach(userId -> normalizedRoleNamesByUser.put(
                userId,
                normalizePermissionAuditIds(roleIdsByUser.getOrDefault(userId, List.of()))
                        .stream()
                        .map(roleId -> {
                            String roleName = roleNamesById.get(roleId);
                            return org.springframework.util.StringUtils.hasText(roleName) ? roleName : "未知岗位角色(" + roleId + ")";
                        })
                        .toList()));
        return normalizedRoleNamesByUser;
    }

    private RoleAuditSnapshot captureRoleSnapshot(Role role) {
        return new RoleAuditSnapshot(
                role.getCode(),
                role.getName(),
                role.getDescription(),
                isSystemAdministratorRole(role));
    }

    private void writeRoleCreateAudit(Role role) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId("default")
                .entityType(ROLE_AUDIT_ENTITY_TYPE)
                .entityId(String.valueOf(role.getId()))
                .action("CREATE")
                .contentBefore(toAuditJson(new LinkedHashMap<>()))
                .contentAfter(toAuditJson(toAuditContent(captureRoleSnapshot(role))))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("岗位角色")
                .functionName("新增岗位角色")
                .dataSummary(roleDataSummary(role.getId(), role.getName()))
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private void writeRoleUpdateAudit(Long roleId, RoleAuditSnapshot before, RoleAuditSnapshot after) {
        Map<String, Object> contentBefore = new LinkedHashMap<>();
        Map<String, Object> contentAfter = new LinkedHashMap<>();
        putChanged(contentBefore, contentAfter, "name", before.name(), after.name());
        putChanged(contentBefore, contentAfter, "description", before.description(), after.description());
        putChanged(contentBefore, contentAfter, "isBuiltin", before.isBuiltin(), after.isBuiltin());
        if (contentBefore.isEmpty()) return;

        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId("default")
                .entityType(ROLE_AUDIT_ENTITY_TYPE)
                .entityId(String.valueOf(roleId))
                .action("UPDATE")
                .contentBefore(toAuditJson(contentBefore))
                .contentAfter(toAuditJson(contentAfter))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("岗位角色")
                .functionName("编辑岗位角色")
                .dataSummary(roleDataSummary(roleId, after.name()))
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private void writeRolePermissionUpdateAudit(Long roleId, List<Long> beforePermissionIds, List<Long> afterPermissionIds) {
        List<Long> before = normalizePermissionAuditIds(beforePermissionIds);
        List<Long> after = normalizePermissionAuditIds(afterPermissionIds);
        if (Objects.equals(before, after)) return;

        Map<String, Object> contentBefore = new LinkedHashMap<>();
        Map<String, Object> contentAfter = new LinkedHashMap<>();
        contentBefore.put("permissionIds", before);
        contentAfter.put("permissionIds", after);

        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId())
                .tenantId("default")
                .entityType(ROLE_AUDIT_ENTITY_TYPE)
                .entityId(String.valueOf(roleId))
                .action("UPDATE")
                .contentBefore(toAuditJson(contentBefore))
                .contentAfter(toAuditJson(contentAfter))
                .operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("岗位角色")
                .functionName("菜单权限设置")
                .dataSummary(roleDataSummary(roleId, null))
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private void writeUserRoleDeleteImpactAudit(
            Long userId,
            UserRoleDeleteImpactSnapshot before,
            UserRoleDeleteImpactSnapshot after) {
        Map<String, Object> contentBefore = new LinkedHashMap<>();
        Map<String, Object> contentAfter = new LinkedHashMap<>();
        putChanged(contentBefore, contentAfter, "status", before.status(), after.status());
        putChanged(contentBefore, contentAfter, "roles", before.roles(), after.roles());
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
                .operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource())
                .moduleName("系统")
                .menuName("用户管理")
                .functionName("岗位角色删除影响用户")
                .dataSummary("用户 #" + userId)
                .ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now())
                .build());
    }

    private String roleDataSummary(Long roleId, String roleName) {
        return org.springframework.util.StringUtils.hasText(roleName) ? "岗位角色 " + roleName : "岗位角色 #" + roleId;
    }

    private List<Long> normalizePermissionAuditIds(List<Long> permissionIds) {
        if (permissionIds == null) return List.of();
        return permissionIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
    }

    private Map<String, Object> toAuditContent(RoleAuditSnapshot snapshot) {
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("code", snapshot.code());
        content.put("name", snapshot.name());
        content.put("description", snapshot.description());
        content.put("isBuiltin", snapshot.isBuiltin());
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleResponse {
        private String id;
        private String tenantId;
        private String code;
        private String name;
        private String description;
        private Boolean isBuiltin;
        private String createdBy;
        private LocalDateTime createdAt;
        private String updatedBy;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RolePermissionRequest {
        private List<Long> permissionIds;
    }

    private record RoleAuditSnapshot(String code, String name, String description, Boolean isBuiltin) {
    }

    private record UserRoleDeleteImpactSnapshot(String status, List<String> roles) {
    }
}
