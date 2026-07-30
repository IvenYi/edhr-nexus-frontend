WITH missing_versions AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS sequence_number
    FROM dhr_template
    WHERE NOT EXISTS (
        SELECT 1
        FROM dhr_template_version
        WHERE dhr_template_version.dhr_template_id = dhr_template.id
    )
), id_base AS (
    SELECT COALESCE(MAX(id), 0) AS max_id
    FROM dhr_template_version
)
INSERT INTO dhr_template_version (id, dhr_template_id, version_number, status, is_current, created_at)
SELECT id_base.max_id + missing_versions.sequence_number,
       missing_versions.id,
       1,
       'DRAFT',
       FALSE,
       CURRENT_TIMESTAMP
FROM missing_versions
CROSS JOIN id_base;
