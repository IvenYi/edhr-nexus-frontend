package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "serial_number")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SerialNumber {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "sn")
    private String sn;
    @Column(name = "product_version_id")
    private Long productVersionId;
    @Column(name = "batch_id")
    private Long batchId;
    @Column(name = "status")
    @Builder.Default private String status = "CREATED";
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}