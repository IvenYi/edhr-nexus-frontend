package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.entity.WorkflowEdge;
import com.zencas.edhr.workflow.entity.WorkflowNode;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.repository.WorkflowEdgeRepository;
import com.zencas.edhr.workflow.repository.WorkflowNodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Workflow template (definition) controller with full lifecycle management.
 */
@RestController
@RequestMapping("/api/v1/workflow/review-templates")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('workflow.review-templates')")
public class WorkflowTemplateController {

    private static final String RECORD_CONTROL_WORKFLOW_TYPE = "RECORD_CONTROL";

    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowDefinitionVersionRepository versionRepository;
    private final WorkflowNodeRepository nodeRepository;
    private final WorkflowEdgeRepository edgeRepository;
    private final AuditEventRepository auditEventRepository;
    private final SnowflakeIdGenerator idGenerator;
    private static final ObjectMapper GRAPH_MAPPER = new ObjectMapper();

    // ======================== Template CRUD ========================

    @GetMapping
    public ApiResponse<PageResult<ReviewTemplateSummary>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) String keyword) {
        validateBusinessType(businessType);
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<WorkflowDefinition> result = workflowDefinitionRepository.findReviewTemplates(
                RECORD_CONTROL_WORKFLOW_TYPE, businessType, keyword, pageable);
        List<ReviewTemplateSummary> content = result.getContent().stream().map(definition -> {
            List<WorkflowDefinitionVersion> versions = versionRepository
                    .findByDefinitionIdOrderByVersionNumberDesc(definition.getId());
            WorkflowDefinitionVersion current = versions.stream()
                    .filter(version -> "PUBLISHED".equals(version.getStatus()) && Boolean.TRUE.equals(version.getIsCurrent()))
                    .findFirst().orElse(null);
            WorkflowDefinitionVersion draft = versions.stream()
                    .filter(version -> "DRAFT".equals(version.getStatus()))
                    .findFirst().orElse(null);
            return ReviewTemplateSummary.from(definition, current, draft, versions.size());
        }).toList();
        return ApiResponse.success(PageResult.of(
                content, page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowDefinition> getById(@PathVariable Long id) {
        return ApiResponse.success(findReviewDefinition(id));
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAuthority('workflow.review-templates') and hasAuthority('workflow.template.edit')")
    public ApiResponse<WorkflowDefinition> create(@RequestBody WorkflowDefinition entity) {
        validateBusinessType(entity.getBusinessType());
        if (entity.getId() == null) {
            entity.setId(idGenerator.nextId());
        }
        entity.setType(RECORD_CONTROL_WORKFLOW_TYPE);
        WorkflowDefinition saved = workflowDefinitionRepository.save(entity);
        recordAudit("RECORD_CONTROL_TEMPLATE", saved.getId(), "CREATE", Map.of(), definitionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAuthority('workflow.review-templates') and hasAuthority('workflow.template.edit')")
    public ApiResponse<WorkflowDefinition> update(@PathVariable Long id, @RequestBody WorkflowDefinition entity) {
        WorkflowDefinition existing = findReviewDefinition(id);
        validateBusinessType(entity.getBusinessType());
        Map<String, Object> before = definitionSnapshot(existing);
        existing.setName(entity.getName());
        existing.setCode(entity.getCode());
        existing.setDescription(entity.getDescription());
        existing.setBusinessType(entity.getBusinessType());
        existing.setUpdatedAt(LocalDateTime.now());
        WorkflowDefinition saved = workflowDefinitionRepository.save(existing);
        recordAudit("RECORD_CONTROL_TEMPLATE", saved.getId(), "UPDATE", before, definitionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAuthority('workflow.review-templates') and hasAuthority('workflow.template.edit')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        WorkflowDefinition definition = findReviewDefinition(id);
        Map<String, Object> before = definitionSnapshot(definition);
        List<WorkflowDefinitionVersion> versions = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id);
        if (versions.stream().anyMatch(version -> !"DRAFT".equals(version.getStatus()))) {
            throw new BusinessException(ErrorCode.WF_002, "模板存在已发布或历史版本，不能删除");
        }
        for (WorkflowDefinitionVersion version : versions) {
            edgeRepository.deleteAll(edgeRepository.findByVersionId(version.getId()));
            nodeRepository.deleteAll(nodeRepository.findByVersionId(version.getId()));
        }
        versionRepository.deleteAll(versions);
        versionRepository.flush();
        workflowDefinitionRepository.deleteById(id);
        recordAudit("RECORD_CONTROL_TEMPLATE", id, "DELETE", before, Map.of());
        return ApiResponse.success(null);
    }

    // ======================== Version Management ========================

    /**
     * List all versions of a template, ordered by version number descending.
     */
    @GetMapping("/{id}/versions")
    public ApiResponse<List<WorkflowDefinitionVersion>> listVersions(@PathVariable Long id) {
        findReviewDefinition(id);
        List<WorkflowDefinitionVersion> versions = versionRepository
                .findByDefinitionIdOrderByVersionNumberDesc(id);
        return ApiResponse.success(versions);
    }

    /**
     * Get a specific version of a template.
     */
    @GetMapping("/{id}/versions/{versionId}")
    public ApiResponse<WorkflowDefinitionVersion> getVersion(
            @PathVariable Long id, @PathVariable Long versionId) {
        findReviewDefinition(id);
        return versionRepository.findById(versionId)
                .filter(version -> id.equals(version.getDefinitionId()))
                .map(ApiResponse::success)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));
    }

    /**
     * Create a new draft version by copying the latest version's nodes and edges.
     */
    @PostMapping("/{id}/versions")
    @Transactional
    @PreAuthorize("hasAuthority('workflow.review-templates') and hasAuthority('workflow.template.edit')")
    public ApiResponse<WorkflowDefinitionVersion> createDraftVersion(@PathVariable Long id) {
        findReviewDefinition(id);

        if (versionRepository.findByDefinitionIdAndStatus(id, "DRAFT").isPresent()) {
            throw new BusinessException(ErrorCode.WF_002, "当前已有编辑中的草稿流程");
        }

        // Find the latest version to copy from
        List<WorkflowDefinitionVersion> existingVersions = versionRepository
                .findByDefinitionIdOrderByVersionNumberDesc(id);
        int nextVersionNumber = existingVersions.isEmpty() ? 1 :
                existingVersions.get(0).getVersionNumber() + 1;

        // Create new version
        WorkflowDefinitionVersion newVersion = WorkflowDefinitionVersion.builder()
                .id(idGenerator.nextId())
                .definitionId(id)
                .versionNumber(nextVersionNumber)
                .status("DRAFT")
                .isCurrent(false)
                .createdAt(LocalDateTime.now())
                .build();

        // If there is a previous version, copy its nodes and edges
        if (!existingVersions.isEmpty()) {
            WorkflowDefinitionVersion previous = existingVersions.get(0);
            newVersion.setNodesJson(previous.getNodesJson());
            newVersion.setEdgesJson(previous.getEdgesJson());

            // Copy nodes and build old-to-new ID mapping
            Map<Long, Long> nodeIdMapping = new HashMap<>();
            List<WorkflowNode> previousNodes = nodeRepository.findByVersionId(previous.getId());
            for (WorkflowNode node : previousNodes) {
                long newNodeId = idGenerator.nextId();
                nodeIdMapping.put(node.getId(), newNodeId);
                WorkflowNode newNode = WorkflowNode.builder()
                        .id(newNodeId)
                        .versionId(newVersion.getId())
                        .nodeType(node.getNodeType())
                        .name(node.getName())
                        .positionX(node.getPositionX())
                        .positionY(node.getPositionY())
                        .properties(node.getProperties())
                        .sortOrder(node.getSortOrder())
                        .createdAt(LocalDateTime.now())
                        .build();
                nodeRepository.save(newNode);
            }

            // Copy edges, remapping source/target node IDs to the new versions
            List<WorkflowEdge> previousEdges = edgeRepository.findByVersionId(previous.getId());
            for (WorkflowEdge edge : previousEdges) {
                Long newSourceId = nodeIdMapping.get(edge.getSourceNodeId());
                Long newTargetId = nodeIdMapping.get(edge.getTargetNodeId());
                WorkflowEdge newEdge = WorkflowEdge.builder()
                        .id(idGenerator.nextId())
                        .versionId(newVersion.getId())
                        .sourceNodeId(newSourceId != null ? newSourceId : edge.getSourceNodeId())
                        .targetNodeId(newTargetId != null ? newTargetId : edge.getTargetNodeId())
                        .label(edge.getLabel())
                        .conditionExpression(edge.getConditionExpression())
                        .createdAt(LocalDateTime.now())
                        .build();
                edgeRepository.save(newEdge);
            }
        }

        versionRepository.save(newVersion);
        recordAudit("RECORD_CONTROL_FLOW_VERSION", newVersion.getId(), "CREATE", Map.of(), versionSnapshot(newVersion));
        return ApiResponse.success(newVersion);
    }

    /**
     * Publish a draft version, making it the current active version.
     */
    @PostMapping("/{id}/versions/{versionId}/publish")
    @Transactional
    @PreAuthorize("hasAuthority('workflow.review-templates') and hasAuthority('workflow.template.publish')")
    public ApiResponse<WorkflowDefinitionVersion> publishVersion(
            @PathVariable Long id, @PathVariable Long versionId) {
        findReviewDefinition(id);

        WorkflowDefinitionVersion version = versionRepository.findById(versionId)
                .filter(candidate -> id.equals(candidate.getDefinitionId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));

        if (!"DRAFT".equals(version.getStatus())) {
            throw new BusinessException(ErrorCode.WF_002, "只有草稿状态的版本才能发布");
        }

        validateAndSyncGraph(version, version.getNodesJson(), version.getEdgesJson(), true,
                RECORD_CONTROL_WORKFLOW_TYPE.equals(findReviewDefinition(id).getType()));

        // Unset current flag on all other versions
        List<WorkflowDefinitionVersion> allVersions = versionRepository
                .findByDefinitionIdOrderByVersionNumberDesc(id);
        for (WorkflowDefinitionVersion v : allVersions) {
            if (Boolean.TRUE.equals(v.getIsCurrent())) {
                v.setIsCurrent(false);
                versionRepository.save(v);
            }
        }

        // Publish this version
        version.setStatus("PUBLISHED");
        version.setIsCurrent(true);
        version.setPublishedAt(LocalDateTime.now());
        WorkflowDefinitionVersion saved = versionRepository.save(version);
        WorkflowDefinition definition = findReviewDefinition(id);
        definition.setStatus("PUBLISHED");
        definition.setUpdatedAt(LocalDateTime.now());
        workflowDefinitionRepository.save(definition);
        versionRepository.flush();
        WorkflowDefinitionVersion next = WorkflowDefinitionVersion.builder().id(idGenerator.nextId()).definitionId(id)
                .versionNumber(saved.getVersionNumber() + 1).status("DRAFT").isCurrent(false)
                .nodesJson(saved.getNodesJson()).edgesJson(saved.getEdgesJson()).createdAt(LocalDateTime.now()).build();
        versionRepository.save(next);
        recordAudit("RECORD_CONTROL_FLOW_VERSION", saved.getId(), "PUBLISH", Map.of(), versionSnapshot(saved));

        return ApiResponse.success(saved);
    }

    @PutMapping("/{id}/versions/{versionId}/graph")
    @Transactional
    @PreAuthorize("hasAuthority('workflow.review-templates') and hasAuthority('workflow.template.edit')")
    public ApiResponse<WorkflowDefinitionVersion> saveGraph(@PathVariable Long id, @PathVariable Long versionId, @RequestBody Map<String, Object> payload) {
        findReviewDefinition(id);
        WorkflowDefinitionVersion version = versionRepository.findById(versionId).filter(candidate -> id.equals(candidate.getDefinitionId())).orElseThrow(() -> new BusinessException(ErrorCode.WF_010));
        if (!"DRAFT".equals(version.getStatus())) throw new BusinessException(ErrorCode.WF_002, "只有草稿状态的版本才能编辑");
        try {
            String nodesJson = GRAPH_MAPPER.writeValueAsString(payload.getOrDefault("nodes", List.of()));
            String edgesJson = GRAPH_MAPPER.writeValueAsString(payload.getOrDefault("edges", List.of()));
            validateAndSyncGraph(version, nodesJson, edgesJson, false,
                    RECORD_CONTROL_WORKFLOW_TYPE.equals(findReviewDefinition(id).getType()));
            version.setNodesJson(nodesJson);
            version.setEdgesJson(edgesJson);
        } catch (BusinessException exception) { throw exception;
        } catch (Exception exception) { throw new BusinessException(ErrorCode.GENERAL_001, "流程图数据格式不正确"); }
        WorkflowDefinitionVersion saved = versionRepository.save(version);
        recordAudit("RECORD_CONTROL_FLOW_VERSION", saved.getId(), "UPDATE_GRAPH", Map.of(), versionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    private void validateAndSyncGraph(WorkflowDefinitionVersion version, String nodesJson, String edgesJson,
                                      boolean requirePublishable, boolean recordControl) {
        try {
            JsonNode nodes = GRAPH_MAPPER.readTree(nodesJson);
            JsonNode edges = GRAPH_MAPPER.readTree(edgesJson);
            if (!nodes.isArray() || !edges.isArray()) throw invalidGraph("流程图数据格式不正确");
            Set<String> ids = new HashSet<>();
            String start = null, end = null;
            Set<String> allowed = Set.of("START", "APPROVAL", "PARALLEL_SPLIT", "PARALLEL_JOIN", "END");
            for (JsonNode node : nodes) {
                String nodeId = node.path("id").asText("").trim();
                String kind = node.path("data").path("kind").asText("").trim();
                if (nodeId.isBlank() || !ids.add(nodeId) || !allowed.contains(kind)) throw invalidGraph("流程节点数据不合法");
                if ("START".equals(kind)) { if (start != null) throw invalidGraph("流程只能有一个开始节点"); start = nodeId; }
                if ("END".equals(kind)) { if (end != null) throw invalidGraph("流程只能有一个结束节点"); end = nodeId; }
            }
            Map<String, String> kinds = new HashMap<>();
            Map<String, List<String>> outgoing = new HashMap<>();
            Map<String, List<String>> incoming = new HashMap<>();
            for (JsonNode node : nodes) { String nodeId = node.path("id").asText(); kinds.put(nodeId, node.path("data").path("kind").asText()); outgoing.put(nodeId, new ArrayList<>()); incoming.put(nodeId, new ArrayList<>()); }
            Set<String> edgeKeys = new HashSet<>();
            for (JsonNode edge : edges) {
                String source = edge.path("source").asText(""); String target = edge.path("target").asText("");
                if (!kinds.containsKey(source) || !kinds.containsKey(target) || source.equals(target) || !edgeKeys.add(source + "->" + target)) throw invalidGraph("流程连线数据不合法");
                outgoing.get(source).add(target);
                incoming.get(target).add(source);
            }
            for (JsonNode node : nodes) {
                String kind = node.path("data").path("kind").asText("");
                if ("START".equals(kind) || "APPROVAL".equals(kind)) {
                    validateButtonConfiguration(node.path("data").path("config"), "START".equals(kind), recordControl);
                }
            }
            if (requirePublishable) {
                validatePublishableGraph(ids, kinds, outgoing, incoming, start, end);
                validatePublishableApprovalSubjects(nodes);
            }

            edgeRepository.deleteAll(edgeRepository.findByVersionId(version.getId()));
            nodeRepository.deleteAll(nodeRepository.findByVersionId(version.getId()));
            Map<String, Long> persistedIds = new HashMap<>();
            for (JsonNode node : nodes) {
                String nodeId = node.path("id").asText(); JsonNode data = node.path("data");
                long persistedId = idGenerator.nextId(); persistedIds.put(nodeId, persistedId);
                nodeRepository.save(WorkflowNode.builder().id(persistedId).versionId(version.getId()).nodeType(data.path("kind").asText()).name(data.path("label").asText(nodeId)).positionX(node.path("position").path("x").asInt(0)).positionY(node.path("position").path("y").asInt(0)).properties(data.path("config").isMissingNode() ? null : GRAPH_MAPPER.writeValueAsString(data.path("config"))).sortOrder(0).createdAt(LocalDateTime.now()).build());
            }
            for (JsonNode edge : edges) {
                edgeRepository.save(WorkflowEdge.builder().id(idGenerator.nextId()).versionId(version.getId()).sourceNodeId(persistedIds.get(edge.path("source").asText())).targetNodeId(persistedIds.get(edge.path("target").asText())).label(edge.path("label").asText(null)).conditionExpression(null).createdAt(LocalDateTime.now()).build());
            }
        } catch (BusinessException exception) { throw exception;
        } catch (Exception exception) { throw new BusinessException(ErrorCode.GENERAL_001, "流程图数据格式不正确"); }
    }

    private void validatePublishableGraph(Set<String> ids, Map<String, String> kinds,
                                          Map<String, List<String>> outgoing,
                                          Map<String, List<String>> incoming,
                                          String start, String end) {
            if (ids.isEmpty() || start == null || end == null) throw invalidGraph("流程必须包含开始和结束节点");
            int splitCount = 0, joinCount = 0;
            for (String nodeId : ids) {
                String kind = kinds.get(nodeId); int out = outgoing.get(nodeId).size(); int in = incoming.get(nodeId).size();
                if ("START".equals(kind) && (in != 0 || out != 1)) throw invalidGraph("开始节点必须且只能有一个出口");
                if ("END".equals(kind) && (in != 1 || out != 0)) throw invalidGraph("结束节点必须且只能有一个入口");
                if ("APPROVAL".equals(kind) && (in != 1 || out != 1)) throw invalidGraph("审批节点必须且只能有一个入口和出口");
                if ("PARALLEL_SPLIT".equals(kind)) { splitCount++; if (in != 1 || out < 2) throw invalidGraph("并行拆分必须有一个入口和至少两个出口"); }
                if ("PARALLEL_JOIN".equals(kind)) { joinCount++; if (in < 2 || out != 1) throw invalidGraph("并行聚合必须有至少两个入口和一个出口"); }
            }
            if (splitCount != joinCount) throw invalidGraph("并行拆分与并行聚合必须成对配置");
            Set<String> claimedJoins = new HashSet<>();
            for (String splitId : ids) {
                if (!"PARALLEL_SPLIT".equals(kinds.get(splitId))) continue;
                Set<String> branchJoins = new HashSet<>();
                for (String branchStart : outgoing.get(splitId)) {
                    if ("PARALLEL_JOIN".equals(kinds.get(branchStart))) throw invalidGraph("并行分支至少需要一个审批节点");
                    ArrayDeque<String> branchQueue = new ArrayDeque<>(); Set<String> branchVisited = new HashSet<>(); branchQueue.add(branchStart);
                    String firstJoin = null;
                    while (!branchQueue.isEmpty()) {
                        String current = branchQueue.remove(); if (!branchVisited.add(current)) continue;
                        if ("PARALLEL_SPLIT".equals(kinds.get(current))) throw invalidGraph("MVP 暂不支持嵌套并行流程");
                        if ("PARALLEL_JOIN".equals(kinds.get(current))) { if (firstJoin == null) firstJoin = current; else if (!firstJoin.equals(current)) throw invalidGraph("并行分支不能交叉聚合"); continue; }
                        branchQueue.addAll(outgoing.get(current));
                    }
                    if (firstJoin == null) throw invalidGraph("并行分支必须汇聚到聚合节点");
                    branchJoins.add(firstJoin);
                }
                if (branchJoins.size() != 1 || !claimedJoins.add(branchJoins.iterator().next())) throw invalidGraph("每个并行拆分必须对应唯一聚合节点");
            }
            ArrayDeque<String> queue = new ArrayDeque<>(); Set<String> visited = new HashSet<>(); queue.add(start);
            while (!queue.isEmpty()) { String current = queue.remove(); if (!visited.add(current)) continue; queue.addAll(outgoing.get(current)); }
            if (!visited.contains(end) || visited.size() != ids.size()) throw invalidGraph("流程节点必须全部连通");
            Map<String, Integer> indegree = new HashMap<>(); ids.forEach(nodeId -> indegree.put(nodeId, incoming.get(nodeId).size()));
            ArrayDeque<String> acyclic = new ArrayDeque<>(); indegree.forEach((nodeId, degree) -> { if (degree == 0) acyclic.add(nodeId); }); int processed = 0;
            while (!acyclic.isEmpty()) { String current = acyclic.remove(); processed++; for (String target : outgoing.get(current)) { int degree = indegree.merge(target, -1, Integer::sum); if (degree == 0) acyclic.add(target); } }
            if (processed != ids.size()) throw invalidGraph("流程不能包含环路");
    }

    private void validatePublishableApprovalSubjects(JsonNode nodes) {
        boolean hasApproval = false;
        for (JsonNode node : nodes) {
            if (!"APPROVAL".equals(node.path("data").path("kind").asText("").trim())) continue;
            hasApproval = true;
            if (!hasConfiguredApproverSubjects(node.path("data").path("config"))) {
                String label = node.path("data").path("label").asText("审批");
                throw invalidGraph("审批节点必须配置审批主体：" + label);
            }
        }
        if (!hasApproval) throw invalidGraph("流程必须包含至少一个审批节点");
    }

    private void validateButtonConfiguration(JsonNode config, boolean startNode, boolean recordControl) {
        if (recordControl && startNode) {
            if (config == null || config.isMissingNode() || config.isNull()) return;
            JsonNode startButtons = config.get("buttons");
            if (startButtons != null && !startButtons.isNull()
                    && (!startButtons.isArray() || !startButtons.isEmpty())) {
                throw new BusinessException(ErrorCode.WF_002, "记录控制审批的发起节点不配置按钮");
            }
            JsonNode startEvents = config.get("buttonEvents");
            if (startEvents != null && !startEvents.isNull()
                    && (!startEvents.isArray() || !startEvents.isEmpty())) {
                throw new BusinessException(ErrorCode.WF_002, "记录控制审批的发起节点不配置按钮事件");
            }
            if (config.has("guardMode")) {
                throw new BusinessException(ErrorCode.WF_002, "审批流程不支持表单校验配置");
            }
            return;
        }
        if (config == null || config.isMissingNode() || config.isNull()) {
            if (recordControl) throw new BusinessException(ErrorCode.WF_002, "审批流程必须配置系统固定动作");
            return;
        }
        JsonNode buttons = config.get("buttons");
        if (recordControl && (buttons == null || buttons.isNull() || !buttons.isArray())) {
            throw new BusinessException(ErrorCode.WF_002, "审批流程必须配置系统固定动作");
        }
        if (buttons != null && !buttons.isNull()) {
            if (!buttons.isArray()) throw new BusinessException(ErrorCode.WF_002, "流程按钮配置格式不正确");
            LinkedHashSet<String> seenActions = new LinkedHashSet<>();
            for (JsonNode button : buttons) {
                if (!button.isObject() || !button.path("id").isTextual() || button.path("id").asText().isBlank()
                        || !button.path("label").isTextual() || button.path("label").asText().isBlank()
                        || button.has("enabled")
                        || (button.has("visible") && !button.path("visible").isBoolean())) {
                    throw new BusinessException(ErrorCode.WF_002, "流程按钮字段格式不正确");
                }
                String action = button.path("action").asText("").trim();
                boolean allowed = startNode
                        ? ("SAVE".equals(action) || "SUBMIT".equals(action))
                        : ("APPROVE".equals(action) || "RETURN".equals(action)
                        || (recordControl && "TRANSFER".equals(action)));
                if (action.isBlank() || !allowed) {
                    throw new BusinessException(ErrorCode.WF_002, "流程按钮动作不受支持");
                }
                if (!seenActions.add(action)) {
                    throw new BusinessException(ErrorCode.WF_002, "审批流程固定动作不能重复配置");
                }
                if (button.has("visible") && !button.path("visible").asBoolean(true)) {
                    throw new BusinessException(ErrorCode.WF_002, "审批流程固定动作不能隐藏");
                }
                if (button.has("requireOpinion") && !button.path("requireOpinion").isBoolean()) {
                    throw new BusinessException(ErrorCode.WF_002, "审批意见必填配置格式不正确");
                }
                if (recordControl && "TRANSFER".equals(action) && button.has("requireOpinion")) {
                    throw new BusinessException(ErrorCode.WF_002, "转办不支持审批意见必填配置");
                }
                validateButtonEnum(button, "style", Set.of("PRIMARY", "DEFAULT", "DANGER"), "按钮样式");
                validateButtonEnum(button, "size", Set.of("SMALL", "MEDIUM", "LARGE"), "按钮尺寸");
            }
            Set<String> required = startNode
                    ? Set.of("SAVE", "SUBMIT")
                    : recordControl ? Set.of("APPROVE", "RETURN", "TRANSFER") : Set.of("APPROVE", "RETURN");
            if (!seenActions.containsAll(required) || seenActions.size() != required.size()) {
                throw new BusinessException(ErrorCode.WF_002, "审批流程固定动作不能增删");
            }
        }
        JsonNode events = config.get("buttonEvents");
        if (events != null && !events.isNull()) {
            if (!events.isArray()) throw new BusinessException(ErrorCode.WF_002, "按钮事件配置格式不正确");
            for (JsonNode event : events) {
                if (!event.isObject() || !event.path("id").isTextual() || event.path("id").asText().isBlank()
                        || !event.path("event").isTextual() || !event.path("action").isTextual()
                        || (event.has("enabled") && !event.path("enabled").isBoolean())
                        || (event.has("builtin") && !event.path("builtin").isTextual())
                        || (event.has("handlerId"))) {
                    throw new BusinessException(ErrorCode.WF_002, "按钮事件字段格式不正确");
                }
                String phase = event.path("event").asText("").trim();
                String action = event.path("action").asText("").trim();
                String builtin = event.path("builtin").asText("").trim();
                String signatureMethod = event.path("signatureMethod").asText("").trim();
                boolean allowedAction = startNode
                        ? ("SAVE".equals(action) || "SUBMIT".equals(action))
                        : ("APPROVE".equals(action) || "RETURN".equals(action)
                        || (recordControl && "TRANSFER".equals(action)));
                if (!allowedAction || (recordControl && !builtin.isBlank() && !"NONE".equals(builtin))) {
                    throw new BusinessException(ErrorCode.WF_002, "审批流程电子签名不支持表单字段事件");
                }
                if ((!builtin.isBlank() || !signatureMethod.isBlank()) && !"BEFORE".equals(phase)) {
                    throw new BusinessException(ErrorCode.WF_002, "电子签名事件仅支持执行前处理");
                }
                if (event.has("signatureMethod")) {
                    if (!"BEFORE".equals(phase) || (recordControl && !"NONE".equals(builtin))
                            || !"ACCOUNT_PASSWORD".equals(signatureMethod)
                            || !allowedAction) {
                        throw new BusinessException(ErrorCode.WF_002, "电子签名事件配置不受支持");
                    }
                }
            }
        }
        if (recordControl && config.has("guardMode")) {
            throw new BusinessException(ErrorCode.WF_002, "审批流程不支持表单校验配置");
        }
    }

    private void validateButtonEnum(JsonNode object, String field, Set<String> allowed, String label) {
        if (object == null || object.isMissingNode() || object.isNull() || !object.has(field)) return;
        JsonNode value = object.get(field);
        if (!value.isTextual() || !allowed.contains(value.asText().trim())) {
            throw new BusinessException(ErrorCode.WF_002, label + "配置不受支持");
        }
    }

    private boolean hasConfiguredApproverSubjects(JsonNode config) {
        if (config == null || config.isMissingNode() || config.isNull()) return false;
        JsonNode subjects = config.get("approverSubjects");
        if (subjects != null && subjects.isArray()) {
            for (JsonNode subject : subjects) {
                if (subject != null && subject.isObject()
                        && !subject.path("type").asText("").isBlank()
                        && !subject.path("id").asText("").isBlank()) {
                    return true;
                }
            }
        }
        String legacyApprovers = config.path("approvers").asText("").trim();
        if (legacyApprovers.isEmpty()) return false;
        try {
            JsonNode parsed = GRAPH_MAPPER.readTree(legacyApprovers);
            if (!parsed.isArray()) return false;
            for (JsonNode subject : parsed) {
                if (subject != null && subject.isObject()
                        && !subject.path("type").asText("").isBlank()
                        && !subject.path("id").asText("").isBlank()) {
                    return true;
                }
            }
            return false;
        } catch (Exception ignored) {
            // Preserve only unmistakable pre-structured free-text values. JSON-like content that
            // cannot be parsed must not bypass the required-subject validation.
            return !legacyApprovers.startsWith("[") && !legacyApprovers.startsWith("{");
        }
    }

    private BusinessException invalidGraph(String message) { return new BusinessException(ErrorCode.WF_002, message); }

    /**
     * Revoke a published version, setting it back to draft.
     * If it was the current version, the previous published version becomes current.
     */
    @PostMapping("/{id}/versions/{versionId}/revoke")
    @Transactional
    @PreAuthorize("hasAuthority('workflow.review-templates') and hasAuthority('workflow.template.publish')")
    public ApiResponse<WorkflowDefinitionVersion> revokeVersion(
            @PathVariable Long id, @PathVariable Long versionId) {
        findReviewDefinition(id);

        WorkflowDefinitionVersion version = versionRepository.findById(versionId)
                .filter(candidate -> id.equals(candidate.getDefinitionId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010));

        if (!"PUBLISHED".equals(version.getStatus())) {
            throw new BusinessException(ErrorCode.GENERAL_003, "只有已发布状态的版本才能撤回");
        }

        boolean wasCurrent = Boolean.TRUE.equals(version.getIsCurrent());
        version.setStatus("REVOKED");
        version.setIsCurrent(false);
        versionRepository.save(version);

        // If this was the current version, promote the previous published version
        if (wasCurrent) {
            List<WorkflowDefinitionVersion> versions = versionRepository
                    .findByDefinitionIdOrderByVersionNumberDesc(id);
            for (WorkflowDefinitionVersion v : versions) {
                if ("PUBLISHED".equals(v.getStatus()) && !v.getId().equals(versionId)) {
                    v.setIsCurrent(true);
                    versionRepository.save(v);
                    break;
                }
            }
        }
        WorkflowDefinition definition = findReviewDefinition(id);
        boolean stillPublished = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id).stream()
                .anyMatch(candidate -> "PUBLISHED".equals(candidate.getStatus()) && Boolean.TRUE.equals(candidate.getIsCurrent()));
        definition.setStatus(stillPublished ? "PUBLISHED" : "DRAFT");
        definition.setUpdatedAt(LocalDateTime.now());
        workflowDefinitionRepository.save(definition);
        recordAudit("RECORD_CONTROL_FLOW_VERSION", version.getId(), "REVOKE", Map.of(), versionSnapshot(version));

        return ApiResponse.success(version);
    }

    private WorkflowDefinition findReviewDefinition(Long id) {
        return workflowDefinitionRepository.findById(id)
                .filter(definition -> RECORD_CONTROL_WORKFLOW_TYPE.equals(definition.getType()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001));
    }

    private void validateBusinessType(String businessType) {
        if (businessType == null || businessType.isBlank()
                || (!"CHANGE".equals(businessType) && !"OBSOLETE".equals(businessType))) {
            throw new BusinessException(ErrorCode.GENERAL_003, "审批流程分类仅支持表单变更或表单作废");
        }
    }

    private Map<String, Object> definitionSnapshot(WorkflowDefinition definition) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", definition.getId());
        snapshot.put("name", definition.getName());
        snapshot.put("code", definition.getCode());
        snapshot.put("type", definition.getType());
        snapshot.put("businessType", definition.getBusinessType());
        snapshot.put("status", definition.getStatus());
        snapshot.put("description", definition.getDescription());
        return snapshot;
    }

    private Map<String, Object> versionSnapshot(WorkflowDefinitionVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", version.getId());
        snapshot.put("definitionId", version.getDefinitionId());
        snapshot.put("versionNumber", version.getVersionNumber());
        snapshot.put("status", version.getStatus());
        snapshot.put("isCurrent", version.getIsCurrent());
        snapshot.put("nodes", version.getNodesJson());
        snapshot.put("edges", version.getEdgesJson());
        return snapshot;
    }

    private void recordAudit(String entityType, Long entityId, String action,
                             Map<String, Object> before, Map<String, Object> after) {
        try {
            auditEventRepository.save(AuditEvent.builder()
                    .id(idGenerator.nextId()).tenantId("default")
                    .entityType(entityType).entityId(String.valueOf(entityId)).action(action)
                    .contentBefore(GRAPH_MAPPER.writeValueAsString(before))
                    .contentAfter(GRAPH_MAPPER.writeValueAsString(after))
                    .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                    .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                    .moduleName("生产管理").menuName("流程中心 · 审批流程")
                    .createdAt(LocalDateTime.now()).build());
        } catch (Exception exception) {
            throw new IllegalStateException("审批流程审计记录保存失败", exception);
        }
    }

    public record ReviewTemplateSummary(
            @JsonSerialize(using = ToStringSerializer.class) Long id,
            String tenantId,
            String name,
            String code,
            String type,
            String businessType,
            String status,
            String description,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            Integer currentVersionNumber,
            Integer draftVersionNumber,
            Integer versionCount) {
        static ReviewTemplateSummary from(WorkflowDefinition definition,
                                          WorkflowDefinitionVersion current,
                                          WorkflowDefinitionVersion draft,
                                          int versionCount) {
            return new ReviewTemplateSummary(
                    definition.getId(), definition.getTenantId(), definition.getName(), definition.getCode(),
                    definition.getType(), definition.getBusinessType(),
                    definition.getStatus(), definition.getDescription(), definition.getCreatedAt(), definition.getUpdatedAt(),
                    current == null ? null : current.getVersionNumber(),
                    draft == null ? null : draft.getVersionNumber(), versionCount);
        }
    }

}
