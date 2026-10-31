package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.DocumentCategory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentCategoryRepository extends JpaRepository<DocumentCategory, Long> {
    List<DocumentCategory> findByTenantIdOrderBySortOrderAscNameAsc(String tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from DocumentCategory c where c.tenantId = :tenantId and c.systemCategory = false order by c.id")
    List<DocumentCategory> findCustomForUpdate(@Param("tenantId") String tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from DocumentCategory c where c.id = :id and c.tenantId = :tenantId")
    Optional<DocumentCategory> findForUpdate(@Param("id") Long id, @Param("tenantId") String tenantId);

    Optional<DocumentCategory> findByTenantIdAndNameIgnoreCase(String tenantId, String name);

    boolean existsByTenantIdAndNameIgnoreCase(String tenantId, String name);
}
