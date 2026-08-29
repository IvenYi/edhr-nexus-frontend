package com.zencas.edhr.masterdata.repository;

import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductProcessVersionRepository extends JpaRepository<ProductProcessVersion, Long> {
    Optional<ProductProcessVersion> findByTenantIdAndId(String tenantId, Long id);
    List<ProductProcessVersion> findByTenantIdAndProductProcessIdOrderByCreatedAtDesc(String tenantId, Long productProcessId);
    List<ProductProcessVersion> findByProductProcessIdOrderByCreatedAtDesc(Long productProcessId);
    Optional<ProductProcessVersion> findByProductProcessIdAndId(Long productProcessId, Long id);
    List<ProductProcessVersion> findByProductProcessIdAndVersionLabelIgnoreCase(Long productProcessId, String versionLabel);
}
