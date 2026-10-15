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
        ATTRIBUTES.put("outputQuantity", "产出数量");
        ATTRIBUTES.put("ngQuantity", "不良品数量");
        ATTRIBUTES.put("workHours", "投入工时（人时）");
        ATTRIBUTES.put("reportStartTime", "报工开始时间");
        ATTRIBUTES.put("reportEndTime", "报工结束时间");
        ATTRIBUTES.put("productionDate", "生产日期");
        ATTRIBUTES.put("reporter", "报工人");
        ATTRIBUTES.put("unit", "单位");
        ATTRIBUTES.put("reason", "原因");
        ATTRIBUTES.put("category", "分类");
    }
    private static final Map<String, String> MODELS = Map.of("formTrace", "按内容查找表单", "production", "生产报工", "scrap", "报废记录", "consumption", "实际物料消耗");
    private static final Set<String> NUMBERS = Set.of("quantity", "outputQuantity", "goodQuantity", "ngQuantity", "workHours");
    private static final Set<String> TIMES = Set.of("reportStartTime", "reportEndTime");
    private static final Set<String> DICTIONARIES = Set.of("unit", "reason", "category");
    // Stable preset meanings, independent of display names or administrator-created text items.
    public static java.util.List<String> referenceSources(String attributeId) {
        return switch (attributeId) {
            case "equipmentText" -> java.util.List.of("equipment");
            case "serialNumberText" -> java.util.List.of("serialNumber");
            case "lookup_production_batch" -> java.util.List.of("productionBatch", "serialNumber");
            case "lookup_related_batch" -> java.util.List.of("productionBatch");
            case "lookup_work_order" -> java.util.List.of("workOrder");
            case "lookup_material_code" -> java.util.List.of("material");
            case "lookup_product_code" -> java.util.List.of("product");
            default -> java.util.List.of();
        };
    }
    private static Set<String> allowed(String model) {
        return switch (model) {
            case "formTrace" -> Set.of("materialLotText", "serialNumberText", "equipmentText", "teamText", "documentNumberText");
            case "production" -> Set.of("outputQuantity", "goodQuantity", "ngQuantity", "workHours", "reportStartTime", "reportEndTime", "productionDate", "reporter", "unit", "teamText", "documentNumberText");
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
            ATTRIBUTES.forEach((key, name) -> {
                if (!allowed(id).contains(key)) return;
                ObjectNode attribute = attributes.addObject().put("id", key).put("name", name)
                        .put("type", NUMBERS.contains(key) ? "number" : TIMES.contains(key) ? "datetime"
                                : "productionDate".equals(key) ? "date" : "material".equals(key) ? "reference" : "text");
                if (DICTIONARIES.contains(key)) attribute.putArray("referenceSources").add("dictionary");
                if ("reporter".equals(key)) attribute.putArray("referenceSources").add("user");
            });
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
        Map<String, String> quantitySources = new java.util.HashMap<>();
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
                if (binding.hasNonNull("rowKeyFieldId") && !binding.path("rowKeyFieldId").asText().isBlank())
                    scalar(field(fields, binding.path("rowKeyFieldId").asText()));
            }
            JsonNode sources = binding.path("sources");
            if (!sources.isObject() || sources.isEmpty()) throw invalid("请至少选择一个查询属性及来源字段");
            if (!"formTrace".equals(modelId)) {
                if ("production".equals(modelId)) {
                    if (!sources.hasNonNull("outputQuantity") && !sources.hasNonNull("goodQuantity") && !sources.hasNonNull("ngQuantity")) throw invalid("请配置生产报工数量来源");
                } else if (!sources.hasNonNull("quantity") || !sources.hasNonNull("material"))
                    throw invalid("请配置物料及数量来源");
            }
            var entries = sources.fields();
            Set<String> sourceIds = new HashSet<>();
            while (entries.hasNext()) {
                var entry = entries.next();
                boolean lookup = "formTrace".equals(modelId) && entry.getKey().matches("lookup_[A-Za-z0-9_-]{1,56}")
                        && FormLookupValue.TYPES.contains(configuration.path("lookupItems").path(entry.getKey()).path("type").asText())
                        && !configuration.path("lookupItems").path(entry.getKey()).path("name").asText().isBlank();
                if (!allowed(modelId).contains(entry.getKey()) && !lookup) throw invalid("不支持的查询属性：" + entry.getKey());
                if (!entry.getValue().isTextual()) throw invalid("来源字段格式不正确");
                if (!sourceIds.add(entry.getValue().asText())) {
                    Set<String> sharedRoles = new HashSet<>();
                    sources.fields().forEachRemaining(other -> { if (entry.getValue().equals(other.getValue())) sharedRoles.add(other.getKey()); });
                    boolean outputReuse = "production".equals(modelId) && sharedRoles.size() == 2
                            && sharedRoles.contains("outputQuantity") && Set.of("outputQuantity", "goodQuantity", "ngQuantity").containsAll(sharedRoles);
                    if (!outputReuse) throw invalid("同一用途不能重复映射同一字段");
                }
                JsonNode source = field(fields, entry.getValue().asText());
                String lookupType = "formTrace".equals(modelId) ? configuration.path("lookupItems").path(entry.getKey()).path("type").asText("text") : "";
                if ("number".equals(lookupType)) {
                    if (!"number".equals(source.path("type").asText())) throw invalid("数字追溯项请选择数字字段");
                } else if ("date".equals(lookupType)) {
                    if (!"datetime".equals(source.path("type").asText()) || !"date".equals(source.path("typeConfig").path("mode").asText()))
                        throw invalid("日期追溯项请选择日期字段");
                } else if (NUMBERS.contains(entry.getKey())) {
                    if (!"number".equals(source.path("type").asText())) throw invalid(ATTRIBUTES.get(entry.getKey()) + "来源必须是数字字段");
                    String previousBinding = quantitySources.putIfAbsent(modelId + "/" + tableId + "/" + entry.getValue().asText(), id);
                    if (previousBinding != null && !previousBinding.equals(id))
                        throw invalid("同一数量来源不能重复配置为同一用途的正式记录");
                } else if ("material".equals(entry.getKey())) {
                    if (!"reference".equals(source.path("type").asText()) || !"material".equals(source.path("typeConfig").path("sourceType").asText()))
                        throw invalid("物料来源必须是物料主数据引用字段");
                } else if (TIMES.contains(entry.getKey()) || "productionDate".equals(entry.getKey())) {
                    String mode = "productionDate".equals(entry.getKey()) ? "date" : "datetime";
                    if (!"datetime".equals(source.path("type").asText()) || !mode.equals(source.path("typeConfig").path("mode").asText("datetime")))
                        throw invalid(ATTRIBUTES.get(entry.getKey()) + ("date".equals(mode) ? "请选择日期字段" : "请选择包含日期的日期时间字段"));
                } else if ("reporter".equals(entry.getKey())) {
                    if (!"signature".equals(source.path("type").asText()) && !("reference".equals(source.path("type").asText())
                            && "user".equals(source.path("typeConfig").path("sourceType").asText()))) throw invalid("报工人请选择人员引用或签名字段");
                } else if (DICTIONARIES.contains(entry.getKey()) && "reference".equals(source.path("type").asText())
                        && "dictionary".equals(source.path("typeConfig").path("sourceType").asText())) {
                    // Dictionary values are frozen unit codes, not conversion rules.
                } else if ("formTrace".equals(modelId) && "reference".equals(source.path("type").asText())) {
                    String sourceType = source.path("typeConfig").path("sourceType").asText();
                    boolean compatible = false;
                    for (JsonNode candidate : configuration.path("lookupItems").path(entry.getKey()).path("referenceSources"))
                        if (sourceType.equals(candidate.asText())) compatible = true;
                    if (!compatible) throw invalid("引用对象与追溯项不匹配：" + entry.getKey());
                } else scalar(source);
            }
            if (binding.has("detailFieldIds")) {
                if (!binding.path("detailFieldIds").isArray()) throw invalid("明细展示列格式不正确");
                Set<String> detailIds = new HashSet<>();
                for (JsonNode detailId : binding.path("detailFieldIds")) {
                    if (!detailId.isTextual() || !detailIds.add(detailId.asText())) throw invalid("明细展示列不能重复");
                    JsonNode detail = field(fields, detailId.asText());
                    if (!Set.of("text", "number", "singleSelect", "multiSelect", "datetime", "reference").contains(detail.path("type").asText()))
                        throw invalid("该字段不支持明细展示：" + detailId.asText());
                }
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
                    String keyField = binding.path("rowKeyFieldId").asText("");
                    String key = scalarValue(row.path(keyField.isBlank() ? "__rowId" : keyField));
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
                // Optional person-hours are supplied by the user, never derived from the period or people.
                if (!("workHours".equals(key) && (raw.isMissingNode() || raw.isNull() || raw.isTextual() && raw.asText().isBlank()))) {
                    if (!raw.isNumber() || raw.decimalValue().signum() < 0) throw invalid(ATTRIBUTES.get(key) + "必须填写非负数字：" + fieldId);
                    attributes.put(key, raw.decimalValue());
                }
            } else if ("material".equals(key)) {
                if (!raw.isObject() || !raw.path("id").asText().matches("[1-9][0-9]*") || raw.path("name").asText().isBlank())
                    throw invalid("请选择物料主数据：" + fieldId);
                attributes.set(key, raw.deepCopy());
            } else if ("reporter".equals(key) && "signature".equals(field(fields, fieldId).path("type").asText())) {
                if (!raw.isMissingNode() && !raw.isNull() && !(raw.isTextual() && raw.asText().isBlank())) {
                    if (!raw.isObject() || !"signature".equals(raw.path("type").asText())
                            || !raw.path("signerId").asText().matches("[1-9][0-9]*") || raw.path("signerName").asText().isBlank()
                            || !raw.path("signatureId").asText().matches("[1-9][0-9]*")) throw invalid("报工人来源缺少有效签署人信息：" + fieldId);
                    attributes.put(key, raw.path("signerId").asText());
                    attributes.put(key + "Id", raw.path("signerId").asText());
                    attributes.put(key + "Label", raw.path("signerName").asText());
                }
            } else {
                JsonNode sourceField = field(fields, fieldId);
                String value;
                if ("formTrace".equals(binding.path("modelId").asText()) && "number".equals(sourceField.path("type").asText())) {
                    if (raw.isMissingNode() || raw.isNull() || raw.isTextual() && raw.asText().isBlank()) value = "";
                    else {
                        value = raw.isNumber() ? FormLookupValue.number(raw.asText()) : null;
                        if (value == null) throw invalid("追溯数字格式不正确：" + fieldId);
                    }
                } else value = "reference".equals(sourceField.path("type").asText()) ? referenceCode(sourceField, raw) : scalarValue(raw);
                if (!value.isBlank()) {
                    if ("formTrace".equals(binding.path("modelId").asText())) {
                        if ("datetime".equals(sourceField.path("type").asText())) {
                            String date = FormLookupValue.date(value);
                            if (date == null) throw invalid("追溯日期格式不正确：" + fieldId);
                            value = date;
                        }
                    }
                    if (TIMES.contains(key) || "productionDate".equals(key)) {
                        try {
                            value = TIMES.contains(key) ? java.time.LocalDateTime.parse(value).toString() : java.time.LocalDate.parse(value).toString();
                        } catch (java.time.format.DateTimeParseException ex) { throw invalid(ATTRIBUTES.get(key) + "格式不正确：" + fieldId); }
                    }
                    attributes.put(key, value);
                    if (DICTIONARIES.contains(key) || "reporter".equals(key)) {
                        if ("reference".equals(sourceField.path("type").asText())) {
                            attributes.put(key + "Label", raw.path("name").asText(value));
                            attributes.put(key + "Id", raw.path("id").asText());
                        }
                        else if ("singleSelect".equals(sourceField.path("type").asText()) && sourceField.path("typeConfig").path("options").isArray())
                            for (JsonNode option : sourceField.path("typeConfig").path("options"))
                                if (value.equals(option.path("value").asText())) { attributes.put(key + "Label", option.path("label").asText(value)); break; }
                    }
                }
            }
            locations.put(key, fieldId);
        });
        if (attributes.has("reportStartTime") && attributes.has("reportEndTime")
                && java.time.LocalDateTime.parse(attributes.path("reportEndTime").asText()).isBefore(java.time.LocalDateTime.parse(attributes.path("reportStartTime").asText())))
            throw invalid("报工结束时间不能早于开始时间");
        ArrayNode details = record.putArray("details");
        for (JsonNode detailId : binding.path("detailFieldIds")) {
            JsonNode detailField = field(fields, detailId.asText());
            ObjectNode detail = details.addObject().put("fieldId", detailId.asText()).put("name", detailField.path("name").asText());
            detail.set("value", values.path(detailId.asText()).isMissingNode() ? MAPPER.nullNode() : values.path(detailId.asText()).deepCopy());
        }
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
