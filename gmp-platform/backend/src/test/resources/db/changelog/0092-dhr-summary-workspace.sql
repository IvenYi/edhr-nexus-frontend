--liquibase formatted sql
--changeset codex:0092-dhr-summary-workspace

ALTER TABLE workflow_definition DROP CONSTRAINT IF EXISTS ck_workflow_definition_record_control_category;
ALTER TABLE workflow_definition
    ADD CONSTRAINT ck_workflow_definition_record_control_category
    CHECK (type <> 'RECORD_CONTROL' OR business_type IN ('CHANGE', 'OBSOLETE', 'DHR_SUMMARY'));

ALTER TABLE product_process_version
    ADD COLUMN dhr_review_mode VARCHAR(16) NOT NULL DEFAULT 'NONE',
    ADD COLUMN dhr_review_workflow_definition_id BIGINT,
    ADD COLUMN dhr_review_workflow_version_id BIGINT,
    ADD CONSTRAINT ck_product_process_dhr_review_mode CHECK (dhr_review_mode IN ('NONE', 'REQUIRED')),
    ADD CONSTRAINT ck_product_process_dhr_review_binding CHECK (
        (dhr_review_mode = 'NONE' AND dhr_review_workflow_definition_id IS NULL AND dhr_review_workflow_version_id IS NULL)
        OR
        (dhr_review_mode = 'REQUIRED' AND dhr_review_workflow_definition_id IS NOT NULL AND dhr_review_workflow_version_id IS NOT NULL)
    ),
    ADD CONSTRAINT fk_product_process_dhr_review_definition FOREIGN KEY (dhr_review_workflow_definition_id) REFERENCES workflow_definition(id),
    ADD CONSTRAINT fk_product_process_dhr_review_version FOREIGN KEY (dhr_review_workflow_version_id) REFERENCES workflow_definition_version(id);

ALTER TABLE dhr_instance
    ADD COLUMN summary_status VARCHAR(24) NOT NULL DEFAULT 'NOT_STARTED',
    ADD COLUMN dhr_review_mode VARCHAR(16) NOT NULL DEFAULT 'NONE',
    ADD COLUMN dhr_review_workflow_definition_id BIGINT,
    ADD COLUMN dhr_review_workflow_version_id BIGINT,
    ADD CONSTRAINT ck_dhr_instance_summary_status CHECK (summary_status IN ('NOT_STARTED', 'DRAFT', 'PENDING_REVIEW', 'FORMALIZED')),
    ADD CONSTRAINT ck_dhr_instance_review_mode CHECK (dhr_review_mode IN ('NONE', 'REQUIRED')),
    ADD CONSTRAINT ck_dhr_instance_review_binding CHECK (
        (dhr_review_mode = 'NONE' AND dhr_review_workflow_definition_id IS NULL AND dhr_review_workflow_version_id IS NULL)
        OR
        (dhr_review_mode = 'REQUIRED' AND dhr_review_workflow_definition_id IS NOT NULL AND dhr_review_workflow_version_id IS NOT NULL)
    ),
    ADD CONSTRAINT fk_dhr_instance_review_definition FOREIGN KEY (dhr_review_workflow_definition_id) REFERENCES workflow_definition(id),
    ADD CONSTRAINT fk_dhr_instance_review_version FOREIGN KEY (dhr_review_workflow_version_id) REFERENCES workflow_definition_version(id);

CREATE TABLE dhr_summary_draft (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    dhr_instance_id BIGINT NOT NULL,
    overlay_directory_json TEXT NOT NULL,
    evidence_placement_json TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    created_by VARCHAR(192),
    created_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(192),
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_dhr_summary_draft_instance UNIQUE (tenant_id, dhr_instance_id),
    CONSTRAINT fk_dhr_summary_draft_instance FOREIGN KEY (dhr_instance_id) REFERENCES dhr_instance(id)
);

CREATE TABLE dhr_summary_version (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    dhr_instance_id BIGINT NOT NULL,
    version_no INTEGER NOT NULL,
    status VARCHAR(24) NOT NULL,
    review_mode VARCHAR(16) NOT NULL,
    review_workflow_definition_id BIGINT,
    review_workflow_version_id BIGINT,
    base_directory_snapshot TEXT NOT NULL,
    overlay_directory_snapshot TEXT NOT NULL,
    candidate_snapshot TEXT NOT NULL,
    snapshot_hash VARCHAR(64) NOT NULL,
    submitted_by VARCHAR(192),
    submitted_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_dhr_summary_version_no UNIQUE (tenant_id, dhr_instance_id, version_no),
    CONSTRAINT uk_dhr_summary_version_hash UNIQUE (tenant_id, dhr_instance_id, snapshot_hash),
    CONSTRAINT ck_dhr_summary_version_status CHECK (status IN ('PENDING_REVIEW', 'FORMALIZED')),
    CONSTRAINT ck_dhr_summary_version_review_mode CHECK (review_mode IN ('NONE', 'REQUIRED')),
    CONSTRAINT fk_dhr_summary_version_instance FOREIGN KEY (dhr_instance_id) REFERENCES dhr_instance(id),
    CONSTRAINT fk_dhr_summary_version_review_definition FOREIGN KEY (review_workflow_definition_id) REFERENCES workflow_definition(id),
    CONSTRAINT fk_dhr_summary_version_review_version FOREIGN KEY (review_workflow_version_id) REFERENCES workflow_definition_version(id)
);

CREATE TABLE dhr_summary_evidence (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    summary_version_id BIGINT NOT NULL,
    source_record_id BIGINT NOT NULL,
    target_node_key VARCHAR(128) NOT NULL,
    origin_kind VARCHAR(32) NOT NULL,
    source_snapshot TEXT NOT NULL,
    source_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_dhr_summary_evidence_source UNIQUE (tenant_id, summary_version_id, source_record_id),
    CONSTRAINT ck_dhr_summary_evidence_origin CHECK (origin_kind IN ('DIRECTORY', 'WORK', 'CUSTOM')),
    CONSTRAINT fk_dhr_summary_evidence_version FOREIGN KEY (summary_version_id) REFERENCES dhr_summary_version(id),
    CONSTRAINT fk_dhr_summary_evidence_record FOREIGN KEY (source_record_id) REFERENCES form_instance_record(id)
);

CREATE INDEX idx_dhr_summary_version_instance ON dhr_summary_version(tenant_id, dhr_instance_id, version_no DESC);
CREATE INDEX idx_dhr_summary_evidence_version ON dhr_summary_evidence(tenant_id, summary_version_id, target_node_key);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records.dhr-summary', 'DHR汇总', 'PAGE', 'records.dhr-management', 2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records.dhr-summary');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'dhr.summaries.edit', 'DHR汇总编辑', 'BUTTON', 'records.dhr-summary', 1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'dhr.summaries.edit');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'dhr.summaries.submit', 'DHR汇总提交', 'BUTTON', 'records.dhr-summary', 2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'dhr.summaries.submit');

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r
JOIN permission p ON p.code IN ('records.dhr-summary', 'dhr.summaries.edit', 'dhr.summaries.submit')
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
