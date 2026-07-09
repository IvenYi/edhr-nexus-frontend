package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowEdgeRepository extends JpaRepository<WorkflowEdge, Long> {
    List<WorkflowEdge> findBySourceNodeId(Long sourceNodeId);
    List<WorkflowEdge> findByTargetNodeId(Long targetNodeId);
    List<WorkflowEdge> findByVersionId(Long versionId);
}
