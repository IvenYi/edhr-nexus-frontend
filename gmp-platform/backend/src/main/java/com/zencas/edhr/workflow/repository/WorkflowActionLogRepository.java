package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowActionLogRepository extends JpaRepository<WorkflowActionLog, Long>, JpaSpecificationExecutor<WorkflowActionLog> {
    List<WorkflowActionLog> findByInstanceIdOrderByCreatedAtAsc(Long instanceId);
}
