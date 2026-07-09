package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "form_signature_block")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FormSignatureBlock {
    @Id private Long id;
    @Column(name = "version_id")
    private Long versionId;
    @Column(name = "block_name")
    private String blockName;
    @Column(name = "meaning")
    private String meaning;
    @Column(name = "position")
    @Builder.Default private Integer position = 0;
    @Column(name = "is_required")
    @Builder.Default private Boolean isRequired = true;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}