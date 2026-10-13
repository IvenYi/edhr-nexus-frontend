package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.identity.entity.*;
import com.zencas.edhr.identity.repository.*;
import com.zencas.edhr.identity.service.SubjectResolver;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Uses the real resolver, rather than mocking a successful tenant-0 resolution. */
class ExecutionSubjectScopeTest {
    final ObjectMapper mapper = new ObjectMapper();
    final UserAccountRepository users = mock(UserAccountRepository.class);
    final DepartmentRepository departments = mock(DepartmentRepository.class);
    final RoleRepository roles = mock(RoleRepository.class);
    final UserDepartmentRepository userDepartments = mock(UserDepartmentRepository.class);
    final UserRoleRepository userRoles = mock(UserRoleRepository.class);
    final Map<Long, UserAccount> accounts = new LinkedHashMap<>();
    final SubjectResolver resolver = new SubjectResolver(users, departments, roles, userDepartments, userRoles);
    final ExecutionAccess access = new ExecutionAccess(resolver, users, mock(PasswordEncoder.class),
            mock(SignatureRepository.class), new SnowflakeIdGenerator(1), mapper, mock(JdbcTemplate.class));

    @BeforeEach void prepare() {
        when(users.findById(anyLong())).thenAnswer(call -> Optional.ofNullable(accounts.get(call.getArgument(0))));
        when(users.findAllById(any())).thenAnswer(call -> {
            List<UserAccount> found = new ArrayList<>();
            for (Long id : call.<Iterable<Long>>getArgument(0)) if (accounts.containsKey(id)) found.add(accounts.get(id));
            return found;
        });
        user(1L, 1L, "ACTIVE"); user(2L, 1L, "ACTIVE");
        user(3L, 1L, "INACTIVE"); user(4L, 2L, "ACTIVE");
        AuditContext.setOperator("1", "session-A");
    }

    @AfterEach void clearContext() { AuditContext.clear(); }

    private void user(long id, Long tenant, String status) {
        accounts.put(id, UserAccount.builder().id(id).tenantId(tenant).username("u" + id)
                .displayName("U" + id).status(status).build());
    }

    private JsonNode configured(String type, long id) throws Exception {
        return mapper.readTree("[{\"type\":\"" + type + "\",\"id\":\"" + id + "\"}]");
    }

    private ObjectNode approval(JsonNode configured) {
        ObjectNode node = mapper.createObjectNode().put("id", "review");
        node.putObject("data").put("kind", "APPROVAL").putObject("config")
                .put("defaultPermission", "EDIT").set("approverSubjects", configured);
        return node;
    }

    @Test void assignedActiveUserIsCapturedAndOnlyThatUserCanEdit() throws Exception {
        ObjectNode node = approval(configured("USER", 2L)), state = mapper.createObjectNode();
        access.captureApprovers(node, state);
        assertThat(state.path("approvers").path("review").toString()).isEqualTo("[\"2\"]");
        assertThat(state.path("restrictedApprovers").path("review").asBoolean()).isTrue();
        JsonNode form = mapper.readTree("{\"fields\":[{\"id\":\"value\",\"type\":\"text\"}]}");
        assertThat(access.canAct(form, node, state, "2")).isTrue();
        assertThat(access.canAct(form, node, state, "1")).isFalse();
        assertThat(access.permissions(form, node, state, "2").path("value").asText()).isEqualTo("EDIT");
        assertThat(access.permissions(form, node, state, "1").path("value").asText()).isEqualTo("READ_ONLY");
        assertThat(AuditContext.getOperatorId()).isEqualTo("1");
    }

    @Test void inactiveAndOtherScopeSubjectsDoNotBecomeCandidates() throws Exception {
        for (long id : new long[]{3L, 4L, 99L}) {
            ObjectNode node = approval(configured("USER", id)), state = mapper.createObjectNode();
            access.captureApprovers(node, state);
            assertThat(state.path("approvers").path("review").isEmpty()).isTrue();
            assertThat(state.path("restrictedApprovers").path("review").asBoolean()).isTrue();
            assertThat(access.canAct(mapper.createObjectNode(), node, state, "1")).isFalse();
        }
    }

    @Test void scopeComesFromSessionAccountRatherThanAnotherHardCodedNumber() throws Exception {
        for (long tenant : new long[]{0L, 7L, 41L}) {
            user(1L, tenant, "ACTIVE"); user(2L, tenant, "ACTIVE");
            assertThat(access.resolve(configured("USER", 2L))).containsExactly("2");
        }
    }

