CREATE UNIQUE INDEX IF NOT EXISTS uk_form_template_version_label
ON form_template_version(template_id, lower(version_label))
WHERE version_label IS NOT NULL AND btrim(version_label) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS uk_dhr_template_version_number
ON dhr_template_version(dhr_template_id, version_number);
