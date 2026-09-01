package com.zencas.edhr.identity.repository;

import com.zencas.edhr.identity.entity.Workshop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkshopRepository extends JpaRepository<Workshop, Long>, JpaSpecificationExecutor<Workshop> {
    boolean existsByTenantIdAndCodeIgnoreCase(Long tenantId, String code);
    boolean existsByTenantIdAndCodeIgnoreCaseAndIdNot(Long tenantId, String code, Long id);
    Optional<Workshop> findByIdAndTenantId(Long id, Long tenantId);
}
