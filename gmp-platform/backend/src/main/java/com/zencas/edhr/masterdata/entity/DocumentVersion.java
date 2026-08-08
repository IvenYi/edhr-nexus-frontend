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
@Table(name = "document_version")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVersion {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id", nullable = false)
    @Builder.Default private String tenantId = "default";
    @Column(name = "document_id", nullable = false)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long documentId;
    @Column(name = "version", nullable = false, length = 64)
    private String version;
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "file_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long fileId;
    @Column(name = "file_reference", length = 1024)
    private String fileReference;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;
    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;
    @Column(name = "version_status", length = 32)
    @Builder.Default private String versionStatus = "DRAFT";
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
