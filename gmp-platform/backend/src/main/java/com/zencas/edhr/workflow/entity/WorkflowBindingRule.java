package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workflow_binding_rule")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowBindingRule {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "business_type")
    private String businessType;
    @Column(name = "definition_id")
    private Long definitionId;
    @Column(name = "version_id")
    private Long versionId;
    @Column(name = "is_active")
    @Builder.Default private Boolean isActive = true;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}