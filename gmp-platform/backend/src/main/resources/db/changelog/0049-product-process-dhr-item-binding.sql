--liquibase formatted sql
--changeset edhr:0049-product-process-dhr-item-binding
ALTER TABLE product_process_operation_form_binding ADD COLUMN IF NOT EXISTS dhr_template_item_id BIGINT;
UPDATE product_process_operation_form_binding b
SET dhr_template_item_id = (
    SELECT i.id
    FROM product_process_operation_binding ob
    JOIN product_process_version pv ON pv.id = ob.product_process_version_id
    JOIN dhr_directory d ON d.version_id = pv.dhr_template_version_id
    JOIN dhr_template_item i ON i.directory_id = d.id
    WHERE ob.id = b.product_process_operation_binding_id
      AND i.form_template_version_id = b.form_template_version_id
    ORDER BY i.id
    LIMIT 1
)
WHERE b.dhr_template_item_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_product_process_form_binding_dhr_item ON product_process_operation_form_binding(dhr_template_item_id);
DROP INDEX IF EXISTS uk_product_process_operation_form_binding;
CREATE UNIQUE INDEX IF NOT EXISTS uk_product_process_operation_form_binding
    ON product_process_operation_form_binding(product_process_operation_binding_id, dhr_template_item_id);
