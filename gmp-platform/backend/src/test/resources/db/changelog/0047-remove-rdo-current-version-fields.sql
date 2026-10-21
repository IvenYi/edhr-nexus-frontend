DROP INDEX IF EXISTS uk_dhr_template_version_current;

ALTER TABLE form_template
    DROP COLUMN IF EXISTS current_version_id;

ALTER TABLE form_template_version
    DROP COLUMN IF EXISTS is_current;

ALTER TABLE dhr_template_version
    DROP COLUMN IF EXISTS is_current;
