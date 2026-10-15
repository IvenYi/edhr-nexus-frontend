--liquibase formatted sql
--changeset codex:0107-form-projection-runtime
CREATE TABLE form_projection_batch (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    form_instance_id BIGINT NOT NULL REFERENCES form_instance_record(id),
    final_revision INTEGER NOT NULL,
    rule_version VARCHAR(64) NOT NULL,
    source_json JSONB NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SUCCEEDED','FAILED','INVALIDATED')),
    attempts INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    UNIQUE (form_instance_id,final_revision,rule_version)
);
CREATE TABLE form_projection_record (
    id BIGSERIAL PRIMARY KEY,
    batch_id BIGINT NOT NULL REFERENCES form_projection_batch(id),
    binding_id VARCHAR(128) NOT NULL,
    row_key VARCHAR(512) NOT NULL,
    model_id VARCHAR(64) NOT NULL,
    attributes JSONB NOT NULL,
    sources JSONB NOT NULL,
    table_id VARCHAR(128) NOT NULL,
    UNIQUE (batch_id,binding_id,row_key)
);
CREATE INDEX form_projection_pending ON form_projection_batch (status,id);
CREATE INDEX form_projection_attributes ON form_projection_record USING GIN (attributes);
