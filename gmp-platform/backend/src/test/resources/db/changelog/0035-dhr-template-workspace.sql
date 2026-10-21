ALTER TABLE dhr_template_version ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'DRAFT';
UPDATE dhr_template_version
SET status = CASE WHEN is_current THEN 'ACTIVE' ELSE 'DRAFT' END
WHERE status IS NULL;
ALTER TABLE dhr_template_version ALTER COLUMN status SET NOT NULL;

ALTER TABLE dhr_template_item ADD COLUMN IF NOT EXISTS form_template_version_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_dhr_template_version_template
ON dhr_template_version(dhr_template_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_dhr_directory_version
ON dhr_directory(version_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_dhr_template_item_directory
ON dhr_template_item(directory_id, sort_order);
