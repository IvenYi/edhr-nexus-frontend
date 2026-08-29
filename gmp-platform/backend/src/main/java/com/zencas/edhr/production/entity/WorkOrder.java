package com.zencas.edhr.production.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_order")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkOrder {
    @Id private Long id;
    @Column(name = "tenant_id", nullable = false) @Builder.Default private String tenantId = "default";
    @Column(name = "order_no", nullable = false, length = 64) private String orderNo;
    @Column(name = "order_number", length = 64) private String orderNumber;
    @Column(name = "product_id", nullable = false) private Long productId;
    @Column(name = "process_version_id") private Long processVersionId;
    @Column(name = "production_mode") @Builder.Default private String productionMode = "量产";
    @Column(name = "production_form") private String productionForm;
    @Column(name = "planned_quantity", nullable = false, precision = 15, scale = 4) private BigDecimal plannedQuantity;
    @Column(name = "planned_start_at") private LocalDateTime plannedStartAt;
    @Column(name = "planned_end_at") private LocalDateTime plannedEndAt;
    @Column(name = "status", nullable = false) @Builder.Default private String status = "CREATED";
    @Column(name = "remark", columnDefinition = "TEXT") private String remark;
    @Column(name = "created_by") private String createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_by") private String updatedBy;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); if (updatedAt == null) updatedAt = createdAt; }
    @PreUpdate void preUpdate() { updatedAt = LocalDateTime.now(); }
}
