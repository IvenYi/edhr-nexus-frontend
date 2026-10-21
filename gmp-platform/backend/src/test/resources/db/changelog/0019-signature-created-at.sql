ALTER TABLE signature
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

UPDATE signature
SET created_at = signed_at
WHERE created_at IS NULL;

ALTER TABLE signature
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
