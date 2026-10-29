package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Effective-source impact and review guards. Never edits a frozen snapshot or approval. */
@Service
@RequiredArgsConstructor
public class DhrEvidenceImpactService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    /** Caller holds the production object lock shared with summary submission and approval. */
    public void requireRecordControlAllowed(long objectId) {
        Long count = jdbc.queryForObject("SELECT count(*) FROM dhr_instance WHERE tenant_id='default' AND production_object_id=? AND summary_status='PENDING_REVIEW'", Long.class, objectId);
        if (count != null && count > 0) throw invalid("关联 DHR 正在审批，请先由有权审批人退回整理，再申请表单变更或作废");
    }

    public void requireNoPendingApplications(long dhrId) {
        Long count = jdbc.queryForObject("""
            SELECT count(*) FROM record_control_request q JOIN form_instance_record f ON f.id=q.record_id AND f.tenant_id=q.tenant_id
            JOIN dhr_instance d ON d.production_object_id=f.object_id AND d.tenant_id=f.tenant_id
            WHERE d.tenant_id='default' AND d.id=? AND q.status='IN_REVIEW'
            """, Long.class, dhrId);
        if (count != null && count > 0) throw invalid("来源表单有审批中的变更或作废申请，暂不能提交汇总或审批通过；原有效修订仍可查看");
    }

    /** Called only after the real source result succeeds, inside its existing transaction. */
    public void sourceEffective(String eventId, long requestId, long recordId, long fromRevisionId,
                                long toRevisionId, String action, LocalDateTime occurredAt) {
        var versions = jdbc.queryForList("""
            SELECT DISTINCT v.id,COALESCE(v.submitted_by_id,
              (SELECT r.submitted_by_id FROM dhr_summary_review r WHERE r.summary_version_id=v.id),
              (SELECT MIN(a.operator_id) FROM audit_event a WHERE a.entity_type='DHR_SUMMARY_VERSION'
                AND a.tenant_id=v.tenant_id AND a.entity_id=CAST(v.id AS VARCHAR) AND a.action='SUBMIT'
                HAVING COUNT(DISTINCT a.operator_id)=1)) AS submitted_by_id FROM dhr_summary_evidence e
            JOIN dhr_summary_version v ON v.id=e.summary_version_id AND v.tenant_id=e.tenant_id
            WHERE e.tenant_id='default' AND e.source_record_id=? ORDER BY v.id
            """, recordId);
        for (var version : versions) {
            long versionId = ((Number) version.get("id")).longValue();
            Long impactId = jdbc.queryForObject("""
                INSERT INTO dhr_evidence_impact(tenant_id,event_id,request_id,record_id,summary_version_id,
                  from_revision_id,to_revision_id,action,occurred_at) VALUES('default',?,?,?,?,?,?,?,?)
                ON CONFLICT(tenant_id,event_id,summary_version_id) DO UPDATE SET event_id=EXCLUDED.event_id RETURNING id
                """, Long.class, eventId, requestId, recordId, versionId, fromRevisionId, toRevisionId, action, occurredAt);
            Set<String> recipients = new LinkedHashSet<>();
            String submitter = text(version, "submitted_by_id");
            if (!submitter.isBlank()) recipients.add(submitter);
            for (var task : jdbc.queryForList("""
                SELECT t.assignee_id,t.candidate_snapshot FROM dhr_summary_review r JOIN workflow_task t ON t.instance_id=r.workflow_instance_id
                WHERE r.summary_version_id=? AND r.status='PENDING_REVIEW' AND t.status IN ('PENDING','PROCESSING')
                """, versionId)) {
                JsonNode candidates = json(text(task, "candidate_snapshot"));
                if (candidates.path("unrestricted").asBoolean()) {
                    recipients.addAll(jdbc.queryForList("""
                        SELECT CAST(u.id AS VARCHAR) FROM user_account u JOIN user_role ur ON ur.user_id=u.id
                        JOIN role ro ON ro.id=ur.role_id AND ro.tenant_id=u.tenant_id
                        LEFT JOIN role_permission rp ON rp.role_id=ro.id LEFT JOIN permission p ON p.id=rp.permission_id
                        WHERE u.tenant_id=0 AND u.status='ACTIVE' GROUP BY u.id
                        HAVING MAX(CASE WHEN ro.code='ADMIN' THEN 1 ELSE 0 END)=1
                          OR COUNT(DISTINCT CASE WHEN p.code IN ('records.dhr-review','dhr.reviews.act') THEN p.code END)=2
                        """, String.class));
                } else if (!candidates.path("userIds").isEmpty()) {
                    candidates.path("userIds").forEach(id -> recipients.add(id.asText()));
                } else if (!text(task, "assignee_id").isBlank()) recipients.add(text(task, "assignee_id"));
            }
            for (String recipient : recipients) if (!recipient.isBlank()) jdbc.update("""
                INSERT INTO dhr_impact_notification(impact_id,recipient_id) VALUES(?,?) ON CONFLICT DO NOTHING
                """, impactId, recipient);
        }
    }

    ArrayNode changes(Long versionId, boolean lock) {
        ArrayNode result = mapper.createArrayNode();
        var evidence = jdbc.queryForList("SELECT source_record_id,source_snapshot FROM dhr_summary_evidence WHERE tenant_id='default' AND summary_version_id=? ORDER BY source_record_id", versionId);
        Set<String> frozenRecordIds = new HashSet<>();
        // Frozen membership is immutable. Read only its current records, retaining
        // the same ascending ID lock order as the former per-evidence lookups.
        Map<String, Map<String, Object>> currentById = new HashMap<>();
        Set<String> impactedRecordIds = new HashSet<>(jdbc.queryForList("SELECT CAST(record_id AS VARCHAR) FROM dhr_evidence_impact WHERE tenant_id='default' AND summary_version_id=?", String.class, versionId));
        if (!evidence.isEmpty()) {
            var currentRecords = jdbc.queryForList("SELECT id,snapshot_json,values_json,status,version_id,current_revision_id FROM form_instance_record WHERE tenant_id='default' AND id IN (SELECT source_record_id FROM dhr_summary_evidence WHERE tenant_id='default' AND summary_version_id=?) ORDER BY id" + (lock ? " FOR UPDATE" : ""), versionId);
            for (var record : currentRecords) currentById.put(text(record, "id"), record);
        }
        for (var item : evidence) {
            frozenRecordIds.add(item.get("source_record_id").toString());
            JsonNode frozen = json(text(item, "source_snapshot"));
            var record = currentById.get(text(item, "source_record_id"));
            boolean changed = record == null || impactedRecordIds.contains(text(item, "source_record_id"));
            if (!changed) {
                JsonNode currentSnapshot = liveJson(text(record, "snapshot_json"));
                JsonNode currentValues = liveJson(text(record, "values_json"));
                changed = currentSnapshot == null || currentValues == null
                        || !frozen.path("snapshot").equals(currentSnapshot)
                        || !frozen.path("fieldValues").equals(currentValues)
                        || !frozen.path("status").asText().equals(text(record, "status"))
                        || !frozen.path("templateVersionId").asText().equals(text(record, "version_id"))
                        || !frozen.path("currentRevisionId").asText("").isBlank()
                            && !frozen.path("currentRevisionId").asText().equals(text(record, "current_revision_id"));
            }
            if (changed) result.addObject().put("recordId", item.get("source_record_id").toString())
                    .put("instanceNo", frozen.path("instanceNo").asText()).put("message", "来源记录与提交时冻结证据不一致，请核对表单变更或作废记录");
        }
        var version = jdbc.queryForList("SELECT v.attachment_snapshot,d.production_object_id,d.id AS dhr_id FROM dhr_summary_version v JOIN dhr_instance d ON d.id=v.dhr_instance_id AND d.tenant_id=v.tenant_id WHERE v.tenant_id='default' AND v.id=?", versionId);
        if (!version.isEmpty()) {
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
    private static String text(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value == null ? "" : value instanceof byte[] bytes ? new String(bytes, java.nio.charset.StandardCharsets.UTF_8) : value.toString();
    }
    private JsonNode json(String value) { try { return mapper.readTree(value); } catch (Exception e) { throw invalid("审核证据无法读取"); } }
    private JsonNode liveJson(String value) { try { return mapper.readTree(value); } catch (Exception e) { return null; } }
}
