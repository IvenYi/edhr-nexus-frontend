package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/** Saved values only: no completion event, projection write or implied product unit. */
final class ExecutionQualitySummary {
    private ExecutionQualitySummary() {}

    static ObjectNode project(ObjectMapper mapper, JsonNode operation, JsonNode state) {
        ArrayNode batches = mapper.createArrayNode();
        for (JsonNode form : operation.path("forms")) {
            if (CustomFormPolicy.batch(form)) continue;
            var copies = ExecutionFormCopies.ids(state, form.path("id").asText());
            for (int index = 0; index < copies.size(); index++) {
                String copy = copies.get(index);
                JsonNode formState = state.path("forms").path(copy);
                JsonNode values = formState.path("values");
                ObjectNode batch = batches.addObject().put("instanceId", copy).put("instanceNo", form.path("name").asText() + " · 第" + (index + 1) + "份")
                        .put("copyId", copy).put("formStatus", formState.path("status").asText())
                        .put("operationId", operation.path("id").asText()).put("operationName", operation.path("name").asText()).put("status", "SUCCEEDED");
                batch.set("form", form); batch.set("model", form); batch.set("values", values); ArrayNode records = batch.putArray("records");
                boolean modern = false;
                for (JsonNode binding : form.path("projection").path("bindings")) {
                    if (!binding.path("enabled").asBoolean() || !java.util.Set.of("production", "scrap").contains(binding.path("modelId").asText())) continue;
                    modern = true;
                    String table = binding.path("tableId").asText();
                    if (table.isBlank()) append(records, binding, values, "form", "");
                    else if (values.path(table).isArray()) for (JsonNode row : values.path(table)) {
                        String key = binding.path("rowKeyFieldId").asText("__rowId");
                        append(records, binding, row, row.path(key.isBlank() ? "__rowId" : key).asText(), table);
                    }
                }
                if (!modern) legacy(mapper, records, form.path("fields"), values);
            }
        }
        ObjectNode result = mapper.createObjectNode();
        for (String role : java.util.List.of("outputQuantity", "goodQuantity", "ngQuantity", "scrapQuantity"))
            result.set(role, ProductionQualitySummary.metric(mapper, batches, role, operation.path("id").asText(), null, null,
                    ProductionQualitySummary.configured(operation.path("forms"), role), true));
        return result;
    }

    private static void append(ArrayNode records, JsonNode binding, JsonNode values, String row, String table) {
        ObjectNode record = records.addObject().put("modelId", binding.path("modelId").asText()).put("bindingId", binding.path("id").asText()).put("rowKey", row).put("tableId", table);
        ObjectNode attributes = record.putObject("attributes"); record.set("sources", binding.path("sources"));
        binding.path("sources").fields().forEachRemaining(source -> {
            JsonNode raw = values.path(source.getValue().asText());
            if (raw.isMissingNode() || raw.isNull()) return;
            if (raw.isObject() && !source.getKey().equals("material")) attributes.put(source.getKey(), raw.path("code").asText(raw.path("name").asText()));
            else attributes.set(source.getKey(), raw);
        });
    }

    private static void legacy(ObjectMapper mapper, ArrayNode records, JsonNode fields, JsonNode values) {
        for (JsonNode field : fields) {
            if ("disabled".equals(field.path("status").asText())) continue;
            String role = switch (field.path("typeConfig").path("businessPurpose").asText()) {
                case "PRODUCTION_GOOD" -> "goodQuantity";
                case "PRODUCTION_NG" -> "ngQuantity";
                case "PRODUCTION_SCRAP" -> "quantity";
                default -> "";
            };
            if (!role.isBlank()) {
                ObjectNode binding = mapper.createObjectNode().put("id", "legacy:" + field.path("id").asText()).put("modelId", role.equals("quantity") ? "scrap" : "production");
                binding.putObject("sources").put(role, field.path("id").asText()); append(records, binding, values, "form", "");
            }
            if ("subTable".equals(field.path("type").asText()) && values.path(field.path("id").asText()).isArray())
                for (JsonNode row : values.path(field.path("id").asText())) legacy(mapper, records, field.path("typeConfig").path("columns"), row);
        }
    }
}
