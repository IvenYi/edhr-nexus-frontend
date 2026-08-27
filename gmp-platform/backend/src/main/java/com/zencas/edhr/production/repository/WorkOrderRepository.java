package com.zencas.edhr.production.repository;

import com.zencas.edhr.production.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    Optional<WorkOrder> findByTenantIdAndId(String tenantId, Long id);
}
