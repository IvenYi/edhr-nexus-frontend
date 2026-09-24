package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowActionLogRepository extends JpaRepository<WorkflowActionLog, Long>, JpaSpecificationExecutor<WorkflowActionLog> {
    @org.springframework.data.jpa.repository.Query("select l from WorkflowActionLog l where not exists (select i.id from WorkflowInstance i where i.id=l.instanceId and i.businessType='DHR_SUMMARY')")
    org.springframework.data.domain.Page<WorkflowActionLog> findNonDhr(org.springframework.data.domain.Pageable pageable);
    List<WorkflowActionLog> findByInstanceIdOrderByCreatedAtAsc(Long instanceId);
}
