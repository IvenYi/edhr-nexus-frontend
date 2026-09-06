package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;

@Repository
public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstance, Long> {
    List<WorkflowInstance> findByBusinessTypeAndBusinessId(String businessType, String businessId);
    List<WorkflowInstance> findByInitiatorId(String initiatorId);
    List<WorkflowInstance> findByStatus(String status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from WorkflowInstance i where i.id = :id")
    java.util.Optional<WorkflowInstance> findByIdForUpdate(@Param("id") Long id);
}
