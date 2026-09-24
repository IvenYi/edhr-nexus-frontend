package com.zencas.edhr.workflow.controller;

import static com.zencas.edhr.workflow.service.FormNodeConfiguration.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.workflow.entity.WorkFormProcessReference;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.service.FormProcessReferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

/** Configuration API for reusable form processes. Runtime task execution is intentionally out of scope. */
@RestController
@RequestMapping("/api/v1/workflow/form-processes")
@PreAuthorize("hasAuthority('workflow.form-processes')")
@RequiredArgsConstructor
public class FormProcessController {
    private static final String TYPE = "FORM_PROCESS";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String INITIAL_NODES = "[{\"id\":\"start\",\"type\":\"formProcessNode\",\"position\":{\"x\":420,\"y\":72},\"data\":{\"label\":\"填报\",\"kind\":\"START\",\"config\":{\"permissionGroups\":[],\"permissionGroupRules\":[],\"conflictPolicy\":\"READ_ONLY_FIRST\",\"defaultPermission\":\"EDIT\"}}},{\"id\":\"end\",\"type\":\"formProcessNode\",\"position\":{\"x\":420,\"y\":452},\"data\":{\"label\":\"结束\",\"kind\":\"END\",\"config\":{}}}]";

    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowDefinitionVersionRepository versionRepository;
    private final FormProcessReferenceService formProcessReferenceService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;
    private final SnowflakeIdGenerator idGenerator;
    private final AuditEventRepository auditEventRepository;

