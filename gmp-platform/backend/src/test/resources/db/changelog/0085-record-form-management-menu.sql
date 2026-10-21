--liquibase formatted sql
--changeset codex:0085-record-form-management-menu

-- Records is the top-level product module. The existing form-instance/worklist
-- permissions remain the runtime authorization contract; these PAGE permissions
-- provide the corresponding navigation tree for menu management and admin setup.
INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records', '记录', 'PAGE', NULL, 5
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records.form-management', '表单管理', 'PAGE', 'records', 1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records.form-management');

-- Grant the navigation parent to the built-in administrator. The existing
-- form-instances.view/form-management.* grants continue to authorize each API.
INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r
JOIN permission p ON p.code IN ('records', 'records.form-management')
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
