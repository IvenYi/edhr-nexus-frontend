package com.zencas.edhr.identity.service;

import com.zencas.edhr.identity.dto.ResolvedSubjectUser;
import com.zencas.edhr.identity.dto.SubjectReference;
import com.zencas.edhr.identity.entity.Department;
import com.zencas.edhr.identity.entity.Role;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.entity.UserDepartment;
import com.zencas.edhr.identity.entity.UserRole;
import com.zencas.edhr.identity.repository.DepartmentRepository;
import com.zencas.edhr.identity.repository.RoleRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.repository.UserDepartmentRepository;
import com.zencas.edhr.identity.repository.UserRoleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubjectResolverTest {

    @Mock private UserAccountRepository userAccountRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private UserDepartmentRepository userDepartmentRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @InjectMocks private SubjectResolver resolver;

    @Test
    void deduplicatesUsersFromOverlappingParentChildDepartmentsAndKeepsSources() {
        Department parent = department(10L, null);
        Department child = department(11L, 10L);
        UserAccount user = user(100L);
        when(departmentRepository.findAll()).thenReturn(List.of(parent, child));
        when(userDepartmentRepository.findByDepartmentIdIn(Set.of(10L, 11L)))
                .thenReturn(List.of(
                        membership(100L, 10L),
                        membership(100L, 11L)));
        when(userAccountRepository.findAllById(Set.of(100L))).thenReturn(List.of(user));

        SubjectReference parentRef = new SubjectReference(SubjectReference.SubjectType.DEPARTMENT, 10L,
                SubjectReference.DepartmentScope.SELF_AND_CHILDREN);
        SubjectReference childRef = new SubjectReference(SubjectReference.SubjectType.DEPARTMENT, 11L,
                SubjectReference.DepartmentScope.SELF_AND_CHILDREN);

        var result = resolver.resolve(List.of(parentRef, childRef));

        assertThat(result.users()).hasSize(1);
        assertThat(result.users().get(0).userId()).isEqualTo(100L);
        assertThat(result.users().get(0).sources()).containsExactlyInAnyOrder(parentRef, childRef);
        assertThat(result.unresolvedSubjects()).isEmpty();
    }

    @Test
    void selfOnlyDepartmentDoesNotIncludeChildMembers() {
        Department parent = department(10L, null);
        Department child = department(11L, 10L);
        UserAccount parentUser = user(100L);
        UserAccount childUser = user(101L);
        when(departmentRepository.findAll()).thenReturn(List.of(parent, child));
        when(userDepartmentRepository.findByDepartmentIdIn(Set.of(10L)))
                .thenReturn(List.of(membership(100L, 10L)));
        when(userAccountRepository.findAllById(Set.of(100L))).thenReturn(List.of(parentUser));

        SubjectReference parentRef = new SubjectReference(SubjectReference.SubjectType.DEPARTMENT, 10L,
                SubjectReference.DepartmentScope.SELF_ONLY);

        var result = resolver.resolve(List.of(parentRef));

        assertThat(result.users()).extracting(ResolvedSubjectUser::userId).containsExactly(100L);
        assertThat(result.users()).noneMatch(item -> item.userId().equals(childUser.getId()));
        assertThat(result.unresolvedSubjects()).isEmpty();
    }

    @Test
    void resolvesDirectUsersAndRolesAndMarksMissingSubjects() {
        UserAccount user = user(100L);
        Role role = Role.builder().id(20L).name("操作员").code("OPERATOR").build();
        SubjectReference direct = new SubjectReference(SubjectReference.SubjectType.USER, 100L, null);
        SubjectReference roleRef = new SubjectReference(SubjectReference.SubjectType.ROLE, 20L, null);
        SubjectReference missingRole = new SubjectReference(SubjectReference.SubjectType.ROLE, 99L, null);
        when(userAccountRepository.findAllById(Set.of(100L))).thenReturn(List.of(user));
        when(roleRepository.findAllById(Set.of(20L, 99L))).thenReturn(List.of(role));
        when(userRoleRepository.findByRoleIdIn(Set.of(20L))).thenReturn(List.of(
                UserRole.builder().userId(100L).roleId(20L).build()));
        when(userAccountRepository.findAllById(Set.of(100L))).thenReturn(List.of(user));

        var result = resolver.resolve(List.of(direct, roleRef, missingRole));

        assertThat(result.users()).singleElement().satisfies(item -> {
            assertThat(item.userId()).isEqualTo(100L);
            assertThat(item.sources()).containsExactlyInAnyOrder(direct, roleRef);
        });
        assertThat(result.unresolvedSubjects()).containsExactly(missingRole);
    }

    @Test
    void excludesInactiveUsersFromEffectiveResults() {
        UserAccount inactive = user(100L);
        inactive.setStatus("DISABLED");
        SubjectReference direct = new SubjectReference(SubjectReference.SubjectType.USER, 100L, null);
        when(userAccountRepository.findAllById(Set.of(100L))).thenReturn(List.of(inactive));

        var result = resolver.resolve(List.of(direct));

        assertThat(result.users()).isEmpty();
        assertThat(result.unresolvedSubjects()).containsExactly(direct);
    }

    private Department department(Long id, Long parentId) {
        return Department.builder().id(id).parentId(parentId).tenantId(1L).code("D" + id).name("部门" + id).build();
    }

    private UserAccount user(Long id) {
        return UserAccount.builder().id(id).username("u" + id).displayName("用户" + id)
                .passwordHash("hash").status("ACTIVE").build();
    }

    private UserDepartment membership(Long userId, Long departmentId) {
        return UserDepartment.builder().userId(userId).departmentId(departmentId).build();
    }
}
