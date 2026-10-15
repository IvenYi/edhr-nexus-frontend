package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FormTraceIndexServiceTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void onlyExplicitTraceSourcesAndSavedSupportedValuesAreCollected() throws Exception {
        var form = mapper.readTree("""
                {"fields":[{"id":"lot","name":"物料批号","type":"text"},{"id":"note","type":"text"}],
                "projection":{"bindings":[
                    {"id":"business","modelId":"consumption","enabled":true,"sources":{"materialLotText":"lot"}},
                    {"id":"off","modelId":"formTrace","enabled":false,"sources":{"teamText":"note"}},
                    {"id":"trace","modelId":"formTrace","enabled":true,"sources":{"materialLotText":"lot","teamText":"missing"}},
                    {"id":"duplicate","modelId":"formTrace","enabled":true,"sources":{"materialLotText":"lot"}}
                ]}}
                """);
        var entries = FormTraceIndexService.extract(form, mapper.readTree("{\"lot\":\" L1 \",\"note\":\"Not indexed\"}"));
        assertThat(entries).hasSize(1);
        assertThat(entries.getFirst()).isEqualTo(new FormTraceIndexService.Value("materialLotText", "lot", "物料批号", "", "form", -1, "L1"));
        assertThat(FormTraceIndexService.extract(form, mapper.readTree("{\"lot\":null}"))).isEmpty();
        assertThat(FormTraceIndexService.extract(form, mapper.readTree("{\"lot\":{\"value\":\"L1\"}}"))).isEmpty();
    }

    @Test void systemRowIdentityIsIndependentOfBindingsAndDisplayOrder() throws Exception {
        var form = mapper.readTree("""
                {"fields":[{"id":"table","type":"subTable","typeConfig":{"columns":[
                {"id":"lot","type":"text"},{"id":"team","type":"text"}]}}],"projection":{"bindings":[
                {"id":"one","modelId":"formTrace","enabled":true,"tableId":"table","sources":{"materialLotText":"lot"}},
                {"id":"two","modelId":"formTrace","enabled":true,"tableId":"table","sources":{"teamText":"team"}}]}}
                """);
        var values = mapper.readTree("""
                {"table":[{"__rowId":"row-two","lot":"L2","team":"B"},{"__rowId":"row-one","lot":"L1","team":"A"}]}
                """);
        var entries = FormTraceIndexService.extract(form, values);
        assertThat(entries).hasSize(4);
        assertThat(entries.stream().filter(value -> "row-one".equals(value.rowKey())).map(FormTraceIndexService.Value::text)).containsExactly("L1", "A");
        assertThat(entries.stream().filter(value -> "row-one".equals(value.rowKey())).map(FormTraceIndexService.Value::rowIndex)).containsOnly(1);

        // Old MVP configurations can have different user-selected keys. They must not change same-row matching.
        ((com.fasterxml.jackson.databind.node.ObjectNode) form.path("projection").path("bindings").get(0)).put("rowKeyFieldId", "lot");
        ((com.fasterxml.jackson.databind.node.ObjectNode) form.path("projection").path("bindings").get(1)).put("rowKeyFieldId", "team");
        for (var row : values.path("table")) ((com.fasterxml.jackson.databind.node.ObjectNode) row).remove("__rowId");
        var legacyEntries = FormTraceIndexService.extract(form, values);
        assertThat(legacyEntries.stream().filter(value -> "legacy:1".equals(value.rowKey())).map(FormTraceIndexService.Value::text)).containsExactly("L2", "B");
    }

    @Test void referenceUsesFrozenCodeAndRequiresCompatibleIdentity() throws Exception {
        var form = mapper.readTree("""
                {"fields":[{"id":"selected","type":"reference","typeConfig":{"sourceType":"productionBatch"}}],
                "projection":{"lookupItems":{"lookup_production_batch":{"referenceSources":["productionBatch","serialNumber"]}},
                "bindings":[{"id":"trace","modelId":"formTrace","enabled":true,"sources":{"lookup_production_batch":"selected"}}]}}
                """);
        var entries = FormTraceIndexService.extract(form, mapper.readTree("""
                {"selected":{"id":"100","name":"改名后的显示名称","code":"B001","sourceType":"productionBatch"}}
                """));
        assertThat(entries).hasSize(1);
        assertThat(entries.getFirst().text()).isEqualTo("B001");
        assertThat(FormTraceIndexService.extract(form, mapper.readTree("""
                {"selected":{"id":"100","code":"B001","sourceType":"equipment"}}
                """))).isEmpty();
        assertThat(FormTraceIndexService.extract(form, mapper.readTree("""
                {"selected":{"name":"B001","sourceType":"productionBatch"}}
                """))).isEmpty();
    }
}
