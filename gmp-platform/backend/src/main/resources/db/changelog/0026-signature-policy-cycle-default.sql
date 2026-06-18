ALTER TABLE system_setting ALTER COLUMN signature_change_cycle_enabled SET DEFAULT TRUE;
ALTER TABLE system_setting ALTER COLUMN signature_change_cycle_days SET DEFAULT 30;

UPDATE system_setting
SET signature_change_cycle_enabled = TRUE,
    signature_change_cycle_days = CASE
        WHEN signature_change_cycle_days IS NULL THEN 30
        WHEN signature_change_cycle_days < 1 THEN 30
        WHEN signature_change_cycle_days > 30 THEN 30
        ELSE signature_change_cycle_days
    END;
