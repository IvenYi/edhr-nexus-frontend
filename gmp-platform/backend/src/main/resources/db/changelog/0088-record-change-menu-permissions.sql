--liquibase formatted sql
--changeset codex:0088-record-change-menu-permissions

-- These PAGE permissions are the navigation contract for the four record-change
-- worklists. Runtime commands retain their existing record-control permissions.
INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records.change', '记录变更', 'PAGE', 'records', 2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records.change');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records.mine', '我的变更', 'PAGE', 'records', 3
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records.mine');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records.approvals', '变更审批', 'PAGE', 'records', 4
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records.approvals');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records.history', '变更记录', 'PAGE', 'records', 5
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records.history');

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r
JOIN permission p ON p.code IN ('records.change', 'records.mine', 'records.approvals', 'records.history')
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
