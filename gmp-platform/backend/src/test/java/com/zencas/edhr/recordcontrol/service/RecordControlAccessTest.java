package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowPort;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class RecordControlAccessTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final RecordControlService service = new RecordControlService(jdbc, new ObjectMapper(),
            mock(SnowflakeIdGenerator.class), mock(RecordControlWorkflowPort.class), mock(UserAccountRepository.class),
            mock(PasswordEncoder.class), mock(SignatureRepository.class), mock(AuditEventRepository.class),
            mock(RecordControlDiff.class), mock(ExecutionAccess.class));

    @AfterEach void clearActor() { AuditContext.clear(); }

    @Test void myApplicationsAreFilteredByAuthenticatedActor() {
        AuditContext.setOperator("42", "申请人");
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenReturn(List.of());
        service.listRequests(true, 0, 20);
        verify(jdbc).queryForList(contains("q.applicant_id=?"), eq("default"), eq("42"), eq(20), eq(0L));
    }

    @Test void tenantHistoryIsOpenToAuthenticatedActorButNotAnonymous() {
        AuditContext.setOperator("42", "申请人");
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenReturn(List.of());
        service.listRequests(false, 0, 20);
        verify(jdbc).queryForList(contains("q.tenant_id=?"), eq("default"), eq(20), eq(0L));
        AuditContext.clear();
        assertThatThrownBy(() -> service.listRequests(false, 0, 20)).hasMessageContaining("重新登录");
    }

    @Test void applicationListFiltersAreAppliedBeforePagination() {
        AuditContext.setOperator("42", "申请人");
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenReturn(List.of());
        LocalDateTime from = LocalDateTime.of(2026, 9, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 10, 1, 0, 0);

        service.listRequests(true, 2, 50, new RecordControlService.RequestListQuery(
                "RC-01", "CHANGE", "FR-01", "点检表", "FORM-01", "张三", "IN_REVIEW", from, to));

        verify(jdbc).queryForList(contains("r.template_name"), eq("default"), eq("42"), eq("%RC-01%"),
                eq("CHANGE"), eq("%FR-01%"), eq("%点检表%"), eq("%FORM-01%"), eq("%张三%"), eq("%张三%"),
                eq("IN_REVIEW"), eq(from), eq(to), eq(50), eq(100L));
    }

    @Test void approvalProjectionRequiresCurrentTaskOwnership() {
        AuditContext.setOperator("42", "审批人");
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenReturn(List.of());
        service.requestsForMyWorkflowTasks(List.of("123"));
        verify(jdbc).queryForList(contains("EXISTS (SELECT 1 FROM workflow_task"),
                eq("default"), eq("123"), eq("42"), eq("[\"42\"]"), eq("42"));
    }
}
