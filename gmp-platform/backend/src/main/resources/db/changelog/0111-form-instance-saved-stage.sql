--liquibase formatted sql
--changeset codex:0111-form-instance-saved-stage
-- Derivative display metadata, recorded with saved content. Existing records remain unknown until their next save.
ALTER TABLE form_instance_record ADD COLUMN saved_stage VARCHAR(32);
