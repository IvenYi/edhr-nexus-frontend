--liquibase formatted sql
--changeset edhr:0061-workshop-columns

ALTER TABLE workshop ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

UPDATE workshop w
SET tenant_id = COALESCE(s.tenant_id, 1)
FROM site s
WHERE w.site_id = s.id
  AND w.tenant_id IS NULL;

UPDATE workshop SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE workshop ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE workshop ADD COLUMN IF NOT EXISTS description VARCHAR(512);
ALTER TABLE workshop ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';

--changeset edhr:0061-workshop-code-validation splitStatements:false
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM workshop
        WHERE code IS NULL OR BTRIM(code) = ''
    ) THEN
        RAISE EXCEPTION '存在空白车间编码，请先清理历史数据后再执行车间管理迁移';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM workshop
        GROUP BY tenant_id, LOWER(BTRIM(code))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION '存在同租户重复的车间编码，请先清理历史数据后再执行车间管理迁移';
    END IF;
END $$;

--changeset edhr:0061-workshop-code-index
UPDATE workshop SET code = BTRIM(code) WHERE code <> BTRIM(code);

DROP INDEX IF EXISTS uk_workshop_code;
DROP INDEX IF EXISTS uk_workshop_tenant_code;
CREATE UNIQUE INDEX uk_workshop_tenant_code ON workshop(tenant_id, LOWER(code));

ALTER TABLE workshop DROP COLUMN IF EXISTS site_id;

--changeset edhr:0061-production-line-orphan-validation splitStatements:false
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM production_line line
        LEFT JOIN workshop w ON w.id = line.workshop_id
        WHERE w.id IS NULL
    ) THEN
        RAISE EXCEPTION '存在未关联有效车间的生产线，请先清理历史数据后再执行车间管理迁移';
    END IF;
END $$;

--changeset edhr:0061-production-line-workshop-foreign-key splitStatements:false
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_production_line_workshop'
    ) THEN
        ALTER TABLE production_line
            ADD CONSTRAINT fk_production_line_workshop
            FOREIGN KEY (workshop_id)
            REFERENCES workshop(id)
            ON DELETE RESTRICT;
    END IF;
END $$;

--changeset edhr:0061-workshop-status-check splitStatements:false
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_workshop_status'
    ) THEN
        ALTER TABLE workshop
            ADD CONSTRAINT ck_workshop_status CHECK (status IN ('ACTIVE', 'INACTIVE'));
    END IF;
END $$;

--changeset edhr:0061-workshop-permission
INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'master-data.workshops', '车间管理', 'PAGE', 'master-data', 23
WHERE NOT EXISTS (
    SELECT 1 FROM permission WHERE code = 'master-data.workshops'
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), 1, p.id
FROM permission p
WHERE p.code = 'master-data.workshops'
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp
      WHERE rp.role_id = 1 AND rp.permission_id = p.id
  );
