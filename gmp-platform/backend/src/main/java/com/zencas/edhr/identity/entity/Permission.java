package com.zencas.edhr.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "permission")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Permission {
    @Id private Long id;
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "type")
    @Builder.Default private String type = "PAGE";
    @Column(name = "parent_code")
    private String parentCode;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}