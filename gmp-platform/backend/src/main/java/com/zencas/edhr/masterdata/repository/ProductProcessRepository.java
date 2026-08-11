package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductProcessRepository extends JpaRepository<ProductProcess, Long> {
    Optional<ProductProcess> findByTenantIdAndProductVersionId(String tenantId, Long productVersionId);

    Optional<ProductProcess> findByTenantIdAndOwnerTypeAndOwnerId(String tenantId, String ownerType, Long ownerId);

    long countByTenantIdAndOwnerTypeAndOwnerId(String tenantId, String ownerType, Long ownerId);
}
