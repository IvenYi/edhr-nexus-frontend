package com.zencas.edhr.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "user_account")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAccount {
    @Id private Long id;
    @Column(name = "tenant_id") @Builder.Default private Long tenantId = 0L;
    @Column(nullable = false, length = 128) private String username;
    @Column(name = "password_hash", nullable = false, length = 256) private String passwordHash;
    @Column(name = "display_name", nullable = false, length = 128) private String displayName;
    @Column(length = 256) private String email;
    @Column(length = 32) private String phone;
    @Column(nullable = false, length = 32) @Builder.Default private String status = "ACTIVE";
    @Column(name = "last_login_at") private LocalDateTime lastLoginAt;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
