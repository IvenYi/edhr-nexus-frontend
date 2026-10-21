--liquibase formatted sql
--changeset edhr:0063-production-work-order-permission

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'production', '生产', 'PAGE', NULL, 5
WHERE NOT EXISTS (
    SELECT 1 FROM permission WHERE code = 'production'
);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'production.work-orders', '工单管理', 'PAGE', 'production', 1
WHERE NOT EXISTS (
    SELECT 1 FROM permission WHERE code = 'production.work-orders'
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r
JOIN permission p ON p.code = 'production.work-orders'
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permission rp
      WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
