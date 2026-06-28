package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.TemplateCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateCategoryRepository extends JpaRepository<TemplateCategory, Long> {
    List<TemplateCategory> findByTenantIdAndTemplateTypeOrderBySortOrderAscNameAsc(String tenantId, String templateType);

    Optional<TemplateCategory> findByTenantIdAndTemplateTypeAndNameIgnoreCase(String tenantId, String templateType, String name);

    boolean existsByTenantIdAndTemplateTypeAndNameIgnoreCase(String tenantId, String templateType, String name);
}
