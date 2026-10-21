--liquibase formatted sql

--changeset edhr:0074-equipment-system-fields
ALTER TABLE equipment_type ADD COLUMN created_by VARCHAR(128);
ALTER TABLE equipment_type ADD COLUMN updated_by VARCHAR(128);
ALTER TABLE equipment ADD COLUMN created_by VARCHAR(128);
ALTER TABLE equipment ADD COLUMN updated_by VARCHAR(128);

UPDATE equipment_type SET created_by = (
    SELECT COALESCE(NULLIF(TRIM(a.operator_name), ''), NULLIF(TRIM(a.operator_account), ''))
    FROM audit_event a
    WHERE a.entity_type = 'EQUIPMENT_TYPE' AND a.entity_id = CAST(equipment_type.id AS VARCHAR)
      AND a.tenant_id = equipment_type.tenant_id AND a.action = 'CREATE'
    ORDER BY a.created_at ASC NULLS LAST, a.id ASC LIMIT 1
);
UPDATE equipment_type SET updated_by = (
    SELECT COALESCE(NULLIF(TRIM(a.operator_name), ''), NULLIF(TRIM(a.operator_account), ''))
    FROM audit_event a
    WHERE a.entity_type = 'EQUIPMENT_TYPE' AND a.entity_id = CAST(equipment_type.id AS VARCHAR)
      AND a.tenant_id = equipment_type.tenant_id AND a.action IN ('CREATE', 'UPDATE')
    ORDER BY a.created_at DESC NULLS LAST, a.id DESC LIMIT 1
);
UPDATE equipment SET created_by = (
    SELECT COALESCE(NULLIF(TRIM(a.operator_name), ''), NULLIF(TRIM(a.operator_account), ''))
    FROM audit_event a
    WHERE a.entity_type = 'EQUIPMENT' AND a.entity_id = CAST(equipment.id AS VARCHAR)
      AND a.tenant_id = 'default' AND a.action = 'CREATE'
    ORDER BY a.created_at ASC NULLS LAST, a.id ASC LIMIT 1
);
UPDATE equipment SET updated_by = (
    SELECT COALESCE(NULLIF(TRIM(a.operator_name), ''), NULLIF(TRIM(a.operator_account), ''))
    FROM audit_event a
    WHERE a.entity_type = 'EQUIPMENT' AND a.entity_id = CAST(equipment.id AS VARCHAR)
      AND a.tenant_id = 'default' AND a.action IN ('CREATE', 'UPDATE')
    ORDER BY a.created_at DESC NULLS LAST, a.id DESC LIMIT 1
);

--rollback ALTER TABLE equipment DROP COLUMN updated_by;
--rollback ALTER TABLE equipment DROP COLUMN created_by;
--rollback ALTER TABLE equipment_type DROP COLUMN updated_by;
--rollback ALTER TABLE equipment_type DROP COLUMN created_by;
