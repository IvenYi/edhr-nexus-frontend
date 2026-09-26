--liquibase formatted sql
--changeset codex:0102-dhr-summary-complete-evidence

-- Existing frozen versions retain their original, manually selected evidence semantics.
ALTER TABLE dhr_summary_version
    ADD COLUMN evidence_model_version SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE dhr_summary_version
    ADD COLUMN check_result_snapshot TEXT;

-- A legacy draft must be reviewed and saved against the current source scope before submission.
ALTER TABLE dhr_summary_draft
    ADD COLUMN source_scope_hash VARCHAR(64);
