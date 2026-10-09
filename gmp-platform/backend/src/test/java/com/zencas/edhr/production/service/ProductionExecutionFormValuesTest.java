package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ProductionExecutionFormValuesTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExecutionAccess access = mock(ExecutionAccess.class);
    private final ProductionExecutionEngine engine = new ProductionExecutionEngine(mapper, access);

    @BeforeEach void permissions() {
        when(access.canAct(any(), any(), any(), any())).thenReturn(true);
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode()
                .put("entries", "EDIT").put("unit", "EDIT").put("note", "EDIT").put("quantity", "EDIT"));
        when(access.permissions(any(), any(), any(), any(), eq(true))).thenReturn(mapper.createObjectNode().put("entries", "EDIT"));
    }

    @Test void savedRowsReceiveStableIdentityAcrossReopenReorderAndDeletion() throws Exception {
        ObjectNode snapshot = snapshot("""
                [{"id":"entries","name":"上料明细","type":"subTable","typeConfig":{"columns":[
                  {"id":"quantity","name":"实际用量","type":"number","required":true}]}}]
                """);
        ObjectNode state = start(snapshot);
        ObjectNode request = tree("{\"entries\":[{}, {\"quantity\":2}]}");
        save(snapshot, state, request);
        assertThat(request.path("entries").get(0).has("__rowId")).isFalse();
        JsonNode saved = values(state).path("entries").deepCopy();
        String first = saved.get(0).path("__rowId").asText(), second = saved.get(1).path("__rowId").asText();
        assertThat(UUID.fromString(first).toString()).isEqualTo(first);
        assertThat(second).isNotEqualTo(first);
        assertThatThrownBy(() -> engine.formAction(snapshot, state, "op", "f", "SUBMIT", values(state).deepCopy(), null, null, null, "1"))
                .hasMessageContaining("实际用量");
        ObjectNode reopened = tree(mapper.writeValueAsString(state));
        ArrayNode reversed = mapper.createArrayNode().add(saved.get(1)).add(saved.get(0));
        save(snapshot, reopened, mapper.createObjectNode().set("entries", reversed));
        assertThat(values(reopened).path("entries").get(0).path("__rowId").asText()).isEqualTo(second);
        assertThat(values(reopened).path("entries").get(1).path("__rowId").asText()).isEqualTo(first);
        save(snapshot, reopened, mapper.createObjectNode().set("entries", mapper.createArrayNode().add(saved.get(1))));
        assertThat(values(reopened).path("entries").get(0).path("__rowId").asText()).isEqualTo(second);
        assertThat(engine.validateValues(snapshot.at("/operations/0/forms/0"), values(reopened))).isEmpty();
    }

    @Test void draftSaveRejectsDuplicateMalformedIdentityAndUndeclaredColumns() throws Exception {
        ObjectNode snapshot = tableSnapshot(); ObjectNode state = start(snapshot);
        String id = UUID.randomUUID().toString();
        assertThatThrownBy(() -> save(snapshot, state, tree("{\"entries\":[{\"__rowId\":\"" + id + "\"},{\"__rowId\":\"" + id + "\"}]}")))
                .hasMessageContaining("身份重复");
        for (String invalid : new String[]{"not-a-uuid", "1-1-1-1-1", "", "AAAAAAAA-1111-4111-8111-111111111111"}) {
            assertThatThrownBy(() -> save(snapshot, state, tree("{\"entries\":[{\"__rowId\":\"" + invalid + "\"}]}")))
                    .hasMessageContaining("身份格式");
        }
        assertThatThrownBy(() -> save(snapshot, state, tree("{\"entries\":[{\"__rowId\":null}]}"))).hasMessageContaining("身份格式");
        assertThatThrownBy(() -> save(snapshot, state, tree("{\"entries\":[{\"unknown\":1}]}"))).hasMessageContaining("不存在");
        assertThatThrownBy(() -> save(snapshot, state, tree("{\"entries\":[1]}"))).hasMessageContaining("行格式");
        assertThat(values(state)).isEmpty();
    }

    @Test void readonlyValuesFollowRowIdentityAndCannotBeChangedOrRemoved() throws Exception {
        ObjectNode snapshot = snapshot("""
                [{"id":"entries","name":"明细","type":"subTable","typeConfig":{"columns":[
                  {"id":"note","name":"受控说明","type":"text","readOnly":true},
                  {"id":"quantity","name":"用量","type":"number"}]}}]
                """);
        ObjectNode state = start(snapshot);
        String first = UUID.randomUUID().toString(), second = UUID.randomUUID().toString();
        values(state).set("entries", mapper.readTree("[{\"__rowId\":\"" + first + "\",\"note\":\"A\",\"quantity\":1},{\"__rowId\":\"" + second + "\",\"note\":\"B\",\"quantity\":2}]"));
        JsonNode rows = values(state).path("entries").deepCopy();
        save(snapshot, state, mapper.createObjectNode().set("entries", mapper.createArrayNode().add(rows.get(1)).add(rows.get(0))));
        assertThat(values(state).at("/entries/0/note").asText()).isEqualTo("B");
        ObjectNode changed = values(state).deepCopy(); ((ObjectNode) changed.path("entries").get(0)).put("note", "A");
        assertThatThrownBy(() -> save(snapshot, state, changed)).hasMessageContaining("只读");
        ObjectNode removed = values(state).deepCopy(); ((ObjectNode) removed.path("entries").get(0)).remove("note");
        assertThatThrownBy(() -> save(snapshot, state, removed)).hasMessageContaining("只读");
        ObjectNode forgedIdentity = values(state).deepCopy(); ((ObjectNode) forgedIdentity.path("entries").get(0)).put("__rowId", UUID.randomUUID().toString());
        assertThatThrownBy(() -> save(snapshot, state, forgedIdentity)).hasMessageContaining("只读");
    }

    @Test void wholeTableReadonlyCannotBeBypassedByValidIdentity() throws Exception {
        ObjectNode snapshot = tableSnapshot(); ObjectNode state = start(snapshot);
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode().put("entries", "READ_ONLY"));
        assertThatThrownBy(() -> save(snapshot, state, tree("{\"entries\":[{\"__rowId\":\"" + UUID.randomUUID() + "\"}]}")))
                .hasMessageContaining("只读");
    }

    @Test void signatureEvidenceContainsIdentityBeforeSigningAndForgedSignatureIsRejected() throws Exception {
        ObjectNode snapshot = snapshot("""
                [{"id":"entries","name":"明细","type":"subTable","typeConfig":{"columns":[
                  {"id":"quantity","name":"用量","type":"number"},{"id":"signed","name":"签名","type":"signature"}]}}]
                """);
        ObjectNode state = start(snapshot);
        when(access.signField(any(), eq("password"))).thenReturn(tree("{\"type\":\"signature\",\"signatureId\":\"sig-1\"}"));
        engine.formAction(snapshot, state, "op", "f", null, "SIGN_FIELD", tree("{\"entries\":[{\"quantity\":2}]}"), null, null, "password", "1",
                tree("{\"tableId\":\"entries\",\"rowIndex\":0,\"fieldId\":\"signed\"}"));
        ArgumentCaptor<ObjectNode> evidence = ArgumentCaptor.forClass(ObjectNode.class);
        verify(access).signField(evidence.capture(), eq("password"));
        assertThat(evidence.getValue().at("/values/entries/0/__rowId")).isEqualTo(values(state).at("/entries/0/__rowId"));
        assertThat(values(state).at("/entries/0/signed/signatureId").asText()).isEqualTo("sig-1");
        ObjectNode unchanged = (ObjectNode) values(state).deepCopy(); save(snapshot, state, unchanged);
        assertThat(values(state).at("/entries/0/signed/signatureId").asText()).isEqualTo("sig-1");
        ObjectNode forged = values(state).deepCopy(); ((ObjectNode) forged.path("entries").get(0)).set("signed", tree("{\"type\":\"signature\",\"signatureId\":\"fake\"}"));
        assertThatThrownBy(() -> save(snapshot, state, forged)).hasMessageContaining("只读");
        ObjectNode moved = values(state).deepCopy(); ((ObjectNode) moved.path("entries").get(0)).put("__rowId", UUID.randomUUID().toString());
        assertThatThrownBy(() -> save(snapshot, state, moved)).hasMessageContaining("签名字段");
    }

    @Test void mainDefaultsArePersistedAndSelectLabelsResolveToStoredOptionValues() throws Exception {
        ObjectNode snapshot = snapshot("""
                [{"id":"note","name":"说明","type":"text","typeConfig":{"defaultValue":"初始说明"}},
                 {"id":"quantity","name":"用量","type":"number","typeConfig":{"defaultValue":"2.5"}},
                 {"id":"unit","name":"单位","type":"singleSelect","typeConfig":{"defaultValue":"件","options":[{"label":"件","value":"piece"},{"label":"包","value":"pack"}]}},
                 {"id":"unset","name":"未设默认","type":"singleSelect","typeConfig":{"options":"件:piece"}}]
                """);
        ObjectNode state = start(snapshot);
        assertThat(values(state).path("note").asText()).isEqualTo("初始说明");
        assertThat(values(state).path("quantity").decimalValue()).isEqualByComparingTo("2.5");
        assertThat(values(state).path("unit").asText()).isEqualTo("piece");
        assertThat(values(state).has("unset")).isFalse();
        save(snapshot, state, tree("{\"note\":\"\",\"quantity\":0,\"unit\":\"pack\"}"));
        save(snapshot, state, tree("{}"));
        assertThat(values(state).path("note").asText()).isEmpty();
        assertThat(values(state).path("quantity").asInt()).isZero();
        assertThat(values(state).path("unit").asText()).isEqualTo("pack");
    }

    @Test void frozenCanvasDefaultsApplyToMainAndNewRowsWithoutOverwritingInputOrClearedValues() throws Exception {
        ObjectNode snapshot = snapshot("""
                [{"id":"note","name":"说明","type":"text","typeConfig":{}},
                 {"id":"entries","name":"明细","type":"subTable","typeConfig":{"columns":[
                   {"id":"unit","name":"单位","type":"singleSelect","readOnly":true,"typeConfig":{"options":"件:piece\\n包:pack"}},
                   {"id":"quantity","name":"用量","type":"number","typeConfig":{"defaultValue":1}},
                   {"id":"note","name":"说明","type":"text","typeConfig":{"defaultValue":"新行"}}]}}]
                """);
        ((ObjectNode) snapshot.at("/operations/0/forms/0")).set("canvas", mapper.readTree("""
                {"nodes":[{"bindings":{"fieldId":"note","defaultValue":"画布默认"}},
                  {"bindings":{"subTableId":"entries","subTableFieldId":"unit","defaultValue":"件"}}]}
                """));
        ObjectNode state = start(snapshot);
        assertThat(values(state).path("note").asText()).isEqualTo("画布默认");
        save(snapshot, state, tree("{\"entries\":[{\"quantity\":5},{\"note\":\"\"}]}"));
        assertThat(values(state).at("/entries/0/quantity").asInt()).isEqualTo(5);
        assertThat(values(state).at("/entries/0/unit").asText()).isEqualTo("piece");
        assertThat(values(state).at("/entries/1/quantity").asInt()).isEqualTo(1);
        assertThat(values(state).at("/entries/1/note").asText()).isEmpty();
        ObjectNode cleared = values(state).deepCopy(); ((ObjectNode) cleared.path("entries").get(0)).put("note", "");
        save(snapshot, state, cleared); save(snapshot, state, tree("{}"));
        assertThat(values(state).at("/entries/0/note").asText()).isEmpty();
    }

    @Test void ambiguousDisabledAndInvalidSelectDefaultsAreNotGuessed() throws Exception {
        ObjectNode snapshot = snapshot("""
                [{"id":"ambiguous","name":"同名","type":"singleSelect","typeConfig":{"defaultValue":"件","options":[{"label":"件","value":"a"},{"label":"件","value":"b"}]}},
                 {"id":"disabled","name":"停用","type":"singleSelect","typeConfig":{"defaultValue":"a","options":[{"label":"件","value":"a","status":"disabled"}]}},
                 {"id":"invalid","name":"无效","type":"singleSelect","typeConfig":{"defaultValue":"missing","options":"件:piece"}},
                 {"id":"exact","name":"确切值","type":"singleSelect","typeConfig":{"defaultValue":"pack","options":"件:piece\\n包:pack"}}]
                """);
        ObjectNode state = start(snapshot);
        assertThat(values(state).has("ambiguous")).isFalse();
        assertThat(values(state).has("disabled")).isFalse();
        assertThat(values(state).has("invalid")).isFalse();
        assertThat(values(state).path("exact").asText()).isEqualTo("pack");
    }

    private ObjectNode tableSnapshot() throws Exception {
        return snapshot("[{\"id\":\"entries\",\"name\":\"明细\",\"type\":\"subTable\",\"typeConfig\":{\"columns\":[{\"id\":\"quantity\",\"name\":\"用量\",\"type\":\"number\"}]}}]");
    }

    private ObjectNode snapshot(String fields) throws Exception {
        return tree("""
                {"context":{"objectId":"1","objectType":"BATCH","objectNo":"B01"},
                 "operations":[{"id":"op","name":"甲","type":"OPERATION","forms":[{"id":"f","name":"记录","required":true,"fields":%s}],"works":[]}],
                 "routeNodes":[{"id":"op","type":"OPERATION"}],"routeEdges":[]}
                """.formatted(fields));
    }

    private ObjectNode start(ObjectNode snapshot) {
        ObjectNode state = engine.initialState(snapshot); engine.start(snapshot, state, "op", "1"); return state;
    }

    private ObjectNode values(ObjectNode state) { return (ObjectNode) state.at("/operations/op/forms/f/values"); }
    private void save(ObjectNode snapshot, ObjectNode state, ObjectNode values) {
        engine.formAction(snapshot, state, "op", "f", "SAVE", values, null, null, null, "1");
    }
    private ObjectNode tree(String source) throws Exception { return (ObjectNode) mapper.readTree(source); }
}
