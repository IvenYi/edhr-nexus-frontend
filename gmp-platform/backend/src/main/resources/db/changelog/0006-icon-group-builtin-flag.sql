--liquibase formatted sql
--changeset edhr:0006-icon-group-builtin-flag

ALTER TABLE icon_group ADD COLUMN IF NOT EXISTS builtin BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE icon_group
SET builtin = FALSE,
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 'default';

WITH builtin_group AS (
    SELECT id
    FROM icon_group
    WHERE tenant_id = 'default'
      AND name = '系统内置图标'
    ORDER BY created_at ASC, id ASC
    LIMIT 1
)
UPDATE icon_group
SET builtin = TRUE,
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP
WHERE id = (SELECT id FROM builtin_group);

CREATE UNIQUE INDEX IF NOT EXISTS uk_icon_group_builtin_tenant
ON icon_group(tenant_id)
WHERE builtin = TRUE;
