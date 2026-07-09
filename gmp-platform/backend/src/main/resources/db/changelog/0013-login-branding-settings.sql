--liquibase formatted sql
--changeset edhr:0013-login-branding-settings

ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS login_subtitle VARCHAR(128) NOT NULL DEFAULT '电子设备历史记录平台';
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS login_description VARCHAR(512) NOT NULL DEFAULT '面向医疗器械生产的 GMP 合规数字化解决方案，确保每一批次全程可追溯、可审计。';
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS login_compliance_items TEXT NOT NULL DEFAULT '21 CFR Part 11|合规标准
ISO 13485|质量体系
GAMP 5|验证框架';
