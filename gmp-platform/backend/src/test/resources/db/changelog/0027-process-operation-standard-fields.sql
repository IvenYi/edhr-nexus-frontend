ALTER TABLE operation ADD COLUMN IF NOT EXISTS operation_category VARCHAR(128);
ALTER TABLE operation ADD COLUMN IF NOT EXISTS general_description TEXT;
ALTER TABLE operation ADD COLUMN IF NOT EXISTS default_operation_type VARCHAR(64) NOT NULL DEFAULT '普通工序';

UPDATE operation
SET default_operation_type = '普通工序'
WHERE default_operation_type IS NULL OR TRIM(default_operation_type) = '';
