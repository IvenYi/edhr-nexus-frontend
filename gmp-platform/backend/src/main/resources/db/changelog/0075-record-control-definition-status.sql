--liquibase formatted sql

--changeset codex:0075-record-control-definition-status
UPDATE workflow_definition definition
SET status = 'PUBLISHED'
WHERE definition.type = 'RECORD_CONTROL'
  AND EXISTS (
      SELECT 1
      FROM workflow_definition_version version
      WHERE version.definition_id = definition.id
        AND version.status = 'PUBLISHED'
        AND version.is_current = TRUE
  );
