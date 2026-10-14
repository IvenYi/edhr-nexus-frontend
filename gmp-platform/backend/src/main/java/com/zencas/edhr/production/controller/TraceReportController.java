package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.production.service.DhrTraceReportService;
import com.zencas.edhr.production.service.FormTraceIndexService;
import com.zencas.edhr.production.service.TraceCondition;
import com.zencas.edhr.template.service.FormLookupCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/reports/trace")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('form-instances.view') and hasAuthority('production.execution')")
public class TraceReportController {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final FormLookupCatalogService catalog;
    private final DhrTraceReportService dhrs;
    public record Query(String direction, Map<String, String> properties, Map<String, String> filters, int page, int size,
                        Map<String, TraceCondition.DateRange> dateRanges) {
        public Query(String direction, Map<String, String> properties, Map<String, String> filters, int page, int size) {
            this(direction, properties, filters, page, size, null);
        }
    }

    @PostMapping("/forms/query")
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ApiResponse<ObjectNode> forms(@RequestBody Query query) {
        var conditions = validate(query);
        Map<String, String> properties = query.properties() == null ? Map.of() : query.properties();
        var fixed = new java.util.LinkedHashMap<>(properties);
        String objectNo = fixed.remove("objectNo"), operationName = fixed.remove("operationName");
        return ApiResponse.success(new FormTraceIndexService(jdbc, mapper).query(null, null, objectNo, operationName,
                conditions, query.page(), query.size(), reverse(query), fixed));
    }

    @PostMapping("/dhrs/query")
    @PreAuthorize("hasAuthority('form-instances.view') and hasAuthority('production.execution') and hasAuthority('dhr.instances.view')")
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ApiResponse<ObjectNode> dhrs(@RequestBody Query query) {
        var conditions = validate(query);
        return ApiResponse.success(dhrs.query(reverse(query), query.properties() == null ? Map.of() : query.properties(), conditions, query.page(), query.size()));
    }

    @PostMapping("/dhrs/{id}/detail")
    @PreAuthorize("hasAuthority('form-instances.view') and hasAuthority('production.execution') and hasAuthority('dhr.instances.view')")
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ApiResponse<ObjectNode> detail(@PathVariable long id, @RequestBody Query query) {
        var conditions = validate(query); return ApiResponse.success(dhrs.detail(id, reverse(query), conditions));
    }

    private static boolean reverse(Query query) { return "REVERSE".equals(query.direction()); }
    private static Map<String, String> filters(Query query) { return query.filters() == null ? Map.of() : query.filters(); }
    private java.util.List<TraceCondition> validate(Query query) {
        if (!Set.of("FORWARD", "REVERSE").contains(query.direction() == null ? "" : query.direction())
                || query.page() < 0 || query.size() < 1 || query.size() > 200) throw invalid("请选择追溯方向及合法页码");
        if (!reverse(query) && (!filters(query).isEmpty() || query.dateRanges() != null && !query.dateRanges().isEmpty()))
            throw invalid("正向追溯不使用内容追溯条件");
        if (query.properties() != null) for (String value : query.properties().values())
            if (value == null || value.isBlank() || value.length() > 512) throw invalid("筛选值不能为空或超过512字");
        if (filters(query).isEmpty() && (query.dateRanges() == null || query.dateRanges().isEmpty())) return java.util.List.of();
        return TraceCondition.parse(filters(query), query.dateRanges(), catalog.list());
    }
    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
