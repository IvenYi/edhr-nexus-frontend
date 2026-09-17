--liquibase formatted sql

--changeset codex:0086-form-instance-business-source
-- The existing registry contains only production-execution records. Freeze that
-- business source on every row instead of reconstructing it at query time.
ALTER TABLE form_instance_record ADD COLUMN source_type VARCHAR(64) NOT NULL DEFAULT 'PRODUCTION_EXECUTION';
ALTER TABLE form_instance_record ALTER COLUMN source_type DROP DEFAULT;
CREATE INDEX idx_form_instance_source ON form_instance_record(tenant_id,source_type,updated_at DESC,id DESC);
