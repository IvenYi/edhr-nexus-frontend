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
    @Column(name = "version")
    private String version;
    @Column(name = "file_reference")
    private String fileReference;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}