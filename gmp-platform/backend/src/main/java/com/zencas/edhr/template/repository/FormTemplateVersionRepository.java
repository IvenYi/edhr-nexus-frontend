package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTemplateVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormTemplateVersionRepository extends JpaRepository<FormTemplateVersion, Long>, JpaSpecificationExecutor<FormTemplateVersion> {
    Optional<FormTemplateVersion> findByIdAndTemplateId(Long id, Long templateId);

    List<FormTemplateVersion> findByTemplateIdOrderByCreatedAtDesc(Long templateId);
}
