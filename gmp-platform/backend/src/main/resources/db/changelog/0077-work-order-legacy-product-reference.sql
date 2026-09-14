--liquibase formatted sql
--changeset edhr:0077-work-order-legacy-product-reference splitStatements:false

-- Current work orders reference material products, validated by WorkOrderController.
-- Match the fresh-install schema without rewriting historical product identifiers.
DO $$
DECLARE
    legacy_constraint RECORD;
BEGIN
    FOR legacy_constraint IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.work_order'::regclass
          AND contype = 'f'
          AND confrelid = to_regclass('public.product')
          AND conkey = ARRAY[
              (SELECT attnum FROM pg_attribute
               WHERE attrelid = 'public.work_order'::regclass AND attname = 'product_id')
          ]::smallint[]
    LOOP
        EXECUTE format('ALTER TABLE public.work_order DROP CONSTRAINT %I', legacy_constraint.conname);
    END LOOP;
END $$;
