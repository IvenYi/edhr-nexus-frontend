package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.entity.ProductFamilyMember;
import com.zencas.edhr.masterdata.dto.ProductFamilyMemberResponse;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.MaterialTypeRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyMemberRepository;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductFamilyMembershipServiceTest {

    @Mock private ProductFamilyRepository productFamilyRepository;
    @Mock private ProductFamilyMemberRepository productFamilyMemberRepository;
    @Mock private MaterialRepository materialRepository;
    @Mock private MaterialTypeRepository materialTypeRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private ProductFamilyMembershipService service;

    @Test
    void rejectsAddingAMaterialThatIsNotFinishedOrSemiFinishedProduct() {
        when(productFamilyRepository.findById(11L)).thenReturn(Optional.of(family(11L, "目标产品簇")));
        when(materialRepository.findById(101L)).thenReturn(Optional.of(material(101L, 1L)));
        when(materialTypeRepository.findById(1L)).thenReturn(Optional.of(MaterialType.builder().id(1L).name("原材料").build()));

        assertThatThrownBy(() -> service.addMembers(11L, List.of(101L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("半成品或产成品");

        verify(productFamilyMemberRepository, never()).save(any());
        verifyNoInteractions(auditEventRepository);
    }

    @Test
    void rejectsOrdinaryAddWhenProductAlreadyBelongsToAnotherFamily() {
        when(productFamilyRepository.findById(11L)).thenReturn(Optional.of(family(11L, "目标产品簇")));
        when(materialRepository.findById(101L)).thenReturn(Optional.of(material(101L, 1L)));
        when(materialTypeRepository.findById(1L)).thenReturn(Optional.of(MaterialType.builder().id(1L).name("产成品").build()));
        when(productFamilyMemberRepository.findByTenantIdAndProductId("default", 101L))
                .thenReturn(Optional.of(member(201L, 9L, 101L)));
        when(productFamilyRepository.findById(9L)).thenReturn(Optional.of(family(9L, "原产品簇")));

        assertThatThrownBy(() -> service.addMembers(11L, List.of(101L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("原产品簇")
                .hasMessageContaining("转移");

        verify(productFamilyMemberRepository, never()).save(any());
        verifyNoInteractions(auditEventRepository);
    }

    @Test
    void transfersMemberAtomicallyAndWritesProductOldFamilyAndNewFamilyAudits() {
        ProductFamilyMember existing = member(201L, 9L, 101L);
        when(productFamilyRepository.findById(11L)).thenReturn(Optional.of(family(11L, "目标产品簇")));
        when(productFamilyRepository.findById(9L)).thenReturn(Optional.of(family(9L, "原产品簇")));
        when(materialRepository.findById(101L)).thenReturn(Optional.of(material(101L, 1L)));
        when(materialTypeRepository.findById(1L)).thenReturn(Optional.of(MaterialType.builder().id(1L).name("半成品").build()));
        when(productFamilyMemberRepository.findByTenantIdAndProductId("default", 101L)).thenReturn(Optional.of(existing));
        when(productFamilyMemberRepository.save(any(ProductFamilyMember.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(301L, 401L, 402L, 403L);

        ProductFamilyMember transferred = service.transferMember(11L, 101L);

        assertThat(transferred.getProductFamilyId()).isEqualTo(11L);
        assertThat(transferred.getProductId()).isEqualTo(101L);
        verify(productFamilyMemberRepository).delete(existing);
        ArgumentCaptor<ProductFamilyMember> memberCaptor = ArgumentCaptor.forClass(ProductFamilyMember.class);
        verify(productFamilyMemberRepository).save(memberCaptor.capture());
        assertThat(memberCaptor.getValue().getId()).isEqualTo(301L);

        ArgumentCaptor<AuditEvent> auditCaptor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditEventRepository, org.mockito.Mockito.times(3)).save(auditCaptor.capture());
        assertThat(auditCaptor.getAllValues())
                .extracting(event -> event.getEntityType() + ":" + event.getEntityId() + ":" + event.getAction())
                .containsExactlyInAnyOrder(
                        "PRODUCT:101:UPDATE",
                        "PRODUCT_FAMILY:9:UPDATE",
                        "PRODUCT_FAMILY:11:UPDATE");
    }

    @Test
    void listsOnlyEligibleProductsWithCurrentAndOtherFamilyMembershipStates() {
        when(productFamilyRepository.findById(11L)).thenReturn(Optional.of(family(11L, "目标产品簇")));
        Material semiFinished = material(101L, 1L);
        semiFinished.setName("注射器半成品");
        Material rawMaterial = material(102L, 2L);
        rawMaterial.setName("包装原料");
        Material finished = material(103L, 3L);
        finished.setName("注射器产成品");
        when(materialRepository.findAll()).thenReturn(List.of(semiFinished, rawMaterial, finished));
        when(materialTypeRepository.findAll()).thenReturn(List.of(
                MaterialType.builder().id(1L).name("半成品").build(),
                MaterialType.builder().id(2L).name("原材料").build(),
                MaterialType.builder().id(3L).name("产成品").build()));
        when(productFamilyMemberRepository.findByTenantIdAndProductIdIn("default", List.of(101L, 103L)))
                .thenReturn(List.of(member(201L, 11L, 101L), member(202L, 9L, 103L)));
        when(productFamilyRepository.findAllById(List.of(11L, 9L)))
                .thenReturn(List.of(family(11L, "目标产品簇"), family(9L, "原产品簇")));

        List<ProductFamilyMemberResponse> options = service.listMemberOptions(11L);

        assertThat(options).extracting(ProductFamilyMemberResponse::productId)
                .containsExactly("101", "103");
        assertThat(options).filteredOn(ProductFamilyMemberResponse::currentMember)
                .extracting(ProductFamilyMemberResponse::productId)
                .containsExactly("101");
        assertThat(options).filteredOn(option -> "103".equals(option.productId()))
                .singleElement()
                .satisfies(option -> assertThat(option.productFamilyName()).isEqualTo("原产品簇"));
    }

    @Test
    void returnsNoOptionsWithoutIssuingAnEmptyMembershipInQuery() {
        when(productFamilyRepository.findById(11L)).thenReturn(Optional.of(family(11L, "目标产品簇")));
        when(materialRepository.findAll()).thenReturn(List.of(material(101L, 1L)));
        when(materialTypeRepository.findAll()).thenReturn(List.of(MaterialType.builder().id(1L).name("原材料").build()));

        assertThat(service.listMemberOptions(11L)).isEmpty();

        verify(productFamilyMemberRepository, never()).findByTenantIdAndProductIdIn(any(), any());
    }

    private ProductFamily family(Long id, String name) {
        return ProductFamily.builder().id(id).tenantId("default").code("PF-" + id).name(name).build();
    }

    private Material material(Long id, Long materialTypeId) {
        return Material.builder().id(id).tenantId("default").code("MAT-" + id).name("产品" + id).materialTypeId(materialTypeId).build();
    }

    private ProductFamilyMember member(Long id, Long familyId, Long productId) {
        return ProductFamilyMember.builder().id(id).tenantId("default").productFamilyId(familyId).productId(productId).build();
    }
}
