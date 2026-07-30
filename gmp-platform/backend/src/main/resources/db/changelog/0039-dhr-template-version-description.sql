ALTER TABLE dhr_template_version ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE dhr_template_version ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP;
ALTER TABLE dhr_template_version ADD COLUMN IF NOT EXISTS effective_to TIMESTAMP;
