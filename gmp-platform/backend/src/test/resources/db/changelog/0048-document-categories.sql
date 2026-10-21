--liquibase formatted sql
--changeset edhr:0048-document-categories

CREATE TABLE IF NOT EXISTS document_category (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    name VARCHAR(128) NOT NULL,
    system_category BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER,
    created_by VARCHAR(128),
    created_at TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_document_category_tenant_name
    ON document_category(tenant_id, LOWER(name));

ALTER TABLE sop_document ADD COLUMN IF NOT EXISTS category_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_sop_document_category_id ON sop_document(category_id);

INSERT INTO document_category (id, tenant_id, name, system_category, sort_order, created_by, created_at, updated_by, updated_at)
SELECT nextval('hibernate_sequence'), 'default', 'SOP', TRUE, 10, '系统管理员', CURRENT_TIMESTAMP, '系统管理员', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM document_category
    WHERE tenant_id = 'default' AND LOWER(name) = 'sop'
);

INSERT INTO document_category (id, tenant_id, name, system_category, sort_order, created_by, created_at, updated_by, updated_at)
SELECT nextval('hibernate_sequence'), 'default', 'SIP', TRUE, 20, '系统管理员', CURRENT_TIMESTAMP, '系统管理员', CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM document_category
    WHERE tenant_id = 'default' AND LOWER(name) = 'sip'
);

UPDATE document_category
SET system_category = TRUE
WHERE tenant_id = 'default' AND LOWER(name) IN ('sop', 'sip');

UPDATE sop_document document
SET category_id = category.id
FROM document_category category
WHERE category.tenant_id = COALESCE(document.tenant_id, 'default')
  AND LOWER(category.name) = LOWER(COALESCE(document.document_type, ''))
  AND LOWER(COALESCE(document.document_type, '')) IN ('sop', 'sip');

UPDATE sop_document
SET category_id = NULL
WHERE LOWER(COALESCE(document_type, '')) = 'other';
