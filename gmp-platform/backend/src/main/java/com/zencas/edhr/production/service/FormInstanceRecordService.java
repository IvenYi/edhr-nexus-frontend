package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.PageResult;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Service
@RequiredArgsConstructor
public class FormInstanceRecordService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    @Transactional(readOnly = true)
    public void projectCreationMetadata(Long objectId, String tenantId, ObjectNode state) {
        jdbc.query("SELECT operation_id,copy_id,created_by,created_at FROM form_instance_record WHERE tenant_id=? AND object_id=? AND legacy=FALSE",
                (org.springframework.jdbc.core.RowCallbackHandler) rs -> {
                    JsonNode copy = state.path("operations").path(rs.getString("operation_id")).path("forms").path(rs.getString("copy_id"));
                    if (!(copy instanceof ObjectNode entry) || entry.hasNonNull("explicitCreatedAt")) return;
                    if (!entry.hasNonNull("createdAt") && rs.getTimestamp("created_at") != null) entry.put("createdAt", rs.getTimestamp("created_at").toLocalDateTime().toString());
                    if (!entry.hasNonNull("createdByName")) entry.put("createdByName", rs.getString("created_by"));
                }, tenantId, objectId);
    }

    // Called inside the locked production execution transaction; a failed action cannot allocate a visible record.
    @Transactional
    public void saved(Long objectId, String tenantId, JsonNode snapshot, ObjectNode state,
                      String operationId, String formId, String requestedCopyId) {
        JsonNode form = null;
        String operationName = null;
        for (JsonNode op : snapshot.path("operations")) if (operationId.equals(op.path("id").asText()))
            for (JsonNode candidate : op.path("forms")) if (formId.equals(candidate.path("id").asText())) {
                form = candidate;
                operationName = op.path("name").asText(null);
            }
        String copyId = requestedCopyId == null || requestedCopyId.isBlank() ? formId : requestedCopyId;
        JsonNode formState = state.path("operations").path(operationId).path("forms").path(copyId);
        if (form == null || !formState.has("savedAt")) throw invalid("表单记录来源不完整");
        if (formState.path("supplement").isObject()) {
            ObjectNode withSupplement = form.deepCopy();
            withSupplement.set("supplement", formState.path("supplement").deepCopy());
            form = withSupplement;
        }
        var existing = jdbc.queryForList("SELECT id, instance_no FROM form_instance_record WHERE tenant_id=? AND object_id=? AND operation_id=? AND copy_id=?",
                tenantId, objectId, operationId, copyId);
        LocalDateTime now = LocalDateTime.now();
        String actor = AuditContext.getOperatorName();
        if (actor == null || actor.isBlank()) actor = AuditContext.getOperatorId();
        String instanceNo;
        if (existing.isEmpty()) {
            long versionId = Long.parseLong(form.path("versionId").asText());
            Long templateId = jdbc.queryForObject("SELECT template_id FROM form_template_version WHERE id=?", Long.class, versionId);
            Long id = jdbc.queryForObject("SELECT nextval('form_instance_number_seq')", Long.class);
            instanceNo = "FR-" + now.format(DateTimeFormatter.BASIC_ISO_DATE) + "-" + String.format(java.util.Locale.ROOT, "%06d", id);
            jdbc.update("""
                INSERT INTO form_instance_record(id,tenant_id,source_type,instance_no,object_id,operation_id,form_id,copy_id,template_id,version_id,
                    snapshot_json,values_json,status,created_by,created_at,updated_by,updated_at,numbered_at,legacy)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,FALSE)
                """, id, tenantId, "PRODUCTION_EXECUTION", instanceNo, objectId, operationId, formId, copyId, templateId, versionId,
                    form.toString(), formState.path("values").toString(), formState.path("status").asText(), actor, now, actor, now, now);
            JsonNode context = snapshot.path("context");
            jdbc.update("""
                UPDATE form_instance_record SET template_code=?,template_name=?,template_version=?,work_order_id=?,
                    work_order_no=?,object_no=?,object_type=?,operation_name=?,created_by_id=?,updated_by_id=? WHERE id=? AND tenant_id=?
                """, form.path("code").asText(null), form.path("name").asText(null), form.path("version").asText(null),
                context.path("workOrderId").asText(null), context.path("workOrderNo").asText(null), context.path("objectNo").asText(null),
                context.path("objectType").asText(null), operationName, AuditContext.getOperatorId(), AuditContext.getOperatorId(), id, tenantId);
        } else {
            instanceNo = existing.getFirst().get("instance_no").toString();
            jdbc.update("UPDATE form_instance_record SET values_json=?,status=?,updated_by=?,updated_at=?,updated_by_id=? WHERE id=? AND tenant_id=?",
                    formState.path("values").toString(), formState.path("status").asText(), actor, now, AuditContext.getOperatorId(), existing.getFirst().get("id"), tenantId);
        }
        ((ObjectNode) formState).put("instanceNo", instanceNo);
    }

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> list(Long templateId, String number, String keyword, String occurredAt, String operator, int page, int size) {
        page = Math.max(0, page); size = Math.max(1, Math.min(200, size));
        StringBuilder where = new StringBuilder(" WHERE tenant_id=? AND template_id=?");
        List<Object> args = new ArrayList<>(List.of("default", templateId));
        contains(where, args, "instance_no", number);
        contains(where, args, "values_json", keyword);
        if (operator != null && !operator.isBlank()) {
            where.append(" AND (created_by LIKE ? ESCAPE '!' OR updated_by LIKE ? ESCAPE '!')");
            args.add(pattern(operator)); args.add(pattern(operator));
        }
        if (occurredAt != null && !occurredAt.isBlank()) {
            try {
                var date = java.time.LocalDate.parse(occurredAt);
                where.append(" AND updated_at>=? AND updated_at<?");
                args.add(date.atStartOfDay()); args.add(date.plusDays(1).atStartOfDay());
            } catch (java.time.format.DateTimeParseException ex) { throw invalid("发生时间格式应为 YYYY-MM-DD"); }
        }
        Long count = jdbc.queryForObject("SELECT count(*) FROM form_instance_record" + where, Long.class, args.toArray());
        args.add(size); args.add((long) page * size);
        var rows = jdbc.query("SELECT * FROM form_instance_record" + where + " ORDER BY numbered_at DESC,id DESC LIMIT ? OFFSET ?",
                (rs, index) -> row(rs, false), args.toArray());
        return PageResult.of(rows, page, size, count == null ? 0 : count);
    }

    @Transactional(readOnly = true)
    public ObjectNode detail(Long templateId, Long id) {
        var rows = jdbc.query("SELECT * FROM form_instance_record WHERE tenant_id=? AND template_id=? AND id=?",
                (rs, index) -> row(rs, true), "default", templateId, id);
        if (rows.isEmpty()) throw invalid("表单记录不存在或不属于当前模板");
        return rows.getFirst();
    }

    private ObjectNode row(ResultSet rs, boolean detail) throws SQLException {
        ObjectNode row = mapper.createObjectNode().put("id", rs.getString("id"))
                .put("instanceNo", rs.getString("instance_no")).put("status", rs.getString("status"))
                .put("templateId", rs.getString("template_id")).put("versionId", rs.getString("version_id"))
                .put("createdBy", rs.getString("created_by")).put("createdAt", rs.getString("created_at"))
                .put("updatedBy", rs.getString("updated_by")).put("updatedAt", rs.getString("updated_at"))
                .put("legacy", rs.getBoolean("legacy"));
        row.set("fieldValues", json(rs.getString("values_json")));
        if (detail) row.set("snapshot", json(rs.getString("snapshot_json")));
        return row;
    }

    private JsonNode json(String value) {
        try { return mapper.readTree(value); }
        catch (Exception ex) { throw invalid("表单记录数据无法读取"); }
    }
    private static String pattern(String value) { return "%" + value.trim().replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%"; }
    private static void contains(StringBuilder where, List<Object> args, String column, String value) {
        if (value == null || value.isBlank()) return;
        where.append(" AND ").append(column).append(" LIKE ? ESCAPE '!'"); args.add(pattern(value));
    }
}
