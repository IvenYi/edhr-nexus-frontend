package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.DocumentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, Long> {
    List<DocumentCategory> findByTenantIdOrderBySortOrderAscNameAsc(String tenantId);

    Optional<DocumentCategory> findByTenantIdAndNameIgnoreCase(String tenantId, String name);

    boolean existsByTenantIdAndNameIgnoreCase(String tenantId, String name);
}
