--liquibase formatted sql
--changeset edhr:0094-ai-native-form-writes
ALTER TABLE form_template ADD COLUMN lock_version BIGINT NOT NULL DEFAULT 0;
CREATE TABLE form_edit_lease (
    version_id BIGINT PRIMARY KEY REFERENCES form_template_version(id) ON DELETE CASCADE,
    owner_token UUID NOT NULL,
    lease_until TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_form_edit_lease_owner ON form_edit_lease(owner_token);
ALTER TABLE ai_task ADD COLUMN form_template_id BIGINT;
ALTER TABLE ai_task ADD COLUMN form_version_id BIGINT;
ALTER TABLE ai_run ADD COLUMN form_read_revision BIGINT;
ALTER TABLE ai_run ADD COLUMN form_read_epoch BIGINT;
CREATE TABLE ai_form_receipt (
    task_id UUID NOT NULL REFERENCES ai_task(id),
    operation_id VARCHAR(128) NOT NULL,
    run_id UUID NOT NULL REFERENCES ai_run(id),
    request_hash VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    result_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY(task_id, operation_id)
);
