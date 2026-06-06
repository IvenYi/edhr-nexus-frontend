package com.zencas.edhr.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "data_scope_policy")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DataScopePolicy {
    @Id private Long id;
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "scope_type")
    @Builder.Default private String scopeType = "SELF";
    @Column(name = "entity_type")
    private String entityType;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}