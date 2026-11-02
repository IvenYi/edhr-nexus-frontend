--liquibase formatted sql

--changeset edhr:0091-dhr-review-pending-index runInTransaction:false
--preconditions onFail:HALT onError:HALT
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM pg_catalog.pg_collation WHERE collnamespace='pg_catalog'::regnamespace AND collname='und-x-icu' AND collprovider='i'
-- Historical reviews stay outside this small current-work index.
CREATE INDEX CONCURRENTLY idx_dhr_review_pending_workflow
    ON dhr_summary_review(workflow_instance_id)
    WHERE status = 'PENDING_REVIEW';
--rollback DROP INDEX CONCURRENTLY idx_dhr_review_pending_workflow;

--changeset edhr:0091-dhr-review-done-index runInTransaction:false
-- Keep the existing all-status assignee index for the other workflow queries.
CREATE INDEX CONCURRENTLY idx_workflow_task_done_assignee_id
    ON workflow_task(assignee_id, id DESC) INCLUDE (instance_id, node_id)
    WHERE status IN ('COMPLETED', 'REJECTED');
--rollback DROP INDEX CONCURRENTLY idx_workflow_task_done_assignee_id;
