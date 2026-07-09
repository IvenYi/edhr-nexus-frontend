package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Entity @Table(name = "batch")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Batch {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "product_version_id")
    private Long productVersionId;
    @Column(name = "status")
    @Builder.Default private String status = "NOT_STARTED";
    @Column(name = "planned_quantity")
    private java.math.BigDecimal plannedQuantity;
    @Column(name = "actual_quantity")
    private java.math.BigDecimal actualQuantity;
    @Column(name = "start_date")
    private LocalDateTime startDate;
    @Column(name = "end_date")
    private LocalDateTime endDate;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}