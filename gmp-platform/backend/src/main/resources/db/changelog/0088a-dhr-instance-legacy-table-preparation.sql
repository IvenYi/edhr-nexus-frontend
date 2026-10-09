--liquibase formatted sql
--changeset codex:0088a-dhr-instance-legacy-table-preparation dbms:postgresql splitStatements:false
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:1 SELECT CASE WHEN (SELECT count(*) FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'dhr_instance' AND column_name IN ('code', 'batch_id', 'workflow_instance_id')) = 3 AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'dhr_instance' AND column_name IN ('dhr_no', 'production_object_id')) THEN 1 ELSE 0 END

-- The legacy registry has no production-object or frozen-context mapping.
-- Never invent that mapping or silently hide existing business records.
DO $$
BEGIN
    LOCK TABLE dhr_instance IN ACCESS EXCLUSIVE MODE;
    IF EXISTS (SELECT 1 FROM dhr_instance) THEN
        RAISE EXCEPTION 'Legacy dhr_instance contains records; an explicit data migration is required before 0089';
    END IF;

    ALTER TABLE dhr_instance RENAME TO dhr_instance_legacy;
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'dhr_instance_legacy'::regclass AND conname = 'dhr_instance_pkey'
    ) THEN
        ALTER TABLE dhr_instance_legacy RENAME CONSTRAINT dhr_instance_pkey TO dhr_instance_legacy_pkey;
    END IF;
END $$;
