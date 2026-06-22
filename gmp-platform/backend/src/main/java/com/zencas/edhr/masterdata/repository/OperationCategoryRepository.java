package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.OperationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperationCategoryRepository extends JpaRepository<OperationCategory, Long> {
    List<OperationCategory> findByTenantIdOrderByNameAsc(String tenantId);

    List<OperationCategory> findByTenantIdOrderBySortOrderAscNameAsc(String tenantId);

    Optional<OperationCategory> findByTenantIdAndNameIgnoreCase(String tenantId, String name);

    boolean existsByTenantIdAndNameIgnoreCase(String tenantId, String name);
}
