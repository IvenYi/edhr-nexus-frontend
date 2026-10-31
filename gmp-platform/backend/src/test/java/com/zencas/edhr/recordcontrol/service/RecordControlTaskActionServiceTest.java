package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.Result;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.WorkflowResultEvent;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowResultHandler;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RecordControlTaskActionServiceTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final ExecutionAccess access = mock(ExecutionAccess.class);
    private final WorkflowEngine workflow = mock(WorkflowEngine.class);
    private final RecordControlWorkflowResultHandler resultHandler = mock(RecordControlWorkflowResultHandler.class);
    private final RecordControlTaskActionService service =
            new RecordControlTaskActionService(jdbc, new ObjectMapper(), access, workflow, resultHandler);

    @Test void sharedTerminalSignerCompletesTaskAsActualSigner() {
        when(jdbc.queryForList(contains("FROM workflow_task"), eq(101L)))
                .thenReturn(List.of(Map.of("instance_id", 202L)));
        when(jdbc.queryForList(contains("FROM record_control_request"), eq("default"), eq("202")))
                .thenReturn(List.of(Map.of("id", 303L, "request_no", "RC-303", "status", "IN_REVIEW")));
        var signer = new ExecutionAccess.ButtonSigner("42", "审批人", "cruise", "SIGNATURE_PASSWORD", "88");
        when(access.authenticateButtonSigner("cruise", "secret")).thenReturn(signer);
        when(access.signTarget(eq("RECORD_CONTROL_REQUEST"), eq("303"), eq("workflow-task-101"),
                eq("APPROVE"), any(), eq(signer))).thenReturn("404");

        service.complete("101", "approve", new RecordControlTaskActionService.TaskActionCommand("同意", "cruise", "secret"));

        verify(workflow).completeRecordControlTask(101L, "APPROVE", "同意", "42", 404L);
        verifyNoInteractions(resultHandler);
    }

    @Test void finalWorkflowResultIsDeliveredInTheTaskTransaction() {
        when(jdbc.queryForList(contains("FROM workflow_task"), eq(101L)))
                .thenReturn(List.of(Map.of("instance_id", 202L)));
        when(jdbc.queryForList(contains("FROM record_control_request"), eq("default"), eq("202")))
                .thenReturn(List.of(Map.of("id", 303L, "request_no", "RC-303", "status", "IN_REVIEW")));
        var signer = new ExecutionAccess.ButtonSigner("42", "审批人", "cruise", "SIGNATURE_PASSWORD", "88");
        when(access.authenticateButtonSigner("cruise", "secret")).thenReturn(signer);
        when(access.signTarget(eq("RECORD_CONTROL_REQUEST"), eq("303"), eq("workflow-task-101"),
                eq("APPROVE"), any(), eq(signer))).thenReturn("404");
        WorkflowResultEvent event = new WorkflowResultEvent(
                "workflow-result:202:APPROVED", "202", "11", "12", BusinessType.CHANGE,
                "303", Result.APPROVED, LocalDateTime.now(), "42", "404", "audit-1", "snapshot-1");
        when(workflow.completeRecordControlTask(101L, "APPROVE", "同意", "42", 404L)).thenReturn(event);

        service.complete("101", "approve", new RecordControlTaskActionService.TaskActionCommand("同意", "cruise", "secret"));

        verify(resultHandler).handle(event);
    }

    @Test void businessResultFailureIsPropagatedSoTheOuterTransactionCanRollBack() {
        when(jdbc.queryForList(contains("FROM workflow_task"), eq(101L)))
                .thenReturn(List.of(Map.of("instance_id", 202L)));
        when(jdbc.queryForList(contains("FROM record_control_request"), eq("default"), eq("202")))
                .thenReturn(List.of(Map.of("id", 303L, "request_no", "RC-303", "status", "IN_REVIEW")));
        var signer = new ExecutionAccess.ButtonSigner("42", "审批人", "cruise", "SIGNATURE_PASSWORD", "88");
        when(access.authenticateButtonSigner("cruise", "secret")).thenReturn(signer);
        when(access.signTarget(eq("RECORD_CONTROL_REQUEST"), eq("303"), eq("workflow-task-101"),
                eq("APPROVE"), any(), eq(signer))).thenReturn("404");
        WorkflowResultEvent event = new WorkflowResultEvent(
                "workflow-result:202:APPROVED", "202", "11", "12", BusinessType.CHANGE,
                "303", Result.APPROVED, LocalDateTime.now(), "42", "404", "audit-1", "snapshot-1");
        when(workflow.completeRecordControlTask(101L, "APPROVE", "同意", "42", 404L)).thenReturn(event);
        doThrow(new IllegalStateException("业务结果落地失败")).when(resultHandler).handle(event);

        assertThatThrownBy(() -> service.complete("101", "approve",
                new RecordControlTaskActionService.TaskActionCommand("同意", "cruise", "secret")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("业务结果落地失败");
    }

    @Test void rejectionRequiresOpinionBeforeSigning() {
        assertThatThrownBy(() -> service.complete("101", "reject",
                new RecordControlTaskActionService.TaskActionCommand(" ", "cruise", "secret")))
                .hasMessageContaining("退回原因");
        verifyNoInteractions(access, workflow);
    }
}
