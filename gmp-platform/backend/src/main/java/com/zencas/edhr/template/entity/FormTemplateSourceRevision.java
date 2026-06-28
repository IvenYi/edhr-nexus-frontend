package com.zencas.edhr.template.entity;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "form_template_source_revision")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormTemplateSourceRevision {
    @Id
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @Column(name = "tenant_id")
    @Builder.Default
    private String tenantId = "default";

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "version_id")
    private Long versionId;

    @Column(name = "file_id")
    private Long fileId;

    @Column(name = "revision_no")
    private Integer revisionNo;

    @Column(name = "source", length = 32)
    private String source;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
