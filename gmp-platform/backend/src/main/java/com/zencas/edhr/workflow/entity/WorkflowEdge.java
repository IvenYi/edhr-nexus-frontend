package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workflow_edge")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowEdge {
    @Id private Long id;
    @Column(name = "version_id")
    private Long versionId;
    @Column(name = "source_node_id")
    private Long sourceNodeId;
    @Column(name = "target_node_id")
    private Long targetNodeId;
    @Column(name = "label")
    private String label;
    @Column(name = "condition_expression", columnDefinition = "jsonb")
    private String conditionExpression;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}