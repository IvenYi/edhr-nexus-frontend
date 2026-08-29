package com.zencas.edhr.production.repository;

import com.zencas.edhr.production.entity.ProductionObject;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductionObjectRepository extends JpaRepository<ProductionObject, Long> {
    List<ProductionObject> findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc(String tenantId, Long workOrderId);
    Optional<ProductionObject> findByTenantIdAndId(String tenantId, Long id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select productionObject from ProductionObject productionObject where productionObject.tenantId = :tenantId and productionObject.id = :id")
    Optional<ProductionObject> findByTenantIdAndIdForUpdate(@Param("tenantId") String tenantId, @Param("id") Long id);
    long countByTenantIdAndWorkOrderId(String tenantId, Long workOrderId);
    boolean existsByTenantIdAndObjectNo(String tenantId, String objectNo);
}
