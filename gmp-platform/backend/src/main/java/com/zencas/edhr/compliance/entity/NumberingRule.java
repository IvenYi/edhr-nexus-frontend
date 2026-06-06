package com.zencas.edhr.compliance.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "numbering_rule")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NumberingRule {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "business_type")
    private String businessType;
    @Column(name = "template")
    private String template;
    @Column(name = "reset_strategy")
    @Builder.Default private String resetStrategy = "DAILY";
    @Column(name = "seq_length")
    @Builder.Default private Integer seqLength = 4;
    @Column(name = "current_seq")
    @Builder.Default private Integer currentSeq = 0;
    @Column(name = "last_reset_value")
    private String lastResetValue;
    @Column(name = "is_active")
    @Builder.Default private Boolean isActive = true;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}