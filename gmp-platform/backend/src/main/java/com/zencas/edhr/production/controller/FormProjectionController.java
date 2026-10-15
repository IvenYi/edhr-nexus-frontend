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
import com.zencas.edhr.production.service.FormTraceIndexService;
import com.zencas.edhr.production.service.TraceCondition;

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

    @GetMapping("/production-object-options")
    public ApiResponse<List<Map<String, Object>>> productionObjectOptions(@RequestParam(defaultValue = "") String keyword) {
        if (keyword.length() > 512) throw invalid("查询内容最多512字");
        String pattern = "%" + keyword.trim().replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
        return ApiResponse.success(jdbc.queryForList("""
                SELECT r.id::text AS id,r.object_no AS code,w.order_no AS name,r.object_type AS type
                FROM production_object r JOIN work_order w ON w.id=r.work_order_id AND w.tenant_id=r.tenant_id
                WHERE r.tenant_id='default' AND w.tenant_id='default' AND r.object_type IN ('BATCH','SN')
                    AND (r.object_no ILIKE ? ESCAPE '!' OR w.order_no ILIKE ? ESCAPE '!')
                ORDER BY r.object_no,r.id LIMIT 50
                """, pattern, pattern));
    }

    @PostMapping("/query")
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ApiResponse<ObjectNode> query(@RequestBody Query query) {
        if (query.modelId() == null || !Set.of("formTrace", "production", "scrap", "consumption").contains(query.modelId()) || query.page() < 0 || query.size() < 1 || query.size() > 200)
            throw invalid("请选择可用报表及合法页码");
        boolean trace = "formTrace".equals(query.modelId());
        if (trace) {
            var conditions = query.filters() == null || query.filters().isEmpty() ? List.<TraceCondition>of()
                    : TraceCondition.parse(query.filters(), Map.of(), lookupCatalog.list());
            return ApiResponse.success(new FormTraceIndexService(jdbc, mapper).query(query.objectId(), query.operationId(),
                    query.objectNo(), query.operationName(), conditions, query.page(), query.size()));
        }
        StringBuilder where = new StringBuilder(" WHERE b.tenant_id='default' AND b.status='SUCCEEDED'");
        List<Object> args = new ArrayList<>();
        where.append(" AND r.model_id=?"); args.add(query.modelId());
        if (query.objectId() != null) { where.append(" AND f.object_id=?"); args.add(query.objectId()); }
        if (query.operationId() != null && !query.operationId().isBlank()) { where.append(" AND f.operation_id=?"); args.add(query.operationId()); }
        if (query.objectNo() != null && !query.objectNo().isBlank()) { where.append(" AND f.object_no=?"); args.add(query.objectNo().trim()); }
        if (query.operationName() != null && !query.operationName().isBlank()) { where.append(" AND f.operation_name=?"); args.add(query.operationName().trim()); }
        if (query.filters() != null) for (var filter : query.filters().entrySet()) {
            String key = filter.getKey();
            boolean common = Set.of("workOrderNo", "productCode", "productName", "unit", "teamText", "documentNumberText", "createdBy", "updatedBy", "createdDateFrom", "createdDateTo", "updatedDateFrom", "updatedDateTo").contains(key);
            boolean specific = ("production".equals(query.modelId()) ? Set.of("reporter", "productionDateFrom", "productionDateTo") : Set.of("materialCode", "materialName", "materialLotText", "category", "reason")).contains(key);
            if (!common && !specific) throw invalid("筛选属性不适用于此业务报表");
            if (filter.getValue() == null || filter.getValue().isBlank() || filter.getValue().length() > 512) throw invalid("筛选属性或值不受支持");
            String value = filter.getValue().trim();
            if (Set.of("workOrderNo", "productCode", "productName").contains(key)) {
                where.append(" AND b.source_json->'context'->> ? = ?"); args.add(key); args.add(value);
            } else if (Set.of("materialCode", "materialName").contains(key)) {
                where.append(" AND r.attributes->'material'->> ? = ?"); args.add("materialCode".equals(key) ? "code" : "name"); args.add(value);
            } else if (Set.of("productionDateFrom", "productionDateTo", "createdDateFrom", "createdDateTo", "updatedDateFrom", "updatedDateTo").contains(key)) {
                java.time.LocalDate date;
                try { date = java.time.LocalDate.parse(value); } catch (java.time.format.DateTimeParseException ex) { throw invalid("请选择有效日期"); }
                if (key.startsWith("productionDate")) {
                    if (!"production".equals(query.modelId())) throw invalid("生产日期仅用于报工记录");
                    where.append(" AND (r.attributes->>'productionDate')::date ").append(key.endsWith("From") ? ">= ?" : "<= ?");
                    args.add(java.sql.Date.valueOf(date));
                } else {
                    where.append(key.startsWith("created") ? " AND f.created_at " : " AND f.updated_at ")
                            .append(key.endsWith("From") ? ">= ?" : "< ?");
                    args.add(java.sql.Timestamp.valueOf((key.endsWith("From") ? date : date.plusDays(1)).atStartOfDay()));
                }
            } else if (Set.of("createdBy", "updatedBy").contains(key)) {
                where.append("createdBy".equals(key) ? " AND f.created_by=?" : " AND f.updated_by=?"); args.add(value);
            } else if (Set.of("materialLotText", "teamText", "documentNumberText", "unit", "reason", "category", "reporter").contains(key)) {
                if ("reporter".equals(key) && !"production".equals(query.modelId())) throw invalid("报工人仅用于报工记录");
                where.append(" AND (r.attributes ->> ? = ? OR r.attributes ->> ? = ?)");
                args.add(key); args.add(value); args.add(key + "Label"); args.add(value);
            } else throw invalid("筛选属性不受支持");
        }
        if (query.filters() != null) for (String prefix : List.of("productionDate", "createdDate", "updatedDate")) {
            String start = query.filters().get(prefix + "From"), end = query.filters().get(prefix + "To");
            if (start != null && end != null && java.time.LocalDate.parse(start.trim()).isAfter(java.time.LocalDate.parse(end.trim()))) throw invalid("查询结束日期不能早于开始日期");
        }
        String from = " FROM form_projection_record r JOIN form_projection_batch b ON b.id=r.batch_id JOIN form_instance_record f ON f.id=b.form_instance_id";
        ObjectNode result = mapper.createObjectNode();
        result.put("total", jdbc.queryForObject("SELECT count(*)" + from + where, Long.class, args.toArray()));
        List<Object> pageArgs = new ArrayList<>(args); pageArgs.add(query.size()); pageArgs.add((long) query.page() * query.size());
        String recordSelect = "r.*,'[]'::jsonb AS hits";
        String grouping = " ORDER BY r.id DESC";
        result.set("records", mapper.valueToTree(jdbc.query("SELECT " + recordSelect + """
                ,f.instance_no,f.id AS instance_id,f.object_id,f.object_no,f.operation_id,f.operation_name,b.final_revision,
                f.created_by,f.created_at,f.updated_by,f.updated_at,b.source_json AS frozen_source,
                b.source_json->'model'->'projection'->'lookupItems' AS lookup_items
                """ + from + where + grouping + " LIMIT ? OFFSET ?", (rs, i) -> {
            ObjectNode record = mapper.createObjectNode().put("id", rs.getString("id")).put("batchId", rs.getString("batch_id"))
                    .put("instanceId", rs.getString("instance_id")).put("instanceNo", rs.getString("instance_no"))
                    .put("objectId", rs.getString("object_id")).put("objectNo", rs.getString("object_no"))
                    .put("operationId", rs.getString("operation_id")).put("operationName", rs.getString("operation_name"))
                    .put("bindingId", rs.getString("binding_id")).put("rowKey", rs.getString("row_key")).put("revision", rs.getInt("final_revision"));
            record.put("createdBy", rs.getString("created_by")).put("createdAt", rs.getString("created_at"))
                    .put("updatedBy", rs.getString("updated_by")).put("updatedAt", rs.getString("updated_at"));
            record.set("attributes", parse(rs.getString("attributes"))); record.set("sources", parse(rs.getString("sources")));
            record.set("details", parse(rs.getString("details")));
            record.set("hits", parse(rs.getString("hits")));
            record.set("lookupItems", rs.getString("lookup_items") == null ? mapper.createObjectNode() : parse(rs.getString("lookup_items")));
            JsonNode frozen = parse(rs.getString("frozen_source"));
            record.set("context", frozen.path("context"));
            String tableId = rs.getString("table_id");
            if (tableId != null && !tableId.isBlank()) {
                record.put("tableId", tableId);
                String keyField = "__rowId";
                for (JsonNode binding : frozen.path("model").path("projection").path("bindings")) {
                    if (binding.path("id").asText().equals(rs.getString("binding_id")) && binding.hasNonNull("rowKeyFieldId")) {
                        keyField = binding.path("rowKeyFieldId").asText();
                        break;
                    }
                }
                JsonNode frozenRows = frozen.path("values").path(tableId);
                for (int rowIndex = 0; rowIndex < frozenRows.size(); rowIndex++) {
                    if (frozenRows.path(rowIndex).path(keyField).asText().equals(rs.getString("row_key"))) {
                        record.put("rowIndex", rowIndex);
                        break;
                    }
                }
            }
            return record;
        }, pageArgs.toArray())));
        // Aggregation is over facts, never over DHR joins; preserve object, operation, material, lot and unit.
        result.set("totals", mapper.valueToTree(jdbc.queryForList("""
                SELECT f.object_id::text AS "objectId",f.object_no AS "objectNo",f.operation_id AS "operationId",
                f.operation_name AS "operationName",r.attributes->'material'->>'id' AS "materialId",
                r.attributes->'material'->>'name' AS "materialName",r.attributes->>'materialLotText' AS "materialLot",
                r.attributes->>'unit' AS unit,
                string_agg(DISTINCT nullif(r.attributes->>'unitLabel',''),' / ') AS "unitLabel",
                sum((r.attributes->>'quantity')::numeric) AS quantity,
                sum((r.attributes->>'outputQuantity')::numeric) AS "outputQuantity",
                sum((r.attributes->>'goodQuantity')::numeric) AS "goodQuantity",
                sum((r.attributes->>'workHours')::numeric) AS "workHours",
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

    @GetMapping("/instances/{instanceId}/source")
    public ApiResponse<JsonNode> instanceSource(@PathVariable long instanceId) {
        var rows = jdbc.query("SELECT * FROM form_instance_record WHERE id=? AND tenant_id='default'", (rs, index) -> {
            ObjectNode source = mapper.createObjectNode().put("instanceId", rs.getString("id"))
                    .put("instanceNo", rs.getString("instance_no")).put("operationId", rs.getString("operation_id"))
                    .put("status", rs.getString("status")).put("savedStage", rs.getString("saved_stage")).put("savedAt", rs.getString("updated_at"));
            source.set("form", parse(rs.getString("snapshot_json")));
            source.set("values", parse(rs.getString("values_json")));
            source.putObject("context").put("objectId", rs.getString("object_id")).put("objectNo", rs.getString("object_no"))
                    .put("objectType", rs.getString("object_type")).put("workOrderId", rs.getString("work_order_id"))
                    .put("workOrderNo", rs.getString("work_order_no"));
            return (JsonNode) source;
        }, instanceId);
        if (rows.isEmpty()) throw invalid("来源表单不存在");
        return ApiResponse.success(rows.getFirst());
    }

    @GetMapping("/instances/{instanceId}/dhr")
    @PreAuthorize("hasAuthority('form-instances.view') and hasAuthority('production.execution') and hasAuthority('dhr.instances.view')")
    public ApiResponse<List<Map<String, Object>>> instanceDhr(@PathVariable long instanceId) {
        return ApiResponse.success(jdbc.queryForList("""
                SELECT d.id::text AS id,d.dhr_no AS "dhrNo",d.status FROM form_instance_record f
                JOIN dhr_instance d ON d.production_object_id=f.object_id AND d.tenant_id=f.tenant_id
                WHERE f.id=? AND f.tenant_id='default'
                """, instanceId));
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
