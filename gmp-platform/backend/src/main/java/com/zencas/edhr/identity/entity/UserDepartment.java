package com.zencas.edhr.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "user_department")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDepartment {
    @Id private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "department_id", nullable = false) private Long departmentId;
    @Column(name = "is_primary") @Builder.Default private Boolean isPrimary = false;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
