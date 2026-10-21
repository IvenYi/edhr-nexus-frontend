--liquibase formatted sql
--changeset edhr:0071-workflow-task-candidate-snapshot
-- One logical task stores the resolved candidate snapshot. This avoids creating
-- one persisted task/candidate record per person at a high-cardinality node.
ALTER TABLE workflow_task ADD COLUMN IF NOT EXISTS candidate_snapshot JSONB;
CREATE INDEX IF NOT EXISTS idx_workflow_task_candidate_snapshot
    ON workflow_task USING GIN (candidate_snapshot);
CREATE UNIQUE INDEX IF NOT EXISTS uq_workflow_task_active_instance_node
    ON workflow_task (instance_id, node_id)
    WHERE status IN ('PENDING', 'PROCESSING');
