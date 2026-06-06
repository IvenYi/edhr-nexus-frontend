package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workflow_action_log")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowActionLog {
    @Id private Long id;
    @Column(name = "instance_id")
    private Long instanceId;
    @Column(name = "task_id")
    private Long taskId;
    @Column(name = "node_id")
    private String nodeId;
    @Column(name = "action")
    private String action;
    @Column(name = "operator_id")
    private String operatorId;
    @Column(name = "operator_name")
    private String operatorName;
    @Column(name = "comment")
    private String comment;
    @Column(name = "snapshot")
    private String snapshot;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}