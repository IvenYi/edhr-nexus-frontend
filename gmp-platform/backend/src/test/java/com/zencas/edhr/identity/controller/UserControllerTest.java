package com.zencas.edhr.identity.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock private UserAccountRepository userAccountRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private UserDepartmentRepository userDepartmentRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks private UserController controller;

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void resetPasswordEncodesTheNewPasswordAndSavesTheUser() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("operator")
                .displayName("生产操作员")
                .passwordHash("old-hash")
                .status("ACTIVE")
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("NewPass@123")).thenReturn("encoded-password");

        controller.resetPassword(1L, new UserController.ResetPasswordRequest("NewPass@123"));

        assertThat(user.getPasswordHash()).isEqualTo("encoded-password");
        verify(userAccountRepository).save(user);
    }

    @Test
    void removeFromOrganizationClearsDepartmentMembershipsWithoutDeletingTheUserOrRoles() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .username("operator")
                .displayName("生产操作员")
                .status("ACTIVE")
                .build();
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));

        controller.removeFromOrganization(1L);

        verify(userDepartmentRepository).deleteByUserId(1L);
        verify(userRoleRepository, never()).deleteByUserId(1L);
        verify(userAccountRepository, never()).deleteById(1L);
    }

    @Test
    void createWritesAuditSnapshotForCreatedUser() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        UserController.UserRequest request = new UserController.UserRequest();
        request.setUsername("new-operator");
        request.setDisplayName("新增操作员");
        request.setEmail("new-operator@example.com");
        request.setPhone("13800000001");
        request.setStatus("ACTIVE");
        request.setRoleIds(List.of(10L));
        request.setDepartmentIds(List.of(20L));
        request.setPrimaryDepartmentId(20L);
        UserAccount saved = UserAccount.builder()
                .id(1L)
                .tenantId(1L)
                .username("new-operator")
                .displayName("新增操作员")
                .email("new-operator@example.com")
                .phone("13800000001")
                .passwordHash("hash")
                .status("ACTIVE")
                .build();
        when(userAccountRepository.existsByUsername("new-operator")).thenReturn(false);
        when(passwordEncoder.encode("Zencas@123")).thenReturn("hash");
        when(idGenerator.nextId()).thenReturn(1L, 101L, 102L, 103L);
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(saved);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(saved));
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(
                UserRole.builder().id(101L).userId(1L).roleId(10L).build()));
        when(userDepartmentRepository.findByUserId(1L)).thenReturn(List.of(
                UserDepartment.builder().id(102L).userId(1L).departmentId(20L).isPrimary(true).build()));
        when(auditEventRepository.save(any(AuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        controller.create(request);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        AuditEvent event = captor.getValue();
        assertThat(event.getEntityType()).isEqualTo("USER_ACCOUNT");
        assertThat(event.getEntityId()).isEqualTo("1");
        assertThat(event.getAction()).isEqualTo("CREATE");
        assertThat(event.getOperatorName()).isEqualTo("系统管理员");

        JsonNode before = objectMapper.readTree(event.getContentBefore());
        JsonNode after = objectMapper.readTree(event.getContentAfter());
        assertThat(before.size()).isZero();
        assertThat(after.get("username").asText()).isEqualTo("new-operator");
        assertThat(after.get("displayName").asText()).isEqualTo("新增操作员");
        assertThat(after.get("email").asText()).isEqualTo("new-operator@example.com");
        assertThat(after.get("phone").asText()).isEqualTo("13800000001");
        assertThat(after.get("status").asText()).isEqualTo("ACTIVE");
        assertThat(after.get("roleIds").get(0).asLong()).isEqualTo(10L);
        assertThat(after.get("departmentIds").get(0).asLong()).isEqualTo(20L);
        assertThat(after.get("primaryDepartmentId").asLong()).isEqualTo(20L);
    }

    @Test
    void updateFlushesDeletedMembershipsBeforeReinsertingRolesAndDepartments() {
        UserAccount user = UserAccount.builder()
                .id(1L)
                .tenantId(1L)
                .username("operator")
                .displayName("生产操作员")
                .passwordHash("hash")
                .status("ACTIVE")
                .build();
        UserController.UserRequest request = new UserController.UserRequest();
        request.setUsername("operator");
        request.setDisplayName("生产操作员");
        request.setStatus("ACTIVE");
        request.setRoleIds(List.of(10L));
        request.setDepartmentIds(List.of(20L));
        request.setPrimaryDepartmentId(20L);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userAccountRepository.save(user)).thenReturn(user);
        when(idGenerator.nextId()).thenReturn(101L, 102L);
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of());
        when(userDepartmentRepository.findByUserId(1L)).thenReturn(List.of());

        controller.update(1L, request);

        var roleOrder = inOrder(userRoleRepository);
        roleOrder.verify(userRoleRepository).deleteByUserId(1L);
        roleOrder.verify(userRoleRepository).flush();
        roleOrder.verify(userRoleRepository).saveAll(any());

        var departmentOrder = inOrder(userDepartmentRepository);
        departmentOrder.verify(userDepartmentRepository).deleteByUserId(1L);
        departmentOrder.verify(userDepartmentRepository).flush();
        departmentOrder.verify(userDepartmentRepository).saveAll(any());
    }

    @Test
    void updateWritesAuditDiffWithOnlyChangedUserFields() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        LocalDateTime createdAt = LocalDateTime.parse("2026-06-08T10:00:00");
        UserAccount user = UserAccount.builder()
                .id(1L)
                .tenantId(1L)
                .username("operator")
                .displayName("生产操作员")
                .email("operator@example.com")
                .phone("13800000000")
                .passwordHash("hash")
                .status("ACTIVE")
                .createdAt(createdAt)
                .build();
        UserController.UserRequest request = new UserController.UserRequest();
        request.setUsername("operator");
        request.setDisplayName("高级生产操作员");
        request.setEmail("operator@example.com");
        request.setPhone("13900000000");
        request.setStatus("DISABLED");
        request.setRoleIds(List.of(11L));
        request.setDepartmentIds(List.of(21L));
        request.setPrimaryDepartmentId(21L);
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRoleRepository.findByUserId(1L)).thenReturn(List.of(
                UserRole.builder().id(3L).userId(1L).roleId(10L).build()));
        when(userDepartmentRepository.findByUserId(1L)).thenReturn(List.of(
                UserDepartment.builder().id(4L).userId(1L).departmentId(20L).isPrimary(true).build()));
        when(userAccountRepository.save(user)).thenReturn(user);
        when(idGenerator.nextId()).thenReturn(101L, 102L, 103L);
        when(auditEventRepository.save(any(AuditEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        controller.update(1L, request);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        AuditEvent event = captor.getValue();
        assertThat(event.getEntityType()).isEqualTo("USER_ACCOUNT");
        assertThat(event.getEntityId()).isEqualTo("1");
        assertThat(event.getAction()).isEqualTo("UPDATE");
        assertThat(event.getOperatorName()).isEqualTo("系统管理员");

        JsonNode before = objectMapper.readTree(event.getContentBefore());
        JsonNode after = objectMapper.readTree(event.getContentAfter());
        assertThat(before.get("displayName").asText()).isEqualTo("生产操作员");
        assertThat(after.get("displayName").asText()).isEqualTo("高级生产操作员");
        assertThat(before.get("phone").asText()).isEqualTo("13800000000");
        assertThat(after.get("phone").asText()).isEqualTo("13900000000");
        assertThat(before.get("status").asText()).isEqualTo("ACTIVE");
        assertThat(after.get("status").asText()).isEqualTo("DISABLED");
        assertThat(before.get("roleIds")).hasSize(1);
        assertThat(before.get("roleIds").get(0).asLong()).isEqualTo(10L);
        assertThat(after.get("roleIds")).hasSize(1);
        assertThat(after.get("roleIds").get(0).asLong()).isEqualTo(11L);
        assertThat(before.get("departmentIds")).hasSize(1);
        assertThat(before.get("departmentIds").get(0).asLong()).isEqualTo(20L);
        assertThat(after.get("departmentIds")).hasSize(1);
        assertThat(after.get("departmentIds").get(0).asLong()).isEqualTo(21L);
        assertThat(before.get("primaryDepartmentId").asLong()).isEqualTo(20L);
        assertThat(after.get("primaryDepartmentId").asLong()).isEqualTo(21L);
        assertThat(before.has("username")).isFalse();
        assertThat(after.has("username")).isFalse();
        assertThat(before.has("email")).isFalse();
        assertThat(after.has("email")).isFalse();
    }
}
