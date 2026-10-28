package com.zencas.edhr.workflow.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name = "workflow_task")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowTask {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "instance_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long instanceId;
    @Column(name = "node_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long nodeId;
    @Column(name = "task_type")
    @Builder.Default private String taskType = "TODO";
    @Column(name = "status")
    @Builder.Default private String status = "PENDING";
    @Column(name = "assignee_id")
    private String assigneeId;
    @Column(name = "original_assignee_id")
    private String originalAssigneeId;
    /** Immutable runtime resolution snapshot for a multi-subject logical task. */
    @Column(name = "candidate_snapshot", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String candidateSnapshot;
    @Column(name = "action")
    private String action;
    @Column(name = "opinion", columnDefinition = "TEXT")
    private String opinion;
    @Column(name = "signature_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long signatureId;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
