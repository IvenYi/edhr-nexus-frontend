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
        for (JsonNode field : fields) {
            if ("reference".equals(field.path("type").asText())) {
                List<JsonNode> widgets = new ArrayList<>();
                collect(canvas, field.path("id").asText(), tableId, widgets);
                ObjectNode config = ((ObjectNode) field).withObject("/typeConfig");
                ObjectNode previous = null;
                for (JsonNode widget : widgets) {
                    ObjectNode next = config.deepCopy();
                    if (widget.has("referenceSourceType")) next.set("sourceType", widget.get("referenceSourceType"));
                    for (String key : List.of("referenceField", "referenceQueryConditions")) if (widget.has(key)) next.set(key, widget.get(key));
                    if (previous != null && !previous.equals(next)) throw FormReferenceLookup.invalid("同一引用字段的多个控件配置不一致，请统一配置");
                    previous = next;
                }
                if (previous != null) ((ObjectNode) field).set("typeConfig", previous);
            }
            resolveFields(field.path("typeConfig").path("columns"), canvas, field.path("id").asText());
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
