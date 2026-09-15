package com.zencas.edhr.workflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name = "workflow_instance")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowInstance {
    @Id private Long id;
    @Column(name = "definition_id")
    private Long definitionId;
    @Column(name = "version_id")
    private Long versionId;
    @Column(name = "business_type")
    private String businessType;
    @Column(name = "business_id")
    private String businessId;
    @Column(name = "status")
    @Builder.Default private String status = "RUNNING";
    @Column(name = "current_node_ids")
    private String currentNodeIds;
    @Column(name = "context_snapshot", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String contextSnapshot;
    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;
    @Column(name = "audit_correlation_id", length = 128)
    private String auditCorrelationId;
    @Column(name = "workflow_snapshot_hash", length = 64)
    private String workflowSnapshotHash;
    @Column(name = "initiator_id")
    private String initiatorId;
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
