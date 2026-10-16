package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.template.service.FormProjectionInterpreter;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/** Independent measures over one complete source set. Never derives output from quality measures. */
final class ProductionQualitySummary {
    private ProductionQualitySummary() {}

    static boolean configured(JsonNode forms, String role) {
        for (JsonNode form : forms) for (JsonNode binding : form.path("projection").path("bindings"))
            if (binding.path("enabled").asBoolean() && model(role).equals(binding.path("modelId").asText())
                    && binding.path("sources").hasNonNull(role.equals("scrapQuantity") ? "quantity" : role)) return true;
        return false;
    }

    static ObjectNode metric(ObjectMapper mapper, JsonNode batches, String role, String operationId,
                             String expectedUnit, String productId, boolean configured, boolean saved) {
        String field = role.equals("scrapQuantity") ? "quantity" : role;
        ObjectNode result = mapper.createObjectNode().putNull("quantity").putNull("unit");
        ArrayNode sources = result.putArray("sources");
        Map<String, ObjectNode> groups = new LinkedHashMap<>();
        int pending = 0, failed = 0, rejected = 0;
        for (JsonNode batch : batches) {
            if (operationId != null && (!operationId.equals(batch.path("operationId").asText()) || CustomFormPolicy.batch(batch.path("form")))) continue;
            JsonNode records = batch.path("records");
            boolean success = "SUCCEEDED".equals(batch.path("status").asText());
            if (!success) {
                if (!configured(batch.path("model").path("fields").isArray()
                        ? mapper.createArrayNode().add(batch.path("model")) : mapper.createArrayNode(), role)) continue;
                configured = true;
                records = FormProjectionInterpreter.preview(batch.path("model"), batch.path("values"));
            }
            for (JsonNode record : records) {
                if (!model(role).equals(record.path("modelId").asText()) || !record.path("sources").hasNonNull(field)) continue;
                configured = true;
                JsonNode attributes = record.path("attributes");
                JsonNode material = attributes.path("material");
                String unit = attributes.path("unit").asText("");
                ObjectNode source = sources.addObject().put("recordId", record.path("id").asText(batch.path("instanceId").asText() + ":" + record.path("bindingId").asText() + ":" + record.path("rowKey").asText()))
                        .put("instanceId", batch.path("instanceId").asText()).put("instanceNo", batch.path("instanceNo").asText())
                        .put("copyId", batch.path("copyId").asText()).put("formStatus", batch.path("formStatus").asText())
                        .put("projectionStatus", saved ? "" : batch.path("status").asText())
                        .put("operationId", batch.path("operationId").asText()).put("operationName", batch.path("operationName").asText())
                        .put("bindingId", record.path("bindingId").asText()).put("rowKey", record.path("rowKey").asText())
                        .put("tableId", record.path("tableId").asText()).put("fieldId", record.path("sources").path(field).asText())
                        .put("unit", unit).put("included", false).put("materialName", material.path("name").asText())
                        .put("materialCode", material.path("code").asText()).put("currentMaterialType", record.path("currentMaterialType").asText());
                source.set("attributes", attributes.deepCopy());
                source.set("details", record.path("details").deepCopy());
                sourcePosition(source, batch, record);
                BigDecimal quantity = number(attributes.path(field));
                if (quantity != null) source.put("quantity", quantity.toPlainString());
                if (productId != null && !productId.isBlank() && !material.path("id").asText().isBlank() && !productId.equals(material.path("id").asText())) {
                    source.put("message", "其他物料，不计入本批产品报废"); continue;
                }
                if (!success) { if ("FAILED".equals(batch.path("status").asText())) failed++; else pending++; }
                String issue = !success ? "FAILED".equals(batch.path("status").asText()) ? "正式统计处理失败" : "正式统计待处理"
                        : role.equals("scrapQuantity") && (material.path("id").asText().isBlank() || productId != null && productId.isBlank()) ? "物料身份未记录，待核对"
                        : quantity == null ? "数量未记录或无效"
                        : unit.isBlank() ? "单位未填写，待核对"
                        : expectedUnit != null && (expectedUnit.isBlank() || !expectedUnit.equals(unit)) ? "单位与冻结产品单位不一致，待核对" : null;
                if (issue != null) { source.put("message", issue); if (success && (quantity != null || attributes.hasNonNull(field) && !attributes.path(field).asText().isBlank())) rejected++; continue; }
                source.put("included", true).put("message", saved ? "已保存过程参考" : "已计入");
                String key = (role.equals("scrapQuantity") ? material.path("id").asText() : "") + "/" + unit;
                ObjectNode group = groups.computeIfAbsent(key, ignored -> mapper.createObjectNode().put("quantity", "0").put("unit", unit)
                        .put("materialId", material.path("id").asText()).put("materialName", material.path("name").asText()).put("materialCode", material.path("code").asText()));
                group.put("quantity", new BigDecimal(group.path("quantity").asText()).add(quantity).toPlainString());
            }
        }
        ArrayNode grouped = result.putArray("groups"); groups.values().forEach(grouped::add);
        if (groups.size() == 1) { var group = groups.values().iterator().next(); result.put("quantity", group.path("quantity").asText()).put("unit", group.path("unit").asText()); }
        String status = !configured ? "NOT_CONFIGURED" : rejected > 0 ? "UNIT_REVIEW" : failed > 0 ? "FAILED" : pending > 0 ? "PENDING" : groups.isEmpty() ? "NO_DATA" : "READY";
        return result.put("status", status).put("pending", pending).put("failed", failed).put("rejected", rejected).put("message", switch (status) {
            case "NOT_CONFIGURED" -> "未配置此项业务数量来源";
            case "UNIT_REVIEW" -> "部分记录待核对，仅累计数量与单位明确的来源";
            case "FAILED" -> "部分正式统计处理失败，仅累计成功来源";
            case "PENDING" -> "部分正式统计待处理，仅累计成功来源";
            case "READY" -> saved ? "已保存过程参考，不代表正式统计" : "已知正式记录累计，不代表剩余库存或处置完成";
            default -> "未采集到可计入的数量，不代表实际为零";
        });
    }

