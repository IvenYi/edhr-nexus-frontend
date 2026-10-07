package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.template.service.FormLookupCatalogService;

@RestController
@RequestMapping("/api/v1/reports/form-projections")
@PreAuthorize("hasAuthority('form-instances.view') and hasAuthority('production.execution')")
@RequiredArgsConstructor
public class FormProjectionController {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;
    private final FormLookupCatalogService lookupCatalog;

    public record Query(String modelId, Long objectId, String operationId, Map<String, String> filters, int page, int size, String objectNo, String operationName) {}

    @PostMapping("/query")
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ApiResponse<ObjectNode> query(@RequestBody Query query) {
        if (query.modelId() == null || !Set.of("formTrace", "production", "scrap", "consumption").contains(query.modelId()) || query.page() < 0 || query.size() < 1 || query.size() > 200)
            throw invalid("请选择可用报表及合法页码");
        boolean trace = "formTrace".equals(query.modelId());
        StringBuilder where = new StringBuilder(" WHERE b.tenant_id='default' AND b.status='SUCCEEDED'");
        List<Object> args = new ArrayList<>();
        if (!trace) { where.append(" AND r.model_id=?"); args.add(query.modelId()); }
        if (query.objectId() != null) { where.append(" AND f.object_id=?"); args.add(query.objectId()); }
        if (query.operationId() != null && !query.operationId().isBlank()) { where.append(" AND f.operation_id=?"); args.add(query.operationId()); }
        if (query.objectNo() != null && !query.objectNo().isBlank()) { where.append(" AND f.object_no=?"); args.add(query.objectNo().trim()); }
        if (query.operationName() != null && !query.operationName().isBlank()) { where.append(" AND f.operation_name=?"); args.add(query.operationName().trim()); }
        if (query.filters() != null) for (var filter : query.filters().entrySet()) {
            if (!(Set.of("materialLotText", "serialNumberText", "equipmentText", "teamText", "documentNumberText", "unit", "reason", "category").contains(filter.getKey())
                    || (trace && filter.getKey().startsWith("lookup_") && lookupCatalog.contains(filter.getKey())))
                    || filter.getValue() == null || filter.getValue().isBlank() || filter.getValue().length() > 512) throw invalid("筛选属性或值不受支持");
            where.append(" AND r.attributes ->> ? = ?"); args.add(filter.getKey()); args.add(filter.getValue().trim());
        }
        String from = " FROM form_projection_record r JOIN form_projection_batch b ON b.id=r.batch_id JOIN form_instance_record f ON f.id=b.form_instance_id";
        ObjectNode result = mapper.createObjectNode();
        result.put("total", jdbc.queryForObject("SELECT " + (trace ? "count(DISTINCT f.id)" : "count(*)") + from + where, Long.class, args.toArray()));
        List<Object> pageArgs = new ArrayList<>(args); pageArgs.add(query.size()); pageArgs.add((long) query.page() * query.size());
        String recordSelect = trace ? "b.id AS id,b.id AS batch_id,'' AS binding_id,'form' AS row_key,'{}'::jsonb AS attributes,'{}'::jsonb AS sources,jsonb_agg(jsonb_build_object('bindingId',r.binding_id,'rowKey',r.row_key,'tableId',r.table_id,'attributes',r.attributes,'sources',r.sources) ORDER BY r.id) AS hits"
                : "r.*,'[]'::jsonb AS hits";
        String grouping = trace ? " GROUP BY b.id,f.id ORDER BY b.id DESC" : " ORDER BY r.id DESC";
        result.set("records", mapper.valueToTree(jdbc.query("SELECT " + recordSelect + """
                ,f.instance_no,f.id AS instance_id,f.object_id,f.object_no,f.operation_id,f.operation_name,b.final_revision,
                f.created_by,f.created_at,f.updated_by,f.updated_at,b.source_json->'model'->'projection'->'lookupItems' AS lookup_items
                """ + from + where + grouping + " LIMIT ? OFFSET ?", (rs, i) -> {
            ObjectNode record = mapper.createObjectNode().put("id", rs.getString("id")).put("batchId", rs.getString("batch_id"))
                    .put("instanceId", rs.getString("instance_id")).put("instanceNo", rs.getString("instance_no"))
                    .put("objectId", rs.getString("object_id")).put("objectNo", rs.getString("object_no"))
                    .put("operationId", rs.getString("operation_id")).put("operationName", rs.getString("operation_name"))
                    .put("bindingId", rs.getString("binding_id")).put("rowKey", rs.getString("row_key")).put("revision", rs.getInt("final_revision"));
            record.put("createdBy", rs.getString("created_by")).put("createdAt", rs.getString("created_at"))
                    .put("updatedBy", rs.getString("updated_by")).put("updatedAt", rs.getString("updated_at"));
            record.set("attributes", parse(rs.getString("attributes"))); record.set("sources", parse(rs.getString("sources")));
            record.set("hits", parse(rs.getString("hits")));
            record.set("lookupItems", rs.getString("lookup_items") == null ? mapper.createObjectNode() : parse(rs.getString("lookup_items")));
            return record;
        }, pageArgs.toArray())));
        if (trace) { result.putArray("totals"); result.put("totalsTruncated", false); return ApiResponse.success(result); }
        // Aggregation is over facts, never over DHR joins; preserve object, operation, material, lot and unit.
        result.set("totals", mapper.valueToTree(jdbc.queryForList("""
                SELECT f.object_id::text AS "objectId",f.object_no AS "objectNo",f.operation_id AS "operationId",
                f.operation_name AS "operationName",r.attributes->'material'->>'id' AS "materialId",
                r.attributes->'material'->>'name' AS "materialName",r.attributes->>'materialLotText' AS "materialLot",
                r.attributes->>'unit' AS unit,
                sum((r.attributes->>'quantity')::numeric) AS quantity,
                sum((r.attributes->>'goodQuantity')::numeric) AS "goodQuantity",
                sum((r.attributes->>'ngQuantity')::numeric) AS "ngQuantity",count(*) AS "recordCount"
                """ + from + where + " GROUP BY f.object_id,f.object_no,f.operation_id,f.operation_name,r.attributes->'material'->>'id',r.attributes->'material'->>'name',r.attributes->>'materialLotText',r.attributes->>'unit' ORDER BY f.object_id,f.operation_id LIMIT 201", args.toArray())));
        result.put("totalsTruncated", result.path("totals").size() > 200);
        if (result.path("totals").size() > 200) ((com.fasterxml.jackson.databind.node.ArrayNode) result.path("totals")).remove(200);
        return ApiResponse.success(result);
    }

