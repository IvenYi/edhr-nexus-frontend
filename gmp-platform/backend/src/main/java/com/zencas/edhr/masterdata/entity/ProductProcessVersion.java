package com.zencas.edhr.masterdata.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
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
@Table(name = "product_process_version")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductProcessVersion {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";
    @Column(name = "product_process_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long productProcessId;
    @Column(name = "version_label", nullable = false, length = 64)
    private String versionLabel;
    @Column(name = "production_mode", nullable = false, length = 64)
    private String productionMode;
    @Column(name = "production_form", nullable = false, length = 64)
    private String productionForm;
    @Column(name = "route_version_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long routeVersionId;
    @Column(name = "dhr_template_version_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long dhrTemplateVersionId;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;
    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;
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
