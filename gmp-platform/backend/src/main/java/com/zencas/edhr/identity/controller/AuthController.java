package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
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

        // Collect permissions from user's roles
        List<Long> roleIds = userRoleRepository.findByUserId(user.getId()).stream()
                .map(ur -> ur.getRoleId())
                .collect(Collectors.toList());

        List<Long> permIds = rolePermissionRepository.findByRoleIdIn(roleIds).stream()
                .map(rp -> rp.getPermissionId())
                .distinct()
                .collect(Collectors.toList());

        List<String> permissions = permissionRepository.findAllById(permIds).stream()
                .map(Permission::getCode)
                .collect(Collectors.toList());

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
        return ApiResponse.success(result);
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}
