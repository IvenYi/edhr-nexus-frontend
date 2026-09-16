--liquibase formatted sql

--changeset codex:0083-record-control-revisions
CREATE TABLE form_instance_revision (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    record_id BIGINT NOT NULL REFERENCES form_instance_record(id),
    revision_no INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL,
    values_json TEXT NOT NULL,
    content_hash VARCHAR(64),
    request_id BIGINT,
    created_by VARCHAR(192),
    created_at TIMESTAMP,
    CONSTRAINT uk_form_instance_revision UNIQUE (tenant_id, record_id, revision_no),
    CONSTRAINT ck_form_instance_revision_status CHECK (status IN ('EFFECTIVE', 'SUPERSEDED', 'VOIDED'))
);
ALTER TABLE form_instance_record ADD COLUMN current_revision_id BIGINT REFERENCES form_instance_revision(id);
ALTER TABLE form_instance_record ADD COLUMN obsolete_request_id BIGINT;
ALTER TABLE form_instance_record ADD COLUMN obsoleted_at TIMESTAMP;
CREATE INDEX idx_form_instance_revision_record ON form_instance_revision(tenant_id, record_id, revision_no DESC);

--changeset codex:0083-record-control-baseline dbms:postgresql
-- Preserve the saved value and known provenance. Unknown historical creator/time stay NULL.
INSERT INTO form_instance_revision (id, tenant_id, record_id, revision_no, status, values_json, content_hash, created_by, created_at)
SELECT nextval('hibernate_sequence'), tenant_id, id, 1, 'EFFECTIVE', values_json,
       encode(sha256(convert_to(values_json, 'UTF8')), 'hex'), created_by, created_at
FROM form_instance_record WHERE status='COMPLETED';
UPDATE form_instance_record record SET current_revision_id=revision.id
FROM form_instance_revision revision
WHERE revision.record_id=record.id AND revision.tenant_id=record.tenant_id AND revision.revision_no=1;

--changeset codex:0083-record-control-requests
CREATE SEQUENCE record_control_request_number_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE record_control_request (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    request_no VARCHAR(64) NOT NULL,
    request_type VARCHAR(16) NOT NULL,
    status VARCHAR(24) NOT NULL,
    record_id BIGINT NOT NULL REFERENCES form_instance_record(id),
    source_revision_id BIGINT NOT NULL REFERENCES form_instance_revision(id),
    source_values_json TEXT NOT NULL,
    proposed_values_json TEXT,
    diff_json TEXT,
    reason_text TEXT NOT NULL,
    applicant_id VARCHAR(64) NOT NULL,
    applicant_name VARCHAR(192),
    applicant_signature_id BIGINT NOT NULL REFERENCES signature(id),
    workflow_definition_id VARCHAR(64) NOT NULL,
    workflow_version_id VARCHAR(64) NOT NULL,
    workflow_instance_id VARCHAR(64),
    workflow_snapshot_hash VARCHAR(64),
    idempotency_key VARCHAR(128) NOT NULL,
    audit_correlation_id VARCHAR(64) NOT NULL,
    submitted_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    CONSTRAINT uk_record_control_no UNIQUE (tenant_id, request_no),
    CONSTRAINT uk_record_control_idempotency UNIQUE (tenant_id, applicant_id, idempotency_key),
    CONSTRAINT ck_record_control_type CHECK (request_type IN ('CHANGE', 'OBSOLETE')),
    CONSTRAINT ck_record_control_status CHECK (status IN ('IN_REVIEW', 'APPROVED', 'RETURNED', 'WITHDRAWN'))
);
CREATE INDEX idx_record_control_applicant ON record_control_request(tenant_id, applicant_id, submitted_at DESC);
CREATE INDEX idx_record_control_record ON record_control_request(tenant_id, record_id, submitted_at DESC);
CREATE TABLE record_control_result_event (
    event_id VARCHAR(128) PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    request_id BIGINT NOT NULL REFERENCES record_control_request(id),
    result VARCHAR(24) NOT NULL,
    occurred_at TIMESTAMP NOT NULL
);

--changeset codex:0083-record-control-active-index dbms:postgresql
CREATE UNIQUE INDEX uk_record_control_active ON record_control_request(tenant_id, record_id) WHERE status='IN_REVIEW';
CREATE UNIQUE INDEX uk_form_instance_current_effective ON form_instance_revision(tenant_id, record_id) WHERE status='EFFECTIVE';
