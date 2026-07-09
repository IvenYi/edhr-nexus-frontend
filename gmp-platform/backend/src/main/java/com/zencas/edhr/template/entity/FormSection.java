package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "form_section")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FormSection {
    @Id private Long id;
    @Column(name = "version_id")
    private Long versionId;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "is_repeatable")
    @Builder.Default private Boolean isRepeatable = false;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}