    static String model(String role) { return role.equals("scrapQuantity") ? "scrap" : "production"; }
    private static void sourcePosition(ObjectNode source, JsonNode batch, JsonNode record) {
        JsonNode fields = batch.path("model").path("fields");
        String tableId = record.path("tableId").asText();
        if (!tableId.isBlank()) {
            JsonNode table = field(fields, tableId);
            source.put("tableName", table.path("name").asText("子表明细"));
            fields = table.path("typeConfig").path("columns");
            String keyField = "__rowId";
            for (JsonNode binding : batch.path("model").path("projection").path("bindings"))
                if (binding.path("id").asText().equals(record.path("bindingId").asText()) && !binding.path("rowKeyFieldId").asText().isBlank()) keyField = binding.path("rowKeyFieldId").asText();
            int index = 0;
            for (JsonNode row : batch.path("values").path(tableId)) {
                index++;
                if (row.path(keyField).asText().equals(record.path("rowKey").asText())) source.put("rowLabel", "第" + index + "行");
            }
        }
        source.put("fieldName", field(fields, source.path("fieldId").asText()).path("name").asText());
    }
    private static JsonNode field(JsonNode fields, String id) {
        for (JsonNode field : fields) if (id.equals(field.path("id").asText())) return field;
        return com.fasterxml.jackson.databind.node.MissingNode.getInstance();
    }
    private static BigDecimal number(JsonNode value) {
        try { if (value.isMissingNode() || value.isNull() || value.asText().isBlank()) return null;
            BigDecimal number = new BigDecimal(value.asText()); return number.signum() < 0 ? null : number;
        } catch (NumberFormatException error) { return null; }
    }
}
