package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long>, JpaSpecificationExecutor<Material> {
    Optional<Material> findByTenantIdAndId(String tenantId, Long id);
    List<Material> findByTenantIdAndCodeIgnoreCase(String tenantId, String code);
}
