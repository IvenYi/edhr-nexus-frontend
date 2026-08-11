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
        name = "product_family_member",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_product_family_member_tenant_family_product", columnNames = {"tenant_id", "product_family_id", "product_id"}),
                @UniqueConstraint(name = "uk_product_family_member_tenant_product", columnNames = {"tenant_id", "product_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFamilyMember {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id", nullable = false)
    @Builder.Default
    private String tenantId = "default";
    @Column(name = "product_family_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long productFamilyId;
    @Column(name = "product_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long productId;
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
