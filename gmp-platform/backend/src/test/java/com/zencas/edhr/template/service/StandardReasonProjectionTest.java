package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class StandardReasonProjectionTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private ObjectNode model(String type) throws Exception {
        return (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"reason","type":"reference","typeConfig":{"sourceType":"defectReason"}},
            {"id":"qty","type":"number"},{"id":"note","type":"text"},{"id":"ng","type":"number"}],
            "projection":{"version":"form-projection-v1","bindings":[
            {"id":"detail","enabled":true,"modelId":"defect","sources":{"reason":"reason","quantity":"qty","reasonNote":"note"}},
            {"id":"report","enabled":true,"modelId":"production","sources":{"ngQuantity":"ng"}}]}}
            """);
    }
    @Test void oneReasonOneQuantityKeepsIdentityAndDoesNotGenerateOrReplaceReportNg() throws Exception {
        var model = model("main");
        FormProjectionInterpreter.validateConfiguration(model);
        var values = mapper.createObjectNode().put("qty", 3).put("ng", 2).put("note", "一件产品可能存在多项缺陷");
        values.putObject("reason").put("id", "81").put("sourceType", "defectReason").put("code", "D01").put("name", "划伤");
        var records = FormProjectionInterpreter.preview(model, values);
        assertThat(records).hasSize(2);
        var defect = records.get(0).path("attributes");
        assertThat(defect.path("quantity").asInt()).isEqualTo(3);
        assertThat(defect.path("reasonId").asText()).isEqualTo("81");
        assertThat(defect.path("reason").asText()).isEqualTo("D01");
        assertThat(defect.path("reasonLabel").asText()).isEqualTo("划伤");
        assertThat(defect.has("ngQuantity")).isFalse();
        assertThat(records.get(1).path("attributes").path("ngQuantity").asInt()).isEqualTo(2);
    }
    @Test void defectRequiresDedicatedSingleReferenceAndAnExplicitNumericQuantity() throws Exception {
        for (String source : java.util.List.of("dictionary", "scrapReason", "user")) {
            var model = model("invalid");
            ((ObjectNode) model.path("fields").get(0).path("typeConfig")).put("sourceType", source);
            assertThatThrownBy(() -> FormProjectionInterpreter.validateConfiguration(model)).hasMessageContaining("不良原因");
        }
        var text = model("text"); ((ObjectNode) text.path("fields").get(0)).put("type", "text");
        assertThatThrownBy(() -> FormProjectionInterpreter.validateConfiguration(text)).hasMessageContaining("不良原因");
        var missing = model("missing"); ((ObjectNode) missing.path("projection").path("bindings").get(0).path("sources")).remove("quantity");
        assertThatThrownBy(() -> FormProjectionInterpreter.validateConfiguration(missing)).hasMessageContaining("数量来源");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model("blank"), mapper.createObjectNode().put("qty", 1).put("ng", 1))).hasMessageContaining("请选择不良原因");
    }
    @Test void actualSubtableRowsKeepIndependentReasonIdentitiesAndRowLocations() throws Exception {
        var model = model("rows");
        var columns = model.path("fields").deepCopy();
        model.putArray("fields").addObject().put("id", "rows").put("type", "subTable").putObject("typeConfig").set("columns", columns);
        var bindings = model.withObject("/projection").putArray("bindings");
        bindings.addObject().put("id", "detail").put("enabled", true).put("modelId", "defect").put("tableId", "rows").putObject("sources").put("reason", "reason").put("quantity", "qty");
        var values = mapper.createObjectNode();
        var rows = values.putArray("rows");
        for (int index = 0; index < 2; index++) rows.addObject().put("__rowId", "row-" + index).put("qty", index + 1)
                .putObject("reason").put("id", "8" + index).put("sourceType", "defectReason").put("code", "D" + index).put("name", "同名原因");
        var results = FormProjectionInterpreter.preview(model, values);
        assertThat(results).hasSize(2);
        assertThat(results.get(0).path("rowKey").asText()).isEqualTo("row-0");
        assertThat(results.get(1).path("attributes").path("reasonId").asText()).isEqualTo("81");
        assertThat(results.get(1).path("attributes").path("quantity").asInt()).isEqualTo(2);
    }
    @Test void newScrapConfigurationRejectsCategoryOrTextReasonWithoutReinterpretingFrozenHistory() throws Exception {
        var old = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"mat","type":"reference","typeConfig":{"sourceType":"material"}},{"id":"q","type":"number"},{"id":"why","type":"text"},{"id":"category","type":"text"}],
            "projection":{"version":"form-projection-v1","bindings":[{"id":"s","modelId":"scrap","enabled":true,"sources":{"material":"mat","quantity":"q","reason":"why","category":"category"}}]}}
            """);
        var values = mapper.createObjectNode().put("q", 1).put("why", "旧文本原因").put("category", "旧分类");
        values.putObject("mat").put("id", "1").put("name", "物料");
        assertThat(FormProjectionInterpreter.preview(old, values).get(0).path("attributes").path("category").asText()).isEqualTo("旧分类");
        assertThatThrownBy(() -> FormProjectionInterpreter.validateConfiguration(old)).hasMessageContaining("分类暂未开放");
        ((ObjectNode) old.at("/projection/bindings/0/sources")).remove("category");
        assertThatThrownBy(() -> FormProjectionInterpreter.validateConfiguration(old)).hasMessageContaining("报废原因目录");
    }
    @Test void catalogExposesDedicatedReasonSourcesWithoutScrapOrDefectCategory() {
        for (var model : FormProjectionInterpreter.catalog().path("models")) {
            if (!java.util.Set.of("scrap", "defect").contains(model.path("id").asText())) continue;
            for (var attribute : model.path("attributes")) {
                assertThat(attribute.path("id").asText()).isNotEqualTo("category");
                if ("reason".equals(attribute.path("id").asText())) assertThat(attribute.path("referenceSources").get(0).asText())
                    .isEqualTo("defect".equals(model.path("id").asText()) ? "defectReason" : "scrapReason");
            }
        }
    }
}
