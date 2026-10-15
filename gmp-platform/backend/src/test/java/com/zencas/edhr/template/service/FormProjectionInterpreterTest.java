package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class FormProjectionInterpreterTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private ObjectNode reportModel() throws Exception {
        return (ObjectNode) mapper.readTree("""
          {"fields":[{"id":"qty","type":"number"},{"id":"hours","type":"number"},
            {"id":"start","type":"datetime","typeConfig":{"mode":"datetime"}},
            {"id":"end","type":"datetime","typeConfig":{"mode":"datetime"}},
            {"id":"date","type":"datetime","typeConfig":{"mode":"date"}},
            {"id":"person","type":"reference","typeConfig":{"sourceType":"user"}}],
           "projection":{"version":"form-projection-v1","bindings":[{"id":"report","enabled":true,"modelId":"production",
           "sources":{"goodQuantity":"qty","workHours":"hours","reportStartTime":"start","reportEndTime":"end","productionDate":"date","reporter":"person"}}]}}
          """);
    }
    @Test void personHoursAreExplicitAndIndependentOfPeriodDateAndReporter() throws Exception {
        var values = (ObjectNode) mapper.readTree("""
          {"qty":10,"hours":3.5,"start":"2026-10-12T23:00","end":"2026-10-13T01:00","date":"2026-10-11",
           "person":{"id":"7","sourceType":"user","code":"worker7","name":"员工七"}}
          """);
        var attrs = FormProjectionInterpreter.preview(reportModel(), values).get(0).path("attributes");
        assertThat(attrs.path("workHours").decimalValue()).isEqualByComparingTo("3.5");
        assertThat(attrs.path("productionDate").asText()).isEqualTo("2026-10-11");
        assertThat(attrs.path("reporterId").asText()).isEqualTo("7");
        assertThat(attrs.path("reporterLabel").asText()).isEqualTo("员工七");
        values.put("end", "2026-10-14T01:00");
        assertThat(FormProjectionInterpreter.preview(reportModel(), values).get(0).path("attributes").path("workHours")).isEqualTo(attrs.path("workHours"));
        values.remove("hours");
        assertThat(FormProjectionInterpreter.preview(reportModel(), values).get(0).path("attributes").has("workHours")).isFalse();
        assertThat(FormProjectionInterpreter.preview(reportModel(), mapper.createObjectNode().put("qty", 1)).get(0).path("attributes").size()).isEqualTo(1);
        values.put("hours", -1);
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(reportModel(), values)).hasMessageContaining("投入工时");
        values.put("hours", "3.5");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(reportModel(), values)).hasMessageContaining("非负数字");
    }
    @Test void reportTemporalRolesRejectWrongFieldTypesInvalidDatesAndReversedPeriod() throws Exception {
        var model = reportModel();
        ((ObjectNode) model.path("fields").get(2).path("typeConfig")).put("mode", "time");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("包含日期");
        ((ObjectNode) model.path("fields").get(2).path("typeConfig")).put("mode", "datetime");
        var values = mapper.createObjectNode().put("qty", 1).put("date", "2026-02-30");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("生产日期格式");
        values.remove("date"); values.put("start", "2026-10-13T10:00").put("end", "2026-10-13T09:00");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("结束时间不能早于");
    }
    @Test void reporterAcceptsOnlyUserReferenceOrSignatureAndUsesActualSigner() throws Exception {
        var model = reportModel();
        var person = (ObjectNode) model.path("fields").get(5);
        person.put("type", "text");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("人员引用或签名");
        person.put("type", "singleSelect");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("人员引用或签名");
        person.put("type", "reference").putObject("typeConfig").put("sourceType", "equipment");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("人员引用或签名");
        person.put("type", "signature"); person.remove("typeConfig");
        var values = mapper.createObjectNode().put("qty", 10).put("hours", 3.5);
        values.putObject("person").put("type", "signature").put("signatureId", "123").put("signerId", "7").put("signerName", "员工七");
        var attrs = FormProjectionInterpreter.preview(model, values).get(0).path("attributes");
        assertThat(attrs.path("reporterId").asText()).isEqualTo("7");
        assertThat(attrs.path("reporterLabel").asText()).isEqualTo("员工七");
        assertThat(attrs.path("workHours").decimalValue()).isEqualByComparingTo("3.5");
        values.put("person", "员工七");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("有效签署人");
        values.putObject("person").put("type", "signature").put("signerId", "7").put("signerName", "员工七");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("有效签署人");
        values.put("person", "");
        assertThat(FormProjectionInterpreter.preview(model, values).get(0).path("attributes").has("reporter")).isFalse();
        values.putNull("person");
        assertThat(FormProjectionInterpreter.preview(model, values).get(0).path("attributes").has("reporter")).isFalse();
    }
    @Test void subtableSignatureReportersStayWithTheirOwnRows() throws Exception {
        var model = reportModel();
        ((ObjectNode) model.path("fields").get(5)).put("type", "signature");
        var columns = model.path("fields").deepCopy();
        model.putArray("fields").addObject().put("id", "rows").put("type", "subTable").putObject("typeConfig").set("columns", columns);
        ((ObjectNode) model.path("projection").path("bindings").get(0)).put("tableId", "rows");
        var records = FormProjectionInterpreter.preview(model, mapper.readTree("""
          {"rows":[{"__rowId":"a","qty":10,"person":{"type":"signature","signatureId":"101","signerId":"7","signerName":"员工七"}},
                   {"__rowId":"b","qty":20,"person":{"type":"signature","signatureId":"102","signerId":"8","signerName":"员工八"}}]}
          """));
        assertThat(records.get(0).path("attributes").path("reporterId").asText()).isEqualTo("7");
        assertThat(records.get(1).path("attributes").path("reporterId").asText()).isEqualTo("8");
        assertThat(records.get(0).path("sources").path("reporter").asText()).isEqualTo("person");
    }
    @Test void subtableHoursRemainPerRowAndCannotBorrowHeaderHours() throws Exception {
        var model = reportModel();
        var columns = model.path("fields").deepCopy();
        var fields = model.putArray("fields"); fields.addObject().put("id", "headerHours").put("type", "number");
        fields.addObject().put("id", "rows").put("type", "subTable").putObject("typeConfig").set("columns", columns);
        var binding = (ObjectNode) model.path("projection").path("bindings").get(0); binding.put("tableId", "rows");
        var records = FormProjectionInterpreter.preview(model, mapper.readTree("""
          {"headerHours":99,"rows":[{"__rowId":"a","qty":10,"hours":1.5},{"__rowId":"b","qty":20,"hours":2}]}
          """));
        assertThat(records).hasSize(2);
        assertThat(records.get(0).path("attributes").path("workHours").decimalValue()).isEqualByComparingTo("1.5");
        assertThat(records.get(1).path("attributes").path("workHours").decimalValue()).isEqualByComparingTo("2");
        ((ObjectNode) binding.path("sources")).put("workHours", "headerHours");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("同一明细组");
    }
    @Test void scrapDictionaryRolesKeepCodesAndLabelsWithoutChangingQuantity() throws Exception {
        var model = mapper.readTree("""
          {"fields":[{"id":"mat","type":"reference","typeConfig":{"sourceType":"material"}},{"id":"qty","type":"number"},
            {"id":"why","type":"reference","typeConfig":{"sourceType":"dictionary"}},
            {"id":"kind","type":"singleSelect","typeConfig":{"options":[{"value":"appearance","label":"外观"}]}}],
           "projection":{"version":"form-projection-v1","bindings":[{"id":"s","enabled":true,"modelId":"scrap",
            "sources":{"material":"mat","quantity":"qty","reason":"why","category":"kind"}}]}}
          """);
        var attrs = FormProjectionInterpreter.preview(model, mapper.readTree("""
          {"mat":{"id":"1","name":"螺丝"},"qty":2,"why":{"id":"9","sourceType":"dictionary","code":"scratch","name":"划伤"},"kind":"appearance"}
          """)).get(0).path("attributes");
        assertThat(attrs.path("reason").asText()).isEqualTo("scratch");
        assertThat(attrs.path("reasonLabel").asText()).isEqualTo("划伤");
        assertThat(attrs.path("categoryLabel").asText()).isEqualTo("外观");
        assertThat(attrs.path("quantity").asInt()).isEqualTo(2);
    }
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
    @Test void formalQuantityAllowsBlankUnitsButRejectsNegativeAndDuplicateSources() throws Exception {
        var model = (ObjectNode) mapper.readTree("""
          {"fields":[{"id":"qty","type":"number"},{"id":"unit","type":"text"}],
           "projection":{"version":"form-projection-v1","bindings":[
           {"id":"production","enabled":true,"modelId":"production","sources":{"goodQuantity":"qty","unit":"unit"}}]}}
          """);
        var values = mapper.readTree("{\"qty\":0.25,\"unit\":\"kg\"}");
        assertThat(FormProjectionInterpreter.preview(model, values).get(0).path("attributes").path("goodQuantity").decimalValue())
                .isEqualByComparingTo("0.25");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, mapper.readTree("{\"qty\":-1,\"unit\":\"kg\"}"))).hasMessageContaining("非负数字");
        assertThat(FormProjectionInterpreter.preview(model, mapper.readTree("{\"qty\":1,\"unit\":\"\"}")).get(0).path("attributes").has("unit")).isFalse();
        var bindings = (com.fasterxml.jackson.databind.node.ArrayNode) model.path("projection").path("bindings");
        bindings.add(((ObjectNode) bindings.get(0)).deepCopy().put("id", "duplicate"));
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("不能重复配置");
    }
    @Test void consumptionNeedsOnlyMaterialAndQuantityAndUsesSystemRowIdentity() throws Exception {
        var model = mapper.readTree("""
          {"fields":[{"id":"lines","type":"subTable","typeConfig":{"columns":[
            {"id":"material","type":"reference","typeConfig":{"sourceType":"material"}},
            {"id":"qty","type":"number"},{"id":"note","name":"补充说明","type":"text"}]}}],
           "projection":{"version":"form-projection-v1","bindings":[{"id":"c","modelId":"consumption","enabled":true,
            "tableId":"lines","sources":{"material":"material","quantity":"qty"},"detailFieldIds":["note"]}]}}
          """);
        var values = mapper.readTree("""
          {"lines":[{"__rowId":"a2e1240b-5497-4043-874d-f9d0cdc8d0aa","material":{"id":"1","name":"螺丝"},"qty":10,"note":"无批号"}]}
          """);
        var result = FormProjectionInterpreter.preview(model, values).get(0);
        assertThat(result.path("rowKey").asText()).isEqualTo("a2e1240b-5497-4043-874d-f9d0cdc8d0aa");
        assertThat(result.path("attributes").has("materialLotText")).isFalse();
        assertThat(result.path("attributes").has("unit")).isFalse();
        assertThat(result.path("details").get(0).path("value").asText()).isEqualTo("无批号");
        assertThat(result.path("attributes").has("note")).isFalse();
        ((ObjectNode) values.path("lines").get(0)).remove("__rowId");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("记录键缺失");
    }
    @Test void outputCanReuseOneQualityFieldButCannotMakeGoodAndNgTheSameSource() throws Exception {
        var model = mapper.readTree("""
          {"fields":[{"id":"qty","type":"number"}],"projection":{"version":"form-projection-v1","bindings":[
          {"id":"p","enabled":true,"modelId":"production","sources":{"outputQuantity":"qty","goodQuantity":"qty"}}]}}
          """);
        var record = FormProjectionInterpreter.preview(model, mapper.readTree("{\"qty\":10}")).get(0);
        assertThat(record.path("attributes").path("outputQuantity").asInt()).isEqualTo(10);
        assertThat(record.path("attributes").path("goodQuantity").asInt()).isEqualTo(10);
        ((ObjectNode) model.path("projection").path("bindings").get(0).path("sources")).put("ngQuantity", "qty");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(model)).hasMessageContaining("不能重复映射");
        ((ObjectNode) model.path("projection").path("bindings").get(0).path("sources")).remove("goodQuantity");
        FormProjectionInterpreter.validate(model);
        ((ObjectNode) model.path("projection").path("bindings").get(0).path("sources")).remove("ngQuantity");
        FormProjectionInterpreter.validate(model);
    }
    @Test void dictionaryUnitUsesFrozenValueWithoutConversion() throws Exception {
        var model = mapper.readTree("""
          {"fields":[{"id":"qty","type":"number"},{"id":"unit","type":"reference","typeConfig":{"sourceType":"dictionary"}}],
           "projection":{"version":"form-projection-v1","bindings":[{"id":"p","enabled":true,"modelId":"production","sources":{"goodQuantity":"qty","unit":"unit"}}]}}
          """);
        var record = FormProjectionInterpreter.preview(model, mapper.readTree("""
          {"qty":10,"unit":{"id":"1","sourceType":"dictionary","code":"PCS","name":"件"}}
          """)).get(0);
        assertThat(record.path("attributes").path("unit").asText()).isEqualTo("PCS");
        assertThat(record.path("attributes").path("unitLabel").asText()).isEqualTo("件");
        assertThat(record.path("attributes").path("goodQuantity").asInt()).isEqualTo(10);
    }
}
