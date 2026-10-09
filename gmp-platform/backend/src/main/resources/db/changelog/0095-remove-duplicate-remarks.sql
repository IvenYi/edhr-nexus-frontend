--liquibase formatted sql

--changeset edhr:0095-remove-duplicate-remarks
-- Duplicate parent/version remark columns are no longer part of the form contract.
-- Existing values are intentionally discarded per the approved cleanup scope.
ALTER TABLE product_family DROP COLUMN IF EXISTS remark;
ALTER TABLE sop_document DROP COLUMN IF EXISTS remark;
ALTER TABLE document_version DROP COLUMN IF EXISTS remark;

--rollback ALTER TABLE product_family ADD COLUMN remark TEXT;
--rollback ALTER TABLE sop_document ADD COLUMN remark TEXT;
--rollback ALTER TABLE document_version ADD COLUMN remark TEXT;
