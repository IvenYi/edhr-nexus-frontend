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
}
