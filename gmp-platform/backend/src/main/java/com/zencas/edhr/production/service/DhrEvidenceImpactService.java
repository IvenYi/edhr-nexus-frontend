package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
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
        Set<String> frozenRecordIds = new HashSet<>();
        for (var item : evidence) {
            frozenRecordIds.add(item.get("source_record_id").toString());
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
                    .put("instanceNo", frozen.path("instanceNo").asText()).put("message", "来源记录与提交时冻结证据不一致，请核对表单变更或作废记录");
        }
        var version = jdbc.queryForList("SELECT v.evidence_model_version,v.attachment_snapshot,d.production_object_id,d.id AS dhr_id FROM dhr_summary_version v JOIN dhr_instance d ON d.id=v.dhr_instance_id AND d.tenant_id=v.tenant_id WHERE v.tenant_id='default' AND v.id=?", versionId);
        if (!version.isEmpty() && ((Number) version.getFirst().get("evidence_model_version")).intValue() >= 2) {
            Object objectId = version.getFirst().get("production_object_id");
            if (objectId == null) throw invalid("DHR 生产对象关联缺失，无法核对新记录");
            var current = jdbc.queryForList("SELECT id,instance_no FROM form_instance_record WHERE tenant_id='default' AND source_type='PRODUCTION_EXECUTION' AND object_id=? ORDER BY id" + (lock ? " FOR UPDATE" : ""), objectId);
            for (var row : current) if (!frozenRecordIds.contains(text(row, "id")))
                result.addObject().put("recordId", text(row, "id")).put("instanceNo", text(row, "instance_no"))
                        .put("message", "提交后新增表单实例，需重新核查完整证据范围");
            JsonNode frozenAttachments = json(text(version.getFirst(), "attachment_snapshot"));
            var currentAttachments = jdbc.queryForList("SELECT id,sha256,verification_status,stored_path FROM dhr_attachment WHERE tenant_id='default' AND dhr_instance_id=? AND active=TRUE ORDER BY id" + (lock ? " FOR UPDATE" : ""), version.getFirst().get("dhr_id"));
            Set<String> seenAttachments = new HashSet<>();
            for (var attachment : currentAttachments) {
                String id = text(attachment, "id");
                seenAttachments.add(id);
                JsonNode frozenAttachment = null;
                for (JsonNode item : frozenAttachments) if (id.equals(item.path("id").asText())) frozenAttachment = item;
                boolean changed = frozenAttachment == null || !text(attachment, "sha256").equals(frozenAttachment.path("sha256").asText())
                        || !"VERIFIED".equals(text(attachment, "verification_status"));
                if (!changed) try {
                    Path path = Path.of(text(attachment, "stored_path"));
                    byte[] digest = MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(path));
                    changed = !text(attachment, "sha256").equals(HexFormat.of().formatHex(digest));
                } catch (Exception ex) { changed = true; }
                if (changed) result.addObject().put("attachmentId", id).put("message", "附件范围、核验状态或文件内容与冻结版本不一致");
            }
            for (JsonNode item : frozenAttachments) if (!seenAttachments.contains(item.path("id").asText()))
                result.addObject().put("attachmentId", item.path("id").asText()).put("message", "冻结版本附件已解除关联或不可用");
        }
        return result;
    }
    private static String text(Map<String, Object> row, String key) { return row.get(key) == null ? "" : row.get(key).toString(); }
    private JsonNode json(String value) { try { return mapper.readTree(value); } catch (Exception e) { throw invalid("审核证据无法读取"); } }
}
