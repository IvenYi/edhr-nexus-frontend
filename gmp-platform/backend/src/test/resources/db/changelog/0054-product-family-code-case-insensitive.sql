--liquibase formatted sql
--changeset edhr:0054-product-family-code-case-insensitive

-- Product-family codes are entered by users and are unique per tenant regardless of case.
DROP INDEX IF EXISTS uk_pf_code;
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_family_tenant_code_ci
    ON product_family(tenant_id, LOWER(code));
