--liquibase formatted sql
--changeset edhr:0023-audit-event-snapshot-hash

ALTER TABLE audit_event ADD COLUMN IF NOT EXISTS snapshot_hash VARCHAR(64);
CREATE INDEX IF NOT EXISTS idx_audit_snapshot_hash ON audit_event(snapshot_hash);
