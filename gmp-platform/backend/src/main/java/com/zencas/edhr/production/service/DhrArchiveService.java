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
import java.util.ArrayList;
import java.util.LinkedHashMap;
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
    private final DhrPdfRenderer pdfRenderer;
    private final DhrFormFiles formFiles;

    public Path export(Long dhrId, Long versionId, String scope, Set<String> selectedRecords, Set<String> selectedAttachments) throws IOException {
        if (!Set.of("FULL", "SELECTED").contains(scope)) throw invalid("导出范围无效");
        var versions = jdbc.queryForList("""
            SELECT v.*,d.dhr_no,d.object_no,d.object_type,d.production_object_id,d.status AS dhr_status
            FROM dhr_summary_version v JOIN dhr_instance d ON d.id=v.dhr_instance_id AND d.tenant_id=v.tenant_id
            WHERE v.tenant_id='default' AND v.dhr_instance_id=? AND v.id=?
            """, dhrId, versionId);
        if (versions.isEmpty()) throw invalid("冻结的 DHR 汇总版本不存在");
        Map<String, Object> version = versions.getFirst();
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
        Object productionObjectId = version.get("production_object_id");
        if (productionObjectId == null || version.get("submitted_at") == null) throw invalid("冻结版本缺少来源追溯时间或生产对象");
        String objectId = productionObjectId.toString();
        var submittedAt = (java.sql.Timestamp) version.get("submitted_at");
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
        ArrayNode allPlacements = mapper.createArrayNode();
        jdbc.query("SELECT source_record_id,target_node_key,before_node_key,display_order,display_name FROM dhr_summary_evidence WHERE tenant_id='default' AND summary_version_id=? ORDER BY id",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    ObjectNode placement = allPlacements.addObject().put("recordId", rs.getString(1)).put("targetNodeKey", rs.getString(2))
                            .put("beforeNodeKey", rs.getString(3)).put("displayOrder", rs.getObject(4) == null ? null : rs.getInt(4))
                            .put("displayName", rs.getString(5));
                    if (chosenRecords.contains(rs.getString(1))) placements.add(placement);
                }, versionId);
        if (placements.size() != chosenRecords.size()) throw invalid("冻结证据清单不完整，导出已停止");
        ArrayNode inventory = manifest.putArray("files");
        Path zip = Files.createTempFile("dhr-archive-", ".zip");
        try (OutputStream output = Files.newOutputStream(zip); ZipOutputStream archive = new ZipOutputStream(output, StandardCharsets.UTF_8);
             var renderer = pdfRenderer.open(); var combined = new org.apache.pdfbox.pdmodel.PDDocument()) {
            ObjectNode ordering = mapper.createObjectNode();
            ordering.set("baseDirectory", manifest.path("baseDirectory"));
            ordering.set("overlayDirectories", manifest.path("overlayDirectories"));
            ordering.set("placements", allPlacements); ordering.set("records", records);
            JsonNode ordered = renderer.order(ordering);
            Map<String, JsonNode> byId = new LinkedHashMap<>();
            records.forEach(record -> byId.put(record.path("id").asText(), record));
            Set<String> orderedIds = new HashSet<>();
            for (JsonNode entry : ordered) if (!orderedIds.add(entry.path("id").asText())) throw invalid("冻结目录重复引用同一证据，导出已停止");
            if (!orderedIds.equals(availableRecords)) throw invalid("冻结目录与证据范围不一致，导出已停止");
            for (String directory : List.of("批记录模板/", "作业表单/", "自定义表单/", "汇总附件/", "追溯资料/")) {
                archive.putNextEntry(new ZipEntry(directory)); archive.closeEntry();
            }
            List<Map<String, String>> indexRows = new ArrayList<>();
            List<byte[]> formPdfs = new ArrayList<>();
            ArrayNode archiveOrder = manifest.putArray("archiveOrder");
            String exportTitle = ("FULL".equals(scope) ? "完整DHR" : "选定范围（非完整DHR）") + "_" + text(version, "dhr_no") + "_V" + version.get("version_no");
            int writtenRecords = 0;
            for (JsonNode entry : ordered) {
                String id = entry.path("id").asText();
                if (!chosenRecords.contains(id)) continue;
                JsonNode record = byId.get(id);
                String title = entry.path("title").asText();
                String name = safeName(title) + "_" + safeName(record.path("instanceNo").asText()) + "_" + id;
                String folder = switch (record.path("originKind").asText()) { case "DIRECTORY" -> "批记录模板"; case "WORK" -> "作业表单"; case "CUSTOM" -> "自定义表单"; default -> throw invalid("冻结表单来源无效：" + id); };
                String recordPath = folder + "/" + name + "/";
                DhrFormFiles.Resolved resolved = formFiles.resolve(record, objectId, submittedAt.toLocalDateTime());
                byte[] pdf = renderer.form(resolved.renderingRecord(), exportTitle + " · " + record.path("instanceNo").asText());
                add(archive, inventory, recordPath + name + ".pdf", pdf, "FORM_PDF", id);
                formPdfs.add(pdf);
                add(archive, inventory, "追溯资料/表单快照/" + id + ".json", mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(record), "FORM_RECORD", id);
                archiveOrder.add(entry.deepCopy());
                indexRows.add(Map.of("name", title + " · " + record.path("instanceNo").asText(), "detail", entry.path("archivePath").asText(), "path", recordPath + name + ".pdf"));
                for (var original : resolved.attachments()) {
                    String path = recordPath + "附件/" + original.id() + "_" + safeName(original.name());
                    add(archive, inventory, path, original.bytes(), "FORM_ATTACHMENT", id);
                    indexRows.add(Map.of("name", original.name(), "detail", "表单附件 · " + record.path("instanceNo").asText(), "path", path));
                }
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
                String path = "汇总附件/" + id + "_" + safeName(attachment.path("name").asText());
                add(archive, inventory, path, bytes, "ATTACHMENT", id);
                indexRows.add(Map.of("name", attachment.path("name").asText(), "detail", "汇总附件 · " + attachment.path("purpose").asText(), "path", path));
                writtenAttachments++;
            }
            if (writtenAttachments != chosenAttachments.size()) throw invalid("冻结附件清单不完整，导出已停止");
            manifest.set("attachments", selectedAttachmentMetadata(frozenAttachments, chosenAttachments));
            manifest.set("auditEvents", auditsFor(dhrId, versionId));
            manifest.put("auditEventsBoundary", "AS_OF_EXPORT");
            manifest.put("sourceTraceCutoffAt", submittedAt.toLocalDateTime().toString());
            // Source events are object-scoped. Keep their identity/digest metadata
            // for traceability, but never leak whole-object field payloads in a subset.
            boolean includeSourceTrace = "FULL".equals(scope) || !chosenRecords.isEmpty();
            manifest.set("sourceAuditEvents", includeSourceTrace ? sourceAuditEvents(objectId, submittedAt) : mapper.createArrayNode());
            manifest.set("sourceSignatures", includeSourceTrace ? sourceSignatures(objectId, submittedAt) : mapper.createArrayNode());
            manifest.set("reviewSignatures", signaturesFor(versionId));
            if (!"FULL".equals(scope)) {
                manifest.path("auditEvents").forEach(event -> ((ObjectNode) event).remove(List.of("before", "after")));
                manifest.path("reviewSignatures").forEach(signature -> ((ObjectNode) signature).remove("snapshotData"));
                manifest.path("sourceAuditEvents").forEach(event -> ((ObjectNode) event).remove(List.of("before", "after", "dataSummary")));
                manifest.path("sourceSignatures").forEach(signature -> ((ObjectNode) signature).remove("snapshotData"));
                manifest.put("sourceTraceBoundary", "PRODUCTION_OBJECT_METADATA_ONLY; NOT_INSTANCE_EXCLUSIVE; RAW_PAYLOADS_EXCLUDED");
                manifest.put("sourceProductionObjectId", objectId);
                ArrayNode references = manifest.putArray("selectedSourceRecords");
                records.forEach(record -> {
                    if (chosenRecords.contains(record.path("id").asText())) references.addObject()
                            .put("recordId", record.path("id").asText()).put("instanceNo", record.path("instanceNo").asText())
                            .put("operationId", record.path("operationId").asText()).put("formId", record.path("formId").asText()).put("copyId", record.path("copyId").asText());
                });
            }
            manifest.put("formCount", writtenRecords).put("attachmentCount", writtenAttachments);
            DhrPdfRenderer.append(combined, renderer.index(exportTitle, "冻结版本 · " + submittedAt.toLocalDateTime() + " · " + text(version, "status"), indexRows));
            for (byte[] pdf : formPdfs) DhrPdfRenderer.append(combined, pdf);
            add(archive, inventory, safeName(exportTitle) + ".pdf", DhrPdfRenderer.bytes(combined), "DHR_PDF", versionId.toString());
            add(archive, inventory, "导出说明.txt", ("DHR 冻结版本 " + text(version, "dhr_no") + " V" + version.get("version_no")
                    + "\n导出范围：" + ("FULL".equals(scope) ? "完整版本" : "选定范围（不是完整 DHR）")
                    + "\n总PDF按档案目录顺序包含索引及表单正文，附件内容不并入PDF。单表PDF按原始来源分类；表单上传文件在该实例的附件目录，汇总附件在同名根目录。\n追溯资料/清单.json 包含目录、证据索引、文件摘要、审批和审计信息；冻结数据为机器可读核对材料，不代替PDF。\n来源审计/签名截止提交时间，DHR审计截至导出时间。选定表单导出保留所属生产对象级审计与签名的身份、人员、时间、摘要等索引，不包含可能涉及未选字段的原始载荷，也不将对象级事件声称为仅属于所选实例；完整验签载荷请查阅完整DHR。\n").getBytes(StandardCharsets.UTF_8), "README", "");
            byte[] manifestBytes = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(manifest);
            archive.putNextEntry(new ZipEntry("追溯资料/清单.json"));
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

    static String safeName(String value) {
        String safe = java.text.Normalizer.normalize(value == null ? "" : value, java.text.Normalizer.Form.NFKC)
                .replaceAll("[\\p{Cntrl}\\\\/:*?\"<>|]", "_").replaceAll("^[. ]+|[. ]+$", "");
        if (safe.isBlank()) return "未命名";
        if (safe.getBytes(StandardCharsets.UTF_8).length <= 160) return safe;
        int dot = safe.lastIndexOf('.');
        String extension = dot > 0 && safe.length() - dot < 12 ? safe.substring(dot) : "";
        String stem = extension.isEmpty() ? safe : safe.substring(0, dot);
        while ((stem + extension).getBytes(StandardCharsets.UTF_8).length > 160) stem = stem.substring(0, stem.offsetByCodePoints(stem.length(), -1));
        return stem + extension;
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
