package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.production.entity.ProductionExecution;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.ProductionExecutionRepository;
import com.zencas.edhr.production.repository.ProductionObjectRepository;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// Real engine transitions feed the public read service; repositories and identity are fixtures.
class ProductionExecutionAvailabilityTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ExecutionAccess access = mock(ExecutionAccess.class);
    private final ProductionExecutionEngine engine = new ProductionExecutionEngine(mapper, access);
    private final ProductionExecutionRepository executions = mock(ProductionExecutionRepository.class);
    private final ProductionService production = mock(ProductionService.class);
    private final ExecutionSnapshotBuilder snapshots = mock(ExecutionSnapshotBuilder.class);
    private final ProductionExecutionService service = new ProductionExecutionService(
            mock(ProductionObjectRepository.class), mock(WorkOrderRepository.class), executions, production,
            snapshots, engine, mapper, mock(AuditEventRepository.class), mock(SnowflakeIdGenerator.class), access,
            mock(ExecutionPresenceRegistry.class), mock(UserAccountRepository.class),
            mock(FormInstanceRecordService.class), mock(ProductionOutputService.class), mock(DhrInstanceService.class));
    private final ProductionObject object = ProductionObject.builder().id(1L).tenantId("default")
            .objectNo("availability-fixture").objectType("BATCH").workOrderId(2L).status("IN_PROGRESS").build();
    private final WorkOrder order = WorkOrder.builder().id(2L).status("IN_PROCESS").build();

    @BeforeEach void fixtures() {
        when(production.requireObject(1L)).thenReturn(object);
        when(production.requireOrder(2L)).thenReturn(order);
        when(access.canAct(any(), any(), any(), any())).thenReturn(true);
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode());
    }

    @Test void beforeFirstStartProjectsOnlyFrozenPlansWithoutCreatingInstances() throws Exception {
        object.setStatus("CREATED");
        var snapshot = snapshot("BATCH");
        when(snapshots.build(object, order)).thenReturn(snapshot);
        var view = service.get(1L);
        assertThat(view.at("/availability/op/formCopies/f/status").asText()).isEqualTo("WAITING_OPERATION_START");
        assertThat(view.at("/availability/op/formCopies/wf/status").asText()).isEqualTo("WAITING_OPERATION_START");
        assertThat(view.at("/availability/op/formCopies/f/instanceIds")).isEmpty();
        assertThat(view.at("/availability/op/formCopies/wf/instanceIds")).isEmpty();
        assertThat(view.at("/state/operations/op/forms")).isEmpty();
        verify(executions, never()).save(any());
    }

    @Test void skippedConditionalFormStaysNotApplicableAfterOperationCompletion() throws Exception {
        var snapshot = snapshot("BATCH"); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        assertThat(state.at("/operations/op/works/w/status").asText()).isEqualTo("COMPLETED");
        assertThat(state.at("/operations/op/works/w/conditionFacts/branch/sourceType").asText()).isEqualTo("BATCH");
        assertThat(state.at("/operations/op/forms").has("wf")).isFalse();
        assertThat(read(snapshot, state).at("/availability/op/formCopies/wf/status").asText()).isEqualTo("NOT_APPLICABLE");
        engine.formAction(snapshot, state, "op", "f", "SUBMIT", mapper.createObjectNode(), null, null, null, "user");
        engine.complete(snapshot, state, "op", "user");
        object.setStatus("COMPLETED");
        var view = read(snapshot, state);
        assertThat(view.at("/availability/op/formCopies/wf/status").asText()).isEqualTo("NOT_APPLICABLE");
        assertThat(view.at("/availability/op/formCopies/wf/instanceIds")).isEmpty();
        assertThat(view.at("/availability/op/forms/wf/canAct").asBoolean()).isFalse();
        assertThat(view.at("/availability/op/formCopies/wf/canAdd").asBoolean()).isFalse();
        assertThat(view.at("/availability/op/formCopies/wf/canEnd").asBoolean()).isFalse();
    }

    @Test void reachedWorkCopyAndMultipleConfiguredCopiesKeepTheirActualStatusAndIdentity() throws Exception {
        var snapshot = snapshot("SN"); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        engine.formAction(snapshot, state, "op", "f", "SUBMIT", mapper.createObjectNode(), null, null, null, "user");
        engine.addFormCopy(snapshot, state, "op", "f", "user", "第二次复核");
        var active = read(snapshot, state);
        assertThat(active.at("/availability/op/formCopies/f/instanceIds")).extracting(node -> node.asText()).containsExactly("f", "f:copy:2");
        assertThat(active.at("/availability/op/formCopies/f/status").asText()).isEqualTo("IN_PROGRESS");
        assertThat(active.at("/availability/op/formCopies/wf/instanceIds")).extracting(node -> node.asText()).containsExactly("wf");
        assertThat(active.at("/availability/op/formCopies/wf/status").asText()).isEqualTo("IN_PROGRESS");
        engine.formAction(snapshot, state, "op", "f", "f:copy:2", "SUBMIT", mapper.createObjectNode(), null, null, null, "user");
        engine.formAction(snapshot, state, "op", "wf", "SUBMIT", mapper.createObjectNode(), null, null, null, "user");
        engine.complete(snapshot, state, "op", "user");
        object.setStatus("COMPLETED");
        var completed = read(snapshot, state);
        assertThat(completed.at("/availability/op/formCopies/f/status").asText()).isEqualTo("COMPLETED");
        assertThat(completed.at("/availability/op/formCopies/wf/status").asText()).isEqualTo("COMPLETED");
    }

    @Test void optionalUnfinishedWorkCopyIsNotRelabeledNotApplicableWhenWorkAndOperationEnd() throws Exception {
        var snapshot = snapshot("SN");
        ((ObjectNode) snapshot.at("/operations/0/forms/1")).put("required", false);
        var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "user");
        engine.endForm(snapshot, state, "op", "wf", true, "user");
        engine.formAction(snapshot, state, "op", "f", "SUBMIT", mapper.createObjectNode(), null, null, null, "user");
        engine.complete(snapshot, state, "op", "user", true);
        object.setStatus("COMPLETED");
        var view = read(snapshot, state);
        assertThat(view.at("/state/operations/op/works/w/status").asText()).isEqualTo("COMPLETED");
        assertThat(view.at("/availability/op/formCopies/wf/status").asText()).isEqualTo("IN_PROGRESS");
        assertThat(view.at("/availability/op/formCopies/wf/instanceIds")).extracting(node -> node.asText()).containsExactly("wf");
        assertThat(view.at("/availability/op/formCopies/wf/instances/wf/canAct").asBoolean()).isFalse();
    }

    private ObjectNode read(ObjectNode snapshot, ObjectNode state) {
        assertThat(object.getObjectType()).isEqualTo(snapshot.at("/context/objectType").asText());
        var execution = ProductionExecution.builder().objectId(1L).revision(3L).startedAt(LocalDateTime.of(2026, 10, 16, 0, 0))
                .snapshotJson(snapshot.toString()).stateJson(state.toString()).build();
        when(executions.findById(1L)).thenReturn(Optional.of(execution));
        var view = service.get(1L);
        assertThat(execution.getSnapshotJson()).isEqualTo(snapshot.toString());
        assertThat(execution.getStateJson()).isEqualTo(state.toString());
        assertThat(view.path("snapshot")).isEqualTo(snapshot);
        assertThat(view.at("/state/history")).isEqualTo(state.path("history"));
        assertThat(view.at("/state/operations/op/works")).isEqualTo(state.at("/operations/op/works"));
        assertThat(view.at("/state/operations/op/formGroups")).isEqualTo(state.at("/operations/op/formGroups"));
        state.at("/operations/op/forms").fields().forEachRemaining(copy -> {
            var projected = view.at("/state/operations/op/forms").path(copy.getKey());
            assertThat(projected.path("status")).isEqualTo(copy.getValue().path("status"));
            assertThat(projected.path("values")).isEqualTo(copy.getValue().path("values"));
        });
        verify(executions, never()).save(any());
        return view;
    }

    private ObjectNode snapshot(String objectType) throws Exception {
        var snapshot = (ObjectNode) mapper.readTree("""
            {"context":{"objectId":"1","objectNo":"availability-fixture"},"routeNodes":[],"routeEdges":[],
             "operations":[{"id":"op","name":"装配","type":"OPERATION","forms":[
               {"id":"f","name":"独立记录","required":true,"fields":[]},
               {"id":"wf","name":"SN分支记录","workId":"w","workNodeId":"entry","fields":[]}],
             "works":[{"id":"w","name":"条件作业","nodes":[
               {"id":"s","data":{"kind":"START"}},
               {"id":"branch","data":{"kind":"CONDITION","config":{
                 "conditionBranches":[{"id":"batch","fieldCatalogVersion":"work-runtime-fields-v1",
                   "conditionRule":{"fact":"sourceType","operator":"equals","value":"BATCH"}}],
                 "conditionDefaultBranch":{"id":"otherwise"}}}},
               {"id":"entry","data":{"kind":"FORM"}},{"id":"e","data":{"kind":"END"}}],
               "edges":[{"source":"s","target":"branch"},
                 {"source":"branch","sourceHandle":"condition-batch","target":"e"},
                 {"source":"branch","sourceHandle":"otherwise","target":"entry"},
                 {"source":"entry","target":"e"}]}]}]}
            """);
        ((ObjectNode) snapshot.path("context")).put("objectType", objectType);
        object.setObjectType(objectType);
        return snapshot;
    }
}
