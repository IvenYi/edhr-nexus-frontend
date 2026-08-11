package com.zencas.edhr.masterdata.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "product_process",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_product_process_product_version", columnNames = {"tenant_id", "product_version_id"}),
                @UniqueConstraint(name = "uk_product_process_owner", columnNames = {"tenant_id", "owner_type", "owner_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductProcess {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";
    @Column(name = "owner_type", nullable = false, length = 32)
    @Builder.Default
    private String ownerType = "PRODUCT";
    @Column(name = "owner_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long ownerId;
    /** Legacy product owner reference retained for compatibility with existing product modeling. */
    @Column(name = "product_version_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long productVersionId;
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
        if (ownerType == null && productVersionId != null) ownerType = "PRODUCT";
        if (ownerId == null && "PRODUCT".equals(ownerType) && productVersionId != null) ownerId = productVersionId;
        validateOwner();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
    }

    @PreUpdate
    void preUpdate() {
        validateOwner();
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }

    private void validateOwner() {
        if (!"PRODUCT".equals(ownerType) && !"PRODUCT_FAMILY".equals(ownerType)) {
            throw new IllegalStateException("Invalid owner type");
        }
        if (ownerId == null) {
            throw new IllegalStateException("Owner ID is required");
        }
        if ("PRODUCT_FAMILY".equals(ownerType) && productVersionId != null) {
            throw new IllegalStateException("Product family owner cannot have product version");
        }
        if ("PRODUCT".equals(ownerType) && !ownerId.equals(productVersionId)) {
            throw new IllegalStateException("Product owner must match product version");
        }
    }
}
