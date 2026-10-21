--liquibase formatted sql
--changeset codex:0115-quality-reasons
CREATE TABLE IF NOT EXISTS quality_reason (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    reason_type VARCHAR(16) NOT NULL CHECK (reason_type IN ('DEFECT', 'SCRAP')),
    code VARCHAR(64) NOT NULL CHECK (BTRIM(code) <> ''),
    name VARCHAR(128) NOT NULL CHECK (BTRIM(name) <> ''),
    description VARCHAR(512),
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(192),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(192),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_quality_reason_code ON quality_reason(tenant_id, reason_type, LOWER(code));
CREATE INDEX IF NOT EXISTS idx_quality_reason_list ON quality_reason(tenant_id, reason_type, status, sort_order);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), p.code, p.name, 'PAGE', p.parent_code, p.sort_order
FROM (VALUES
    ('master-data.reason-modeling', '原因建模', 'master-data', 25),
    ('master-data.defect-reasons', '不良原因', 'master-data.reason-modeling', 1),
    ('master-data.scrap-reasons', '报废原因', 'master-data.reason-modeling', 2)
) p(code, name, parent_code, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM permission existing WHERE existing.code = p.code);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r JOIN permission p ON p.code IN ('master-data.reason-modeling', 'master-data.defect-reasons', 'master-data.scrap-reasons')
WHERE r.code = 'ADMIN' AND NOT EXISTS (
    SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
