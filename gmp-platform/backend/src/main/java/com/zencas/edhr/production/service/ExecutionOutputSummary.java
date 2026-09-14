package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.MissingNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.Set;

/** Read-only projection of explicitly marked fields from frozen execution forms. */
final class ExecutionOutputSummary {
    private enum Purpose {
        PRODUCTION_GOOD("良品", "goodQuantity"), PRODUCTION_NG("不良品", "ngQuantity"), PRODUCTION_SCRAP("报废", "scrapQuantity");
        final String label;
        final String key;
        Purpose(String label, String key) { this.label = label; this.key = key; }
    }

    private final Set<Purpose> mapped = EnumSet.noneOf(Purpose.class);
    private final EnumMap<Purpose, BigDecimal> quantities = new EnumMap<>(Purpose.class);
    private final Set<String> pending = new LinkedHashSet<>();
    private final Set<String> invalid = new LinkedHashSet<>();

    static ObjectNode project(ObjectMapper mapper, JsonNode operation, JsonNode state) {
        ExecutionOutputSummary summary = new ExecutionOutputSummary();
        for (JsonNode form : operation.path("forms")) {
            if (!form.path("fulfilledBy").asText("").isBlank()) continue;
            summary.collect(form.path("fields"), state.path("forms").path(form.path("id").asText()).path("values"), form.path("name").asText());
        }
        ObjectNode result = mapper.createObjectNode();
        for (Purpose purpose : Purpose.values()) result.putNull(purpose.key);
        result.putNull("outputQuantity");
        if (!summary.invalid.isEmpty()) return result.put("status", "INVALID").put("message", String.join("；", summary.invalid));
        Set<String> missing = new LinkedHashSet<>();
        for (Purpose purpose : Purpose.values()) if (!summary.mapped.contains(purpose)) missing.add(purpose.label);
        if (!missing.isEmpty()) return result.put("status", "NOT_CONFIGURED").put("message", "请在表单数字字段中配置业务用途：" + String.join("、", missing));
        if (!summary.pending.isEmpty()) return result.put("status", "PENDING").put("message", "请填写并保存产出数量：" + String.join("、", summary.pending));
        BigDecimal total = BigDecimal.ZERO;
        for (Purpose purpose : Purpose.values()) {
            BigDecimal quantity = summary.quantities.getOrDefault(purpose, BigDecimal.ZERO);
            result.put(purpose.key, quantity.stripTrailingZeros().toPlainString());
            total = total.add(quantity);
        }
        return result.put("status", "READY").put("message", "按当前工序表单已保存的良品、不良品和报废数量汇总")
                .put("outputQuantity", total.stripTrailingZeros().toPlainString());
    }

    private void collect(JsonNode fields, JsonNode values, String prefix) {
        for (JsonNode field : fields) {
            if ("disabled".equals(field.path("status").asText())) continue;
            String name = prefix + " / " + field.path("name").asText(field.path("id").asText());
            JsonNode config = field.path("typeConfig");
            JsonNode value = values.path(field.path("id").asText());
            String purposeKey = config.path("businessPurpose").asText("");
            if (!purposeKey.isBlank()) {
                Purpose purpose;
                try { purpose = Purpose.valueOf(purposeKey); }
                catch (IllegalArgumentException error) { invalid.add(name + "的业务用途不受支持"); continue; }
                mapped.add(purpose);
                if (!"number".equals(field.path("type").asText())) { invalid.add(name + "的产出用途必须绑定数字字段"); continue; }
                if (value.isMissingNode() || value.isNull() || (value.isTextual() && value.asText().isBlank())) {
                    pending.add(name); continue;
                }
                try {
                    if (!value.isNumber() && !value.isTextual()) throw new NumberFormatException();
                    BigDecimal number = new BigDecimal(value.asText().trim());
                    if (number.signum() < 0 || number.precision() > 64 || Math.abs((long) number.scale()) > 16) throw new NumberFormatException();
                    quantities.merge(purpose, number, BigDecimal::add);
                } catch (NumberFormatException error) { invalid.add(name + "必须为有效的非负数量"); }
            }
            if ("subTable".equals(field.path("type").asText())) {
                if (value.isArray() && !value.isEmpty()) {
                    for (JsonNode row : value) collect(config.path("columns"), row, name);
                } else {
                    collect(config.path("columns"), MissingNode.getInstance(), name);
                }
            }
        }
    }
}
