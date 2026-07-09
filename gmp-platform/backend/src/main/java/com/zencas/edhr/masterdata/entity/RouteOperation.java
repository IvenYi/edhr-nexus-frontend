package com.zencas.edhr.masterdata.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "route_operation")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RouteOperation {
    @Id private Long id;
    @Column(name = "route_id")
    private Long routeId;
    @Column(name = "operation_id")
    private Long operationId;
    @Column(name = "sequence_order")
    @Builder.Default private Integer sequenceOrder = 0;
    @Column(name = "is_mandatory")
    @Builder.Default private Boolean isMandatory = true;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}