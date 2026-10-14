package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.template.service.FormProjectionInterpreter;
import com.zencas.edhr.template.service.FormLookupValue;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Latest saved content only. Call refresh inside the source save transaction, never from a query. */
@RequiredArgsConstructor
public class FormTraceIndexService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    record Value(String itemId, String fieldId, String fieldName, String tableId, String rowKey, int rowIndex, String text, String type) {
        Value(String itemId, String fieldId, String fieldName, String tableId, String rowKey, int rowIndex, String text) {
            this(itemId, fieldId, fieldName, tableId, rowKey, rowIndex, text, "text");
        }
    }

    public void refresh(long instanceId, String tenantId, JsonNode form, JsonNode values) {
        List<Value> entries = extract(form, values);
        jdbc.update("DELETE FROM form_trace_value WHERE tenant_id=? AND form_instance_id=?", tenantId, instanceId);
        jdbc.batchUpdate("""
                INSERT INTO form_trace_value(tenant_id,form_instance_id,item_id,field_id,field_name,table_id,row_key,row_index,value_text,value_type)
                VALUES(?,?,?,?,?,?,?,?,?,?)
                """, entries, 200, (statement, value) -> {
            statement.setString(1, tenantId); statement.setLong(2, instanceId);
            statement.setString(3, value.itemId()); statement.setString(4, value.fieldId());
            statement.setString(5, value.fieldName()); statement.setString(6, value.tableId());
            statement.setString(7, value.rowKey()); statement.setInt(8, value.rowIndex()); statement.setString(9, value.text());
            statement.setString(10, value.type());
        });
    }

    // Incomplete draft values do not block saving. Index only supported, explicitly mapped content.
    static List<Value> extract(JsonNode form, JsonNode values) {
        Map<List<String>, Value> result = new LinkedHashMap<>();
        for (JsonNode binding : form.path("projection").path("bindings")) {
            if (!"formTrace".equals(binding.path("modelId").asText()) || !binding.path("enabled").asBoolean()) continue;
            String tableId = binding.path("tableId").asText("");
            JsonNode fields = form.path("fields");
            if (!tableId.isEmpty()) {
                JsonNode table = field(fields, tableId);
                if (table == null || !"subTable".equals(table.path("type").asText())) continue;
                fields = table.path("typeConfig").path("columns");
            }
            if (!binding.path("sources").isObject()) continue;
            var sources = binding.path("sources").fields();
            while (sources.hasNext()) {
                var source = sources.next();
                JsonNode definition = field(fields, source.getValue().asText());
                if (definition == null) continue;
                if (tableId.isEmpty()) {
                    add(result, form.path("projection").path("lookupItems"), source.getKey(), definition, "", "form", -1, values.path(source.getValue().asText()));
                } else {
                    JsonNode rows = values.path(tableId);
                    if (!rows.isArray()) continue;
                    for (int index = 0; index < rows.size(); index++) {
                        JsonNode row = rows.get(index);
                        String rowKey = row.path("__rowId").asText("");
                        // Existing MVP rows can be indexed without rewriting their evidence. New rows get a system ID at save.
                        if (rowKey.isBlank()) rowKey = "legacy:" + (index + 1);
                        add(result, form.path("projection").path("lookupItems"), source.getKey(), definition, tableId, rowKey, index, row.path(source.getValue().asText()));
                    }
                }
            }
        }
        return new ArrayList<>(result.values());
    }

    private static JsonNode field(JsonNode fields, String id) {
        for (JsonNode candidate : fields) if (id.equals(candidate.path("id").asText())) return candidate;
        return null;
    }

    private static void add(Map<List<String>, Value> result, JsonNode items, String item, JsonNode field, String table, String rowKey, int rowIndex, JsonNode raw) {
        String type = field.path("type").asText();
        String valueType = items.path(item).path("type").asText("text");
        String value;
        if ("number".equals(valueType)) {
            if (!"number".equals(type) || !raw.isNumber()) return;
            value = FormLookupValue.number(raw.asText());
        } else if ("date".equals(valueType)) {
            if (!"datetime".equals(type) || !"date".equals(field.path("typeConfig").path("mode").asText()) || !raw.isTextual()) return;
            value = FormLookupValue.date(raw.asText());
        } else if (!"text".equals(valueType)) return;
        else if ("reference".equals(type)) {
            if (!raw.isObject() || raw.path("id").asLong() <= 0 || !raw.path("code").isTextual()) return;
            String sourceType = field.path("typeConfig").path("sourceType").asText();
            if (!sourceType.equals(raw.path("sourceType").asText())) return;
            boolean compatible = FormProjectionInterpreter.referenceSources(item).contains(sourceType);
            if (items.path(item).path("referenceSources").isArray()) {
                compatible = false;
                for (JsonNode allowed : items.path(item).path("referenceSources")) if (sourceType.equals(allowed.asText())) compatible = true;
            }
            if (!compatible) return;
            value = raw.path("code").asText();
        } else {
            if (!("text".equals(type) || "singleSelect".equals(type)) || !raw.isTextual()) return;
            value = raw.asText();
        }
        if (value == null) return;
        value = value.trim();
        if (value.isEmpty() || value.length() > 512) return;
        Value entry = new Value(item, field.path("id").asText(), field.path("name").asText(field.path("id").asText()), table, rowKey, rowIndex, value, valueType);
        result.put(List.of(table, rowKey, item, entry.fieldId()), entry);
    }

    public ObjectNode query(Long objectId, String operationId, String objectNo, String operationName,
                            Map<String, String> filters, int page, int size) {
        return query(objectId, operationId, objectNo, operationName, TraceCondition.textFilters(filters), page, size, true, Map.of(), false);
    }

    public ObjectNode query(Long objectId, String operationId, String objectNo, String operationName,
                            Map<String, String> filters, int page, int size, boolean reverse, Map<String, String> properties) {
        return query(objectId, operationId, objectNo, operationName, TraceCondition.textFilters(filters), page, size, reverse, properties, true);
    }

    public ObjectNode query(Long objectId, String operationId, String objectNo, String operationName,
                            List<TraceCondition> filters, int page, int size) {
        return query(objectId, operationId, objectNo, operationName, filters, page, size, true, Map.of(), false);
    }

    public ObjectNode query(Long objectId, String operationId, String objectNo, String operationName,
                            List<TraceCondition> filters, int page, int size, boolean reverse, Map<String, String> properties) {
        return query(objectId, operationId, objectNo, operationName, filters, page, size, reverse, properties, true);
    }

    private ObjectNode query(Long objectId, String operationId, String objectNo, String operationName,
                            List<TraceCondition> selected, int page, int size, boolean reverse, Map<String, String> properties, boolean includeContext) {
        StringBuilder where = new StringBuilder(" WHERE f.tenant_id='default' AND f.source_type='PRODUCTION_EXECUTION'");
        List<Object> args = new ArrayList<>();
        if (objectId != null) { where.append(" AND f.object_id=?"); args.add(objectId); }
        if (operationId != null && !operationId.isBlank()) { where.append(" AND f.operation_id=?"); args.add(operationId); }
        if (objectNo != null && !objectNo.isBlank()) { where.append(" AND f.object_no=?"); args.add(objectNo.trim()); }
        if (operationName != null && !operationName.isBlank()) { where.append(" AND f.operation_name=?"); args.add(operationName.trim()); }
        String from = " FROM form_instance_record f";
        if (includeContext) {
            from += " LEFT JOIN production_execution e ON e.object_id=f.object_id";
            TraceReportFilters.append(where, args, properties, Map.ofEntries(
                    Map.entry("instanceNo", "f.instance_no"), Map.entry("templateName", "f.template_name"),
                    Map.entry("workOrderNo", "f.work_order_no"), Map.entry("status", "CASE WHEN f.status='DRAFT' THEN 'DRAFT' ELSE COALESCE(f.saved_stage,CASE WHEN f.status='ACTIVE' THEN 'FILLING' ELSE f.status END) END"),
                    Map.entry("productCode", "e.snapshot_json::jsonb->'context'->>'productCode'"),
                    Map.entry("productName", "e.snapshot_json::jsonb->'context'->>'productName'"),
                    Map.entry("createdBy", "f.created_by"), Map.entry("createdAt", "f.created_at")));
        }
        if (reverse) {
            where.append(" AND EXISTS(SELECT 1 FROM form_trace_value a WHERE a.form_instance_id=f.id AND a.tenant_id=f.tenant_id");
            appendSameRowConditions(where, args, selected, "a"); where.append(')');
        }
        ObjectNode result = mapper.createObjectNode();
        result.put("total", jdbc.queryForObject("SELECT count(*)" + from + where, Long.class, args.toArray()));

        StringBuilder hits = new StringBuilder("SELECT jsonb_agg(jsonb_build_object('bindingId','trace','rowKey',v.row_key,'tableId',v.table_id,'rowIndex',v.row_index,");
        hits.append("'attributes',jsonb_build_object(v.item_id,v.value_text),'sources',jsonb_build_object(v.item_id,v.field_id),")
                .append("'fieldNames',jsonb_build_object(v.field_id,v.field_name)) ORDER BY v.table_id,v.row_index,v.item_id,v.field_id)")
                .append(" FROM form_trace_value v WHERE v.form_instance_id=f.id AND v.tenant_id=f.tenant_id");
        List<Object> hitArgs = new ArrayList<>();
        if (!selected.isEmpty()) {
            hits.append(" AND (");
            boolean first = true;
            for (var filter : selected) {
                if (!first) hits.append(" OR ");
                hits.append('('); filter.appendSql(hits, hitArgs, "v"); hits.append(')'); first = false;
            }
            hits.append(") AND (v.table_id='' OR (TRUE");
            appendSameRowConditions(hits, hitArgs, selected, "v");
            hits.append("))");
        }
        if (!reverse) { hits = new StringBuilder("SELECT '[]'::jsonb"); hitArgs.clear(); }
        List<Object> pageArgs = new ArrayList<>(hitArgs); pageArgs.addAll(args);
        pageArgs.add(size); pageArgs.add((long) page * size);
        String productSelect = includeContext ? ",e.snapshot_json::jsonb->'context' AS production_context" : ",NULL AS production_context";
        result.set("records", mapper.valueToTree(jdbc.query("""
                SELECT f.*,f.snapshot_json::jsonb->'projection'->'lookupItems' AS lookup_items,
                (""" + hits + ") AS hits" + productSelect + from + where + " ORDER BY f.updated_at DESC,f.id DESC LIMIT ? OFFSET ?", (rs, index) -> {
            ObjectNode record = mapper.createObjectNode().put("id", rs.getString("id")).put("instanceId", rs.getString("id"))
                    .put("instanceNo", rs.getString("instance_no")).put("status", rs.getString("status"))
                    .put("savedStage", rs.getString("saved_stage"))
                    .put("objectId", rs.getString("object_id")).put("objectNo", rs.getString("object_no"))
                    .put("operationId", rs.getString("operation_id")).put("operationName", rs.getString("operation_name"))
                    .put("workOrderNo", rs.getString("work_order_no")).put("templateName", rs.getString("template_name"))
                    .put("createdBy", rs.getString("created_by")).put("createdAt", rs.getString("created_at"))
                    .put("updatedBy", rs.getString("updated_by")).put("updatedAt", rs.getString("updated_at"))
                    .put("bindingId", "trace").put("rowKey", "form").put("revision", 0);
            record.putNull("batchId"); record.putObject("attributes"); record.putObject("sources");
            record.set("hits", parse(rs.getString("hits")));
            record.set("lookupItems", rs.getString("lookup_items") == null ? mapper.createObjectNode() : parse(rs.getString("lookup_items")));
            record.set("context", rs.getString("production_context") == null ? mapper.createObjectNode() : parse(rs.getString("production_context")));
            record.putObject("sourceMetadata").put("instanceId", rs.getString("id")).put("status", rs.getString("status"))
                    .put("savedStage", rs.getString("saved_stage"))
                    .put("savedAt", rs.getString("updated_at")).put("templateName", rs.getString("template_name"))
                    .put("templateVersion", rs.getString("template_version"));
            return record;
        }, pageArgs.toArray())));
        result.putArray("totals"); result.put("totalsTruncated", false);
        return result;
    }

    // A main-field condition can match anywhere on the same form. All detail conditions must share this actual row.
    private static void appendSameRowConditions(StringBuilder sql, List<Object> args, List<TraceCondition> filters, String anchor) {
        for (var filter : filters) {
            sql.append(" AND EXISTS(SELECT 1 FROM form_trace_value c WHERE c.form_instance_id=f.id AND c.tenant_id=f.tenant_id")
                    .append(" AND ");
            filter.appendSql(sql, args, "c");
            sql.append(" AND (c.table_id='' OR (c.table_id=")
                    .append(anchor).append(".table_id AND c.row_key=").append(anchor).append(".row_key)))");
        }
    }

    private JsonNode parse(String json) {
        try { return mapper.readTree(json); }
        catch (Exception ex) { throw new BusinessException(ErrorCode.GENERAL_001, "追溯来源数据无法读取"); }
    }
}
