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

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Builds a self-describing ZIP from one frozen version; never reads live form values. */
@Service
@RequiredArgsConstructor
public class DhrArchiveService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final DhrAttachmentService attachments;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;

    public Path export(Long dhrId, Long versionId, String scope, Set<String> selectedRecords, Set<String> selectedAttachments) throws IOException {
        if (!Set.of("FULL", "SELECTED").contains(scope)) throw invalid("导出范围无效");
        var versions = jdbc.queryForList("""
            SELECT v.*,d.dhr_no,d.object_no,d.object_type,d.production_object_id,d.status AS dhr_status
            FROM dhr_summary_version v JOIN dhr_instance d ON d.id=v.dhr_instance_id AND d.tenant_id=v.tenant_id
            WHERE v.tenant_id='default' AND v.dhr_instance_id=? AND v.id=?
            """, dhrId, versionId);
        if (versions.isEmpty()) throw invalid("冻结的 DHR 汇总版本不存在");
        Map<String, Object> version = versions.getFirst();
        if (((Number) version.get("evidence_model_version")).intValue() < 2)
            throw invalid("此汇总不是完整证据模型，不能作为完整 DHR 版本导出");
        ArrayNode records = (ArrayNode) json(text(version, "candidate_snapshot"));
        ArrayNode frozenAttachments = (ArrayNode) json(text(version, "attachment_snapshot"));
        Set<String> availableRecords = new HashSet<>();
        records.forEach(record -> availableRecords.add(record.path("id").asText()));
        Set<String> availableAttachments = new HashSet<>();
        frozenAttachments.forEach(attachment -> availableAttachments.add(attachment.path("id").asText()));
        if (!"FULL".equals(scope) && (selectedRecords == null || selectedAttachments == null
                || (selectedRecords.isEmpty() && selectedAttachments.isEmpty())
                || !availableRecords.containsAll(selectedRecords) || !availableAttachments.containsAll(selectedAttachments)))
            throw invalid("选定导出范围无效或包含非当前版本证据");
        Set<String> chosenRecords = "FULL".equals(scope) ? availableRecords : selectedRecords;
        Set<String> chosenAttachments = "FULL".equals(scope) ? availableAttachments : selectedAttachments;
        ObjectNode manifest = mapper.createObjectNode().put("archiveType", "DHR_FROZEN_VERSION")
                .put("scope", scope).put("completeVersion", "FULL".equals(scope))
                .put("dhrId", dhrId.toString()).put("dhrNo", text(version, "dhr_no"))
                .put("objectNo", text(version, "object_no")).put("objectType", text(version, "object_type"))
                .put("versionId", versionId.toString()).put("versionNo", ((Number) version.get("version_no")).intValue())
                .put("versionStatus", text(version, "status")).put("snapshotHash", text(version, "snapshot_hash"))
                .put("exportedAt", OffsetDateTime.now().toString()).put("exportedBy", AuditContext.getOperatorId());
        manifest.set("baseDirectory", json(text(version, "base_directory_snapshot")));
        manifest.set("overlayDirectories", json(text(version, "overlay_directory_snapshot")));
        manifest.set("checkResult", version.get("check_result_snapshot") == null ? mapper.nullNode() : json(text(version, "check_result_snapshot")));
        ArrayNode placements = manifest.putArray("placements");
        jdbc.query("SELECT source_record_id,target_node_key,before_node_key,display_order,display_name FROM dhr_summary_evidence WHERE tenant_id='default' AND summary_version_id=? ORDER BY id",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    if (!chosenRecords.contains(rs.getString(1))) return;
                    placements.addObject().put("recordId", rs.getString(1)).put("targetNodeKey", rs.getString(2))
                            .put("beforeNodeKey", rs.getString(3)).put("displayOrder", rs.getObject(4) == null ? null : rs.getInt(4))
                            .put("displayName", rs.getString(5));
                }, versionId);
        if (placements.size() != chosenRecords.size()) throw invalid("冻结证据清单不完整，导出已停止");
        ArrayNode inventory = manifest.putArray("files");
        Path zip = Files.createTempFile("dhr-archive-", ".zip");
        try (OutputStream output = Files.newOutputStream(zip); ZipOutputStream archive = new ZipOutputStream(output, StandardCharsets.UTF_8)) {
            int writtenRecords = 0;
            for (JsonNode record : records) {
                String id = record.path("id").asText();
                if (!chosenRecords.contains(id)) continue;
                add(archive, inventory, "forms/" + id + ".json", mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(record), "FORM_RECORD", id);
                add(archive, inventory, "forms/" + id + ".html", readableHtml(record).getBytes(StandardCharsets.UTF_8), "FORM_RENDERING", id);
                writtenRecords++;
            }
            if (writtenRecords != chosenRecords.size()) throw invalid("冻结表单快照不完整，导出已停止");
            int writtenAttachments = 0;
            for (JsonNode attachment : frozenAttachments) {
                String id = attachment.path("id").asText();
                if (!chosenAttachments.contains(id)) continue;
                Path file = attachments.file(dhrId, Long.valueOf(id));
                byte[] bytes = Files.readAllBytes(file);
                if (bytes.length != attachment.path("size").asLong() || !sha256(bytes).equals(attachment.path("sha256").asText()))
                    throw invalid("附件内容与冻结版本不一致，导出已停止：" + id);
                String extension = switch (attachment.path("mimeType").asText()) {
                    case "application/pdf" -> "pdf"; case "image/png" -> "png"; case "image/jpeg" -> "jpg";
                    default -> throw invalid("冻结附件类型无效，导出已停止：" + id);
                };
                add(archive, inventory, "attachments/" + id + "." + extension, bytes, "ATTACHMENT", id);
                writtenAttachments++;
            }
            if (writtenAttachments != chosenAttachments.size()) throw invalid("冻结附件清单不完整，导出已停止");
            manifest.set("attachments", selectedAttachmentMetadata(frozenAttachments, chosenAttachments));
            manifest.set("auditEvents", auditsFor(dhrId, versionId));
            manifest.put("auditEventsBoundary", "AS_OF_EXPORT");
            Object productionObjectId = version.get("production_object_id");
            if (productionObjectId == null || version.get("submitted_at") == null) throw invalid("冻结版本缺少来源追溯时间或生产对象");
            String objectId = productionObjectId.toString();
            var submittedAt = (java.sql.Timestamp) version.get("submitted_at");
            manifest.put("sourceTraceCutoffAt", submittedAt.toLocalDateTime().toString());
            manifest.set("sourceAuditEvents", sourceAuditEvents(objectId, submittedAt));
            manifest.set("sourceSignatures", sourceSignatures(objectId, submittedAt));
            manifest.set("reviewSignatures", signaturesFor(versionId));
            manifest.put("formCount", writtenRecords).put("attachmentCount", writtenAttachments);
            add(archive, inventory, "README.txt", ("DHR 冻结版本 " + text(version, "dhr_no") + " V" + version.get("version_no")
                    + "\n导出范围：" + ("FULL".equals(scope) ? "完整版本" : "选定范围（不是完整 DHR）")
                    + "\nmanifest.json 包含目录、证据索引、摘要、审批和审计信息；sourceAuditEvents/sourceSignatures 截止于版本提交时间，auditEvents 为导出时 DHR 审计。forms 目录为逐实例冻结 JSON 与字段级可阅读 HTML（非原模板版式）。\n").getBytes(StandardCharsets.UTF_8), "README", "");
            byte[] manifestBytes = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(manifest);
            archive.putNextEntry(new ZipEntry("manifest.json"));
            archive.write(manifestBytes);
            archive.closeEntry();
        } catch (Exception ex) {
            Files.deleteIfExists(zip);
            if (ex instanceof IOException io) throw io;
            throw ex;
        }
        try { audits.save(AuditEvent.builder().id(ids.nextId()).entityType("DHR_SUMMARY_EXPORT").entityId(versionId.toString())
                .action("EXPORT").contentAfter(mapper.createObjectNode().put("dhrId", dhrId.toString()).put("scope", scope)
                        .put("versionId", versionId.toString()).put("archiveSha256", sha256(zip)).toString())
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                .moduleName("记录").menuName("DHR管理").functionName("DHR ZIP 导出")
                .dataSummary(text(version, "dhr_no")).ipAddress(AuditContext.getIpAddress())
                .createdAt(LocalDateTime.now()).build()); }
        catch (Exception ex) { Files.deleteIfExists(zip); throw ex; }
        return zip;
    }

    private ArrayNode selectedAttachmentMetadata(ArrayNode frozen, Set<String> selected) {
        ArrayNode result = mapper.createArrayNode();
        frozen.forEach(item -> { if (selected.contains(item.path("id").asText())) result.add(item.deepCopy()); });
        return result;
    }

    private ArrayNode auditsFor(Long dhrId, Long versionId) {
        ArrayNode result = mapper.createArrayNode();
        jdbc.query("""
            SELECT id,entity_type,entity_id,action,content_before,content_after,snapshot_hash,operator_id,operator_name,created_at
            FROM audit_event WHERE tenant_id='default' AND ((entity_type='DHR_INSTANCE' AND entity_id=?)
              OR (entity_type IN ('DHR_SUMMARY_VERSION','DHR_SUMMARY_REVIEW','DHR_SUMMARY_EXPORT') AND entity_id=?)
              OR (entity_type IN ('DHR_SUMMARY_DRAFT','DHR_ATTACHMENT') AND data_summary=?))
            ORDER BY created_at,id
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> result.addObject()
                    .put("id", rs.getString("id")).put("entityType", rs.getString("entity_type"))
                    .put("entityId", rs.getString("entity_id")).put("action", rs.getString("action"))
                    .put("before", rs.getString("content_before")).put("after", rs.getString("content_after"))
                    .put("snapshotHash", rs.getString("snapshot_hash"))
                    .put("operatorId", rs.getString("operator_id")).put("operatorName", rs.getString("operator_name"))
                    .put("createdAt", rs.getTimestamp("created_at").toLocalDateTime().toString()),
                dhrId.toString(), versionId.toString(), dhrId.toString());
        return result;
    }

    private ArrayNode sourceAuditEvents(String objectId, java.sql.Timestamp cutoff) {
        ArrayNode result = mapper.createArrayNode();
        jdbc.query("""
            SELECT id,action,content_before,content_after,snapshot_hash,operator_id,operator_name,created_at,data_summary
            FROM audit_event WHERE tenant_id='default' AND entity_type='PRODUCTION_EXECUTION' AND entity_id=? AND created_at<=?
            ORDER BY created_at,id
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> result.addObject()
                    .put("id", rs.getString("id")).put("action", rs.getString("action"))
                    .put("before", rs.getString("content_before")).put("after", rs.getString("content_after"))
                    .put("snapshotHash", rs.getString("snapshot_hash"))
                    .put("operatorId", rs.getString("operator_id")).put("operatorName", rs.getString("operator_name"))
                    .put("dataSummary", rs.getString("data_summary"))
                    .put("createdAt", rs.getTimestamp("created_at").toLocalDateTime().toString()), objectId, cutoff);
        return result;
    }

    private ArrayNode sourceSignatures(String objectId, java.sql.Timestamp cutoff) {
        ArrayNode result = mapper.createArrayNode();
        jdbc.query("""
            SELECT id,meaning,signer_id,signer_name,auth_method,auth_event_ref,snapshot_hash,snapshot_data,signed_at
            FROM signature WHERE tenant_id='default' AND target_type='PRODUCTION_EXECUTION' AND target_id=? AND signed_at<=?
            ORDER BY signed_at,id
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                String payload = rs.getString("snapshot_data");
                String digest = rs.getString("snapshot_hash");
                if (payload == null || digest == null || !sha256(payload.getBytes(StandardCharsets.UTF_8)).equals(digest))
                    throw invalid("来源签署证据摘要不一致，导出已停止：" + rs.getString("id"));
                result.addObject().put("id", rs.getString("id")).put("meaning", rs.getString("meaning"))
                        .put("signerId", rs.getString("signer_id")).put("signerName", rs.getString("signer_name"))
                        .put("authMethod", rs.getString("auth_method")).put("authEventRef", rs.getString("auth_event_ref"))
                        .put("snapshotHash", digest).put("snapshotData", payload)
                        .put("signedAt", rs.getTimestamp("signed_at").toLocalDateTime().toString());
            }, objectId, cutoff);
        return result;
    }

    private ArrayNode signaturesFor(Long versionId) {
        ArrayNode result = mapper.createArrayNode();
        jdbc.query("""
            SELECT s.id,s.meaning,s.signer_id,s.signer_name,s.auth_method,s.auth_event_ref,s.snapshot_hash,s.snapshot_data,s.signed_at,
                   t.id AS task_id,t.action,t.opinion
            FROM dhr_summary_review r JOIN workflow_task t ON t.instance_id=r.workflow_instance_id
            JOIN signature s ON s.id=t.signature_id
            WHERE r.summary_version_id=? ORDER BY s.signed_at,s.id
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                String payload = rs.getString("snapshot_data");
                String digest = rs.getString("snapshot_hash");
                if (payload == null || digest == null || !sha256(payload.getBytes(StandardCharsets.UTF_8)).equals(digest))
                    throw invalid("DHR 审批签署证据摘要不一致，导出已停止：" + rs.getString("id"));
                result.addObject().put("id", rs.getString("id")).put("taskId", rs.getString("task_id"))
                    .put("meaning", rs.getString("meaning")).put("signerId", rs.getString("signer_id"))
                    .put("signerName", rs.getString("signer_name")).put("authMethod", rs.getString("auth_method"))
                    .put("authEventRef", rs.getString("auth_event_ref"))
                    .put("snapshotHash", digest).put("snapshotData", payload)
                    .put("signedAt", rs.getTimestamp("signed_at") == null ? null : rs.getTimestamp("signed_at").toLocalDateTime().toString())
                    .put("action", rs.getString("action")).put("opinion", rs.getString("opinion"));
            }, versionId);
        return result;
    }

    private static void add(ZipOutputStream zip, ArrayNode inventory, String name, byte[] bytes, String kind, String sourceId) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(bytes);
        zip.closeEntry();
        inventory.addObject().put("path", name).put("kind", kind).put("sourceId", sourceId)
                .put("size", bytes.length).put("sha256", sha256(bytes));
    }

    private static String readableHtml(JsonNode record) {
        StringBuilder html = new StringBuilder("<!doctype html><html lang=\"zh-CN\"><meta charset=\"utf-8\"><title>DHR 表单实例</title><style>body{font:16px system-ui;max-width:900px;margin:32px auto;color:#263241}table{border-collapse:collapse;width:100%}td,th{border:1px solid #cbd5e1;padding:10px;text-align:left;vertical-align:top}th{width:30%;background:#f4f7fb}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>")
                .append(escape(record.path("templateName").asText("表单实例"))).append("</h1><p>")
                .append(escape(record.path("instanceNo").asText())).append(" · ")
                .append(escape(record.path("status").asText())).append("</p><table>");
        JsonNode values = record.path("fieldValues");
        if (values.isObject()) values.fields().forEachRemaining(field -> html.append("<tr><th>").append(escape(field.getKey()))
                .append("</th><td><pre>").append(escape(field.getValue().isValueNode() ? field.getValue().asText() : field.getValue().toString()))
                .append("</pre></td></tr>"));
        html.append("</table></html>");
        return html.toString();
    }

    private static String escape(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private JsonNode json(String value) {
        try { return mapper.readTree(value); }
        catch (Exception ex) { throw invalid("冻结版本无法读取，导出已停止"); }
    }

    private static String text(Map<String, Object> row, String key) { return row.get(key) == null ? "" : row.get(key).toString(); }
    private static String sha256(byte[] value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value)); }
        catch (Exception ex) { throw new IllegalStateException("无法计算导出摘要", ex); }
    }

    private static String sha256(Path file) throws IOException {
        try (InputStream input = Files.newInputStream(file)) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) digest.update(buffer, 0, count);
            return HexFormat.of().formatHex(digest.digest());
        } catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException("无法计算导出摘要", ex); }
    }
}
