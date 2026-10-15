package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DhrTraceReportService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final DhrInstanceService dhrs;

    public ObjectNode query(boolean reverse, Map<String, String> properties, Map<String, String> filters, int page, int size) {
        return query(reverse, properties, TraceCondition.textFilters(filters), page, size);
    }

    public ObjectNode query(boolean reverse, Map<String, String> properties, List<TraceCondition> filters, int page, int size) {
        StringBuilder where = new StringBuilder(" WHERE d.tenant_id='default'");
        List<Object> args = new ArrayList<>();
        TraceReportFilters.append(where, args, properties, Map.ofEntries(
                Map.entry("dhrNo", "d.dhr_no"), Map.entry("objectNo", "d.object_no"), Map.entry("objectType", "d.object_type"),
                Map.entry("workOrderNo", "d.work_order_no"), Map.entry("productCode", "d.product_code"), Map.entry("productName", "d.product_name"),
                Map.entry("status", "d.status"), Map.entry("summaryStatus", "d.summary_status"),
                Map.entry("createdBy", "d.created_by"), Map.entry("createdAt", "d.created_at")));
        if (!reverse) {
            long total = jdbc.queryForObject("SELECT count(*) FROM dhr_instance d" + where, Long.class, args.toArray());
            args.add(size); args.add((long) page * size);
            var ids = jdbc.queryForList("SELECT d.id FROM dhr_instance d" + where + " ORDER BY d.created_at DESC,d.id DESC LIMIT ? OFFSET ?", Long.class, args.toArray());
            return result(total, ids.stream().map(dhrs::header).toList());
        }
        // Live indexes only narrow candidates. Terminated evidence is checked against its verified frozen snapshot.
        where.append(" AND (d.status='EARLY_TERMINATED' OR (");
        if (filters.isEmpty()) {
            where.append("EXISTS(SELECT 1 FROM form_instance_record f JOIN form_trace_value v ON v.form_instance_id=f.id AND v.tenant_id=f.tenant_id WHERE f.tenant_id=d.tenant_id AND f.source_type='PRODUCTION_EXECUTION' AND f.object_id=d.production_object_id)");
        } else {
            boolean first = true;
            for (var filter : filters) {
                if (!first) where.append(" AND "); first = false;
                where.append("EXISTS(SELECT 1 FROM form_instance_record f JOIN form_trace_value v ON v.form_instance_id=f.id AND v.tenant_id=f.tenant_id WHERE f.tenant_id=d.tenant_id AND f.source_type='PRODUCTION_EXECUTION' AND f.object_id=d.production_object_id AND ");
                filter.appendSql(where, args, "v"); where.append(')');
            }
        }
        where.append("))");
        List<ObjectNode> records = new ArrayList<>();
        long total = 0, start = (long) page * size;
        for (Long id : jdbc.queryForList("SELECT d.id FROM dhr_instance d" + where + " ORDER BY d.created_at DESC,d.id DESC", Long.class, args.toArray())) {
            ObjectNode detail = dhrs.detail(id);
            ArrayNode hits = matches(detail, filters);
            if (hits == null) continue;
            if (total >= start && total < start + size) {
                ObjectNode row = dhrs.header(id);
                row.put("hitFormCount", hits.size()); row.set("hits", hits); records.add(row);
            }
            total++;
        }
        return result(total, records);
    }

    public ObjectNode detail(long id, boolean reverse, Map<String, String> filters) {
        return detail(id, reverse, TraceCondition.textFilters(filters));
    }

    public ObjectNode detail(long id, boolean reverse, List<TraceCondition> filters) {
        ObjectNode result = dhrs.detail(id);
        ArrayNode hits = reverse ? matches(result, filters) : mapper.createArrayNode();
        result.set("traceHits", hits == null ? mapper.createArrayNode() : hits);
        result.put("traceConditionsSatisfied", !reverse || hits != null);
        result.put("traceEvidenceBasis", "EARLY_TERMINATED".equals(result.path("status").asText())
                && result.path("terminationSnapshotAvailable").asBoolean() ? "TERMINATION_SNAPSHOT" : "CURRENT_SAVED");
        return result;
    }

    /** DHR AND is across actual member instances; it is not a joined business event or a same-row assertion. */
    ArrayNode matches(JsonNode detail, Map<String, String> filters) {
        return matches(detail, TraceCondition.textFilters(filters));
    }

    ArrayNode matches(JsonNode detail, List<TraceCondition> filters) {
        ArrayNode result = mapper.createArrayNode();
        Map<String, Boolean> satisfied = new LinkedHashMap<>(); filters.forEach(condition -> satisfied.put(condition.itemId(), false));
        for (String origin : List.of("directory", "work", "custom")) for (JsonNode record : detail.path("recordsByOrigin").path(origin)) {
            ArrayNode fields = mapper.createArrayNode();
            for (var value : FormTraceIndexService.extract(record.path("snapshot"), record.path("fieldValues"))) {
                if (!filters.isEmpty() && filters.stream().noneMatch(condition -> condition.matches(value))) continue;
                satisfied.put(value.itemId(), true);
                ObjectNode hit = fields.addObject().put("bindingId", "trace").put("tableId", value.tableId())
                        .put("rowKey", value.rowKey()).put("rowIndex", value.rowIndex());
                hit.putObject("attributes").put(value.itemId(), value.text());
                hit.putObject("sources").put(value.itemId(), value.fieldId());
                hit.putObject("fieldNames").put(value.fieldId(), value.fieldName());
            }
            if (!fields.isEmpty()) {
                ObjectNode hit = result.addObject().put("instanceId", record.path("id").asText())
                        .put("instanceNo", record.path("instanceNo").asText()).put("templateName", record.path("templateName").asText());
                hit.set("hits", fields); hit.set("lookupItems", record.path("snapshot").path("projection").path("lookupItems"));
            }
        }
        return result.isEmpty() || satisfied.containsValue(false) ? null : result;
    }

    private ObjectNode result(long total, List<ObjectNode> records) {
        ObjectNode result = mapper.createObjectNode().put("total", total);
        result.set("records", mapper.valueToTree(records)); return result;
    }
}
