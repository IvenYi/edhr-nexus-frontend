package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class FormProjectionInterpreterTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private ObjectNode model() throws Exception {
        return (ObjectNode) mapper.readTree("""
          {"fields":[{"id":"lot1","type":"text"},{"id":"team1","type":"text"},
                     {"id":"lot2","type":"text"},{"id":"team2","type":"text"}],
           "projection":{"version":"form-projection-v1","bindings":[
            {"id":"g1","modelId":"formTrace","enabled":true,"sources":{"materialLotText":"lot1","teamText":"team1"}},
            {"id":"g2","modelId":"formTrace","enabled":true,"sources":{"materialLotText":"lot2","teamText":"team2"}}]}}
          """);
    }
    @Test void horizontalGroupsStayPairedAndDeterministic() throws Exception {
        var model = model();
        var values = mapper.readTree("{\"lot1\":\"L1\",\"team1\":\"A\",\"lot2\":\"L2\",\"team2\":\"B\"}");
        var result = FormProjectionInterpreter.preview(model, values);
        assertThat(result).hasSize(2);
        assertThat(result.get(0).path("attributes").path("materialLotText").asText()).isEqualTo("L1");
        assertThat(result.get(0).path("attributes").path("teamText").asText()).isEqualTo("A");
        assertThat(result.get(1).path("sources").path("materialLotText").asText()).isEqualTo("lot2");
        assertThat(FormProjectionInterpreter.preview(model, values)).isEqualTo(result);
    }
    @Test void noConfigurationDoesNotBlockOrdinaryForms() {
        assertThat(FormProjectionInterpreter.preview(mapper.createObjectNode(), mapper.createObjectNode())).isEmpty();
    }
    @Test void deletedOrChangedFieldsCannotPublish() throws Exception {
        var model = model();
        ((ObjectNode) model.path("fields").get(0)).put("type", "number");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("文本或单选");
        ((ObjectNode) model.path("fields").get(0)).put("id", "renamed-id");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("不存在");
    }
    @Test void disabledIncompleteDraftIsExplicitlyAllowed() throws Exception {
        var model = model();
        var binding = (ObjectNode) model.path("projection").path("bindings").get(0);
        binding.put("enabled", false); binding.putObject("sources");
        assertThatCode(() -> FormProjectionInterpreter.validate(model)).doesNotThrowAnyException();
        binding.put("enabled", true);
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("至少选择");
    }
    @Test void noInventedStatisticsOrUnknownAttributes() throws Exception {
        var model = model();
        var binding = (ObjectNode) model.path("projection").path("bindings").get(0);
        binding.put("modelId", "inventory");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("口径");
        binding.put("modelId", "formTrace");
        ((ObjectNode) binding.path("sources")).put("customerSql", "lot1");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("不支持");
    }
    @Test void subtableRequiresStableUniqueRowKeysAndRejectsCrossGroupReferences() throws Exception {
        var model = (ObjectNode) mapper.readTree("""
          {"fields":[{"id":"outside","type":"text"},{"id":"lines","type":"subTable","typeConfig":{"columns":[
           {"id":"key","type":"text"},{"id":"lot","type":"text"}]}}],
           "projection":{"version":"form-projection-v1","bindings":[
           {"id":"g","enabled":true,"modelId":"formTrace","tableId":"lines","rowKeyFieldId":"key","sources":{"materialLotText":"lot"}}]}}
          """);
        var values = mapper.readTree("{\"lines\":[{\"key\":\"a\",\"lot\":\"L1\"},{\"key\":\"b\",\"lot\":\"L2\"}]}");
        assertThat(FormProjectionInterpreter.preview(model, values)).hasSize(2);
        ((ObjectNode) values.path("lines").get(1)).put("key", "a");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("记录键缺失或重复");
        ((ObjectNode) model.path("projection").path("bindings").get(0).path("sources")).put("teamText", "outside");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("同一明细组");
    }
    @Test void objectValuesCannotMasqueradeAsTextIdentities() throws Exception {
        var model = model();
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, mapper.readTree("{\"lot1\":{\"id\":\"secret\"}}")))
                .hasMessageContaining("类型不正确");
    }

    @Test void referenceTraceUsesFrozenCodeAndRejectsWrongTypesOrLegacyDisplayFallback() throws Exception {
        var model = (ObjectNode) mapper.readTree("""
          {"fields":[{"id":"batch","type":"reference","typeConfig":{"sourceType":"productionBatch"}}],
           "projection":{"version":"form-projection-v1","lookupItems":{"lookup_production_batch":{"name":"批次号","type":"text","referenceSources":["productionBatch"]}},
           "bindings":[{"id":"r","enabled":true,"modelId":"formTrace","sources":{"lookup_production_batch":"batch"}}]}}
          """);
        var values = mapper.readTree("""
            {"batch":{"id":"123","sourceType":"productionBatch","code":"B-A","name":"WO-A"}}
            """);
        assertThat(FormProjectionInterpreter.preview(model, values).get(0).path("attributes").path("lookup_production_batch").asText()).isEqualTo("B-A");
        assertThat(FormProjectionInterpreter.preview(model, mapper.createObjectNode())).isEmpty();
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, mapper.readTree("{\"batch\":{\"id\":\"123\",\"name\":\"B-A\"}}"))).hasMessageContaining("重新选择");
        ((ObjectNode) values.path("batch")).put("sourceType", "workOrder");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("重新选择");
        ((ObjectNode) model.path("fields").get(0).path("typeConfig")).put("sourceType", "material");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("不匹配");
    }

    @Test void referenceSubtableRowsRetainSeparateCodesAndLocations() throws Exception {
        var model = mapper.readTree("""
            {"fields":[{"id":"lines","type":"subTable","typeConfig":{"columns":[{"id":"key","type":"text"},
              {"id":"ref","type":"reference","typeConfig":{"sourceType":"equipment"}}]}}],
             "projection":{"version":"form-projection-v1","lookupItems":{"equipmentText":{"name":"设备编号","type":"text","referenceSources":["equipment"]}},
              "bindings":[{"id":"trace","modelId":"formTrace","enabled":true,"tableId":"lines","rowKeyFieldId":"key","sources":{"equipmentText":"ref"}}]}}
            """);
        var result = FormProjectionInterpreter.preview(model, mapper.readTree("""
            {"lines":[{"key":"A","ref":{"id":"1","sourceType":"equipment","code":"E-A","name":"同名设备"}},
                      {"key":"B","ref":{"id":"2","sourceType":"equipment","code":"E-B","name":"同名设备"}}]}
            """));
        assertThat(result.get(0).path("attributes").path("equipmentText").asText()).isEqualTo("E-A");
        assertThat(result.get(1).path("attributes").path("equipmentText").asText()).isEqualTo("E-B");
        assertThat(result.get(1).path("rowKey").asText()).isEqualTo("B");
        assertThat(result.get(1).path("sources").path("equipmentText").asText()).isEqualTo("ref");
    }
    @Test void formalQuantityRequiresUnitsRejectsNegativeAndDuplicateSources() throws Exception {
        var model = (ObjectNode) mapper.readTree("""
          {"fields":[{"id":"qty","type":"number"},{"id":"unit","type":"text"}],
           "projection":{"version":"form-projection-v1","bindings":[
           {"id":"production","enabled":true,"modelId":"production","sources":{"goodQuantity":"qty","unit":"unit"}}]}}
          """);
        var values = mapper.readTree("{\"qty\":0.25,\"unit\":\"kg\"}");
        assertThat(FormProjectionInterpreter.preview(model, values).get(0).path("attributes").path("goodQuantity").decimalValue())
                .isEqualByComparingTo("0.25");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, mapper.readTree("{\"qty\":-1,\"unit\":\"kg\"}"))).hasMessageContaining("非负数字");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, mapper.readTree("{\"qty\":1,\"unit\":\"\"}"))).hasMessageContaining("缺少单位");
        var bindings = (com.fasterxml.jackson.databind.node.ArrayNode) model.path("projection").path("bindings");
        bindings.add(((ObjectNode) bindings.get(0)).deepCopy().put("id", "duplicate"));
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("不能重复配置");
    }
}
