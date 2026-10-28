package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.WorkflowResultEvent;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowResultHandler;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Record-control adapter for shared-terminal signing before delegating to the public workflow engine. */
@Service
@RequiredArgsConstructor
public class RecordControlTaskActionService {
    private static final String TENANT = "default";
    private static final Set<String> ACTIONS = Set.of("APPROVE", "REJECT");

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final ExecutionAccess executionAccess;
    private final WorkflowEngine workflowEngine;
    private final RecordControlWorkflowResultHandler resultHandler;

    public record TaskActionCommand(String opinion, String account, String password) {}

    @Transactional
    public Map<String, Object> complete(String taskId, String requestedAction, TaskActionCommand command) {
        long parsedTaskId = parseId(taskId, "审批任务编号不正确");
        String action = requestedAction == null ? "" : requestedAction.trim().toUpperCase(Locale.ROOT);
        if (!ACTIONS.contains(action)) throw invalid("审批动作不正确");
        if (command == null) throw invalid("审批信息不完整");
        String opinion = command.opinion() == null ? "" : command.opinion().trim();
        if ("REJECT".equals(action) && opinion.isBlank()) throw invalid("审批退回时必须填写退回原因");

        var taskRows = jdbc.queryForList("SELECT instance_id FROM workflow_task WHERE id=?", parsedTaskId);
        if (taskRows.isEmpty()) throw invalid("审批任务不存在");
        String instanceId = String.valueOf(taskRows.getFirst().get("instance_id"));
        var requestRows = jdbc.queryForList("""
                SELECT id,request_no,status FROM record_control_request
                WHERE tenant_id=? AND workflow_instance_id=?
                """, TENANT, instanceId);
        if (requestRows.isEmpty()) throw invalid("审批任务未关联记录变更申请");
        Map<String, Object> request = requestRows.getFirst();
        if (!"IN_REVIEW".equals(String.valueOf(request.get("status")))) throw invalid("当前申请已不可审批");

        ExecutionAccess.ButtonSigner signer = executionAccess.authenticateButtonSigner(command.account(), command.password());
        ObjectNode evidence = mapper.createObjectNode()
                .put("requestId", String.valueOf(request.get("id")))
                .put("requestNo", String.valueOf(request.get("request_no")))
                .put("taskId", taskId)
                .put("action", action)
                .put("opinion", opinion);
        long signatureId = parseId(executionAccess.signTarget("RECORD_CONTROL_REQUEST",
                String.valueOf(request.get("id")), "workflow-task-" + taskId, action, evidence, signer), "签署记录编号不正确");

        // Workflow remains authoritative for task ownership, candidate checks and routing.
        WorkflowResultEvent result = workflowEngine.completeRecordControlTask(
                parsedTaskId, action, opinion, signer.id(), signatureId);
        if (result != null) resultHandler.handle(result);
        return Map.of("taskId", taskId, "action", action, "signerId", signer.id(), "result", "ok");
    }

    private long parseId(String value, String message) {
        try { return Long.parseLong(value); }
        catch (RuntimeException exception) { throw invalid(message); }
    }

    private BusinessException invalid(String message) {
        return new BusinessException(ErrorCode.GENERAL_001, message);
    }
}
