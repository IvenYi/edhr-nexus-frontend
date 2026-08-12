package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.masterdata.entity.ProductFamilyMember;
import com.zencas.edhr.masterdata.entity.ProductProcess;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.repository.ProductFamilyMemberRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductProcessResolutionServiceTest {

    private static final LocalDateTime QUERY_TIME = LocalDateTime.of(2026, 8, 11, 10, 0);

    @Mock private ProductProcessRepository productProcessRepository;
    @Mock private ProductProcessVersionRepository productProcessVersionRepository;
    @Mock private ProductFamilyMemberRepository productFamilyMemberRepository;
    @InjectMocks private ProductProcessResolutionService service;

    @Test
    void returnsOnlyProductVersionsWhenProductHasAvailableVersion() {
        ProductProcess productProcess = process(11L, "PRODUCT", 101L);
        ProductProcess familyProcess = process(12L, "PRODUCT_FAMILY", 201L);
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT", 101L))
                .thenReturn(Optional.of(productProcess));
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(11L))
                .thenReturn(List.of(version(111L, "V1.0", QUERY_TIME.minusDays(1), null)));

        var resolution = service.resolve(101L, QUERY_TIME);

        assertThat(resolution.fallback()).isFalse();
        assertThat(resolution.ownerType()).isEqualTo("PRODUCT");
        assertThat(resolution.versions()).extracting(ProductProcessVersion::getId).containsExactly(111L);
        verify(productFamilyMemberRepository, never()).findByTenantIdAndProductId("default", 101L);
        verify(productProcessRepository, never()).findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT_FAMILY", 201L);
    }

    @Test
    void fallsBackToProductFamilyWhenProductHasOnlyExpiredOrFutureVersions() {
        ProductProcess productProcess = process(11L, "PRODUCT", 101L);
        ProductProcess familyProcess = process(12L, "PRODUCT_FAMILY", 201L);
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT", 101L))
                .thenReturn(Optional.of(productProcess));
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(11L))
                .thenReturn(List.of(
                        version(111L, "V1.0", QUERY_TIME.minusDays(2), QUERY_TIME),
                        version(112L, "V2.0", QUERY_TIME.plusDays(1), null)));
        when(productFamilyMemberRepository.findByTenantIdAndProductId("default", 101L))
                .thenReturn(Optional.of(ProductFamilyMember.builder().productFamilyId(201L).productId(101L).build()));
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT_FAMILY", 201L))
                .thenReturn(Optional.of(familyProcess));
        when(productProcessVersionRepository.findByProductProcessIdOrderByCreatedAtDesc(12L))
                .thenReturn(List.of(version(121L, "V3.0", null, QUERY_TIME.plusDays(1))));

        var resolution = service.resolve(101L, QUERY_TIME);

        assertThat(resolution.fallback()).isTrue();
        assertThat(resolution.ownerType()).isEqualTo("PRODUCT_FAMILY");
        assertThat(resolution.ownerId()).isEqualTo(201L);
        assertThat(resolution.message()).isEqualTo("当前产品未配置可用制程，以下为产品簇兜底制程");
        assertThat(resolution.versions()).extracting(ProductProcessVersion::getId).containsExactly(121L);
    }

    @Test
    void blocksWhenNeitherProductNorProductFamilyHasAvailableVersion() {
        when(productProcessRepository.findByTenantIdAndOwnerTypeAndOwnerId("default", "PRODUCT", 101L))
                .thenReturn(Optional.empty());
        when(productFamilyMemberRepository.findByTenantIdAndProductId("default", 101L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resolve(101L, QUERY_TIME))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("当前产品及所属产品簇均未配置可用制程版本");
    }

    private ProductProcess process(Long id, String ownerType, Long ownerId) {
        return ProductProcess.builder().id(id).tenantId("default").ownerType(ownerType).ownerId(ownerId)
                .productVersionId("PRODUCT".equals(ownerType) ? ownerId : null).build();
    }

    private ProductProcessVersion version(Long id, String label, LocalDateTime effectiveFrom, LocalDateTime effectiveTo) {
        return ProductProcessVersion.builder().id(id).versionLabel(label).effectiveFrom(effectiveFrom).effectiveTo(effectiveTo).build();
    }
}
