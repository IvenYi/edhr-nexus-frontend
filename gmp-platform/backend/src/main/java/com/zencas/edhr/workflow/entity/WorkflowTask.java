package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workflow_task")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowTask {
    @Id private Long id;
    @Column(name = "instance_id")
    private Long instanceId;
    @Column(name = "node_id")
    private Long nodeId;
    @Column(name = "task_type")
    @Builder.Default private String taskType = "TODO";
    @Column(name = "status")
    @Builder.Default private String status = "PENDING";
    @Column(name = "assignee_id")
    private String assigneeId;
    @Column(name = "original_assignee_id")
    private String originalAssigneeId;
    @Column(name = "action")
    private String action;
    @Column(name = "opinion", columnDefinition = "TEXT")
    private String opinion;
    @Column(name = "signature_id")
    private Long signatureId;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}