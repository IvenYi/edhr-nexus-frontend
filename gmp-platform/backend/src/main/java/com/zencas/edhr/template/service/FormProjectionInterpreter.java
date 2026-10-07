package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/** Shared, side-effect-free interpretation for preview and final projection. */
public final class FormProjectionInterpreter {
    public static final String VERSION = "form-projection-v1";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Map<String, String> ATTRIBUTES = new LinkedHashMap<>();
    static {
        ATTRIBUTES.put("materialLotText", "物料批号（文本查找）");
        ATTRIBUTES.put("serialNumberText", "序列号（文本查找）");
        ATTRIBUTES.put("equipmentText", "设备编号（文本查找）");
        ATTRIBUTES.put("teamText", "责任班组（文本查找）");
        ATTRIBUTES.put("documentNumberText", "关联单据号（文本查找）");
        ATTRIBUTES.put("material", "物料（主数据引用）");
        ATTRIBUTES.put("quantity", "数量");
        ATTRIBUTES.put("goodQuantity", "良品数量");
        ATTRIBUTES.put("ngQuantity", "不良品数量");
        ATTRIBUTES.put("unit", "单位");
        ATTRIBUTES.put("reason", "原因");
        ATTRIBUTES.put("category", "分类");
    }
    private static final Map<String, String> MODELS = Map.of("formTrace", "按内容查找表单", "production", "正式报工", "scrap", "报废记录", "consumption", "实际物料消耗");
    private static final Set<String> NUMBERS = Set.of("quantity", "goodQuantity", "ngQuantity");
    // Stable preset meanings, independent of display names or administrator-created text items.
    public static java.util.List<String> referenceSources(String attributeId) {
        return switch (attributeId) {
            case "equipmentText" -> java.util.List.of("equipment");
            case "serialNumberText" -> java.util.List.of("serialNumber");
            case "lookup_production_batch", "lookup_related_batch" -> java.util.List.of("productionBatch");
            case "lookup_work_order" -> java.util.List.of("workOrder");
            case "lookup_material_code" -> java.util.List.of("material");
            case "lookup_product_code" -> java.util.List.of("product");
            default -> java.util.List.of();
        };
    }
    private static Set<String> allowed(String model) {
        return switch (model) {
            case "formTrace" -> Set.of("materialLotText", "serialNumberText", "equipmentText", "teamText", "documentNumberText");
            case "production" -> Set.of("goodQuantity", "ngQuantity", "unit", "teamText", "documentNumberText");
            case "scrap", "consumption" -> Set.of("material", "materialLotText", "quantity", "unit", "reason", "category", "teamText", "documentNumberText");
            default -> throw invalid("不支持的统计模型");
        };
    }
    private FormProjectionInterpreter() {}

    public static ObjectNode catalog() {
        ObjectNode result = MAPPER.createObjectNode().put("version", VERSION);
        ArrayNode models = result.putArray("models");
        for (String id : java.util.List.of("formTrace", "production", "scrap", "consumption")) {
            ObjectNode model = models.addObject().put("id", id).put("name", MODELS.get(id)).put("version", VERSION);
            ArrayNode attributes = model.putArray("attributes");
            ATTRIBUTES.forEach((key, name) -> { if (allowed(id).contains(key)) attributes.addObject().put("id", key).put("name", name)
                    .put("type", NUMBERS.contains(key) ? "number" : "material".equals(key) ? "reference" : "text"); });
        }
        result.put("notice", "正式记录按工序和用途合计。重复记载表只配置查表用途；文本批号不自动建立实体关系。");
        return result;
    }

    public static JsonNode model(String json) {
        if (json == null || json.isBlank()) return MAPPER.createObjectNode();
        try {
            JsonNode node = MAPPER.readTree(json);
            return node.has("payload") ? node.path("payload") : node;
        } catch (Exception ex) { throw invalid("字段模型格式不正确"); }
    }

