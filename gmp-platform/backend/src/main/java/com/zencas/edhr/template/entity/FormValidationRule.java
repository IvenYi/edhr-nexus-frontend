package com.zencas.edhr.template.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "form_validation_rule")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FormValidationRule {
    @Id private Long id;
    @Column(name = "field_id")
    private Long fieldId;
    @Column(name = "rule_type")
    private String ruleType;
    @Column(name = "rule_config", columnDefinition = "jsonb")
    private String ruleConfig;
    @Column(name = "error_message")
    private String errorMessage;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}