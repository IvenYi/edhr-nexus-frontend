package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Read-time impact projection, shared by review and historical summary views. Never edits a snapshot. */
@Service
@RequiredArgsConstructor
public class DhrEvidenceImpactService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    ArrayNode changes(Long versionId, boolean lock) {
        ArrayNode result = mapper.createArrayNode();
        var evidence = jdbc.queryForList("SELECT source_record_id,source_snapshot FROM dhr_summary_evidence WHERE tenant_id='default' AND summary_version_id=? ORDER BY source_record_id", versionId);
        for (var item : evidence) {
            JsonNode frozen = json(text(item, "source_snapshot"));
            var current = jdbc.queryForList("SELECT snapshot_json,values_json,status,version_id FROM form_instance_record WHERE tenant_id='default' AND id=?" + (lock ? " FOR UPDATE" : ""), item.get("source_record_id"));
            boolean changed = current.isEmpty();
            if (!changed) {
                var record = current.getFirst();
                changed = !frozen.path("snapshot").equals(json(text(record, "snapshot_json")))
                        || !frozen.path("fieldValues").equals(json(text(record, "values_json")))
                        || !frozen.path("status").asText().equals(text(record, "status"))
                        || !frozen.path("templateVersionId").asText().equals(text(record, "version_id"));
            }
            if (changed) result.addObject().put("recordId", item.get("source_record_id").toString())
                    .put("instanceNo", frozen.path("instanceNo").asText()).put("message", "已纳入记录与提交时证据不一致，请核对表单变更或作废记录");
        }
        return result;
    }
    private static String text(Map<String, Object> row, String key) { return row.get(key) == null ? "" : row.get(key).toString(); }
    private JsonNode json(String value) { try { return mapper.readTree(value); } catch (Exception e) { throw invalid("审核证据无法读取"); } }
}
