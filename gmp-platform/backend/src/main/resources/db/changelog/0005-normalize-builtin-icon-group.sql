--liquibase formatted sql
--changeset edhr:0005-normalize-builtin-icon-group

WITH builtin_group AS (
    SELECT id
    FROM icon_group
    WHERE tenant_id = 'default' AND name = '系统内置图标'
    ORDER BY created_at ASC
    LIMIT 1
)
UPDATE icon_asset
SET group_id = (SELECT id FROM builtin_group),
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 'default'
  AND source = 'BUILTIN'
  AND EXISTS (SELECT 1 FROM builtin_group);

UPDATE icon_group
SET sort_order = sort_order + 1,
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 'default'
  AND name <> '系统内置图标'
  AND sort_order <= 1;

UPDATE icon_group
SET sort_order = 0,
    updated_by = 'system',
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 'default'
  AND name = '系统内置图标';
