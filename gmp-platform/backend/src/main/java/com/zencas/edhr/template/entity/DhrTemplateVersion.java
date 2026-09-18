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
    @Column(name = "version_label", length = 64)
    private String versionLabel;
    @Column(name = "code", length = 64)
    private String code;
    @Column(name = "offline_version", length = 20)
    private String offlineVersion;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;
    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
