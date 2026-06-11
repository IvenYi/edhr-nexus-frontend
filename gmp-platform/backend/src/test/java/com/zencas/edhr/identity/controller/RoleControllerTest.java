package com.zencas.edhr.identity.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.Permission;
import com.zencas.edhr.identity.entity.Role;
import com.zencas.edhr.identity.entity.RolePermission;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.PermissionRepository;
import com.zencas.edhr.identity.repository.RolePermissionRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.zencas.edhr.identity.service.GctPermissionCatalog;
import org.junit.jupiter.api.AfterEach;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleControllerTest {

    @Mock private RoleRepository roleRepository;
    @Mock private RolePermissionRepository rolePermissionRepository;
    @Mock private PermissionRepository permissionRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private UserAccountRepository userAccountRepository;
    @Mock private GctPermissionCatalog gctPermissionCatalog;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks private RoleController controller;

    @AfterEach
    void clearAuditContext() {
        AuditContext.clear();
    }

    @Test
    void listReturnsRoleIdsAsStringsToPreserveSnowflakePrecision() {
        PageRequest pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        LocalDateTime createdAt = LocalDateTime.of(2026, 6, 11, 9, 30);
        Role role = Role.builder()
                .id(1781105741435L)
                .tenantId(1L)
                .code("QA_ROLE")
                .name("QA角色")
                .createdAt(createdAt)
                .build();
        when(roleRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(role), pageable, 1));

        var response = controller.list(1, 20, "createdAt", "desc");
        var item = response.getData().getContent().get(0);
        Object id = item.getId();

        assertThat(id).isInstanceOf(String.class);
        assertThat(id).isEqualTo("1781105741435");
        assertThat(item)
                .hasFieldOrPropertyWithValue("createdBy", "系统管理员")
                .hasFieldOrPropertyWithValue("createdAt", createdAt)
                .hasFieldOrPropertyWithValue("updatedBy", "系统管理员")
                .hasFieldOrPropertyWithValue("updatedAt", createdAt)
                .hasFieldOrPropertyWithValue("isBuiltin", false);
    }

    @Test
    void createAutoGeneratesRoleCodeAndWritesCreateAudit() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        when(idGenerator.nextId()).thenReturn(1781105741435L, 1781105741436L);
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = controller.create(Role.builder()
                .name("QA角色")
                .build());
        Object id = response.getData().getId();

        assertThat(id).isInstanceOf(String.class);
        assertThat(id).isEqualTo("1781105741435");
        assertThat(response.getData().getCode()).isEqualTo("ROLE_1781105741435");

        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleRepository).save(roleCaptor.capture());
        assertThat(roleCaptor.getValue().getCode()).isEqualTo("ROLE_1781105741435");

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("ROLE");
        assertThat(event.getEntityId()).isEqualTo("1781105741435");
        assertThat(event.getAction()).isEqualTo("CREATE");
        assertThat(event.getOperatorName()).isEqualTo("系统管理员");
        JsonNode after = objectMapper.readTree(event.getContentAfter());
        assertThat(after.get("code").asText()).isEqualTo("ROLE_1781105741435");
        assertThat(after.get("name").asText()).isEqualTo("QA角色");
    }

    @Test
    void updatePreservesExistingCodeAndWritesOnlyChangedAuditFields() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        Role existing = Role.builder()
                .id(10L)
                .tenantId(1L)
                .code("KEEP_ROLE")
                .name("旧岗位")
                .description("旧描述")
                .createdAt(LocalDateTime.of(2026, 6, 10, 9, 0))
                .build();
        Role request = Role.builder()
                .code("SHOULD_IGNORE")
                .name("新岗位")
                .description("新描述")
                .build();
        when(roleRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(roleRepository.save(existing)).thenReturn(existing);
        when(idGenerator.nextId()).thenReturn(200L);

        var response = controller.update(10L, request);

        assertThat(existing.getCode()).isEqualTo("KEEP_ROLE");
        assertThat(response.getData().getCode()).isEqualTo("KEEP_ROLE");
        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("ROLE");
        assertThat(event.getEntityId()).isEqualTo("10");
        assertThat(event.getAction()).isEqualTo("UPDATE");

        JsonNode before = objectMapper.readTree(event.getContentBefore());
        JsonNode after = objectMapper.readTree(event.getContentAfter());
        assertThat(before.has("code")).isFalse();
        assertThat(after.has("code")).isFalse();
        assertThat(before.get("name").asText()).isEqualTo("旧岗位");
        assertThat(after.get("name").asText()).isEqualTo("新岗位");
        assertThat(before.get("description").asText()).isEqualTo("旧描述");
        assertThat(after.get("description").asText()).isEqualTo("新描述");
    }

    @Test
    void systemAdministratorRoleIsMarkedAsBuiltIn() {
        Role adminRole = Role.builder()
                .id(1L)
                .tenantId(1L)
                .code("ADMIN")
                .name("系统管理员")
                .createdAt(LocalDateTime.of(2026, 6, 11, 9, 30))
                .build();
        when(roleRepository.findById(1L)).thenReturn(Optional.of(adminRole));

        var response = controller.getById(1L);

        assertThat(response.getData().getIsBuiltin()).isTrue();
    }

    @Test
    void deleteRejectsSystemAdministratorRole() {
        Role adminRole = Role.builder()
                .id(1L)
                .tenantId(1L)
                .code("ADMIN")
                .name("系统管理员")
                .build();
        when(roleRepository.findById(1L)).thenReturn(Optional.of(adminRole));

        assertThatThrownBy(() -> controller.delete(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("系统管理员角色不允许删除");

        verify(rolePermissionRepository, never()).deleteByRoleId(anyLong());
        verify(roleRepository, never()).deleteById(anyLong());
    }

    @Test
    void deleteDisablesAssignedUsersAndClearsTheirRoles() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        Role role = Role.builder()
                .id(10L)
                .tenantId(1L)
                .code("QA_ROLE")
                .name("QA角色")
                .build();
        Role secondaryRole = Role.builder()
                .id(20L)
                .tenantId(1L)
                .code("SECONDARY_ROLE")
                .name("备用角色")
                .build();
        UserAccount firstUser = UserAccount.builder()
                .id(100L)
                .tenantId(1L)
                .username("wsg")
                .displayName("王三工")
                .status("ACTIVE")
                .build();
        UserAccount secondUser = UserAccount.builder()
                .id(101L)
                .tenantId(1L)
                .username("test")
                .displayName("测试账号")
                .status("ACTIVE")
                .build();
        when(roleRepository.findById(10L)).thenReturn(Optional.of(role));
        when(userRoleRepository.findByRoleId(10L)).thenReturn(List.of(
                UserRole.builder().userId(100L).roleId(10L).build(),
                UserRole.builder().userId(101L).roleId(10L).build()));
        when(userRoleRepository.findByUserIdIn(List.of(100L, 101L))).thenReturn(List.of(
                UserRole.builder().userId(100L).roleId(10L).build(),
                UserRole.builder().userId(100L).roleId(20L).build(),
                UserRole.builder().userId(101L).roleId(10L).build()));
        when(roleRepository.findAllById(List.of(10L, 20L))).thenReturn(List.of(role, secondaryRole));
        when(userAccountRepository.findAllById(List.of(100L, 101L))).thenReturn(List.of(firstUser, secondUser));
        when(idGenerator.nextId()).thenReturn(500L, 501L);

        controller.delete(10L);

        ArgumentCaptor<List<UserAccount>> usersCaptor = ArgumentCaptor.forClass(List.class);
        verify(userAccountRepository).saveAll(usersCaptor.capture());
        assertThat(usersCaptor.getValue())
                .extracting(UserAccount::getId, UserAccount::getStatus)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(100L, "DISABLED"),
                        org.assertj.core.groups.Tuple.tuple(101L, "DISABLED"));

        verify(userRoleRepository).deleteByUserId(100L);
        verify(userRoleRepository).deleteByUserId(101L);
        verify(rolePermissionRepository).deleteByRoleId(10L);
        verify(roleRepository).deleteById(10L);

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, times(2)).save(auditCaptor.capture());
        List<AuditEvent> auditEvents = auditCaptor.getAllValues();
        assertThat(auditEvents)
                .extracting(AuditEvent::getEntityType, AuditEvent::getEntityId, AuditEvent::getAction, AuditEvent::getOperatorName)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("USER_ACCOUNT", "100", "UPDATE", "系统管理员"),
                        org.assertj.core.groups.Tuple.tuple("USER_ACCOUNT", "101", "UPDATE", "系统管理员"));

        JsonNode firstBefore = objectMapper.readTree(auditEvents.getFirst().getContentBefore());
        JsonNode firstAfter = objectMapper.readTree(auditEvents.getFirst().getContentAfter());
        assertThat(firstBefore.get("status").asText()).isEqualTo("ACTIVE");
        assertThat(firstAfter.get("status").asText()).isEqualTo("DISABLED");
        assertThat(firstBefore.has("roleIds")).isFalse();
        assertThat(firstAfter.has("roleIds")).isFalse();
        assertThat(firstBefore.get("roles"))
                .extracting(JsonNode::asText)
                .containsExactly("QA角色", "备用角色");
        assertThat(firstAfter.get("roles")).isEmpty();
    }

    @Test
    void listAssignablePermissionsReturnsPagedPermissionDataForRoleAssignment() {
        Permission permission = Permission.builder()
                .id(60L)
                .code("system")
                .name("系统管理")
                .type("PAGE")
                .sortOrder(1)
                .build();
        Permission gctPermission = Permission.builder()
                .id(-7_001L)
                .code("gct-edhr.operation-panel.workbench.workbench-1-1")
                .name("GCT / 工作台")
                .type("PAGE")
                .sortOrder(10_001)
                .build();
        when(permissionRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder"))).thenReturn(List.of(permission));
        when(gctPermissionCatalog.listPermissions()).thenReturn(List.of(gctPermission));

        var response = controller.listAssignablePermissions(1, 50, "sortOrder", "asc");

        assertThat(response.getData().getContent()).containsExactly(permission, gctPermission);
        assertThat(response.getData().getTotalElements()).isEqualTo(2);
    }

    @Test
    void updatePermissionsReplacesRolePermissionBindings() {
        when(roleRepository.existsById(10L)).thenReturn(true);
        when(idGenerator.nextId()).thenReturn(100L, 101L, 102L);

        var response = controller.updatePermissions(
                10L,
                new RoleController.RolePermissionRequest(List.of(60L, 61L)));

        verify(rolePermissionRepository).deleteByRoleId(10L);
        var rolePermissionOrder = inOrder(rolePermissionRepository);
        rolePermissionOrder.verify(rolePermissionRepository).deleteByRoleId(10L);
        rolePermissionOrder.verify(rolePermissionRepository).flush();
        rolePermissionOrder.verify(rolePermissionRepository).saveAll(any());
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<RolePermission>> captor = ArgumentCaptor.forClass(List.class);
        verify(rolePermissionRepository).saveAll(captor.capture());
        assertThat(captor.getValue())
                .extracting(RolePermission::getRoleId, RolePermission::getPermissionId)
                .containsExactlyInAnyOrder(
                        org.assertj.core.groups.Tuple.tuple(10L, 60L),
                        org.assertj.core.groups.Tuple.tuple(10L, 61L));
        assertThat(response.getData()).containsExactly(60L, 61L);
    }

    @Test
    void updatePermissionsWritesAuditWhenPermissionBindingsChange() throws Exception {
        AuditContext.setOperator("99", "系统管理员");
        when(roleRepository.existsById(10L)).thenReturn(true);
        lenient().when(rolePermissionRepository.findByRoleId(10L)).thenReturn(List.of(
                RolePermission.builder().roleId(10L).permissionId(60L).build()));
        when(idGenerator.nextId()).thenReturn(100L, 101L, 102L);

        controller.updatePermissions(
                10L,
                new RoleController.RolePermissionRequest(List.of(60L, 61L)));

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(auditCaptor.capture());
        AuditEvent event = auditCaptor.getValue();
        assertThat(event.getEntityType()).isEqualTo("ROLE");
        assertThat(event.getEntityId()).isEqualTo("10");
        assertThat(event.getAction()).isEqualTo("UPDATE");
        assertThat(event.getOperatorName()).isEqualTo("系统管理员");

        JsonNode before = objectMapper.readTree(event.getContentBefore());
        JsonNode after = objectMapper.readTree(event.getContentAfter());
        assertThat(before.get("permissionIds"))
                .extracting(JsonNode::asLong)
                .containsExactly(60L);
        assertThat(after.get("permissionIds"))
                .extracting(JsonNode::asLong)
                .containsExactly(60L, 61L);
    }
}
