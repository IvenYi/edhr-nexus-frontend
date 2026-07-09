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
    @Column(name = "login_subtitle")
    private String loginSubtitle;
    @Column(name = "login_description")
    private String loginDescription;
    @Column(name = "login_compliance_items")
    private String loginComplianceItems;
    @Column(name = "browser_icon_file_id")
    private Long browserIconFileId;
    @Column(name = "force_password_change_on_first_login")
    @Builder.Default private Boolean forcePasswordChangeOnFirstLogin = true;
    @Column(name = "password_change_cycle_enabled")
    @Builder.Default private Boolean passwordChangeCycleEnabled = false;
    @Column(name = "password_change_cycle_days")
    @Builder.Default private Integer passwordChangeCycleDays = 90;
    @Column(name = "password_complexity")
    @Builder.Default private String passwordComplexity = "MEDIUM";
    @Column(name = "password_failure_lock_threshold")
    @Builder.Default private Integer passwordFailureLockThreshold = 5;
    @Column(name = "password_failure_lock_minutes")
    @Builder.Default private Integer passwordFailureLockMinutes = 30;
    @Column(name = "idle_logout_minutes")
    @Builder.Default private Integer idleLogoutMinutes = 30;
    @Column(name = "token_validity_minutes")
    @Builder.Default private Integer tokenValidityMinutes = 480;
    @Column(name = "force_signature_on_first_login")
    @Builder.Default private Boolean forceSignatureOnFirstLogin = false;
    @Column(name = "signature_change_cycle_enabled")
    @Builder.Default private Boolean signatureChangeCycleEnabled = true;
    @Column(name = "signature_change_cycle_days")
    @Builder.Default private Integer signatureChangeCycleDays = 30;
    @Column(name = "email_enabled")
    @Builder.Default private Boolean emailEnabled = true;
    @Column(name = "smtp_host")
    private String smtpHost;
    @Column(name = "smtp_port")
    @Builder.Default private Integer smtpPort = 25;
    @Column(name = "smtp_ssl_enabled")
    @Builder.Default private Boolean smtpSslEnabled = false;
    @Column(name = "smtp_username")
    private String smtpUsername;
    @Column(name = "smtp_password")
    private String smtpPassword;
    @Column(name = "mail_from_name")
    private String mailFromName;
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
