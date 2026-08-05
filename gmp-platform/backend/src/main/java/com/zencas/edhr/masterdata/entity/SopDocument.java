package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "sop_document")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SopDocument {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "title")
    private String title;
    /** Controlled document category. Kept on the master document and immutable after creation. */
    @Column(name = "document_type", nullable = false, length = 32)
    @Builder.Default private String documentType = "SOP";
    @Column(name = "category_id")
    private Long categoryId;
    @Column(name = "version")
    private String version;
    @Column(name = "file_reference")
    private String fileReference;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
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
