package com.zencas.edhr.workflow.entity;

import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity @Table(name = "workflow_definition_version")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowDefinitionVersion {
    @Id private Long id;
    @Column(name = "definition_id")
    private Long definitionId;
    @Column(name = "version_number")
    @Builder.Default private Integer versionNumber = 1;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
    @Column(name = "nodes_json", columnDefinition = "jsonb")
    private String nodesJson;
    @Column(name = "edges_json", columnDefinition = "jsonb")
    private String edgesJson;
    @Column(name = "is_current")
    @Builder.Default private Boolean isCurrent = false;
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}