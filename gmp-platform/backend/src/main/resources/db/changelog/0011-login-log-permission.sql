--liquibase formatted sql
--changeset edhr:0011-login-log-permission

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'system.login-logs', '登录日志', 'PAGE', 'system', 5
WHERE NOT EXISTS (
    SELECT 1 FROM permission WHERE code = 'system.login-logs'
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence') AS id, 1 AS role_id, p.id AS permission_id
FROM permission p
WHERE p.code = 'system.login-logs'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permission rp
      WHERE rp.role_id = 1 AND rp.permission_id = p.id
  );
