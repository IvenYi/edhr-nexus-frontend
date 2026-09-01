--liquibase formatted sql
--changeset edhr:0060a-work-order-legacy-table-preparation splitStatements:false
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT CASE WHEN to_regclass('public.work_order') IS NULL THEN 0 ELSE 1 END

ALTER TABLE work_order DROP CONSTRAINT IF EXISTS work_order_tenant_id_fkey;
ALTER TABLE work_order ALTER COLUMN tenant_id DROP DEFAULT;
ALTER TABLE work_order ALTER COLUMN tenant_id TYPE VARCHAR(64) USING COALESCE(tenant_id::VARCHAR, 'default');
UPDATE work_order SET tenant_id = 'default' WHERE tenant_id IS NULL;
ALTER TABLE work_order ALTER COLUMN tenant_id SET DEFAULT 'default';
ALTER TABLE work_order ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE work_order ADD COLUMN IF NOT EXISTS order_no VARCHAR(64);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'work_order' AND column_name = 'code'
    ) THEN
        EXECUTE 'UPDATE work_order SET order_no = code WHERE order_no IS NULL AND code IS NOT NULL';
    END IF;
END $$;
UPDATE work_order SET order_no = 'WO-' || id WHERE order_no IS NULL;
ALTER TABLE work_order ALTER COLUMN order_no SET NOT NULL;

ALTER TABLE work_order ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS process_version_id BIGINT;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS production_mode VARCHAR(32);
ALTER TABLE work_order ALTER COLUMN production_mode SET DEFAULT '量产';
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS production_form VARCHAR(32);

ALTER TABLE work_order ADD COLUMN IF NOT EXISTS planned_quantity DECIMAL(15, 4);
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'work_order' AND column_name = 'quantity'
    ) THEN
        EXECUTE 'UPDATE work_order SET planned_quantity = quantity WHERE planned_quantity IS NULL AND quantity IS NOT NULL';
    END IF;
END $$;
UPDATE work_order SET planned_quantity = 0 WHERE planned_quantity IS NULL;
ALTER TABLE work_order ALTER COLUMN planned_quantity SET NOT NULL;

ALTER TABLE work_order ADD COLUMN IF NOT EXISTS status VARCHAR(32);
UPDATE work_order SET status = 'CREATED' WHERE status IS NULL;
ALTER TABLE work_order ALTER COLUMN status SET DEFAULT 'CREATED';
ALTER TABLE work_order ALTER COLUMN status SET NOT NULL;

ALTER TABLE work_order ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE work_order ALTER COLUMN created_by TYPE VARCHAR(128);
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
UPDATE work_order SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
ALTER TABLE work_order ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE work_order ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);
ALTER TABLE work_order ALTER COLUMN updated_by TYPE VARCHAR(128);
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE work_order ADD COLUMN IF NOT EXISTS planned_start_at TIMESTAMP;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'work_order' AND column_name = 'planned_start_date'
    ) THEN
        EXECUTE 'UPDATE work_order SET planned_start_at = planned_start_date WHERE planned_start_at IS NULL AND planned_start_date IS NOT NULL';
    END IF;
END $$;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS planned_end_at TIMESTAMP;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'work_order' AND column_name = 'planned_end_date'
    ) THEN
        EXECUTE 'UPDATE work_order SET planned_end_at = planned_end_date WHERE planned_end_at IS NULL AND planned_end_date IS NOT NULL';
    END IF;
END $$;
