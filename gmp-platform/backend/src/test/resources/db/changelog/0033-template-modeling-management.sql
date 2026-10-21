ALTER TABLE form_template ADD COLUMN IF NOT EXISTS category_name VARCHAR(128);
ALTER TABLE form_template ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE form_template ADD COLUMN IF NOT EXISTS current_version_id BIGINT;
ALTER TABLE form_template ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE form_template ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);

ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(64) DEFAULT 'default';
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS version_label VARCHAR(64);
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP;
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS effective_to TIMESTAMP;
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS source_file_name VARCHAR(256);
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS source_file_id BIGINT;
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS source_file_type VARCHAR(32);
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS import_status VARCHAR(32) DEFAULT '未导入';
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS model_design_json TEXT;
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS canvas_design_json TEXT;
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS workflow_design_json TEXT;
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);
ALTER TABLE form_template_version ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE dhr_template ADD COLUMN IF NOT EXISTS category_name VARCHAR(128);
ALTER TABLE dhr_template ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE dhr_template ADD COLUMN IF NOT EXISTS created_by VARCHAR(128);
ALTER TABLE dhr_template ADD COLUMN IF NOT EXISTS updated_by VARCHAR(128);

CREATE TABLE IF NOT EXISTS template_category (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    template_type VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    sort_order INTEGER,
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_template_category_name
ON template_category(tenant_id, template_type, lower(name));

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'master-data.form-templates', '表单模板', 'PAGE', 'master-data', 21
WHERE NOT EXISTS (
    SELECT 1 FROM permission WHERE code = 'master-data.form-templates'
);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'master-data.batch-record-templates', '批记录模板', 'PAGE', 'master-data', 22
WHERE NOT EXISTS (
    SELECT 1 FROM permission WHERE code = 'master-data.batch-record-templates'
);

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence') AS id, r.id, p.id
FROM role r
JOIN permission p ON p.code IN ('master-data.form-templates', 'master-data.batch-record-templates')
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
