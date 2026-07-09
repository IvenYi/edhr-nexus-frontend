package com.zencas.edhr.compliance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity @Table(name = "signature")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Signature {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "target_type")
    private String targetType;
    @Column(name = "target_id")
    private String targetId;
    @Column(name = "meaning")
    private String meaning;
    @Column(name = "signer_id")
    private String signerId;
    @Column(name = "signer_name")
    private String signerName;
    @Column(name = "auth_method")
    @Builder.Default private String authMethod = "PASSWORD";
    @Column(name = "auth_event_ref")
    private String authEventRef;
    @Column(name = "snapshot_hash")
    private String snapshotHash;
    @Column(name = "snapshot_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String snapshotData;
    @Column(name = "signed_at")
    private LocalDateTime signedAt;
    @Column(name = "signature_key")
    private String signatureKey;
    @Column(name = "signature_password_hash")
    private String signaturePasswordHash;
    @Column(name = "certified_at_epoch")
    private Long certifiedAtEpoch;
    @Column(name = "certified_at")
    private LocalDateTime certifiedAt;
    @Column(name = "expires_at_epoch")
    private Long expiresAtEpoch;
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    @Column(name = "authorization_notice_file_id")
    private Long authorizationNoticeFileId;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
