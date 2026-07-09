package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowDefinitionVersionRepository extends JpaRepository<WorkflowDefinitionVersion, Long> {
    List<WorkflowDefinitionVersion> findByDefinitionIdOrderByVersionNumberDesc(Long definitionId);
    Optional<WorkflowDefinitionVersion> findByDefinitionIdAndIsCurrentTrue(Long definitionId);
    Optional<WorkflowDefinitionVersion> findByDefinitionIdAndVersionNumber(Long definitionId, Integer versionNumber);
}
