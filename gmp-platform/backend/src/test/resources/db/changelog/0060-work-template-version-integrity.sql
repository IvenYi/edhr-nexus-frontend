--liquibase formatted sql
--changeset edhr:0060-work-template-version-integrity

-- A template can have one editable draft. The unique index is the final guard
-- when concurrent requests attempt to create the next draft.
CREATE UNIQUE INDEX IF NOT EXISTS uk_workflow_definition_version_one_draft
    ON workflow_definition_version (definition_id)
    WHERE status = 'DRAFT';

-- Keep a version attached to its template. The application deletes an
-- unpublished draft before its parent and rejects deletion when published
-- history exists, so the database must not permit orphan versions.
ALTER TABLE workflow_definition_version
    ADD CONSTRAINT fk_workflow_definition_version_definition
    FOREIGN KEY (definition_id)
    REFERENCES workflow_definition(id)
    ON DELETE RESTRICT;
