package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowPort;
import com.zencas.edhr.workflow.entity.WorkflowTask;
import com.zencas.edhr.workflow.repository.WorkflowTaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class RecordControlAccessTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final WorkflowTaskRepository workflowTasks = mock(WorkflowTaskRepository.class);
    private final RecordControlService service = new RecordControlService(jdbc, new ObjectMapper(),
            mock(SnowflakeIdGenerator.class), mock(RecordControlWorkflowPort.class), workflowTasks,
            mock(AuditEventRepository.class),
            mock(RecordControlDiff.class), mock(ExecutionAccess.class),
            mock(com.zencas.edhr.compliance.repository.SignatureRepository.class),
            mock(com.zencas.edhr.production.service.DhrEvidenceImpactService.class),
            mock(com.zencas.edhr.production.service.FormProjectionService.class));

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

    @Test void approvalQueueFiltersRecordControlTasksBeforePagination() {
        AuditContext.setOperator("42", "审批人");
        WorkflowTask task = WorkflowTask.builder().id(101L).instanceId(201L).status("PENDING").build();
        PageRequest pageable = PageRequest.of(1, 50);
        when(workflowTasks.findRecordControlTodoForUser("42", "[\"42\"]", pageable))
                .thenReturn(new PageImpl<>(List.of(task), pageable, 51));

        var result = service.listMyWorkflowTasks("todo", 1, 50);

        assertThat(result.getContent()).containsExactly(task);
        assertThat(result.getTotalElements()).isEqualTo(51);
        assertThat(result.getTotalPages()).isEqualTo(2);
        verify(workflowTasks).findRecordControlTodoForUser("42", "[\"42\"]", pageable);
        verify(workflowTasks, never()).findTodoForUser(anyString(), anyString(), anyInt(), anyLong());
    }

    @Test void completedApprovalQueueUsesDedicatedRecordControlProjection() {
        AuditContext.setOperator("42", "审批人");
        WorkflowTask task = WorkflowTask.builder().id(102L).instanceId(202L).status("COMPLETED").build();
        PageRequest pageable = PageRequest.of(0, 20);
        when(workflowTasks.findRecordControlDoneForUser("42", pageable))
                .thenReturn(new PageImpl<>(List.of(task), pageable, 1));

        var result = service.listMyWorkflowTasks("done", 0, 20);

        assertThat(result.getContent()).containsExactly(task);
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(workflowTasks).findRecordControlDoneForUser("42", pageable);
        verify(workflowTasks, never()).findDoneForUser(anyString(), anyInt(), anyLong());
    }

    @Test void approvalProjectionRequiresCurrentTaskOwnership() {
        AuditContext.setOperator("42", "审批人");
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenReturn(List.of());
        service.requestsForMyWorkflowTasks(List.of("123"));
        verify(jdbc).queryForList(contains("EXISTS (SELECT 1 FROM workflow_task"),
                eq("default"), eq("123"), eq("42"), eq("[\"42\"]"), eq("42"));
    }

    @Test void applicantCanReadOwnActiveRequestDetail() {
        AuditContext.setOperator("42", "申请人");
        stubRequestDetail(request("IN_REVIEW", "42", "900"));

        service.requestDetail("101");

        verify(jdbc, never()).queryForObject(contains("FROM workflow_task"), eq(Long.class), any(Object[].class));
    }

    @Test void assignedApproverCanReadActiveRequestDetail() {
        AuditContext.setOperator("99", "审批人");
        stubRequestDetail(request("IN_REVIEW", "42", "900"));
        when(jdbc.queryForObject(contains("FROM workflow_task"), eq(Long.class),
                eq("900"), eq("99"), eq("[\"99\"]"), eq("99"))).thenReturn(1L);

        service.requestDetail("101");
    }

    @Test void unrelatedUserCannotReadActiveRequestDetail() {
        AuditContext.setOperator("99", "无关用户");
        stubRequestDetail(request("IN_REVIEW", "42", "900"));
        when(jdbc.queryForObject(contains("FROM workflow_task"), eq(Long.class),
                eq("900"), eq("99"), eq("[\"99\"]"), eq("99"))).thenReturn(0L);

        assertThatThrownBy(() -> service.requestDetail("101")).hasMessageContaining("无权查看");
    }

    @Test void authenticatedTenantUserCanReadResolvedHistoryDetail() {
        AuditContext.setOperator("99", "历史查看人");
        stubRequestDetail(request("APPROVED", "42", "900"));

        service.requestDetail("101");

        verify(jdbc, never()).queryForObject(contains("FROM workflow_task"), eq(Long.class), any(Object[].class));
    }

    private void stubRequestDetail(Map<String, Object> row) {
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0);
            return sql.contains("FROM record_control_request q") ? List.of(row) : List.of();
        });
    }

    private Map<String, Object> request(String status, String applicantId, String workflowInstanceId) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", 101L);
        row.put("request_no", "RC-101");
        row.put("request_type", "CHANGE");
        row.put("status", status);
        row.put("applicant_id", applicantId);
        row.put("workflow_instance_id", workflowInstanceId);
        row.put("snapshot_json", "{}");
        row.put("source_values_json", "{}");
        return row;
    }
}
