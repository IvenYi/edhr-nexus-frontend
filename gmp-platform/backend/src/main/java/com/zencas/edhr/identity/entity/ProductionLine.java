package com.zencas.edhr.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "production_line")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductionLine {
    @Id private Long id;
    @Column(name = "workshop_id", nullable = false) private Long workshopId;
    @Column(nullable = false, length = 64) private String code;
    @Column(nullable = false, length = 128) private String name;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
