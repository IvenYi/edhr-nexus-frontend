--liquibase formatted sql
--changeset edhr:0015-material-versioning

ALTER TABLE material ADD COLUMN IF NOT EXISTS version VARCHAR(64) NOT NULL DEFAULT 'V1.0';
UPDATE material SET version = 'V1.0' WHERE version IS NULL OR TRIM(version) = '';

DROP INDEX IF EXISTS uk_material_code;
CREATE UNIQUE INDEX IF NOT EXISTS uk_material_code_version ON material(tenant_id, code, version);

INSERT INTO material_type (id, tenant_id, code, name, description, status, created_by, created_at, updated_by, updated_at)
SELECT nextval('hibernate_sequence'), 'default', v.code, v.name, v.description, 'ACTIVE', '系统管理员', CURRENT_TIMESTAMP, '系统管理员', CURRENT_TIMESTAMP
FROM (
    VALUES
        ('MT-RAW', '原材料', '生产投入的基础原料'),
        ('MT-SEMI', '半成品', '已加工但尚未成为最终产品的物料'),
        ('MT-FINISHED', '产成品', '可交付或入库的最终产品'),
        ('MT-AUX', '辅材', '生产过程使用的辅助材料'),
        ('MT-PACKAGING', '包材', '包装相关材料')
) AS v(code, name, description)
WHERE NOT EXISTS (
    SELECT 1
    FROM material_type mt
    WHERE mt.tenant_id = 'default' AND mt.name = v.name
);