    @GetMapping
    public ApiResponse<PageResult<FormProcessSummary>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "updatedAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<WorkflowDefinition> result = definitionRepository.findWorkTemplates(TYPE, keyword == null ? "" : keyword.trim(), PageRequest.of(Math.max(page - 1, 0), size, Sort.by(direction, sort)));
        List<FormProcessSummary> content = result.getContent().stream().map(definition -> {
            List<WorkflowDefinitionVersion> versions = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(definition.getId());
            WorkflowDefinitionVersion current = versions.stream().filter(item -> Boolean.TRUE.equals(item.getIsCurrent())).findFirst().orElse(null);
            WorkflowDefinitionVersion draft = versions.stream().filter(item -> "DRAFT".equals(item.getStatus())).findFirst().orElse(null);
            return new FormProcessSummary(definition.getId(), definition.getName(), definition.getCode(), definition.getDescription(),
                    definition.getUpdatedAt(), current == null ? null : current.getVersionNumber(), draft == null ? null : draft.getVersionNumber(), versions.size());
        }).toList();
        return ApiResponse.success(PageResult.of(content, page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowDefinition> get(@PathVariable Long id) { return ApiResponse.success(findDefinition(id)); }

    @PostMapping
    @Transactional
    public ApiResponse<WorkflowDefinition> create(@RequestBody WorkflowDefinition request) {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(idGenerator.nextId()).tenantId("default").name(requireName(request))
                .code(trim(request.getCode())).description(trim(request.getDescription()))
                .type(TYPE).status("ACTIVE").createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        WorkflowDefinition saved = definitionRepository.save(definition);
        recordAudit("PRODUCTION_FORM_PROCESS", saved.getId(), "CREATE", Map.of(), definitionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<WorkflowDefinition> update(@PathVariable Long id, @RequestBody WorkflowDefinition request) {
        WorkflowDefinition definition = findDefinition(id);
        Map<String, Object> before = definitionSnapshot(definition);
        definition.setName(requireName(request));
        definition.setCode(trim(request.getCode()));
        definition.setDescription(trim(request.getDescription()));
        definition.setUpdatedAt(LocalDateTime.now());
        WorkflowDefinition saved = definitionRepository.save(definition);
        recordAudit("PRODUCTION_FORM_PROCESS", saved.getId(), "UPDATE", before, definitionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        WorkflowDefinition definition = findDefinition(id);
        if (!formProcessReferenceService.listUsage(id).isEmpty()) {
            throw new BusinessException(ErrorCode.WF_002, "该表单流程已被作业流程引用，不能删除");
        }
        Integer operationReferences = jdbc.queryForObject("""
            SELECT count(*) FROM product_process_operation_form_binding b
            JOIN workflow_definition_version v ON CAST(v.id AS text)=b.fill_settings_json::jsonb->>'formProcessVersionId'
            WHERE v.definition_id=?
            """, Integer.class, id);
        if (operationReferences != null && operationReferences > 0)
            throw new BusinessException(ErrorCode.WF_002, "该表单流程已被工序表单引用，不能删除");
        versionRepository.deleteAll(versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id));
        definitionRepository.deleteById(id);
        recordAudit("PRODUCTION_FORM_PROCESS", id, "DELETE", definitionSnapshot(definition), Map.of());
        return ApiResponse.success(null);
    }

    @GetMapping("/{id}/versions")
    public ApiResponse<List<WorkflowDefinitionVersion>> versions(@PathVariable Long id) {
        findDefinition(id);
        return ApiResponse.success(versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id));
    }

    @GetMapping("/{id}/versions/{versionId}")
    public ApiResponse<WorkflowDefinitionVersion> version(@PathVariable Long id, @PathVariable Long versionId) {
        findDefinition(id);
        return ApiResponse.success(findVersion(id, versionId));
    }

    @GetMapping("/{id}/usage")
    public ApiResponse<List<FormProcessUsageItem>> usage(@PathVariable Long id) {
        findDefinition(id);
        List<WorkFormProcessReference> references = formProcessReferenceService.listUsage(id);
        Set<Long> versionIds = new HashSet<>();
        Set<Long> definitionIds = new HashSet<>();
        references.forEach(reference -> {
            versionIds.add(reference.getWorkVersionId());
            versionIds.add(reference.getFormProcessVersionId());
            definitionIds.add(reference.getWorkDefinitionId());
            definitionIds.add(reference.getFormProcessDefinitionId());
        });
        Map<Long, WorkflowDefinitionVersion> versionsById = versionRepository.findAllById(versionIds).stream()
                .collect(java.util.stream.Collectors.toMap(WorkflowDefinitionVersion::getId, item -> item));
        Map<Long, WorkflowDefinition> definitionsById = definitionRepository.findAllById(definitionIds).stream()
                .collect(java.util.stream.Collectors.toMap(WorkflowDefinition::getId, item -> item));
        List<FormProcessUsageItem> items = references.stream().map(reference -> {
            WorkflowDefinitionVersion workVersion = versionsById.get(reference.getWorkVersionId());
            WorkflowDefinitionVersion processVersion = versionsById.get(reference.getFormProcessVersionId());
            WorkflowDefinition workDefinition = definitionsById.get(reference.getWorkDefinitionId());
            return new FormProcessUsageItem(
                    reference.getId(),
                    reference.getFormProcessVersionId(),
                    processVersion == null ? null : processVersion.getVersionNumber(),
                    processVersion == null ? null : processVersion.getIsCurrent(),
                    reference.getWorkDefinitionId(),
                    workDefinition == null ? null : workDefinition.getName(),
                    workDefinition == null ? null : workDefinition.getCode(),
                    reference.getWorkVersionId(),
                    workVersion == null ? null : workVersion.getVersionNumber(),
                    workVersion == null ? null : workVersion.getStatus(),
                    workVersion == null ? null : workVersion.getIsCurrent(),
                    reference.getWorkNodeId(),
                    reference.getWorkNodeLabel(),
                    reference.getFormTemplateVersionId(),
                    reference.getFormTemplateName(),
                    reference.getUpdatedAt());
        }).toList();
        return ApiResponse.success(items);
    }

    @PostMapping("/{id}/versions")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> createDraft(@PathVariable Long id) {
        findDefinition(id);
        if (versionRepository.findByDefinitionIdAndStatus(id, "DRAFT").isPresent()) {
            throw new BusinessException(ErrorCode.WF_002, "当前已有编辑中的草稿流程");
        }
        List<WorkflowDefinitionVersion> existing = versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id);
        WorkflowDefinitionVersion previous = existing.isEmpty() ? null : existing.get(0);
        WorkflowDefinitionVersion draft = WorkflowDefinitionVersion.builder()
                .id(idGenerator.nextId()).definitionId(id)
                .versionNumber(previous == null ? 1 : previous.getVersionNumber() + 1)
                .status("DRAFT").isCurrent(false)
                .nodesJson(previous == null ? INITIAL_NODES : previous.getNodesJson())
                .edgesJson(previous == null ? "[]" : previous.getEdgesJson())
                .createdAt(LocalDateTime.now()).build();
        WorkflowDefinitionVersion saved = versionRepository.save(draft);
        recordAudit("PRODUCTION_FORM_PROCESS_VERSION", saved.getId(), "CREATE", Map.of(), versionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/{id}/versions/{versionId}/graph")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> saveGraph(@PathVariable Long id, @PathVariable Long versionId, @RequestBody Map<String, Object> payload) {
        findDefinition(id);
        WorkflowDefinitionVersion version = findVersion(id, versionId);
        if (!"DRAFT".equals(version.getStatus())) throw new BusinessException(ErrorCode.WF_002, "只有草稿流程可以编辑");
        Map<String, Object> before = versionSnapshot(version);
        try {
            String nodes = MAPPER.writeValueAsString(payload.getOrDefault("nodes", List.of()));
            String edges = MAPPER.writeValueAsString(payload.getOrDefault("edges", List.of()));
            validateBoundaries(nodes);
            validateDraftButtonConfigurations(nodes);
            version.setNodesJson(cleanPermissionFields(nodes)); version.setEdgesJson(edges);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.GENERAL_001, "流程图数据格式不正确");
        }
        WorkflowDefinitionVersion saved = versionRepository.save(version);
        recordAudit("PRODUCTION_FORM_PROCESS_VERSION", saved.getId(), "UPDATE", before, versionSnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PostMapping("/{id}/versions/{versionId}/publish")
    @Transactional
    public ApiResponse<WorkflowDefinitionVersion> publish(@PathVariable Long id, @PathVariable Long versionId) {
        findDefinition(id);
        WorkflowDefinitionVersion version = findVersion(id, versionId);
        if (!"DRAFT".equals(version.getStatus())) throw new BusinessException(ErrorCode.WF_002, "仅草稿流程可发布");
        Map<String, Object> before = versionSnapshot(version);
        String cleanedNodes = cleanPermissionFields(version.getNodesJson());
        version.setNodesJson(cleanedNodes);
        validateBoundaries(cleanedNodes);
        validatePublishableGraph(cleanedNodes, version.getEdgesJson());
        versionRepository.findByDefinitionIdOrderByVersionNumberDesc(id).forEach(item -> {
            if (Boolean.TRUE.equals(item.getIsCurrent())) { item.setIsCurrent(false); versionRepository.save(item); }
        });
        version.setStatus("PUBLISHED"); version.setIsCurrent(true); version.setPublishedAt(LocalDateTime.now());
        WorkflowDefinitionVersion published = versionRepository.save(version);
        recordAudit("PRODUCTION_FORM_PROCESS_VERSION", published.getId(), "UPDATE", before, versionSnapshot(published));
        versionRepository.flush();
        WorkflowDefinitionVersion nextDraft = versionRepository.save(WorkflowDefinitionVersion.builder()
                .id(idGenerator.nextId()).definitionId(id).versionNumber(published.getVersionNumber() + 1)
                .status("DRAFT").isCurrent(false).nodesJson(published.getNodesJson()).edgesJson(published.getEdgesJson())
                .createdAt(LocalDateTime.now()).build());
        recordAudit("PRODUCTION_FORM_PROCESS_VERSION", nextDraft.getId(), "CREATE", Map.of(), versionSnapshot(nextDraft));
        return ApiResponse.success(published);
    }

    private WorkflowDefinition findDefinition(Long id) {
        return definitionRepository.findById(id).filter(item -> TYPE.equals(item.getType()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_001, "表单流程不存在"));
    }

    private WorkflowDefinitionVersion findVersion(Long definitionId, Long versionId) {
        return versionRepository.findById(versionId).filter(item -> definitionId.equals(item.getDefinitionId()))
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_010, "表单流程版本不存在"));
    }

    private void validateBoundaries(String nodesJson) {
        try {
            JsonNode nodes = MAPPER.readTree(nodesJson == null ? "[]" : nodesJson);
            if (!nodes.isArray() || nodes.findValue("kind") == null || !containsKind(nodes, "START") || !containsKind(nodes, "END")) {
                throw new BusinessException(ErrorCode.WF_002, "流程必须包含填报开始和结束节点");
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.WF_002, "流程节点数据不正确");
        }
    }

    private void validatePublishableGraph(String nodesJson, String edgesJson) {
        try {
            JsonNode nodes = MAPPER.readTree(nodesJson == null ? "[]" : nodesJson);
            JsonNode edges = MAPPER.readTree(edgesJson == null ? "[]" : edgesJson);
            List<JsonNode> starts = new java.util.ArrayList<>();
            List<JsonNode> ends = new java.util.ArrayList<>();
            Map<String, JsonNode> byId = new HashMap<>();
            for (JsonNode node : nodes) {
                String id = node.path("id").asText("");
                if (id.isBlank()) throw new BusinessException(ErrorCode.WF_002, "流程节点缺少唯一标识");
                if (byId.putIfAbsent(id, node) != null) throw new BusinessException(ErrorCode.WF_002, "流程节点标识不能重复：" + id);
                String kind = node.path("data").path("kind").asText("");
                if (!Set.of("START", "APPROVAL", "END").contains(kind)) {
                    throw new BusinessException(ErrorCode.WF_002, "流程节点类型不受支持");
                }
                if ("START".equals(kind)) starts.add(node);
                if ("END".equals(kind)) ends.add(node);
                if ("START".equals(kind) || "APPROVAL".equals(kind)) {
                    validatePermissionConfiguration(node.path("data").path("config"), "START".equals(kind));
                    validateButtonConfiguration(node.path("data").path("config"), "START".equals(kind));
                }
            }
            if (starts.size() != 1 || ends.size() != 1) throw new BusinessException(ErrorCode.WF_002, "流程只能有一个开始节点和一个结束节点");
            Map<String, Set<String>> outgoing = new HashMap<>();
            Map<String, Set<String>> incoming = new HashMap<>();
            for (JsonNode node : nodes) {
                String id = node.path("id").asText("");
                outgoing.put(id, new HashSet<>()); incoming.put(id, new HashSet<>());
            }
            for (JsonNode edge : edges) {
                String source = edge.path("source").asText("");
                String target = edge.path("target").asText("");
                if (!outgoing.containsKey(source) || !incoming.containsKey(target)) throw new BusinessException(ErrorCode.WF_002, "流程连线引用了不存在的节点");
                outgoing.get(source).add(target); incoming.get(target).add(source);
            }
            for (JsonNode node : nodes) {
                String id = node.path("id").asText("");
                String kind = node.path("data").path("kind").asText("");
                if (("START".equals(kind) || "APPROVAL".equals(kind)) && outgoing.getOrDefault(id, Set.of()).size() > 1) {
                    throw new BusinessException(ErrorCode.WF_002, "普通节点只能配置一条出口");
                }
                if ("END".equals(kind) && !outgoing.getOrDefault(id, Set.of()).isEmpty()) {
                    throw new BusinessException(ErrorCode.WF_002, "结束节点不能配置出口");
                }
            }
            Set<String> reachable = traverse(starts.get(0).path("id").asText(), outgoing);
            Set<String> reverseReachable = traverse(ends.get(0).path("id").asText(), reverse(outgoing));
            if (reachable.size() != byId.size() || reverseReachable.size() != byId.size()) throw new BusinessException(ErrorCode.WF_002, "流程存在未连通节点");
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.WF_002, "流程节点或连线数据不正确");
        }
    }

    private void validateDraftButtonConfigurations(String nodesJson) {
        try {
            JsonNode nodes = MAPPER.readTree(nodesJson == null ? "[]" : nodesJson);
            if (!nodes.isArray()) return;
            for (JsonNode node : nodes) {
                String kind = node.path("data").path("kind").asText("");
                if ("START".equals(kind) || "APPROVAL".equals(kind)) {
                    validateButtonConfiguration(node.path("data").path("config"), "START".equals(kind));
                }
            }
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.WF_002, "流程节点数据不正确");
        }
    }


