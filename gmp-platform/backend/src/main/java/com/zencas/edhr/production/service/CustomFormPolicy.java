package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;

/** Scope is independent of the operation that originally attached the form. */
final class CustomFormPolicy {
    private CustomFormPolicy() {}

    static boolean custom(JsonNode form) { return "CUSTOM".equals(form.path("sourceType").asText()); }
    static boolean batch(JsonNode form) { return custom(form) && "BATCH".equals(form.path("scope").asText()); }
    static boolean scoped(JsonNode form) { return custom(form) && form.hasNonNull("scope"); }
    static boolean required(JsonNode form) { return form.path("completionRequired").asBoolean(form.path("required").asBoolean(true)); }
    static boolean editable(JsonNode form, JsonNode operation) {
        String status = operation.path("status").asText();
        return "IN_PROGRESS".equals(status) || (custom(form) && "COMPLETED".equals(status));
    }

    static List<String> incomplete(JsonNode snapshot, JsonNode state, boolean batchGateOnly) {
        List<String> issues = new ArrayList<>();
        for (JsonNode op : snapshot.path("operations")) for (JsonNode form : op.path("forms")) {
            if (!custom(form) || (batchGateOnly && (!batch(form) || !required(form)))) continue;
            JsonNode current = state.path("operations").path(op.path("id").asText());
            if (ExecutionFormCopies.ids(current, form.path("id").asText()).isEmpty())
                issues.add("表单「" + form.path("name").asText() + "」尚未填报");
            else issues.addAll(ExecutionFormCopies.incomplete(current, form));
        }
        return issues;
    }
}