    public static void validate(JsonNode model) {
        JsonNode configuration = model.path("projection");
        if (configuration.isMissingNode() || configuration.isNull()) return;
        if (!VERSION.equals(configuration.path("version").asText())) throw invalid("追溯配置版本不受支持");
        if (!configuration.path("bindings").isArray()) throw invalid("追溯用途列表格式不正确");
        Set<String> ids = new HashSet<>();
        Set<String> quantitySources = new HashSet<>();
        for (JsonNode binding : configuration.path("bindings")) {
            String id = required(binding, "id", "用途标识");
            if (!ids.add(id)) throw invalid("用途标识重复：" + id);
            if (!binding.path("enabled").isBoolean()) throw invalid("用途必须明确启用或停用");
            if (!binding.path("enabled").asBoolean()) continue;
            String modelId = binding.path("modelId").asText();
            if (!MODELS.containsKey(modelId)) throw invalid("该统计模型尚未开放，请先确认业务口径");
            String tableId = binding.path("tableId").asText("");
            JsonNode fields = model.path("fields");
            if (!tableId.isBlank()) {
                JsonNode table = field(fields, tableId);
                if (!"subTable".equals(table.path("type").asText())) throw invalid("明细来源不是子表");
                fields = table.path("typeConfig").path("columns");
                JsonNode key = field(fields, required(binding, "rowKeyFieldId", "明细稳定记录键字段"));
                scalar(key);
            }
            JsonNode sources = binding.path("sources");
            if (!sources.isObject() || sources.isEmpty()) throw invalid("请至少选择一个查询属性及来源字段");
            if (!"formTrace".equals(modelId)) {
                if (!sources.hasNonNull("unit")) throw invalid("正式记录必须配置单位来源");
                if ("production".equals(modelId)) {
                    if (!sources.hasNonNull("goodQuantity") && !sources.hasNonNull("ngQuantity")) throw invalid("请配置正式报工数量来源");
                } else if (!sources.hasNonNull("quantity") || !sources.hasNonNull("material") || !sources.hasNonNull("materialLotText"))
                    throw invalid("请配置物料、物料批号及数量来源");
            }
            var entries = sources.fields();
            Set<String> sourceIds = new HashSet<>();
            while (entries.hasNext()) {
                var entry = entries.next();
                boolean lookup = "formTrace".equals(modelId) && entry.getKey().matches("lookup_[A-Za-z0-9_-]{1,56}")
                        && "text".equals(configuration.path("lookupItems").path(entry.getKey()).path("type").asText())
                        && !configuration.path("lookupItems").path(entry.getKey()).path("name").asText().isBlank();
                if (!allowed(modelId).contains(entry.getKey()) && !lookup) throw invalid("不支持的查询属性：" + entry.getKey());
                if (!entry.getValue().isTextual() || !sourceIds.add(entry.getValue().asText())) throw invalid("同一用途不能重复映射同一字段");
                JsonNode source = field(fields, entry.getValue().asText());
                if (NUMBERS.contains(entry.getKey())) {
                    if (!"number".equals(source.path("type").asText())) throw invalid("数量来源必须是数字字段");
                    if (!quantitySources.add(modelId + "/" + tableId + "/" + entry.getValue().asText()))
                        throw invalid("同一数量来源不能重复配置为同一用途的正式记录");
                } else if ("material".equals(entry.getKey())) {
                    if (!"reference".equals(source.path("type").asText()) || !"material".equals(source.path("typeConfig").path("sourceType").asText()))
                        throw invalid("物料来源必须是物料主数据引用字段");
                } else if ("formTrace".equals(modelId) && "reference".equals(source.path("type").asText())) {
                    String sourceType = source.path("typeConfig").path("sourceType").asText();
                    boolean compatible = false;
                    for (JsonNode candidate : configuration.path("lookupItems").path(entry.getKey()).path("referenceSources"))
                        if (sourceType.equals(candidate.asText())) compatible = true;
                    if (!compatible) throw invalid("引用对象与追溯项不匹配：" + entry.getKey());
                } else scalar(source);
            }
        }
    }

