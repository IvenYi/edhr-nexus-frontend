ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS force_password_change_on_first_login BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS password_change_cycle_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS password_change_cycle_days INTEGER NOT NULL DEFAULT 90;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS password_complexity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS password_failure_lock_threshold INTEGER NOT NULL DEFAULT 5;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS password_failure_lock_minutes INTEGER NOT NULL DEFAULT 30;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS idle_logout_minutes INTEGER NOT NULL DEFAULT 30;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS token_validity_minutes INTEGER NOT NULL DEFAULT 480;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS force_signature_on_first_login BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS signature_change_cycle_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE system_setting ADD COLUMN IF NOT EXISTS signature_change_cycle_days INTEGER NOT NULL DEFAULT 365;

ALTER TABLE user_account ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_account ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

UPDATE user_account
SET password_changed_at = COALESCE(password_changed_at, created_at, CURRENT_TIMESTAMP);
