package com.zencas.edhr.workflow.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "workflow_binding_rule")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowBindingRule {
    @Id @JsonSerialize(using = ToStringSerializer.class) private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "business_type")
    private String businessType;
    @Column(length = 256) private String name;
    @Column(name = "definition_id")
    @JsonSerialize(using = ToStringSerializer.class) private Long definitionId;
    @Column(name = "version_id")
    @JsonSerialize(using = ToStringSerializer.class) private Long versionId;
    @Column(name = "is_active")
    @Builder.Default private Boolean isActive = true;
    @Column(name = "rule_type", length = 32) @Builder.Default private String ruleType = "GLOBAL";
    @Column(name = "product_family_id") @JsonSerialize(using = ToStringSerializer.class) private Long productFamilyId;
    @Column(name = "product_id") @JsonSerialize(using = ToStringSerializer.class) private Long productId;
    @Column(name = "operation_id") @JsonSerialize(using = ToStringSerializer.class) private Long operationId;
    @Column private Integer priority;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
