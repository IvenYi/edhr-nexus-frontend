package com.zencas.edhr.masterdata.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "operation")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Operation {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "code", nullable = false, length = 64)
    private String code;
    @Column(name = "name", nullable = false, length = 128)
    private String name;
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    @Column(name = "operation_category", length = 128)
    private String operationCategory;
    @Column(name = "general_description", columnDefinition = "TEXT")
    private String generalDescription;
    @Column(name = "default_operation_type", length = 64)
    @Builder.Default private String defaultOperationType = "普通工序";
    @Column(name = "default_duration_minutes")
    private Integer defaultDurationMinutes;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "status")
    @Builder.Default private String status = "ACTIVE";
    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
    @Column(name = "created_by")
    private String createdBy;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @Column(name = "updated_by")
    private String updatedBy;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
    @PrePersist void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
    }
    @PreUpdate void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }
}
