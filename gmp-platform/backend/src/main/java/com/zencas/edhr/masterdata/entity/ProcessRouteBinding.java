package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "process_route_binding")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProcessRouteBinding {
    @Id private Long id;
    @Column(name = "process_version_id")
    private Long processVersionId;
    @Column(name = "route_id")
    private Long routeId;
    @Column(name = "sequence_order")
    @Builder.Default private Integer sequenceOrder = 0;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}