package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Service
@RequiredArgsConstructor
public class DhrInstanceService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;

    /** Called only from the locked first-START execution transaction. */
    @Transactional
    public void createAtFirstStart(ProductionObject object, WorkOrder order, ObjectNode executionSnapshot) {
        if (!List.of("BATCH", "SN").contains(object.getObjectType())) throw invalid("DHR 仅支持批次或序列号生产对象");
        JsonNode context = executionSnapshot.path("context");
        long templateId = requiredLong(context, "dhrTemplateId", "DHR 模板");
        long templateVersionId = requiredLong(context, "dhrTemplateVersionId", "DHR 模板版本");
        long routeVersionId = requiredLong(context, "routeVersionId", "工艺路线版本");

        ObjectNode contextSnapshot = context.deepCopy();
        ObjectNode directorySnapshot = createDirectorySnapshot(templateVersionId, text(context, "dhrVersion"));
        LocalDateTime now = LocalDateTime.now();
        Long sequence = jdbc.queryForObject("SELECT nextval('dhr_instance_number_seq')", Long.class);
        if (sequence == null) throw new IllegalStateException("DHR number sequence returned null");
        String dhrNo = "DHR-" + now.format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + String.format(Locale.ROOT, "%06d", sequence);
        String actor = actorName();

        jdbc.update("""
            INSERT INTO dhr_instance(
                id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,
                product_id,product_code,product_name,process_version_id,process_version,route_version_id,route_version,
                route_code,route_name,dhr_template_id,dhr_template_version_id,dhr_template_version,dhr_template_code,
                dhr_template_name,context_snapshot,directory_snapshot,status,summary_status,dhr_review_mode,
                dhr_review_workflow_definition_id,dhr_review_workflow_version_id,created_by,created_at,updated_by,updated_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            sequence, object.getTenantId(), dhrNo, object.getId(), object.getObjectNo(), object.getObjectType(),
            order.getId(), order.getOrderNo(), requiredLong(context, "productId", "产品"),
            text(context, "productCode"), text(context, "productName"),
            requiredLong(context, "processVersionId", "制程版本"), text(context, "processVersion"),
            routeVersionId, text(context, "routeVersion"), text(context, "routeCode"), text(context, "routeName"),
            templateId, templateVersionId, text(context, "dhrVersion"), text(context, "dhrCode"), text(context, "dhrName"),
            contextSnapshot.toString(), directorySnapshot.toString(), "IN_PROGRESS", "NOT_STARTED",
            text(context, "dhrReviewMode") == null ? "NONE" : text(context, "dhrReviewMode"),
            optionalLong(context, "dhrReviewWorkflowDefinitionId"), optionalLong(context, "dhrReviewWorkflowVersionId"),
            actor, now, actor, now);

        ObjectNode after = mapper.createObjectNode().put("dhrNo", dhrNo).put("productionObjectId", object.getId().toString())
                .put("objectNo", object.getObjectNo()).put("objectType", object.getObjectType())
                .put("status", "IN_PROGRESS").put("dhrTemplateVersionId", Long.toString(templateVersionId));
        writeAudit(sequence, "CREATE", null, after, object.getObjectNo(), "首次开工创建");
    }

    @Transactional
    public void completeWithProductionObject(Long productionObjectId) {
        var rows = jdbc.queryForList("SELECT id,dhr_no,object_no,status FROM dhr_instance WHERE tenant_id='default' AND production_object_id=? FOR UPDATE", productionObjectId);
        if (rows.isEmpty()) throw invalid("DHR 实例缺失，不能完成生产执行");
        Map<String, Object> row = rows.getFirst();
        if ("COMPLETED".equals(row.get("status"))) return;
        if (!"IN_PROGRESS".equals(row.get("status"))) throw invalid("DHR 已终止，不能标记为正常完成");
        LocalDateTime now = LocalDateTime.now();
        String actor = actorName();
        jdbc.update("UPDATE dhr_instance SET status='COMPLETED',completed_at=?,updated_by=?,updated_at=? WHERE id=? AND status='IN_PROGRESS'",
                now, actor, now, row.get("id"));
        ObjectNode before = mapper.createObjectNode().put("status", "IN_PROGRESS");
        ObjectNode after = mapper.createObjectNode().put("status", "COMPLETED").put("completedAt", now.toString());
        writeAudit(((Number) row.get("id")).longValue(), "UPDATE", before, after,
                String.valueOf(row.get("object_no")), "生产完成");
    }

    /** Called after the work order and production object have been locked by ProductionService. */
    @Transactional
    public void terminateWithProductionObject(Long productionObjectId, String reason, LocalDateTime terminatedAt) {
        var rows = jdbc.queryForList("SELECT id,tenant_id,object_no,status,summary_status FROM dhr_instance WHERE tenant_id='default' AND production_object_id=? FOR UPDATE", productionObjectId);
        if (rows.isEmpty()) throw invalid("DHR 实例缺失，不能提前结束生产对象");
        Map<String, Object> row = rows.getFirst();
        if (!"IN_PROGRESS".equals(row.get("status")) || !"NOT_STARTED".equals(row.get("summary_status")))
            throw invalid("DHR 状态与生产对象不一致，请核对后再提前结束");
        long dhrId = ((Number) row.get("id")).longValue();
        if (jdbc.queryForObject("SELECT count(*) FROM dhr_summary_draft WHERE dhr_instance_id=?", Long.class, dhrId) != 0
                || jdbc.queryForObject("SELECT count(*) FROM dhr_summary_version WHERE dhr_instance_id=?", Long.class, dhrId) != 0)
            throw invalid("DHR 已存在汇总记录，不能直接提前结束");

        ObjectNode frozenDetail = detail(dhrId);
        frozenDetail.put("status", "EARLY_TERMINATED").put("displayStatus", "TERMINATED")
                .put("productionStatus", "EARLY_TERMINATED")
                .put("terminationReason", reason).put("terminationAt", terminatedAt.toString())
                .put("terminatedBy", actorName()).put("terminationSnapshotAvailable", true);
        ObjectNode snapshot = mapper.createObjectNode();
        snapshot.set("dhr", frozenDetail);
        var executions = jdbc.queryForList("SELECT snapshot_json,state_json,revision FROM production_execution WHERE object_id=? FOR UPDATE", productionObjectId);
        if (executions.isEmpty()) throw invalid("生产执行记录缺失，不能提前结束 DHR");
        var execution = executions.getFirst();
        snapshot.set("executionSnapshot", json(String.valueOf(execution.get("snapshot_json")), "生产执行快照"));
        snapshot.set("executionState", json(String.valueOf(execution.get("state_json")), "生产执行状态"));
        snapshot.put("executionRevision", ((Number) execution.get("revision")).longValue());
        String serialized = snapshot.toString();
        String hash = sha256(serialized);
        LocalDateTime recordedAt = LocalDateTime.now();
        int changed = jdbc.update("UPDATE dhr_instance SET status='EARLY_TERMINATED',updated_by=?,updated_at=? WHERE id=? AND status='IN_PROGRESS'",
                actorName(), recordedAt, dhrId);
        if (changed != 1) throw invalid("DHR 状态已变化，请刷新后重试");
        jdbc.update("INSERT INTO dhr_termination(dhr_instance_id,tenant_id,reason,terminated_at,terminated_by,recorded_at,snapshot_json,snapshot_hash,historical) VALUES(?,?,?,?,?,?,?,?,FALSE)",
                dhrId, row.get("tenant_id"), reason, terminatedAt, actorName(), recordedAt, serialized, hash);
        ObjectNode before = mapper.createObjectNode().put("status", "IN_PROGRESS");
        ObjectNode after = mapper.createObjectNode().put("status", "EARLY_TERMINATED")
                .put("reason", reason).put("terminatedAt", terminatedAt.toString()).put("snapshotHash", hash);
        writeAudit(dhrId, "UPDATE", before, after, String.valueOf(row.get("object_no")), "提前结束 DHR");
    }

    private static String sha256(String value) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(bytes);
        } catch (java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> list(String keyword, String objectType, String status, int page, int size) {
        return list(keyword, objectType, status, "", page, size);
    }

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> list(String keyword, String objectType, String status, String summaryStatus, int page, int size) {
        return list(keyword, objectType, status, summaryStatus, null, page, size);
    }

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> listFilling(String keyword, String displayStatus, int page, int size) {
        return list(keyword, "", "", "", "", displayStatus, page, size);
    }

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> list(String keyword, String objectType, String status, String summaryStatus,
                                        String productionStatus, int page, int size) {
        return list(keyword, objectType, status, summaryStatus, productionStatus, "", page, size);
    }

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> list(String keyword, String objectType, String status, String summaryStatus,
                                        String productionStatus, String displayStatus, int page, int size) {
        page = Math.max(0, page);
        size = Math.max(1, Math.min(200, size));
        StringBuilder where = new StringBuilder(" WHERE tenant_id=?");
        List<Object> args = new ArrayList<>(List.of("default"));
        if (keyword != null && !keyword.isBlank()) {
            where.append(" AND (dhr_no LIKE ? ESCAPE '!' OR object_no LIKE ? ESCAPE '!' OR work_order_no LIKE ? ESCAPE '!' OR product_code LIKE ? ESCAPE '!' OR product_name LIKE ? ESCAPE '!')");
            String pattern = pattern(keyword);
            for (int i = 0; i < 5; i++) args.add(pattern);
        }
        if (objectType != null && !objectType.isBlank()) {
            if (!List.of("BATCH", "SN").contains(objectType)) throw invalid("生产对象类型仅支持 BATCH 或 SN");
            where.append(" AND object_type=?"); args.add(objectType);
        }
        if (status != null && !status.isBlank()) {
            if (!List.of("IN_PROGRESS", "COMPLETED", "EARLY_TERMINATED").contains(status)) throw invalid("DHR 状态无效");
            where.append(" AND status=?"); args.add(status);
        }
        if (summaryStatus != null && !summaryStatus.isBlank()) {
            if ("PENDING_GROUP".equals(summaryStatus)) where.append(" AND summary_status IN ('NOT_STARTED','DRAFT')");
            else if ("SUBMITTED_GROUP".equals(summaryStatus)) where.append(" AND summary_status IN ('PENDING_REVIEW','FORMALIZED')");
            else {
                if (!List.of("NOT_STARTED", "DRAFT", "PENDING_REVIEW", "FORMALIZED").contains(summaryStatus)) throw invalid("DHR 汇总状态无效");
                where.append(" AND summary_status=?"); args.add(summaryStatus);
            }
        }
        String productionStatusSql = productionStatusSql();
        if (productionStatus != null && !productionStatus.isBlank()) {
            if (!List.of("CREATED", "IN_PROGRESS", "COMPLETED", "EARLY_TERMINATED", "CANCELLED").contains(productionStatus)) throw invalid("生产状态无效");
            where.append(" AND ").append(productionStatusSql).append("=?"); args.add(productionStatus);
        }
        if (displayStatus != null && !displayStatus.isBlank()) {
            if (!List.of("FILLING", "PENDING_SUMMARY", "SUMMARIZING", "PENDING_REVIEW", "FINALIZED", "TERMINATED", "STATUS_ERROR").contains(displayStatus))
                throw invalid("DHR 状态无效");
            where.append(" AND ").append(displayStatusSql()).append("=?"); args.add(displayStatus);
        }
        Long count = jdbc.queryForObject("SELECT count(*) FROM dhr_instance" + where, Long.class, args.toArray());
        args.add(size); args.add((long) page * size);
        List<ObjectNode> content = jdbc.query("SELECT *," + productionStatusSql + " AS production_status," + displayStatusSql() + " AS display_status," + terminationColumns() + " FROM dhr_instance" + where + " ORDER BY created_at DESC,id DESC LIMIT ? OFFSET ?",
                (rs, index) -> summary(rs), args.toArray());
        return PageResult.of(content, page, size, count == null ? 0 : count);
    }

    @Transactional(readOnly = true)
    public ObjectNode detail(Long id) {
        List<ObjectNode> rows = jdbc.query("SELECT *," + productionStatusSql() + " AS production_status," + displayStatusSql() + " AS display_status," + terminationColumns() + " FROM dhr_instance WHERE tenant_id=? AND id=?",
                (rs, index) -> detailRow(rs), "default", id);
        if (rows.isEmpty()) throw invalid("DHR 实例不存在");
        ObjectNode result = rows.getFirst();
        if ("EARLY_TERMINATED".equals(result.path("status").asText())) {
            var frozen = jdbc.queryForList("SELECT snapshot_json,snapshot_hash FROM dhr_termination WHERE tenant_id=? AND dhr_instance_id=?", "default", id);
            if (frozen.isEmpty()) throw invalid("DHR 终止记录缺失，请联系管理员核对");
            if (frozen.getFirst().get("snapshot_json") != null) {
                String serialized = String.valueOf(frozen.getFirst().get("snapshot_json"));
                if (!sha256(serialized).equals(frozen.getFirst().get("snapshot_hash"))) throw invalid("DHR 终止快照校验失败");
                return (ObjectNode) json(serialized, "DHR 终止快照").path("dhr").deepCopy();
            }
        }
        JsonNode directory = result.path("directorySnapshot");
        Map<String, ArrayNode> recordsByItem = new HashMap<>();
        ArrayNode unmapped = mapper.createArrayNode();
        jdbc.query("""
            SELECT id,instance_no,operation_id,operation_name,form_id,copy_id,template_id,version_id,
                   template_code,template_name,template_version,snapshot_json,values_json,status,
                   created_by,created_at,updated_by,updated_at
            FROM form_instance_record
            WHERE tenant_id=? AND source_type='PRODUCTION_EXECUTION' AND object_id=?
            ORDER BY updated_at,id
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
            ObjectNode record = evidenceRow(rs);
            String itemId = record.path("snapshot").path("dhrItemId").asText("");
            if (itemId.isBlank()) unmapped.add(record);
            else recordsByItem.computeIfAbsent(itemId, ignored -> mapper.createArrayNode()).add(record);
        }, "default", result.path("productionObjectId").asLong());

        int itemCount = 0;
        int suppliedCount = 0;
        int mappedRecordCount = 0;
        for (JsonNode directoryNode : directory.path("directories")) {
            for (JsonNode itemNode : directoryNode.path("items")) {
                itemCount++;
                ObjectNode item = (ObjectNode) itemNode;
                ArrayNode records = recordsByItem.remove(item.path("id").asText());
                if (records == null) records = mapper.createArrayNode();
                item.set("records", records);
                if (!records.isEmpty()) {
                    suppliedCount++;
                    mappedRecordCount += records.size();
                }
            }
        }
        recordsByItem.values().forEach(unmapped::addAll);
        result.putObject("evidenceSummary").put("itemCount", itemCount).put("suppliedItemCount", suppliedCount)
                .put("recordCount", mappedRecordCount + unmapped.size())
                .put("unmappedRecordCount", unmapped.size());
        result.set("unmappedRecords", unmapped);
        ObjectNode origins = result.putObject("recordsByOrigin");
        ArrayNode directoryRecords = origins.putArray("directory");
        ArrayNode workRecords = origins.putArray("work");
        ArrayNode customRecords = origins.putArray("custom");
        for (JsonNode directoryNode : directory.path("directories")) {
            for (JsonNode itemNode : directoryNode.path("items")) directoryRecords.addAll((ArrayNode) itemNode.path("records"));
        }
        for (JsonNode record : unmapped) {
            String origin = record.path("originKind").asText();
            if ("DIRECTORY".equals(origin)) directoryRecords.add(record);
            else if ("WORK".equals(origin)) workRecords.add(record);
            else customRecords.add(record);
        }
        return result;
    }

    private static String productionStatusSql() {
        return "(SELECT p.status FROM production_object p WHERE p.id=dhr_instance.production_object_id AND p.tenant_id=dhr_instance.tenant_id)";
    }

    private static String displayStatusSql() {
        String production = productionStatusSql();
        return "CASE WHEN status='EARLY_TERMINATED' AND summary_status='NOT_STARTED' AND " + production + "='EARLY_TERMINATED' THEN 'TERMINATED' "
                + "WHEN status='IN_PROGRESS' AND summary_status='NOT_STARTED' AND " + production + "='IN_PROGRESS' THEN 'FILLING' "
                + "WHEN status='COMPLETED' AND " + production + "='COMPLETED' AND summary_status='NOT_STARTED' THEN 'PENDING_SUMMARY' "
                + "WHEN status='COMPLETED' AND " + production + "='COMPLETED' AND summary_status='DRAFT' THEN 'SUMMARIZING' "
                + "WHEN status='COMPLETED' AND " + production + "='COMPLETED' AND summary_status='PENDING_REVIEW' THEN 'PENDING_REVIEW' "
                + "WHEN status='COMPLETED' AND " + production + "='COMPLETED' AND summary_status='FORMALIZED' THEN 'FINALIZED' ELSE 'STATUS_ERROR' END";
    }

    private static String terminationColumns() {
        return "(SELECT t.reason FROM dhr_termination t WHERE t.dhr_instance_id=dhr_instance.id AND t.tenant_id=dhr_instance.tenant_id) AS termination_reason,"
                + "(SELECT t.terminated_at FROM dhr_termination t WHERE t.dhr_instance_id=dhr_instance.id AND t.tenant_id=dhr_instance.tenant_id) AS termination_at,"
                + "(SELECT t.terminated_by FROM dhr_termination t WHERE t.dhr_instance_id=dhr_instance.id AND t.tenant_id=dhr_instance.tenant_id) AS terminated_by,"
                + "(SELECT t.snapshot_json IS NOT NULL FROM dhr_termination t WHERE t.dhr_instance_id=dhr_instance.id AND t.tenant_id=dhr_instance.tenant_id) AS termination_snapshot_available";
    }

    private ObjectNode createDirectorySnapshot(long versionId, String versionLabel) {
        ObjectNode snapshot = mapper.createObjectNode();
        snapshot.put("version", versionLabel);
        ArrayNode directories = snapshot.putArray("directories");
        Map<Long, ObjectNode> directoriesById = new LinkedHashMap<>();
        int[] itemCount = {0};

        jdbc.query("""
            SELECT d.id AS directory_id,d.parent_id,d.name AS directory_name,d.sort_order AS directory_sort_order,
                   i.id AS item_id,i.form_template_id,i.form_template_version_id,i.display_name,i.is_required,i.sort_order AS item_sort_order,
                   f.code AS form_code,f.name AS form_name,fv.version_label AS form_version
            FROM dhr_directory d
            LEFT JOIN dhr_template_item i ON i.directory_id=d.id
            LEFT JOIN form_template f ON f.id=i.form_template_id
            LEFT JOIN form_template_version fv ON fv.id=i.form_template_version_id
            WHERE d.version_id=?
            ORDER BY d.sort_order,d.id,i.sort_order,i.id
            """, (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
            long directoryId = rs.getLong("directory_id");
            ObjectNode directory = directoriesById.get(directoryId);
            if (directory == null) {
                directory = mapper.createObjectNode();
                directory.put("id", Long.toString(directoryId));
                Long parentId = rs.getObject("parent_id", Long.class);
                if (parentId == null) directory.putNull("parentId"); else directory.put("parentId", parentId.toString());
                directory.put("name", rs.getString("directory_name"));
                directory.put("sortOrder", rs.getInt("directory_sort_order"));
                directory.putArray("items");
                directoriesById.put(directoryId, directory);
                directories.add(directory);
            }
            Long itemId = rs.getObject("item_id", Long.class);
            if (itemId == null) return;
            Long formTemplateId = rs.getObject("form_template_id", Long.class);
            Long formVersionId = rs.getObject("form_template_version_id", Long.class);
            if (formTemplateId == null || formVersionId == null || rs.getString("form_name") == null || rs.getString("form_version") == null) {
                throw invalid("DHR 模板目录包含无效表单引用");
            }
            ObjectNode item = ((ArrayNode) directory.path("items")).addObject();
            item.put("id", itemId.toString());
            item.put("directoryId", Long.toString(directoryId));
            item.put("formTemplateId", formTemplateId.toString());
            item.put("formTemplateVersionId", formVersionId.toString());
            item.put("formCode", rs.getString("form_code"));
            item.put("formName", rs.getString("form_name"));
            item.put("formVersion", rs.getString("form_version"));
            item.put("displayName", rs.getString("display_name"));
            item.put("required", rs.getBoolean("is_required"));
            item.put("sortOrder", rs.getInt("item_sort_order"));
            itemCount[0]++;
        }, versionId);

        if (directories.isEmpty()) throw invalid("已绑定的 DHR 模板版本未配置目录");
        if (itemCount[0] == 0) {
            throw invalid("已绑定的 DHR 模板版本未配置表单");
        }
        return snapshot;
    }

    private ObjectNode summary(ResultSet rs) throws SQLException {
        return mapper.createObjectNode().put("id", rs.getString("id")).put("dhrNo", rs.getString("dhr_no"))
                .put("productionObjectId", rs.getString("production_object_id")).put("objectNo", rs.getString("object_no"))
                .put("objectType", rs.getString("object_type")).put("workOrderId", rs.getString("work_order_id"))
                .put("workOrderNo", rs.getString("work_order_no")).put("productCode", rs.getString("product_code"))
                .put("productName", rs.getString("product_name")).put("processVersion", rs.getString("process_version"))
                .put("routeName", rs.getString("route_name")).put("routeVersion", rs.getString("route_version"))
                .put("dhrTemplateName", rs.getString("dhr_template_name")).put("dhrTemplateVersion", rs.getString("dhr_template_version"))
                .put("status", rs.getString("status")).put("productionStatus", rs.getString("production_status"))
                .put("displayStatus", rs.getString("display_status"))
                .put("summaryStatus", rs.getString("summary_status"))
                .put("dhrReviewMode", rs.getString("dhr_review_mode"))
                .put("createdBy", rs.getString("created_by"))
                .put("createdAt", timestamp(rs, "created_at")).put("updatedBy", rs.getString("updated_by"))
                .put("updatedAt", timestamp(rs, "updated_at"))
                .put("completedAt", timestamp(rs, "completed_at"))
                .put("terminationReason", rs.getString("termination_reason"))
                .put("terminationAt", timestamp(rs, "termination_at"))
                .put("terminatedBy", rs.getString("terminated_by"))
                .put("terminationSnapshotAvailable", rs.getBoolean("termination_snapshot_available"));
    }

    private ObjectNode detailRow(ResultSet rs) throws SQLException {
        ObjectNode result = summary(rs);
        result.put("productId", rs.getString("product_id")).put("processVersionId", rs.getString("process_version_id"))
                .put("routeVersionId", rs.getString("route_version_id")).put("routeCode", rs.getString("route_code"))
                .put("dhrTemplateId", rs.getString("dhr_template_id")).put("dhrTemplateVersionId", rs.getString("dhr_template_version_id"))
                .put("dhrTemplateCode", rs.getString("dhr_template_code"))
                .put("dhrReviewWorkflowDefinitionId", rs.getString("dhr_review_workflow_definition_id"))
                .put("dhrReviewWorkflowVersionId", rs.getString("dhr_review_workflow_version_id"));
        result.set("context", json(rs.getString("context_snapshot"), "DHR 上下文快照"));
        result.set("directorySnapshot", directoryForResponse(json(rs.getString("directory_snapshot"), "DHR 目录快照")));
        return result;
    }

    /** Response-only projection: never rewrite persisted frozen snapshots or their hashes. */
    static JsonNode directoryForResponse(JsonNode snapshot) {
        JsonNode result = snapshot.deepCopy();
        for (JsonNode directory : result.path("directories")) {
            stringifyIds((ObjectNode) directory, "id", "parentId");
            for (JsonNode item : directory.path("items")) {
                stringifyIds((ObjectNode) item, "id", "directoryId", "formTemplateId", "formTemplateVersionId");
            }
        }
        return result;
    }

    private static void stringifyIds(ObjectNode node, String... fields) {
        for (String field : fields) if (node.hasNonNull(field)) node.put(field, node.path(field).asText());
    }

    private ObjectNode evidenceRow(ResultSet rs) throws SQLException {
        ObjectNode result = mapper.createObjectNode().put("id", rs.getString("id")).put("instanceNo", rs.getString("instance_no"))
                .put("operationId", rs.getString("operation_id")).put("operationName", rs.getString("operation_name"))
                .put("formId", rs.getString("form_id")).put("copyId", rs.getString("copy_id"))
                .put("templateId", rs.getString("template_id")).put("templateVersionId", rs.getString("version_id"))
                .put("templateCode", rs.getString("template_code")).put("templateName", rs.getString("template_name"))
                .put("templateVersion", rs.getString("template_version")).put("status", rs.getString("status"))
                .put("createdBy", rs.getString("created_by")).put("createdAt", timestamp(rs, "created_at"))
                .put("updatedBy", rs.getString("updated_by")).put("updatedAt", timestamp(rs, "updated_at"));
        result.set("snapshot", json(rs.getString("snapshot_json"), "表单实例快照"));
        result.set("fieldValues", json(rs.getString("values_json"), "表单实例值"));
        JsonNode snapshot = result.path("snapshot");
        String originKind = snapshot.hasNonNull("dhrItemId") && !snapshot.path("dhrItemId").asText().isBlank()
                ? "DIRECTORY" : snapshot.hasNonNull("workId") && !snapshot.path("workId").asText().isBlank() ? "WORK" : "CUSTOM";
        result.put("originKind", originKind);
        return result;
    }

    private JsonNode json(String value, String label) {
        try { return mapper.readTree(value); }
        catch (Exception ex) { throw invalid(label + "无法读取"); }
    }

    private void writeAudit(long id, String action, JsonNode before, JsonNode after, String objectNo, String functionName) {
        audits.save(AuditEvent.builder().id(ids.nextId()).entityType("DHR_INSTANCE").entityId(Long.toString(id)).action(action)
                .contentBefore(before == null ? null : before.toString()).contentAfter(after.toString())
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName())
                .operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                .moduleName("记录").menuName("DHR管理").functionName(functionName).dataSummary(objectNo)
                .ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    private static long requiredLong(JsonNode context, String field, String label) {
        if (!context.hasNonNull(field) || context.path(field).asText().isBlank()) throw invalid(label + "缺失，无法创建 DHR");
        try { return Long.parseLong(context.path(field).asText()); }
        catch (NumberFormatException ex) { throw invalid(label + "标识无效，无法创建 DHR"); }
    }

    private static Long optionalLong(JsonNode context, String field) {
        if (!context.hasNonNull(field) || context.path(field).asText().isBlank()) return null;
        try { return Long.parseLong(context.path(field).asText()); }
        catch (NumberFormatException ex) { throw invalid(field + "标识无效，无法创建 DHR"); }
    }

    private static String text(JsonNode node, String field) {
        return node.hasNonNull(field) ? node.path(field).asText(null) : null;
    }

    private static String timestamp(ResultSet rs, String column) throws SQLException {
        var value = rs.getTimestamp(column);
        return value == null ? null : value.toLocalDateTime().toString();
    }

    private static String actorName() {
        String actor = AuditContext.getOperatorName();
        return actor == null || actor.isBlank() ? AuditContext.getOperatorId() : actor;
    }

    private static String pattern(String value) {
        return "%" + value.trim().replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
    }
}
