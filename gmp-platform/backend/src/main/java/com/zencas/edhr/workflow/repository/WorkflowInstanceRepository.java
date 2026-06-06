package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstance, Long> {
    List<WorkflowInstance> findByBusinessTypeAndBusinessId(String businessType, String businessId);
    List<WorkflowInstance> findByInitiatorId(String initiatorId);
    List<WorkflowInstance> findByStatus(String status);
}
