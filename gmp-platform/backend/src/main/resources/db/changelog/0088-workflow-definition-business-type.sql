--liquibase formatted sql

--changeset codex:0088-workflow-definition-business-type
ALTER TABLE workflow_definition
    ADD COLUMN IF NOT EXISTS business_type VARCHAR(32);

CREATE INDEX IF NOT EXISTS idx_workflow_definition_business_type
    ON workflow_definition (type, business_type);

--changeset codex:0088-workflow-definition-business-type-check
--preconditions onFail:MARK_RAN
--precondition-sql-check expectedResult:0 SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = current_schema() AND LOWER(table_name) = 'workflow_definition' AND LOWER(constraint_name) = 'ck_workflow_definition_record_control_category'
ALTER TABLE workflow_definition
    ADD CONSTRAINT ck_workflow_definition_record_control_category
    CHECK (type <> 'RECORD_CONTROL' OR business_type IN ('CHANGE', 'OBSOLETE'));
