CREATE TABLE IF NOT EXISTS form_template_analysis (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    template_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    source_file_id BIGINT,
    analysis_json TEXT,
    decision_json TEXT,
    status VARCHAR(32) DEFAULT 'PENDING',
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_form_template_analysis_version
ON form_template_analysis(tenant_id, template_id, version_id);

CREATE TABLE IF NOT EXISTS form_template_source_revision (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    template_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    file_id BIGINT NOT NULL,
    revision_no INTEGER NOT NULL,
    source VARCHAR(32),
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_form_template_source_revision_no
ON form_template_source_revision(tenant_id, template_id, version_id, revision_no);
