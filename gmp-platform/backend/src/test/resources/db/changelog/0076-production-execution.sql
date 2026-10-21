--liquibase formatted sql
--changeset edhr:0076-production-execution

CREATE TABLE production_execution (
    object_id BIGINT PRIMARY KEY REFERENCES production_object(id),
    snapshot_json TEXT NOT NULL,
    state_json TEXT NOT NULL,
    revision BIGINT NOT NULL DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'production.execution', '生产执行', 'PAGE', 'production', 3
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'production.execution');

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r JOIN permission p ON p.code = 'production.execution'
WHERE r.code = 'ADMIN' AND NOT EXISTS (
    SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
