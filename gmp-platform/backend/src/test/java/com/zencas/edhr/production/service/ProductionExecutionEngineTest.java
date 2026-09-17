package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import com.zencas.edhr.identity.entity.UserAccount;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ProductionExecutionEngineTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExecutionAccess access = mock(ExecutionAccess.class);
    private final ProductionExecutionEngine engine = new ProductionExecutionEngine(mapper, access);

    @BeforeEach void permissions() {
        when(access.canAct(any(), any(), any(), any())).thenReturn(true);
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode().put("temperature", "EDIT"));
    }

    @Test void blocksSuccessorUntilEveryParallelPredecessorCompletes() throws Exception {
        ObjectNode snapshot = snapshot(); ObjectNode state = engine.initialState(snapshot);
        assertThat(engine.startIssues(snapshot, state, engine.find(snapshot.path("operations"), "c"))).hasSize(2);
        engine.start(snapshot, state, "a", "1"); engine.complete(snapshot, state, "a", "1");
        assertThat(engine.startIssues(snapshot, state, engine.find(snapshot.path("operations"), "c"))).singleElement().asString().contains("乙");
        engine.start(snapshot, state, "b", "1"); engine.complete(snapshot, state, "b", "1");
        engine.start(snapshot, state, "c", "1"); engine.complete(snapshot, state, "c", "1");
        assertThat(engine.allComplete(snapshot, state)).isTrue();
        assertThat(state.path("history")).hasSize(6);
    }

    @Test void rejectsDuplicateStartAndOutOfOrderCompletion() throws Exception {
        var snapshot = snapshot(); var state = engine.initialState(snapshot);
        assertThatThrownBy(() -> engine.start(snapshot, state, "c", "1")).hasMessageContaining("前置");
        engine.start(snapshot, state, "a", "1");
        assertThatThrownBy(() -> engine.start(snapshot, state, "a", "1")).hasMessageContaining("已经开工");
        assertThatThrownBy(() -> engine.complete(snapshot, state, "b", "1")).hasMessageContaining("不在执行中");
    }

    @Test void savedDraftDoesNotSatisfyRequiredFormAndReadOnlyValuesCannotBeForged() throws Exception {
        var snapshot = withForm(); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "a", "1");
        engine.formAction(snapshot, state, "a", "f", "SAVE", tree("{}"), null, null, null, "1");
        assertThatThrownBy(() -> engine.complete(snapshot, state, "a", "1")).hasMessageContaining("第 1 份未完成");
        assertThatThrownBy(() -> engine.formAction(snapshot, state, "a", "f", "SUBMIT", tree("{}"), null, null, null, "1")).hasMessageContaining("温度");
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode().put("temperature", "READ_ONLY"));
        assertThatThrownBy(() -> engine.formAction(snapshot, state, "a", "f", "SAVE", tree("{\"temperature\": 5}"), null, null, null, "1")).hasMessageContaining("只读");
    }

    @Test void validSubmissionPersistsValuesAndUnlocksCompletion() throws Exception {
        var snapshot = withForm(); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "a", "1");
        engine.formAction(snapshot, state, "a", "f", "SUBMIT", tree("{\"temperature\": 25}"), null, null, null, "1");
        assertThat(state.path("operations").path("a").path("forms").path("f").path("values").path("temperature").asInt()).isEqualTo(25);
        engine.complete(snapshot, state, "a", "1");
        assertThat(state.path("operations").path("a").path("status").asText()).isEqualTo("COMPLETED");
    }

    @Test void rejectsUnknownFieldsAndInvalidNumbers() throws Exception {
        var snapshot = withForm(); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "a", "1");
        assertThatThrownBy(() -> engine.formAction(snapshot, state, "a", "f", "SAVE", tree("{\"unknown\": 1}"), null, null, null, "1")).hasMessageContaining("不存在");
        assertThatThrownBy(() -> engine.formAction(snapshot, state, "a", "f", "SUBMIT", tree("{\"temperature\": \"abc\"}"), null, null, null, "1")).hasMessageContaining("有效数值");
    }

    @Test void configuredConfirmationCannotBeSkippedByCompletingOperation() throws Exception {
        var snapshot = snapshot();
        ((ObjectNode) snapshot.path("operations").get(0)).set("works", mapper.readTree("""
            [{"id":"w","name":"清场确认","nodes":[
              {"id":"s","data":{"kind":"START"}}, {"id":"confirm","data":{"kind":"CONFIRMATION","label":"确认清场"}},
              {"id":"e","data":{"kind":"END"}}], "edges":[{"source":"s","target":"confirm"},{"source":"confirm","target":"e"}]}]
            """));
        var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "a", "1");
        assertThatThrownBy(() -> engine.complete(snapshot, state, "a", "1")).hasMessageContaining("清场确认");
        engine.confirm(snapshot, state, "a", "w", "confirm", "1");
        engine.complete(snapshot, state, "a", "1");
        assertThat(state.path("operations").path("a").path("works").path("w").path("status").asText()).isEqualTo("COMPLETED");
    }

    @Test void missingRuntimeFactsNeverPassEvenWhenUsedUnderNot() throws Exception {
        assertThatThrownBy(() -> engine.evaluate(tree("{\"not\":{\"fact\":\"unknown\",\"operator\":\"is-present\"}}"), tree("{}"))).hasMessageContaining("没有可靠来源");
    }

    @Test void routeCyclesAndUnsupportedNotificationsAreVisibleStartBlockers() throws Exception {
        var snapshot = snapshot();
        ((com.fasterxml.jackson.databind.node.ArrayNode) snapshot.path("routeEdges")).addObject().put("source", "c").put("target", "a");
        assertThat(engine.startIssues(snapshot, engine.initialState(snapshot), snapshot.path("operations").get(0))).anyMatch(issue -> issue.contains("循环"));
        var clean = snapshot();
        ((ObjectNode) clean.path("operations").get(0)).set("works", mapper.readTree("""
            [{"id":"w","name":"通知","nodes":[{"id":"s","data":{"kind":"START"}},
              {"id":"n","data":{"kind":"NOTIFICATION"}},{"id":"e","data":{"kind":"END"}}],
              "edges":[{"source":"s","target":"n"},{"source":"n","target":"e"}]}]
            """));
        assertThat(engine.startIssues(clean, engine.initialState(clean), clean.path("operations").get(0))).anyMatch(issue -> issue.contains("通知"));
    }

    @Test void parallelWorkJoinWaitsForBothConfirmationBranches() throws Exception {
        var snapshot = snapshot();
        ((ObjectNode) snapshot.path("operations").get(0)).set("works", mapper.readTree("""
            [{"id":"w","nodes":[{"id":"s","data":{"kind":"START"}},{"id":"x","data":{"kind":"CONFIRMATION"}},
            {"id":"y","data":{"kind":"CONFIRMATION"}},{"id":"z","data":{"kind":"CONFIRMATION"}},{"id":"e","data":{"kind":"END"}}],
            "edges":[{"source":"s","target":"x"},{"source":"s","target":"y"},{"source":"x","target":"z"},{"source":"y","target":"z"},{"source":"z","target":"e"}]}]
            """));
        var state = engine.initialState(snapshot); engine.start(snapshot, state, "a", "1");
        engine.confirm(snapshot, state, "a", "w", "x", "1");
        assertThatThrownBy(() -> engine.confirm(snapshot, state, "a", "w", "z", "1")).hasMessageContaining("不可执行");
        engine.confirm(snapshot, state, "a", "w", "y", "1"); engine.confirm(snapshot, state, "a", "w", "z", "1");
        engine.complete(snapshot, state, "a", "1");
    }

    @Test void skippedWorkFormNeverSatisfiesRequiredEdhrItem() throws Exception {
        var op = mapper.readTree("""
            {"id":"a","forms":[{"id":"direct","name":"必填记录","versionId":"5","required":true,"fulfilledBy":"work-form"},
             {"id":"work-form","name":"必填记录","versionId":"5","workId":"w","fields":[]}],"works":[{"id":"w","name":"条件作业"}]}
            """);
        var state = tree("{\"status\":\"IN_PROGRESS\",\"forms\":{},\"works\":{\"w\":{\"status\":\"COMPLETED\"}}}");
        assertThat(engine.completionIssues(op, state)).singleElement().asString().contains("必填记录");
        state.withObject("/forms").putObject("work-form").put("status", "COMPLETED");
        assertThat(engine.completionIssues(op, state)).isEmpty();
    }

    @Test void skippedUnboundWorkFormDoesNotBlockCompletedConditionalWork() throws Exception {
        var op = mapper.readTree("""
            {"id":"a","forms":[{"id":"work-form","name":"分支表单","workId":"w","fields":[]}],
             "works":[{"id":"w","name":"条件作业"}]}
            """);
        var state = tree("{\"status\":\"IN_PROGRESS\",\"forms\":{},\"works\":{\"w\":{\"status\":\"COMPLETED\"}}}");
        assertThat(engine.completionIssues(op, state)).isEmpty();
        state.withObject("/forms").putObject("work-form").put("status", "ACTIVE");
        assertThat(engine.completionIssues(op, state)).singleElement().asString().contains("第 1 份未完成");
    }

    @Test void enforcesNumericStructurePrecisionAndDateFormat() throws Exception {
        var form = mapper.readTree("""
            {"fields":[{"id":"integer","name":"件数","type":"number","typeConfig":{"numberMode":"integer","precision":0}},
              {"id":"decimal","name":"读数","type":"number","typeConfig":{"numberMode":"decimal","precision":2}},
              {"id":"date","name":"日期","type":"datetime","typeConfig":{"mode":"date"}}]}
            """);
        assertThat(engine.validateValues(form, mapper.readTree("{\"integer\":1.25,\"decimal\":1.2345,\"date\":\"2026-02-30\"}"))).hasSize(3);
        assertThat(engine.validateValues(form, mapper.readTree("{\"integer\":2,\"decimal\":1.23,\"date\":\"2026-02-28\"}"))).isEmpty();
    }

    @Test void requiredFieldsOwnedByLaterApprovalDoNotBlockEarlierSubmissionButBlockFinalCompletion() throws Exception {
        var snapshot = withForm(); var form = (ObjectNode) snapshot.path("operations").get(0).path("forms").get(0);
        ((com.fasterxml.jackson.databind.node.ArrayNode) form.path("fields")).addObject().put("id", "reviewNote").put("name", "复核结果").put("type", "text").put("required", true);
        form.set("flow", mapper.readTree("""
            {"nodes":[{"id":"s","data":{"kind":"START"}},{"id":"a","data":{"kind":"APPROVAL"}},{"id":"e","data":{"kind":"END"}}],
             "edges":[{"source":"s","target":"a"},{"source":"a","target":"e"}]}
            """));
        var state = engine.initialState(snapshot); engine.start(snapshot, state, "a", "1");
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode().put("temperature", "EDIT").put("reviewNote", "READ_ONLY"));
        engine.formAction(snapshot, state, "a", "f", "SUBMIT", tree("{\"temperature\":25}"), null, null, null, "1");
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode().put("temperature", "READ_ONLY").put("reviewNote", "EDIT"));
        assertThatThrownBy(() -> engine.formAction(snapshot, state, "a", "f", "APPROVE", tree("{}"), null, null, null, "1")).hasMessageContaining("复核结果");
        engine.formAction(snapshot, state, "a", "f", "APPROVE", tree("{\"reviewNote\":\"合格\"}"), null, null, null, "1");
        engine.endForm(snapshot, state, "a", "f", false, "1");
        engine.complete(snapshot, state, "a", "1");
    }

    @Test void evaluatesStructuredConditionsWithoutExecutingCode() throws Exception {
        assertThat(engine.evaluate(tree("""
            {"all":[{"fact":"sourceType","operator":"equals","value":"SN"},
            {"any":[{"fact":"sourceNumber","operator":"starts-with","value":"SN-"},
            {"fact":"sourceNumber","operator":"in","value":["other"]}]}]}
            """), tree("{\"sourceType\":\"SN\",\"sourceNumber\":\"SN-01\"}"))).isTrue();
    }

    @Test void approvalAndSignatureAreRequiredBeforeFormCompletion() throws Exception {
        var snapshot = withForm(); var form = (ObjectNode) snapshot.path("operations").get(0).path("forms").get(0);
        form.set("flow", tree("""
            {"nodes":[{"id":"s","data":{"kind":"START"}},
              {"id":"a","data":{"kind":"APPROVAL","config":{"buttons":[{"action":"APPROVE","label":"审核","visible":true}],
              "buttonEvents":[{"id":"sign","event":"BEFORE","action":"APPROVE","signatureMethod":"ACCOUNT_PASSWORD","builtin":"NONE"}]}}},
              {"id":"e","data":{"kind":"END"}}],"edges":[{"source":"s","target":"a"},{"source":"a","target":"e"}]}
            """));
        var state = engine.initialState(snapshot); engine.start(snapshot, state, "a", "1");
        engine.formAction(snapshot, state, "a", "f", "SUBMIT", tree("{\"temperature\":25}"), null, null, null, "1");
        assertThatThrownBy(() -> engine.complete(snapshot, state, "a", "1")).hasMessageContaining("第 1 份未完成");
        when(access.sign(anyString(), anyString(), anyString(), any(), any(), any())).thenThrow(ExecutionSnapshotBuilder.invalid("签署账户或密码不正确"));
        assertThatThrownBy(() -> engine.formAction(snapshot, state, "a", "f", "APPROVE", tree("{}"), null, "u", "bad", "1")).hasMessageContaining("密码不正确");
        doReturn("signature-1").when(access).sign(anyString(), anyString(), anyString(), any(), any(), any());
        engine.formAction(snapshot, state, "a", "f", "APPROVE", tree("{}"), null, "u", "valid", "1");
        engine.endForm(snapshot, state, "a", "f", false, "1");
        engine.complete(snapshot, state, "a", "1");
    }

    @Test void transferDoesNotAdvanceOrChangeFormValuesAndRequiresReason() throws Exception {
        var snapshot = withForm(); var form = (ObjectNode) snapshot.path("operations").get(0).path("forms").get(0);
        form.set("flow", tree("""
            {"nodes":[{"id":"s","data":{"kind":"START"}},
              {"id":"a","data":{"kind":"APPROVAL","label":"质量复核","config":{"buttons":[
                {"action":"APPROVE","label":"通过"},{"action":"RETURN","label":"退回"},{"action":"TRANSFER","label":"转办"}]}}},
              {"id":"e","data":{"kind":"END"}}],"edges":[{"source":"s","target":"a"},{"source":"a","target":"e"}]}
            """));
        var state = engine.initialState(snapshot); engine.start(snapshot, state, "a", "1");
        engine.formAction(snapshot, state, "a", "f", "SUBMIT", tree("{\"temperature\":25}"), null, null, null, "1");
        when(access.requireTransferTarget(any(), any(), eq("1"), eq("2"))).thenReturn(UserAccount.builder().id(2L).displayName("复核员2").build());

        assertThatThrownBy(() -> engine.transferForm(snapshot, state, "a", "f", null, "2", " ", "1", "复核员1")).hasMessageContaining("转办原因");
        assertThatThrownBy(() -> engine.transferForm(snapshot, state, "a", "f", null, "2", "x".repeat(501), "1", "复核员1")).hasMessageContaining("500");
        engine.transferForm(snapshot, state, "a", "f", null, "2", "交由当班复核员", "1", "复核员1");

        JsonNode formState = state.path("operations").path("a").path("forms").path("f");
        assertThat(formState.path("active").get(0).asText()).isEqualTo("a");
        assertThat(formState.path("values").path("temperature").asInt()).isEqualTo(25);
        assertThat(formState.path("transferAssignees").path("a").asText()).isEqualTo("2");
        assertThat(state.path("history").get(state.path("history").size() - 1).path("actionCode").asText()).isEqualTo("TRANSFER");
    }

    @Test void explicitLegacyOrHiddenButtonsDoNotEnableTransfer() throws Exception {
        for (String buttons : List.of(
            "[{\"action\":\"APPROVE\",\"label\":\"通过\"},{\"action\":\"RETURN\",\"label\":\"退回\"}]",
            "[{\"action\":\"APPROVE\",\"label\":\"通过\"},{\"action\":\"RETURN\",\"label\":\"退回\"},{\"action\":\"TRANSFER\",\"label\":\"转办\",\"visible\":false}]")) {
            var snapshot = withForm(); var form = (ObjectNode) snapshot.path("operations").get(0).path("forms").get(0);
            form.set("flow", tree("""
                {"nodes":[{"id":"s","data":{"kind":"START"}},
                  {"id":"a","data":{"kind":"APPROVAL","config":{"buttons":%s}}},
                  {"id":"e","data":{"kind":"END"}}],"edges":[{"source":"s","target":"a"},{"source":"a","target":"e"}]}
                """.formatted(buttons)));
            var state = engine.initialState(snapshot); engine.start(snapshot, state, "a", "1");
            engine.formAction(snapshot, state, "a", "f", "SUBMIT", tree("{\"temperature\":25}"), null, null, null, "1");
            assertThatThrownBy(() -> engine.transferForm(snapshot, state, "a", "f", null, "2", "交接", "1", "复核员1"))
                .hasMessageContaining("未启用转办");
        }
    }

    private ObjectNode snapshot() throws Exception {
        return tree("""
            {"context":{"objectId":"1","objectType":"BATCH","objectNo":"B01"},
             "operations":[{"id":"a","name":"甲","type":"OPERATION","forms":[],"works":[]},
                           {"id":"b","name":"乙","type":"OPERATION","forms":[],"works":[]},
                           {"id":"c","name":"丙","type":"OPERATION","forms":[],"works":[]}],
             "routeNodes":[{"id":"a","type":"OPERATION"},{"id":"b","type":"OPERATION"},{"id":"c","type":"OPERATION"}],
             "routeEdges":[{"source":"a","target":"c"},{"source":"b","target":"c"}]}
            """);
    }
    private ObjectNode withForm() throws Exception {
        var snapshot = snapshot();
        ((ObjectNode) snapshot.path("operations").get(0)).set("forms", mapper.readTree("""
            [{"id":"f","name":"温度记录","required":true,"fields":[{"id":"temperature","name":"温度","type":"number","required":true}]}]
            """));
        return snapshot;
    }
    private ObjectNode tree(String source) throws Exception { return (ObjectNode) mapper.readTree(source); }
}
