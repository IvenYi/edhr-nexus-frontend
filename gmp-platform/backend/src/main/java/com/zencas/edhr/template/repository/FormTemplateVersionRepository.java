package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTemplateVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface FormTemplateVersionRepository extends JpaRepository<FormTemplateVersion, Long>, JpaSpecificationExecutor<FormTemplateVersion> {
}
