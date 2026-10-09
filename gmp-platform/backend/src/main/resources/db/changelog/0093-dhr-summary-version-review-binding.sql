--liquibase formatted sql
--changeset codex:0093-dhr-summary-version-review-binding

ALTER TABLE dhr_summary_version
    ADD CONSTRAINT ck_dhr_summary_version_review_binding CHECK (
        (review_mode = 'NONE' AND review_workflow_definition_id IS NULL AND review_workflow_version_id IS NULL)
        OR
        (review_mode = 'REQUIRED' AND review_workflow_definition_id IS NOT NULL AND review_workflow_version_id IS NOT NULL)
    );
