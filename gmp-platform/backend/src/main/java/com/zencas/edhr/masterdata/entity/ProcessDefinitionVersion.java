package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "process_definition_version")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcessDefinitionVersion {
    @Id private Long id;
    @Column(name = "process_definition_id")
    private Long processDefinitionId;
    @Column(name = "version_number")
    @Builder.Default private Integer versionNumber = 1;
    @Column(name = "status")
    @Builder.Default private String status = "DRAFT";
    @Column(name = "is_current")
    @Builder.Default private Boolean isCurrent = false;
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}