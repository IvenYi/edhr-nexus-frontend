package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.entity.LoginLog;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.LoginLogRepository;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.identity.service.GctPermissionCatalog;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
    private final LoginLogRepository loginLogRepository;
    private final SnowflakeIdGenerator idGenerator;

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
        userMap.put("roleIds", permissionSnapshot.roleIds());
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

    private record UserPermissionSnapshot(List<String> roleIds, List<String> permissions) {
    }

    private record ClientInfo(String platform, String clientType, String browser, String userAgent) {
    }
}
