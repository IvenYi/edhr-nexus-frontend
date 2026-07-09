package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "form_review_block")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FormReviewBlock {
    @Id private Long id;
    @Column(name = "version_id")
    private Long versionId;
    @Column(name = "review_type")
    private String reviewType;
    @Column(name = "reviewer_config")
    private String reviewerConfig;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}