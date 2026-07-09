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
@Table(name = "route_node")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteNode {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";
    @Column(name = "route_version_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long routeVersionId;
    @Column(name = "node_key", nullable = false, length = 128)
    private String nodeKey;
    @Column(name = "operation_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long operationId;
    @Column(name = "operation_code", length = 64)
    private String operationCode;
    @Column(name = "operation_name", length = 128)
    private String operationName;
    @Column(name = "node_type", length = 32)
    @Builder.Default
    private String nodeType = "OPERATION";
    @Column(name = "position_x")
    @Builder.Default
    private Integer positionX = 0;
    @Column(name = "position_y")
    @Builder.Default
    private Integer positionY = 0;
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
