package com.zencas.edhr.workflow.repository;

import com.zencas.edhr.workflow.entity.WorkflowTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface WorkflowTaskRepository extends JpaRepository<WorkflowTask, Long> {
    List<WorkflowTask> findByAssigneeIdAndStatusIn(String assigneeId, List<String> statuses);
    List<WorkflowTask> findByAssigneeId(String assigneeId);
    List<WorkflowTask> findByInstanceId(Long instanceId);
    List<WorkflowTask> findByNodeId(Long nodeId);

    @Query(value = "select * from workflow_task t where t.status in ('PENDING','PROCESSING') "
            + "and (t.assignee_id = :userId or (t.candidate_snapshot -> 'userIds') @> cast(:userIdJson as jsonb) "
            + "or t.candidate_snapshot ->> 'unrestricted' = 'true') "
            + "order by t.created_at desc", nativeQuery = true)
    List<WorkflowTask> findTodoForUser(@Param("userId") String userId, @Param("userIdJson") String userIdJson);

    @Query(value = "select * from workflow_task t where t.assignee_id = :userId "
            + "and t.status in ('COMPLETED','REJECTED','TRANSFERRED') order by t.completed_at desc nulls last", nativeQuery = true)
    List<WorkflowTask> findDoneForUser(@Param("userId") String userId);

    @Query(value = "select * from workflow_task t where t.status in ('PENDING', 'PROCESSING') "
            + "and ((t.candidate_snapshot -> 'userIds') @> cast(:userIdJson as jsonb) "
            + "or t.candidate_snapshot ->> 'unrestricted' = 'true')", nativeQuery = true)
    List<WorkflowTask> findPendingByCandidateUserId(@Param("userIdJson") String userIdJson);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from WorkflowTask t where t.id = :id")
    java.util.Optional<WorkflowTask> findByIdForUpdate(@Param("id") Long id);
}
