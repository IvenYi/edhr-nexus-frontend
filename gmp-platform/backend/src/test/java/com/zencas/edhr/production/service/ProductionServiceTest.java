package com.zencas.edhr.production.service;

import com.zencas.edhr.production.engine.WorkOrderStatusMachine;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.ProductionObjectRepository;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.service.ProductProcessResolutionService;
import com.zencas.edhr.workflow.engine.StateMachineDef;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionServiceTest {

    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private ProductionObjectRepository productionObjectRepository;
    @Mock private com.zencas.edhr.masterdata.repository.MaterialRepository materialRepository;
    @Mock private com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository processVersionRepository;
    @Mock private com.zencas.edhr.masterdata.service.ProductProcessResolutionService processResolutionService;
    @Mock private com.zencas.edhr.workflow.engine.StateMachineService stateMachineService;
    @Mock private com.zencas.edhr.common.util.SnowflakeIdGenerator idGenerator;
    @Mock private DhrInstanceService dhrInstances;
    @Mock private com.zencas.edhr.production.repository.ProductionExecutionRepository executions;
    @InjectMocks private ProductionService productionService;

    @Test
    void normalizesConfiguredBatchLabelsToTheProductionObjectType() {
        assertThat(ProductionService.normalizeProductionForm("批次")).isEqualTo("BATCH");
        assertThat(ProductionService.normalizeProductionForm("BATCH")).isEqualTo("BATCH");
        assertThat(ProductionService.normalizeProductionForm("SN")).isEqualTo("SN");
    }

    @Test
    void rejectsUnsupportedProductionForms() {
        assertThatThrownBy(() -> ProductionService.normalizeProductionForm("批次转SN"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("有效的生产形态");
    }

    @Test
    void usesTheConfirmedLightweightWorkOrderLifecycle() {
        StateMachineDef definition = WorkOrderStatusMachine.class.getAnnotation(StateMachineDef.class);
        assertThat(definition.transitions()).containsExactlyInAnyOrder(
                "CREATED->IN_PROCESS", "CREATED->COMPLETED", "IN_PROCESS->COMPLETED",
                "IN_PROCESS->EARLY_TERMINATED", "COMPLETED->CLOSED", "CREATED->CANCELLED", "CREATED->EARLY_TERMINATED");
    }

    @Test
    void keepsCreatedOrderAvailableWhenItsOnlyObjectIsCancelled() {
        WorkOrder order = WorkOrder.builder().id(10L).status("CREATED").build();
        ProductionObject object = ProductionObject.builder()
                .id(20L).workOrderId(order.getId()).status("CREATED")
                .targetQuantity(BigDecimal.ONE).build();
        when(productionObjectRepository.findWorkOrderId("default", object.getId())).thenReturn(Optional.of(order.getId()));
        when(productionObjectRepository.findByTenantIdAndIdForUpdate("default", object.getId()))
                .thenReturn(Optional.of(object));
        when(productionObjectRepository.save(object)).thenReturn(object);
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId()))
                .thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(List.of(object));

        productionService.cancelObject(object.getId());

        assertThat(object.getStatus()).isEqualTo("CANCELLED");
        assertThat(order.getStatus()).isEqualTo("CREATED");
        org.mockito.Mockito.verify(stateMachineService, org.mockito.Mockito.never()).transit(eq("WORK_ORDER"), eq(order.getId()), eq("CREATED"), eq("COMPLETED"));
    }

    @Test
    void endsInProgressObjectWithRequiredReason() {
        WorkOrder order = WorkOrder.builder().id(10L).status("IN_PROCESS").plannedQuantity(BigDecimal.ONE).build();
        ProductionObject object = ProductionObject.builder().id(20L).workOrderId(order.getId()).status("IN_PROGRESS").targetQuantity(BigDecimal.ONE).build();
        when(productionObjectRepository.findWorkOrderId("default", object.getId())).thenReturn(Optional.of(order.getId()));
        when(productionObjectRepository.findByTenantIdAndIdForUpdate("default", object.getId())).thenReturn(Optional.of(object));
        when(productionObjectRepository.save(object)).thenReturn(object);
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId())).thenReturn(List.of(object));

        productionService.endObject(object.getId(), "设备故障");

        assertThat(object.getStatus()).isEqualTo("EARLY_TERMINATED");
        assertThat(object.getTerminationReason()).isEqualTo("设备故障");
        assertThat(object.getTerminationAt()).isNotNull();
        assertThat(order.getStatus()).isEqualTo("IN_PROCESS");
        verify(stateMachineService).transit("PRODUCTION_OBJECT", object.getId(), "IN_PROGRESS", "EARLY_TERMINATED");
        verify(dhrInstances).terminateWithProductionObject(eq(object.getId()), eq("设备故障"), any(LocalDateTime.class));
        org.mockito.Mockito.verify(stateMachineService, org.mockito.Mockito.never()).transit(eq("WORK_ORDER"), any(), any(), any());
    }

    @Test
    void cancelsUnsplitCreatedOrderThroughTheStateMachine() {
        WorkOrder order = WorkOrder.builder().id(10L).status("CREATED").build();
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(List.of());
        when(workOrderRepository.save(order)).thenReturn(order);

        productionService.cancelOrder(order.getId());

        assertThat(order.getStatus()).isEqualTo("CANCELLED");
        verify(stateMachineService).transit("WORK_ORDER", order.getId(), "CREATED", "CANCELLED");
    }

    @Test
    void blocksSplitUntilTheBatchHasAnExplicitProcessVersion() {
        WorkOrder order = order(BigDecimal.TEN);
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(List.of());

        assertThatThrownBy(() -> productionService.split(order.getId(), null, BigDecimal.ONE, null, null))
                .hasMessageContaining("必须选择制程");
    }

    @Test
    void splitsCreatedWorkOrderWithoutReleaseStep() {
        WorkOrder order = order(BigDecimal.TEN);
        ProductProcessVersion version = version(100L, "BATCH");
        prepareSplit(order, List.of(), version);
        when(idGenerator.nextId()).thenReturn(200L);
        when(productionObjectRepository.existsByTenantIdAndObjectNo("default", "BATCH-200")).thenReturn(false);
        when(workOrderRepository.save(order)).thenReturn(order);
        when(productionObjectRepository.save(any(ProductionObject.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductionObject created = productionService.split(order.getId(), version.getId(), BigDecimal.ONE, "BATCH-200", null);

        assertThat(created.getObjectNo()).isEqualTo("BATCH-200");
        assertThat(created.getStatus()).isEqualTo("CREATED");
        assertThat(created.getProcessVersionId()).isEqualTo(version.getId());
    }

    @Test
    void splitsInProcessWorkOrderWithAnExplicitVersion() {
        WorkOrder order = order(BigDecimal.TEN);
        order.setStatus("IN_PROCESS");
        ProductProcessVersion version = version(100L, "BATCH");
        ProductionObject inProgress = ProductionObject.builder().id(200L).objectType("BATCH")
                .status("IN_PROGRESS").targetQuantity(BigDecimal.valueOf(2)).build();
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(List.of(inProgress));
        when(processResolutionService.resolve(eq(order.getProductId()), any())).thenReturn(new ProductProcessResolutionService.ProcessResolution("PRODUCT", order.getProductId(), false, null, List.of(version)));
        when(idGenerator.nextId()).thenReturn(201L);
        when(productionObjectRepository.existsByTenantIdAndObjectNo("default", "BATCH-201")).thenReturn(false);
        when(workOrderRepository.save(order)).thenReturn(order);
        when(productionObjectRepository.save(any(ProductionObject.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductionObject created = productionService.split(order.getId(), version.getId(), BigDecimal.ONE, "BATCH-201", null);

        assertThat(created.getStatus()).isEqualTo("CREATED");
        assertThat(created.getProcessVersionId()).isEqualTo(version.getId());
    }

    @Test
    void rejectsSnObjectQuantityOtherThanOne() {
        WorkOrder order = order(BigDecimal.TEN);
        ProductProcessVersion version = version(100L, "SN");
        prepareSplit(order, List.of(), version);

        assertThatThrownBy(() -> productionService.split(order.getId(), version.getId(), BigDecimal.TWO, null, null))
                .hasMessageContaining("必须为1");
    }

    @Test
    void createsSnObjectWithUnitQuantityAndConfiguredNumber() {
        WorkOrder order = order(BigDecimal.TEN);
        ProductProcessVersion version = version(100L, "SN");
        prepareSplit(order, List.of(), version);
        when(idGenerator.nextId()).thenReturn(201L);
        when(productionObjectRepository.existsByTenantIdAndObjectNo("default", "SN-ABC-001")).thenReturn(false);
        when(workOrderRepository.save(order)).thenReturn(order);
        when(productionObjectRepository.save(any(ProductionObject.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductionObject created = productionService.split(order.getId(), version.getId(), BigDecimal.ONE, "SN-ABC-001", null);

        assertThat(created.getObjectType()).isEqualTo("SN");
        assertThat(created.getTargetQuantity()).isEqualByComparingTo(BigDecimal.ONE);
        assertThat(created.getObjectNo()).isEqualTo("SN-ABC-001");
    }

    @Test
    void rejectsObjectTargetsBeyondTheWorkOrderPlan() {
        WorkOrder order = order(BigDecimal.TEN);
        
        ProductProcessVersion version = version(100L, "BATCH");
        ProductionObject existing = ProductionObject.builder().id(200L).objectType("BATCH")
                .targetQuantity(BigDecimal.valueOf(8)).build();
        prepareSplit(order, List.of(existing), version);

        assertThatThrownBy(() -> productionService.split(order.getId(), version.getId(), BigDecimal.valueOf(3), null, null))
                .hasMessageContaining("不能超过工单计划数量");
    }

    @Test
    void allowsResplittingTheQuantityOfACancelledUnstartedObject() {
        WorkOrder order = order(BigDecimal.TEN);
        ProductProcessVersion version = version(100L, "BATCH");
        ProductionObject cancelled = ProductionObject.builder()
                .id(200L).objectType("BATCH").status("CANCELLED")
                .targetQuantity(BigDecimal.TEN).build();
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(List.of(cancelled));
        when(processResolutionService.resolve(eq(order.getProductId()), any())).thenReturn(new ProductProcessResolutionService.ProcessResolution("PRODUCT", order.getProductId(), false, null, List.of(version)));
        when(idGenerator.nextId()).thenReturn(201L);
        when(productionObjectRepository.existsByTenantIdAndObjectNo("default", "BATCH-201")).thenReturn(false);
        when(workOrderRepository.save(order)).thenReturn(order);
        when(productionObjectRepository.save(any(ProductionObject.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ProductionObject replacement = productionService.split(
                order.getId(), version.getId(), BigDecimal.TEN, "BATCH-201", null);

        assertThat(replacement.getTargetQuantity()).isEqualByComparingTo(BigDecimal.TEN);
        assertThat(replacement.getStatus()).isEqualTo("CREATED");
    }

    @Test
    void completesInProcessOrderWhenRemainingObjectsAreCompletedOrCancelled() {
        WorkOrder order = WorkOrder.builder().id(10L).status("IN_PROCESS").plannedQuantity(BigDecimal.ONE).build();
        ProductionObject completing = ProductionObject.builder().id(20L).workOrderId(order.getId())
                .status("IN_PROGRESS").targetQuantity(BigDecimal.ONE).build();
        ProductionObject cancelled = ProductionObject.builder().id(21L).workOrderId(order.getId())
                .status("CANCELLED").targetQuantity(BigDecimal.ONE).build();
        when(productionObjectRepository.findWorkOrderId("default", completing.getId())).thenReturn(Optional.of(order.getId()));
        when(productionObjectRepository.findByTenantIdAndIdForUpdate("default", completing.getId())).thenReturn(Optional.of(completing));
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(List.of(completing, cancelled));
        when(productionObjectRepository.save(completing)).thenReturn(completing);
        when(workOrderRepository.save(order)).thenReturn(order);

        productionService.completeObject(completing.getId());

        assertThat(order.getStatus()).isEqualTo("COMPLETED");
        verify(stateMachineService).transit("WORK_ORDER", order.getId(), "IN_PROCESS", "COMPLETED");
    }

    @Test
    void rejectsInvalidProductionObjectPlannedWindow() {
        WorkOrder order = order(BigDecimal.TEN);
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> productionService.split(order.getId(), null, BigDecimal.ONE, null, null,
                LocalDateTime.of(2026, 8, 30, 10, 0), LocalDateTime.of(2026, 8, 30, 9, 0)))
                .hasMessageContaining("计划结束时间不能早于计划开始时间");
    }

    @Test
    void allowsNewBatchUsingAnotherVersionWithTheSameProductionForm() {
        WorkOrder order = order(BigDecimal.TEN);
        ProductProcessVersion version = version(101L, "BATCH");
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(List.of(ProductionObject.builder().objectType("BATCH").processVersionId(100L).build()));
        when(processResolutionService.resolve(eq(order.getProductId()), any()))
                .thenReturn(new ProductProcessResolutionService.ProcessResolution("PRODUCT", order.getProductId(), false, null, List.of(version)));
        assertThat(productionService.requireProcessVersion(order, 101L)).isSameAs(version);
    }

    @Test
    void editsQuantityByAvailableIncrementAndRetainsTheOrderPlan() {
        WorkOrder order = order(BigDecimal.TEN);
        ProductionObject object = editable(order);
        when(processResolutionService.findVersionForProduct(1L, 100L)).thenReturn(Optional.of(version(100L, "BATCH")));
        when(productionObjectRepository.save(object)).thenReturn(object);
        productionService.updateObject(20L, 100L, BigDecimal.TEN, "计划调整", null, null);
        assertThat(object.getTargetQuantity()).isEqualByComparingTo("10");
        assertThat(order.getPlannedQuantity()).isEqualByComparingTo("10");
        assertThatThrownBy(() -> productionService.updateObject(20L, 100L, new BigDecimal("10.5"), null, null, null))
                .hasMessageContaining("剩余可分配");
        productionService.updateObject(20L, 100L, new BigDecimal("0.5"), null, null, null);
        assertThat(productionService.allocatedQuantity(order.getId())).isEqualByComparingTo("0.5");
    }

    @Test
    void rejectsEditsAfterExecutionExistsEvenIfObjectStatusIsCreated() {
        WorkOrder order = order(BigDecimal.TEN);
        editable(order);
        when(executions.existsById(20L)).thenReturn(true);
        assertThatThrownBy(() -> productionService.updateObject(20L, 100L, BigDecimal.ONE, null, null, null)).hasMessageContaining("未开工");
    }

    @Test
    void keepsOrderOpenWhenCompletedBatchesDoNotCoverThePlan() {
        WorkOrder order = order(BigDecimal.TEN); order.setStatus("IN_PROCESS");
        ProductionObject object = editable(order); object.setStatus("IN_PROGRESS");
        when(productionObjectRepository.save(object)).thenReturn(object);
        productionService.completeObject(object.getId());
        assertThat(object.getStatus()).isEqualTo("COMPLETED");
        assertThat(order.getStatus()).isEqualTo("IN_PROCESS");
    }

    @Test
    void manualOrderEndRequiresTerminalChildrenAndAReason() {
        WorkOrder order = order(BigDecimal.TEN); order.setStatus("IN_PROCESS");
        ProductionObject object = editable(order);
        assertThatThrownBy(() -> productionService.endOrder(order.getId(), "停止计划")).hasMessageContaining("请先取消");
        object.setStatus("IN_PROGRESS");
        assertThatThrownBy(() -> productionService.endOrder(order.getId(), "停止计划")).hasMessageContaining("请先取消");
        object.setStatus("EARLY_TERMINATED");
        assertThatThrownBy(() -> productionService.endOrder(order.getId(), " ")).hasMessageContaining("结束原因");
        when(workOrderRepository.save(order)).thenReturn(order);
        productionService.endOrder(order.getId(), " 停止剩余计划 ");
        assertThat(order.getStatus()).isEqualTo("EARLY_TERMINATED");
        assertThat(order.getTerminationReason()).isEqualTo("停止剩余计划");
        assertThat(order.getTerminationAt()).isNotNull();
        assertThat(order.getPlannedQuantity()).isEqualByComparingTo("10");
    }

    @Test
    void existingReferenceMustRemainApplicableEffectiveAndInTheSameForm() {
        WorkOrder order = order(BigDecimal.TEN);
        ProductionObject object = ProductionObject.builder().objectType("BATCH").processVersionId(100L).build();
        when(processResolutionService.findVersionForProduct(1L, 100L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> productionService.requireApplicableProcess(object, order)).hasMessageContaining("不适用");
        ProductProcessVersion version = version(100L, "BATCH");
        when(processResolutionService.findVersionForProduct(1L, 100L)).thenReturn(Optional.of(version));
        version.setEffectiveTo(LocalDateTime.now().minusSeconds(1));
        assertThatThrownBy(() -> productionService.requireApplicableProcess(object, order)).hasMessageContaining("失效");
        version.setEffectiveTo(null); version.setProductionForm("SN");
        assertThatThrownBy(() -> productionService.requireApplicableProcess(object, order)).hasMessageContaining("生产形态");
        version.setProductionForm("BATCH");
        assertThat(productionService.requireApplicableProcess(object, order)).isSameAs(version);
    }

    private ProductionObject editable(WorkOrder order) {
        ProductionObject object = ProductionObject.builder().id(20L).workOrderId(order.getId()).objectType("BATCH")
                .status("CREATED").processVersionId(100L).targetQuantity(new BigDecimal("8")).build();
        org.mockito.Mockito.lenient().when(productionObjectRepository.findWorkOrderId("default", 20L)).thenReturn(Optional.of(order.getId()));
        org.mockito.Mockito.lenient().when(productionObjectRepository.findByTenantIdAndIdForUpdate("default", 20L)).thenReturn(Optional.of(object));
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        org.mockito.Mockito.lenient().when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId())).thenReturn(List.of(object));
        return object;
    }

    @Test
    void blocksObjectStartWhenItsWorkOrderIsAlreadyTerminal() {
        ProductionObject object = ProductionObject.builder().id(20L).workOrderId(10L).status("CREATED").build();
        when(productionObjectRepository.findWorkOrderId("default", object.getId())).thenReturn(Optional.of(10L));
        WorkOrder order = WorkOrder.builder().id(10L).status("CANCELLED").build();
        when(productionObjectRepository.findByTenantIdAndIdForUpdate("default", object.getId()))
                .thenReturn(Optional.of(object));
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> productionService.startObject(object.getId()))
                .hasMessageContaining("不允许生产对象开工");
    }

    private void prepareSplit(WorkOrder order, List<ProductionObject> existing, ProductProcessVersion version) {
        when(workOrderRepository.findByTenantIdAndIdForUpdate("default", order.getId())).thenReturn(Optional.of(order));
        when(productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc("default", order.getId()))
                .thenReturn(existing);
        when(processResolutionService.resolve(eq(order.getProductId()), any()))
                .thenReturn(new ProductProcessResolutionService.ProcessResolution("PRODUCT", order.getProductId(), false, null, List.of(version)));
    }

    private WorkOrder order(BigDecimal plannedQuantity) {
        return WorkOrder.builder().id(10L).productId(1L).status("CREATED").plannedQuantity(plannedQuantity).build();
    }

    private ProductProcessVersion version(Long id, String productionForm) {
        return ProductProcessVersion.builder().id(id).productionMode("量产").productionForm(productionForm).build();
    }
}
