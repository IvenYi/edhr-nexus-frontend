package com.zencas.edhr.workflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.TenantTransferTargets;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

/** Changes responsibility only; routing and business outcomes remain with the workflow engine. */
@Service
@RequiredArgsConstructor
public class WorkflowResponsibilityService {
    private final WorkflowInstanceRepository instances;
    private final WorkflowTaskRepository tasks;
    private final WorkflowActionLogRepository logs;
    private final WorkflowInterventionRepository interventions;
    private final UserAccountRepository users;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;
    private final ObjectMapper mapper;
    private final EntityManager entityManager;
    private final ExecutionAccess access;
    private final JdbcTemplate jdbc;
    private final WorkflowNodeRepository nodes;

    public record Command(String targetUserId, String reason, String expectedTaskState, String account, String password) {}

    @Transactional(readOnly = true)
    public Map<String, Object> transferContext(Long taskId) {
        WorkflowTask task = task(taskId);
        WorkflowInstance instance = instance(task.getInstanceId());
        requireActive(instance, task);
        requireOperator(task, AuditContext.getOperatorId());
        return Map.of("taskState", taskState(task), "signatureRequired", transferSignatureRequired(task), "canTransfer", transferVisible(task));
    }

    private boolean transferVisible(WorkflowTask task) {
        JsonNode config = json(nodes.findById(task.getNodeId()).orElseThrow(() -> invalid("任务节点不存在")).getProperties());
        if (config.has("config")) config = config.path("config");
        if (!config.has("buttons")) return true;
        for (JsonNode button : config.path("buttons")) if ("TRANSFER".equals(button.path("action").asText())) return button.path("visible").asBoolean(true);
        return false;
    }

