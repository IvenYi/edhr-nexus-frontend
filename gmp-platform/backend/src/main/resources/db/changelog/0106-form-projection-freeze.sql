--liquibase formatted sql
--changeset codex:0106-form-projection-freeze
ALTER TABLE form_template_version ADD COLUMN projection_frozen_json TEXT;
ALTER TABLE form_template_version ADD COLUMN lock_version BIGINT NOT NULL DEFAULT 0;
