--liquibase formatted sql
--changeset edhr:0057-production-work-template-configuration

ALTER TABLE workflow_definition ADD COLUMN IF NOT EXISTS code VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS uk_workflow_definition_work_code ON workflow_definition (LOWER(code)) WHERE type = 'WORK' AND code IS NOT NULL;
ALTER TABLE workflow_binding_rule ADD COLUMN IF NOT EXISTS name VARCHAR(256);
ALTER TABLE workflow_binding_rule ADD COLUMN IF NOT EXISTS rule_type VARCHAR(32) NOT NULL DEFAULT 'GLOBAL';
ALTER TABLE workflow_binding_rule ADD COLUMN IF NOT EXISTS product_family_id BIGINT;
ALTER TABLE workflow_binding_rule ADD COLUMN IF NOT EXISTS product_id BIGINT;
ALTER TABLE workflow_binding_rule ADD COLUMN IF NOT EXISTS operation_id BIGINT;
ALTER TABLE workflow_binding_rule ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 0;
ALTER TABLE workflow_binding_rule ADD COLUMN IF NOT EXISTS description TEXT;
CREATE INDEX IF NOT EXISTS idx_workflow_binding_rule_definition ON workflow_binding_rule(definition_id);
