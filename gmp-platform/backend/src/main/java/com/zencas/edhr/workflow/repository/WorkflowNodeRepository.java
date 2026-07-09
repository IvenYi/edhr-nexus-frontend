package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowNodeRepository extends JpaRepository<WorkflowNode, Long> {
    List<WorkflowNode> findByVersionIdAndNodeType(Long versionId, String nodeType);
    List<WorkflowNode> findByVersionId(Long versionId);
}
