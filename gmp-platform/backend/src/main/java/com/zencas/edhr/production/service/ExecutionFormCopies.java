package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.List;

/** Keeps existing single-form state and evidence identifiers readable without rewriting history. */
final class ExecutionFormCopies {
    private ExecutionFormCopies() {}

    static List<String> ids(JsonNode operationState, String formId) {
        JsonNode group = operationState.path("formGroups").path(formId);
        List<String> result = new ArrayList<>();
        if (group.has("instanceIds")) group.path("instanceIds").forEach(id -> result.add(id.asText()));
        else if (operationState.path("forms").has(formId)) result.add(formId);
        return result;
    }

    static boolean ended(JsonNode state, String formId) {
        JsonNode group = state.path("formGroups").path(formId);
        return group.isObject() ? group.path("ended").asBoolean() : "COMPLETED".equals(state.path("forms").path(formId).path("status").asText());
    }

    static ObjectNode ensureGroup(ObjectNode state, String formId) {
        ObjectNode groups = state.withObject("/formGroups");
        if (!groups.has(formId)) {
            List<String> existing = ids(state, formId);
            boolean ended = ended(state, formId);
            ObjectNode group = groups.putObject(formId).put("ended", ended);
            existing.forEach(group.putArray("instanceIds")::add);
        }
        return (ObjectNode) groups.path(formId);
    }

    static boolean required(JsonNode op, JsonNode form) {
        if (!form.has("workId")) return form.path("required").asBoolean(true);
        boolean linked = false;
        for (JsonNode direct : op.path("forms")) {
            if (!form.path("id").asText().equals(direct.path("fulfilledBy").asText())) continue;
            linked = true;
            if (direct.path("required").asBoolean(true)) return true;
        }
        return !linked || form.path("required").asBoolean(false);
    }

    static List<String> incomplete(JsonNode state, JsonNode form) {
        List<String> result = new ArrayList<>();
        List<String> ids = ids(state, form.path("id").asText());
        for (int index = 0; index < ids.size(); index++) {
            if (!"COMPLETED".equals(state.path("forms").path(ids.get(index)).path("status").asText()))
                result.add("表单「" + form.path("name").asText() + "」第 " + (index + 1) + " 份未完成");
        }
        return result;
    }

    static String status(JsonNode state, String formId) {
        List<String> ids = ids(state, formId);
        if (ids.isEmpty()) return "PENDING";
        return ids.stream().allMatch(id -> "COMPLETED".equals(state.path("forms").path(id).path("status").asText())) ? "COMPLETED" : "IN_PROGRESS";
    }
}
