--liquibase formatted sql

--changeset codex:0076-record-control-workflow-instance-contract
ALTER TABLE workflow_instance
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128),
    ADD COLUMN IF NOT EXISTS audit_correlation_id VARCHAR(128),
    ADD COLUMN IF NOT EXISTS workflow_snapshot_hash VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS uk_wf_instance_idempotency_key
    ON workflow_instance(idempotency_key)
    WHERE idempotency_key IS NOT NULL;

--changeset codex:0076-record-control-permission-contract
INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'record-control', '表单记录控制', 'PAGE', NULL, 6
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'record-control');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'record-control.corrections', '表单变更', 'PAGE', 'record-control', 1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'record-control.corrections');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'record-control.corrections.create', '发起表单变更', 'BUTTON', 'record-control.corrections', 1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'record-control.corrections.create');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'record-control.voids', '表单作废', 'PAGE', 'record-control', 2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'record-control.voids');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'record-control.voids.create', '发起表单作废', 'BUTTON', 'record-control.voids', 1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'record-control.voids.create');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'record-control.requests.all', '查看全部记录控制申请', 'BUTTON', 'record-control', 3
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'record-control.requests.all');

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), role.id, permission.id
FROM role
JOIN permission ON permission.code IN (
    'record-control',
    'record-control.corrections',
    'record-control.corrections.create',
    'record-control.voids',
    'record-control.voids.create',
    'record-control.requests.all'
)
WHERE role.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permission existing
      WHERE existing.role_id = role.id
        AND existing.permission_id = permission.id
  );
