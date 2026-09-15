--liquibase formatted sql

--changeset codex:0074-workflow-node-edge-created-at
ALTER TABLE workflow_node
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE workflow_edge
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
