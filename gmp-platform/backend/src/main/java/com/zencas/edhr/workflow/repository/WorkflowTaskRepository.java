package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface WorkflowTaskRepository extends JpaRepository<WorkflowTask, Long> {
    @Query("select t from WorkflowTask t where not exists (select i.id from WorkflowInstance i where i.id=t.instanceId and i.businessType='DHR_SUMMARY')")
    org.springframework.data.domain.Page<WorkflowTask> findNonDhr(org.springframework.data.domain.Pageable pageable);
    @Query("select t from WorkflowTask t where not exists (select i.id from WorkflowInstance i where i.id=t.instanceId and i.businessType in ('DHR_SUMMARY','CHANGE','OBSOLETE'))")
    org.springframework.data.domain.Page<WorkflowTask> findGeneric(org.springframework.data.domain.Pageable pageable);
    List<WorkflowTask> findByAssigneeIdAndStatusIn(String assigneeId, List<String> statuses);
    List<WorkflowTask> findByAssigneeId(String assigneeId);
    List<WorkflowTask> findByInstanceId(Long instanceId);
    List<WorkflowTask> findByNodeId(Long nodeId);

    @Query(value = "select * from workflow_task t where t.status in ('PENDING','PROCESSING') "
            + "and not exists (select 1 from workflow_instance i where i.id=t.instance_id and i.business_type='DHR_SUMMARY') "
            + "and (t.assignee_id = :userId or (t.candidate_snapshot -> 'userIds') @> cast(:userIdJson as jsonb) "
            + "or t.candidate_snapshot ->> 'unrestricted' = 'true') "
            + "order by t.created_at desc", nativeQuery = true)
    List<WorkflowTask> findTodoForUser(@Param("userId") String userId, @Param("userIdJson") String userIdJson);

    @Query(value = "select * from workflow_task t where t.assignee_id = :userId "
            + "and not exists (select 1 from workflow_instance i where i.id=t.instance_id and i.business_type='DHR_SUMMARY') "
            + "and t.status in ('COMPLETED','REJECTED','TRANSFERRED') order by t.completed_at desc nulls last", nativeQuery = true)
    List<WorkflowTask> findDoneForUser(@Param("userId") String userId);

    @Query(value = "select t.* from workflow_task t join workflow_instance i on i.id=t.instance_id "
            + "where i.business_type in ('CHANGE','OBSOLETE') and t.status in ('PENDING','PROCESSING') "
            + "and (t.assignee_id=:userId or (t.candidate_snapshot -> 'userIds') @> cast(:userIdJson as jsonb) "
            + "or t.candidate_snapshot ->> 'unrestricted'='true') "
            + "order by t.created_at desc,t.id desc",
            countQuery = "select count(*) from workflow_task t join workflow_instance i on i.id=t.instance_id "
                    + "where i.business_type in ('CHANGE','OBSOLETE') and t.status in ('PENDING','PROCESSING') "
                    + "and (t.assignee_id=:userId or (t.candidate_snapshot -> 'userIds') @> cast(:userIdJson as jsonb) "
                    + "or t.candidate_snapshot ->> 'unrestricted'='true')",
            nativeQuery = true)
    Page<WorkflowTask> findRecordControlTodoForUser(@Param("userId") String userId,
                                                     @Param("userIdJson") String userIdJson,
                                                     Pageable pageable);

    @Query(value = "select t.* from workflow_task t join workflow_instance i on i.id=t.instance_id "
            + "where i.business_type in ('CHANGE','OBSOLETE') and t.assignee_id=:userId "
            + "and t.status in ('COMPLETED','REJECTED','TRANSFERRED') "
            + "order by t.completed_at desc nulls last,t.id desc",
            countQuery = "select count(*) from workflow_task t join workflow_instance i on i.id=t.instance_id "
                    + "where i.business_type in ('CHANGE','OBSOLETE') and t.assignee_id=:userId "
                    + "and t.status in ('COMPLETED','REJECTED','TRANSFERRED')",
            nativeQuery = true)
    Page<WorkflowTask> findRecordControlDoneForUser(@Param("userId") String userId, Pageable pageable);

    @Query(value = "select * from workflow_task t where t.status in ('PENDING', 'PROCESSING') "
            + "and ((t.candidate_snapshot -> 'userIds') @> cast(:userIdJson as jsonb) "
            + "or t.candidate_snapshot ->> 'unrestricted' = 'true')", nativeQuery = true)
    List<WorkflowTask> findPendingByCandidateUserId(@Param("userIdJson") String userIdJson);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from WorkflowTask t where t.id = :id")
    java.util.Optional<WorkflowTask> findByIdForUpdate(@Param("id") Long id);
}
