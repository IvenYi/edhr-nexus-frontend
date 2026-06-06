package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "form_table")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FormTable {
    @Id private Long id;
    @Column(name = "section_id")
    private Long sectionId;
    @Column(name = "table_code", length = 64)
    private String tableCode;
    @Column(name = "table_name")
    private String tableName;
    @Column(name = "columns_definition", columnDefinition = "jsonb")
    private String columnsDefinition;
    @Column(name = "min_rows")
    @Builder.Default private Integer minRows = 0;
    @Column(name = "max_rows")
    @Builder.Default private Integer maxRows = 100;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}