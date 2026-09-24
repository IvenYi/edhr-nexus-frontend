--liquibase formatted sql

--changeset edhr:0096-form-fill-settings
ALTER TABLE product_process_operation_form_binding ADD COLUMN fill_settings_json TEXT;

--rollback ALTER TABLE product_process_operation_form_binding DROP COLUMN fill_settings_json;
