package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Production owns these totals. One database statement reads the complete committed source set;
 * no report pagination, additive callbacks, current-template lookup or historical backfill. */
@Service
@RequiredArgsConstructor
public class ProductionOutputService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public ObjectNode object(long objectId) {
        var rows = read("o.id", objectId);
        return rows.isEmpty() ? empty("NO_DATA", "暂无产出数据") : summarize(rows.getFirst());
    }

    public ObjectNode order(long orderId) {
        var result = empty("NO_DATA", "暂无产出数据");
        ArrayNode batches = result.putArray("batches");
        BigDecimal quantity = BigDecimal.ZERO;
        int known = 0, incomplete = 0;
        Set<String> units = new HashSet<>();
        for (var row : read("o.work_order_id", orderId)) {
            if ("CANCELLED".equals(row.get("object_status"))) continue; // Cancel is only possible before starting.
            var output = summarize(row);
            output.put("objectId", row.get("id").toString()).put("objectNo", row.get("object_no").toString());
            batches.add(output);
            if (output.hasNonNull("quantity")) {
                quantity = quantity.add(new BigDecimal(output.path("quantity").asText()));
                units.add(output.path("unit").asText()); known++;
            }
            if (!"READY".equals(output.path("status").asText())) incomplete++;
        }
        result.put("knownBatches", known).put("totalBatches", batches.size());
        if (units.size() > 1) return result.put("status", "UNIT_REVIEW").put("message", "批次使用时的产品单位不一致，不能合并为一个产出数量");
        if (known > 0) {
            result.put("quantity", quantity.toPlainString()).put("unit", units.iterator().next());
            result.put("status", incomplete > 0 ? "PARTIAL" : "READY")
                    .put("message", incomplete > 0 ? "部分汇总：仍有批次未齐，请查看批次来源" : "所属批次已知累计产出，不代表工单已完工");
        }
        return result;
    }

    private List<Map<String, Object>> read(String key, long id) {
        // key is private and selected only by the two methods above, never supplied by a request.
        return jdbc.queryForList("""
            SELECT o.id,o.object_no,o.object_type,o.status AS object_status,e.snapshot_json,
              COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'id',b.id::text,'operationId',b.source_json->>'operationId','status',b.status,
                'form',b.source_json->'form','model',b.source_json->'model','values',b.source_json->'values',
                'operationName',f.operation_name,'copyId',f.copy_id,'formStatus',f.status,
                'instanceId',f.id::text,'instanceNo',f.instance_no,
                'records',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',r.id::text,
                  'bindingId',r.binding_id,'rowKey',r.row_key,'tableId',r.table_id,
                  'modelId',r.model_id,'attributes',r.attributes,'sources',r.sources,'details',r.details,
                  'currentMaterialType',(SELECT t.name FROM material m JOIN material_type t ON t.id=m.material_type_id
                    WHERE m.id::text=r.attributes->'material'->>'id')))
                  FROM form_projection_record r WHERE r.batch_id=b.id AND r.model_id IN ('production','scrap')),'[]'::jsonb)))
                FROM form_projection_batch b JOIN form_instance_record f ON f.id=b.form_instance_id
                WHERE f.object_id=o.id AND f.tenant_id=o.tenant_id AND b.tenant_id=o.tenant_id
                  AND f.source_type='PRODUCTION_EXECUTION' AND b.status<>'INVALIDATED'),'[]'::jsonb)::text AS batches
            FROM production_object o LEFT JOIN production_execution e ON e.object_id=o.id
            WHERE o.tenant_id='default' AND
            """ + key + "=? ORDER BY o.id", id);
    }

    private ObjectNode summarize(Map<String, Object> row) {
        if (!"BATCH".equals(row.get("object_type"))) return empty("UNSUPPORTED", "SN产出算法尚未配置");
        if (row.get("snapshot_json") == null) return empty("NOT_STARTED", "尚未开工，暂无冻结的产出配置");
        JsonNode snapshot = parse(row.get("snapshot_json").toString());
        if (snapshot.path("outputPolicyVersion").asInt() != 1) return empty("LEGACY", "历史实例未配置最终产出，本次不补算");
        JsonNode batches = parse(row.get("batches").toString());
        String productUnit = snapshot.path("context").path("unit").asText("");
        ObjectNode total = empty("NOT_CONFIGURED", "未设置最终产出工序");
        ObjectNode operations = total.putObject("operations");
        ObjectNode quality = mapper.createObjectNode();
        for (String role : List.of("goodQuantity", "ngQuantity")) quality.set(role, empty("NOT_CONFIGURED", "未设置最终产出工序"));
        boolean scrapConfigured = false;
        for (JsonNode op : snapshot.path("operations")) {
            boolean finalOutput = op.path("finalOutput").asBoolean();
            ObjectNode summary = operation(op, batches, finalOutput ? productUnit : null);
            ObjectNode operationQuality = mapper.createObjectNode();
            for (String role : List.of("goodQuantity", "ngQuantity", "scrapQuantity"))
                operationQuality.set(role, ProductionQualitySummary.metric(mapper, batches, role, op.path("id").asText(), finalOutput && !role.equals("scrapQuantity") ? productUnit : null, null,
                        ProductionQualitySummary.configured(op.path("forms"), role), false));
            summary.set("quality", operationQuality);
            scrapConfigured |= ProductionQualitySummary.configured(op.path("forms"), "scrapQuantity");
            operations.set(op.path("id").asText(), summary);
            if (finalOutput) {
                total.setAll(summary);
                total.put("operationId", op.path("id").asText()).put("operationName", op.path("name").asText());
                for (String role : List.of("goodQuantity", "ngQuantity")) quality.set(role,
                        ProductionQualitySummary.metric(mapper, batches, role, op.path("id").asText(), productUnit, null,
                                ProductionQualitySummary.configured(op.path("forms"), role), false));
            }
        }
        quality.set("scrapQuantity", ProductionQualitySummary.metric(mapper, batches, "scrapQuantity", null, productUnit,
                snapshot.path("context").path("productId").asText(), scrapConfigured, false));
        total.set("quality", quality);
        return total;
    }

    public static BigDecimal qualityQuantity(JsonNode output, String role) {
        if (output == null) return null;
        JsonNode value = output.path("quality").path(role).path("quantity");
        return value.isMissingNode() || value.isNull() ? null : new BigDecimal(value.asText());
    }

    private ObjectNode operation(JsonNode op, JsonNode batches, String expectedUnit) {
        boolean configured = false;
        for (JsonNode form : op.path("forms")) configured |= hasOutput(form.path("projection"));
        ObjectNode result = empty("NO_DATA", "暂无正式生效的产出报工");
        result.put("operationName", op.path("name").asText());
        ArrayNode sources = result.putArray("sources");
        Map<String, BigDecimal> groups = new LinkedHashMap<>();
        int pending = 0, failed = 0, rejected = 0;
        for (JsonNode batch : batches) {
            if (!op.path("id").asText().equals(batch.path("operationId").asText())
                    || CustomFormPolicy.batch(batch.path("form"))) continue;
            if (!hasOutput(batch.path("model").path("projection"))) continue;
            configured = true;
            if (!"SUCCEEDED".equals(batch.path("status").asText())) {
                if ("FAILED".equals(batch.path("status").asText())) failed++; else pending++;
                sources.addAll((ArrayNode) ProductionQualitySummary.metric(mapper, mapper.createArrayNode().add(batch),
                        "outputQuantity", op.path("id").asText(), expectedUnit, null, true, false).path("sources"));
                continue;
            }
            for (JsonNode record : batch.path("records")) {
                JsonNode attributes = record.path("attributes");
                if (!record.path("sources").hasNonNull("outputQuantity")) continue;
                String unit = attributes.path("unit").asText("");
                JsonNode value = attributes.path("outputQuantity");
                boolean valid = value.isNumber() && value.decimalValue().signum() >= 0 && !unit.isBlank()
                        && (expectedUnit == null || !expectedUnit.isBlank() && expectedUnit.equals(unit));
                ObjectNode source = sources.addObject().put("recordId", record.path("id").asText())
                        .put("instanceId", batch.path("instanceId").asText()).put("instanceNo", batch.path("instanceNo").asText())
                        .put("copyId", batch.path("copyId").asText()).put("formStatus", batch.path("formStatus").asText())
                        .put("projectionStatus", batch.path("status").asText())
                        .put("bindingId", record.path("bindingId").asText()).put("rowKey", record.path("rowKey").asText())
                        .put("tableId", record.path("tableId").asText()).put("fieldId", record.path("sources").path("outputQuantity").asText())
                        .put("unit", unit).put("included", valid);
                if (value.isNumber()) source.put("quantity", value.decimalValue().toPlainString());
                if (!valid) { source.put("message", "数量或单位待核对，未计入累计"); rejected++; continue; }
                groups.merge(unit, value.decimalValue(), BigDecimal::add);
            }
        }
        ArrayNode grouped = result.putArray("groups");
        groups.forEach((unit, quantity) -> grouped.addObject().put("unit", unit).put("quantity", quantity.toPlainString()));
        result.put("pending", pending).put("failed", failed).put("rejected", rejected);
        if (groups.size() == 1) {
            var entry = groups.entrySet().iterator().next();
            result.put("quantity", entry.getValue().toPlainString()).put("unit", entry.getKey());
        }
        String status = !configured ? "NOT_CONFIGURED" : rejected > 0 ? "UNIT_REVIEW" : failed > 0 ? "FAILED"
                : pending > 0 ? "PENDING" : groups.isEmpty() ? "NO_DATA" : "READY";
        result.put("status", status).put("message", switch (status) {
            case "NOT_CONFIGURED" -> "未绑定产出数量来源";
            case "UNIT_REVIEW" -> "部分数量或单位待核对，未计入的记录可在来源中查看";
            case "FAILED" -> "部分报工处理失败，累计仅含处理成功的记录";
            case "PENDING" -> "部分报工待处理，累计仅含处理成功的记录";
            case "READY" -> "已知正式报工累计，不代表工序已完工";
            default -> "暂无正式生效的产出报工";
        });
        return result;
    }

    private boolean hasOutput(JsonNode configuration) {
        for (JsonNode binding : configuration.path("bindings"))
            if (binding.path("enabled").asBoolean() && "production".equals(binding.path("modelId").asText())
                    && binding.path("sources").hasNonNull("outputQuantity")) return true;
        return false;
    }

    private ObjectNode empty(String status, String message) {
        return mapper.createObjectNode().put("status", status).put("message", message).putNull("quantity").putNull("unit");
    }

    private JsonNode parse(String value) {
        try { return mapper.readTree(value); } catch (Exception error) { throw invalid("产出来源快照无法读取"); }
    }
}
