package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workflow_intervention")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowIntervention {
    @Id private Long id;
    @Column(name = "instance_id")
    private Long instanceId;
    @Column(name = "action")
    private String action;
    @Column(name = "operator_id")
    private String operatorId;
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    @Column(name = "signature_id")
    private Long signatureId;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}