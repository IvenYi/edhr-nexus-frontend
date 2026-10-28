package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.production.service.ProductionExecutionEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RecordControlDiffTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ProductionExecutionEngine engine = mock(ProductionExecutionEngine.class);
    private final ExecutionAccess evidence = mock(ExecutionAccess.class);
    private RecordControlDiff service;

    @BeforeEach void setUp() {
        service = new RecordControlDiff(mapper, engine, evidence);
        when(engine.validateValues(any(), any())).thenReturn(List.of());
    }

    @Test void historicalSubtableRowsGetStableIdentityAndReorderingIsNotAChange() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"rows","type":"subTable","typeConfig":{"columns":[{"id":"value","type":"text"}]}}]}
            """);
        ObjectNode old = (ObjectNode) mapper.readTree("{" + "\"rows\":[{\"value\":\"A\"},{\"value\":\"B\"}]}");
        ObjectNode source = (ObjectNode) service.identifyRows(old, form, "123");
        ObjectNode secondLookup = (ObjectNode) service.identifyRows(old, form, "123");
        assertThat(source).isEqualTo(secondLookup);
        ArrayNode reordered = mapper.createArrayNode().add(source.path("rows").get(1)).add(source.path("rows").get(0));
        ObjectNode proposed = source.deepCopy();
        proposed.set("rows", reordered);
        assertThat(service.prepare(form, source, proposed, "44").differences()).isEmpty();
    }

    @Test void subtableDiffUsesRowIdentityAndRejectsUnknownExistingIdentity() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"rows","type":"subTable","typeConfig":{"columns":[{"id":"value","type":"text"}]}}]}
            """);
        ObjectNode source = (ObjectNode) service.identifyRows(mapper.readTree("{" + "\"rows\":[{\"value\":\"A\"}]}"), form, "123");
        ObjectNode proposed = source.deepCopy();
        ((ObjectNode) proposed.path("rows").get(0)).put("value", "B");
        assertThat(service.prepare(form, source, proposed, "44").differences()).hasSize(1);
        assertThat(service.prepare(form, source, proposed, "44").differences().get(0).path("fieldPath").asText())
                .endsWith("/value");
        ((ObjectNode) proposed.path("rows").get(0)).put("__recordRowId", "forged");
        assertThatThrownBy(() -> service.prepare(form, source, proposed, "44"))
                .hasMessageContaining("格式不正确");
        ArrayNode newRows = mapper.createArrayNode().add(source.path("rows").get(0));
        newRows.add(mapper.createObjectNode().put("__recordRowId", java.util.UUID.randomUUID().toString()).put("value", "C"));
        proposed.set("rows", newRows);
        assertThat(service.prepare(form, source, proposed, "44").differences()).hasSize(1);
        assertThat(service.prepare(form, source, proposed, "44").differences().get(0).path("changeType").asText())
                .isEqualTo("ROW_ADDED");
    }

    @Test void historicalSignatureCannotBeEditedAndIsNotCopiedIntoNewRevision() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"body","name":"内容","type":"text"},{"id":"signed","name":"签名","type":"signature","required":true}]}
            """);
        ObjectNode source = (ObjectNode) mapper.readTree("{" + "\"body\":\"old\",\"signed\":\"old signature\"}");
        ObjectNode proposed = source.deepCopy().put("body", "new");
        var prepared = service.prepare(form, source, proposed, "44");
        assertThat(prepared.differences()).hasSize(1);
        assertThat(prepared.values().has("signed")).isFalse();
        proposed.put("signed", "forged signature");
        assertThatThrownBy(() -> service.prepare(form, source, proposed, "44"))
                .hasMessageContaining("不可修改");
    }

    @Test void attachmentOrderDoesNotCountAsContentChange() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("{" + "\"fields\":[{\"id\":\"files\",\"type\":\"attachment\"}]}");
        ObjectNode source = (ObjectNode) mapper.readTree("{" + "\"files\":[{\"fileId\":\"1\"},{\"fileId\":\"2\"}]}");
        ObjectNode proposed = (ObjectNode) mapper.readTree("{" + "\"files\":[{\"fileId\":\"2\"},{\"fileId\":\"1\"}]}");
        assertThat(service.prepare(form, source, proposed, "44").differences()).isEmpty();
        ((ArrayNode) proposed.path("files")).remove(1);
        var removed = service.prepare(form, source, proposed, "44").differences();
        assertThat(removed).hasSize(1);
        assertThat(removed.get(0).path("changeType").asText()).isEqualTo("FILE_REMOVED");
        assertThat(removed.get(0).path("fieldPath").asText()).isEqualTo("files/1");
    }

    @Test void nestedHistoricalSignatureIsNotCarriedIntoNewRevisionWhenSubtableIsOmitted() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"body","type":"text"},{"id":"rows","type":"subTable","typeConfig":{
              "columns":[{"id":"note","type":"text"},{"id":"signed","type":"signature","required":true}]}}]}
            """);
        ObjectNode source = (ObjectNode) service.identifyRows(mapper.readTree("""
            {"body":"old","rows":[{"note":"original","signed":"old signature"}]}
            """), form, "123");
        ObjectNode proposal = mapper.createObjectNode().put("body", "new");
        var prepared = service.prepare(form, source, proposal, "44");
        assertThat(prepared.differences()).hasSize(1);
        assertThat(prepared.values().path("rows").get(0).has("signed")).isFalse();
        assertThat(source.path("rows").get(0).path("signed").asText()).isEqualTo("old signature");
    }

    @Test void productionRowIdentitySurvivesAMainFieldOnlyChange() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"body","type":"text"},{"id":"rows","type":"subTable","typeConfig":{"columns":[{"id":"value","type":"text"}]}}]}
            """);
        ObjectNode source = (ObjectNode) service.identifyRows(mapper.readTree("""
            {"body":"old","rows":[{"__rowId":"production-row-1","value":"A"}]}
            """), form, "123");
        var prepared = service.prepare(form, source, mapper.createObjectNode().put("body", "new"), "44");
        assertThat(prepared.differences()).hasSize(1);
        var saved = service.stripRowIds(prepared.values()).path("rows").get(0);
        assertThat(saved.path("__rowId").asText()).isEqualTo("production-row-1");
        assertThat(saved.has("__recordRowId")).isFalse();
    }

    @Test void productionRowReorderingAndNewRowsPreserveNativeIdentities() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"rows","type":"subTable","typeConfig":{"columns":[{"id":"value","type":"text"}]}}]}
            """);
        ObjectNode source = (ObjectNode) service.identifyRows(mapper.readTree("""
            {"rows":[{"__rowId":"row-a","value":"A"},{"__rowId":"row-b","value":"B"}]}
            """), form, "123");
        ObjectNode proposal = mapper.createObjectNode();
        ArrayNode rows = proposal.putArray("rows").add(source.path("rows").get(1)).add(source.path("rows").get(0));
        assertThat(service.prepare(form, source, proposal, "44").differences()).isEmpty();
        rows.add(mapper.createObjectNode().put("__rowId", "row-c").put("value", "C"));
        var prepared = service.prepare(form, source, proposal, "44");
        assertThat(prepared.differences()).hasSize(1);
        assertThat(prepared.differences().get(0).path("changeType").asText()).isEqualTo("ROW_ADDED");
        assertThat(service.stripRowIds(prepared.values()).path("rows").get(2).path("__rowId").asText()).isEqualTo("row-c");
    }

    @Test void productionRowIdentityCannotBeReplacedOrReusedByANewRow() throws Exception {
        ObjectNode form = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"rows","type":"subTable","typeConfig":{"columns":[{"id":"value","type":"text"}]}}]}
            """);
        ObjectNode source = (ObjectNode) service.identifyRows(mapper.readTree("""
            {"rows":[{"__rowId":"row-a","value":"A"}]}
            """), form, "123");
        ObjectNode proposal = source.deepCopy();
        ((ObjectNode) proposal.path("rows").get(0)).put("__rowId", "replaced");
        assertThatThrownBy(() -> service.prepare(form, source, proposal, "44")).hasMessageContaining("行标识");
        proposal.set("rows", mapper.createArrayNode().add(source.path("rows").get(0))
                .add(mapper.createObjectNode().put("__rowId", "row-a").put("value", "B")));
        assertThatThrownBy(() -> service.prepare(form, source, proposal, "44")).hasMessageContaining("行标识");
        proposal.set("rows", source.path("rows").deepCopy());
        ((ObjectNode) proposal.path("rows").get(0)).put("__recordRowId", java.util.UUID.randomUUID().toString());
        assertThatThrownBy(() -> service.prepare(form, source, proposal, "44")).hasMessageContaining("行标识");
        proposal.set("rows", source.path("rows").deepCopy());
        ((ObjectNode) proposal.path("rows").get(0)).remove("__rowId");
        assertThat(service.prepare(form, source, proposal, "44").values().path("rows").get(0).path("__rowId").asText()).isEqualTo("row-a");
        ((ObjectNode) proposal.path("rows").get(0)).put("unknown", "not a column");
        assertThatThrownBy(() -> service.prepare(form, source, proposal, "44")).hasMessageContaining("未知字段");
    }
}
