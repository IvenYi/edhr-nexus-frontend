--liquibase formatted sql
--changeset edhr:0055-rename-transaction-template-to-work

-- Keep the persisted workflow type unchanged. Migrate the customer-visible
-- permission code and name from the legacy transaction term.
UPDATE permission
SET code = 'workflow.work-templates',
    name = '作业模板'
WHERE code = 'workflow.txn-templates';
