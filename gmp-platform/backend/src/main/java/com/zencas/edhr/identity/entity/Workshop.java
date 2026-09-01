package com.zencas.edhr.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workshop")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Workshop {
    @Id private Long id;
    @Column(name = "tenant_id", nullable = false) @Builder.Default private Long tenantId = 1L;
    @Column(nullable = false, length = 64) private String code;
    @Column(nullable = false, length = 128) private String name;
    @Column(length = 512) private String description;
    @Column(nullable = false, length = 32) @Builder.Default private String status = "ACTIVE";
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() {
        if (tenantId == null) tenantId = 1L;
        if (status == null) status = "ACTIVE";
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
