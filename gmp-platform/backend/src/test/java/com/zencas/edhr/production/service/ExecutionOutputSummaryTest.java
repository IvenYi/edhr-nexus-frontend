package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ExecutionOutputSummaryTest {
    private final ObjectMapper mapper = new ObjectMapper();

    private ObjectNode operation() throws Exception {
        return (ObjectNode) mapper.readTree("""
            {"forms":[{"id":"f1","name":"生产记录","fields":[
              {"id":"g","name":"良品","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_GOOD"}},
              {"id":"n","name":"不良","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_NG"}},
              {"id":"s","name":"报废","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_SCRAP"}},
              {"id":"ordinary","name":"良品数量","type":"number"}
            ]}]}
            """);
    }

    private ObjectNode state(String values) throws Exception {
        return (ObjectNode) mapper.readTree("{\"forms\":{\"f1\":{\"values\":" + values + "}}}");
    }

    @Test void sumsExplicitSourcesWithDecimalPrecisionAndIgnoresNames() throws Exception {
        var result = ExecutionOutputSummary.project(mapper, operation(), state("{\"g\":\"0.1\",\"n\":0.2,\"s\":0,\"ordinary\":999}"));
        assertThat(result.path("status").asText()).isEqualTo("READY");
        assertThat(result.path("outputQuantity").asText()).isEqualTo("0.3");
        assertThat(result.path("scrapQuantity").asText()).isEqualTo("0");
    }

    @Test void distinguishesUnconfiguredMissingBlankAndExplicitZero() throws Exception {
        var op = operation();
        assertThat(ExecutionOutputSummary.project(mapper, op, state("{}" )).path("status").asText()).isEqualTo("PENDING");
        assertThat(ExecutionOutputSummary.project(mapper, op, state("{\"g\":1,\"n\":\"\",\"s\":0}")).path("outputQuantity").isNull()).isTrue();
        assertThat(ExecutionOutputSummary.project(mapper, op, state("{\"g\":0,\"n\":0,\"s\":0}")).path("outputQuantity").asText()).isEqualTo("0");
        ((ObjectNode) op.at("/forms/0/fields/2")).put("status", "disabled");
        assertThat(ExecutionOutputSummary.project(mapper, op, state("{\"g\":1,\"n\":0,\"s\":2}")).path("status").asText()).isEqualTo("NOT_CONFIGURED");
    }

    @Test void rejectsInvalidValuesAndMismatchedTypesInsteadOfPublishingFalseTotals() throws Exception {
        for (String bad : new String[]{"-1", "\"abc\"", "true", "{}", "\"1e100000\""}) {
            var result = ExecutionOutputSummary.project(mapper, operation(), state("{\"g\":" + bad + ",\"n\":0,\"s\":0}"));
            assertThat(result.path("status").asText()).isEqualTo("INVALID");
            assertThat(result.path("outputQuantity").isNull()).isTrue();
        }
        var op = operation(); ((ObjectNode) op.at("/forms/0/fields/0")).put("type", "text");
        assertThat(ExecutionOutputSummary.project(mapper, op, state("{\"g\":1,\"n\":0,\"s\":0}")).path("status").asText()).isEqualTo("INVALID");
    }

    @Test void skipsFulfilledAliasAndSumsDifferentFormsAndSubtableRows() throws Exception {
        var op = operation(); var forms = op.withArray("forms");
        ObjectNode alias = ((ObjectNode) forms.get(0)).deepCopy(); alias.put("id", "alias").put("fulfilledBy", "f1"); forms.add(alias);
        ObjectNode sub = forms.addObject().put("id", "f2").put("name", "补充产出");
        var table = sub.putArray("fields").addObject().put("id", "rows").put("name", "明细").put("type", "subTable");
        table.putObject("typeConfig").putArray("columns").add(op.at("/forms/0/fields/0").deepCopy());
        var values = state("{\"g\":2,\"n\":1,\"s\":0}");
        values.withObject("/forms").set("alias", mapper.readTree("{\"values\":{\"g\":100,\"n\":100,\"s\":100}}"));
        values.withObject("/forms").set("f2", mapper.readTree("{\"values\":{\"rows\":[{\"g\":3},{\"g\":4}]}}"));
        var result = ExecutionOutputSummary.project(mapper, op, values);
        assertThat(result.path("outputQuantity").asText()).isEqualTo("10");
        assertThat(result.path("goodQuantity").asText()).isEqualTo("9");
        values.withObject("/forms/f2/values").putArray("rows");
        assertThat(ExecutionOutputSummary.project(mapper, op, values).path("status").asText()).isEqualTo("PENDING");
    }

    @Test void ordinaryLegacyFormsAndUnknownPurposeCannotInventOutput() throws Exception {
        var op = operation();
        for (var field : op.at("/forms/0/fields")) ((ObjectNode) field).remove("typeConfig");
        assertThat(ExecutionOutputSummary.project(mapper, op, state("{\"g\":5}")).path("status").asText()).isEqualTo("NOT_CONFIGURED");
        ((ObjectNode) op.at("/forms/0/fields/0")).putObject("typeConfig").put("businessPurpose", "OTHER");
        assertThat(ExecutionOutputSummary.project(mapper, op, state("{\"g\":5}")).path("status").asText()).isEqualTo("INVALID");
    }
}
