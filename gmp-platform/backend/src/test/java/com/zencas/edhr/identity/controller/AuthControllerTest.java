package com.zencas.edhr.identity.controller;

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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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

    @InjectMocks private AuthController controller;

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
        when(jwtTokenProvider.generateToken("1", "admin")).thenReturn("compact-token");

        var response = controller.login(request);
        @SuppressWarnings("unchecked")
        var data = (java.util.Map<String, Object>) response.getData();
        @SuppressWarnings("unchecked")
        var userPayload = (java.util.Map<String, Object>) data.get("user");

        assertThat(data.get("token")).isEqualTo("compact-token");
        assertThat(userPayload.get("permissions")).isEqualTo(List.of(
                "system",
                "gct-edhr.operation-panel.workbench.workbench-1-1"));
        verify(jwtTokenProvider).generateToken("1", "admin");
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
