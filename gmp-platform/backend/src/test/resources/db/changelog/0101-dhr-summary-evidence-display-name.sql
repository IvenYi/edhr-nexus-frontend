--liquibase formatted sql
--changeset codex:0101-dhr-summary-evidence-display-name

ALTER TABLE dhr_summary_evidence ADD COLUMN display_name VARCHAR(120);
