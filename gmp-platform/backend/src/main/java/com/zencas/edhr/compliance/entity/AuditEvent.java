package com.zencas.edhr.compliance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;

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
    @Column(name = "snapshot_hash", length = 64)
    private String snapshotHash;
    @Column(name = "operator_id")
    private String operatorId;
    @Column(name = "operator_name")
    private String operatorName;
    @Column(name = "operator_account")
    private String operatorAccount;
    @Column(name = "source")
    @Builder.Default private String source = "UI";
    @Column(name = "module_name")
    private String moduleName;
    @Column(name = "menu_name")
    private String menuName;
    @Column(name = "function_name")
    private String functionName;
    @Column(name = "data_summary")
    private String dataSummary;
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    @Column(name = "ip_address")
    private String ipAddress;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void sealSnapshotHash() {
        if (!hasText(snapshotHash)) {
            snapshotHash = computeSnapshotHash();
        }
    }

    @PreUpdate
    public void preventMutation() {
        throw new IllegalStateException("Audit events are immutable snapshots and cannot be updated");
    }

    public String computeSnapshotHash() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(canonicalAuditPayload().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private String canonicalAuditPayload() {
        StringBuilder payload = new StringBuilder();
        appendCanonical(payload, id);
        appendCanonical(payload, tenantId);
        appendCanonical(payload, entityType);
        appendCanonical(payload, entityId);
        appendCanonical(payload, action);
        appendCanonical(payload, contentBefore);
        appendCanonical(payload, contentAfter);
        appendCanonical(payload, operatorId);
        appendCanonical(payload, operatorName);
        appendCanonical(payload, operatorAccount);
        appendCanonical(payload, source);
        appendCanonical(payload, moduleName);
        appendCanonical(payload, menuName);
        appendCanonical(payload, functionName);
        appendCanonical(payload, dataSummary);
        appendCanonical(payload, reason);
        appendCanonical(payload, ipAddress);
        appendCanonical(payload, createdAt);
        return payload.toString();
    }

    private void appendCanonical(StringBuilder payload, Object value) {
        if (value == null) {
            payload.append("-1:");
            return;
        }
        String text = String.valueOf(value);
        payload.append(text.length()).append(':').append(text);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
