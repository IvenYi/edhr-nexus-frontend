package com.zencas.edhr.masterdata.entity;

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
@Table(name = "product_process_operation_binding")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductProcessOperationBinding {
    @Id private Long id;
    @Column(name = "product_process_version_id", nullable = false)
    private Long productProcessVersionId;
    @Column(name = "route_node_key", nullable = false, length = 128)
    private String routeNodeKey;
    @Column(name = "operation_id")
    private Long operationId;
    @Column(name = "operation_code", length = 64)
    private String operationCode;
    @Column(name = "operation_name", nullable = false, length = 128)
    private String operationName;
    @Column(name = "sort_order", nullable = false)
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
