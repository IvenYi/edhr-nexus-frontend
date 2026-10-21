--liquibase formatted sql
--changeset edhr:0069-form-process-permission

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'workflow.form-processes', '表单流程', 'PAGE', 'workflow', 2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'workflow.form-processes');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'workflow.form-processes.edit', '编辑表单流程', 'BUTTON', 'workflow.form-processes', 1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'workflow.form-processes.edit');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'workflow.form-processes.publish', '发布表单流程', 'BUTTON', 'workflow.form-processes', 2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'workflow.form-processes.publish');

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r CROSS JOIN permission p
WHERE r.code = 'ADMIN' AND p.code IN ('workflow.form-processes', 'workflow.form-processes.edit', 'workflow.form-processes.publish')
  AND NOT EXISTS (SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);
