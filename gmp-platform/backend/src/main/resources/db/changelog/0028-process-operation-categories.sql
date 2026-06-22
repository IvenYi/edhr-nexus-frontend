CREATE TABLE IF NOT EXISTS operation_category (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    name VARCHAR(128) NOT NULL,
    created_by VARCHAR(128),
    created_at TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_operation_category_tenant_name
    ON operation_category(tenant_id, LOWER(name));

CREATE INDEX IF NOT EXISTS idx_operation_tenant_code
    ON operation(tenant_id, LOWER(code));

INSERT INTO operation_category (id, tenant_id, name, created_by, created_at, updated_by, updated_at)
SELECT nextval('hibernate_sequence'),
       COALESCE(operation.tenant_id, 'default'),
       TRIM(operation.operation_category),
       '系统管理员',
       CURRENT_TIMESTAMP,
       '系统管理员',
       CURRENT_TIMESTAMP
FROM operation
WHERE operation.operation_category IS NOT NULL
  AND TRIM(operation.operation_category) <> ''
  AND NOT EXISTS (
      SELECT 1
      FROM operation_category
      WHERE operation_category.tenant_id = COALESCE(operation.tenant_id, 'default')
        AND LOWER(operation_category.name) = LOWER(TRIM(operation.operation_category))
  )
GROUP BY COALESCE(operation.tenant_id, 'default'), TRIM(operation.operation_category);
