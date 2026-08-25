package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.entity.WorkflowBindingRule;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.repository.WorkflowBindingRuleRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/workflow/work-templates")
@RequiredArgsConstructor
public class WorkTemplateController {

    private static final String WORKFLOW_TYPE = "WORK";
    private static final ObjectMapper FLOW_GRAPH_OBJECT_MAPPER = new ObjectMapper();
    private static final String INITIAL_FLOW_NODES = "["
            + "{\"id\":\"start\",\"type\":\"workNode\",\"position\":{\"x\":420,\"y\":72},\"data\":{\"label\":\"开始\",\"kind\":\"START\",\"config\":{}}},"
            + "{\"id\":\"end\",\"type\":\"workNode\",\"position\":{\"x\":420,\"y\":452},\"data\":{\"label\":\"结束\",\"kind\":\"END\",\"config\":{}}}"
            + "]";
    private static final String INITIAL_FLOW_EDGES = "[]";
    private static final String WORK_CONDITION_FIELD_CATALOG_VERSION = "work-runtime-fields-v1";
    private static final Set<String> AVAILABLE_WORK_CONDITION_CATALOGS = Set.of(WORK_CONDITION_FIELD_CATALOG_VERSION);
    private static final Set<String> AVAILABLE_WORK_CONDITION_FIELDS = Set.of(
            "workType", "triggerType", "sourceType", "sourceNumber", "executionStatus");
    private static final Set<String> CONDITION_OPERATORS = Set.of(
            "equals", "not-equals", "contains", "starts-with", "in", "is-present", "is-null");

    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowDefinitionVersionRepository versionRepository;
    private final WorkflowBindingRuleRepository bindingRuleRepository;
    private final AuditEventRepository auditEventRepository;
    private final FormTemplateVersionRepository formTemplateVersionRepository;
    private final SnowflakeIdGenerator idGenerator;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ApiResponse<PageResult<WorkTemplateSummary>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<WorkflowDefinition> result = workflowDefinitionRepository.findWorkTemplates(
                WORKFLOW_TYPE, keyword == null ? "" : keyword.trim(), pageable);
        List<WorkTemplateSummary> content = result.getContent().stream()
                .map(definition -> WorkTemplateSummary.from(definition,
                        versionRepository.findByDefinitionIdAndIsCurrentTrue(definition.getId()).orElse(null)))
                .toList();
        return ApiResponse.success(PageResult.of(content, page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowDefinition> getById(@PathVariable Long id) {
        return ApiResponse.success(findWorkDefinition(id));
    }

    @GetMapping("/applicability-rules")
    public ApiResponse<List<WorkApplicabilityRuleSummary>> listAllRules() {
        Map<Long, WorkflowDefinition> definitions = workflowDefinitionRepository.findByType(WORKFLOW_TYPE).stream()
                .collect(Collectors.toMap(WorkflowDefinition::getId, Function.identity()));
        List<WorkApplicabilityRuleSummary> rules = bindingRuleRepository
                .findByBusinessTypeOrderByPriorityDescCreatedAtDesc(WORKFLOW_TYPE).stream()
                .filter(rule -> definitions.containsKey(rule.getDefinitionId()))
                .map(rule -> WorkApplicabilityRuleSummary.from(rule, definitions.get(rule.getDefinitionId())))
                .toList();
        return ApiResponse.success(rules);
    }

    @PostMapping
    @Transactional
    public ApiResponse<WorkflowDefinition> create(@RequestBody WorkflowDefinition entity) {
        entity.setId(idGenerator.nextId());
        entity.setType(WORKFLOW_TYPE);
        entity.setStatus("ACTIVE");

        WorkflowDefinition saved = workflowDefinitionRepository.save(entity);
        recordAudit("PRODUCTION_WORK_TEMPLATE", saved.getId(), "CREATE", emptySnapshot(), definitionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<WorkflowDefinition> update(@PathVariable Long id, @RequestBody WorkflowDefinition entity) {
        WorkflowDefinition existing = lockWorkDefinition(id);
        Map<String, Object> before = definitionSnapshot(existing);
        existing.setName(entity.getName());
        existing.setCode(entity.getCode());
        existing.setDescription(entity.getDescription());
        existing.setUpdatedAt(LocalDateTime.now());
        WorkflowDefinition saved = workflowDefinitionRepository.save(existing);
        recordAudit("PRODUCTION_WORK_TEMPLATE", saved.getId(), "UPDATE", before, definitionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        WorkflowDefinition existing = lockWorkDefinition(id);
        Map<String, Object> before = definitionSnapshot(existing);
        List<WorkflowDefinitionVersion> versions = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id);
        // Until production execution exists, an unpublished rule means this work is not reachable by production.
        // Future execution must freeze workTemplateId, flowVersionId, the matched rule, and the flow graph snapshot
        // on the created work instance; deletion then needs an indexed instance-reference guard before allowing removal.
        if (!bindingRuleRepository.findByDefinitionId(id).isEmpty()) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002,
                    "存在作业适用规则的作业不能删除");
        }
        versions.forEach(version -> {
            Map<String, Object> versionBefore = versionSnapshot(version);
            versionRepository.delete(version);
            recordAudit("PRODUCTION_WORK_FLOW_VERSION", version.getId(), "DELETE", versionBefore, emptySnapshot());
        });
        versionRepository.flush();
        workflowDefinitionRepository.delete(existing);
        workflowDefinitionRepository.flush();
        recordAudit("PRODUCTION_WORK_TEMPLATE", id, "DELETE", before, emptySnapshot());
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/versions")
    @Transactional
    public ApiResponse<List<WorkflowDefinitionVersion>> listVersions(@PathVariable Long id) {
        lockWorkDefinition(id);
        List<WorkflowDefinitionVersion> versions = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id);
        return ApiResponse.success(versions);
    }

    @GetMapping("/{id}/versions/{versionId}")
    public ApiResponse<WorkflowDefinitionVersion> getVersion(@PathVariable Long id, @PathVariable Long versionId) {
        findWorkDefinition(id);
        return ApiResponse.success(findVersion(id, versionId));
    }

    @PutMapping("/{id}/versions/{versionId}/graph")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> saveGraph(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestBody Map<String, Object> payload) {
        lockWorkDefinition(id);
        WorkflowDefinitionVersion version = findVersion(id, versionId);
        if (!"DRAFT".equals(version.getStatus())) {
            throw new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.WF_002, "只有草稿流程可以编辑");
        }
        Map<String, Object> before = versionSnapshot(version);
        try {
            String nodesJson = FLOW_GRAPH_OBJECT_MAPPER.writeValueAsString(payload.getOrDefault("nodes", List.of()));
            validateFlowBoundaries(nodesJson);
            String edgesJson = FLOW_GRAPH_OBJECT_MAPPER.writeValueAsString(payload.getOrDefault("edges", List.of()));
            validateOrdinaryNodeOutgoingEdges(nodesJson, edgesJson);
            version.setNodesJson(nodesJson);
            version.setEdgesJson(edgesJson);
        } catch (JsonProcessingException exception) {
            throw new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "流程图数据格式不正确");
        }
        WorkflowDefinitionVersion saved = versionRepository.save(version);
        recordAudit("PRODUCTION_WORK_FLOW_VERSION", saved.getId(), "UPDATE", before, versionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PostMapping("/{id}/versions")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> createDraftVersion(@PathVariable Long id) {
        lockWorkDefinition(id);
        if (versionRepository.findByDefinitionIdAndStatus(id, "DRAFT").isPresent()) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002, "当前已有编辑中的草稿流程");
        }
        List<WorkflowDefinitionVersion> versions = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id);
        WorkflowDefinitionVersion previous = versions.isEmpty() ? null : versions.get(0);
        WorkflowDefinitionVersion draft = newDraft(id, previous == null ? 1 : previous.getVersionNumber() + 1, previous);
        WorkflowDefinitionVersion saved = versionRepository.save(draft);
        recordAudit("PRODUCTION_WORK_FLOW_VERSION", saved.getId(), "CREATE", emptySnapshot(), versionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PostMapping("/{id}/versions/{versionId}/publish")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> publishVersion(@PathVariable Long id, @PathVariable Long versionId) {
        lockWorkDefinition(id);
        WorkflowDefinitionVersion version = findVersion(id, versionId);
        if (!"DRAFT".equals(version.getStatus())) throw new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.WF_002, "仅草稿流程可发布");
        validateFlowBoundaries(version.getNodesJson());
        validateOrdinaryNodeOutgoingEdges(version.getNodesJson(), version.getEdgesJson());
        validatePublishableConditionRules(version.getNodesJson());
        validatePublishableFormReferences(version.getNodesJson());
        validatePublishableGraphConnectivity(version.getNodesJson(), version.getEdgesJson());
        Map<String, Object> before = versionSnapshot(version);
        versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id).forEach(candidate -> {
            if (Boolean.TRUE.equals(candidate.getIsCurrent())) {
                Map<String, Object> previousBefore = versionSnapshot(candidate);
                candidate.setIsCurrent(false);
                WorkflowDefinitionVersion previousSaved = versionRepository.save(candidate);
                recordAudit("PRODUCTION_WORK_FLOW_VERSION", previousSaved.getId(), "UPDATE", previousBefore, versionSnapshot(previousSaved));
            }
        });
        version.setStatus("PUBLISHED"); version.setIsCurrent(true); version.setPublishedAt(LocalDateTime.now());
        WorkflowDefinitionVersion saved = versionRepository.save(version);
        // The partial unique index allows only one DRAFT per work template. Flush the
        // published transition before inserting the inherited next draft in this transaction.
        versionRepository.flush();
        recordAudit("PRODUCTION_WORK_FLOW_VERSION", saved.getId(), "UPDATE", before, versionSnapshot(saved));
        WorkflowDefinitionVersion nextDraft = versionRepository.save(newDraft(id, saved.getVersionNumber() + 1, saved));
        recordAudit("PRODUCTION_WORK_FLOW_VERSION", nextDraft.getId(), "CREATE", emptySnapshot(), versionSnapshot(nextDraft));
        return ApiResponse.success(saved);
    }

    @PostMapping("/{id}/versions/{sourceVersionId}/copy-to-draft")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> copyPublishedVersionToDraft(
            @PathVariable Long id,
            @PathVariable Long sourceVersionId,
            @RequestParam(defaultValue = "false") boolean createIfMissing) {
        lockWorkDefinition(id);
        WorkflowDefinitionVersion source = findVersion(id, sourceVersionId);
        if (!"PUBLISHED".equals(source.getStatus())) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002, "仅已发布流程可以复制到草稿");
        }
        WorkflowDefinitionVersion saved;
        var existingDraft = versionRepository.findByDefinitionIdAndStatus(id, "DRAFT");
        if (existingDraft.isPresent()) {
            if (createIfMissing) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002,
                        "当前已有编辑中的草稿流程，请刷新后重试");
            }
            WorkflowDefinitionVersion draft = existingDraft.get();
            Map<String, Object> before = versionSnapshot(draft);
            draft.setNodesJson(source.getNodesJson());
            draft.setEdgesJson(source.getEdgesJson());
            saved = versionRepository.save(draft);
            recordAudit("PRODUCTION_WORK_FLOW_VERSION", saved.getId(), "UPDATE", before,
                    versionCopySnapshot(saved, source));
        } else {
            if (!createIfMissing) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002,
                        "当前草稿已不存在，请刷新后重试");
            }
            int nextVersionNumber = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id).stream()
                    .map(WorkflowDefinitionVersion::getVersionNumber)
                    .filter(java.util.Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0) + 1;
            saved = versionRepository.save(newDraft(id, nextVersionNumber, source));
            recordAudit("PRODUCTION_WORK_FLOW_VERSION", saved.getId(), "CREATE", emptySnapshot(),
                    versionCopySnapshot(saved, source));
        }
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/{id}/versions/{versionId}")
    @Transactional
    public ApiResponse<Void> deleteVersion(@PathVariable Long id, @PathVariable Long versionId) {
        lockWorkDefinition(id);
        findVersion(id, versionId);
        throw new com.zencas.edhr.common.exception.BusinessException(
                com.zencas.edhr.common.exception.ErrorCode.WF_002,
                "流程版本不能单独删除，草稿请继续编辑；删除作业模板时由系统统一清理");
    }

    @GetMapping("/{id}/applicability-rules")
    public ApiResponse<List<WorkflowBindingRule>> listRules(@PathVariable Long id) {
        findWorkDefinition(id); return ApiResponse.success(bindingRuleRepository.findByDefinitionIdOrderByPriorityDescCreatedAtDesc(id));
    }

    @PostMapping("/{id}/applicability-rules")
    @Transactional
    public ApiResponse<WorkflowBindingRule> createRule(@PathVariable Long id, @RequestBody WorkflowBindingRule rule) {
        findWorkDefinition(id); rule.setId(idGenerator.nextId()); rule.setDefinitionId(id); rule.setVersionId(null); rule.setBusinessType(WORKFLOW_TYPE);
        // A rule is the future production trigger; it must never expose a draft or historical-only flow.
        requireCurrentPublishedFlow(id);
        validateRuleScope(rule);
        rule.setIsActive(true);
        rule.setPriority(priorityForRuleType(rule.getRuleType()));
        WorkflowBindingRule saved = bindingRuleRepository.save(rule);
        recordAudit("PRODUCTION_WORK_APPLICABILITY_RULE", saved.getId(), "CREATE", emptySnapshot(), ruleSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/{id}/applicability-rules/{ruleId}")
    @Transactional
    public ApiResponse<WorkflowBindingRule> updateRule(@PathVariable Long id, @PathVariable Long ruleId, @RequestBody WorkflowBindingRule payload) {
        findWorkDefinition(id); requireCurrentPublishedFlow(id); WorkflowBindingRule rule = findRule(id, ruleId);
        Map<String, Object> before = ruleSnapshot(rule);
        rule.setRuleType(payload.getRuleType()); rule.setProductFamilyId(payload.getProductFamilyId()); rule.setProductId(payload.getProductId()); rule.setOperationId(payload.getOperationId()); rule.setDescription(payload.getDescription()); rule.setIsActive(true); rule.setPriority(priorityForRuleType(payload.getRuleType())); rule.setName(payload.getName());
        validateRuleScope(rule);
        rule.setUpdatedAt(LocalDateTime.now());
        WorkflowBindingRule saved = bindingRuleRepository.save(rule);
        recordAudit("PRODUCTION_WORK_APPLICABILITY_RULE", saved.getId(), "UPDATE", before, ruleSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/{id}/applicability-rules/{ruleId}")
    @Transactional
    public ApiResponse<Void> deleteRule(@PathVariable Long id, @PathVariable Long ruleId) {
        findWorkDefinition(id);
        WorkflowBindingRule existing = findRule(id, ruleId);
        Map<String, Object> before = ruleSnapshot(existing);
        bindingRuleRepository.delete(existing);
        recordAudit("PRODUCTION_WORK_APPLICABILITY_RULE", ruleId, "DELETE", before, emptySnapshot());
        return ApiResponse.success(null);
    }

    private WorkflowDefinition findWorkDefinition(Long id) {
        return workflowDefinitionRepository.findById(id)
                .filter(definition -> WORKFLOW_TYPE.equals(definition.getType()))
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    private WorkflowDefinition lockWorkDefinition(Long id) {
        return workflowDefinitionRepository.findByIdForUpdate(id)
                // The fallback keeps existing repository mocks and non-locking test doubles compatible.
                .or(() -> workflowDefinitionRepository.findById(id))
                .filter(definition -> WORKFLOW_TYPE.equals(definition.getType()))
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    private WorkflowDefinitionVersion findVersion(Long definitionId, Long versionId) {
        return versionRepository.findById(versionId).filter(version -> definitionId.equals(version.getDefinitionId())).orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.WF_010));
    }

    private void requireCurrentPublishedFlow(Long definitionId) {
        boolean hasCurrentPublishedFlow = versionRepository.findByDefinitionIdAndIsCurrentTrue(definitionId)
                .map(version -> "PUBLISHED".equals(version.getStatus()))
                .orElse(false);
        if (!hasCurrentPublishedFlow) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002,
                    "该作业尚未发布作业流程版本，无法配置适用规则");
        }
    }

    private WorkflowDefinitionVersion newDraft(Long definitionId, int versionNumber, WorkflowDefinitionVersion source) {
        return WorkflowDefinitionVersion.builder()
                .id(idGenerator.nextId())
                .definitionId(definitionId)
                .versionNumber(versionNumber)
                .status("DRAFT")
                .isCurrent(false)
                .nodesJson(source == null || source.getNodesJson() == null ? INITIAL_FLOW_NODES : source.getNodesJson())
                .edgesJson(source == null || source.getEdgesJson() == null ? INITIAL_FLOW_EDGES : source.getEdgesJson())
                .createdAt(LocalDateTime.now())
                .build();
    }

    private void validateFlowBoundaries(String nodesJson) {
        try {
            JsonNode nodes = FLOW_GRAPH_OBJECT_MAPPER.readTree(nodesJson);
            if (!nodes.isArray()) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002, "流程节点数据格式不正确");
            }
            long startCount = 0;
            long endCount = 0;
            for (JsonNode node : nodes) {
                String kind = node.path("data").path("kind").asText();
                if ("START".equals(kind)) startCount++;
                if ("END".equals(kind)) endCount++;
            }
            if (startCount != 1 || endCount != 1) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002,
                        "流程必须且只能包含一个开始节点和一个结束节点");
            }
        } catch (JsonProcessingException exception) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "流程节点数据格式不正确");
        }
    }

    /**
     * The first release has no ordinary parallel split node. Start and ordinary
     * work nodes therefore have at most one outgoing edge. Condition branches
     * are intentionally excluded: their branch count is a separate contract
     * that will be defined with the condition runtime model.
     */
    private void validateOrdinaryNodeOutgoingEdges(String nodesJson, String edgesJson) {
        try {
            JsonNode nodes = FLOW_GRAPH_OBJECT_MAPPER.readTree(nodesJson);
            JsonNode edges = FLOW_GRAPH_OBJECT_MAPPER.readTree(edgesJson);
            if (!nodes.isArray() || !edges.isArray()) {
                throw invalidFlowEdges();
            }
            Map<String, String> nodeKinds = new java.util.HashMap<>();
            Map<String, Set<String>> conditionAllowedHandles = new java.util.HashMap<>();
            for (JsonNode node : nodes) {
                String id = node.path("id").asText("");
                if (!id.isBlank()) {
                    nodeKinds.put(id, node.path("data").path("kind").asText(""));
                    if ("CONDITION".equals(node.path("data").path("kind").asText(""))) {
                        conditionAllowedHandles.put(id, conditionHandlesForNode(node));
                    }
                }
            }
            Map<String, Integer> outgoingCounts = new java.util.HashMap<>();
            Map<String, Set<String>> conditionUsedHandles = new java.util.HashMap<>();
            Set<String> edgeKeys = new java.util.HashSet<>();
            for (JsonNode edge : edges) {
                String source = edge.path("source").asText("");
                String target = edge.path("target").asText("");
                if (source.isBlank() || target.isBlank() || !nodeKinds.containsKey(source) || !nodeKinds.containsKey(target)) {
                    throw invalidFlowEdges();
                }
                validateConditionTargetHandle(nodeKinds.get(target), edge.path("targetHandle").asText(""));
                if (source.equals(target)) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002, "流程不能连接节点自身");
                }
                String edgeKey = source + "->" + target + "#" + edge.path("sourceHandle").asText("");
                if (!edgeKeys.add(edgeKey)) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002, "同一出口不能重复创建连线");
                }
                String kind = nodeKinds.get(source);
                if ("CONDITION".equals(kind)) {
                    String sourceHandle = edge.path("sourceHandle").asText("");
                    Set<String> used = conditionUsedHandles.computeIfAbsent(source, ignored -> new HashSet<>());
                    if (!conditionAllowedHandles.getOrDefault(source, Set.of()).contains(sourceHandle) || !used.add(sourceHandle)) {
                        throw new com.zencas.edhr.common.exception.BusinessException(
                                com.zencas.edhr.common.exception.ErrorCode.WF_002,
                                "条件分支出口只能各连接一条连线");
                    }
                } else {
                    int count = outgoingCounts.merge(source, 1, Integer::sum);
                    if (count > 1) {
                        throw new com.zencas.edhr.common.exception.BusinessException(
                                com.zencas.edhr.common.exception.ErrorCode.WF_002,
                                "开始节点和普通作业节点只能有一条出口连线");
                    }
                }
            }
        } catch (JsonProcessingException exception) {
            throw invalidFlowEdges();
        }
    }

    private Set<String> conditionHandlesForNode(JsonNode node) {
        JsonNode config = node.path("data").path("config");
        JsonNode branches = config.get("conditionBranches");
        if (branches == null || !branches.isArray() || branches.isEmpty()) {
            throw invalidFlowEdges();
        }
        Set<String> handles = new HashSet<>();
        branches.forEach(branch -> {
            if (!branch.isObject() || branch.has("rule")) throw invalidFlowEdges();
            String id = branch.path("id").asText("").trim();
            String handle = conditionHandleForBranchId(id);
            if (id.isBlank() || !handles.add(handle)) throw invalidFlowEdges();
        });
        if (!handles.add("condition-default")) throw invalidFlowEdges();
        JsonNode defaultBranch = config.get("conditionDefaultBranch");
        if (defaultBranch == null || !defaultBranch.isObject()
                || !"condition-default".equals(defaultBranch.path("id").asText())
                || !"否则".equals(defaultBranch.path("name").asText())) {
            throw invalidFlowEdges();
        }
        return handles;
    }

    private void validateConditionTargetHandle(String targetKind, String targetHandle) {
        if ("CONDITION".equals(targetKind) && !"condition-input".equals(targetHandle)) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002,
                    "条件节点只能从顶部入口进入，条件出口不能作为进入点");
        }
    }

    private com.zencas.edhr.common.exception.BusinessException invalidFlowEdges() {
        return new com.zencas.edhr.common.exception.BusinessException(
                com.zencas.edhr.common.exception.ErrorCode.WF_002, "流程连线数据格式不正确");
    }

    /**
     * Drafts may contain an unfinished condition node. Publishing may not turn
     * an incomplete or unversioned rule into a runtime contract. The first
     * release accepts only the registered work-runtime field catalog and its
     * snapshot; runtime evaluation, node progression, and instance snapshot
     * binding remain follow-up execution capabilities.
     */
    private void validatePublishableConditionRules(String nodesJson) {
        try {
            JsonNode nodes = FLOW_GRAPH_OBJECT_MAPPER.readTree(nodesJson);
            for (JsonNode node : nodes) {
                if (!"CONDITION".equals(node.path("data").path("kind").asText())) {
                    continue;
                }
                JsonNode config = node.path("data").path("config");
                if (hasLegacyConditionConfiguration(config)) {
                    throw invalidConditionRule("条件节点包含不支持的旧配置字段");
                }
                JsonNode branches = config.get("conditionBranches");
                if (branches == null || !branches.isArray() || branches.isEmpty()) {
                    throw invalidConditionRule("条件节点必须配置至少一个条件分支");
                }
                validateConditionDefaultBranch(config.get("conditionDefaultBranch"));
                Set<String> branchIds = new HashSet<>();
                Set<String> branchHandles = new HashSet<>();
                for (JsonNode branch : branches) {
                    if (!branch.isObject() || branch.has("rule")) throw invalidConditionRule();
                    String branchId = branch.path("id").asText("").trim();
                    if (branchId.isBlank() || !branchIds.add(branchId)) {
                        throw invalidConditionRule("条件分支标识必须唯一且不能为空");
                    }
                    String branchHandle = conditionHandleForBranchId(branchId);
                    if (!branchHandles.add(branchHandle) || "condition-default".equals(branchHandle)) {
                        throw invalidConditionRule("条件分支出口标识必须唯一且不能占用否则出口");
                    }
                    validatePublishableConditionRule(branch.path("conditionRule"), branch.path("fieldCatalogVersion").asText(""), branch.get("fieldSnapshot"));
                }
            }
        } catch (JsonProcessingException exception) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002, "条件规则数据格式不正确");
        }
    }

    private void validatePublishableConditionRule(JsonNode conditionRule, String catalogVersion, JsonNode fieldSnapshot) {
        if (conditionRule == null || conditionRule.isNull()) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002,
                    "条件分支尚未配置结构化条件规则，当前不能发布");
        }
        if (!AVAILABLE_WORK_CONDITION_CATALOGS.contains(catalogVersion)) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002,
                    "当前尚未开放作业条件字段，条件分支暂不能发布");
        }
        if (fieldSnapshot == null || !fieldSnapshot.isObject()) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002,
                    "条件分支缺少字段目录快照，当前不能发布");
        }
        validateConditionExpression(conditionRule);
        validateConditionFields(conditionRule);
        validateConditionFieldSnapshot(conditionRule, fieldSnapshot);
    }

    private void validateConditionDefaultBranch(JsonNode defaultBranch) {
        if (defaultBranch == null || !defaultBranch.isObject()
                || defaultBranch.size() != 2
                || !"condition-default".equals(defaultBranch.path("id").asText())
                || !"否则".equals(defaultBranch.path("name").asText())) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002,
                    "条件节点必须配置唯一的否则默认分支");
        }
    }

    private boolean hasLegacyConditionConfiguration(JsonNode config) {
        return config != null && (config.has("conditionRule")
                || config.has("conditionFieldCatalogVersion")
                || config.has("conditionFieldSnapshot")
                || config.has("conditionExpression"));
    }

    private String conditionHandleForBranchId(String branchId) {
        return branchId.startsWith("condition-") ? branchId : "condition-" + branchId;
    }

    private com.zencas.edhr.common.exception.BusinessException invalidConditionRule(String message) {
        return new com.zencas.edhr.common.exception.BusinessException(
                com.zencas.edhr.common.exception.ErrorCode.WF_002, message);
    }

    private void validatePublishableFormReferences(String nodesJson) {
        try {
            JsonNode nodes = FLOW_GRAPH_OBJECT_MAPPER.readTree(nodesJson);
            for (JsonNode node : nodes) {
                if (!"FORM".equals(node.path("data").path("kind").asText())) continue;
                String formVersionId = node.path("data").path("config").path("formTemplateVersionId").asText("").trim();
                if (formVersionId.isBlank()) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002,
                            "表单填写节点尚未选择生效表单版本，当前不能发布");
                }
                final Long formVersionIdValue;
                try {
                    formVersionIdValue = Long.valueOf(formVersionId);
                } catch (NumberFormatException exception) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002,
                            "表单填写节点引用的表单版本不存在，当前不能发布");
                }
                FormTemplateVersion formVersion = formTemplateVersionRepository.findById(formVersionIdValue)
                        .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                                com.zencas.edhr.common.exception.ErrorCode.WF_002,
                                "表单填写节点引用的表单版本不存在，当前不能发布"));
                if (!RdoVersionStatusResolver.isReferenceable(formVersion.getEffectiveFrom(), formVersion.getEffectiveTo())) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002,
                            "表单填写节点只能引用当前生效的表单版本，当前不能发布");
                }
            }
        } catch (JsonProcessingException exception) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002, "流程节点数据格式不正确");
        }
    }

    private void validatePublishableGraphConnectivity(String nodesJson, String edgesJson) {
        try {
            JsonNode nodes = FLOW_GRAPH_OBJECT_MAPPER.readTree(nodesJson);
            JsonNode edges = FLOW_GRAPH_OBJECT_MAPPER.readTree(edgesJson);
            if (!nodes.isArray() || !edges.isArray()) throw invalidFlowEdges();

            Map<String, String> nodeKinds = new HashMap<>();
            Map<String, List<String>> incoming = new HashMap<>();
            Map<String, List<String>> outgoing = new HashMap<>();
            Map<String, Set<String>> conditionHandles = new HashMap<>();
            Map<String, Set<String>> conditionAllowedHandles = new HashMap<>();
            Map<String, Set<String>> conditionExpectedHandles = new HashMap<>();
            String startId = null;
            String endId = null;
            int startCount = 0;
            int endCount = 0;
            for (JsonNode node : nodes) {
                String id = node.path("id").asText("").trim();
                if (id.isBlank() || nodeKinds.put(id, node.path("data").path("kind").asText("")) != null) {
                    throw invalidFlowEdges();
                }
                incoming.put(id, new java.util.ArrayList<>());
                outgoing.put(id, new java.util.ArrayList<>());
                if ("CONDITION".equals(node.path("data").path("kind").asText())) {
                    conditionAllowedHandles.put(id, conditionHandlesForNode(node));
                    JsonNode branches = node.path("data").path("config").get("conditionBranches");
                    if (branches != null && branches.isArray() && !branches.isEmpty()) {
                        conditionExpectedHandles.put(id, conditionHandlesForNode(node));
                    }
                }
                if ("START".equals(node.path("data").path("kind").asText())) {
                    startCount++;
                    startId = id;
                }
                if ("END".equals(node.path("data").path("kind").asText())) {
                    endCount++;
                    endId = id;
                }
            }
            if (startCount != 1 || endCount != 1) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002,
                        "流程必须且只能包含一个开始节点和一个结束节点");
            }

            Set<String> edgeKeys = new HashSet<>();
            for (JsonNode edge : edges) {
                String source = edge.path("source").asText("");
                String target = edge.path("target").asText("");
                if (!nodeKinds.containsKey(source) || !nodeKinds.containsKey(target) || source.equals(target)) {
                    throw invalidFlowEdges();
                }
                validateConditionTargetHandle(nodeKinds.get(target), edge.path("targetHandle").asText(""));
                String sourceHandle = edge.path("sourceHandle").asText("");
                if (!edgeKeys.add(source + "->" + target + "#" + sourceHandle)) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002, "同一出口不能重复创建连线");
                }
                if ("CONDITION".equals(nodeKinds.get(source))) {
                    Set<String> handles = conditionHandles.computeIfAbsent(source, ignored -> new HashSet<>());
                    if (!conditionAllowedHandles.getOrDefault(source, Set.of()).contains(sourceHandle) || !handles.add(sourceHandle)) {
                        throw new com.zencas.edhr.common.exception.BusinessException(
                                com.zencas.edhr.common.exception.ErrorCode.WF_002,
                                "条件出口只能各连接一条连线");
                    }
                }
                if ("END".equals(nodeKinds.get(source)) || "START".equals(nodeKinds.get(target))) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002,
                            "开始和结束节点的连线方向不正确");
                }
                incoming.get(target).add(source);
                outgoing.get(source).add(target);
            }
            if (!incoming.get(startId).isEmpty() || !outgoing.get(endId).isEmpty()) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002,
                        "开始节点不能有进入连线，结束节点不能继续连接其他节点");
            }
            for (Map.Entry<String, Set<String>> entry : conditionExpectedHandles.entrySet()) {
                if (!conditionHandles.getOrDefault(entry.getKey(), Set.of()).containsAll(entry.getValue())) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002,
                            "条件分支的每个出口都需要连接到后续节点");
                }
            }
            for (String id : nodeKinds.keySet()) {
                if (!"START".equals(nodeKinds.get(id)) && incoming.get(id).isEmpty()) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002, "存在节点缺少进入连线");
                }
                if (!"END".equals(nodeKinds.get(id)) && outgoing.get(id).isEmpty()) {
                    throw new com.zencas.edhr.common.exception.BusinessException(
                            com.zencas.edhr.common.exception.ErrorCode.WF_002, "存在节点缺少出口连线");
                }
            }
            Set<String> reachableFromStart = walkGraph(startId, outgoing);
            Map<String, List<String>> reverse = new HashMap<>();
            nodeKinds.keySet().forEach(id -> reverse.put(id, new java.util.ArrayList<>()));
            outgoing.forEach((source, targets) -> targets.forEach(target -> reverse.get(target).add(source)));
            Set<String> canReachEnd = walkGraph(endId, reverse);
            if (reachableFromStart.size() != nodeKinds.size() || canReachEnd.size() != nodeKinds.size()) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002,
                        "存在未连接在开始到结束完整流程中的节点");
            }
        } catch (JsonProcessingException exception) {
            throw invalidFlowEdges();
        }
    }

    private Set<String> walkGraph(String root, Map<String, List<String>> adjacency) {
        Set<String> visited = new HashSet<>();
        java.util.ArrayDeque<String> queue = new java.util.ArrayDeque<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            String current = queue.removeFirst();
            if (!visited.add(current)) continue;
            adjacency.getOrDefault(current, List.of()).forEach(next -> {
                if (!visited.contains(next)) queue.addLast(next);
            });
        }
        return visited;
    }

    private void validateConditionExpression(JsonNode expression) {
        if (expression == null || !expression.isObject() || expression.isEmpty()) {
            throw invalidConditionRule();
        }
        if (expression.has("all") || expression.has("any")) {
            String groupKey = expression.has("all") ? "all" : "any";
            if (expression.size() != 1 || !expression.get(groupKey).isArray()
                    || expression.get(groupKey).isEmpty()) {
                throw invalidConditionRule();
            }
            for (JsonNode child : expression.get(groupKey)) validateConditionExpression(child);
            return;
        }
        if (expression.has("not")) {
            if (expression.size() != 1 || !expression.get("not").isObject()) {
                throw invalidConditionRule();
            }
            validateConditionExpression(expression.get("not"));
            return;
        }
        if (!expression.has("fact") || !expression.has("operator") || !expression.has("value")
                || expression.size() != 3
                || !expression.get("fact").isTextual() || expression.get("fact").asText().isBlank()
                || !expression.get("operator").isTextual() || expression.get("operator").asText().isBlank()
                || !CONDITION_OPERATORS.contains(expression.get("operator").asText())
                || !isConditionValue(expression.get("value"))) {
            throw invalidConditionRule();
        }
    }

    private void validateConditionFields(JsonNode expression) {
        if (expression.has("all")) {
            expression.get("all").forEach(this::validateConditionFields);
        } else if (expression.has("any")) {
            expression.get("any").forEach(this::validateConditionFields);
        } else if (expression.has("not")) {
            validateConditionFields(expression.get("not"));
        } else if (!AVAILABLE_WORK_CONDITION_FIELDS.contains(expression.path("fact").asText())) {
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.WF_002, "条件规则包含未开放的作业字段");
        }
    }

    private void validateConditionFieldSnapshot(JsonNode expression, JsonNode snapshot) {
        if (expression.has("all")) {
            expression.get("all").forEach(child -> validateConditionFieldSnapshot(child, snapshot));
        } else if (expression.has("any")) {
            expression.get("any").forEach(child -> validateConditionFieldSnapshot(child, snapshot));
        } else if (expression.has("not")) {
            validateConditionFieldSnapshot(expression.get("not"), snapshot);
        } else {
            String fact = expression.path("fact").asText();
            if (snapshot == null || !snapshot.isObject() || !snapshot.has(fact)
                    || !"string".equals(snapshot.path(fact).asText())) {
                throw new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.WF_002, "条件分支缺少字段目录快照");
            }
        }
    }

    private boolean isConditionValue(JsonNode value) {
        if (!value.isArray()) return value.isTextual() || value.isNumber() || value.isBoolean() || value.isNull();
        for (JsonNode item : value) {
            if (!(item.isTextual() || item.isNumber() || item.isBoolean() || item.isNull())) return false;
        }
        return true;
    }

    private com.zencas.edhr.common.exception.BusinessException invalidConditionRule() {
        return new com.zencas.edhr.common.exception.BusinessException(
                com.zencas.edhr.common.exception.ErrorCode.WF_002,
                "条件分支规则必须是合法的结构化条件表达式");
    }

    private WorkflowBindingRule findRule(Long definitionId, Long ruleId) {
        return bindingRuleRepository.findById(ruleId).filter(rule -> definitionId.equals(rule.getDefinitionId())).orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "适用规则不存在"));
    }

    private void validateRuleScope(WorkflowBindingRule rule) {
        if ("GLOBAL".equals(rule.getRuleType())
                && (rule.getProductFamilyId() != null || rule.getProductId() != null || rule.getOperationId() != null)) {
            throw new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "全局适用规则不能配置范围");
        }
        if (("SCOPED".equals(rule.getRuleType()) || "EXCEPTION".equals(rule.getRuleType()))
                && rule.getProductFamilyId() == null && rule.getProductId() == null && rule.getOperationId() == null) {
            throw new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "指定范围或例外排除规则至少选择一个范围");
        }
    }

    private Map<String, Object> definitionSnapshot(WorkflowDefinition definition) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", definition.getId());
        snapshot.put("type", definition.getType());
        snapshot.put("name", definition.getName());
        snapshot.put("code", definition.getCode());
        snapshot.put("status", definition.getStatus());
        snapshot.put("description", definition.getDescription());
        snapshot.put("createdAt", definition.getCreatedAt());
        snapshot.put("updatedAt", definition.getUpdatedAt());
        return snapshot;
    }

    private Map<String, Object> versionSnapshot(WorkflowDefinitionVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", version.getId());
        snapshot.put("definitionId", version.getDefinitionId());
        snapshot.put("versionNumber", version.getVersionNumber());
        snapshot.put("status", version.getStatus());
        snapshot.put("nodes", version.getNodesJson());
        snapshot.put("edges", version.getEdgesJson());
        snapshot.put("isCurrent", version.getIsCurrent());
        snapshot.put("publishedAt", version.getPublishedAt());
        snapshot.put("createdAt", version.getCreatedAt());
        return snapshot;
    }

    private Map<String, Object> versionCopySnapshot(
            WorkflowDefinitionVersion target,
            WorkflowDefinitionVersion source) {
        Map<String, Object> snapshot = versionSnapshot(target);
        snapshot.put("copiedFrom", Map.of(
                "versionId", source.getId(),
                "versionNumber", source.getVersionNumber()));
        return snapshot;
    }

    private Map<String, Object> ruleSnapshot(WorkflowBindingRule rule) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", rule.getId());
        snapshot.put("definitionId", rule.getDefinitionId());
        snapshot.put("businessType", rule.getBusinessType());
        snapshot.put("ruleType", rule.getRuleType());
        snapshot.put("productFamilyId", rule.getProductFamilyId());
        snapshot.put("productId", rule.getProductId());
        snapshot.put("operationId", rule.getOperationId());
        snapshot.put("priority", rule.getPriority());
        snapshot.put("description", rule.getDescription());
        snapshot.put("createdAt", rule.getCreatedAt());
        snapshot.put("updatedAt", rule.getUpdatedAt());
        return snapshot;
    }

    private Map<String, Object> emptySnapshot() {
        return new LinkedHashMap<>();
    }

    private void recordAudit(String entityType, Long entityId, String action, Map<String, Object> before, Map<String, Object> after) {
        try {
            auditEventRepository.save(AuditEvent.builder()
                    .id(idGenerator.nextId())
                    .tenantId("default")
                    .entityType(entityType)
                    .entityId(String.valueOf(entityId))
                    .action(action)
                    .contentBefore(toJson(before))
                    .contentAfter(toJson(after))
                    .operatorId(AuditContext.getOperatorId())
                    .operatorName(AuditContext.getOperatorName())
                    .operatorAccount(AuditContext.getOperatorAccount())
                    .source(AuditContext.getSource())
                    .moduleName("生产管理")
                    .menuName("生产配置 · 作业模板")
                    .createdAt(LocalDateTime.now())
                    .build());
        } catch (Exception exception) {
            throw new IllegalStateException("作业模板审计记录保存失败", exception);
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("作业模板审计快照格式化失败", exception);
        }
    }

    private int priorityForRuleType(String ruleType) {
        return switch (ruleType == null ? "" : ruleType) {
            case "EXCEPTION" -> 30;
            case "SCOPED" -> 20;
            case "GLOBAL" -> 10;
            default -> throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "适用方式不正确");
        };
    }

    public record WorkApplicabilityRuleSummary(
            @JsonSerialize(using = ToStringSerializer.class) Long id,
            @JsonSerialize(using = ToStringSerializer.class) Long definitionId,
            String definitionName,
            String definitionCode,
            String ruleType,
            @JsonSerialize(using = ToStringSerializer.class) Long productFamilyId,
            @JsonSerialize(using = ToStringSerializer.class) Long productId,
            @JsonSerialize(using = ToStringSerializer.class) Long operationId,
            Integer priority,
            String description,
            LocalDateTime updatedAt) {
        static WorkApplicabilityRuleSummary from(WorkflowBindingRule rule, WorkflowDefinition definition) {
            return new WorkApplicabilityRuleSummary(
                    rule.getId(), rule.getDefinitionId(), definition.getName(), definition.getCode(),
                    rule.getRuleType(), rule.getProductFamilyId(), rule.getProductId(), rule.getOperationId(),
                    rule.getPriority(), rule.getDescription(),
                    rule.getUpdatedAt() == null ? rule.getCreatedAt() : rule.getUpdatedAt());
        }
    }

    public record WorkTemplateSummary(
            @JsonSerialize(using = ToStringSerializer.class) Long id,
            String name,
            String code,
            String status,
            String description,
            LocalDateTime updatedAt,
            Integer currentFlowVersionNumber) {
        static WorkTemplateSummary from(WorkflowDefinition definition, WorkflowDefinitionVersion currentVersion) {
            return new WorkTemplateSummary(
                    definition.getId(), definition.getName(), definition.getCode(), definition.getStatus(),
                    definition.getDescription(), definition.getUpdatedAt(),
                    currentVersion == null ? null : currentVersion.getVersionNumber());
        }
    }
}
