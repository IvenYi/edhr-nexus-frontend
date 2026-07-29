CREATE UNIQUE INDEX IF NOT EXISTS uk_dhr_template_version_current
ON dhr_template_version(dhr_template_id)
WHERE is_current = TRUE;
