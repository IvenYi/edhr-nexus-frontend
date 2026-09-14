package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.EquipmentCategory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface EquipmentCategoryRepository extends JpaRepository<EquipmentCategory, Long> {
    List<EquipmentCategory> findByTenantIdOrderBySortOrderAscCreatedAtAscIdAsc(String tenantId);
    boolean existsByTenantIdAndNameAndIdNot(String tenantId, String name, Long id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from EquipmentCategory c where c.id = :id and c.tenantId = 'default'")
    Optional<EquipmentCategory> lockById(@Param("id") Long id);
}
