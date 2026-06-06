package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "product_version")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVersion {
    @Id private Long id;
    @Column(name = "product_id")
    private Long productId;
    @Column(name = "version_number")
    private String versionNumber;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}