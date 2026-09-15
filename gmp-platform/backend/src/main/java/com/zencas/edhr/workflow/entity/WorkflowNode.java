package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name = "workflow_node")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowNode {
    @Id private Long id;
    @Column(name = "version_id")
    private Long versionId;
    @Column(name = "node_type")
    private String nodeType;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "position_x")
    @Builder.Default private Integer positionX = 0;
    @Column(name = "position_y")
    @Builder.Default private Integer positionY = 0;
    @Column(name = "properties", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String properties;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
