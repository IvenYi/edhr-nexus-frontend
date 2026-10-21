package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class UnifiedReferenceProjectionCompatibilityTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void unionProductionReferenceMustFitTheEntireExistingAllowedObjectSet() {
        for (String scope : new String[]{"all", "batch", "sn"}) {
            ObjectNode config = production(scope);
            assertAccepted(config, "productionBatch", "serialNumber");
            if ("batch".equals(scope)) assertAccepted(config, "productionBatch");
            else assertRejected(config, "productionBatch");
            if ("sn".equals(scope)) assertAccepted(config, "serialNumber");
            else assertRejected(config, "serialNumber");
            assertRejected(config, "workOrder");
            assertRejected(config);
        }
        assertAccepted(mapper.createObjectNode().put("sourceType", "productionObject"), "productionBatch", "serialNumber");
        assertRejected(production("unexpected"), "productionBatch", "serialNumber");
    }

    @Test void onlyExplicitProductScopeIsEquivalentToTheExistingProductPurpose() {
        for (String scope : new String[]{"all", "product", "types"}) {
            ObjectNode config = mapper.createObjectNode().put("sourceType", "material").put("referenceMaterialScope", scope);
            config.putArray("referenceMaterialTypeIds").add("1");
            assertAccepted(config, "material");
            if ("product".equals(scope)) assertAccepted(config, "product");
            else assertRejected(config, "product");
            assertRejected(config, "equipment");
        }
        assertRejected(mapper.createObjectNode().put("sourceType", "material"), "product");
        assertAccepted(mapper.createObjectNode().put("sourceType", "material"), "material");
    }

    @Test void legacySourceIdentityAndNewUnionIdentityKeepTheirFrozenInterpretations() {
        for (String source : new String[]{"product", "productionBatch", "serialNumber", "productionObject"}) {
            ObjectNode config = mapper.createObjectNode().put("sourceType", source);
            ObjectNode model = model(config, "productionObject".equals(source) ? new String[]{"productionBatch", "serialNumber"} : new String[]{source});
            JsonNode original = model.deepCopy();
            ObjectNode values = mapper.createObjectNode();
            values.putObject("reference").put("id", "101").put("sourceType", source).put("code", "REF-101").put("name", "原始名称");
            assertThat(FormProjectionInterpreter.preview(model, values).get(0).path("attributes").path("lookup_subject").asText()).isEqualTo("REF-101");
            assertThat(model).isEqualTo(original);
            values.withObject("/reference").put("sourceType", "other");
            assertThatThrownBy(() -> FormProjectionInterpreter.preview(model, values)).hasMessageContaining("缺少对象身份");
        }
    }

    private ObjectNode production(String scope) {
        return mapper.createObjectNode().put("sourceType", "productionObject").put("referenceProductionScope", scope);
    }

    private void assertAccepted(ObjectNode config, String... allowed) {
        assertThatCode(() -> FormProjectionInterpreter.validateConfiguration(model(config, allowed))).doesNotThrowAnyException();
    }

    private void assertRejected(ObjectNode config, String... allowed) {
        assertThatThrownBy(() -> FormProjectionInterpreter.validateConfiguration(model(config, allowed))).hasMessageContaining("引用对象与追溯项不匹配");
    }

    private ObjectNode model(ObjectNode config, String... allowed) {
        ObjectNode model = mapper.createObjectNode();
        model.putArray("fields").addObject().put("id", "reference").put("type", "reference").set("typeConfig", config);
        ObjectNode projection = model.putObject("projection").put("version", FormProjectionInterpreter.VERSION);
        projection.putArray("bindings").addObject().put("id", "trace").put("enabled", true).put("modelId", "formTrace")
                .putObject("sources").put("lookup_subject", "reference");
        var sources = projection.putObject("lookupItems").putObject("lookup_subject").put("type", "text").put("name", "既有追溯项").putArray("referenceSources");
        for (String source : allowed) sources.add(source);
        return model;
    }
}
