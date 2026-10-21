--liquibase formatted sql

--changeset edhr:0062-production-object-and-work-order-lifecycle
ALTER TABLE work_order ALTER COLUMN process_version_id DROP NOT NULL;
ALTER TABLE work_order ALTER COLUMN production_mode DROP NOT NULL;
ALTER TABLE work_order ALTER COLUMN production_form DROP NOT NULL;
ALTER TABLE work_order ALTER COLUMN status SET DEFAULT 'CREATED';
UPDATE work_order SET status = 'CREATED' WHERE status = 'PLANNED';

CREATE TABLE IF NOT EXISTS production_object (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    work_order_id BIGINT NOT NULL REFERENCES work_order(id),
    object_no VARCHAR(64) NOT NULL,
    object_type VARCHAR(16) NOT NULL,
    process_version_id BIGINT NOT NULL,
    target_quantity DECIMAL(15, 4) NOT NULL,
    good_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
    ng_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
    scrap_quantity DECIMAL(15, 4) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
    remark TEXT,
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP,
    CONSTRAINT ck_production_object_type CHECK (object_type IN ('BATCH', 'SN')),
    CONSTRAINT ck_production_object_target CHECK (target_quantity > 0),
    CONSTRAINT ck_production_object_results CHECK (
        good_quantity >= 0 AND ng_quantity >= 0 AND scrap_quantity >= 0
        AND good_quantity + ng_quantity + scrap_quantity <= target_quantity
    )
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_production_object_no ON production_object(tenant_id, object_no);
CREATE INDEX IF NOT EXISTS idx_production_object_order ON production_object(tenant_id, work_order_id);
CREATE INDEX IF NOT EXISTS idx_production_object_status ON production_object(tenant_id, status);
