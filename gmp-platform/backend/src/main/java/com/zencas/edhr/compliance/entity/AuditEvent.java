package com.zencas.edhr.compliance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity @Table(name = "audit_event")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditEvent {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "entity_type")
    private String entityType;
    @Column(name = "entity_id")
    private String entityId;
    @Column(name = "action")
    private String action;
    @Column(name = "content_before", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String contentBefore;
    @Column(name = "content_after", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String contentAfter;
    @Column(name = "operator_id")
    private String operatorId;
    @Column(name = "operator_name")
    private String operatorName;
    @Column(name = "source")
    @Builder.Default private String source = "UI";
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    @Column(name = "ip_address")
    private String ipAddress;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
