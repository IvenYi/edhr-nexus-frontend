--liquibase formatted sql
--changeset edhr:0009-login-log

CREATE TABLE IF NOT EXISTS login_log (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    operator_id BIGINT,
    operator_name VARCHAR(128),
    username VARCHAR(128),
    event_type VARCHAR(32) NOT NULL,
    auth_method VARCHAR(32) NOT NULL,
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    platform VARCHAR(32) NOT NULL,
    client_type VARCHAR(32) NOT NULL,
    browser VARCHAR(64),
    ip_address VARCHAR(64),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_log_event_type ON login_log(event_type);
CREATE INDEX IF NOT EXISTS idx_login_log_operator ON login_log(operator_id);
CREATE INDEX IF NOT EXISTS idx_login_log_username ON login_log(username);
CREATE INDEX IF NOT EXISTS idx_login_log_occurred_at ON login_log(occurred_at);
