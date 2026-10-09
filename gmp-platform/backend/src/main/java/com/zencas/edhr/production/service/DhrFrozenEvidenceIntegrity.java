package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Checks the frozen version digest and each candidate against its separately stored evidence row. */
@Service
@RequiredArgsConstructor
public class DhrFrozenEvidenceIntegrity {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    void verify(Long versionId, JsonNode candidates) {
        if (!candidates.isArray()) throw invalid("冻结证据清单无效，请核对汇总版本");
        Map<String, JsonNode> byId = new HashMap<>();
        for (JsonNode candidate : candidates) {
            String id = candidate.path("id").asText("");
            if (id.isBlank() || byId.putIfAbsent(id, candidate) != null)
                throw invalid("冻结证据清单包含无效或重复实例，请核对汇总版本");
        }
        var rows = jdbc.queryForList("""
            SELECT source_record_id,target_node_key,before_node_key,display_order,display_name,source_snapshot,source_hash
            FROM dhr_summary_evidence WHERE tenant_id='default' AND summary_version_id=? ORDER BY id
            """, versionId);
        if (rows.size() != byId.size()) throw invalid("冻结证据清单与原始快照数量不一致，请核对汇总版本");
        for (var row : rows) {
            String id = String.valueOf(row.get("source_record_id"));
            String snapshot = row.get("source_snapshot") == null ? "" : row.get("source_snapshot").toString();
            JsonNode candidate = byId.remove(id);
            if (candidate == null || !hash(snapshot).equals(row.get("source_hash")))
                throw invalid("冻结证据原始快照校验失败，请核对汇总版本");
            try {
                if (!candidate.equals(mapper.readTree(snapshot)))
                    throw invalid("冻结证据清单与原始快照不一致，请核对汇总版本");
            } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
                throw invalid("冻结证据原始快照无法读取，请核对汇总版本");
            }
        }
        if (!byId.isEmpty()) throw invalid("冻结证据清单与原始快照不一致，请核对汇总版本");
        verifyVersionDigest(versionId, rows);
    }

    private void verifyVersionDigest(Long versionId, java.util.List<Map<String, Object>> placements) {
        var versions = jdbc.queryForList("""
            SELECT dhr_instance_id,version_no,status,review_mode,review_workflow_definition_id,
                   review_workflow_version_id,base_directory_snapshot,overlay_directory_snapshot,
                   candidate_snapshot,attachment_snapshot,check_result_snapshot,snapshot_hash
            FROM dhr_summary_version WHERE tenant_id='default' AND id=?
            """, versionId);
        if (versions.size() != 1) throw invalid("冻结证据版本不存在，请核对汇总版本");
        Map<String, Object> row = versions.getFirst();
        String mode = String.valueOf(row.get("review_mode"));
        ObjectNode frozen = mapper.createObjectNode()
                .put("dhrInstanceId", ((Number) row.get("dhr_instance_id")).longValue())
                .put("versionNo", ((Number) row.get("version_no")).intValue())
                .put("status", String.valueOf(row.get("status"))).put("reviewMode", mode);
        ObjectNode binding = frozen.putObject("reviewBinding").put("mode", mode);
        if (row.get("review_workflow_definition_id") != null)
            binding.put("workflowDefinitionId", ((Number) row.get("review_workflow_definition_id")).longValue());
        if (row.get("review_workflow_version_id") != null)
            binding.put("workflowVersionId", ((Number) row.get("review_workflow_version_id")).longValue());
        frozen.set("baseDirectory", parse(row, "base_directory_snapshot"));
        frozen.set("overlayDirectories", parse(row, "overlay_directory_snapshot"));
        frozen.set("candidates", parse(row, "candidate_snapshot"));
        frozen.set("attachments", parse(row, "attachment_snapshot"));
        frozen.set("checkResult", parse(row, "check_result_snapshot"));
        ArrayNode frozenPlacements = frozen.putArray("placements");
        for (Map<String, Object> placement : placements) {
            ObjectNode node = frozenPlacements.addObject()
                    .put("recordId", String.valueOf(placement.get("source_record_id")))
                    .put("targetNodeKey", String.valueOf(placement.get("target_node_key")));
            if (placement.get("before_node_key") != null) node.put("beforeNodeKey", String.valueOf(placement.get("before_node_key")));
            if (placement.get("display_order") != null) node.put("displayOrder", ((Number) placement.get("display_order")).intValue());
            if (placement.get("display_name") != null) node.put("displayName", String.valueOf(placement.get("display_name")));
        }
        if (!hash(frozen.toString()).equals(row.get("snapshot_hash")))
            throw invalid("冻结证据版本摘要不一致，请核对汇总版本");
    }

    private JsonNode parse(Map<String, Object> row, String key) {
        try {
            return mapper.readTree(String.valueOf(row.get(key)));
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw invalid("冻结证据版本无法读取，请核对汇总版本");
        }
    }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
