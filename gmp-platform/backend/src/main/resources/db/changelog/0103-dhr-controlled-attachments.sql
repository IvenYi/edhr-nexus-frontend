--liquibase formatted sql
--changeset codex:0103-dhr-controlled-attachments

CREATE TABLE dhr_attachment (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    dhr_instance_id BIGINT NOT NULL,
    original_name VARCHAR(512) NOT NULL,
    stored_path VARCHAR(1024) NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    file_size BIGINT NOT NULL,
    sha256 VARCHAR(64) NOT NULL,
    source_kind VARCHAR(32) NOT NULL,
    purpose VARCHAR(500) NOT NULL,
    original_recorded_at TIMESTAMP,
    custody_location VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    verified_by VARCHAR(192),
    verified_at TIMESTAMP,
    linked_by VARCHAR(192),
    linked_at TIMESTAMP NOT NULL,
    unlinked_by VARCHAR(192),
    unlinked_at TIMESTAMP,
    unlink_reason VARCHAR(500),
    CONSTRAINT fk_dhr_attachment_instance FOREIGN KEY (dhr_instance_id) REFERENCES dhr_instance(id),
    CONSTRAINT ck_dhr_attachment_source CHECK (source_kind IN ('EXTERNAL_REPORT','CERTIFICATE','PAPER_SCAN','OTHER')),
    CONSTRAINT ck_dhr_attachment_verification CHECK (verification_status IN ('PENDING','VERIFIED','REJECTED'))
);
CREATE INDEX idx_dhr_attachment_active ON dhr_attachment(tenant_id,dhr_instance_id,active);

ALTER TABLE dhr_summary_version ADD COLUMN attachment_snapshot TEXT NOT NULL DEFAULT '[]';

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'dhr.summaries.export', 'DHR汇总导出', 'BUTTON', 'records.dhr-summary', 4
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code='dhr.summaries.export');

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id FROM role r JOIN permission p ON p.code='dhr.summaries.export'
WHERE r.code='ADMIN' AND NOT EXISTS (SELECT 1 FROM role_permission rp WHERE rp.role_id=r.id AND rp.permission_id=p.id);
