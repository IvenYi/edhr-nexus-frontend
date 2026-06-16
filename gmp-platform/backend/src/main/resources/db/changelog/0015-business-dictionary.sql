--liquibase formatted sql
--changeset edhr:0015-business-dictionary

CREATE TABLE IF NOT EXISTS business_dictionary (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    sort_order INTEGER NOT NULL DEFAULT 0,
    builtin BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_business_dictionary_tenant_code ON business_dictionary(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_business_dictionary_tenant_sort ON business_dictionary(tenant_id, sort_order);

CREATE TABLE IF NOT EXISTS business_dictionary_item (
    id BIGINT PRIMARY KEY,
    dictionary_id BIGINT NOT NULL,
    value VARCHAR(128) NOT NULL,
    label VARCHAR(128) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    remark VARCHAR(512),
    builtin BOOLEAN NOT NULL DEFAULT FALSE,
    created_by VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_business_dictionary_item_dictionary_value ON business_dictionary_item(dictionary_id, value);
CREATE INDEX IF NOT EXISTS idx_business_dictionary_item_dictionary_sort ON business_dictionary_item(dictionary_id, sort_order);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), v.code, v.name, v.type, v.parent_code, v.sort_order
FROM (
    VALUES
        ('system.dictionaries', '业务字典', 'PAGE', 'system', 12)
) AS v(code, name, type, parent_code, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM permission p
    WHERE p.code = v.code
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence') AS id, 1 AS role_id, p.id AS permission_id
FROM permission p
WHERE p.code = 'system.dictionaries'
  AND NOT EXISTS (
      SELECT 1
      FROM role_permission rp
      WHERE rp.role_id = 1 AND rp.permission_id = p.id
  );
