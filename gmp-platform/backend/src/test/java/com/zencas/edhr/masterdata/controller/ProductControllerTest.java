package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock private ProductFamilyRepository productFamilyRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private AuditEventRepository auditEventRepository;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks private ProductController controller;

    @Test
    void requiresProductFamilyPermissionForLegacyEndpoints() {
        PreAuthorize authorization = ProductController.class.getAnnotation(PreAuthorize.class);

        assertThat(authorization).isNotNull();
        assertThat(authorization.value()).isEqualTo("hasAuthority('master-data.product-families')");
    }

    @Test
    void auditsLegacyCreateWithDescriptionSnapshot() throws Exception {
        when(idGenerator.nextId()).thenReturn(101L, 102L);
        when(productFamilyRepository.save(any(ProductFamily.class))).thenAnswer(invocation -> invocation.getArgument(0));

        controller.create(ProductFamily.builder().code("PF-001").name("产品簇").description("描述").build());

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository).save(captor.capture());
        AuditEvent audit = captor.getValue();
        assertThat(audit.getEntityType()).isEqualTo("PRODUCT_FAMILY");
        assertThat(audit.getAction()).isEqualTo("CREATE");
        assertThat(objectMapper.readTree(audit.getContentAfter()).get("description").asText()).isEqualTo("描述");
    }

    @Test
    void auditsLegacyUpdateAndDeleteWithBeforeAndAfterSnapshots() {
        ProductFamily existing = ProductFamily.builder().id(101L).code("PF-001").name("旧名称").description("旧描述").build();
        when(productFamilyRepository.findById(101L)).thenReturn(Optional.of(existing));
        when(productFamilyRepository.save(any(ProductFamily.class))).thenAnswer(invocation -> invocation.getArgument(0));
        controller.update(101L, ProductFamily.builder().code("PF-001").name("新名称").description("新描述").build());
        controller.delete(101L);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        assertThat(captor.getAllValues()).extracting(AuditEvent::getAction).containsExactly("UPDATE", "DELETE");
        assertThat(captor.getAllValues().get(0).getContentBefore()).contains("旧描述");
        assertThat(captor.getAllValues().get(0).getContentAfter()).contains("新描述");
        assertThat(captor.getAllValues().get(1).getContentBefore()).contains("旧描述");
        assertThat(captor.getAllValues().get(1).getContentAfter()).contains("旧描述");
        verify(productFamilyRepository).deleteById(101L);
    }
}
