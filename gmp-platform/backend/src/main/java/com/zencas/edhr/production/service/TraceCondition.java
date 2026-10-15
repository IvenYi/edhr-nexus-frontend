package com.zencas.edhr.production.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.template.service.FormLookupCatalogService;
import com.zencas.edhr.template.service.FormLookupValue;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Validated conditions shared by indexed queries and actual DHR evidence matching. */
public record TraceCondition(String itemId, String type, String value, String from, String to) {
    public record DateRange(String from, String to) {}

    public static List<TraceCondition> parse(Map<String, String> filters, Map<String, DateRange> ranges,
                                           List<FormLookupCatalogService.Item> catalog) {
        List<TraceCondition> result = new ArrayList<>();
        for (var filter : (filters == null ? Map.<String, String>of() : filters).entrySet()) {
            var item = item(catalog, filter.getKey());
            String value = filter.getValue();
            if (value == null || value.isBlank() || value.length() > 512 || "date".equals(item.type()))
                throw invalid("请填写合法查询值；日期追溯项请使用日期范围");
            value = "number".equals(item.type()) ? FormLookupValue.number(value) : value.trim();
            if (value == null) throw invalid("“" + item.name() + "”请输入有效数字");
            result.add(new TraceCondition(item.id(), item.type(), value, null, null));
        }
        for (var range : (ranges == null ? Map.<String, DateRange>of() : ranges).entrySet()) {
            var item = item(catalog, range.getKey());
            if (!"date".equals(item.type()) || range.getValue() == null
                    || result.stream().anyMatch(condition -> condition.itemId().equals(item.id())))
                throw invalid("日期范围只能用于日期追溯项，且同一项不能重复");
            String from = bound(range.getValue().from()), to = bound(range.getValue().to());
            if (from == null && to == null || from != null && to != null && from.compareTo(to) > 0)
                throw invalid("“" + item.name() + "”请选择起止日期，结束日期不能早于开始日期");
            result.add(new TraceCondition(item.id(), "date", null, from, to));
        }
        return result;
    }

    public static List<TraceCondition> textFilters(Map<String, String> filters) {
        return (filters == null ? Map.<String, String>of() : filters).entrySet().stream()
                .map(filter -> new TraceCondition(filter.getKey(), "text", filter.getValue().trim(), null, null)).toList();
    }

    public void appendSql(StringBuilder sql, List<Object> args, String alias) {
        sql.append(alias).append(".item_id=? AND ").append(alias).append(".value_type=?");
        args.add(itemId); args.add(type);
        if (value != null) { sql.append(" AND ").append(alias).append(".value_text=?"); args.add(value); }
        if (from != null) { sql.append(" AND ").append(alias).append(".value_text>=?"); args.add(from); }
        if (to != null) { sql.append(" AND ").append(alias).append(".value_text<=?"); args.add(to); }
    }

    public boolean matches(FormTraceIndexService.Value candidate) {
        return itemId.equals(candidate.itemId()) && type.equals(candidate.type())
                && (value == null || value.equals(candidate.text()))
                && (from == null || candidate.text().compareTo(from) >= 0)
                && (to == null || candidate.text().compareTo(to) <= 0);
    }

    private static FormLookupCatalogService.Item item(List<FormLookupCatalogService.Item> catalog, String id) {
        return catalog.stream().filter(item -> item.id().equals(id)).findFirst()
                .orElseThrow(() -> invalid("筛选追溯项不存在、已退出目录或不受支持，请重新选择"));
    }
    private static String bound(String value) {
        if (value == null || value.isBlank()) return null;
        String result = FormLookupValue.date(value);
        if (result == null) throw invalid("请选择有效日期");
        return result;
    }
    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
