package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ProductionQualitySummaryTest {
    private final ObjectMapper mapper = new ObjectMapper();

    private ObjectNode batch(ArrayNode batches, String operation, String model, String field, int quantity, String unit, String material) {
        var batch = batches.addObject().put("operationId", operation).put("status", "SUCCEEDED").put("instanceNo", "FR-" + batches.size());
        var record = batch.putArray("records").addObject().put("id", batches.size()).put("modelId", model).put("rowKey", "row-" + batches.size());
        record.putObject("sources").put(field, "number");
        var attributes = record.putObject("attributes").put(field, quantity).put("unit", unit);
        if (material != null) attributes.putObject("material").put("id", material).put("name", "物料" + material);
        return batch;
    }

    @Test void finalGoodAndNgAreSeparateAndDoNotIncludeEarlierOperations() {
        var batches = mapper.createArrayNode();
        batch(batches, "first", "production", "goodQuantity", 100, "根", null);
        batch(batches, "final", "production", "goodQuantity", 30, "件", null);
        batch(batches, "final", "production", "goodQuantity", 28, "件", null);
        batch(batches, "final", "production", "ngQuantity", 2, "件", null);
        var good = ProductionQualitySummary.metric(mapper, batches, "goodQuantity", "final", "件", null, true, false);
        var ng = ProductionQualitySummary.metric(mapper, batches, "ngQuantity", "final", "件", null, true, false);
        assertThat(good.path("quantity").asText()).isEqualTo("58");
        assertThat(ng.path("quantity").asText()).isEqualTo("2");
        assertThat(good.path("sources")).hasSize(2);
    }

    @Test void productScrapSpansOperationsButRetainsOtherMaterialsAndUnknownUnitsAsEvidence() {
        var batches = mapper.createArrayNode();
        batch(batches, "first", "scrap", "quantity", 2, "件", "100");
        batch(batches, "final", "scrap", "quantity", 1, "件", "100");
        batch(batches, "first", "scrap", "quantity", 90, "件", "200");
        batch(batches, "final", "scrap", "quantity", 3, "", "100");
        batch(batches, "final", "scrap", "quantity", 4, "kg", "100");
        var result = ProductionQualitySummary.metric(mapper, batches, "scrapQuantity", null, "件", "100", true, false);
        assertThat(result.path("quantity").asText()).isEqualTo("3");
        assertThat(result.path("status").asText()).isEqualTo("UNIT_REVIEW");
        assertThat(result.path("sources")).hasSize(5);
        assertThat(result.path("rejected").asInt()).isEqualTo(2);
        var operation = ProductionQualitySummary.metric(mapper, batches, "scrapQuantity", "first", null, null, true, false);
        assertThat(operation.path("quantity").isNull()).isTrue();
        assertThat(operation.path("groups")).hasSize(2); // Same unit, different material: never combine.
    }

    @Test void absentIsNotZeroAndAnExplicitZeroIsKnown() {
        var batches = mapper.createArrayNode();
        assertThat(ProductionQualitySummary.metric(mapper, batches, "goodQuantity", "final", "件", null, false, false).path("quantity").isNull()).isTrue();
        batch(batches, "final", "production", "goodQuantity", 0, "件", null);
        assertThat(ProductionQualitySummary.metric(mapper, batches, "goodQuantity", "final", "件", null, true, false).path("quantity").asText()).isEqualTo("0");
    }

    @Test void sourceMetadataDistinguishesFormCompletionFromProjectionFailure() throws Exception {
        var batches = mapper.createArrayNode();
        var batch = batch(batches, "op", "production", "goodQuantity", 30, "件", null);
        batch.put("copyId", "f-copy-2").put("formStatus", "COMPLETED").put("status", "FAILED");
        batch.set("model", mapper.readTree("""
            {"fields":[{"id":"q","type":"number"},{"id":"u","type":"text"}],"projection":{"version":"form-projection-v1","bindings":[{"id":"p","enabled":true,"modelId":"production","sources":{"goodQuantity":"q","unit":"u"}}]}}
            """));
        batch.set("values", mapper.readTree("{\"q\":30,\"u\":\"件\"}"));
        var result = ProductionQualitySummary.metric(mapper, batches, "goodQuantity", "op", null, null, true, false);
        assertThat(result.path("quantity").isNull()).isTrue();
        var source = result.path("sources").get(0);
        assertThat(source.path("copyId").asText()).isEqualTo("f-copy-2");
        assertThat(source.path("formStatus").asText()).isEqualTo("COMPLETED");
        assertThat(source.path("projectionStatus").asText()).isEqualTo("FAILED");
        assertThat(source.path("included").asBoolean()).isFalse();
    }

    @Test void unidentifiedScrapIsPendingReviewRatherThanClassifiedAsAnotherMaterial() {
        var batches = mapper.createArrayNode();
        batch(batches, "first", "scrap", "quantity", 2, "件", null);
        var result = ProductionQualitySummary.metric(mapper, batches, "scrapQuantity", null, "件", "100", true, false);
        assertThat(result.path("quantity").isNull()).isTrue();
        assertThat(result.path("status").asText()).isEqualTo("UNIT_REVIEW");
        assertThat(result.path("sources").get(0).path("message").asText()).isEqualTo("物料身份未记录，待核对");
    }

    @Test void sourcePositionUsesFrozenFieldAndActualRowIdentity() throws Exception {
        var batches = mapper.createArrayNode();
        var batch = batch(batches, "first", "scrap", "quantity", 2, "件", "100");
        batch.set("model", mapper.readTree("""
          {"fields":[{"id":"items","name":"报废清单","typeConfig":{"columns":[{"id":"number","name":"报废数量"}]}}],
           "projection":{"bindings":[{"id":"b","rowKeyFieldId":"key"}]}}
          """));
        batch.set("values", mapper.readTree("{\"items\":[{\"key\":\"other\"},{\"key\":\"actual\"}]}"));
        ((ObjectNode) batch.path("records").get(0)).put("bindingId", "b").put("tableId", "items").put("rowKey", "actual");
        var source = ProductionQualitySummary.metric(mapper, batches, "scrapQuantity", "first", null, null, true, false).path("sources").get(0);
        assertThat(source.path("fieldName").asText()).isEqualTo("报废数量");
        assertThat(source.path("tableName").asText()).isEqualTo("报废清单");
        assertThat(source.path("rowLabel").asText()).isEqualTo("第2行");
    }

    @Test void savedReferenceUsesBindingsWithoutRequiringAllMetricsOrBorrowingProductUnits() throws Exception {
        var operation = mapper.readTree("""
          {"id":"op","forms":[{"id":"f","name":"报工","projection":{"bindings":[
            {"id":"p","enabled":true,"modelId":"production","sources":{"goodQuantity":"q","unit":"u"}}]}}]}
          """);
        var state = mapper.readTree("{\"forms\":{\"f\":{\"status\":\"IN_PROGRESS\",\"values\":{\"q\":8,\"u\":\"根\"}}}}");
        var saved = ExecutionQualitySummary.project(mapper, operation, state);
        assertThat(saved.path("goodQuantity").path("quantity").asText()).isEqualTo("8");
        assertThat(saved.path("goodQuantity").path("unit").asText()).isEqualTo("根");
        assertThat(saved.path("goodQuantity").path("sources").get(0).path("copyId").asText()).isEqualTo("f");
        assertThat(saved.path("goodQuantity").path("sources").get(0).path("formStatus").asText()).isEqualTo("IN_PROGRESS");
        assertThat(saved.path("goodQuantity").path("sources").get(0).path("projectionStatus").asText()).isEmpty();
        assertThat(saved.path("ngQuantity").path("quantity").isNull()).isTrue();
        ((ObjectNode) state.path("forms").path("f").path("values")).remove("u");
        saved = ExecutionQualitySummary.project(mapper, operation, state);
        assertThat(saved.path("goodQuantity").path("status").asText()).isEqualTo("UNIT_REVIEW");
        assertThat(saved.path("goodQuantity").path("sources").get(0).path("quantity").asText()).isEqualTo("8");
    }
}
