package com.zencas.edhr.template.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "form_template_version")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormTemplateVersion {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "version_number")
    @Builder.Default
    private Integer versionNumber = 1;

    @Column(name = "version_label", length = 64)
    private String version;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    @Column(name = "source_file_name", length = 256)
    private String sourceFileName;

    @Column(name = "source_file_id")
    private Long sourceFileId;

    @Column(name = "source_file_type", length = 32)
    private String sourceFileType;

    @Column(name = "import_status", length = 32)
    private String importStatus;

    @Column(name = "model_design_json", columnDefinition = "TEXT")
    private String modelDesignJson;

    @Column(name = "canvas_design_json", columnDefinition = "TEXT")
    private String canvasDesignJson;

    @Column(name = "workflow_design_json", columnDefinition = "TEXT")
    private String workflowDesignJson;

    @Column(name = "status")
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "structure_snapshot", columnDefinition = "jsonb", insertable = false, updatable = false)
    private String structureSnapshot;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = false;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
        if (updatedBy == null) updatedBy = createdBy;
        if (importStatus == null) importStatus = "未导入";
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
        if (updatedBy == null) updatedBy = createdBy;
    }
}
