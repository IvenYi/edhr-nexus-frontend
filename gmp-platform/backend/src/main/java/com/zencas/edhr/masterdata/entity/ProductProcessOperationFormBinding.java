package com.zencas.edhr.masterdata.entity;

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
@Table(name = "product_process_operation_form_binding")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductProcessOperationFormBinding {
    @Id private Long id;
    @Column(name = "product_process_operation_binding_id", nullable = false)
    private Long productProcessOperationBindingId;
    @Column(name = "form_template_version_id", nullable = false)
    private Long formTemplateVersionId;
    @Column(name = "required", nullable = false)
    @Builder.Default private Boolean required = true;
    @Column(name = "sort_order", nullable = false)
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
