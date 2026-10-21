package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.*;

/** Reads legacy node settings only from the same frozen form, never the live template. */
public final class FormReferenceConfig {
    private FormReferenceConfig() {}

    public static JsonNode fields(JsonNode form, ObjectMapper mapper) {
        JsonNode fields = form.path("fields").deepCopy();
        JsonNode canvas = form.path("canvas");
        if (canvas.isTextual()) {
            try { canvas = mapper.readTree(canvas.asText()); }
            catch (Exception e) { throw FormReferenceLookup.invalid("表单引用配置无法解析，请检查模板版本"); }
        }
        resolveFields(fields, canvas, "");
        return fields;
    }

    private static void resolveFields(JsonNode fields, JsonNode canvas, String tableId) {
        resolveFields(fields, canvas, tableId, false);
    }

    private static void resolveFields(JsonNode fields, JsonNode canvas, String tableId, boolean activeOnly) {
        for (JsonNode field : fields) {
            if (activeOnly && "disabled".equals(field.path("status").asText())) continue;
            if ("reference".equals(field.path("type").asText())) {
                List<JsonNode> widgets = new ArrayList<>();
                collect(canvas, field.path("id").asText(), tableId, widgets);
                ObjectNode config = ((ObjectNode) field).withObject("/typeConfig");
                ObjectNode previous = null;
                for (JsonNode widget : widgets) {
                    ObjectNode next = config.deepCopy();
                    if (widget.has("referenceSourceType")) next.set("sourceType", widget.get("referenceSourceType"));
                    for (String key : List.of("referenceField", "referenceDisplayFields", "referenceSearchFields", "referenceContextAutofill", "referenceQueryConditions", "referenceDictionaryId", "referenceMaterialScope", "referenceMaterialTypeIds", "referenceProductionScope")) if (widget.has(key)) next.set(key, widget.get(key));
                    if (previous != null && !previous.equals(next)) throw FormReferenceLookup.invalid("同一引用字段的多个控件配置不一致，请统一配置");
                    previous = next;
                }
                if (previous != null) ((ObjectNode) field).set("typeConfig", previous);
            }
            resolveFields(field.path("typeConfig").path("columns"), canvas, field.path("id").asText(), activeOnly);
        }
    }

    /** Validate the combined candidate design before mutating its persisted version or audit. */
    public static void validateDesignConditions(String modelJson, String canvasJson, ObjectMapper mapper) {
        try {
            JsonNode root = modelJson == null || modelJson.isBlank() ? mapper.createObjectNode() : mapper.readTree(modelJson);
            JsonNode model = root.has("payload") ? root.path("payload") : root;
            ObjectNode form = mapper.createObjectNode();
            form.set("fields", model.path("fields"));
            if (canvasJson != null && !canvasJson.isBlank()) form.set("canvas", mapper.readTree(canvasJson));
            JsonNode fields = form.path("fields").deepCopy();
            resolveFields(fields, form.path("canvas"), "", true);
            validateConditions(fields, fields, List.of());
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw FormReferenceLookup.invalid("表单引用配置无法解析，请检查模板版本");
        }
    }

    private static void validateConditions(JsonNode fields, JsonNode mainFields, List<JsonNode> rowFields) {
        for (JsonNode field : fields) {
            if ("disabled".equals(field.path("status").asText())) continue;
            JsonNode config = field.path("typeConfig");
            if ("reference".equals(field.path("type").asText())) {
                JsonNode conditions = config.path("referenceQueryConditions");
                if (!conditions.isMissingNode() && !conditions.isNull() && !conditions.isArray()) throw FormReferenceLookup.invalid("引用查询条件格式不正确");
                for (JsonNode condition : conditions) {
                    String source = condition.path("sourceField").asText();
                    String target = condition.path("targetFieldId").asText();
                    if (source.isBlank() && target.isBlank()) continue;
                    if (source.isBlank() || target.isBlank()) throw FormReferenceLookup.invalid("请完整配置引用查询条件");
                    if (!FormReferenceLookup.sourceFields(config).contains(source)) throw FormReferenceLookup.invalid("引用查询条件属性不适用于当前引用范围：" + source);
                    if (!Set.of("eq", "ne", "contains", "notContains").contains(condition.path("operator").asText("eq"))) throw FormReferenceLookup.invalid("引用查询条件运算符不支持");
                    JsonNode dependency = null;
                    for (JsonNode candidate : mainFields) if (target.equals(candidate.path("id").asText())) dependency = candidate;
                    for (JsonNode candidate : rowFields) if (target.equals(candidate.path("id").asText())) dependency = candidate;
                    if (dependency == null || target.equals(field.path("id").asText()) || !"enabled".equals(dependency.path("status").asText())
                            || !Set.of("text", "number", "datetime", "singleSelect", "reference").contains(dependency.path("type").asText()))
                        throw FormReferenceLookup.invalid("引用查询条件的当前表单字段已失效，请修正或移除条件：" + target);
                    if (Set.of("reference", "singleSelect").contains(dependency.path("type").asText()) && dependency.path("typeConfig").path("multiple").asBoolean())
                        throw FormReferenceLookup.invalid("引用查询条件只支持单值字段：" + target);
                }
            }
            JsonNode columns = config.path("columns");
            List<JsonNode> nextRow = new ArrayList<>();
            columns.forEach(nextRow::add);
            validateConditions(columns, mainFields, nextRow);
        }
    }

    private static void collect(JsonNode node, String id, String tableId, List<JsonNode> widgets) {
        if (node.isObject() && node.path("bindings").isObject()) {
            JsonNode binding = node.path("bindings");
            String boundId = binding.path("subTableFieldId").asText(binding.path("fieldId").asText());
            if (id.equals(boundId) && tableId.equals(binding.path("subTableId").asText()) && binding.path("widgetConfig").isObject()) widgets.add(binding.path("widgetConfig"));
        }
        if (node.isContainerNode()) for (JsonNode child : node) collect(child, id, tableId, widgets);
    }
}
