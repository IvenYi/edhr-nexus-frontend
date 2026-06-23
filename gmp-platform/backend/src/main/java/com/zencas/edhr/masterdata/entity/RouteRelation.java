package com.zencas.edhr.masterdata.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_relation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteRelation {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";
    @Column(name = "route_version_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long routeVersionId;
    @Column(name = "source_node_key", nullable = false, length = 128)
    private String sourceNodeKey;
    @Column(name = "target_node_key", nullable = false, length = 128)
    private String targetNodeKey;
    @Column(name = "source_handle", length = 64)
    private String sourceHandle;
    @Column(name = "target_handle", length = 64)
    private String targetHandle;
    @Column(name = "relation_type", nullable = false, length = 32)
    private String relationType;
    @Column(name = "label", length = 128)
    private String label;
    @Column(name = "rule_expression", columnDefinition = "TEXT")
    private String ruleExpression;
    @Column(name = "priority")
    @Builder.Default
    private Integer priority = 0;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
