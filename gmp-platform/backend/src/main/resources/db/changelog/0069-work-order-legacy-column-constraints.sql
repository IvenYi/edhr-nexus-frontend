--liquibase formatted sql
--changeset edhr:0069-work-order-legacy-column-constraints splitStatements:false

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'work_order' AND column_name = 'code'
    ) THEN
        EXECUTE 'ALTER TABLE work_order ALTER COLUMN code DROP NOT NULL';
    END IF;
END $$;
