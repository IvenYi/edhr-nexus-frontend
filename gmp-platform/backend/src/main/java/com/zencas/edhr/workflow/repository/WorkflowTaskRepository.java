package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowTaskRepository extends JpaRepository<WorkflowTask, Long> {
    List<WorkflowTask> findByAssigneeIdAndStatusIn(String assigneeId, List<String> statuses);
    List<WorkflowTask> findByAssigneeId(String assigneeId);
    List<WorkflowTask> findByInstanceId(Long instanceId);
    List<WorkflowTask> findByNodeId(Long nodeId);
}
