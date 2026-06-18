package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.compliance.service.IdCardOcrService;
import com.zencas.edhr.identity.entity.LoginLog;
import com.zencas.edhr.identity.entity.Department;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.Role;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.repository.DepartmentRepository;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.LoginLogRepository;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.identity.service.GctPermissionCatalog;
import com.zencas.edhr.system.entity.SystemSetting;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock private UserAccountRepository userAccountRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private UserDepartmentRepository userDepartmentRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private RolePermissionRepository rolePermissionRepository;
    @Mock private PermissionRepository permissionRepository;
    @Mock private GctPermissionCatalog gctPermissionCatalog;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private LoginLogRepository loginLogRepository;
    @Mock private FileObjectRepository fileObjectRepository;
    @Mock private SignatureRepository signatureRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private IdCardOcrService idCardOcrService;
    @Mock private SystemSettingRepository systemSettingRepository;
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
        when(roleRepository.findAllById(List.of(10L))).thenReturn(List.of(
                Role.builder().id(10L).name("系统管理员").build()));
        when(rolePermissionRepository.findByRoleIdIn(List.of(10L))).thenReturn(List.of(
                RolePermission.builder().roleId(10L).permissionId(60L).build(),
                RolePermission.builder().roleId(10L).permissionId(-7001L).build()));
        when(permissionRepository.findAllById(List.of(60L))).thenReturn(List.of(
                Permission.builder().id(60L).code("system").name("系统管理").build()));
        when(gctPermissionCatalog.findCodesByIds(List.of(60L, -7001L))).thenReturn(List.of(
                "gct-edhr.operation-panel.workbench.workbench-1-1"));
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());
        when(jwtTokenProvider.generateToken("1", "admin", "系统管理员", 480)).thenReturn("compact-token");

        var response = controller.login(request, new MockHttpServletRequest());
        @SuppressWarnings("unchecked")
        var data = (java.util.Map<String, Object>) response.getData();
        @SuppressWarnings("unchecked")
        var userPayload = (java.util.Map<String, Object>) data.get("user");

        assertThat(data.get("token")).isEqualTo("compact-token");
        assertThat(userPayload.get("permissions")).isEqualTo(List.of(
                "system",
                "gct-edhr.operation-panel.workbench.workbench-1-1"));
        assertThat(userPayload.get("roleNames")).isEqualTo(List.of("系统管理员"));
        verify(jwtTokenProvider).generateToken("1", "admin", "系统管理员", 480);
    }

    @Test
    void loginUsesConfiguredTokenValidityAndReturnsRequiredSecurityActions() {
        LocalDateTime oldPasswordChange = LocalDateTime.now().minusDays(120);
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .status("ACTIVE")
                .passwordChangedAt(oldPasswordChange)
                .build();
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setUsername("admin");
        request.setPassword("123456");
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "hash")).thenReturn(true);
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(SystemSetting.builder()
                .tenantId("default")
                .tokenValidityMinutes(120)
                .forcePasswordChangeOnFirstLogin(true)
                .passwordChangeCycleEnabled(true)
                .passwordChangeCycleDays(90)
                .forceSignatureOnFirstLogin(true)
                .signatureChangeCycleEnabled(true)
                .signatureChangeCycleDays(365)
                .build()));
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of());
        when(gctPermissionCatalog.findCodesByIds(List.of())).thenReturn(List.of());
        when(signatureRepository.findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc("USER_PROFILE", "1"))
                .thenReturn(Optional.empty());
        when(jwtTokenProvider.generateToken("1", "admin", "系统管理员", 120)).thenReturn("compact-token");

        var response = controller.login(request, new MockHttpServletRequest());
        @SuppressWarnings("unchecked")
        var data = (java.util.Map<String, Object>) response.getData();

        assertThat(data.get("tokenValidityMinutes")).isEqualTo(120);
        assertThat(data.get("forcePasswordChange")).isEqualTo(true);
        assertThat(data.get("forceSignatureVerification")).isEqualTo(true);
        verify(jwtTokenProvider).generateToken("1", "admin", "系统管理员", 120);
    }

    @Test
    void loginLocksAccountAfterConfiguredFailedPasswordAttempts() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .status("ACTIVE")
                .failedLoginAttempts(2)
                .build();
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setUsername("admin");
        request.setPassword("wrong");
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(SystemSetting.builder()
                .tenantId("default")
                .passwordFailureLockThreshold(3)
                .passwordFailureLockMinutes(20)
                .build()));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> controller.login(request, new MockHttpServletRequest()))
                .hasMessageContaining("用户名或密码错误");

        assertThat(user.getFailedLoginAttempts()).isEqualTo(3);
        assertThat(user.getLockedUntil()).isAfter(LocalDateTime.now());
        verify(userAccountRepository).save(user);
    }

    @Test
    void loginRejectsLockedAccountUntilLockWindowExpires() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .status("ACTIVE")
                .lockedUntil(LocalDateTime.now().plusMinutes(10))
                .build();
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setUsername("admin");
        request.setPassword("123456");
        when(userAccountRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> controller.login(request, new MockHttpServletRequest()))
                .hasMessageContaining("账户已锁定");

        verify(passwordEncoder, never()).matches(any(), any());
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
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());
        when(jwtTokenProvider.generateToken("1", "qa.admin", "质量管理员", 480)).thenReturn("compact-token");
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
        when(roleRepository.findAllById(List.of(10L))).thenReturn(List.of(
                Role.builder().id(10L).name("系统管理员").build()));
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
        assertThat(data.get("roleNames")).isEqualTo(List.of("系统管理员"));
        assertThat(data.get("permissions")).isEqualTo(List.of(
                "system",
                "system.roles",
                "gct-edhr.operation-panel.workbench.workbench-1-1"));
    }

    @Test
    void meReturnsAvatarBirthdayAndLatestElectronicSignatureEvidence() {
        LocalDateTime signedAt = LocalDateTime.of(2026, 6, 16, 9, 30);
        LocalDateTime expiresAt = LocalDateTime.of(2027, 6, 16, 9, 30);
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .displayName("系统管理员")
                .email("admin@example.com")
                .phone("13814083773")
                .gender("女")
                .biography("质量负责人")
                .avatarFileId(501L)
                .birthday(LocalDate.of(1990, 1, 2))
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of());
        when(userDepartmentRepository.findByUserId(1L)).thenReturn(List.of(
                UserDepartment.builder().userId(1L).departmentId(30L).isPrimary(true).build()));
        when(departmentRepository.findAllById(List.of(30L))).thenReturn(List.of(
                Department.builder().id(30L).tenantId(0L).parentId(20L).name("QA班组").build()));
        when(departmentRepository.findById(20L)).thenReturn(Optional.of(
                Department.builder().id(20L).tenantId(0L).parentId(10L).name("质量部").build()));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(
                Department.builder().id(10L).tenantId(0L).name("公司").build()));
        when(gctPermissionCatalog.findCodesByIds(List.of())).thenReturn(List.of());
        when(signatureRepository.findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc("USER_PROFILE", "1"))
                .thenReturn(Optional.of(Signature.builder()
                        .id(601L)
                        .targetType("USER_PROFILE")
                        .targetId("1")
                        .signerId("1")
                        .signerName("系统管理员")
                        .authMethod("PASSWORD")
                        .signedAt(signedAt)
                        .expiresAt(expiresAt)
                        .authorizationNoticeFileId(7002L)
                        .build()));

        var response = controller.me("1");
        var data = response.getData();

        assertThat(data.get("phone")).isEqualTo("13814083773");
        assertThat(data.get("gender")).isEqualTo("女");
        assertThat(data.get("biography")).isEqualTo("质量负责人");
        assertThat(data.get("primaryDepartmentId")).isEqualTo("30");
        assertThat(data.get("departmentIds")).isEqualTo(List.of("30"));
        assertThat(data.get("organizationName")).isEqualTo("公司/质量部/QA班组");
        assertThat(data.get("avatarFileId")).isEqualTo("501");
        assertThat(data.get("avatarUrl")).isEqualTo("/api/v1/files/501/public-preview");
        assertThat(data.get("birthday")).isEqualTo("1990-01-02");
        assertThat(data.get("latestSignatureId")).isEqualTo("601");
        assertThat(data.get("signatureCertifiedAt")).isEqualTo("2026-06-16T09:30");
        assertThat(data.get("signatureAuthMethod")).isEqualTo("PASSWORD");
        assertThat(data.get("signatureExpiresAt")).isEqualTo("2027-06-16T09:30");
        assertThat(data.get("signatureAuthorizationNoticeFileId")).isEqualTo("7002");
    }

    @Test
    void uploadAvatarStoresFileReferenceAndReturnsUpdatedCurrentUser() throws Exception {
        Path storagePath = Files.createTempDirectory("edhr-avatar-test");
        ReflectionTestUtils.setField(controller, "storagePath", storagePath.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                new byte[] {1, 2, 3});
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .displayName("系统管理员")
                .email("admin@example.com")
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(idGenerator.nextId()).thenReturn(501L);
        when(userAccountRepository.save(user)).thenReturn(user);
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of());
        when(gctPermissionCatalog.findCodesByIds(List.of())).thenReturn(List.of());
        when(signatureRepository.findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc("USER_PROFILE", "1"))
                .thenReturn(Optional.empty());

        var response = controller.uploadAvatar("1", file);

        ArgumentCaptor<FileObject> fileCaptor = ArgumentCaptor.forClass(FileObject.class);
        verify(fileObjectRepository).save(fileCaptor.capture());
        FileObject savedFile = fileCaptor.getValue();
        assertThat(savedFile.getId()).isEqualTo(501L);
        assertThat(savedFile.getTargetType()).isEqualTo("USER_AVATAR");
        assertThat(savedFile.getTargetId()).isEqualTo("1");
        assertThat(savedFile.getUploadedBy()).isEqualTo("1");
        assertThat(user.getAvatarFileId()).isEqualTo(501L);
        assertThat(response.getData().get("avatarUrl")).isEqualTo("/api/v1/files/501/public-preview");
    }

    @Test
    void updateProfileStoresEditableEmailPhoneAndBirthdayForCurrentUser() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .displayName("系统管理员")
                .email("old@example.com")
                .phone("13900001111")
                .gender("男")
                .biography("旧简介")
                .birthday(LocalDate.of(1990, 1, 2))
                .build();
        AuthController.ProfileUpdateRequest request = new AuthController.ProfileUpdateRequest();
        request.setDisplayName("王子麟");
        request.setEmail(" 2239266206@qq.com ");
        request.setPhone(" 13814083773 ");
        request.setGender("女");
        request.setBiography(" 富在术数 ");
        request.setBirthday(LocalDate.of(1992, 3, 4));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userAccountRepository.save(user)).thenReturn(user);
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of());
        when(userDepartmentRepository.findByUserId(1L)).thenReturn(List.of(
                UserDepartment.builder().userId(1L).departmentId(30L).isPrimary(true).build()));
        when(departmentRepository.findAllById(List.of(30L))).thenReturn(List.of(
                Department.builder().id(30L).tenantId(0L).parentId(20L).name("QA班组").build()));
        when(departmentRepository.findById(20L)).thenReturn(Optional.of(
                Department.builder().id(20L).tenantId(0L).parentId(10L).name("质量部").build()));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(
                Department.builder().id(10L).tenantId(0L).name("公司").build()));
        when(gctPermissionCatalog.findCodesByIds(List.of())).thenReturn(List.of());
        when(signatureRepository.findFirstByTargetTypeAndTargetIdOrderBySignedAtDesc("USER_PROFILE", "1"))
                .thenReturn(Optional.empty());

        var response = controller.updateProfile("1", request, new MockHttpServletRequest());

        assertThat(user.getDisplayName()).isEqualTo("王子麟");
        assertThat(user.getEmail()).isEqualTo("2239266206@qq.com");
        assertThat(user.getPhone()).isEqualTo("13814083773");
        assertThat(user.getGender()).isEqualTo("女");
        assertThat(user.getBiography()).isEqualTo("富在术数");
        assertThat(user.getBirthday()).isEqualTo(LocalDate.of(1992, 3, 4));
        assertThat(user.getUpdatedAt()).isNotNull();
        assertThat(response.getData().get("email")).isEqualTo("2239266206@qq.com");
        assertThat(response.getData().get("phone")).isEqualTo("13814083773");
        assertThat(response.getData().get("gender")).isEqualTo("女");
        assertThat(response.getData().get("biography")).isEqualTo("富在术数");
        verify(userAccountRepository).save(user);
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        auditCaptor.getValue().sealSnapshotHash();
        assertThat(auditCaptor.getValue().getFunctionName()).isEqualTo("编辑个人设置");
        assertThat(auditCaptor.getValue().getSnapshotHash()).hasSize(64);
        assertThat(auditCaptor.getValue().getContentAfter()).contains("\"email\":\"2239266206@qq.com\"");
        assertThat(auditCaptor.getValue().getContentAfter()).contains("\"phone\":\"13814083773\"");
        assertThat(auditCaptor.getValue().getContentAfter()).contains("\"gender\":\"女\"");
        assertThat(auditCaptor.getValue().getContentAfter()).contains("\"biography\":\"富在术数\"");
        assertThat(auditCaptor.getValue().getContentAfter()).contains("\"organizationName\":\"公司/质量部/QA班组\"");
    }

    @Test
    void updateProfileRejectsInvalidEmailAndPhone() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .displayName("系统管理员")
                .build();
        AuthController.ProfileUpdateRequest badEmailRequest = new AuthController.ProfileUpdateRequest();
        badEmailRequest.setEmail("bad-email");
        AuthController.ProfileUpdateRequest badPhoneRequest = new AuthController.ProfileUpdateRequest();
        badPhoneRequest.setPhone("12345");
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> controller.updateProfile("1", badEmailRequest, new MockHttpServletRequest()))
                .hasMessageContaining("邮箱格式不正确");
        assertThatThrownBy(() -> controller.updateProfile("1", badPhoneRequest, new MockHttpServletRequest()))
                .hasMessageContaining("手机格式不正确");
        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

    @Test
    void changeCurrentUserPasswordRequiresCurrentPasswordAndStoresEncodedNewPassword() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("old-hash")
                .displayName("系统管理员")
                .build();
        AuthController.PasswordChangeRequest request = new AuthController.PasswordChangeRequest();
        request.setCurrentPassword("old-password");
        request.setNewPassword("new-password-123");
        request.setConfirmPassword("new-password-123");
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());
        when(passwordEncoder.matches("old-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.encode("new-password-123")).thenReturn("new-hash");
        when(userAccountRepository.save(user)).thenReturn(user);

        controller.changeCurrentUserPassword("1", request, new MockHttpServletRequest());

        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        assertThat(user.getPasswordChangedAt()).isNotNull();
        assertThat(user.getUpdatedAt()).isNotNull();
        verify(userAccountRepository).save(user);
        verify(auditEventRepository).save(any(AuditEvent.class));
    }

    @Test
    void changeCurrentUserPasswordRejectsPasswordBelowConfiguredComplexity() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("old-hash")
                .displayName("系统管理员")
                .build();
        AuthController.PasswordChangeRequest request = new AuthController.PasswordChangeRequest();
        request.setCurrentPassword("old-password");
        request.setNewPassword("simple");
        request.setConfirmPassword("simple");
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(SystemSetting.builder()
                .tenantId("default")
                .passwordComplexity("HIGH")
                .build()));

        assertThatThrownBy(() -> controller.changeCurrentUserPassword("1", request, new MockHttpServletRequest()))
                .hasMessageContaining("登录密码复杂度不足");

        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void changeCurrentUserPasswordRejectsWrongCurrentPasswordAndMismatchedConfirmation() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("old-hash")
                .displayName("系统管理员")
                .build();
        AuthController.PasswordChangeRequest wrongPasswordRequest = new AuthController.PasswordChangeRequest();
        wrongPasswordRequest.setCurrentPassword("bad-password");
        wrongPasswordRequest.setNewPassword("new-password-123");
        wrongPasswordRequest.setConfirmPassword("new-password-123");
        AuthController.PasswordChangeRequest mismatchRequest = new AuthController.PasswordChangeRequest();
        mismatchRequest.setCurrentPassword("old-password");
        mismatchRequest.setNewPassword("new-password-123");
        mismatchRequest.setConfirmPassword("different-password");
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad-password", "old-hash")).thenReturn(false);

        assertThatThrownBy(() -> controller.changeCurrentUserPassword("1", wrongPasswordRequest, new MockHttpServletRequest()))
                .hasMessageContaining("当前密码不正确");
        assertThatThrownBy(() -> controller.changeCurrentUserPassword("1", mismatchRequest, new MockHttpServletRequest()))
                .hasMessageContaining("两次输入的新密码不一致");
        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

    @Test
    void createPersonalSignatureRejectsWrongPassword() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .build();
        AuthController.PersonalSignatureRequest request = new AuthController.PersonalSignatureRequest();
        request.setSignaturePassword("signature-password");
        request.setLoginPassword("bad-password");
        request.setMeaning("个人设置确认");
        attachValidSignatureEvidence(request);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("bad-password", "hash")).thenReturn(false);

        assertThatThrownBy(() -> controller.createPersonalSignature("1", request, new MockHttpServletRequest()))
                .hasMessageContaining("当前系统登录密码错误");
    }

    @Test
    void createPersonalSignatureReauthenticatesStoresSignatureAndWritesAudit() throws java.io.IOException {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .email("admin@example.com")
                .phone("13814083773")
                .avatarFileId(501L)
                .birthday(LocalDate.of(1990, 1, 2))
                .build();
        AuthController.PersonalSignatureRequest request = new AuthController.PersonalSignatureRequest();
        request.setSignaturePassword("signature-password");
        request.setLoginPassword("correct-login-password");
        request.setMeaning("个人设置确认");
        attachValidSignatureEvidence(request);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-login-password", "hash")).thenReturn(true);
        when(passwordEncoder.encode("signature-password")).thenReturn("encoded-signature-password");
        when(userDepartmentRepository.findByUserId(1L)).thenReturn(List.of(
                UserDepartment.builder().userId(1L).departmentId(40L).isPrimary(true).build()));
        when(departmentRepository.findAllById(List.of(40L))).thenReturn(List.of(
                Department.builder().id(40L).tenantId(0L).parentId(20L).name("验证组").build()));
        when(departmentRepository.findById(20L)).thenReturn(Optional.of(
                Department.builder().id(20L).tenantId(0L).parentId(10L).name("研发部").build()));
        when(departmentRepository.findById(10L)).thenReturn(Optional.of(
                Department.builder().id(10L).tenantId(0L).name("公司").build()));
        mockSignatureEvidenceFiles();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.of(SystemSetting.builder()
                .tenantId("default")
                .signatureChangeCycleEnabled(true)
                .signatureChangeCycleDays(7)
                .build()));
        when(idGenerator.nextId()).thenReturn(7001L, 7002L, 8001L);
        when(signatureRepository.save(any(Signature.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createPersonalSignature("1", request, new MockHttpServletRequest());

        ArgumentCaptor<FileObject> fileCaptor = ArgumentCaptor.forClass(FileObject.class);
        verify(fileObjectRepository).save(fileCaptor.capture());
        FileObject noticeFile = fileCaptor.getValue();
        assertThat(noticeFile.getId()).isEqualTo(7002L);
        assertThat(noticeFile.getOriginalName()).isEqualTo("电子签名授权通知书-admin.pdf");
        assertThat(noticeFile.getMimeType()).isEqualTo("application/pdf");
        assertThat(noticeFile.getTargetType()).isEqualTo("SIGNATURE_AUTHORIZATION_NOTICE");
        assertThat(noticeFile.getTargetId()).isEqualTo("1");
        assertThat(noticeFile.getUploadedBy()).isEqualTo("1");
        assertThat(noticeFile.getFileSize()).isPositive();
        byte[] noticePdfBytes = Files.readAllBytes(Path.of(noticeFile.getStoredPath()));

        ArgumentCaptor<Signature> signatureCaptor = ArgumentCaptor.forClass(Signature.class);
        verify(signatureRepository).save(signatureCaptor.capture());
        Signature signature = signatureCaptor.getValue();
        assertThat(signature.getId()).isEqualTo(7001L);
        assertThat(signature.getSignatureKey()).startsWith("ESIGN-");
        assertThat(signature.getTargetType()).isEqualTo("USER_PROFILE");
        assertThat(signature.getTargetId()).isEqualTo("1");
        assertThat(signature.getMeaning()).isEqualTo("个人设置确认");
        assertThat(signature.getSignerId()).isEqualTo("1");
        assertThat(signature.getSignerName()).isEqualTo("系统管理员");
        assertThat(signature.getAuthMethod()).isEqualTo("PASSWORD");
        assertThat(signature.getSignaturePasswordHash()).isEqualTo("encoded-signature-password");
        assertThat(signature.getAuthEventRef()).startsWith("PASSWORD_REAUTH:HANDWRITTEN_SIGNATURE_ID_CARD:");
        assertThat(signature.getSnapshotHash()).hasSize(64);
        assertThat(signature.getSnapshotData()).contains("\"birthday\":\"1990-01-02\"");
        assertThat(signature.getSnapshotData()).contains("\"organizationName\":\"公司/研发部/验证组\"");
        assertThat(signature.getSnapshotData()).contains("\"signatureImage\"");
        assertThat(signature.getSnapshotData()).contains("\"idCardFront\"");
        assertThat(signature.getSnapshotData()).contains("\"idCardBack\"");
        assertThat(signature.getSnapshotData()).contains("\"statements\"");
        assertThat(signature.getSnapshotData()).contains("\"confirmed\":true");
        assertThat(signature.getSnapshotData()).contains("\"authMethod\":\"PASSWORD+HANDWRITTEN_SIGNATURE+ID_CARD\"");
        assertThat(signature.getSignedAt()).isNotNull();
        assertThat(signature.getCertifiedAt()).isEqualTo(signature.getSignedAt());
        assertThat(signature.getCertifiedAtEpoch()).isNotNull();
        assertThat(signature.getExpiresAt()).isEqualTo(signature.getSignedAt().plusDays(7));
        assertThat(signature.getExpiresAtEpoch()).isEqualTo(signature.getExpiresAt()
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli());
        assertThat(signature.getAuthorizationNoticeFileId()).isEqualTo(7002L);
        assertAuthorizationNoticePdfContainsRequiredEvidence(noticePdfBytes, signature, request);

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        auditCaptor.getValue().sealSnapshotHash();
        assertThat(auditCaptor.getValue().getId()).isEqualTo(8001L);
        assertThat(auditCaptor.getValue().getAction()).isEqualTo("SIGN");
        assertThat(auditCaptor.getValue().getFunctionName()).isEqualTo("电子签名认证");
        assertThat(auditCaptor.getValue().getSnapshotHash()).hasSize(64);
        assertThat(auditCaptor.getValue().getContentAfter()).contains("\"organizationName\":\"公司/研发部/验证组\"");
        assertThat(response.getData().get("signatureId")).isEqualTo("7001");
        assertThat(response.getData().get("signatureKey")).isEqualTo(signature.getSignatureKey());
        assertThat(response.getData().get("certifiedAt")).isEqualTo(signature.getCertifiedAt().toString());
        assertThat(response.getData().get("certifiedAtEpoch")).isEqualTo(signature.getCertifiedAtEpoch());
        assertThat(response.getData().get("expiresAt")).isEqualTo(signature.getExpiresAt().toString());
        assertThat(response.getData().get("expiresAtEpoch")).isEqualTo(signature.getExpiresAtEpoch());
        assertThat(response.getData().get("authorizationNoticeFileId")).isEqualTo("7002");
        verify(passwordEncoder).matches("correct-login-password", "hash");
        verify(passwordEncoder).encode("signature-password");
        verify(idCardOcrService, never()).validateIdCardFront(any(FileObject.class));
        verify(idCardOcrService, never()).validateIdCardBack(any(FileObject.class));
    }

    @Test
    void createPersonalSignatureUsesSecuritySettingsDefaultCycleWhenNoSettingsPersisted() throws java.io.IOException {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .build();
        AuthController.PersonalSignatureRequest request = new AuthController.PersonalSignatureRequest();
        request.setSignaturePassword("signature-password");
        request.setLoginPassword("correct-login-password");
        request.setMeaning("个人设置确认");
        attachValidSignatureEvidence(request);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-login-password", "hash")).thenReturn(true);
        when(passwordEncoder.encode("signature-password")).thenReturn("encoded-signature-password");
        mockSignatureEvidenceFiles();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());
        when(idGenerator.nextId()).thenReturn(7001L, 7002L, 8001L);
        when(signatureRepository.save(any(Signature.class))).thenAnswer(invocation -> invocation.getArgument(0));

        controller.createPersonalSignature("1", request, new MockHttpServletRequest());

        ArgumentCaptor<Signature> signatureCaptor = ArgumentCaptor.forClass(Signature.class);
        verify(signatureRepository).save(signatureCaptor.capture());
        Signature signature = signatureCaptor.getValue();
        assertThat(signature.getExpiresAt()).isEqualTo(signature.getSignedAt().plusDays(30));
    }

    @Test
    void createPersonalSignatureSkipsIdCardOcrWhenCertificationEvidenceIsUploaded() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .passwordHash("hash")
                .displayName("系统管理员")
                .build();
        AuthController.PersonalSignatureRequest request = new AuthController.PersonalSignatureRequest();
        request.setSignaturePassword("signature-password");
        request.setLoginPassword("correct-login-password");
        request.setMeaning("个人设置确认");
        attachValidSignatureEvidence(request);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct-login-password", "hash")).thenReturn(true);
        when(passwordEncoder.encode("signature-password")).thenReturn("encoded-signature-password");
        mockSignatureEvidenceFiles();
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());
        when(idGenerator.nextId()).thenReturn(7001L, 7002L, 8001L);
        when(signatureRepository.save(any(Signature.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.createPersonalSignature("1", request, new MockHttpServletRequest());

        assertThat(response.getData().get("signatureId")).isEqualTo("7001");
        verify(idCardOcrService, never()).validateIdCardFront(any(FileObject.class));
        verify(idCardOcrService, never()).validateIdCardBack(any(FileObject.class));
        verify(signatureRepository).save(any(Signature.class));
    }

    private void attachValidSignatureEvidence(AuthController.PersonalSignatureRequest request) {
        request.setSignatureImageFileId("901");
        request.setIdCardFrontFileId("902");
        request.setIdCardBackFileId("903");
        request.setStatements(List.of(
                confirmedStatement("exclusiveControl", "账号由本人专属持有"),
                confirmedStatement("authorizedUse", "授权用于合规操作"),
                confirmedStatement("legalEffect", "本人承担签署责任")
        ));
    }

    private AuthController.SignatureStatementRequest confirmedStatement(String key, String text) {
        AuthController.SignatureStatementRequest statement = new AuthController.SignatureStatementRequest();
        statement.setKey(key);
        statement.setText(text);
        statement.setConfirmed(true);
        return statement;
    }

    private void mockSignatureEvidenceFiles() {
        when(fileObjectRepository.findById(901L)).thenReturn(Optional.of(signatureEvidenceFile(901L, "handwritten-signature.png")));
        when(fileObjectRepository.findById(902L)).thenReturn(Optional.of(signatureEvidenceFile(902L, "id-card-front.png")));
        when(fileObjectRepository.findById(903L)).thenReturn(Optional.of(signatureEvidenceFile(903L, "id-card-back.png")));
    }

    private FileObject signatureEvidenceFile(Long id, String name) {
        Path imagePath;
        try {
            imagePath = Files.createTempFile("signature-evidence-" + id, ".png");
            BufferedImage image = new BufferedImage(16, 10, BufferedImage.TYPE_INT_RGB);
            int color = id.equals(902L) ? 0xD8ECFF : 0xFFE5D8;
            for (int x = 0; x < image.getWidth(); x++) {
                for (int y = 0; y < image.getHeight(); y++) {
                    image.setRGB(x, y, color);
                }
            }
            ImageIO.write(image, "png", imagePath.toFile());
        } catch (java.io.IOException e) {
            throw new IllegalStateException(e);
        }
        return FileObject.builder()
                .id(id)
                .originalName(name)
                .storedPath(imagePath.toString())
                .mimeType("image/png")
                .fileSize(1024L)
                .md5Hash("md5-" + id)
                .targetType("SIGNATURE_EVIDENCE")
                .targetId("1")
                .uploadedBy("1")
                .build();
    }

    private void assertAuthorizationNoticePdfContainsRequiredEvidence(
            byte[] pdfBytes,
            Signature signature,
            AuthController.PersonalSignatureRequest request) throws java.io.IOException {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            String text = new PDFTextStripper().getText(document);
            assertThat(text).contains("授权通知书");
            assertThat(text).contains("授权人姓名");
            assertThat(text).contains("系统管理员");
            assertThat(text).contains("授权人系统账号");
            assertThat(text).contains("admin");
            assertThat(text).contains("授权告知");
            assertThat(text).contains("已勾选");
            assertThat(text).contains("授权人身份证正面");
            assertThat(text).contains("授权人身份证反面");
            assertThat(text).contains("授权人签字");
            assertThat(text).contains("账号由本人专属持有");
            assertThat(text).contains("授权用于合规操作");
            assertThat(text).contains("本人承担签署责任");
            assertThat(text).contains("授权认证时间");
            assertThat(text).contains(signature.getCertifiedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            assertThat(text).contains("授权截止时间");
            assertThat(text).contains(signature.getExpiresAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            assertThat(text).contains("快照指纹");
            assertThat(text).contains(signature.getSnapshotHash());
            assertThat(text).contains("授权认证时间戳");
            assertThat(text).contains(String.valueOf(signature.getCertifiedAtEpoch()));
            assertThat(text).contains("授权截止时间戳");
            assertThat(text).contains(String.valueOf(signature.getExpiresAtEpoch()));
            assertThat(countPdfImages(document)).isGreaterThanOrEqualTo(3);
        }
    }

    private int countPdfImages(PDDocument document) throws java.io.IOException {
        int count = 0;
        for (PDPage page : document.getPages()) {
            PDResources resources = page.getResources();
            if (resources == null) continue;
            Iterator<org.apache.pdfbox.cos.COSName> names = resources.getXObjectNames().iterator();
            while (names.hasNext()) {
                if (resources.getXObject(names.next()) instanceof PDImageXObject) {
                    count++;
                }
            }
        }
        return count;
    }

    @Test
    void meDoesNotReturnRawRoleIdAsRoleNameWhenRoleIsUnmapped() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("admin")
                .displayName("系统管理员")
                .email("admin@example.com")
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(
                UserRole.builder().userId(1L).roleId(341646126926241792L).build()));
        when(roleRepository.findAllById(List.of(341646126926241792L))).thenReturn(List.of());
        when(rolePermissionRepository.findByRoleIdIn(List.of(341646126926241792L))).thenReturn(List.of());
        when(gctPermissionCatalog.findCodesByIds(List.of())).thenReturn(List.of());

        var response = controller.me("1");
        var data = response.getData();

        assertThat(data.get("roleIds")).isEqualTo(List.of("341646126926241792"));
        assertThat(data.get("roleNames")).isEqualTo(List.of());
        assertThat(data.get("permissions")).isEqualTo(List.of());
    }

    @Test
    void loginDoesNotReturnRawRoleIdAsRoleNameWhenRoleIsUnmapped() {
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
                UserRole.builder().userId(1L).roleId(341646126926241792L).build()));
        when(roleRepository.findAllById(List.of(341646126926241792L))).thenReturn(List.of());
        when(rolePermissionRepository.findByRoleIdIn(List.of(341646126926241792L))).thenReturn(List.of());
        when(gctPermissionCatalog.findCodesByIds(List.of())).thenReturn(List.of());
        when(systemSettingRepository.findByTenantId("default")).thenReturn(Optional.empty());
        when(jwtTokenProvider.generateToken("1", "admin", "系统管理员", 480)).thenReturn("compact-token");

        var response = controller.login(request, new MockHttpServletRequest());
        @SuppressWarnings("unchecked")
        var data = (java.util.Map<String, Object>) response.getData();
        @SuppressWarnings("unchecked")
        var userPayload = (java.util.Map<String, Object>) data.get("user");

        assertThat(userPayload.get("roleIds")).isEqualTo(List.of("341646126926241792"));
        assertThat(userPayload.get("roleNames")).isEqualTo(List.of());
    }
}
