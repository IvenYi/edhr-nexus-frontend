package com.zencas.edhr.identity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginLog {
    @Id
    private Long id;

    @Column(name = "tenant_id")
    @Builder.Default
    private Long tenantId = 0L;

    @Column(name = "operator_id")
    private Long operatorId;

    @Column(name = "operator_name", length = 128)
    private String operatorName;

    @Column(name = "username", length = 128)
    private String username;

    @Column(name = "event_type", nullable = false, length = 32)
    private String eventType;

    @Column(name = "auth_method", nullable = false, length = 32)
    private String authMethod;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "platform", nullable = false, length = 32)
    private String platform;

    @Column(name = "client_type", nullable = false, length = 32)
    private String clientType;

    @Column(name = "browser", length = 64)
    private String browser;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @PrePersist
    void prePersist() {
        if (occurredAt == null) occurredAt = LocalDateTime.now();
    }
}
