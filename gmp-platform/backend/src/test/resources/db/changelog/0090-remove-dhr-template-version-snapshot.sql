--liquibase formatted sql
--changeset codex:0090-remove-dhr-template-version-snapshot

ALTER TABLE dhr_template_version DROP COLUMN IF EXISTS directory_snapshot;
