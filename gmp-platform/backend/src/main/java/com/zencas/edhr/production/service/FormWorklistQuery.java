package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.util.MultiValueMap;
import java.time.LocalDateTime;
import java.util.*;
import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Validated filters shared by personal list and scoped detail; all comparisons narrow the authorized set. */
final class FormWorklistQuery {
    final Map<String, String> values = new LinkedHashMap<>();
    final Set<String> statuses;
    final int page, size;
    private static final Set<String> EXACT = Set.of("instanceNo", "templateId", "templateVersionId", "templateCode", "productionObjectId",
        "workOrderId", "productionObjectType", "operationId", "formId", "copyId", "nodeId", "creatorId", "saved");
    private static final Set<String> CONTAINS = Set.of("instanceNoContains", "templateName", "productionObjectNo", "workOrderNo", "nodeName");
    private static final Set<String> SPECIAL = Set.of("page", "size", "keyword", "recordStatus", "reviewResult", "createdFrom", "createdTo",
        "updatedFrom", "updatedTo", "submittedFrom", "submittedTo", "reviewedFrom", "reviewedTo", "arrivedFrom", "arrivedTo");
    FormWorklistQuery(String view, MultiValueMap<String, String> query) {
        query.forEach((key, list) -> {
            if (!EXACT.contains(key) && !CONTAINS.contains(key) && !SPECIAL.contains(key)) throw invalid("不支持的查询参数：" + key);
            if (!key.equals("recordStatus") && list.size() != 1) throw invalid("参数不能重复：" + key);
            for (String value : list) if (value == null || value.isBlank() || value.length() > 512) throw invalid("参数不能为空或超过512字符：" + key);
            values.put(key, list.getFirst().trim());
        });
        statuses = new HashSet<>(query.getOrDefault("recordStatus", List.of()).stream().map(String::trim).toList());
        if (!Set.of("ACTIVE", "COMPLETED").containsAll(statuses)) throw invalid("不支持的表单状态");
        page = number("page", 0, 0, Integer.MAX_VALUE); size = number("size", 20, 1, 200);
        for (String id : List.of("templateId", "templateVersionId", "productionObjectId", "workOrderId"))
            if (values.containsKey(id)) FormInstanceQueryService.positiveId(values.get(id));
        if (values.containsKey("instanceNo") && values.containsKey("instanceNoContains")) throw invalid("实例号精确与模糊条件互斥");
        if (values.containsKey("saved") && !Set.of("true", "false").contains(values.get("saved"))) throw invalid("saved 必须为 true 或 false");
        if (values.containsKey("productionObjectType") && !Set.of("BATCH", "SN").contains(values.get("productionObjectType"))) throw invalid("生产对象类型必须为 BATCH 或 SN");
        if (values.containsKey("reviewResult") && (!view.equals("REVIEW_DONE") || !Set.of("APPROVE", "RETURN").contains(values.get("reviewResult")))) throw invalid("审核结果仅适用于 REVIEW_DONE，取 APPROVE 或 RETURN");
        for (String prefix : List.of("created", "updated", "submitted", "reviewed", "arrived")) {
            String from = values.get(prefix + "From"), to = values.get(prefix + "To");
            if (from == null && to == null) continue;
            if (prefix.equals("submitted") && !view.equals("FILLED") || prefix.equals("reviewed") && !view.equals("REVIEW_DONE")
                || prefix.equals("arrived") && !Set.of("FILLABLE", "REVIEW_PENDING").contains(view)) throw invalid("时间条件不适用于当前页签：" + prefix);
            try {
                if (from != null) LocalDateTime.parse(from);
                if (to != null) LocalDateTime.parse(to);
                if (from != null && to != null && !LocalDateTime.parse(from).isBefore(LocalDateTime.parse(to))) throw invalid("时间区间起点必须早于终点");
            } catch (java.time.format.DateTimeParseException e) { throw invalid("时间必须为不附带时区的来源本地ISO日期时间"); }
        }
    }
    boolean matches(JsonNode row) {
        for (String key : EXACT) if (values.containsKey(key) && (!row.hasNonNull(key) || !values.get(key).equals(row.path(key).asText()))) return false;
        for (String key : CONTAINS) if (values.containsKey(key)) {
            JsonNode value = row.path(key.equals("instanceNoContains") ? "instanceNo" : key);
            if (value.isNull() || value.isMissingNode() || !value.asText().contains(values.get(key))) return false;
        }
        if (!statuses.isEmpty() && !statuses.contains(row.path("recordStatus").asText())) return false;
        for (String prefix : List.of("created", "updated", "arrived")) if (!inRange(prefix, row.path(prefix + "At").asText(null))) return false;
        String keyword = values.get("keyword");
        return keyword == null || List.of("instanceNo", "templateName", "templateCode", "productionObjectNo", "workOrderNo").stream()
            .anyMatch(key -> row.hasNonNull(key) && row.path(key).asText().contains(keyword));
    }
    boolean matchesEventNode(JsonNode event) {
        return (!values.containsKey("nodeId") || values.get("nodeId").equals(event.path("nodeId").asText(null)))
            && (!values.containsKey("nodeName") || event.hasNonNull("nodeName") && event.path("nodeName").asText().contains(values.get("nodeName")));
    }
    boolean inRange(String prefix, String value) {
        String from = values.get(prefix + "From"), to = values.get(prefix + "To");
        if (from == null && to == null) return true;
        if (value == null || value.isBlank()) return false;
        LocalDateTime at = LocalDateTime.parse(value);
        return (from == null || !at.isBefore(LocalDateTime.parse(from))) && (to == null || at.isBefore(LocalDateTime.parse(to)));
    }
    private int number(String key, int fallback, int min, int max) {
        if (!values.containsKey(key)) return fallback;
        try { int n = Integer.parseInt(values.get(key)); if (n < min || n > max) throw new NumberFormatException(); return n; }
        catch (NumberFormatException e) { throw invalid(key + " 超出允许范围"); }
    }
}
