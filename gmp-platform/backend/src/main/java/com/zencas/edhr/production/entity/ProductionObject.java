package com.zencas.edhr.production.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_object", uniqueConstraints = @UniqueConstraint(name = "uk_production_object_no", columnNames = {"tenant_id", "object_no"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductionObject {
    @Id private Long id;
    @Column(name = "tenant_id", nullable = false) @Builder.Default private String tenantId = "default";
    @Column(name = "work_order_id", nullable = false) private Long workOrderId;
    @Column(name = "object_no", nullable = false, length = 64) private String objectNo;
    @Column(name = "object_type", nullable = false, length = 16) private String objectType;
    @Column(name = "process_version_id", nullable = false) private Long processVersionId;
    @Column(name = "target_quantity", nullable = false, precision = 15, scale = 4) private BigDecimal targetQuantity;
    @Column(name = "planned_start_at") private LocalDateTime plannedStartAt;
    @Column(name = "planned_end_at") private LocalDateTime plannedEndAt;
    @Column(name = "good_quantity", nullable = false, precision = 15, scale = 4) @Builder.Default private BigDecimal goodQuantity = BigDecimal.ZERO;
    @Column(name = "ng_quantity", nullable = false, precision = 15, scale = 4) @Builder.Default private BigDecimal ngQuantity = BigDecimal.ZERO;
    @Column(name = "scrap_quantity", nullable = false, precision = 15, scale = 4) @Builder.Default private BigDecimal scrapQuantity = BigDecimal.ZERO;
    @Column(name = "status", nullable = false, length = 32) @Builder.Default private String status = "CREATED";
    @Column(name = "termination_reason", columnDefinition = "TEXT") private String terminationReason;
    @Column(name = "termination_at") private LocalDateTime terminationAt;
    @Column(name = "remark", columnDefinition = "TEXT") private String remark;
    @Column(name = "created_by") private String createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_by") private String updatedBy;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); if (updatedAt == null) updatedAt = createdAt; }
    @PreUpdate void preUpdate() { updatedAt = LocalDateTime.now(); }
}
