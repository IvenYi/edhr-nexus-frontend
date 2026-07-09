package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "form_field")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FormField {
    @Id private Long id;
    @Column(name = "section_id")
    private Long sectionId;
    @Column(name = "field_code", length = 64)
    private String fieldCode;
    @Column(name = "field_name")
    private String fieldName;
    @Column(name = "field_type")
    @Builder.Default private String fieldType = "TEXT";
    @Column(name = "options", columnDefinition = "jsonb")
    private String options;
    @Column(name = "is_required")
    @Builder.Default private Boolean isRequired = false;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}