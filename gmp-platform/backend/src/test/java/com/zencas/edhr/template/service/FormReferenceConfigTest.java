package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class FormReferenceConfigTest {
    final ObjectMapper mapper = new ObjectMapper();
    @Test void resolvesMainAndNestedLegacyCanvasWithoutMutatingSnapshot() throws Exception {
        var form = mapper.readTree("""
            {"fields":[{"id":"main","type":"reference","typeConfig":{"sourceType":"dictionary"}},
              {"id":"table","type":"subTable","typeConfig":{"columns":[{"id":"col","type":"reference","typeConfig":{}}]}}],
             "canvas":{"payload":{"pages":[{"nodes":[
               {"bindings":{"fieldId":"main","widgetConfig":{"referenceSourceType":"material","referenceField":"code"}}},
               {"bindings":{"fieldId":"col","subTableId":"table","subTableFieldId":"col","widgetConfig":{"referenceSourceType":"user","referenceField":"displayName"}}}
             ]}]}}}
            """);
        String original = form.toString();
        var fields = FormReferenceConfig.fields(form, mapper);
        assertThat(fields.get(0).path("typeConfig").path("sourceType").asText()).isEqualTo("material");
        assertThat(fields.get(1).path("typeConfig").path("columns").get(0).path("typeConfig").path("sourceType").asText()).isEqualTo("user");
        assertThat(form.toString()).isEqualTo(original);
        ((ObjectNode) form).put("canvas", form.path("canvas").toString());
        assertThat(FormReferenceConfig.fields(form, mapper)).isEqualTo(fields);
    }
    @Test void rejectsConflictingPlacementsInsteadOfSelectingOneSilently() throws Exception {
        var form = mapper.readTree("""
            {"fields":[{"id":"ref","type":"reference","typeConfig":{}}],"canvas":{"nodes":[
              {"bindings":{"fieldId":"ref","widgetConfig":{"referenceSourceType":"material"}}},
              {"bindings":{"fieldId":"ref","widgetConfig":{"referenceSourceType":"user"}}}]}}
            """);
        assertThatThrownBy(() -> FormReferenceConfig.fields(form, mapper)).hasMessageContaining("不一致");
    }

    @Test void resolvesNewReferenceOptionsOnlyFromFrozenPlacements() throws Exception {
        var form = mapper.readTree("""
            {"fields":[{"id":"ref","type":"reference","typeConfig":{"sourceType":"product","referenceField":"name"}}],
             "canvas":{"nodes":[{"bindings":{"fieldId":"ref","widgetConfig":{"referenceDisplayFields":["code","name","specification"],"referenceSearchFields":["code","specification"],"referenceContextAutofill":true}}}]}}
            """);
        String before = form.toString();
        var config = FormReferenceConfig.fields(form, mapper).get(0).path("typeConfig");
        assertThat(config.path("referenceDisplayFields")).isEqualTo(mapper.readTree("[\"code\",\"name\",\"specification\"]"));
        assertThat(config.path("referenceSearchFields")).isEqualTo(mapper.readTree("[\"code\",\"specification\"]"));
        assertThat(config.path("referenceContextAutofill").asBoolean()).isTrue();
        assertThat(form.toString()).isEqualTo(before);
    }

    @Test void dictionaryScopeIsResolvedFromFrozenWidgetWithoutChangingLegacyConfig() throws Exception {
        var form = mapper.readTree("""
            {"fields":[{"id":"ref","type":"reference","typeConfig":{"sourceType":"dictionary"}}],
             "canvas":{"nodes":[{"bindings":{"fieldId":"ref","widgetConfig":{"referenceDictionaryId":"42"}}}]}}
            """);
        assertThat(FormReferenceConfig.fields(form, mapper).get(0).path("typeConfig").path("referenceDictionaryId").asText()).isEqualTo("42");
        assertThat(form.path("fields").get(0).path("typeConfig").has("referenceDictionaryId")).isFalse();
    }

    @Test void unifiedReferenceScopesResolveFromWidgetsWithoutMigratingStoredFields() throws Exception {
        var form = mapper.readTree("""
            {"fields":[{"id":"ref","type":"reference","typeConfig":{"sourceType":"product"}}],
             "canvas":{"nodes":[{"bindings":{"fieldId":"ref","widgetConfig":{"referenceSourceType":"material","referenceMaterialScope":"types","referenceMaterialTypeIds":["30"],"referenceProductionScope":"all"}}}]}}
            """);
        var resolved = FormReferenceConfig.fields(form, mapper).get(0).path("typeConfig");
        assertThat(resolved.path("sourceType").asText()).isEqualTo("material");
        assertThat(resolved.path("referenceMaterialScope").asText()).isEqualTo("types");
        assertThat(resolved.path("referenceMaterialTypeIds").get(0).asText()).isEqualTo("30");
        assertThat(form.path("fields").get(0).path("typeConfig").path("sourceType").asText()).isEqualTo("product");
    }

    @Test void conditionSaveValidationUsesRealEnabledSingleValueFieldsAndCurrentSourceWhitelist() {
        String fields = """
            {"fields":[{"id":"value","type":"text","status":"enabled"},
              {"id":"ref","type":"reference","typeConfig":{"sourceType":"material","referenceMaterialScope":"all","referenceQueryConditions":[CONDITION]}}]}
            """;
        String valid = "{\"sourceField\":\"materialTypeName\",\"operator\":\"eq\",\"targetFieldId\":\"value\"}";
        FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", valid), null, mapper);
        FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", "{\"sourceField\":\"\",\"targetFieldId\":\"\",\"operator\":\"eq\"}"), null, mapper);
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", valid.replace("materialTypeName", "model")), null, mapper)).hasMessageContaining("不适用");
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", valid.replace("value", "missing")), null, mapper)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", valid.replace("value", "ref")), null, mapper)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", valid).replace("\"status\":\"enabled\"", "\"status\":\"disabled\""), null, mapper)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", valid).replace("\"type\":\"text\"", "\"type\":\"multiSelect\""), null, mapper)).hasMessageContaining("已失效");
        for (String type : java.util.List.of("reference", "singleSelect")) {
            String multiple = fields.replace("CONDITION", valid).replace("\"type\":\"text\"", "\"type\":\"" + type + "\",\"typeConfig\":{\"multiple\":true}");
            assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(multiple, null, mapper)).hasMessageContaining("单值");
        }
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", valid.replace("eq", "unknown")), null, mapper)).hasMessageContaining("运算符");
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(fields.replace("CONDITION", "{\"sourceField\":\"code\"}"), null, mapper)).hasMessageContaining("完整配置");
    }

    @Test void conditionSaveValidationResolvesMainAndSameTableFieldsAndFrozenWidgetConfiguration() {
        String model = """
            {"payload":{"fields":[{"id":"main","type":"text","status":"enabled"},
             {"id":"table","type":"subTable","typeConfig":{"columns":[
               {"id":"row","type":"singleSelect","status":"enabled"},
               {"id":"ref","type":"reference","typeConfig":{"sourceType":"material"}}]}},
             {"id":"other","type":"subTable","typeConfig":{"columns":[{"id":"otherRow","type":"text","status":"enabled"}]}}]}}
            """;
        String canvas = """
            {"payload":{"nodes":[{"bindings":{"subTableId":"table","subTableFieldId":"ref","widgetConfig":{"referenceQueryConditions":[{"sourceField":"code","operator":"eq","targetFieldId":"TARGET"}]}}}]}}
            """;
        FormReferenceConfig.validateDesignConditions(model, canvas.replace("TARGET", "main"), mapper);
        FormReferenceConfig.validateDesignConditions(model, canvas.replace("TARGET", "row"), mapper);
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(model, canvas.replace("TARGET", "otherRow"), mapper)).hasMessageContaining("已失效");
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(model, canvas.replace("TARGET", "row").replace("\"code\"", "\"unknown\""), mapper)).hasMessageContaining("不适用");
    }

    @Test void disabledSourceFieldsAndTablesDoNotBroadenDraftSaveValidationOrRewriteFrozenConfiguration() throws Exception {
        String model = """
            {"fields":[
              {"id":"old","type":"reference","status":"disabled","typeConfig":{"sourceType":"product","referenceQueryConditions":[{"sourceField":"removed","targetFieldId":"missing"}]}},
              {"id":"table","type":"subTable","status":"disabled","typeConfig":{"columns":[
                {"id":"oldRow","type":"reference","status":"enabled","typeConfig":{"sourceType":"serialNumber","referenceQueryConditions":[{"sourceField":"removed","targetFieldId":"missing"}]}}]}},
              {"id":"value","type":"text","status":"enabled"},
              {"id":"current","type":"reference","status":"enabled","typeConfig":{"sourceType":"material","referenceQueryConditions":[{"sourceField":"code","operator":"eq","targetFieldId":"value"}]}}]}
            """;
        var snapshot = mapper.readTree(model);
        String before = snapshot.toString();
        FormReferenceConfig.validateDesignConditions(model, null, mapper);
        assertThat(FormReferenceConfig.fields(snapshot, mapper)).isEqualTo(snapshot.path("fields"));
        assertThat(snapshot.toString()).isEqualTo(before);
        String conflictingCanvas = """
            {"nodes":[
              {"bindings":{"fieldId":"old","widgetConfig":{"referenceSourceType":"material"}}},
              {"bindings":{"fieldId":"old","widgetConfig":{"referenceSourceType":"equipment"}}},
              {"bindings":{"subTableId":"table","subTableFieldId":"oldRow","widgetConfig":{"referenceSourceType":"material"}}},
              {"bindings":{"subTableId":"table","subTableFieldId":"oldRow","widgetConfig":{"referenceSourceType":"equipment"}}}]}
            """;
        FormReferenceConfig.validateDesignConditions(model, conflictingCanvas, mapper);
        ((ObjectNode) snapshot).set("canvas", mapper.readTree(conflictingCanvas));
        assertThatThrownBy(() -> FormReferenceConfig.fields(snapshot, mapper)).hasMessageContaining("不一致");
        assertThatThrownBy(() -> FormReferenceConfig.validateDesignConditions(model.replace("\"targetFieldId\":\"value\"", "\"targetFieldId\":\"old\""), null, mapper))
                .hasMessageContaining("已失效");
    }
}
