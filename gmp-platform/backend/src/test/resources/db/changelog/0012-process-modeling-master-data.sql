-- Process modeling master data additions

ALTER TABLE product_family ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE product_family ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE product_family ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE product_family ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);
UPDATE product_family SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE product ADD COLUMN IF NOT EXISTS specification VARCHAR(128);
ALTER TABLE product ADD COLUMN IF NOT EXISTS unit VARCHAR(32);
ALTER TABLE product ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE product ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE product ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE product ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);
UPDATE product SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE operation ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE operation ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE operation ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE operation ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);
UPDATE operation SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE route ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE route ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE route ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE route ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);
UPDATE route SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE sop_document ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE sop_document ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE sop_document ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE sop_document ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);
UPDATE sop_document SET updated_at = created_at WHERE updated_at IS NULL;

CREATE TABLE IF NOT EXISTS material_type (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_material_type_code ON material_type(tenant_id, code);

CREATE TABLE IF NOT EXISTS material (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    specification VARCHAR(128),
    material_type_id BIGINT,
    unit VARCHAR(32),
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_material_code ON material(tenant_id, code);
