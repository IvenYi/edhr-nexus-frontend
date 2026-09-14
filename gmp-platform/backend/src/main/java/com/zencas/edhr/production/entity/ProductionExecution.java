package com.zencas.edhr.production.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_execution")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductionExecution {
    @Id private Long objectId;
    @Column(nullable = false, columnDefinition = "TEXT") private String snapshotJson;
    @Column(nullable = false, columnDefinition = "TEXT") private String stateJson;
    @Column(nullable = false) private Long revision;
    @Column(nullable = false) private LocalDateTime startedAt;
    @Column(nullable = false) private LocalDateTime updatedAt;
}
