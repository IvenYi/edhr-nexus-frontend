--liquibase formatted sql
--changeset edhr:0051-document-version-code

-- Document codes identify the controlled version, not the document master.
ALTER TABLE document_version ADD COLUMN IF NOT EXISTS code VARCHAR(64);

UPDATE document_version version
SET code = NULLIF(document.code, '')
FROM sop_document document
WHERE document.id = version.document_id
  AND (version.code IS NULL OR btrim(version.code) = '');

-- A legacy document may already have multiple versions sharing one parent code.
-- Preserve that code on the first version and make later historical versions distinct.
WITH ranked_codes AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY tenant_id, lower(code)
               ORDER BY created_at NULLS LAST, id
           ) AS duplicate_index
    FROM document_version
    WHERE code IS NOT NULL AND btrim(code) <> ''
)
UPDATE document_version version
SET code = version.code || '-' || version.id
FROM ranked_codes
WHERE version.id = ranked_codes.id
  AND ranked_codes.duplicate_index > 1;

UPDATE document_version
SET code = 'DOC-' || id
WHERE code IS NULL OR btrim(code) = '';

ALTER TABLE document_version ALTER COLUMN code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_document_version_code
    ON document_version(tenant_id, lower(code));

DROP INDEX IF EXISTS uk_sop_code;
ALTER TABLE sop_document ALTER COLUMN code DROP NOT NULL;
UPDATE sop_document SET code = NULL;
