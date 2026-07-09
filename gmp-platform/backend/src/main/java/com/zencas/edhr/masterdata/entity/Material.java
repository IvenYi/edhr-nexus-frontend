package com.zencas.edhr.masterdata.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "material")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "specification")
    private String specification;
    @Column(name = "version", length = 64)
    @Builder.Default
    private String version = "V1.0";
    @Column(name = "material_purpose", length = 32)
    @Builder.Default
    private String materialPurpose = "生产物料";
    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    @Column(name = "material_type_id")
    private Long materialTypeId;
    @Transient
    private String materialTypeName;
    @Column(name = "unit")
    private String unit;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "status")
    @Builder.Default
    private String status = "ACTIVE";
    @Column(name = "created_by")
    private String createdBy;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_by")
    private String updatedBy;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @jakarta.persistence.PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
    }

    @jakarta.persistence.PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }
}
