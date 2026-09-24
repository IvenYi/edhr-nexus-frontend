package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Service
@RequiredArgsConstructor
public class DhrSummaryService {
    private static final String TENANT = "default";
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final DhrInstanceService dhrInstances;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;
    private final com.zencas.edhr.workflow.engine.WorkflowEngine workflowEngine;
    private final DhrEvidenceImpactService impacts;

    @Transactional(readOnly = true)
    public ObjectNode workspace(Long dhrId) {
        ObjectNode detail = dhrInstances.detail(dhrId);
        ObjectNode result = mapper.createObjectNode();
        result.set("dhr", detail);
        result.set("candidates", candidates(detail));
        List<ObjectNode> drafts = jdbc.query("SELECT * FROM dhr_summary_draft WHERE tenant_id=? AND dhr_instance_id=?", (rs, index) -> {
            ObjectNode draft = mapper.createObjectNode().put("id", rs.getString("id")).put("revision", rs.getInt("revision"));
            draft.set("overlayDirectories", json(rs.getString("overlay_directory_json"), "汇总目录草稿"));
            draft.set("placements", json(rs.getString("evidence_placement_json"), "汇总证据草稿"));
            return draft;
        }, TENANT, dhrId);
        result.set("draft", drafts.isEmpty() ? mapper.nullNode() : drafts.getFirst());
        ArrayNode versions = mapper.createArrayNode();
        jdbc.query("""
            SELECT id,version_no,status,review_mode,review_workflow_definition_id,review_workflow_version_id,
                   snapshot_hash,submitted_by,submitted_at
            FROM dhr_summary_version WHERE tenant_id=? AND dhr_instance_id=? ORDER BY version_no DESC
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> versions.addObject().put("id", rs.getString("id")).put("versionNo", rs.getInt("version_no"))
                .put("status", rs.getString("status")).put("reviewMode", rs.getString("review_mode"))
                .put("reviewWorkflowDefinitionId", rs.getString("review_workflow_definition_id"))
                .put("reviewWorkflowVersionId", rs.getString("review_workflow_version_id"))
                .put("snapshotHash", rs.getString("snapshot_hash")).put("submittedBy", rs.getString("submitted_by"))
                .put("submittedAt", rs.getTimestamp("submitted_at").toLocalDateTime().toString()), TENANT, dhrId);
        result.set("versions", versions);
        Map<String, String> outcomes = new HashMap<>();
        jdbc.query("SELECT r.summary_version_id,r.status FROM dhr_summary_review r JOIN dhr_summary_version v ON v.id=r.summary_version_id WHERE v.tenant_id=? AND v.dhr_instance_id=?",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> outcomes.put(rs.getString(1), rs.getString(2)), TENANT, dhrId);
        for (JsonNode version : versions) ((ObjectNode) version).put("reviewOutcome", outcomes.get(version.path("id").asText()));
        return result;
    }

    @Transactional(readOnly = true)
    public ObjectNode version(Long dhrId, Long versionId) {
        ObjectNode detail = dhrInstances.detail(dhrId);
        List<ObjectNode> versions = jdbc.query("""
            SELECT id,version_no,status,review_mode,review_workflow_definition_id,review_workflow_version_id,
                   base_directory_snapshot,overlay_directory_snapshot,
                   candidate_snapshot,snapshot_hash,submitted_by,submitted_at
            FROM dhr_summary_version WHERE tenant_id=? AND dhr_instance_id=? AND id=?
            """, (rs, index) -> {
            ObjectNode version = mapper.createObjectNode().put("id", rs.getString("id"))
                    .put("versionNo", rs.getInt("version_no")).put("status", rs.getString("status"))
                    .put("reviewMode", rs.getString("review_mode")).put("snapshotHash", rs.getString("snapshot_hash"))
                    .put("reviewWorkflowDefinitionId", rs.getString("review_workflow_definition_id"))
                    .put("reviewWorkflowVersionId", rs.getString("review_workflow_version_id"))
                    .put("submittedBy", rs.getString("submitted_by"))
                    .put("submittedAt", rs.getTimestamp("submitted_at").toLocalDateTime().toString());
            version.set("baseDirectory", DhrInstanceService.directoryForResponse(json(rs.getString("base_directory_snapshot"), "DHR 基础目录快照")));
            version.set("overlayDirectories", json(rs.getString("overlay_directory_snapshot"), "DHR 汇总目录快照"));
            version.set("candidates", json(rs.getString("candidate_snapshot"), "DHR 候选证据快照"));
            return version;
        }, TENANT, dhrId, versionId);
        if (versions.isEmpty()) throw invalid("DHR 汇总版本不存在");
        ObjectNode result = mapper.createObjectNode();
        result.set("dhr", detail);
        result.set("version", versions.getFirst());
        var outcomes = jdbc.queryForList("SELECT status FROM dhr_summary_review WHERE summary_version_id=?", String.class, versionId);
        versions.getFirst().put("reviewOutcome", outcomes.isEmpty() ? null : outcomes.getFirst());
        result.set("evidenceChanges", impacts.changes(versionId, false));
        ArrayNode placements = result.putArray("placements");
        jdbc.query("""
            SELECT source_record_id,target_node_key,before_node_key,display_order,display_name FROM dhr_summary_evidence
            WHERE tenant_id=? AND summary_version_id=? ORDER BY id
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                ObjectNode placement = placements.addObject().put("recordId", rs.getString("source_record_id"))
                        .put("targetNodeKey", rs.getString("target_node_key"));
                if (rs.getString("before_node_key") != null) placement.put("beforeNodeKey", rs.getString("before_node_key"));
                if (rs.getObject("display_order") != null) placement.put("displayOrder", rs.getInt("display_order"));
                if (rs.getString("display_name") != null) placement.put("displayName", rs.getString("display_name"));
            }, TENANT, versionId);
        return result;
    }

    @Transactional
    public ObjectNode saveDraft(Long dhrId, JsonNode command) {
        ObjectNode dhr = lockedCompletedDhr(dhrId);
        ArrayNode overlay = requireArray(command, "overlayDirectories");
        ArrayNode placements = requireArray(command, "placements");
        validateOverlay(dhr.path("directory_snapshot"), overlay);
        validatePlacements(candidates(dhrInstances.detail(dhrId)), dhr.path("directory_snapshot"), overlay, placements);
        LocalDateTime now = LocalDateTime.now();
        String actor = actor();
        List<Map<String, Object>> existing = jdbc.queryForList(
                "SELECT id,revision,overlay_directory_json,evidence_placement_json FROM dhr_summary_draft WHERE tenant_id=? AND dhr_instance_id=? FOR UPDATE", TENANT, dhrId);
        ObjectNode before = null;
        int revision;
        long draftId;
        if (existing.isEmpty()) {
            if (command.hasNonNull("draftId") || command.hasNonNull("revision")) throw invalid("草稿已变化，请重新载入");
            draftId = ids.nextId();
            revision = 1;
            jdbc.update("""
                INSERT INTO dhr_summary_draft(id,tenant_id,dhr_instance_id,overlay_directory_json,evidence_placement_json,
                    revision,created_by,created_at,updated_by,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)
                """, draftId, TENANT, dhrId, overlay.toString(), placements.toString(), revision, actor, now, actor, now);
        } else {
            draftId = ((Number) existing.getFirst().get("id")).longValue();
            requireDraftIdentity(command, "draftId", draftId);
            int storedRevision = ((Number) existing.getFirst().get("revision")).intValue();
            before = draftAuditSnapshot(dhrId, storedRevision,
                    json(String.valueOf(existing.getFirst().get("overlay_directory_json")), "汇总目录草稿"),
                    json(String.valueOf(existing.getFirst().get("evidence_placement_json")), "汇总证据草稿"));
            revision = nextRevision(command, storedRevision);
            jdbc.update("UPDATE dhr_summary_draft SET overlay_directory_json=?,evidence_placement_json=?,revision=?,updated_by=?,updated_at=? WHERE id=?",
                    overlay.toString(), placements.toString(), revision, actor, now, draftId);
        }
        jdbc.update("UPDATE dhr_instance SET summary_status='DRAFT',updated_by=?,updated_at=? WHERE id=?", actor, now, dhrId);
        writeAudit(draftId, "SAVE", "保存汇总草稿", before, draftAuditSnapshot(dhrId, revision, overlay, placements));
        return mapper.createObjectNode().put("id", Long.toString(draftId)).put("revision", revision);
    }

    @Transactional
    public ObjectNode submit(Long dhrId, JsonNode command) {
        ObjectNode dhr = lockedCompletedDhr(dhrId);
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT * FROM dhr_summary_draft WHERE tenant_id=? AND dhr_instance_id=? FOR UPDATE", TENANT, dhrId);
        if (rows.isEmpty()) throw invalid("请先保存 DHR 汇总草稿");
        Map<String, Object> draft = rows.getFirst();
        requireDraftIdentity(command, "expectedDraftId", ((Number) draft.get("id")).longValue());
        requireExpectedRevision(command, ((Number) draft.get("revision")).intValue());
        ArrayNode overlay = (ArrayNode) json(String.valueOf(draft.get("overlay_directory_json")), "汇总目录草稿");
        ArrayNode placements = (ArrayNode) json(String.valueOf(draft.get("evidence_placement_json")), "汇总证据草稿");
        ObjectNode detail = dhrInstances.detail(dhrId);
        ArrayNode candidateSnapshot = candidates(detail);
        // Unsaved supplemental copies have no form_instance_record yet, but are still unfinished evidence.
        if (detail.hasNonNull("productionObjectId")) {
            var states = jdbc.queryForList("SELECT state_json FROM production_execution WHERE object_id=?", Long.valueOf(detail.path("productionObjectId").asText()));
            for (var row : states) for (JsonNode operation : json(String.valueOf(row.get("state_json")), "生产执行记录").path("operations")) {
                for (JsonNode copy : operation.path("forms")) if (copy.path("supplement").isObject() && !"COMPLETED".equals(copy.path("status").asText()))
                    throw invalid("存在尚未完成的补录表单，请先完成后再提交汇总");
            }
        }
        validateOverlay(dhr.path("directory_snapshot"), overlay);
        Map<String, ObjectNode> placementByRecord = validatePlacements(candidateSnapshot, dhr.path("directory_snapshot"), overlay, placements);
        ensureRequiredDirectoryItems(detail, placementByRecord);

        int versionNo = jdbc.queryForObject("SELECT COALESCE(MAX(version_no),0)+1 FROM dhr_summary_version WHERE tenant_id=? AND dhr_instance_id=?",
                Integer.class, TENANT, dhrId);
        String mode = dhr.path("dhr_review_mode").asText("NONE");
        String status = "REQUIRED".equals(mode) ? "PENDING_REVIEW" : "FORMALIZED";
        ObjectNode frozen = mapper.createObjectNode().put("dhrInstanceId", dhrId).put("versionNo", versionNo)
                .put("status", status).put("reviewMode", mode);
        ObjectNode reviewBinding = frozen.putObject("reviewBinding").put("mode", mode);
        Long reviewDefinitionId = nullableLong(dhr, "dhr_review_workflow_definition_id");
        Long reviewVersionId = nullableLong(dhr, "dhr_review_workflow_version_id");
        if (reviewDefinitionId != null) reviewBinding.put("workflowDefinitionId", reviewDefinitionId);
        if (reviewVersionId != null) reviewBinding.put("workflowVersionId", reviewVersionId);
        frozen.set("baseDirectory", json(dhr.path("directory_snapshot").asText(), "DHR 目录快照"));
        frozen.set("overlayDirectories", overlay.deepCopy());
        frozen.set("candidates", candidateSnapshot.deepCopy());
        ArrayNode frozenPlacements = frozen.putArray("placements");
        placementByRecord.values().forEach(frozenPlacements::add);
        String snapshotHash = hash(frozen.toString());
        long versionId = ids.nextId();
        LocalDateTime now = LocalDateTime.now();
        String actor = actor();
        jdbc.update("""
            INSERT INTO dhr_summary_version(id,tenant_id,dhr_instance_id,version_no,status,review_mode,
                review_workflow_definition_id,review_workflow_version_id,base_directory_snapshot,
                overlay_directory_snapshot,candidate_snapshot,snapshot_hash,submitted_by,submitted_at,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, versionId, TENANT, dhrId, versionNo, status, mode,
                reviewDefinitionId, reviewVersionId,
                dhr.path("directory_snapshot").asText(), overlay.toString(), candidateSnapshot.toString(), snapshotHash, actor, now, now);
        Map<String, JsonNode> candidatesById = new HashMap<>();
        candidateSnapshot.forEach(candidate -> candidatesById.put(candidate.path("id").asText(), candidate));
        for (Map.Entry<String, ObjectNode> entry : placementByRecord.entrySet()) {
            JsonNode candidate = candidatesById.get(entry.getKey());
            String sourceSnapshot = candidate.toString();
            jdbc.update("""
                INSERT INTO dhr_summary_evidence(id,tenant_id,summary_version_id,source_record_id,target_node_key,
                    before_node_key,display_order,display_name,origin_kind,source_snapshot,source_hash,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
                """, ids.nextId(), TENANT, versionId, Long.valueOf(entry.getKey()), entry.getValue().path("targetNodeKey").asText(),
                    entry.getValue().path("beforeNodeKey").isTextual() ? entry.getValue().path("beforeNodeKey").asText() : null,
                    entry.getValue().path("displayOrder").isInt() ? entry.getValue().path("displayOrder").asInt() : null,
                    entry.getValue().path("displayName").isTextual() ? entry.getValue().path("displayName").asText() : null,
                    candidate.path("originKind").asText(), sourceSnapshot, hash(sourceSnapshot), now);
        }
        jdbc.update("DELETE FROM dhr_summary_draft WHERE id=?", draft.get("id"));
        jdbc.update("UPDATE dhr_instance SET summary_status=?,updated_by=?,updated_at=? WHERE id=?", status, actor, now, dhrId);
        if ("REQUIRED".equals(mode)) {
            var workflow = workflowEngine.createDhrSummaryInstance(reviewDefinitionId, reviewVersionId,
                    Long.toString(versionId), AuditContext.getOperatorId());
            if (!"RUNNING".equals(workflow.getStatus())) throw invalid("DHR 审核流程必须包含审核节点");
            jdbc.update("INSERT INTO dhr_summary_review(summary_version_id,workflow_instance_id,status,submitted_by_id,updated_at) VALUES(?,?,?,?,?)",
                    versionId, workflow.getId(), "PENDING_REVIEW", AuditContext.getOperatorId(), now);
        }
        writeAudit(versionId, "SUBMIT", "提交 DHR 汇总", null, mapper.createObjectNode().put("dhrId", dhrId.toString())
                .put("versionNo", versionNo).put("status", status).put("snapshotHash", snapshotHash));
        return mapper.createObjectNode().put("id", Long.toString(versionId)).put("versionNo", versionNo)
                .put("status", status).put("snapshotHash", snapshotHash);
    }

    @Transactional
    public ObjectNode reorganize(Long dhrId, JsonNode command) {
        var rows = jdbc.queryForList("SELECT summary_status FROM dhr_instance WHERE tenant_id=? AND id=? FOR UPDATE", TENANT, dhrId);
        if (rows.isEmpty() || !"FORMALIZED".equals(rows.getFirst().get("summary_status"))) throw invalid("只有已定稿的 DHR 可重新整理；审核中请先退回");
        String reason = command.path("reason").asText("").strip();
        if (reason.isBlank()) throw invalid("请填写重新整理原因");
        Long latest = jdbc.queryForObject("SELECT id FROM dhr_summary_version WHERE tenant_id=? AND dhr_instance_id=? ORDER BY version_no DESC LIMIT 1", Long.class, TENANT, dhrId);
        if (latest == null || !latest.toString().equals(command.path("expectedVersionId").asText())) throw invalid("汇总版本已变化，请刷新");
        prepareNextDraft(dhrId, latest, reason);
        return workspace(dhrId);
    }

    private void requireDraftIdentity(JsonNode command, String field, long id) {
        if (!Long.toString(id).equals(command.path(field).asText())) throw invalid("草稿已被其他操作创建或替换，请重新载入");
    }

    // Caller holds the DHR row lock. Used only by explicit reorganization or a human review return.
    void prepareNextDraft(Long dhrId, Long versionId, String reason) {
        var frozen = jdbc.queryForMap("SELECT overlay_directory_snapshot FROM dhr_summary_version WHERE tenant_id=? AND dhr_instance_id=? AND id=?", TENANT, dhrId, versionId);
        ArrayNode placements = mapper.createArrayNode();
        jdbc.query("SELECT source_record_id,target_node_key,before_node_key,display_order,display_name FROM dhr_summary_evidence WHERE tenant_id=? AND summary_version_id=? AND (origin_kind<>'DIRECTORY' OR display_name IS NOT NULL) ORDER BY id",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    ObjectNode placement = placements.addObject().put("recordId", rs.getString(1)).put("targetNodeKey", rs.getString(2));
                    if (rs.getString(3) != null) placement.put("beforeNodeKey", rs.getString(3));
                    if (rs.getObject(4) != null) placement.put("displayOrder", rs.getInt(4));
                    if (rs.getString(5) != null) placement.put("displayName", rs.getString(5));
                }, TENANT, versionId);
        long draftId = ids.nextId();
        LocalDateTime now = LocalDateTime.now();
        jdbc.update("INSERT INTO dhr_summary_draft(id,tenant_id,dhr_instance_id,overlay_directory_json,evidence_placement_json,revision,created_by,created_at,updated_by,updated_at) VALUES(?,?,?,?,?,1,?,?,?,?)",
                draftId, TENANT, dhrId, frozen.get("overlay_directory_snapshot"), placements.toString(), actor(), now, actor(), now);
        jdbc.update("UPDATE dhr_instance SET summary_status='DRAFT',updated_by=?,updated_at=? WHERE tenant_id=? AND id=?", actor(), now, TENANT, dhrId);
        writeAudit(draftId, "SAVE", "重新整理 DHR", null, mapper.createObjectNode().put("dhrId", dhrId.toString())
                .put("fromVersionId", versionId.toString()).put("reason", reason).put("revision", 1));
    }

    private ObjectNode lockedCompletedDhr(Long dhrId) {
        List<ObjectNode> rows = jdbc.query("SELECT * FROM dhr_instance WHERE tenant_id=? AND id=? FOR UPDATE", (rs, index) -> {
            ObjectNode row = mapper.createObjectNode().put("id", rs.getString("id")).put("status", rs.getString("status"))
                    .put("summary_status", rs.getString("summary_status")).put("dhr_review_mode", rs.getString("dhr_review_mode"))
                    .put("directory_snapshot", rs.getString("directory_snapshot"));
            String definitionId = rs.getString("dhr_review_workflow_definition_id");
            String workflowVersionId = rs.getString("dhr_review_workflow_version_id");
            if (definitionId != null) row.put("dhr_review_workflow_definition_id", definitionId);
            if (workflowVersionId != null) row.put("dhr_review_workflow_version_id", workflowVersionId);
            return row;
        }, TENANT, dhrId);
        if (rows.isEmpty()) throw invalid("DHR 实例不存在");
        ObjectNode dhr = rows.getFirst();
        if (!"COMPLETED".equals(dhr.path("status").asText())) throw invalid("生产完成后才能进行 DHR 汇总");
        if (Set.of("PENDING_REVIEW", "FORMALIZED").contains(dhr.path("summary_status").asText())) {
            throw invalid("当前 DHR 已提交汇总，不能修改已冻结版本");
        }
        return dhr;
    }

    private ArrayNode candidates(ObjectNode detail) {
        ArrayNode result = mapper.createArrayNode();
        detail.path("recordsByOrigin").path("directory").forEach(result::add);
        detail.path("recordsByOrigin").path("work").forEach(result::add);
        detail.path("recordsByOrigin").path("custom").forEach(result::add);
        return result;
    }

    private void validateOverlay(JsonNode baseDirectoryText, ArrayNode overlay) {
        JsonNode base = baseDirectoryText.isTextual() ? json(baseDirectoryText.asText(), "DHR 目录快照") : baseDirectoryText;
        Set<String> validParents = new HashSet<>();
        base.path("directories").forEach(directory -> validParents.add("base-dir-" + directory.path("id").asText()));
        Set<String> keys = new HashSet<>();
        for (JsonNode node : overlay) {
            String key = node.path("key").asText();
            if (key.isBlank() || !key.startsWith("summary-dir-") || !keys.add(key)) throw invalid("汇总新增目录标识无效或重复");
            if (node.path("name").asText().isBlank()) throw invalid("汇总新增目录名称不能为空");
        }
        validParents.addAll(keys);
        Map<String, String> parents = new HashMap<>();
        for (JsonNode node : overlay) {
            String parent = node.path("parentKey").asText();
            if (parent.isBlank()) throw invalid("汇总新增目录必须建立在基础目录之下");
            if (!validParents.contains(parent)) throw invalid("汇总新增目录的上级目录不存在");
            parents.put(node.path("key").asText(), parent);
        }
        for (String key : keys) {
            Set<String> seen = new HashSet<>();
            String current = key;
            while (keys.contains(current)) {
                if (!seen.add(current)) throw invalid("汇总新增目录不能形成循环层级");
                current = parents.getOrDefault(current, "");
            }
        }
    }

    private Map<String, ObjectNode> validatePlacements(ArrayNode candidates, JsonNode baseDirectoryText, ArrayNode overlay, ArrayNode placements) {
        JsonNode base = baseDirectoryText.isTextual() ? json(baseDirectoryText.asText(), "DHR 目录快照") : baseDirectoryText;
        Set<String> targetKeys = new HashSet<>();
        Set<String> baseItemKeys = new HashSet<>();
        Map<String, String> staticNodeParents = new HashMap<>();
        base.path("directories").forEach(directory -> {
            String directoryKey = "base-dir-" + directory.path("id").asText();
            targetKeys.add(directoryKey);
            if (!directory.path("parentId").isNull() && !directory.path("parentId").isMissingNode())
                staticNodeParents.put(directoryKey, "base-dir-" + directory.path("parentId").asText());
            directory.path("items").forEach(item -> {
                String itemKey = "base-item-" + item.path("id").asText();
                baseItemKeys.add(itemKey);
                staticNodeParents.put(itemKey, directoryKey);
            });
        });
        overlay.forEach(node -> {
            String key = node.path("key").asText();
            targetKeys.add(key);
            staticNodeParents.put(key, node.path("parentKey").asText());
        });
        Map<String, JsonNode> candidateById = new LinkedHashMap<>();
        for (JsonNode candidate : candidates) candidateById.put(candidate.path("id").asText(), candidate);
        Map<String, ObjectNode> result = new LinkedHashMap<>();
        Set<String> occupiedPositions = new HashSet<>();
        for (JsonNode candidate : candidates) {
            if (!"DIRECTORY".equals(candidate.path("originKind").asText()) || !"COMPLETED".equals(candidate.path("status").asText())) continue;
            String itemId = candidate.path("snapshot").path("dhrItemId").asText();
            if (!baseItemKeys.contains("base-item-" + itemId)) continue;
            result.put(candidate.path("id").asText(), mapper.createObjectNode().put("recordId", candidate.path("id").asText())
                    .put("targetNodeKey", "base-item-" + itemId));
        }
        Set<String> suppliedRecords = new HashSet<>();
        for (JsonNode placement : placements) {
            String recordId = placement.path("recordId").asText();
            String target = placement.path("targetNodeKey").asText();
            JsonNode candidate = candidateById.get(recordId);
            if (candidate == null) throw invalid("汇总候选记录不存在或已发生变化");
            if (!suppliedRecords.add(recordId)) throw invalid("同一表单实例在一个汇总版本中只能归入一个目录位置");
            if ("DIRECTORY".equals(candidate.path("originKind").asText())) {
                ObjectNode automatic = result.get(recordId);
                if (automatic == null || !target.equals(automatic.path("targetNodeKey").asText())
                        || placement.hasNonNull("beforeNodeKey") || placement.hasNonNull("displayOrder"))
                    throw invalid("目录表单必须保持原目录归属和顺序");
                applyDisplayName(placement, automatic);
                continue;
            }
            if (!targetKeys.contains(target)) throw invalid("候选记录的目标目录不存在");
            if (!"COMPLETED".equals(candidate.path("status").asText())) throw invalid("只有已完成的表单记录才能纳入 DHR 汇总");
            ObjectNode validated = mapper.createObjectNode().put("recordId", recordId).put("targetNodeKey", target);
            JsonNode before = placement.path("beforeNodeKey");
            if (!before.isMissingNode() && !before.isNull()) {
                if (!before.isTextual() || !target.equals(staticNodeParents.get(before.asText())))
                    throw invalid("插入位置不属于目标目录");
                validated.put("beforeNodeKey", before.asText());
            }
            JsonNode order = placement.path("displayOrder");
            if (!order.isMissingNode() && !order.isNull()) {
                if (!order.isInt() || order.asInt() < 0) throw invalid("汇总表单排序无效");
                if (!occupiedPositions.add(target + "\u0000" + before.asText("") + "\u0000" + order.asInt()))
                    throw invalid("同一目录位置不能放置多个表单实例");
                validated.put("displayOrder", order.asInt());
            }
            applyDisplayName(placement, validated);
            if (result.putIfAbsent(recordId, validated) != null) {
                throw invalid("同一表单实例在一个汇总版本中只能归入一个目录位置");
            }
        }
        return result;
    }

    private void applyDisplayName(JsonNode placement, ObjectNode validated) {
        JsonNode displayName = placement.path("displayName");
        if (!displayName.isMissingNode() && !displayName.isNull()) {
            if (!displayName.isTextual() || displayName.asText().isBlank() || !displayName.asText().equals(displayName.asText().strip())
                    || displayName.asText().length() > 120) throw invalid("汇总文档名称须为 1 至 120 字且不能首尾留空");
            validated.put("displayName", displayName.asText());
        }
    }

    private void ensureRequiredDirectoryItems(ObjectNode detail, Map<String, ObjectNode> placements) {
        Set<String> selected = placements.keySet();
        for (JsonNode directory : detail.path("directorySnapshot").path("directories")) {
            for (JsonNode item : directory.path("items")) {
                if (!item.path("required").asBoolean()) continue;
                boolean complete = false;
                for (JsonNode record : item.path("records")) {
                    if (selected.contains(record.path("id").asText()) && "COMPLETED".equals(record.path("status").asText())) complete = true;
                }
                if (!complete) throw invalid("必填目录项“" + item.path("displayName").asText(item.path("formName").asText()) + "”缺少已完成记录");
            }
        }
    }

    private ArrayNode requireArray(JsonNode command, String field) {
        if (command == null || !command.path(field).isArray()) throw invalid("汇总草稿数据格式错误");
        return (ArrayNode) command.path(field);
    }

    private int nextRevision(JsonNode command, int storedRevision) {
        if (command == null || !command.hasNonNull("revision")) {
            throw invalid("汇总草稿已被其他操作创建，请刷新后重试");
        }
        if (command.path("revision").asInt() != storedRevision) {
            throw invalid("汇总草稿已被其他操作更新，请刷新后重试");
        }
        return storedRevision + 1;
    }

    private void requireExpectedRevision(JsonNode command, int storedRevision) {
        if (command == null || !command.hasNonNull("expectedRevision")
                || command.path("expectedRevision").asInt() != storedRevision) {
            throw invalid("汇总草稿已被其他操作更新，请刷新后重试");
        }
    }

    private JsonNode json(String value, String label) {
        try { return mapper.readTree(value); }
        catch (Exception exception) { throw invalid(label + "无法读取"); }
    }

    private Long nullableLong(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.path(field).asLong() : null;
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (Exception exception) {
            throw new IllegalStateException("无法生成 DHR 汇总快照指纹", exception);
        }
    }

    private String actor() {
        String name = AuditContext.getOperatorName();
        return name == null || name.isBlank() ? AuditContext.getOperatorId() : name;
    }

    private ObjectNode draftAuditSnapshot(Long dhrId, int revision, JsonNode overlay, JsonNode placements) {
        ObjectNode snapshot = mapper.createObjectNode().put("dhrId", dhrId.toString()).put("revision", revision);
        snapshot.set("overlayDirectories", overlay.deepCopy());
        snapshot.set("placements", placements.deepCopy());
        return snapshot;
    }

    private void writeAudit(long id, String action, String functionName, ObjectNode before, ObjectNode after) {
        audits.save(AuditEvent.builder().id(ids.nextId()).entityType(action.equals("SAVE") ? "DHR_SUMMARY_DRAFT" : "DHR_SUMMARY_VERSION")
                .entityId(Long.toString(id)).action(action).contentBefore(before == null ? null : before.toString()).contentAfter(after.toString())
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                .moduleName("记录").menuName("DHR管理 · DHR汇总").functionName(functionName)
                .dataSummary(after.path("dhrId").asText()).ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now()).build());
    }
}
