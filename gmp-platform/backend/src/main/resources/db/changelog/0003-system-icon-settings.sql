--liquibase formatted sql
--changeset edhr:0003-system-icon-settings
--validCheckSum: 9:b3c593c46b6de8b82f6396a39597bb98

CREATE TABLE IF NOT EXISTS icon_group (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    name VARCHAR(128) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_icon_group_tenant_sort ON icon_group(tenant_id, sort_order);

CREATE TABLE IF NOT EXISTS icon_asset (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    group_id BIGINT,
    file_id BIGINT,
    name VARCHAR(128) NOT NULL,
    builtin_key VARCHAR(128),
    tags VARCHAR(512),
    source VARCHAR(32) NOT NULL DEFAULT 'UPLOAD',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_icon_asset_group_sort ON icon_asset(tenant_id, group_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_icon_asset_file ON icon_asset(file_id);

CREATE TABLE IF NOT EXISTS system_setting (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    system_name VARCHAR(128) NOT NULL,
    system_logo_file_id BIGINT,
    browser_title VARCHAR(256) NOT NULL,
    browser_icon_file_id BIGINT,
    created_by VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_system_setting_tenant ON system_setting(tenant_id);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), v.code, v.name, v.type, v.parent_code, v.sort_order
FROM (
    VALUES
        ('system.icons', '图标管理', 'PAGE', 'system', 10),
        ('system.settings', '系统设置', 'PAGE', 'system', 11)
) AS v(code, name, type, parent_code, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM permission p
    WHERE p.code = v.code
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence') AS id, 1 AS role_id, p.id AS permission_id
FROM permission p
WHERE p.code IN ('system.icons', 'system.settings')
  AND NOT EXISTS (
      SELECT 1
      FROM role_permission rp
      WHERE rp.role_id = 1 AND rp.permission_id = p.id
  );
