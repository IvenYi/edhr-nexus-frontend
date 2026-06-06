package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "form_template_version")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FormTemplateVersion {
    @Id private Long id;
    @Column(name = "template_id")
    private Long templateId;
    @Column(name = "version_number")
    @Builder.Default private Integer versionNumber = 1;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
    @Column(name = "structure_snapshot", columnDefinition = "jsonb")
    private String structureSnapshot;
    @Column(name = "is_current")
    @Builder.Default private Boolean isCurrent = false;
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}