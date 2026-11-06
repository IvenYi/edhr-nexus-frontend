--liquibase formatted sql

--changeset edhr:0092-audit-event-hash-version
-- Null means an unmarked legacy/external hash, not an assertion of its algorithm or validity.
-- Application rollback keeps this compatible column and all existing event/hash values.
-- No backfill, default, audit rewrite, index or destructive schema rollback is required.
ALTER TABLE audit_event ADD COLUMN snapshot_hash_version varchar(32);
