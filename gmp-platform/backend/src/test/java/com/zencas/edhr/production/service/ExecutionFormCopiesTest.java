package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ExecutionFormCopiesTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExecutionAccess access = mock(ExecutionAccess.class);
    private final ProductionExecutionEngine engine = new ProductionExecutionEngine(mapper, access);

    @BeforeEach void permissions() {
        when(access.canAct(any(), any(), any(), any())).thenReturn(true);
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode().put("good", "EDIT").put("ng", "EDIT").put("scrap", "EDIT"));
    }

    @Test void copiesAreIndependentAndSumSavedIncrementsWithoutDoubleCounting() throws Exception {
        var snapshot = snapshot(true); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        save(snapshot, state, "f", "SUBMIT", 10);
        assertThat(engine.canManageCopies(form(snapshot), current(state), "user")).isTrue();
        engine.addFormCopy(snapshot, state, "op", "f", "user");
        assertThat(current(state).at("/forms/f:copy:2/values").isEmpty()).isTrue();
        save(snapshot, state, "f:copy:2", "SAVE", 12);
        assertThat(current(state).at("/forms/f/values/good").asInt()).isEqualTo(10);
        assertThat(ExecutionOutputSummary.project(mapper, snapshot.path("operations").get(0), current(state)).path("goodQuantity").asText()).isEqualTo("22");
        save(snapshot, state, "f:copy:2", "SAVE", 13);
        assertThat(ExecutionOutputSummary.project(mapper, snapshot.path("operations").get(0), current(state)).path("goodQuantity").asText()).isEqualTo("23");
        assertThatThrownBy(() -> engine.endForm(snapshot, state, "op", "f", true, "user")).hasMessageContaining("第 2 份未完成");
        assertThatThrownBy(() -> engine.complete(snapshot, state, "op", "user", true)).hasMessageContaining("第 2 份未完成");
        save(snapshot, state, "f:copy:2", "SUBMIT", 13);
        assertThat(engine.canManageCopies(form(snapshot), current(state), "user")).isTrue();
        engine.complete(snapshot, state, "op", "user");
        assertThat(current(state).at("/formGroups/f/endedReason").asText()).isEqualTo("OPERATION_COMPLETE");
        assertThatThrownBy(() -> engine.addFormCopy(snapshot, state, "op", "f", "user")).hasMessageContaining("不在执行中");
        assertThat(ExecutionFormCopies.status(current(state), "f")).isEqualTo("COMPLETED");
    }

    @Test void optionalUnfinishedCopiesRequireNoticeAndRemainInProgressAfterCompletion() throws Exception {
        var snapshot = snapshot(false); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        save(snapshot, state, "f", "SUBMIT", 10);
        engine.addFormCopy(snapshot, state, "op", "f", "user");
        save(snapshot, state, "f:copy:2", "SAVE", 12);
        assertThatThrownBy(() -> engine.complete(snapshot, state, "op", "user")).hasMessageContaining("告知");
        engine.complete(snapshot, state, "op", "user", true);
        assertThat(current(state).path("status").asText()).isEqualTo("COMPLETED");
        assertThat(ExecutionFormCopies.status(current(state), "f")).isEqualTo("IN_PROGRESS");
        assertThat(current(state).at("/forms/f/status").asText()).isEqualTo("COMPLETED");
        assertThat(current(state).at("/forms/f:copy:2/status").asText()).isEqualTo("ACTIVE");
        assertThat(current(state).at("/forms/f:copy:2/values/good").asInt()).isEqualTo(12);
        assertThat(state.path("history").toString()).contains("第 2 份", "已告知", "保持进行中");
        assertThatThrownBy(() -> save(snapshot, state, "f:copy:2", "SUBMIT", 12)).hasMessageContaining("不在执行中");
    }

    @Test void cannotWriteAnotherFormsCopyOrCreateWithoutFillingPermission() throws Exception {
        var snapshot = snapshot(true); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        assertThatThrownBy(() -> save(snapshot, state, "other:copy:2", "SAVE", 4)).hasMessageContaining("不属于");
        when(access.canAct(any(), any(), any(), any())).thenReturn(false);
        assertThatThrownBy(() -> engine.addFormCopy(snapshot, state, "op", "f", "other")).hasMessageContaining("不允许");
        assertThatThrownBy(() -> engine.endForm(snapshot, state, "op", "f", true, "other")).hasMessageContaining("不允许");
        assertThat(ExecutionFormCopies.ids(current(state), "f")).containsExactly("f");
    }

    @Test void optionalWorkFormEndsOnlyItsNodeWithoutCompletingRemainingWork() throws Exception {
        var snapshot = snapshot(false); var op = (ObjectNode) snapshot.path("operations").get(0);
        var workForm = form(snapshot).deepCopy(); workForm.put("id", "wf").put("workId", "w").put("workNodeId", "entry").put("required", false);
        op.withArray("forms").add(workForm);
        op.set("works", mapper.readTree("""
            [{"id":"w","name":"复核作业","nodes":[{"id":"s","data":{"kind":"START"}},
            {"id":"entry","data":{"kind":"FORM"}},{"id":"check","data":{"kind":"CONFIRMATION"}},{"id":"e","data":{"kind":"END"}}],
            "edges":[{"source":"s","target":"entry"},{"source":"entry","target":"check"},{"source":"check","target":"e"}]}]
            """));
        var state = engine.initialState(snapshot); engine.start(snapshot, state, "op", "user");
        assertThat(ExecutionFormCopies.required(op, workForm)).isFalse();
        assertThatThrownBy(() -> engine.endForm(snapshot, state, "op", "wf", false, "user")).hasMessageContaining("告知");
        engine.endForm(snapshot, state, "op", "wf", true, "user");
        assertThat(current(state).at("/forms/wf/status").asText()).isEqualTo("ACTIVE");
        assertThatThrownBy(() -> engine.complete(snapshot, state, "op", "user", true)).hasMessageContaining("复核作业");
        engine.confirm(snapshot, state, "op", "w", "check", "user");
        engine.complete(snapshot, state, "op", "user", true);
    }

    @Test void oldSingleCopyRetainsItsValuesAndCompletedLegacyIsNotReopened() throws Exception {
        var snapshot = snapshot(true); var state = engine.initialState(snapshot);
        var current = current(state); current.put("status", "IN_PROGRESS");
        current.withObject("/forms").putObject("f").put("status", "COMPLETED").put("lastSignatureId", "old-signature").putObject("values").put("good", 10).put("ng", 0).put("scrap", 0);
        assertThat(ExecutionFormCopies.ids(current, "f")).containsExactly("f");
        assertThat(ExecutionFormCopies.ended(current, "f")).isTrue();
        assertThat(engine.canManageCopies(form(snapshot), current, "user")).isFalse();
        engine.complete(snapshot, state, "op", "user");
        assertThat(current.at("/forms/f/lastSignatureId").asText()).isEqualTo("old-signature");
        assertThat(current.has("formGroups")).isFalse();
    }

    @Test void oldInProgressCopyFinishesWithOperationWithoutReplacingItsData() throws Exception {
        var snapshot = snapshot(true); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        current(state).remove("formGroups");
        current(state).withObject("/forms/f").put("lastSignatureId", "existing-evidence");
        save(snapshot, state, "f", "SUBMIT", 10);
        assertThat(ExecutionFormCopies.ended(current(state), "f")).isFalse();
        assertThat(current(state).at("/forms/f/lastSignatureId").asText()).isEqualTo("existing-evidence");
        assertThat(current(state).at("/forms/f/values/good").asInt()).isEqualTo(10);
        assertThat(engine.canManageCopies(form(snapshot), current(state), "user")).isTrue();
        engine.complete(snapshot, state, "op", "user");
    }

    @Test void workFormAdvancesOnlyAfterEveryExistingCopyIsComplete() throws Exception {
        var snapshot = workSnapshot(); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        engine.addFormCopy(snapshot, state, "op", "f", "user");
        save(snapshot, state, "f", "SUBMIT", 10);
        assertThat(current(state).at("/works/w/active/0").asText()).isEqualTo("entry");
        save(snapshot, state, "f:copy:2", "SAVE", 12);
        assertThat(current(state).at("/works/w/active/0").asText()).isEqualTo("entry");
        save(snapshot, state, "f:copy:2", "SUBMIT", 12);
        assertThat(current(state).at("/formGroups/f/endedReason").asText()).isEqualTo("ALL_COPIES_COMPLETED");
        assertThat(current(state).at("/works/w/active/0").asText()).isEqualTo("check");
        assertThat(current(state).at("/works/w/status").asText()).isEqualTo("RUNNING");
        assertThat(engine.canManageCopies(form(snapshot), current(state), "user")).isFalse();
        var beforeRetry = state.deepCopy();
        assertThatThrownBy(() -> save(snapshot, state, "f:copy:2", "SUBMIT", 12)).hasMessageContaining("无权");
        assertThat(state).isEqualTo(beforeRetry);
        assertThatThrownBy(() -> engine.complete(snapshot, state, "op", "user")).hasMessageContaining("复核作业");
        engine.confirm(snapshot, state, "op", "w", "check", "user");
        engine.complete(snapshot, state, "op", "user");
    }

    private ObjectNode workSnapshot() throws Exception {
        var snapshot = snapshot(true);
        form(snapshot).put("workId", "w").put("workNodeId", "entry");
        ((ObjectNode) snapshot.path("operations").get(0)).set("works", mapper.readTree("""
            [{"id":"w","name":"复核作业","nodes":[{"id":"s","data":{"kind":"START"}},
            {"id":"entry","data":{"kind":"FORM"}},{"id":"check","data":{"kind":"CONFIRMATION"}},{"id":"e","data":{"kind":"END"}}],
            "edges":[{"source":"s","target":"entry"},{"source":"entry","target":"check"},{"source":"check","target":"e"}]}]
            """));
        return snapshot;
    }

    private void save(ObjectNode snapshot, ObjectNode state, String instanceId, String action, int good) {
        engine.formAction(snapshot, state, "op", "f", instanceId, action, mapper.createObjectNode().put("good", good).put("ng", 0).put("scrap", 0), null, null, null, "user");
    }
    private ObjectNode current(ObjectNode state) { return (ObjectNode) state.path("operations").path("op"); }
    private ObjectNode form(ObjectNode snapshot) { return (ObjectNode) snapshot.path("operations").get(0).path("forms").get(0); }
    private ObjectNode snapshot(boolean required) throws Exception {
        var snapshot = (ObjectNode) mapper.readTree("""
            {"context":{"objectId":"1"},"operations":[{"id":"op","name":"装配","type":"OPERATION","works":[],"forms":[{"id":"f","name":"产出记录","fields":[
            {"id":"good","name":"良品","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_GOOD"}},
            {"id":"ng","name":"不良","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_NG"}},
            {"id":"scrap","name":"报废","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_SCRAP"}}]}]}],"routeNodes":[],"routeEdges":[]}
            """);
        form(snapshot).put("required", required); return snapshot;
    }
}
