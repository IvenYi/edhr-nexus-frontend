package com.zencas.edhr.workflow.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Core workflow engine.
 * Handles instance creation, node progression, parallel gateway aggregation,
 * task creation, and conditional branching for both review and transaction workflows.
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

    /**
     * Create a new workflow instance by matching a business type to a binding rule.
     */
    @Transactional
    public WorkflowInstance createInstance(String businessType, String businessId, String initiatorId) {
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

        // Progress to next nodes after START
        progressFromNode(instance, startNode, initiatorId, null);

        return instance;
    }

    /**
     * Process task completion and advance the workflow.
     */
    @Transactional
    public void completeTask(Long taskId, String action, String opinion, String operatorId, Long signatureId) {
        WorkflowTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));

        if (!"PENDING".equals(task.getStatus()) && !"PROCESSING".equals(task.getStatus())) {
            throw new BusinessException(ErrorCode.WF_007);
        }

        task.setStatus(resolveTaskStatus(action));
        task.setAction(action);
        task.setOpinion(opinion);
        task.setSignatureId(signatureId);
        task.setCompletedAt(LocalDateTime.now());
        taskRepository.save(task);

        WorkflowInstance instance = instanceRepository.findById(task.getInstanceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));

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

        // For PARALLEL_GATEWAY nodes, check aggregation
        // Check if we're waiting for other parallel branches
        if (isPartOfParallelBranch(currentNode, versionNodes, outgoingEdges)) {
            // Check if all siblings are complete
            if (!currentActiveNodes.isEmpty()) {
                // Still waiting for siblings
                instance.setCurrentNodeIds(String.join(",", currentActiveNodes));
                instanceRepository.save(instance);
                return;
            }
        }

        // Process outgoing edges - for each edge, create tasks on target nodes
        List<Long> nextNodeIds = new ArrayList<>();
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

            nextNodeIds.add(targetNode.getId());

            if ("END".equals(targetNode.getNodeType())) {
                logAction(instance.getId(), null, targetNode.getId().toString(),
                        "NODE_ENTER", operatorId, "到达结束节点");
                completeInstance(instance, operatorId);
                return;
            }

            // Create task on target node
            createTaskForNode(instance, targetNode, operatorId);
        }

        instance.setCurrentNodeIds(nextNodeIds.isEmpty() ? null : joinIds(nextNodeIds));
        instanceRepository.save(instance);
    }

    private void createTaskForNode(WorkflowInstance instance, WorkflowNode node, String operatorId) {
        // Determine assignee from node properties
        String assigneeId = resolveAssignee(node);

        WorkflowTask task = WorkflowTask.builder()
                .id(idGenerator.nextId())
                .instanceId(instance.getId())
                .nodeId(node.getId())
                .taskType(determineTaskType(node.getNodeType()))
                .status("PENDING")
                .assigneeId(assigneeId)
                .createdAt(LocalDateTime.now())
                .build();
        taskRepository.save(task);

        logAction(instance.getId(), task.getId(), node.getId().toString(),
                "TASK_CREATE", operatorId,
                "创建任务: node=" + node.getName() + ", assignee=" + assigneeId);
    }

    private void completeInstance(WorkflowInstance instance, String operatorId) {
        instance.setStatus("COMPLETED");
        instance.setCompletedAt(LocalDateTime.now());
        instance.setCurrentNodeIds(null);
        instanceRepository.save(instance);

        logAction(instance.getId(), null, "-", "INSTANCE_COMPLETE", operatorId, "流程实例完成");
    }

    private void handleRejection(WorkflowInstance instance, WorkflowTask task, String operatorId) {
        // P0: reject to previous node. Find incoming edges to current node.
        List<WorkflowEdge> incomingEdges = edgeRepository.findByTargetNodeId(task.getNodeId());
        if (!incomingEdges.isEmpty()) {
            WorkflowNode previousNode = nodeRepository.findById(incomingEdges.get(0).getSourceNodeId())
                    .orElse(null);
            if (previousNode != null && !"START".equals(previousNode.getNodeType())) {
                createTaskForNode(instance, previousNode, operatorId);
                instance.setCurrentNodeIds(previousNode.getId().toString());
                instanceRepository.save(instance);
                return;
            }
        }
        // Fallback: terminate
        instance.setStatus("TERMINATED");
        instance.setCompletedAt(LocalDateTime.now());
        instanceRepository.save(instance);
    }

    private boolean isPartOfParallelBranch(WorkflowNode node, List<WorkflowNode> versionNodes,
                                            List<WorkflowEdge> outgoingEdges) {
        // Check if there's a PARALLEL_GATEWAY node in the same version that feeds into this path
        return versionNodes.stream().anyMatch(n -> "PARALLEL_GATEWAY".equals(n.getNodeType()));
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

    private String resolveAssignee(WorkflowNode node) {
        if (node.getProperties() == null) return null;
        try {
            JsonNode props = objectMapper.readTree(node.getProperties());
            if (props.has("assigneeId")) return props.get("assigneeId").asText();
            if (props.has("assigneeRole")) return "role:" + props.get("assigneeRole").asText();
        } catch (Exception e) {
            return null;
        }
        return null;
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
            case "FORM" -> "FORM_FILL";
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
        WorkflowTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));
        task.setOriginalAssigneeId(task.getAssigneeId());
        task.setAssigneeId(newAssigneeId);
        task.setStatus("TRANSFERRED");
        task.setCompletedAt(LocalDateTime.now());
        taskRepository.save(task);

        // Create new task for the new assignee
        WorkflowTask newTask = WorkflowTask.builder()
                .id(idGenerator.nextId())
                .instanceId(task.getInstanceId())
                .nodeId(task.getNodeId())
                .taskType(task.getTaskType())
                .status("PENDING")
                .assigneeId(newAssigneeId)
                .originalAssigneeId(task.getOriginalAssigneeId())
                .createdAt(LocalDateTime.now())
                .build();
        taskRepository.save(newTask);

        logAction(task.getInstanceId(), newTask.getId(), task.getNodeId().toString(),
                "TASK_TRANSFER", operatorId, "转办: " + task.getAssigneeId() + " -> " + newAssigneeId);
    }

    /** Terminate a workflow instance (requires intervention). */
    @Transactional
    public void terminateInstance(Long instanceId, String reason, String operatorId, Long signatureId) {
        WorkflowInstance instance = instanceRepository.findById(instanceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_005));
        instance.setStatus("TERMINATED");
        instance.setCompletedAt(LocalDateTime.now());
        instanceRepository.save(instance);

        logAction(instanceId, null, "-", "INTERVENE", operatorId, "流程终止: " + reason);
    }
}
