package com.zencas.edhr.masterdata.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
import com.zencas.edhr.masterdata.entity.ProductFamilyMember;
import com.zencas.edhr.masterdata.entity.ProductProcess;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.repository.ProductFamilyMemberRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductProcessResolutionService {

    public static final String PRODUCT_FAMILY_FALLBACK_MESSAGE = "当前产品未配置可用制程，以下为产品簇兜底制程";
    private static final String TENANT_ID = "default";

    private final ProductProcessRepository productProcessRepository;
    private final ProductProcessVersionRepository productProcessVersionRepository;
    private final ProductFamilyMemberRepository productFamilyMemberRepository;

    public ProcessResolution resolve(Long productId, LocalDateTime atTime) {
        LocalDateTime resolvedAt = atTime == null ? LocalDateTime.now() : atTime;
        List<ProductProcessVersion> productVersions = availableVersions("PRODUCT", productId, resolvedAt);
        if (!productVersions.isEmpty()) {
            return new ProcessResolution("PRODUCT", productId, false, null, productVersions);
        }

        ProductFamilyMember membership = productFamilyMemberRepository
                .findByTenantIdAndProductId(TENANT_ID, productId)
                .orElse(null);
        if (membership != null) {
            List<ProductProcessVersion> familyVersions = availableVersions(
                    "PRODUCT_FAMILY", membership.getProductFamilyId(), resolvedAt);
            if (!familyVersions.isEmpty()) {
                return new ProcessResolution("PRODUCT_FAMILY", membership.getProductFamilyId(), true,
                        PRODUCT_FAMILY_FALLBACK_MESSAGE, familyVersions);
            }
        }

        throw new BusinessException(ErrorCode.GENERAL_001, "当前产品及所属产品簇均未配置可用制程版本");
    }

    /**
     * Resolves a process version by product ownership without applying effective dates.
     * A work order may continue using the version it froze even after that version expires.
     */
    public Optional<ProductProcessVersion> findVersionForProduct(Long productId, Long versionId) {
        if (productId == null || versionId == null) return Optional.empty();
        ProductProcessVersion version = productProcessVersionRepository
                .findByTenantIdAndId(TENANT_ID, versionId).orElse(null);
        if (version == null) return Optional.empty();
        ProductProcess process = productProcessRepository.findByTenantIdAndId(
                TENANT_ID, version.getProductProcessId()).orElse(null);
        if (process == null) return Optional.empty();
        if ("PRODUCT".equals(process.getOwnerType()) && productId.equals(process.getOwnerId())) {
            return Optional.of(version);
        }
        if ("PRODUCT_FAMILY".equals(process.getOwnerType())) {
            boolean belongsToFamily = productFamilyMemberRepository.findByTenantIdAndProductId(TENANT_ID, productId)
                    .map(member -> process.getOwnerId().equals(member.getProductFamilyId()))
                    .orElse(false);
            if (belongsToFamily) return Optional.of(version);
        }
        return Optional.empty();
    }

    private List<ProductProcessVersion> availableVersions(String ownerType, Long ownerId, LocalDateTime atTime) {
        if (ownerId == null) return List.of();
        ProductProcess process = productProcessRepository
                .findByTenantIdAndOwnerTypeAndOwnerId(TENANT_ID, ownerType, ownerId)
                .orElse(null);
        if (process == null) return List.of();
        return productProcessVersionRepository
                .findByTenantIdAndProductProcessIdOrderByCreatedAtDesc(TENANT_ID, process.getId()).stream()
                .filter(version -> RdoVersionStatusResolver.ACTIVE.equals(
                        RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo(), atTime)))
                .toList();
    }

    public record ProcessResolution(
            String ownerType,
            Long ownerId,
            boolean fallback,
            String message,
            List<ProductProcessVersion> versions) {
    }
}
