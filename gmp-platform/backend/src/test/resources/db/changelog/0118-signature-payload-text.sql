--liquibase formatted sql
--changeset codex:0118-signature-payload-text splitStatements:false
-- Signed digests cover the original UTF-8 string, not a JSONB-normalized representation.
-- Keep the current readable text and existing hashes; lost historical bytes are not recreated.
-- Forward only: converting new signed text back to JSONB would destroy its original bytes.
DO $$
BEGIN
    ALTER TABLE signature ALTER COLUMN snapshot_data TYPE TEXT USING snapshot_data::TEXT;
    -- Preserve JSONB's input validation without storing its normalized output.
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conrelid = 'signature'::regclass AND conname = 'ck_signature_snapshot_data_json') THEN
        ALTER TABLE signature ADD CONSTRAINT ck_signature_snapshot_data_json
            CHECK (snapshot_data IS NULL OR snapshot_data::JSONB IS NOT NULL);
    END IF;
END $$;
