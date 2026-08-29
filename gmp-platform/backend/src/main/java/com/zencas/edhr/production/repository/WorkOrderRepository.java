package com.zencas.edhr.production.repository;

import com.zencas.edhr.production.entity.WorkOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    Optional<WorkOrder> findByTenantIdAndId(String tenantId, Long id);
    Optional<WorkOrder> findByTenantIdAndOrderNo(String tenantId, String orderNo);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select workOrder from WorkOrder workOrder where workOrder.tenantId = :tenantId and workOrder.id = :id")
    Optional<WorkOrder> findByTenantIdAndIdForUpdate(@Param("tenantId") String tenantId, @Param("id") Long id);
    long countByTenantIdAndId(String tenantId, Long id);
}
