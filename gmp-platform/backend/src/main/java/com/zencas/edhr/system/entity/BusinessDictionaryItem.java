package com.zencas.edhr.system.entity;

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
@Table(name = "business_dictionary_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessDictionaryItem {
    @Id private Long id;
    @Column(name = "dictionary_id")
    private Long dictionaryId;
    @Column(name = "value")
    private String value;
    @Column(name = "label")
    private String label;
    @Column(name = "sort_order")
    @Builder.Default private Integer sortOrder = 0;
    @Column(name = "status")
    @Builder.Default private String status = "ACTIVE";
    @Column(name = "remark")
    private String remark;
    @Column(name = "builtin")
    @Builder.Default private Boolean builtin = false;
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
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
