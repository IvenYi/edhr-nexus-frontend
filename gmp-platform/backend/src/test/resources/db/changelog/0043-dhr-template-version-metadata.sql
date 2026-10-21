ALTER TABLE dhr_template_version
    ADD COLUMN IF NOT EXISTS version_label VARCHAR(64),
    ADD COLUMN IF NOT EXISTS code VARCHAR(64),
    ADD COLUMN IF NOT EXISTS offline_version VARCHAR(20);

UPDATE dhr_template_version
SET version_label = 'V' || COALESCE(version_number, 1) || '.0'
WHERE version_label IS NULL OR btrim(version_label) = '';

WITH preferred_versions AS (
    SELECT DISTINCT ON (version.dhr_template_id)
           version.id,
           template.code
    FROM dhr_template_version version
    JOIN dhr_template template ON template.id = version.dhr_template_id
    WHERE template.code IS NOT NULL AND btrim(template.code) <> ''
    ORDER BY version.dhr_template_id, version.is_current DESC NULLS LAST, version.version_number DESC, version.id DESC
)
UPDATE dhr_template_version version
SET code = preferred_versions.code
FROM preferred_versions
WHERE version.id = preferred_versions.id
  AND (version.code IS NULL OR btrim(version.code) = '');

ALTER TABLE dhr_template_version
    ALTER COLUMN version_label SET NOT NULL;

DROP INDEX IF EXISTS uk_dhr_code;
ALTER TABLE dhr_template
    ALTER COLUMN code DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_dhr_template_version_label
ON dhr_template_version(dhr_template_id, lower(version_label));

CREATE UNIQUE INDEX IF NOT EXISTS uk_dhr_template_version_code
ON dhr_template_version(lower(code))
WHERE code IS NOT NULL AND btrim(code) <> '';
