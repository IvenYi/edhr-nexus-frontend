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
@Table(name = "system_setting")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {
    @Id private Long id;
    @Column(name = "tenant_id")
    @Builder.Default private String tenantId = "default";
    @Column(name = "system_name")
    private String systemName;
    @Column(name = "system_logo_file_id")
    private Long systemLogoFileId;
    @Column(name = "logo_width")
    private Integer logoWidth;
    @Column(name = "logo_height")
    private Integer logoHeight;
    @Column(name = "browser_title")
    private String browserTitle;
    @Column(name = "browser_icon_file_id")
    private Long browserIconFileId;
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
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
