package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "product")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id private Long id;
    @Column(name = "family_id")
    private Long familyId;
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "specification")
    private String specification;
    @Column(name = "unit")
    private String unit;
    @Column(name = "status")
    @Builder.Default private String status = "ACTIVE";
    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
    @Column(name = "created_by")
    private String createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_by")
    private String updatedBy;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
    }
    @PreUpdate void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }
}
