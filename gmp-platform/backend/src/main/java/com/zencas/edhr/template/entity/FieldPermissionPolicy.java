package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "field_permission_policy")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FieldPermissionPolicy {
    @Id private Long id;
    @Column(name = "workflow_node_id")
    private Long workflowNodeId;
    @Column(name = "field_id")
    private Long fieldId;
    @Column(name = "permission_level")
    @Builder.Default private String permissionLevel = "EDIT";
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}