--liquibase formatted sql
--changeset edhr:0045-document-management-versions

-- sop_document remains the document master table so existing SOP references and data have a stable migration path.
ALTER TABLE sop_document ADD COLUMN IF NOT EXISTS document_type VARCHAR(32) NOT NULL DEFAULT 'SOP';

CREATE TABLE IF NOT EXISTS document_version (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    document_id BIGINT NOT NULL,
    version VARCHAR(64) NOT NULL,
    file_id BIGINT,
    file_reference VARCHAR(1024),
    description TEXT,
    remark TEXT,
    effective_date TIMESTAMP,
    expiry_date TIMESTAMP,
    version_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP,
    CONSTRAINT ck_document_version_effective_range CHECK (
        expiry_date IS NULL OR effective_date IS NULL OR expiry_date >= effective_date
    )
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_document_version_label
    ON document_version(document_id, lower(version));
CREATE INDEX IF NOT EXISTS idx_document_version_document ON document_version(document_id, created_at DESC);

-- Preserve every existing lightweight SOP entry as its first controlled document version.
INSERT INTO document_version (
    id, tenant_id, document_id, version, file_reference, description, remark,
    version_status, created_by, created_at, updated_by, updated_at
)
SELECT d.id, d.tenant_id, d.id, COALESCE(NULLIF(d.version, ''), 'V1.0'), d.file_reference,
       d.description, d.remark, COALESCE(NULLIF(d.status, ''), 'DRAFT'),
       d.created_by, COALESCE(d.created_at, CURRENT_TIMESTAMP), d.updated_by, d.updated_at
FROM sop_document d
WHERE NOT EXISTS (SELECT 1 FROM document_version v WHERE v.id = d.id);

CREATE TABLE IF NOT EXISTS product_process_operation_document_binding (
    id BIGINT PRIMARY KEY,
    product_process_operation_binding_id BIGINT NOT NULL,
    document_version_id BIGINT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_operation_document_binding
    ON product_process_operation_document_binding(product_process_operation_binding_id, document_version_id);
CREATE INDEX IF NOT EXISTS idx_product_process_operation_document_binding
    ON product_process_operation_document_binding(product_process_operation_binding_id);

-- Legacy SOP bindings point to the migrated initial version having the same identifier.
INSERT INTO product_process_operation_document_binding (
    id, product_process_operation_binding_id, document_version_id, sort_order, created_at
)
SELECT b.id, b.product_process_operation_binding_id, b.sop_document_id, b.sort_order, b.created_at
FROM product_process_operation_sop_binding b
WHERE NOT EXISTS (SELECT 1 FROM product_process_operation_document_binding d WHERE d.id = b.id);
