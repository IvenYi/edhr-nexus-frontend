package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.repository.RouteVersionRepository;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.service.ProductionService;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionObjectControllerTest {

    @Mock private ProductionService productionService;
    @Mock private RouteVersionRepository routeVersionRepository;
    @Mock private DhrTemplateVersionRepository dhrTemplateVersionRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Spy private ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    @InjectMocks private ProductionObjectController controller;

    @Test
    void splitWritesCompleteCreateSnapshotWithWorkOrderOrigin() {
        WorkOrder order = order();
        ProductionObject object = object(101L, "BATCH-001", BigDecimal.TEN);
        prepareResponseLookups(order);
        when(productionService.split(eq(10L), eq(20L), eq(BigDecimal.TEN), eq("BATCH-001"), eq("首批"), any(), any()))
                .thenReturn(object);
        when(idGenerator.nextId()).thenReturn(9001L);

        controller.split(10L, new ProductionObjectController.SplitRequest(
                20L, BigDecimal.TEN, "BATCH-001", "首批",
                LocalDateTime.of(2026, 8, 30, 8, 0), LocalDateTime.of(2026, 8, 30, 12, 0)));

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        AuditEvent event = captor.getValue();
        assertThat(event.getEntityType()).isEqualTo("PRODUCTION_OBJECT");
        assertThat(event.getEntityId()).isEqualTo("101");
        assertThat(event.getAction()).isEqualTo("CREATE");
        assertThat(event.getContentBefore()).isEqualTo("{}");
        assertThat(event.getContentAfter())
                .contains("\"objectNo\":\"BATCH-001\"")
                .contains("\"workOrderNo\":\"WO-001\"")
                .contains("\"orderNumber\":\"SO-001\"")
                .contains("\"productName\":\"产品 A\"")
                .contains("\"processVersion\":\"V1.0\"")
                .contains("\"targetQuantity\":10")
                .contains("\"status\":\"CREATED\"")
                .contains("\"remark\":\"首批\"");
    }

    @Test
    void batchSplitWritesOneCreateAuditPerProductionObject() {
        WorkOrder order = order();
        List<ProductionObject> objects = List.of(
                object(101L, "BATCH-001", BigDecimal.valueOf(6)),
                object(102L, "BATCH-002", BigDecimal.valueOf(4)));
        prepareResponseLookups(order);
        when(productionService.splitBatch(eq(10L), any())).thenReturn(objects);
        when(idGenerator.nextId()).thenReturn(9001L, 9002L);

        controller.splitBatch(10L, new ProductionObjectController.BatchSplitRequest(List.of(
                new ProductionObjectController.SplitRequest(20L, BigDecimal.valueOf(6), "BATCH-001", null, null, null),
                new ProductionObjectController.SplitRequest(20L, BigDecimal.valueOf(4), "BATCH-002", null, null, null))));

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues()).extracting(AuditEvent::getEntityId).containsExactly("101", "102");
        assertThat(captor.getAllValues()).allSatisfy(event -> {
            assertThat(event.getAction()).isEqualTo("CREATE");
            assertThat(event.getContentBefore()).isEqualTo("{}");
            assertThat(event.getContentAfter()).contains("\"workOrderNo\":\"WO-001\"");
        });
    }

    @Test
    void cancelWritesOnlyChangedStatusSnapshot() {
        WorkOrder order = order();
        ProductionObject object = object(101L, "BATCH-001", BigDecimal.TEN);
        prepareResponseLookups(order);
        when(productionService.requireObject(101L)).thenReturn(object);
        when(productionService.cancelObject(101L)).thenAnswer(invocation -> {
            object.setStatus("CANCELLED");
            return object;
        });
        when(idGenerator.nextId()).thenReturn(9001L);

        controller.cancel(101L);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        assertThat(captor.getValue().getAction()).isEqualTo("UPDATE");
        assertThat(captor.getValue().getContentBefore()).isEqualTo("{\"status\":\"CREATED\"}");
        assertThat(captor.getValue().getContentAfter()).isEqualTo("{\"status\":\"CANCELLED\"}");
    }

    private void prepareResponseLookups(WorkOrder order) {
        when(productionService.requireOrder(10L)).thenReturn(order);
        when(productionService.requireProduct(7L)).thenReturn(Material.builder().id(7L).name("产品 A").code("P-001").build());
        when(productionService.findProcessVersion(20L)).thenReturn(ProductProcessVersion.builder()
                .id(20L).productProcessId(30L).versionLabel("V1.0").productionMode("量产").productionForm("BATCH")
                .routeVersionId(40L).dhrTemplateVersionId(50L).build());
    }

    private WorkOrder order() {
        return WorkOrder.builder().id(10L).orderNo("WO-001").orderNumber("SO-001").productId(7L)
                .processVersionId(20L).productionMode("量产").productionForm("BATCH")
                .plannedQuantity(BigDecimal.TEN).status("CREATED").build();
    }

    private ProductionObject object(Long id, String objectNo, BigDecimal quantity) {
        return ProductionObject.builder().id(id).workOrderId(10L).objectNo(objectNo).objectType("BATCH")
                .processVersionId(20L).targetQuantity(quantity).remark("首批").status("CREATED").build();
    }
}
