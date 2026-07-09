package com.zencas.edhr.compliance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "file_object")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FileObject {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "original_name")
    private String originalName;
    @Column(name = "stored_path")
    private String storedPath;
    @Column(name = "mime_type")
    private String mimeType;
    @Column(name = "file_size")
    @Builder.Default private Long fileSize = 0L;
    @Column(name = "md5_hash")
    private String md5Hash;
    @Column(name = "target_type")
    private String targetType;
    @Column(name = "target_id")
    private String targetId;
    @Column(name = "uploaded_by")
    private String uploadedBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}