    public static ArrayNode preview(JsonNode model, JsonNode values) {
        validate(model);
        if (!values.isObject()) throw invalid("预览填写值必须是对象");
        ArrayNode results = MAPPER.createArrayNode();
        for (JsonNode binding : model.path("projection").path("bindings")) {
            if (!binding.path("enabled").asBoolean()) continue;
            String tableId = binding.path("tableId").asText("");
            if (tableId.isBlank()) {
                append(results, binding, model.path("fields"), values, "form", "");
            } else {
                JsonNode rows = values.path(tableId);
                if (!rows.isArray()) throw invalid("缺少明细数据：" + tableId);
                Set<String> keys = new HashSet<>();
                for (JsonNode row : rows) {
                    String key = scalarValue(row.path(binding.path("rowKeyFieldId").asText()));
                    if (key.isBlank() || !keys.add(key)) throw invalid("明细记录键缺失或重复：" + tableId);
                    append(results, binding, field(model.path("fields"), tableId).path("typeConfig").path("columns"), row, key, tableId);
                }
            }
        }
        return results;
    }

    private static void append(ArrayNode results, JsonNode binding, JsonNode fields, JsonNode values, String rowKey, String tableId) {
        ObjectNode record = MAPPER.createObjectNode().put("bindingId", binding.path("id").asText())
                .put("modelId", binding.path("modelId").asText()).put("rowKey", rowKey).put("tableId", tableId);
        ObjectNode attributes = record.putObject("attributes");
        ObjectNode locations = record.putObject("sources");
        binding.path("sources").fields().forEachRemaining(source -> {
            String fieldId = source.getValue().asText();
            JsonNode raw = values.path(fieldId);
            String key = source.getKey();
            if (NUMBERS.contains(key)) {
                if (!raw.isNumber() || raw.decimalValue().signum() < 0) throw invalid("数量必须填写非负数字：" + fieldId);
                attributes.put(key, raw.decimalValue());
            } else if ("material".equals(key)) {
                if (!raw.isObject() || !raw.path("id").asText().matches("[1-9][0-9]*") || raw.path("name").asText().isBlank())
                    throw invalid("请选择物料主数据：" + fieldId);
                attributes.set(key, raw.deepCopy());
            } else {
                JsonNode sourceField = field(fields, fieldId);
                String value = "reference".equals(sourceField.path("type").asText())
                        ? referenceCode(sourceField, raw) : scalarValue(raw);
                if (!"formTrace".equals(binding.path("modelId").asText()) && Set.of("unit", "materialLotText").contains(key) && value.isBlank())
                    throw invalid("正式记录缺少单位或物料批号：" + fieldId);
                if (!value.isBlank()) attributes.put(key, value);
            }
            locations.put(key, fieldId);
        });
        if (!attributes.isEmpty()) results.add(record);
    }

    private static String referenceCode(JsonNode field, JsonNode value) {
        if (value.isMissingNode() || value.isNull()) return "";
        if (!value.isObject() || !value.path("id").asText().matches("[1-9][0-9]*")
                || !field.path("typeConfig").path("sourceType").asText().equals(value.path("sourceType").asText())
                || !value.path("code").isTextual() || value.path("code").asText().isBlank())
            throw invalid("追溯引用缺少对象身份或编号，请重新选择：" + field.path("id").asText());
        return scalarValue(value.path("code"));
    }

    private static String scalarValue(JsonNode value) {
        if (value.isMissingNode() || value.isNull()) return "";
        if (!value.isTextual()) throw invalid("文本查询来源值类型不正确");
        if (value.asText().length() > 512) throw invalid("查询值不能超过512字符");
        return value.asText().trim();
    }
    private static JsonNode field(JsonNode fields, String id) {
        for (JsonNode field : fields) if (id.equals(field.path("id").asText())) {
            if ("disabled".equals(field.path("status").asText())) throw invalid("来源字段已停用：" + id);
            return field;
        }
        throw invalid("来源字段不存在或不属于同一明细组：" + id);
    }
    private static void scalar(JsonNode field) {
        if (!Set.of("text", "singleSelect").contains(field.path("type").asText()))
            throw invalid("文本查询请选择文本或单选字段：" + field.path("id").asText());
    }
    private static String required(JsonNode node, String key, String label) {
        if (!node.path(key).isTextual() || node.path(key).asText().isBlank() || node.path(key).asText().length() > 128)
            throw invalid(label + "不能为空或超过128字符");
        return node.path(key).asText();
    }
    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
