--liquibase formatted sql
--changeset codex:0100-dhr-summary-evidence-order

ALTER TABLE dhr_summary_evidence ADD COLUMN before_node_key VARCHAR(128);
ALTER TABLE dhr_summary_evidence ADD COLUMN display_order INTEGER;
