--liquibase formatted sql
--changeset edhr:0056-workflow-definition-work-type

-- The workflow center skeleton has not entered production use. Normalize its
-- persisted business discriminator before the production-work runtime is built.
UPDATE workflow_definition
SET type = 'WORK'
WHERE type = 'TRANSACTION';