    private String cleanPermissionFields(String nodesJson) {
        try {
            JsonNode nodes = MAPPER.readTree(nodesJson == null ? "[]" : nodesJson);
            if (!nodes.isArray()) return nodesJson;
            for (JsonNode node : nodes) {
                String kind = node.path("data").path("kind").asText("");
                if (!("START".equals(kind) || "APPROVAL".equals(kind))) continue;
                JsonNode config = node.path("data").path("config");
                if (!(config instanceof ObjectNode configObject)) continue;
                configObject.remove(List.of("editableFields", "readOnlyFields", "fieldSlots", "fieldMappings"));
                JsonNode rules = configObject.get("permissionGroupRules");
                if (rules != null && rules.isArray()) {
                    for (JsonNode rule : rules) {
                        if (rule instanceof ObjectNode ruleObject) {
                            ruleObject.remove(List.of("editableFields", "readOnlyFields", "fieldSlots", "fieldMappings"));
                        }
                    }
                }
            }
            return MAPPER.writeValueAsString(nodes);
        } catch (Exception ignored) {
            return nodesJson;
        }
    }

    private Set<String> traverse(String start, Map<String, Set<String>> graph) {
        Set<String> visited = new HashSet<>();
        java.util.ArrayDeque<String> queue = new java.util.ArrayDeque<>(); queue.add(start);
        while (!queue.isEmpty()) { String current = queue.remove(); if (!visited.add(current)) continue; queue.addAll(graph.getOrDefault(current, Set.of())); }
        return visited;
    }

