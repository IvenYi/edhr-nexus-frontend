--liquibase formatted sql
--changeset edhr:0007-system-logo-size-settings

ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS logo_width INTEGER NOT NULL DEFAULT 32;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS logo_height INTEGER NOT NULL DEFAULT 32;
