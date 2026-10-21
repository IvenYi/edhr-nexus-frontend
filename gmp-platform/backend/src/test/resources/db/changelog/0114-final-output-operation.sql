--liquibase formatted sql
--changeset edhr:0114-final-output-operation
ALTER TABLE product_process_operation_binding ADD COLUMN final_output BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX uk_process_version_final_output
    ON product_process_operation_binding(product_process_version_id) WHERE final_output;
-- No inferred final node and no historical execution or quantity backfill.