    private boolean transferSignatureRequired(WorkflowTask task) {
        JsonNode config = json(nodes.findById(task.getNodeId()).orElseThrow(() -> invalid("任务节点不存在")).getProperties());
        if (config.has("config")) config = config.path("config");
        for (JsonNode event : config.path("buttonEvents")) {
            if ("TRANSFER".equals(event.path("action").asText()) && "BEFORE".equals(event.path("event").asText())
                    && event.path("enabled").asBoolean(true) && "ACCOUNT_PASSWORD".equals(event.path("signatureMethod").asText())) return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> transferTargets(Long taskId, String keyword) {
        WorkflowTask task = task(taskId);
        WorkflowInstance instance = instance(task.getInstanceId());
        requireActive(instance, task);
        requireOperator(task, AuditContext.getOperatorId());
        if (!transferVisible(task)) throw invalid("当前节点未开放转办");
        return targets(instance, task, keyword, false);
    }

    @PreAuthorize("hasAuthority('workflow.intervene')")
    @Transactional(readOnly = true)
    public List<Map<String, String>> reassignmentTargets(Long taskId, String keyword) {
        WorkflowTask task = task(taskId);
        WorkflowInstance instance = instance(task.getInstanceId());
        requireActive(instance, task);
        return targets(instance, task, keyword, true);
    }

    @PreAuthorize("hasAuthority('workflow.intervene')")
    @Transactional
    public void reassign(Long taskId, Command command) {
        change(taskId, command, true);
    }

    @Transactional
    public void transferRecordControl(Long taskId, Command command) {
        change(taskId, command, false);
    }

    private void change(Long taskId, Command command, boolean reassignment) {
        if (command == null || command.reason() == null || command.reason().isBlank()
                || command.reason().strip().length() > 500) throw invalid("请填写不超过500字的原因");
        WorkflowTask ref = task(taskId);
        WorkflowInstance instance = instances.findByIdForUpdate(ref.getInstanceId()).orElseThrow(() -> invalid("流程不存在"));
        entityManager.refresh(instance, LockModeType.PESSIMISTIC_WRITE);
        WorkflowTask task = tasks.findByIdForUpdate(taskId).orElseThrow(() -> invalid("任务不存在"));
        entityManager.refresh(task, LockModeType.PESSIMISTIC_WRITE);
        requireActive(instance, task);
        if (!reassignment && !recordControl(instance)) throw invalid("请使用普通任务转办入口");
        if (!reassignment && !transferVisible(task)) throw invalid("当前节点未开放转办");
        if (!Objects.equals(taskState(task), command.expectedTaskState())) throw invalid("任务处理人或状态已变化，请刷新后重新操作");

        // Authenticate the actual signer, preserving the existing shared-terminal credential rules.
        boolean signatureRequired = reassignment || transferSignatureRequired(task);
        ExecutionAccess.ButtonSigner signer;
        if (signatureRequired) signer = access.authenticateButtonSigner(command.account(), command.password());
        else {
            UserAccount user = users.findById(Long.valueOf(AuditContext.getOperatorId())).orElseThrow(() -> invalid("当前用户不存在"));
            signer = new ExecutionAccess.ButtonSigner(user.getId().toString(), user.getDisplayName(), user.getUsername(), null, null);
        }
        Long tenant = tenant(instance);
        UserAccount operator = users.findById(Long.valueOf(signer.id())).orElseThrow(() -> invalid("操作人不存在"));
        if (!Objects.equals(tenant, operator.getTenantId())) throw invalid("操作人不属于流程租户");
        if (reassignment) {
            Integer count = jdbc.queryForObject("""
                    SELECT count(*) FROM user_role ur JOIN role_permission rp ON rp.role_id=ur.role_id
                    JOIN permission p ON p.id=rp.permission_id WHERE ur.user_id=? AND p.code='workflow.intervene'
                    """, Integer.class, Long.valueOf(signer.id()));
            if (count == null || count == 0) throw new BusinessException(ErrorCode.AUTH_003, "签署人没有流程干预权限");
        } else requireOperator(task, signer.id());
        UserAccount target;
        try { target = new TenantTransferTargets(users).require(tenant, task.getAssigneeId(), command.targetUserId()); }
        catch (IllegalArgumentException e) { throw invalid(e.getMessage()); }
        if (!eligible(instance, task, target.getId().toString(), reassignment)) throw invalid("目标不在该任务授权候选范围内，或为申请人");
        if (!reassignment && target.getId().toString().equals(signer.id())) throw invalid("不能转办给自己");

        String action = reassignment ? "REASSIGN" : "TRANSFER";
        ObjectNode before = mapper.createObjectNode().put("assigneeId", task.getAssigneeId())
                .put("candidateSnapshot", task.getCandidateSnapshot());
        ObjectNode evidence = mapper.createObjectNode().put("instanceId", instance.getId().toString())
                .put("taskId", taskId.toString()).put("nodeId", task.getNodeId().toString())
                .put("workflowVersionId", instance.getVersionId().toString())
                .put("previousAssigneeId", task.getAssigneeId()).put("targetUserId", target.getId().toString())
                .put("reason", command.reason().strip()).put("taskState", taskState(task));
        evidence.put("previousAssigneeName", task.getAssigneeId() == null ? "候选人待处理"
                : users.findById(Long.valueOf(task.getAssigneeId())).map(UserAccount::getDisplayName).orElse(task.getAssigneeId()));
        evidence.set("before", before.deepCopy());
        String signatureId = signatureRequired ? access.signTarget(reassignment ? "WORKFLOW_INTERVENTION" : "RECORD_CONTROL_REQUEST",
                reassignment ? taskId.toString() : instance.getBusinessId(), "workflow-task-" + taskId, action, evidence, signer) : null;
        String previousSnapshot = task.getCandidateSnapshot();
        JsonNode previous = json(previousSnapshot);
        ObjectNode next = mapper.createObjectNode();
        next.putArray("userIds").add(target.getId().toString());
        next.set("originSnapshot", previous.has("originSnapshot") ? previous.get("originSnapshot") : mapper.valueToTree(previousSnapshot));
        next.put("responsibilityAction", action);
        next.put("responsibilityVersion", Long.toString(ids.nextId()));
        if (previous.has("originRecordedAfterPriorTransfer")) next.set("originRecordedAfterPriorTransfer", previous.get("originRecordedAfterPriorTransfer"));
        String old = task.getAssigneeId();
        task.setOriginalAssigneeId(old);
        task.setAssigneeId(target.getId().toString());
        task.setCandidateSnapshot(next.toString());
        task.setStatus("PENDING");
        task.setCompletedAt(null);
        tasks.save(task);
        ObjectNode after = evidence.deepCopy().put("assigneeId", target.getId().toString())
                .put("assigneeName", target.getDisplayName()).put("signatureId", signatureId).put("candidateSnapshot", next.toString());
        after.remove("before");
        LocalDateTime now = LocalDateTime.now();
        logs.save(WorkflowActionLog.builder().id(ids.nextId()).instanceId(instance.getId()).taskId(taskId)
                .nodeId(task.getNodeId().toString()).action("TASK_" + action).operatorId(signer.id()).operatorName(signer.name())
                .comment(command.reason().strip()).snapshot(after.toString()).createdAt(now).build());
        if (reassignment) interventions.save(WorkflowIntervention.builder().id(ids.nextId()).instanceId(instance.getId())
                .action(action).operatorId(signer.id()).reason(command.reason().strip())
                .signatureId(Long.valueOf(signatureId)).createdAt(now).build());
        audits.save(AuditEvent.builder().id(ids.nextId()).tenantId("default").entityType("WORKFLOW_TASK")
                .entityId(taskId.toString()).action(action).contentBefore(before.toString()).contentAfter(after.toString())
                .operatorId(signer.id()).operatorName(signer.name()).operatorAccount(signer.account()).source("WORKFLOW")
                .moduleName("流程中心").menuName(reassignment ? "流程干预" : "任务处理").functionName(action)
                .reason(command.reason().strip()).createdAt(now).build());
    }

    private List<Map<String, String>> targets(WorkflowInstance instance, WorkflowTask task, String keyword, boolean reassignment) {
        return new TenantTransferTargets(users).search(tenant(instance), task.getAssigneeId(), keyword).stream()
                .filter(user -> reassignment || !Objects.equals(user.get("id"), AuditContext.getOperatorId()))
                .filter(user -> eligible(instance, task, user.get("id"), reassignment)).toList();
    }

    private boolean eligible(WorkflowInstance instance, WorkflowTask task, String target, boolean reassignment) {
        if (!recordControl(instance) && !reassignment) return true;
        if (recordControl(instance) && target.equals(instance.getInitiatorId())) return false;
        JsonNode origin = json(task.getCandidateSnapshot());
        if (origin.has("originSnapshot")) origin = json(origin.path("originSnapshot").asText());
        if (origin.path("unrestricted").asBoolean(false)) return true;
        for (JsonNode user : origin.path("userIds")) if (target.equals(user.asText())) return true;
        return false;
    }

    private void requireOperator(WorkflowTask task, String operator) {
        JsonNode snapshot = json(task.getCandidateSnapshot());
        if (operator != null && snapshot.path("unrestricted").asBoolean(false)) return;
        for (JsonNode user : snapshot.path("userIds")) if (operator != null && operator.equals(user.asText())) return;
        if (snapshot.path("userIds").isEmpty() && operator != null && operator.equals(task.getAssigneeId())) return;
        throw new BusinessException(ErrorCode.AUTH_003, "当前用户无权转办此任务");
    }

    private void requireActive(WorkflowInstance instance, WorkflowTask task) {
        if ("DHR_SUMMARY".equals(instance.getBusinessType())) throw invalid("DHR审核不支持通用转办或重新分配");
        if (!"RUNNING".equals(instance.getStatus()) || !Set.of("PENDING", "PROCESSING").contains(task.getStatus()))
            throw invalid("任务已结束，请刷新后查看");
    }

    private Long tenant(WorkflowInstance instance) {
        return users.findById(Long.valueOf(instance.getInitiatorId())).map(UserAccount::getTenantId)
                .orElseThrow(() -> invalid("无法确定流程租户"));
    }

    private boolean recordControl(WorkflowInstance instance) { return Set.of("CHANGE", "OBSOLETE").contains(Objects.toString(instance.getBusinessType(), "")); }
    private WorkflowTask task(Long id) { return tasks.findById(id).orElseThrow(() -> invalid("任务不存在")); }
    private WorkflowInstance instance(Long id) { return instances.findById(id).orElseThrow(() -> invalid("流程不存在")); }
    private JsonNode json(String value) {
        try { return value == null || value.isBlank() ? mapper.createObjectNode() : mapper.readTree(value); }
        catch (Exception e) { throw invalid("任务候选快照无法读取"); }
    }
    public static String taskState(WorkflowTask task) {
        try {
            String state = task.getId() + "|" + task.getNodeId() + "|" + task.getStatus() + "|" + task.getAssigneeId() + "|" + task.getCandidateSnapshot();
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(state.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.WF_007, message); }
}
