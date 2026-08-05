package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_category")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentCategory {
    @Id
    private Long id;

    @Column(name = "tenant_id", nullable = false, length = 64)
    @Builder.Default
    private String tenantId = "default";

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "system_category", nullable = false)
    @Builder.Default
    private boolean systemCategory = false;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }
}
