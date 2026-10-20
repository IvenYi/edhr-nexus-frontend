package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FormTraceIndexServiceTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void legalBlankMainRegionsUseRootValuesWithoutChangingFrozenConfiguration() throws Exception {
        var template = mapper.readTree("""
                {"fields":[{"id":"lot","name":"批号","type":"text"}],
                "projection":{"version":"form-projection-v1","bindings":[
                  {"id":"trace","modelId":"formTrace","enabled":true,"sources":{"materialLotText":"lot"}}]}}
                """);
        var aliases = new java.util.ArrayList<String>();
        aliases.add(null); aliases.add(""); aliases.add(" \t\u3000");
        java.util.stream.IntStream.rangeClosed(0, Character.MAX_VALUE).filter(Character::isWhitespace)
                .forEach(code -> aliases.add(Character.toString(code)));
        for (String alias : aliases) {
            var form = template.deepCopy();
            if (alias != null) ((com.fasterxml.jackson.databind.node.ObjectNode) form.at("/projection/bindings/0")).put("tableId", alias);
            com.zencas.edhr.template.service.FormProjectionInterpreter.validateConfiguration(form);
            String frozen = form.toString();
            assertThat(FormTraceIndexService.extract(form, mapper.readTree("{\"lot\":\"MAIN\"}")))
                    .as("main alias %s", mapper.writeValueAsString(alias))
                    .containsExactly(new FormTraceIndexService.Value("materialLotText", "lot", "批号", "", "form", -1, "MAIN"));
            assertThat(form.toString()).isEqualTo(frozen);
        }
    }

    @Test void nonblankTableIdsKeepExactIdentityAndRemainSeparateFromMainAndOtherRows() throws Exception {
        var form = mapper.readTree("""
                {"fields":[{"id":"lot","type":"text"},
                  {"id":" details ","type":"subTable","typeConfig":{"columns":[{"id":"lot","type":"text"}]}},
                  {"id":"details","type":"subTable","typeConfig":{"columns":[{"id":"lot","type":"text"}]}}],
                "projection":{"version":"form-projection-v1","bindings":[
                  {"id":"main","modelId":"formTrace","enabled":true,"sources":{"materialLotText":"lot"}},
                  {"id":"padded","modelId":"formTrace","enabled":true,"tableId":" details ","sources":{"materialLotText":"lot"}},
                  {"id":"plain","modelId":"formTrace","enabled":true,"tableId":"details","sources":{"materialLotText":"lot"}}]}}
                """);
        var values = mapper.readTree("""
                {"lot":"MAIN"," details ":[{"__rowId":"padded-row","lot":"PADDED"}],
                "details":[{"__rowId":"row-1","lot":"ONE"},{"__rowId":"row-2","lot":"TWO"}]}
                """);
        com.zencas.edhr.template.service.FormProjectionInterpreter.validateConfiguration(form);
        var entries = FormTraceIndexService.extract(form, values);
        assertThat(entries).extracting(FormTraceIndexService.Value::text).containsExactly("MAIN", "PADDED", "ONE", "TWO");
        assertThat(entries).extracting(FormTraceIndexService.Value::tableId).containsExactly("", " details ", "details", "details");
        assertThat(entries).extracting(FormTraceIndexService.Value::rowKey).containsExactly("form", "padded-row", "row-1", "row-2");
    }

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