    @GetMapping("/status")
    public ApiResponse<List<Map<String, Object>>> status() {
        return ApiResponse.success(jdbc.queryForList("""
                SELECT b.id::text AS id,b.status,b.attempts,b.error_message AS "errorMessage",f.instance_no AS "instanceNo"
                FROM form_projection_batch b JOIN form_instance_record f ON f.id=b.form_instance_id
                WHERE b.tenant_id='default' AND b.status IN ('PENDING','FAILED') ORDER BY b.id DESC LIMIT 100
                """));
    }

    @GetMapping("/{batchId}/source")
    public ApiResponse<JsonNode> source(@PathVariable long batchId) {
        var rows = jdbc.queryForList("SELECT source_json::text AS source FROM form_projection_batch WHERE id=? AND tenant_id='default'", batchId);
        if (rows.isEmpty()) throw invalid("来源快照不存在");
        return ApiResponse.success(parse(rows.getFirst().get("source").toString()));
    }

    @GetMapping("/{batchId}/dhr")
    @PreAuthorize("hasAuthority('form-instances.view') and hasAuthority('production.execution') and hasAuthority('dhr.instances.view')")
    public ApiResponse<List<Map<String, Object>>> dhr(@PathVariable long batchId) {
        return ApiResponse.success(jdbc.queryForList("""
                SELECT d.id::text AS id,d.dhr_no AS "dhrNo",d.status FROM form_projection_batch b
                JOIN form_instance_record f ON f.id=b.form_instance_id AND f.tenant_id=b.tenant_id
                JOIN dhr_instance d ON d.production_object_id=f.object_id AND d.tenant_id=f.tenant_id
                WHERE b.id=? AND b.tenant_id='default'
                """, batchId));
    }

    @PostMapping("/{batchId}/retry")
    @PreAuthorize("hasAuthority('system.edit') and hasAuthority('form-instances.view') and hasAuthority('production.execution')")
    @Transactional
    public ApiResponse<Void> retry(@PathVariable long batchId, @RequestBody Map<String, String> request) {
        String reason = request.get("reason");
        if (reason == null || reason.isBlank() || reason.length() > 512) throw invalid("请填写重试原因，最多512字");
        int changed = jdbc.update("UPDATE form_projection_batch SET status='PENDING',error_message=NULL WHERE id=? AND tenant_id='default' AND status='FAILED'", batchId);
        if (changed != 1) throw invalid("仅失败投影可以重试");
        audits.save(AuditEvent.builder().id(ids.nextId()).tenantId("default").entityType("FORM_PROJECTION_BATCH")
                .entityId(Long.toString(batchId)).action("UPDATE").operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName()).contentBefore("{\"status\":\"FAILED\"}")
                .contentAfter(mapper.createObjectNode().put("status", "PENDING").put("reason", reason).toString())
                .reason(reason).moduleName("报表").menuName("追溯与统计").functionName("投影重试")
                .createdAt(java.time.LocalDateTime.now()).build());
        return ApiResponse.success(null);
    }

    private JsonNode parse(String json) {
        try { return mapper.readTree(json); } catch (Exception ex) { throw invalid("来源快照不可读取"); }
    }
    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
