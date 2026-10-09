package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowInstanceRepository extends JpaRepository<WorkflowInstance, Long> {
    @Query("select i from WorkflowInstance i where i.businessType is null or i.businessType <> 'DHR_SUMMARY'")
    org.springframework.data.domain.Page<WorkflowInstance> findNonDhr(org.springframework.data.domain.Pageable pageable);
    List<WorkflowInstance> findByBusinessTypeAndBusinessId(String businessType, String businessId);
    List<WorkflowInstance> findByInitiatorId(String initiatorId);
    List<WorkflowInstance> findByStatus(String status);
    Optional<WorkflowInstance> findByIdempotencyKey(String idempotencyKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from WorkflowInstance i where i.id = :id")
    java.util.Optional<WorkflowInstance> findByIdForUpdate(@Param("id") Long id);
}
