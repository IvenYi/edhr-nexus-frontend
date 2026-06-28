package com.zencas.edhr.template.repository;

import com.zencas.edhr.template.entity.FormTemplateAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormTemplateAnalysisRepository extends JpaRepository<FormTemplateAnalysis, Long> {
    Optional<FormTemplateAnalysis> findByIdAndVersionId(Long id, Long versionId);
}