    private Map<String, Set<String>> reverse(Map<String, Set<String>> graph) {
        Map<String, Set<String>> reversed = new HashMap<>(); graph.keySet().forEach(key -> reversed.put(key, new HashSet<>()));
        graph.forEach((source, targets) -> targets.forEach(target -> reversed.get(target).add(source))); return reversed;
    }

    private boolean containsKind(JsonNode nodes, String kind) {
        for (JsonNode node : nodes) if (kind.equals(node.path("data").path("kind").asText())) return true;
        return false;
    }

    private String requireName(WorkflowDefinition request) {
        String name = request == null ? null : trim(request.getName());
        if (name == null || name.isBlank()) throw new BusinessException(ErrorCode.GENERAL_001, "请输入表单流程名称");
        return name;
    }

    private String trim(String value) { return value == null ? null : value.trim(); }

    private Map<String, Object> definitionSnapshot(WorkflowDefinition definition) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", definition.getId()); snapshot.put("name", definition.getName());
        snapshot.put("code", definition.getCode()); snapshot.put("description", definition.getDescription());
        snapshot.put("type", definition.getType()); snapshot.put("status", definition.getStatus());
        snapshot.put("createdAt", String.valueOf(definition.getCreatedAt())); snapshot.put("updatedAt", String.valueOf(definition.getUpdatedAt()));
        return snapshot;
    }

    private Map<String, Object> versionSnapshot(WorkflowDefinitionVersion version) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", version.getId()); snapshot.put("definitionId", version.getDefinitionId());
        snapshot.put("versionNumber", version.getVersionNumber()); snapshot.put("status", version.getStatus());
        snapshot.put("nodes", version.getNodesJson()); snapshot.put("edges", version.getEdgesJson());
        snapshot.put("isCurrent", version.getIsCurrent()); snapshot.put("publishedAt", String.valueOf(version.getPublishedAt()));
        snapshot.put("createdAt", String.valueOf(version.getCreatedAt()));
        return snapshot;
    }

    private void recordAudit(String entityType, Long entityId, String action, Map<String, Object> before, Map<String, Object> after) {
        try {
            auditEventRepository.save(AuditEvent.builder().id(idGenerator.nextId()).tenantId("default")
                    .entityType(entityType).entityId(String.valueOf(entityId)).action(action)
                    .contentBefore(MAPPER.writeValueAsString(before)).contentAfter(MAPPER.writeValueAsString(after))
                    .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                    .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                    .moduleName("生产管理").menuName("流程中心 · 表单流程").createdAt(LocalDateTime.now()).build());
        } catch (Exception exception) {
            throw new IllegalStateException("表单流程审计记录保存失败", exception);
        }
    }

    public record FormProcessSummary(
            @JsonSerialize(using = ToStringSerializer.class) Long id,
            String name, String code, String description, LocalDateTime updatedAt,
            Integer currentVersionNumber, Integer draftVersionNumber, Integer versionCount) { }

    public record FormProcessUsageItem(
            @JsonSerialize(using = ToStringSerializer.class) Long referenceId,
            @JsonSerialize(using = ToStringSerializer.class) Long formProcessVersionId,
            Integer formProcessVersionNumber,
            Boolean formProcessVersionIsCurrent,
            @JsonSerialize(using = ToStringSerializer.class) Long workDefinitionId,
            String workDefinitionName,
            String workDefinitionCode,
            @JsonSerialize(using = ToStringSerializer.class) Long workVersionId,
            Integer workVersionNumber,
            String workVersionStatus,
            Boolean workVersionIsCurrent,
            String workNodeId,
            String workNodeLabel,
            @JsonSerialize(using = ToStringSerializer.class) Long formTemplateVersionId,
            String formTemplateName,
            LocalDateTime updatedAt) {
    }
}
