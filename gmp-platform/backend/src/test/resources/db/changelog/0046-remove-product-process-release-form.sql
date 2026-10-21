--liquibase formatted sql
--changeset edhr:0046-remove-product-process-release-form

-- Product modeling currently covers process configuration only. Release forms are not a supported feature.
ALTER TABLE product_process_version
    DROP COLUMN IF EXISTS release_form_template_id;
