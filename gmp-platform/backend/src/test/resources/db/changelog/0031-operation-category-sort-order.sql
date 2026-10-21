ALTER TABLE operation_category
    ADD COLUMN IF NOT EXISTS sort_order INTEGER;

WITH ranked_categories AS (
    SELECT id, ROW_NUMBER() OVER (
        PARTITION BY tenant_id
        ORDER BY COALESCE(sort_order, 2147483647), name, id
    ) AS row_number
    FROM operation_category
)
UPDATE operation_category
SET sort_order = ranked_categories.row_number * 10
FROM ranked_categories
WHERE operation_category.id = ranked_categories.id
  AND operation_category.sort_order IS NULL;
