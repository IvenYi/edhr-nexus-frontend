package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workflow_definition")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowDefinition {
    @Id private Long id;
    @Column(name = "tenant_id", length = 64) @Builder.Default private String tenantId = "default";
    @Column(nullable = false, length = 256) private String name;
    @Column(nullable = false, length = 32) @Builder.Default private String type = "REVIEW";
    @Column(nullable = false, length = 32) @Builder.Default private String status = "DRAFT";
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
