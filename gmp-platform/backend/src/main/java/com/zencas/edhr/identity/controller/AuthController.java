package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.identity.service.GctPermissionCatalog;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final GctPermissionCatalog gctPermissionCatalog;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
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

        String token = jwtTokenProvider.generateToken(
                user.getId().toString(), user.getUsername(), permissions);

        // Update last login
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userAccountRepository.save(user);

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("displayName", user.getDisplayName());
        userMap.put("email", user.getEmail());
        userMap.put("roleIds", permissionSnapshot.roleIds());
        userMap.put("permissions", permissions);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", token);
        result.put("user", userMap);

        return ApiResponse.success(result);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
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
        UserPermissionSnapshot permissionSnapshot = resolveUserPermissionSnapshot(user.getId());
        result.put("roleIds", permissionSnapshot.roleIds());
        result.put("permissions", permissionSnapshot.permissions());
        return ApiResponse.success(result);
    }

    private UserPermissionSnapshot resolveUserPermissionSnapshot(Long userId) {
        List<Long> roleIds = userRoleRepository.findByUserId(userId).stream()
                .map(UserRole::getRoleId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

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
                List.copyOf(permissions));
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    private record UserPermissionSnapshot(List<String> roleIds, List<String> permissions) {
    }
}
