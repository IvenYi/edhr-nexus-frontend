package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTemplateSourceRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormTemplateSourceRevisionRepository extends JpaRepository<FormTemplateSourceRevision, Long> {
    int countByTemplateIdAndVersionId(Long templateId, Long versionId);
}
