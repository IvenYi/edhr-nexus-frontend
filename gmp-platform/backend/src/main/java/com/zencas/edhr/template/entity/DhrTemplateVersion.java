package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "dhr_template_version")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DhrTemplateVersion {
    @Id private Long id;
    @Column(name = "dhr_template_id")
    private Long dhrTemplateId;
    @Column(name = "version_number")
    @Builder.Default private Integer versionNumber = 1;
    @Column(name = "directory_snapshot", columnDefinition = "jsonb")
    private String directorySnapshot;
    @Column(name = "is_current")
    @Builder.Default private Boolean isCurrent = false;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}