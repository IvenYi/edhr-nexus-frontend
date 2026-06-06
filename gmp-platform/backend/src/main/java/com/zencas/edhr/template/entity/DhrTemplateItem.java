package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "dhr_template_item")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DhrTemplateItem {
    @Id private Long id;
    @Column(name = "directory_id")
    private Long directoryId;
    @Column(name = "form_template_id")
    private Long formTemplateId;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "is_required")
    @Builder.Default private Boolean isRequired = true;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}