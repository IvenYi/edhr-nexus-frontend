package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.production.entity.*;
import com.zencas.edhr.production.repository.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import java.time.LocalDateTime;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

/** Measurement of real view/engine work with mocked repositories; not a DB latency benchmark. */
class ProductionReferenceCapacityObservationTest {
    @ParameterizedTest @ValueSource(ints={1,100,1000})
    void referenceLookupCurrentlyBuildsControlsForEveryConfiguredForm(int count) throws Exception {
        var mapper=new ObjectMapper();
        var access=mock(ExecutionAccess.class);
        var engine=spy(new ProductionExecutionEngine(mapper,access));
        var executions=mock(ProductionExecutionRepository.class);
        var production=mock(ProductionService.class);
        var outputs=mock(ProductionOutputService.class);
        var records=mock(FormInstanceRecordService.class);
        var service=new ProductionExecutionService(mock(ProductionObjectRepository.class),mock(WorkOrderRepository.class),
                executions,production,mock(ExecutionSnapshotBuilder.class),engine,mapper,mock(AuditEventRepository.class),
                mock(SnowflakeIdGenerator.class),access,mock(ExecutionPresenceRegistry.class),mock(UserAccountRepository.class),
                records,outputs,mock(DhrInstanceService.class));
        var object=ProductionObject.builder().id(1L).tenantId("default").objectType("BATCH").objectNo("capacity").workOrderId(2L).status("IN_PROGRESS").build();
        when(production.requireObject(1L)).thenReturn(object);
        when(production.requireOrder(2L)).thenReturn(WorkOrder.builder().id(2L).status("IN_PROCESS").build());
        when(access.permissions(any(),any(),any(),any())).thenAnswer(x->mapper.createObjectNode());
        var snapshot=mapper.createObjectNode(); snapshot.putObject("context").put("objectId","1");
        snapshot.putArray("routeNodes"); snapshot.putArray("routeEdges");
        var op=snapshot.putArray("operations").addObject().put("id","op").put("type","OPERATION");
        op.putArray("works"); var forms=op.putArray("forms");
        for(int i=0;i<count;i++) forms.addObject().put("id","f"+i).putArray("fields").addObject().put("id","ref").put("type","reference");
        var state=engine.initialState(snapshot);
        when(executions.findById(1L)).thenReturn(Optional.of(ProductionExecution.builder().objectId(1L).revision(1L)
                .startedAt(LocalDateTime.of(2026,10,26,0,0)).snapshotJson(snapshot.toString()).stateJson(state.toString()).build()));
        clearInvocations(engine);
        assertThat(service.references(1L,"op","f0","ref","needle",mapper.createObjectNode(),1,5)).isEmpty();
        verify(engine,times(count)).formControls(any(),any(),any());
        verify(outputs).object(1L);
        verify(records).projectCreationMetadata(eq(1L),eq("default"),any());
        verify(access).references(any(),eq("needle"),any(),eq(1),eq(5));
        verify(executions,never()).save(any());
    }
}
