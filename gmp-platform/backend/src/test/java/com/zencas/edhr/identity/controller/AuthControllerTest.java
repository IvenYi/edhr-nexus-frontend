package com.zencas.edhr.identity.controller;

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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private UserAccountRepository userAccountRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private RolePermissionRepository rolePermissionRepository;
    @Mock private PermissionRepository permissionRepository;
    @Mock private GctPermissionCatalog gctPermissionCatalog;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private LoginLogRepository loginLogRepository;
    @Mock private SnowflakeIdGenerator idGenerator;

    @InjectMocks private AuthController controller;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void loginKeepsJwtSmallButReturnsPermissionsInUserPayload() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .email("admin@example.com")
                .status("ACTIVE")
                .build();
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setUsername("admin");
        request.setPassword("123456");
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "hash")).thenReturn(true);
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(
                UserRole.builder().userId(1L).roleId(10L).build()));
        when(rolePermissionRepository.findByRoleIdIn(List.of(10L))).thenReturn(List.of(
                RolePermission.builder().roleId(10L).permissionId(60L).build(),
                RolePermission.builder().roleId(10L).permissionId(-7001L).build()));
        when(permissionRepository.findAllById(List.of(60L))).thenReturn(List.of(
                Permission.builder().id(60L).code("system").name("系统管理").build()));
        when(gctPermissionCatalog.findCodesByIds(List.of(60L, -7001L))).thenReturn(List.of(
                "gct-edhr.operation-panel.workbench.workbench-1-1"));
        when(jwtTokenProvider.generateToken("1", "admin", "系统管理员")).thenReturn("compact-token");

        var response = controller.login(request, new MockHttpServletRequest());
        @SuppressWarnings("unchecked")
        var data = (java.util.Map<String, Object>) response.getData();
        @SuppressWarnings("unchecked")
        var userPayload = (java.util.Map<String, Object>) data.get("user");

        assertThat(data.get("token")).isEqualTo("compact-token");
        assertThat(userPayload.get("permissions")).isEqualTo(List.of(
                "system",
                "gct-edhr.operation-panel.workbench.workbench-1-1"));
        verify(jwtTokenProvider).generateToken("1", "admin", "系统管理员");
    }

    @Test
    void loginRecordsWhoAccountTimeActionMethodClientBrowserAndIp() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .tenantId(7L)
                .username("qa.admin")
                .passwordHash("hash")
                .displayName("质量管理员")
                .email("qa@example.com")
                .status("ACTIVE")
                .build();
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setUsername("qa.admin");
        request.setPassword("123456");
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.addHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36");
        servletRequest.addHeader("X-Forwarded-For", "203.0.113.10, 10.0.0.2");
        when(userAccountRepository.findByUsername("qa.admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "hash")).thenReturn(true);
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of());
        when(gctPermissionCatalog.findCodesByIds(List.of())).thenReturn(List.of());
        when(jwtTokenProvider.generateToken("1", "qa.admin", "质量管理员")).thenReturn("compact-token");
        when(idGenerator.nextId()).thenReturn(9001L);

        controller.login(request, servletRequest);

        ArgumentCaptor<LoginLog> captor = ArgumentCaptor.forClass(LoginLog.class);
        verify(loginLogRepository).save(captor.capture());
        LoginLog log = captor.getValue();
        assertThat(log.getId()).isEqualTo(9001L);
        assertThat(log.getTenantId()).isEqualTo(7L);
        assertThat(log.getOperatorId()).isEqualTo(1L);
        assertThat(log.getOperatorName()).isEqualTo("质量管理员");
        assertThat(log.getUsername()).isEqualTo("qa.admin");
        assertThat(log.getEventType()).isEqualTo("LOGIN");
        assertThat(log.getAuthMethod()).isEqualTo("PASSWORD");
        assertThat(log.getOccurredAt()).isNotNull();
        assertThat(log.getPlatform()).isEqualTo("PC");
        assertThat(log.getClientType()).isEqualTo("WEB");
        assertThat(log.getBrowser()).isEqualTo("Chrome");
        assertThat(log.getIpAddress()).isEqualTo("203.0.113.10");
    }

    @Test
    void logoutRecordsCurrentUserClientBrowserAndIp() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .tenantId(7L)
                .username("mobile.user")
                .displayName("移动端用户")
                .status("ACTIVE")
                .build();
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setRemoteAddr("198.51.100.23");
        servletRequest.addHeader("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("1", null, List.of()));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(idGenerator.nextId()).thenReturn(9002L);

        controller.logout("1", servletRequest);

        ArgumentCaptor<LoginLog> captor = ArgumentCaptor.forClass(LoginLog.class);
        verify(loginLogRepository).save(captor.capture());
        LoginLog log = captor.getValue();
        assertThat(log.getId()).isEqualTo(9002L);
        assertThat(log.getTenantId()).isEqualTo(7L);
        assertThat(log.getOperatorId()).isEqualTo(1L);
        assertThat(log.getOperatorName()).isEqualTo("移动端用户");
        assertThat(log.getUsername()).isEqualTo("mobile.user");
        assertThat(log.getEventType()).isEqualTo("LOGOUT");
        assertThat(log.getAuthMethod()).isEqualTo("TOKEN");
        assertThat(log.getOccurredAt()).isNotNull();
        assertThat(log.getPlatform()).isEqualTo("MOBILE");
        assertThat(log.getClientType()).isEqualTo("H5");
        assertThat(log.getBrowser()).isEqualTo("Safari");
        assertThat(log.getIpAddress()).isEqualTo("198.51.100.23");
    }

    @Test
    void meReturnsCurrentRoleIdsAndLatestPermissions() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .displayName("系统管理员")
                .email("admin@example.com")
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(
                UserRole.builder().userId(1L).roleId(10L).build()));
        when(rolePermissionRepository.findByRoleIdIn(List.of(10L))).thenReturn(List.of(
                RolePermission.builder().roleId(10L).permissionId(60L).build(),
                RolePermission.builder().roleId(10L).permissionId(64L).build(),
                RolePermission.builder().roleId(10L).permissionId(-7001L).build()));
        when(permissionRepository.findAllById(List.of(60L, 64L))).thenReturn(List.of(
                Permission.builder().id(60L).code("system").name("系统管理").build(),
                Permission.builder().id(64L).code("system.roles").name("角色管理").build()));
        when(gctPermissionCatalog.findCodesByIds(List.of(60L, 64L, -7001L))).thenReturn(List.of(
                "gct-edhr.operation-panel.workbench.workbench-1-1"));

        var response = controller.me("1");
        var data = response.getData();

        assertThat(data.get("roleIds")).isEqualTo(List.of("10"));
        assertThat(data.get("permissions")).isEqualTo(List.of(
                "system",
                "system.roles",
                "gct-edhr.operation-panel.workbench.workbench-1-1"));
    }
}
