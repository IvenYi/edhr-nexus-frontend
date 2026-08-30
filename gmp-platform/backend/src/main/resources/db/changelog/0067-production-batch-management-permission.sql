--liquibase formatted sql
--changeset edhr:0067-production-batch-management-permission

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'production.batches', '批次管理', 'PAGE', 'production', 2
WHERE NOT EXISTS (
    SELECT 1 FROM permission WHERE code = 'production.batches'
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r
JOIN permission p ON p.code = 'production.batches'
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
