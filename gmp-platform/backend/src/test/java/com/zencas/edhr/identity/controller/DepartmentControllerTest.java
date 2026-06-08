package com.zencas.edhr.identity.controller;

import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.entity.Department;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.DepartmentRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DepartmentControllerTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private UserDepartmentRepository userDepartmentRepository;
    @Mock private UserAccountRepository userAccountRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private SnowflakeIdGenerator idGenerator;

    @InjectMocks private DepartmentController controller;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void treeSerializesSnowflakeIdsAsStringsToPreserveFrontendPrecision() {
        long rootId = 9_007_199_254_740_993L;
        long childId = 9_007_199_254_740_995L;
        Department root = Department.builder()
                .id(rootId)
                .tenantId(1L)
                .code("ROOT")
                .name("Root")
                .sortOrder(0)
                .build();
        Department child = Department.builder()
                .id(childId)
                .tenantId(1L)
                .parentId(rootId)
                .code("CHILD")
                .name("Child")
                .sortOrder(0)
                .build();
        when(departmentRepository.findAll(any(Sort.class))).thenReturn(List.of(root, child));
        when(userDepartmentRepository.findAll()).thenReturn(List.of());
        when(userAccountRepository.findAllById(any())).thenReturn(List.of());

        List<DepartmentController.DepartmentNode> tree = controller.tree().getData();

        assertThat(tree).hasSize(1);
        assertThat(tree.getFirst().getId()).isEqualTo(String.valueOf(rootId));
        assertThat(tree.getFirst().getChildren()).hasSize(1);
        assertThat(tree.getFirst().getChildren().getFirst().getId()).isEqualTo(String.valueOf(childId));
        assertThat(tree.getFirst().getChildren().getFirst().getParentId()).isEqualTo(String.valueOf(rootId));
    }

    @Test
    void treeIncludesUserDetailsAndRelationshipsForOrganizationPersonnelPanel() {
        long departmentId = 9_007_199_254_740_993L;
        long userId = 9_007_199_254_740_995L;
        long roleId = 9_007_199_254_740_997L;
        LocalDateTime createdAt = LocalDateTime.parse("2026-06-08T10:00:00");
        Department department = Department.builder()
                .id(departmentId)
                .tenantId(1L)
                .code("QA")
                .name("质量部")
                .sortOrder(0)
                .build();
        UserAccount user = UserAccount.builder()
                .id(userId)
                .tenantId(1L)
                .username("qa01")
                .displayName("质量员")
                .email("qa01@example.com")
                .phone("13800000000")
                .status("ACTIVE")
                .passwordHash("encoded")
                .createdAt(createdAt)
                .build();
        UserDepartment membership = UserDepartment.builder()
                .id(1L)
                .userId(userId)
                .departmentId(departmentId)
                .isPrimary(true)
                .build();
        UserRole role = UserRole.builder()
                .id(2L)
                .userId(userId)
                .roleId(roleId)
                .build();
        when(departmentRepository.findAll(any(Sort.class))).thenReturn(List.of(department));
        when(userDepartmentRepository.findAll()).thenReturn(List.of(membership));
        when(userAccountRepository.findAllById(any())).thenReturn(List.of(user));
        when(userRoleRepository.findByUserIdIn(any())).thenReturn(List.of(role));

        DepartmentController.UserSummary summary = controller.tree().getData().getFirst().getUsers().getFirst();

        assertThat(summary.getId()).isEqualTo(String.valueOf(userId));
        assertThat(summary.getUsername()).isEqualTo("qa01");
        assertThat(summary.getDisplayName()).isEqualTo("质量员");
        assertThat(summary.getEmail()).isEqualTo("qa01@example.com");
        assertThat(summary.getPhone()).isEqualTo("13800000000");
        assertThat(summary.getStatus()).isEqualTo("ACTIVE");
        assertThat(summary.getCreatedAt()).isEqualTo(createdAt);
        assertThat(summary.getRoleIds()).containsExactly(String.valueOf(roleId));
        assertThat(summary.getDepartmentIds()).containsExactly(String.valueOf(departmentId));
        assertThat(summary.getPrimaryDepartmentId()).isEqualTo(String.valueOf(departmentId));
    }

    @Test
    void createSerializesSavedSnowflakeIdAsString() {
        long createdId = 9_007_199_254_740_997L;
        Department request = Department.builder()
                .parentId(9_007_199_254_740_993L)
                .code("NEW_CHILD")
                .name("New Child")
                .build();
        when(idGenerator.nextId()).thenReturn(createdId);
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentController.DepartmentNode created = controller.create(request).getData();

        assertThat(created.getId()).isEqualTo(String.valueOf(createdId));
        assertThat(created.getParentId()).isEqualTo("9007199254740993");
        assertThat(created.getTenantId()).isEqualTo("1");
    }

    @Test
    void createAcceptsParentIdFromJsonString() throws Exception {
        long parentId = 9_007_199_254_740_993L;
        Department request = objectMapper.readValue("""
                {
                  "code": "NEW_CHILD",
                  "name": "New Child",
                  "parentId": "9007199254740993"
                }
                """, Department.class);
        when(idGenerator.nextId()).thenReturn(9_007_199_254_740_997L);
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentController.DepartmentNode created = controller.create(request).getData();

        assertThat(request.getParentId()).isEqualTo(parentId);
        assertThat(created.getParentId()).isEqualTo(String.valueOf(parentId));
    }

    @Test
    void createGeneratesCodeWhenRequestOmitsCode() {
        long createdId = 9_007_199_254_740_997L;
        Department request = Department.builder()
                .parentId(9_007_199_254_740_993L)
                .name("New Child")
                .build();
        when(idGenerator.nextId()).thenReturn(createdId);
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentController.DepartmentNode created = controller.create(request).getData();

        assertThat(created.getCode()).isEqualTo("ORG-9007199254740997");
    }

    @Test
    void updatePreservesExistingMetadataWhenEditingBasicFields() {
        long id = 9_007_199_254_740_997L;
        LocalDateTime createdAt = LocalDateTime.parse("2026-06-08T10:00:00");
        Department existing = Department.builder()
                .id(id)
                .tenantId(8L)
                .parentId(1L)
                .code("OLD")
                .name("Old")
                .sortOrder(42)
                .createdAt(createdAt)
                .build();
        DepartmentController.DepartmentRequest request = new DepartmentController.DepartmentRequest();
        request.setParentId(2L);
        request.setCode("NEW");
        request.setName("New");
        when(departmentRepository.findById(id)).thenReturn(Optional.of(existing));
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentController.DepartmentNode updated = controller.update(id, request).getData();

        assertThat(updated.getId()).isEqualTo(String.valueOf(id));
        assertThat(updated.getTenantId()).isEqualTo("8");
        assertThat(updated.getParentId()).isEqualTo("2");
        assertThat(existing.getCode()).isEqualTo("NEW");
        assertThat(existing.getName()).isEqualTo("New");
        assertThat(existing.getSortOrder()).isEqualTo(42);
        assertThat(existing.getCreatedAt()).isEqualTo(createdAt);
        assertThat(existing.getUpdatedAt()).isNotNull();
    }

    @Test
    void updatePreservesExistingCodeWhenRequestOmitsCode() {
        long id = 9_007_199_254_740_997L;
        Department existing = Department.builder()
                .id(id)
                .tenantId(1L)
                .parentId(1L)
                .code("KEEP_ME")
                .name("Old")
                .sortOrder(0)
                .build();
        DepartmentController.DepartmentRequest request = new DepartmentController.DepartmentRequest();
        request.setParentId(1L);
        request.setName("New");
        when(departmentRepository.findById(id)).thenReturn(Optional.of(existing));
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentController.DepartmentNode updated = controller.update(id, request).getData();

        assertThat(updated.getCode()).isEqualTo("KEEP_ME");
        assertThat(existing.getCode()).isEqualTo("KEEP_ME");
    }
}
