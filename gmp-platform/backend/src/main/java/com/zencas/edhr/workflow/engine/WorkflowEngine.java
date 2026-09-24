package com.zencas.edhr.workflow.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.dto.SubjectReference;
import com.zencas.edhr.identity.dto.SubjectResolution;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.service.SubjectResolver;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Core workflow engine.
 * Handles instance creation, node progression, parallel gateway aggregation,
 * task creation, and conditional branching for both review and production-work workflows.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowEngine {

    private final WorkflowInstanceRepository instanceRepository;
    private final WorkflowTaskRepository taskRepository;
    private final WorkflowActionLogRepository actionLogRepository;
    private final WorkflowBindingRuleRepository bindingRuleRepository;
    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowDefinitionVersionRepository versionRepository;
    private final WorkflowNodeRepository nodeRepository;
    private final WorkflowEdgeRepository edgeRepository;
    private final SnowflakeIdGenerator idGenerator;
    private final ObjectMapper objectMapper;
    private final StateMachineService stateMachineService;
    private final SubjectResolver subjectResolver;
    private final UserAccountRepository userAccountRepository;

    /**
     * Create a new workflow instance by matching a business type to a binding rule.
     */
    @Transactional
    public WorkflowInstance createInstance(String businessType, String businessId, String initiatorId) {
        if ("DHR_SUMMARY".equals(businessType)) throw new BusinessException(ErrorCode.WF_007, "请通过 DHR 汇总发起审核");
        // Find active binding rule
        WorkflowBindingRule rule = bindingRuleRepository
                .findByBusinessTypeAndIsActiveTrue(businessType)
                .stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_009,
                        "未找到业务类型 " + businessType + " 的活跃绑定规则"));

        WorkflowDefinition definition = definitionRepository.findById(rule.getDefinitionId())
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));

        WorkflowDefinitionVersion version;
        if (rule.getVersionId() != null) {
            version = versionRepository.findById(rule.getVersionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));
        } else {
            version = versionRepository.findByDefinitionIdAndIsCurrentTrue(rule.getDefinitionId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.WF_009, "未找到生效版本"));
        }

        // Create instance
        WorkflowInstance instance = WorkflowInstance.builder()
                .id(idGenerator.nextId())
                .definitionId(definition.getId())
                .versionId(version.getId())
                .businessType(businessType)
                .businessId(businessId)
                .status("RUNNING")
                .initiatorId(initiatorId)
                .startedAt(LocalDateTime.now())
                .build();
        instance = instanceRepository.save(instance);

        // Find START node and create first task(s)
        List<WorkflowNode> startNodes = nodeRepository.findByVersionIdAndNodeType(version.getId(), "START");
        if (startNodes.isEmpty()) {
            throw new BusinessException(ErrorCode.WF_011, "流程模板缺少开始节点");
        }

        WorkflowNode startNode = startNodes.get(0);
        instance.setCurrentNodeIds(String.valueOf(startNode.getId()));
        instanceRepository.save(instance);

        // Log instance start
        logAction(instance.getId(), null, startNode.getId().toString(), "INSTANCE_START", initiatorId, "流程实例创建");

        // A form-process START is itself the fill-in task. Conventional workflow START nodes remain automatic.
        if (isFormProcessDefinition(definition) || hasConfiguredSubjects(startNode)) {
            createTaskForNode(instance, startNode, initiatorId);
        } else {
            progressFromNode(instance, startNode, initiatorId, null);
        }

        return instance;
    }

    /**
     * Start a record-control workflow from an explicitly selected published version.
     * This boundary never consults workflow binding rules and never creates a START task.
     */
    @Transactional
    public WorkflowInstance createRecordControlInstance(
            Long definitionId,
            Long versionId,
            String businessType,
            String businessId,
            String initiatorId,
            Long applicantSignatureId,
            String idempotencyKey,
            String auditCorrelationId
    ) {
        if (definitionId == null || versionId == null || businessId == null || businessId.isBlank()
                || initiatorId == null || initiatorId.isBlank() || applicantSignatureId == null
                || idempotencyKey == null || idempotencyKey.isBlank()
                || auditCorrelationId == null || auditCorrelationId.isBlank()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "记录控制流程发起参数不完整");
        }
        Optional<WorkflowInstance> existing = instanceRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return requireMatchingIdempotentStart(existing.get(), definitionId, versionId, businessType,
                    businessId, initiatorId, applicantSignatureId, auditCorrelationId);
        }

        if (!"CHANGE".equals(businessType) && !"OBSOLETE".equals(businessType)) {
            throw new BusinessException(ErrorCode.WF_013);
        }
        WorkflowDefinition definition = definitionRepository.findByIdForUpdate(definitionId)
                .filter(candidate -> "RECORD_CONTROL".equals(candidate.getType()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));
        existing = instanceRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return requireMatchingIdempotentStart(existing.get(), definitionId, versionId, businessType,
                    businessId, initiatorId, applicantSignatureId, auditCorrelationId);
        }
        if (!businessType.equals(definition.getBusinessType()) || !"PUBLISHED".equals(definition.getStatus())) {
            throw new BusinessException(ErrorCode.WF_014);
        }
        WorkflowDefinitionVersion version = versionRepository.findById(versionId)
                .filter(candidate -> definitionId.equals(candidate.getDefinitionId()))
                .filter(candidate -> "PUBLISHED".equals(candidate.getStatus()))
                .filter(candidate -> Boolean.TRUE.equals(candidate.getIsCurrent()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_014));
        List<WorkflowNode> startNodes = nodeRepository.findByVersionIdAndNodeType(versionId, "START");
        if (startNodes.size() != 1) {
            throw new BusinessException(ErrorCode.WF_011, "审批流程必须且只能包含一个开始节点");
        }

        String snapshotHash = workflowSnapshotHash(version);
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("workflowDefinitionId", definitionId.toString());
        context.put("workflowVersionId", versionId.toString());
        context.put("businessType", businessType);
        context.put("businessId", businessId);
        context.put("applicantSignatureId", applicantSignatureId == null ? null : applicantSignatureId.toString());
        context.put("idempotencyKey", idempotencyKey);
        context.put("auditCorrelationId", auditCorrelationId);
        context.put("workflowSnapshotHash", snapshotHash);

        WorkflowNode startNode = startNodes.get(0);
        WorkflowInstance instance = WorkflowInstance.builder()
                .id(idGenerator.nextId())
                .definitionId(definitionId)
                .versionId(versionId)
                .businessType(businessType)
                .businessId(businessId)
                .status("RUNNING")
                .currentNodeIds(startNode.getId().toString())
                .contextSnapshot(writeJson(context))
                .idempotencyKey(idempotencyKey)
                .auditCorrelationId(auditCorrelationId)
                .workflowSnapshotHash(snapshotHash)
                .initiatorId(initiatorId)
                .startedAt(LocalDateTime.now())
                .build();
        instance = instanceRepository.saveAndFlush(instance);

        logAction(instance.getId(), null, startNode.getId().toString(),
                "INSTANCE_START", initiatorId, "记录控制审批实例创建");
        progressFromNode(instance, startNode, initiatorId, null);
        return instance;
    }

    /** Start only the process version frozen at first production start, never the latest binding. */
    @Transactional
    public WorkflowInstance createDhrSummaryInstance(Long definitionId, Long versionId, String summaryVersionId, String initiatorId) {
        if (definitionId == null || versionId == null || summaryVersionId == null || initiatorId == null)
            throw new BusinessException(ErrorCode.WF_014, "DHR 审核绑定不完整");
        String key = "DHR_SUMMARY:" + summaryVersionId;
        WorkflowDefinition definition = definitionRepository.findByIdForUpdate(definitionId)
                .filter(d -> "RECORD_CONTROL".equals(d.getType()) && "DHR_SUMMARY".equals(d.getBusinessType()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_014));
        var existing = instanceRepository.findByIdempotencyKey(key);
        if (existing.isPresent()) {
            WorkflowInstance previous = existing.get();
            if (!definitionId.equals(previous.getDefinitionId()) || !versionId.equals(previous.getVersionId())
                    || !summaryVersionId.equals(previous.getBusinessId()) || !initiatorId.equals(previous.getInitiatorId()))
                throw new BusinessException(ErrorCode.WF_014, "DHR 审核重复发起参数不一致");
            return previous;
        }
        WorkflowDefinitionVersion version = versionRepository.findById(versionId)
                .filter(v -> definitionId.equals(v.getDefinitionId()) && "PUBLISHED".equals(v.getStatus()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_014));
        List<WorkflowNode> starts = nodeRepository.findByVersionIdAndNodeType(versionId, "START");
        if (starts.size() != 1) throw new BusinessException(ErrorCode.WF_011);
        WorkflowNode start = starts.getFirst();
        WorkflowInstance instance = instanceRepository.saveAndFlush(WorkflowInstance.builder()
                .id(idGenerator.nextId()).definitionId(definition.getId()).versionId(versionId)
                .businessType("DHR_SUMMARY").businessId(summaryVersionId).initiatorId(initiatorId)
                .status("RUNNING").currentNodeIds(start.getId().toString()).startedAt(LocalDateTime.now())
                .workflowSnapshotHash(workflowSnapshotHash(version)).idempotencyKey(key)
                .contextSnapshot(writeJson(Map.of("summaryVersionId", summaryVersionId, "workflowVersionId", versionId.toString())))
                .build());
        logAction(instance.getId(), null, start.getId().toString(), "INSTANCE_START", initiatorId, "DHR 汇总审核发起");
        progressFromNode(instance, start, initiatorId, null);
        return instance;
    }

    /**
     * Process task completion and advance the workflow.
     */
    @Transactional
    public void completeTask(Long taskId, String action, String opinion, String operatorId, Long signatureId) {
        completeTask(taskId, action, opinion, operatorId, signatureId, false);
    }

    /** DHR domain service has already checked the frozen evidence and signed action. */
    @Transactional
    public void completeDhrTask(Long taskId, String action, String opinion, String operatorId, Long signatureId) {
        if (!Set.of("APPROVE", "REJECT").contains(action)) throw new BusinessException(ErrorCode.WF_007);
        completeTask(taskId, action, opinion, operatorId, signatureId, true);
    }

    private void completeTask(Long taskId, String action, String opinion, String operatorId, Long signatureId, boolean dhrAction) {
        WorkflowTask taskRef = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));
        WorkflowInstance instance = instanceRepository.findByIdForUpdate(taskRef.getInstanceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));
        if ("DHR_SUMMARY".equals(instance.getBusinessType()) != dhrAction) {
            throw new BusinessException(ErrorCode.WF_007, "DHR 审核必须通过 DHR 审核入口处理");
        }
        if (!"RUNNING".equals(instance.getStatus())) {
            throw new BusinessException(ErrorCode.WF_007, "流程实例已结束");
        }
        WorkflowTask task = taskRepository.findByIdForUpdate(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));

        if (!"PENDING".equals(task.getStatus()) && !"PROCESSING".equals(task.getStatus())) {
            throw new BusinessException(ErrorCode.WF_007);
        }

        Set<String> candidateIds = parseCandidateIds(task.getCandidateSnapshot());
        if (isUnrestrictedSnapshot(task.getCandidateSnapshot())) {
            if (operatorId == null || operatorId.isBlank()) {
                throw new BusinessException(ErrorCode.WF_007, "当前用户不是该任务的处理人");
            }
            task.setAssigneeId(operatorId);
        } else if (!candidateIds.isEmpty()) {
            if (operatorId == null || !candidateIds.contains(operatorId)) {
                throw new BusinessException(ErrorCode.WF_007, "当前用户不是该任务的待处理人");
            }
            task.setAssigneeId(operatorId);
        } else if (task.getAssigneeId() == null || !task.getAssigneeId().equals(operatorId)) {
            throw new BusinessException(ErrorCode.WF_007, "当前用户不是该任务的处理人");
        }

        task.setStatus(resolveTaskStatus(action));
        task.setAction(action);
        task.setOpinion(opinion);
        task.setSignatureId(signatureId);
        task.setCompletedAt(LocalDateTime.now());
        taskRepository.save(task);

        // Log task completion
        logAction(instance.getId(), task.getId(), task.getNodeId().toString(),
                "TASK_COMPLETE", operatorId, opinion);

        if ("REJECT".equals(action)) {
            handleRejection(instance, task, operatorId);
        } else {
            // Progress from current node
            WorkflowNode node = nodeRepository.findById(task.getNodeId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.WF_011));
            progressFromNode(instance, node, operatorId, null);
        }
    }

    /** Progress from a node to its downstream nodes. */
    private void progressFromNode(WorkflowInstance instance, WorkflowNode currentNode,
                                   String operatorId, Map<String, Object> context) {
        List<WorkflowEdge> outgoingEdges = edgeRepository.findBySourceNodeId(currentNode.getId());
        List<WorkflowNode> versionNodes = nodeRepository.findByVersionId(currentNode.getVersionId());

        if (outgoingEdges.isEmpty()) {
            // No downstream - check if this is END
            if ("END".equals(currentNode.getNodeType())) {
                completeInstance(instance, operatorId);
            }
            return;
        }

        Set<String> currentActiveNodes = new HashSet<>();
        if (instance.getCurrentNodeIds() != null && !instance.getCurrentNodeIds().isEmpty()) {
            currentActiveNodes.addAll(Arrays.asList(instance.getCurrentNodeIds().split(",")));
        }
        currentActiveNodes.remove(currentNode.getId().toString());

        // Process outgoing edges. Structural parallel nodes are automatic and never create tasks.
        Set<Long> nextNodeIds = new LinkedHashSet<>();
        currentActiveNodes.stream().filter(value -> !value.isBlank()).map(Long::valueOf).forEach(nextNodeIds::add);
        Set<Long> createdNodeIds = new HashSet<>();
        for (WorkflowEdge edge : outgoingEdges) {
            WorkflowNode targetNode = versionNodes.stream()
                    .filter(n -> n.getId().equals(edge.getTargetNodeId()))
                    .findFirst()
                    .orElse(null);
            if (targetNode == null) continue;

            // Check condition expression
            if (edge.getConditionExpression() != null && context != null) {
                if (!evaluateCondition(edge.getConditionExpression(), context)) {
                    continue;
                }
            }

            if ("END".equals(targetNode.getNodeType())) {
                logAction(instance.getId(), null, targetNode.getId().toString(),
                        "NODE_ENTER", operatorId, "到达结束节点");
                completeInstance(instance, operatorId);
                return;
            }

            if ("PARALLEL_SPLIT".equals(targetNode.getNodeType())) {
                activateStructuralNode(instance, targetNode, versionNodes, nextNodeIds, createdNodeIds, operatorId, context);
                continue;
            }
            if ("PARALLEL_JOIN".equals(targetNode.getNodeType())) {
                if (parallelJoinReady(instance, targetNode)) {
                    activateStructuralNode(instance, targetNode, versionNodes, nextNodeIds, createdNodeIds, operatorId, context);
                }
                continue;
            }

            // Create task on target node
            if (!createdNodeIds.add(targetNode.getId())) continue;
            nextNodeIds.add(targetNode.getId());
            createTaskForNode(instance, targetNode, operatorId);
        }

        instance.setCurrentNodeIds(nextNodeIds.isEmpty() ? null : joinIds(new ArrayList<>(nextNodeIds)));
        instanceRepository.save(instance);
    }

    private void activateStructuralNode(WorkflowInstance instance, WorkflowNode node, List<WorkflowNode> versionNodes,
                                        Set<Long> activeNodeIds, Set<Long> visitedStructuralNodes,
                                        String operatorId, Map<String, Object> context) {
        if (!visitedStructuralNodes.add(node.getId())) return;
        for (WorkflowEdge edge : edgeRepository.findBySourceNodeId(node.getId())) {
            WorkflowNode target = versionNodes.stream().filter(candidate -> candidate.getId().equals(edge.getTargetNodeId())).findFirst().orElse(null);
            if (target == null) continue;
            if ("END".equals(target.getNodeType())) { completeInstance(instance, operatorId); return; }
            if ("PARALLEL_SPLIT".equals(target.getNodeType())) {
                activateStructuralNode(instance, target, versionNodes, activeNodeIds, visitedStructuralNodes, operatorId, context);
            } else if ("PARALLEL_JOIN".equals(target.getNodeType())) {
                if (parallelJoinReady(instance, target)) activateStructuralNode(instance, target, versionNodes, activeNodeIds, visitedStructuralNodes, operatorId, context);
            } else if (activeNodeIds.add(target.getId())) {
                createTaskForNode(instance, target, operatorId);
            }
        }
    }

    private boolean parallelJoinReady(WorkflowInstance instance, WorkflowNode joinNode) {
        Set<Long> completedNodes = new HashSet<>();
        taskRepository.findByInstanceId(instance.getId()).stream()
                .filter(task -> "COMPLETED".equals(task.getStatus()))
                .map(WorkflowTask::getNodeId).forEach(completedNodes::add);
        return edgeRepository.findByTargetNodeId(joinNode.getId()).stream()
                .allMatch(edge -> completedNodes.contains(edge.getSourceNodeId()));
    }

    private void createTaskForNode(WorkflowInstance instance, WorkflowNode node, String operatorId) {
        // Determine assignee from node properties
        ResolvedAssignees resolved = resolveAssignees(instance, node);
        String assigneeId = resolved.userIds().stream().findFirst().orElse(resolved.legacyAssignee());
        if (assigneeId == null && resolved.hasConfiguredSubjects()) {
            throw new BusinessException(ErrorCode.WF_007, "节点未解析到可用处理人");
        }

        WorkflowTask task = WorkflowTask.builder()
                .id(idGenerator.nextId())
                .instanceId(instance.getId())
                .nodeId(node.getId())
                .taskType(determineTaskType(node.getNodeType()))
                .status("PENDING")
                .assigneeId(assigneeId)
                .candidateSnapshot(resolved.snapshotJson())
                .createdAt(LocalDateTime.now())
                .build();
        taskRepository.save(task);

        logAction(instance.getId(), task.getId(), node.getId().toString(),
                "TASK_CREATE", operatorId,
                "创建任务: node=" + node.getName() + ", assignee=" + assigneeId + ", candidates=" + resolved.userIds().size());
    }

    private void completeInstance(WorkflowInstance instance, String operatorId) {
        instance.setStatus("COMPLETED");
        instance.setCompletedAt(LocalDateTime.now());
        instance.setCurrentNodeIds(null);
        instanceRepository.save(instance);

        logAction(instance.getId(), null, "-", "INSTANCE_COMPLETE", operatorId, "流程实例完成");
    }

    private void handleRejection(WorkflowInstance instance, WorkflowTask task, String operatorId) {
        taskRepository.findByInstanceId(instance.getId()).forEach(other -> {
            if (!other.getId().equals(task.getId())
                    && ("PENDING".equals(other.getStatus()) || "PROCESSING".equals(other.getStatus()))) {
                other.setStatus("TERMINATED");
                other.setCompletedAt(LocalDateTime.now());
                taskRepository.save(other);
            }
        });
        if ("DHR_SUMMARY".equals(instance.getBusinessType()) || hasParallelSplitAncestor(task.getNodeId())) {
            terminateInstance(instance);
            return;
        }
        // P0: reject to previous node. Find incoming edges to current node.
        List<WorkflowEdge> incomingEdges = edgeRepository.findByTargetNodeId(task.getNodeId());
        if (!incomingEdges.isEmpty()) {
            WorkflowNode previousNode = nodeRepository.findById(incomingEdges.get(0).getSourceNodeId())
                    .orElse(null);
            if (previousNode != null && !"START".equals(previousNode.getNodeType())
                    && !"PARALLEL_SPLIT".equals(previousNode.getNodeType())) {
                createTaskForNode(instance, previousNode, operatorId);
                instance.setCurrentNodeIds(previousNode.getId().toString());
                instanceRepository.save(instance);
                return;
            }
        }
        // Fallback: terminate
        terminateInstance(instance);
    }

    private boolean hasParallelSplitAncestor(Long nodeId) {
        ArrayDeque<Long> pending = new ArrayDeque<>();
        Set<Long> visited = new HashSet<>();
        pending.add(nodeId);
        while (!pending.isEmpty()) {
            Long current = pending.remove();
            if (!visited.add(current)) continue;
            for (WorkflowEdge incoming : edgeRepository.findByTargetNodeId(current)) {
                WorkflowNode source = nodeRepository.findById(incoming.getSourceNodeId()).orElse(null);
                if (source == null) continue;
                if ("PARALLEL_SPLIT".equals(source.getNodeType())) return true;
                if (!"START".equals(source.getNodeType())) pending.add(source.getId());
            }
        }
        return false;
    }

    private void terminateInstance(WorkflowInstance instance) {
        instance.setStatus("TERMINATED");
        instance.setCompletedAt(LocalDateTime.now());
        instance.setCurrentNodeIds(null);
        instanceRepository.save(instance);
    }

    private boolean evaluateCondition(String conditionExprStr, Map<String, Object> context) {
        if (conditionExprStr == null) return true;
        try {
            JsonNode conditionExpr = objectMapper.readTree(conditionExprStr);
            if (!conditionExpr.has("field")) return true;
            String field = conditionExpr.get("field").asText();
            String expectedValue = conditionExpr.has("value") ? conditionExpr.get("value").asText() : "";
            Object actualValue = context.get(field);
            return expectedValue.equals(actualValue != null ? actualValue.toString() : "");
        } catch (Exception e) {
            return true;
        }
    }

    private ResolvedAssignees resolveAssignees(WorkflowInstance instance, WorkflowNode node) {
        try {
            JsonNode props = node.getProperties() == null || node.getProperties().isBlank()
                    ? objectMapper.createObjectNode()
                    : objectMapper.readTree(node.getProperties());
            List<SubjectReference> refs = new ArrayList<>();
            collectSubjects(props.get("approverSubjects"), refs);
            JsonNode config = props.get("config");
            if (config != null) {
                collectSubjects(config.get("approverSubjects"), refs);
                JsonNode rules = config.get("permissionGroupRules");
                if (rules != null && rules.isArray()) rules.forEach(rule -> collectSubjects(rule.get("subjects"), refs));
            }
            Long tenantId = resolveInstanceTenant(instance);
            SubjectResolution resolution = refs.isEmpty() ? new SubjectResolution(List.of(), Set.of()) : subjectResolver.resolve(tenantId, refs);
            Map<String, Object> sources = new LinkedHashMap<>();
            for (var user : resolution.users()) {
                sources.put(user.userId().toString(), user.sources());
            }
            if (isRecordControlInstance(instance)) {
                sources.remove(instance.getInitiatorId());
            }
            String legacy = props.has("assigneeId") ? props.get("assigneeId").asText(null)
                    : props.has("assigneeRole") ? "role:" + props.get("assigneeRole").asText() : null;
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("userIds", sources.keySet());
            snapshot.put("sources", sources);
            snapshot.put("unresolvedSubjects", resolution.unresolvedSubjects());
            if (refs.isEmpty()) snapshot.put("unrestricted", true);
            return new ResolvedAssignees(sources.keySet(), sources, legacy, !refs.isEmpty(), objectMapper.writeValueAsString(snapshot));
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.WF_007, "节点处理人配置无法解析: " + node.getName());
        }
    }

    private Long resolveInstanceTenant(WorkflowInstance instance) {
        try {
            return userAccountRepository.findById(Long.valueOf(instance.getInitiatorId()))
                    .map(user -> user.getTenantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.WF_007, "无法确定流程实例租户"));
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.WF_007, "无法确定流程实例租户");
        }
    }

    private boolean hasConfiguredSubjects(WorkflowNode node) {
        if (node.getProperties() == null) return false;
        try {
            JsonNode props = objectMapper.readTree(node.getProperties());
            JsonNode config = props.path("config");
            JsonNode rules = config.get("permissionGroupRules");
            return (props.has("approverSubjects") && props.get("approverSubjects").isArray()
                    && !props.get("approverSubjects").isEmpty())
                    || (rules != null && rules.isArray() && !rules.isEmpty())
                    || (config.has("approverSubjects") && config.get("approverSubjects").isArray()
                    && !config.get("approverSubjects").isEmpty());
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.WF_007, "节点处理人配置无法解析: " + node.getName());
        }
    }

    private boolean isFormProcessDefinition(WorkflowDefinition definition) {
        return definition != null && "FORM_PROCESS".equals(definition.getType());
    }

    private boolean isFormProcessInstance(WorkflowInstance instance) {
        if (instance == null || instance.getDefinitionId() == null) return false;
        return definitionRepository.findById(instance.getDefinitionId())
                .map(this::isFormProcessDefinition)
                .orElse(false);
    }

    private boolean isRecordControlInstance(WorkflowInstance instance) {
        return instance != null && ("CHANGE".equals(instance.getBusinessType())
                || "OBSOLETE".equals(instance.getBusinessType()));
    }

    private boolean isUnrestrictedSnapshot(String snapshot) {
        if (snapshot == null || snapshot.isBlank()) return false;
        try {
            return objectMapper.readTree(snapshot).path("unrestricted").asBoolean(false);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.WF_007, "任务候选人快照损坏");
        }
    }

    private void collectSubjects(JsonNode node, List<SubjectReference> refs) {
        if (node == null || !node.isArray()) return;
        node.forEach(item -> {
            try {
                String type = item.has("type") ? item.get("type").asText() : null;
                long id = item.has("id") ? item.get("id").asLong() : 0;
                if (type == null || id == 0) throw new IllegalArgumentException("missing subject type or id");
                SubjectReference.SubjectType subjectType = SubjectReference.SubjectType.valueOf(type.toUpperCase(Locale.ROOT));
                SubjectReference.DepartmentScope scope = item.has("departmentScope")
                        ? SubjectReference.DepartmentScope.valueOf(item.get("departmentScope").asText().toUpperCase(Locale.ROOT)) : null;
                refs.add(new SubjectReference(subjectType, id, scope));
            } catch (Exception e) {
                throw new BusinessException(ErrorCode.WF_007, "节点处理人配置包含无效主体");
            }
        });
    }

    private Set<String> parseCandidateIds(String snapshot) {
        if (snapshot == null || snapshot.isBlank()) return Set.of();
        try {
            JsonNode ids = objectMapper.readTree(snapshot).path("userIds");
            Set<String> result = new LinkedHashSet<>();
            if (ids.isArray()) ids.forEach(id -> result.add(id.asText()));
            return result;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.WF_007, "任务候选人快照损坏");
        }
    }

    private record ResolvedAssignees(Collection<String> userIds, Map<String, Object> sources,
                                     String legacyAssignee, boolean hasConfiguredSubjects, String snapshotJson) {
        static ResolvedAssignees empty() { return new ResolvedAssignees(List.of(), Map.of(), null, false, null); }
    }

    private String resolveTaskStatus(String action) {
        return switch (action) {
            case "APPROVE", "SUBMIT" -> "COMPLETED";
            case "REJECT" -> "REJECTED";
            case "TRANSFER" -> "TRANSFERRED";
            default -> "COMPLETED";
        };
    }

    private String determineTaskType(String nodeType) {
        return switch (nodeType) {
            case "APPROVAL" -> "APPROVAL";
            case "FORM", "START" -> "FORM_FILL";
            case "CONDITION" -> "STATUS_CONFIRM";
            default -> "TODO";
        };
    }

    private String joinIds(List<Long> ids) {
        return ids.stream().map(Object::toString).reduce((a, b) -> a + "," + b).orElse("");
    }

    private void logAction(Long instanceId, Long taskId, String nodeId, String action,
                           String operatorId, String comment) {
        WorkflowActionLog logEntry = WorkflowActionLog.builder()
                .id(idGenerator.nextId())
                .instanceId(instanceId)
                .taskId(taskId)
                .nodeId(nodeId)
                .action(action)
                .operatorId(operatorId)
                .operatorName(operatorId)
                .comment(comment)
                .createdAt(LocalDateTime.now())
                .build();
        actionLogRepository.save(logEntry);
    }

    /** Transfer a task to a different assignee. */
    @Transactional
    public void transferTask(Long taskId, String newAssigneeId, String operatorId) {
        assertNotDhrTask(taskId);
        WorkflowTask taskRef = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));
        WorkflowInstance instance = instanceRepository.findByIdForUpdate(taskRef.getInstanceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));
        if (!"RUNNING".equals(instance.getStatus())) {
            throw new BusinessException(ErrorCode.WF_007, "流程实例已结束");
        }
        WorkflowTask task = taskRepository.findByIdForUpdate(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));
        if (!"PENDING".equals(task.getStatus()) && !"PROCESSING".equals(task.getStatus())) {
            throw new BusinessException(ErrorCode.WF_007);
        }
        if (!isTaskOperator(task, operatorId)) {
            throw new BusinessException(ErrorCode.WF_007, "当前用户不是该任务的待处理人");
        }
        validateTransferTarget(newAssigneeId, instance);
        String previousAssignee = task.getAssigneeId() == null ? operatorId : task.getAssigneeId();
        task.setOriginalAssigneeId(previousAssignee);
        task.setAssigneeId(newAssigneeId);
        task.setCandidateSnapshot(singleUserSnapshot(newAssigneeId));
        task.setStatus("PENDING");
        task.setCompletedAt(null);
        taskRepository.save(task);

        logAction(task.getInstanceId(), task.getId(), task.getNodeId().toString(),
                "TASK_TRANSFER", operatorId, "转办: " + previousAssignee + " -> " + newAssigneeId);
    }

    /** Terminate a workflow instance (requires intervention). */
    @Transactional
    public void terminateInstance(Long instanceId, String reason, String operatorId, Long signatureId) {
        WorkflowInstance instance = instanceRepository.findByIdForUpdate(instanceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));
        if ("DHR_SUMMARY".equals(instance.getBusinessType())) throw new BusinessException(ErrorCode.WF_007, "请通过 DHR 审核退回整理");
        if (!"RUNNING".equals(instance.getStatus())) {
            throw new BusinessException(ErrorCode.WF_007, "流程实例已结束");
        }
        instance.setStatus("TERMINATED");
        instance.setCompletedAt(LocalDateTime.now());
        instanceRepository.save(instance);
        taskRepository.findByInstanceId(instanceId).forEach(task -> {
            if ("PENDING".equals(task.getStatus()) || "PROCESSING".equals(task.getStatus())) {
                task.setStatus("TERMINATED");
                task.setCompletedAt(LocalDateTime.now());
                taskRepository.save(task);
            }
        });

        logAction(instanceId, null, "-", "INTERVENE", operatorId, "流程终止: " + reason);
    }

    private boolean isTaskOperator(WorkflowTask task, String operatorId) {
        if (operatorId == null) return false;
        if (isUnrestrictedSnapshot(task.getCandidateSnapshot())) return true;
        Set<String> candidateIds = parseCandidateIds(task.getCandidateSnapshot());
        if (!candidateIds.isEmpty()) return candidateIds.contains(operatorId);
        return task.getAssigneeId() != null && task.getAssigneeId().equals(operatorId);
    }

    public void assertNotDhrTask(Long taskId) {
        if (taskId != null) taskRepository.findById(taskId).ifPresent(task -> assertNotDhrInstance(task.getInstanceId()));
    }

    public void assertNotDhrInstance(Long instanceId) {
        if (instanceId != null) instanceRepository.findById(instanceId).ifPresent(instance -> {
            if ("DHR_SUMMARY".equals(instance.getBusinessType())) throw new BusinessException(ErrorCode.WF_007, "DHR 审核证据不能通过通用流程接口修改");
        });
    }

    private void validateTransferTarget(String newAssigneeId, WorkflowInstance instance) {
        if (newAssigneeId == null || newAssigneeId.isBlank()) {
            throw new BusinessException(ErrorCode.WF_007, "转办目标人不能为空");
        }
        try {
            UserAccount target = userAccountRepository.findById(Long.valueOf(newAssigneeId))
                    .orElseThrow(() -> new BusinessException(ErrorCode.WF_007, "转办目标用户不存在"));
            if (!"ACTIVE".equals(target.getStatus()) || !Objects.equals(target.getTenantId(), resolveInstanceTenant(instance))) {
                throw new BusinessException(ErrorCode.WF_007, "转办目标用户不可用");
            }
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.WF_007, "转办目标用户无效");
        }
    }

    private String singleUserSnapshot(String userId) {
        try {
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("userIds", List.of(userId));
            snapshot.put("sources", Map.of(userId, List.of(Map.of("type", "TRANSFER"))));
            snapshot.put("unresolvedSubjects", List.of());
            return objectMapper.writeValueAsString(snapshot);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.WF_007, "无法创建转办任务快照");
        }
    }

    private String workflowSnapshotHash(WorkflowDefinitionVersion version) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String source = Objects.toString(version.getNodesJson(), "") + "\n"
                    + Objects.toString(version.getEdgesJson(), "");
            return HexFormat.of().formatHex(digest.digest(source.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.GENERAL_002, "无法生成流程版本快照摘要");
        }
    }

    private WorkflowInstance requireMatchingIdempotentStart(
            WorkflowInstance instance,
            Long definitionId,
            Long versionId,
            String businessType,
            String businessId,
            String initiatorId,
            Long applicantSignatureId,
            String auditCorrelationId
    ) {
        if (Objects.equals(instance.getDefinitionId(), definitionId)
                && Objects.equals(instance.getVersionId(), versionId)
                && Objects.equals(instance.getBusinessType(), businessType)
                && Objects.equals(instance.getBusinessId(), businessId)
                && Objects.equals(instance.getInitiatorId(), initiatorId)
                && Objects.equals(instance.getAuditCorrelationId(), auditCorrelationId)
                && contextValueMatches(instance.getContextSnapshot(), "applicantSignatureId", applicantSignatureId)) {
            return instance;
        }
        throw new BusinessException(ErrorCode.WF_015);
    }

    private boolean contextValueMatches(String contextSnapshot, String field, Object expected) {
        if (contextSnapshot == null || contextSnapshot.isBlank()) {
            return expected == null;
        }
        try {
            JsonNode value = objectMapper.readTree(contextSnapshot).path(field);
            return expected == null ? value.isNull() || value.isMissingNode() : expected.toString().equals(value.asText());
        } catch (Exception exception) {
            return false;
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new BusinessException(ErrorCode.GENERAL_002, "无法保存流程上下文快照");
        }
    }
}
