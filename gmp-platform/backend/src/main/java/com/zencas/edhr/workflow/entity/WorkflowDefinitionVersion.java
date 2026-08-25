package com.zencas.edhr.workflow.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name = "workflow_definition_version")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowDefinitionVersion {
    @Id @JsonSerialize(using = ToStringSerializer.class) private Long id;
    @Column(name = "definition_id")
    @JsonSerialize(using = ToStringSerializer.class) private Long definitionId;
    @Column(name = "version_number")
    @Builder.Default private Integer versionNumber = 1;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
    @Column(name = "nodes_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String nodesJson;
    @Column(name = "edges_json", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String edgesJson;
    @Column(name = "is_current")
    @Builder.Default private Boolean isCurrent = false;
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
