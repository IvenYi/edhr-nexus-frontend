--liquibase formatted sql
--changeset edhr:0093-ai-task-foundation
CREATE TABLE ai_capability (
    installation_id varchar(128) PRIMARY KEY,
    enabled boolean NOT NULL DEFAULT false
);
CREATE TABLE ai_task (
    id uuid PRIMARY KEY,
    installation_id varchar(128) NOT NULL REFERENCES ai_capability(installation_id),
    -- Historical actor identity: deleting an account must not delete tasks or add a new deletion veto.
    owner_id bigint NOT NULL,
    request_id varchar(128) NOT NULL,
    request_hash varchar(64) NOT NULL,
    instruction text NOT NULL,
    current_run_id uuid,
    max_requests integer NOT NULL CHECK (max_requests > 0),
    max_output_tokens integer NOT NULL CHECK (max_output_tokens > 0),
    budget_micros bigint NOT NULL CHECK (budget_micros > 0),
    request_reserve_micros bigint NOT NULL CHECK (request_reserve_micros > 0),
    used_requests integer NOT NULL DEFAULT 0 CHECK (used_requests >= 0),
    charged_micros bigint NOT NULL DEFAULT 0 CHECK (charged_micros >= 0),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (installation_id, owner_id, request_id)
);
CREATE TABLE ai_run (
    id uuid PRIMARY KEY,
    task_id uuid NOT NULL REFERENCES ai_task(id),
    state varchar(32) NOT NULL CHECK (state IN ('QUEUED','RUNNING','STOPPED','FAILED')),
    reason varchar(64),
    lease_epoch bigint NOT NULL DEFAULT 0,
    lease_until timestamptz,
    deadline_at timestamptz,
    config_json jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX ai_run_one_active ON ai_run(task_id) WHERE state IN ('QUEUED','RUNNING');
CREATE INDEX ai_run_queue ON ai_run(state, created_at);
ALTER TABLE ai_task ADD CONSTRAINT ai_task_current_run_fk FOREIGN KEY (current_run_id) REFERENCES ai_run(id);
CREATE TABLE ai_task_action (
    task_id uuid NOT NULL REFERENCES ai_task(id),
    request_id varchar(128) NOT NULL,
    request_hash varchar(64) NOT NULL,
    result_json jsonb NOT NULL,
    PRIMARY KEY (task_id, request_id)
);
CREATE TABLE ai_model_reservation (
    run_id uuid NOT NULL REFERENCES ai_run(id),
    request_id varchar(128) NOT NULL,
    reserved_micros bigint NOT NULL CHECK (reserved_micros > 0),
    actual_micros bigint CHECK (actual_micros >= 0),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (run_id, request_id)
);
CREATE TABLE ai_task_event (
    id bigserial PRIMARY KEY,
    task_id uuid REFERENCES ai_task(id),
    run_id uuid REFERENCES ai_run(id),
    installation_id varchar(128) NOT NULL,
    actor varchar(128) NOT NULL,
    action varchar(64) NOT NULL,
    detail_json jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ai_task_event_task ON ai_task_event(task_id, id);
-- No destructive rollback: disable AI and retain task history when rolling back the application.
