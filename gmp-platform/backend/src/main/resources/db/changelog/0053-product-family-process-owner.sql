--liquibase formatted sql
--changeset edhr:0053-product-family-process-owner

CREATE TABLE IF NOT EXISTS product_family_member (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    product_family_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP,
    CONSTRAINT fk_product_family_member_family
        FOREIGN KEY (product_family_id) REFERENCES product_family(id),
    CONSTRAINT fk_product_family_member_product
        FOREIGN KEY (product_id) REFERENCES material(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_family_member_tenant_family_product
    ON product_family_member(tenant_id, product_family_id, product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_family_member_tenant_product
    ON product_family_member(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_family_member_tenant_family
    ON product_family_member(tenant_id, product_family_id, created_at);

ALTER TABLE product_process ADD COLUMN IF NOT EXISTS owner_type VARCHAR(32);
ALTER TABLE product_process ADD COLUMN IF NOT EXISTS owner_id BIGINT;

-- Existing process roots continue to represent the material-derived product.
UPDATE product_process
SET owner_type = 'PRODUCT',
    owner_id = product_version_id
WHERE owner_type IS NULL AND owner_id IS NULL;

ALTER TABLE product_process ALTER COLUMN owner_type SET NOT NULL;
ALTER TABLE product_process ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE product_process ALTER COLUMN product_version_id DROP NOT NULL;

--changeset edhr:0053-product-process-owner-type-check splitStatements:false
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_product_process_owner_type'
          AND conrelid = 'product_process'::regclass
    ) THEN
        ALTER TABLE product_process
            ADD CONSTRAINT ck_product_process_owner_type
            CHECK (owner_type IN ('PRODUCT', 'PRODUCT_FAMILY'));
    END IF;
END;
$$;

--changeset edhr:0053-product-process-owner-index
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_owner
    ON product_process(tenant_id, owner_type, owner_id);
