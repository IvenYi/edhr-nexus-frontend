package com.zencas.edhr.production.controller;

import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.ProductionObjectRepository;
import com.zencas.edhr.production.service.ProductionService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ProductionBatchControllerTest {
    @Test
    void missingProductDoesNotHideOtherBatchesOrBreakFilteringAndPagination() {
        var repository = mock(ProductionObjectRepository.class);
        var service = mock(ProductionService.class);
        var controller = new ProductionBatchController(repository, service);
        var orphan = ProductionObject.builder().id(1L).objectNo("BATCH-OLD").workOrderId(10L).status("CREATED").build();
        var normal = ProductionObject.builder().id(2L).objectNo("BATCH-NEW").workOrderId(20L).status("CREATED").build();
        when(repository.findByTenantIdAndObjectTypeOrderByCreatedAtDesc("default", "BATCH")).thenReturn(List.of(orphan, normal));
        when(service.requireOrder(10L)).thenReturn(WorkOrder.builder().id(10L).orderNo("WO-OLD").productId(100L).build());
        when(service.requireOrder(20L)).thenReturn(WorkOrder.builder().id(20L).orderNo("WO-NEW").productId(200L).build());
        when(service.findProduct(200L)).thenReturn(Material.builder().name("现有产品").code("NEW").build());

        var page = controller.list(null, null, 1, 1).getData();
        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getContent()).singleElement().satisfies(row -> {
            assertThat(row.id()).isEqualTo("1");
            assertThat(row.productId()).isEqualTo("100");
            assertThat(row.productName()).isEqualTo("产品已不存在");
            assertThat(row.productCode()).isEqualTo("100");
            assertThat(row.status()).isEqualTo("CREATED");
        });
        assertThat(controller.list("现有产品", "CREATED", 1, 20).getData().getContent())
                .singleElement().satisfies(row -> assertThat(row.productCode()).isEqualTo("NEW"));
        assertThat(controller.list("BATCH-OLD", null, 1, 20).getData().getTotalElements()).isEqualTo(1);
        verify(service, never()).requireProduct(any());
        verify(repository, never()).save(any());
    }
}
