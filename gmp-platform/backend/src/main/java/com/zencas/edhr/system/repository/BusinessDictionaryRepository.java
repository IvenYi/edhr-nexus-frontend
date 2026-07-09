package com.zencas.edhr.system.repository;

import com.zencas.edhr.system.entity.BusinessDictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface BusinessDictionaryRepository extends JpaRepository<BusinessDictionary, Long>, JpaSpecificationExecutor<BusinessDictionary> {
    boolean existsByTenantIdAndCode(String tenantId, String code);
    Optional<BusinessDictionary> findByTenantIdAndCode(String tenantId, String code);
}
