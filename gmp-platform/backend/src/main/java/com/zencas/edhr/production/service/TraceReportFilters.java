package com.zencas.edhr.production.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Product-defined instance filters, separate from saved-content lookup meanings. */
public final class TraceReportFilters {
    private TraceReportFilters() {}

    public static void append(StringBuilder sql, List<Object> args, Map<String, String> filters,
                              Map<String, String> columns) {
        if (filters == null) return;
        for (var entry : filters.entrySet()) {
            String key = entry.getKey(), value = entry.getValue();
            if (value == null || value.isBlank() || value.length() > 512) throw invalid("筛选值不能为空或超过512字");
            if (key.equals("createdDateFrom") || key.equals("createdDateTo")) {
                LocalDate date = date(value.trim());
                sql.append(" AND ").append(columns.get("createdAt")).append(key.endsWith("From") ? ">=?" : "<?");
                args.add(Timestamp.valueOf((key.endsWith("From") ? date : date.plusDays(1)).atStartOfDay()));
            } else {
                String column = columns.get(key);
                if (column == null || key.equals("createdAt")) throw invalid("筛选属性不受支持");
                sql.append(" AND ").append(column).append("=?"); args.add(value.trim());
            }
        }
        if (filters.containsKey("createdDateFrom") && filters.containsKey("createdDateTo")
                && date(filters.get("createdDateFrom").trim()).isAfter(date(filters.get("createdDateTo").trim())))
            throw invalid("查询结束日期不能早于开始日期");
    }

    private static LocalDate date(String value) {
        try { return LocalDate.parse(value); }
        catch (java.time.format.DateTimeParseException ex) { throw invalid("请选择有效日期"); }
    }
    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
