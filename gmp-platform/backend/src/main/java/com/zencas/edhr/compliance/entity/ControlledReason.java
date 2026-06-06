package com.zencas.edhr.compliance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "controlled_reason")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ControlledReason {
    @Id private Long id;
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "category")
    @Builder.Default private String category = "CHANGE";
    @Column(name = "is_active")
    @Builder.Default private Boolean isActive = true;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}