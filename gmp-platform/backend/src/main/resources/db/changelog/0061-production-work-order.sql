--liquibase formatted sql
--changeset edhr:0061-production-work-order
--validCheckSum: 9:d0a5ad45f8ed2bbfe1078e15fcbc914c

CREATE TABLE IF NOT EXISTS work_order (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    order_no VARCHAR(64) NOT NULL,
    product_id BIGINT NOT NULL,
    process_version_id BIGINT,
    production_mode VARCHAR(32) DEFAULT '量产',
    production_form VARCHAR(32),
    planned_quantity DECIMAL(15, 4) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
    remark TEXT,
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_work_order_no ON work_order(tenant_id, order_no);
CREATE INDEX IF NOT EXISTS idx_work_order_product ON work_order(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_work_order_status ON work_order(tenant_id, status);
