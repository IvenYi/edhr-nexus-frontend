--liquibase formatted sql
--changeset edhr:0014-process-modeling-permissions

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), v.code, v.name, v.type, v.parent_code, v.sort_order
FROM (
    VALUES
        ('master-data.materials', '物料管理', 'PAGE', 'master-data', 1),
        ('master-data.material-types', '物料类型', 'PAGE', 'master-data', 2),
        ('master-data.operations', '工序管理', 'PAGE', 'master-data', 3),
        ('master-data.routes', '工艺路线', 'PAGE', 'master-data', 4),
        ('master-data.products', '产品管理', 'PAGE', 'master-data', 5),
        ('master-data.product-families', '产品簇', 'PAGE', 'master-data', 6),
        ('master-data.documents', '文档管理', 'PAGE', 'master-data', 7)
) AS v(code, name, type, parent_code, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM permission p
    WHERE p.code = v.code
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence') AS id, 1 AS role_id, p.id AS permission_id
FROM permission p
WHERE p.code IN (
    'master-data.materials',
    'master-data.material-types',
    'master-data.operations',
    'master-data.routes',
    'master-data.products',
    'master-data.product-families',
    'master-data.documents'
)
  AND NOT EXISTS (
      SELECT 1
      FROM role_permission rp
      WHERE rp.role_id = 1 AND rp.permission_id = p.id
  );
