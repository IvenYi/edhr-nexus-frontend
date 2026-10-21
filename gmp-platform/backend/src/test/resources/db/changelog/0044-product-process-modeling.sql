--liquibase formatted sql
--changeset edhr:0044-product-process-modeling

-- A product process belongs to a product version derived from material master data.
CREATE TABLE IF NOT EXISTS product_process (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    product_version_id BIGINT NOT NULL,
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_product_version
    ON product_process(tenant_id, product_version_id);

CREATE TABLE IF NOT EXISTS product_process_version (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    product_process_id BIGINT NOT NULL,
    version_label VARCHAR(64) NOT NULL,
    production_mode VARCHAR(64) NOT NULL,
    production_form VARCHAR(64) NOT NULL,
    route_version_id BIGINT NOT NULL,
    dhr_template_version_id BIGINT NOT NULL,
    release_form_template_id BIGINT,
    description TEXT,
    effective_from TIMESTAMP,
    effective_to TIMESTAMP,
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP,
    CONSTRAINT ck_product_process_effective_range CHECK (
        effective_to IS NULL OR effective_from IS NULL OR effective_to >= effective_from
    )
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_version_label
    ON product_process_version(product_process_id, lower(version_label));
CREATE INDEX IF NOT EXISTS idx_product_process_version_applicability
    ON product_process_version(product_process_id, production_mode, production_form, effective_from, effective_to);

CREATE TABLE IF NOT EXISTS product_process_operation_binding (
    id BIGINT PRIMARY KEY,
    product_process_version_id BIGINT NOT NULL,
    route_node_key VARCHAR(128) NOT NULL,
    operation_id BIGINT,
    operation_code VARCHAR(64),
    operation_name VARCHAR(128) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_operation_binding_node
    ON product_process_operation_binding(product_process_version_id, route_node_key);

CREATE TABLE IF NOT EXISTS product_process_operation_form_binding (
    id BIGINT PRIMARY KEY,
    product_process_operation_binding_id BIGINT NOT NULL,
    form_template_version_id BIGINT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_operation_form_binding
    ON product_process_operation_form_binding(product_process_operation_binding_id, form_template_version_id);

CREATE TABLE IF NOT EXISTS product_process_operation_sop_binding (
    id BIGINT PRIMARY KEY,
    product_process_operation_binding_id BIGINT NOT NULL,
    sop_document_id BIGINT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_operation_sop_binding
    ON product_process_operation_sop_binding(product_process_operation_binding_id, sop_document_id);
