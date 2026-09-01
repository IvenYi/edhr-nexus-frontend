package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import com.zencas.edhr.production.service.ProductionService;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrderControllerTest {

    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private MaterialRepository materialRepository;
    @Mock private ProductProcessVersionRepository processVersionRepository;
    @Mock private ProductionService productionService;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private AuditEventRepository auditEventRepository;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks private WorkOrderController controller;

    @Test
    void createWritesBeforeAndAfterWorkOrderSnapshots() throws Exception {
        Material product = Material.builder().id(7L).name("产品 A").code("P-001").build();
        WorkOrder saved = WorkOrder.builder().id(100L).orderNo("WO-001").productId(7L)
                .plannedQuantity(BigDecimal.TEN).status("CREATED").build();
        when(idGenerator.nextId()).thenReturn(100L, 101L);
        when(workOrderRepository.findByTenantIdAndOrderNo("default", "WO-001")).thenReturn(Optional.empty());
        when(materialRepository.findByTenantIdAndId("default", 7L)).thenReturn(Optional.of(product));
        when(workOrderRepository.save(any(WorkOrder.class))).thenReturn(saved);

        controller.create(new WorkOrderController.WorkOrderRequest(
                "WO-001", "ORDER-1", 7L, null, BigDecimal.TEN, null, null, "备注"));

        var captor = org.mockito.ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        AuditEvent event = captor.getValue();
        assertThat(event.getAction()).isEqualTo("CREATE");
        assertThat(event.getContentBefore()).isEqualTo("{}");
        assertThat(event.getContentAfter()).contains("\"orderNo\":\"WO-001\"")
                .contains("\"productName\":\"产品 A\"")
                .contains("\"plannedQuantity\":10");
    }

    @Test
    void cancelWritesStatusChangeBeforeServiceMutatesManagedEntity() {
        WorkOrder order = WorkOrder.builder().id(100L).orderNo("WO-001").productId(7L)
                .plannedQuantity(BigDecimal.TEN).status("CREATED").build();
        when(productionService.requireOrder(100L)).thenReturn(order);
        when(productionService.cancelOrder(100L)).thenAnswer(invocation -> { order.setStatus("CANCELLED"); return order; });
        when(materialRepository.findByTenantIdAndId("default", 7L))
                .thenReturn(Optional.of(Material.builder().id(7L).name("产品 A").code("P-001").build()));
        when(idGenerator.nextId()).thenReturn(101L);

        controller.cancel(100L);

        var captor = org.mockito.ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        assertThat(captor.getValue().getContentBefore()).contains("\"status\":\"CREATED\"");
        assertThat(captor.getValue().getContentAfter()).contains("\"status\":\"CANCELLED\"");
    }
}
