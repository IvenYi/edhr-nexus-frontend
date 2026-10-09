--liquibase formatted sql
--changeset codex:0091-remove-dhr-template-version-status

ALTER TABLE dhr_template_version DROP COLUMN IF EXISTS status;
