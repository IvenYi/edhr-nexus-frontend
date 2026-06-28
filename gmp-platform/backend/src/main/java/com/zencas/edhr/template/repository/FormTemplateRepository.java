package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormTemplateRepository extends JpaRepository<FormTemplate, Long>, JpaSpecificationExecutor<FormTemplate> {
    List<FormTemplate> findByTenantIdAndCodeIgnoreCase(String tenantId, String code);
}
