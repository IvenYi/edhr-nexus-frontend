package com.zencas.edhr.production.service;

import com.zencas.edhr.template.service.FormLookupCatalogService;
import com.zencas.edhr.common.exception.BusinessException;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import static org.assertj.core.api.Assertions.*;

class TraceConditionTest {
    private final List<FormLookupCatalogService.Item> catalog = List.of(item("text", "text"), item("quantity", "number"), item("day", "date"));
    private static FormLookupCatalogService.Item item(String id, String type) {
        return new FormLookupCatalogService.Item(id, id, "", type, false, 1, null, null, null, null);
    }
    private static FormTraceIndexService.Value value(String id, String type, String text) {
        return new FormTraceIndexService.Value(id, "field", "字段", "table", "row", 0, text, type);
    }

    @Test void numericQueriesCompareValuesAndKeepTypesSeparate() {
        var filter = TraceCondition.parse(Map.of("quantity", "1.00"), Map.of(), catalog).getFirst();
        assertThat(filter.value()).isEqualTo("1");
        assertThat(filter.matches(value("quantity", "number", "1"))).isTrue();
        assertThat(filter.matches(value("quantity", "text", "1"))).isFalse();
        assertThat(TraceCondition.parse(Map.of("quantity", "-0.0"), Map.of(), catalog).getFirst().value()).isEqualTo("0");
        assertThat(TraceCondition.parse(Map.of("quantity", "-2.50"), Map.of(), catalog).getFirst().value()).isEqualTo("-2.5");
    }

    @Test void dateRangeIncludesBothBoundsAndSupportsOneSidedQueries() {
        var filter = TraceCondition.parse(Map.of(), Map.of("day", new TraceCondition.DateRange("2026-10-01", "2026-10-14")), catalog).getFirst();
        assertThat(filter.matches(value("day", "date", "2026-10-01"))).isTrue();
        assertThat(filter.matches(value("day", "date", "2026-10-14"))).isTrue();
        assertThat(filter.matches(value("day", "date", "2026-10-15"))).isFalse();
        assertThat(TraceCondition.parse(Map.of(), Map.of("day", new TraceCondition.DateRange(null, "2026-10-14")), catalog).getFirst()
                .matches(value("day", "date", "2026-01-01"))).isTrue();
    }

    @Test void invalidAndUnsupportedConditionsFailBeforeSql() {
        for (String input : List.of("NaN", "Infinity", "1e9999999", "", "two"))
            assertThatThrownBy(() -> TraceCondition.parse(Map.of("quantity", input), Map.of(), catalog)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> TraceCondition.parse(Map.of("unknown", "x"), Map.of(), catalog)).hasMessageContaining("不存在");
        assertThatThrownBy(() -> TraceCondition.parse(Map.of("day", "2026-10-01"), Map.of(), catalog)).hasMessageContaining("日期范围");
        for (var range : List.of(new TraceCondition.DateRange("2026-02-30", null), new TraceCondition.DateRange("2026-10-15", "2026-10-14"), new TraceCondition.DateRange(null, null)))
            assertThatThrownBy(() -> TraceCondition.parse(Map.of(), Map.of("day", range), catalog)).isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> TraceCondition.parse(Map.of(), Map.of("text", new TraceCondition.DateRange("2026-10-01", null)), catalog)).hasMessageContaining("日期追溯项");
    }
}