    @Test void missingMalformedOrUnresolvableSessionScopeFailsClosed() throws Exception {
        JsonNode subjects = configured("USER", 2L);
        for (String operator : new String[]{null, "", "bad-id", "999"}) {
            AuditContext.setOperator(operator, "invalid");
            assertThatThrownBy(() -> access.resolve(subjects)).isInstanceOf(RuntimeException.class);
        }
        AuditContext.setOperator("1", "session-A"); user(1L, null, "ACTIVE");
        assertThatThrownBy(() -> access.resolve(subjects)).hasMessageContaining("主体解析范围");
    }

    @Test void trulyUnconfiguredNodeKeepsTheExistingUnrestrictedRule() {
        AuditContext.clear();
        assertThat(access.resolve(mapper.createArrayNode())).isEmpty();
        ObjectNode node = approval(mapper.createArrayNode()), state = mapper.createObjectNode();
        access.captureApprovers(node, state);
        assertThat(state.path("restrictedApprovers").path("review").asBoolean()).isFalse();
        assertThat(access.canAct(mapper.createObjectNode(), node, state, "2")).isTrue();
    }

    @Test void roleMembershipRetainsScopeAndActiveUserFiltering() throws Exception {
        Role role = mock(Role.class);
        when(role.getId()).thenReturn(7L); when(role.getTenantId()).thenReturn(1L);
        when(roles.findAllById(any())).thenReturn(List.of(role));
        List<UserRole> memberships = new ArrayList<>();
        for (long id : new long[]{2L, 3L, 4L}) {
            UserRole membership = mock(UserRole.class);
            when(membership.getRoleId()).thenReturn(7L); when(membership.getUserId()).thenReturn(id);
            memberships.add(membership);
        }
        when(userRoles.findByRoleIdIn(any())).thenReturn(memberships);
        assertThat(access.resolve(configured("ROLE", 7L))).containsExactly("2");
    }

    @Test void departmentSelfAndChildrenUseOriginalMembershipRules() throws Exception {
        Department parent = mock(Department.class), child = mock(Department.class);
        when(parent.getId()).thenReturn(7L); when(parent.getTenantId()).thenReturn(1L);
        when(child.getId()).thenReturn(8L); when(child.getTenantId()).thenReturn(1L);
        when(child.getParentId()).thenReturn(7L);
        when(departments.findAll()).thenReturn(List.of(parent, child));
        UserDepartment membership = mock(UserDepartment.class);
        when(membership.getDepartmentId()).thenReturn(8L); when(membership.getUserId()).thenReturn(2L);
        when(userDepartments.findByDepartmentIdIn(any())).thenAnswer(call ->
                call.<Collection<Long>>getArgument(0).contains(8L) ? List.of(membership) : List.of());
        assertThat(access.resolve(configured("DEPARTMENT", 7L))).containsExactly("2");
        assertThat(access.resolve(mapper.readTree("[{\"type\":\"DEPARTMENT\",\"id\":\"7\",\"departmentScope\":\"SELF_ONLY\"}]"))).isEmpty();
    }

    @Test void capturedCandidatesAreNotRebuiltByTheRepair() throws Exception {
        ObjectNode node = approval(configured("USER", 2L)), state = mapper.createObjectNode();
        access.captureApprovers(node, state);
        ObjectNode frozen = state.deepCopy();
        accounts.remove(2L); access.captureApprovers(node, state);
        assertThat(state).isEqualTo(frozen);
    }

    @Test void previouslyCapturedEmptySnapshotIsNotSilentlyRepaired() throws Exception {
        ObjectNode node = approval(configured("USER", 2L)), state = mapper.createObjectNode();
        state.putObject("approvers").putArray("review");
        state.putObject("restrictedApprovers").put("review", true);
        ObjectNode frozen = state.deepCopy(); access.captureApprovers(node, state);
        assertThat(state).isEqualTo(frozen);
        assertThat(access.canAct(mapper.createObjectNode(), node, state, "2")).isFalse();
    }

    @Test void malformedSubjectDoesNotTurnIntoAnOpenNode() throws Exception {
        JsonNode subjects = mapper.readTree("[{\"type\":\"NOT_A_SUBJECT\",\"id\":\"2\"}]");
        assertThatThrownBy(() -> access.resolve(subjects)).hasMessageContaining("主体配置无法解析");
    }
}
