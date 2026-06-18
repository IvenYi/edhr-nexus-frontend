--liquibase formatted sql
--changeset edhr:0022-mail-settings

ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS email_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(256);
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS smtp_port INTEGER NOT NULL DEFAULT 25;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS smtp_ssl_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS smtp_username VARCHAR(256);
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS smtp_password VARCHAR(512);
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS mail_from_name VARCHAR(128);
