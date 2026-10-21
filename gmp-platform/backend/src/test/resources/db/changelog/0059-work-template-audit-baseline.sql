-- Existing work templates may predate the production-work audit implementation.
-- Preserve that distinction with a system baseline event instead of fabricating a user CREATE event.
UPDATE workflow_binding_rule
SET is_active = TRUE
WHERE business_type = 'WORK'
  AND COALESCE(is_active, FALSE) = FALSE;

INSERT INTO audit_event (
    id,
    tenant_id,
    entity_type,
    entity_id,
    action,
    content_before,
    content_after,
    operator_id,
    operator_name,
    operator_account,
    source,
    module_name,
    menu_name,
    function_name,
    data_summary,
    reason,
    created_at
)
SELECT
    ((extract(epoch FROM clock_timestamp()) * 1000)::bigint * 1000) + row_number() OVER (ORDER BY definition.id),
    COALESCE(definition.tenant_id, 'default'),
    'PRODUCTION_WORK_TEMPLATE',
    definition.id::text,
    'BASELINE',
    '{}'::jsonb,
    jsonb_build_object(
        'name', definition.name,
        'code', definition.code,
        'description', definition.description,
        'type', definition.type,
        'historicalBaseline', true
    ),
    'SYSTEM',
    '系统',
    'system',
    'SYSTEM',
    '生产管理',
    '生产配置 · 作业模板',
    '历史基线导入',
    COALESCE(definition.name, '作业模板') || ' 历史审计基线',
    '该记录创建于作业模板审计接入前，已由系统补齐当前历史基线，非原始新增事件。',
    COALESCE(definition.created_at, CURRENT_TIMESTAMP)
FROM workflow_definition definition
WHERE definition.type = 'WORK'
  AND NOT EXISTS (
      SELECT 1
      FROM audit_event event
      WHERE event.entity_type = 'PRODUCTION_WORK_TEMPLATE'
        AND event.entity_id = definition.id::text
  );
