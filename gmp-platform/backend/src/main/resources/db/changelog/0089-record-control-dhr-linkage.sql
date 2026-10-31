--liquibase formatted sql

--changeset codex:0089-record-control-dhr-linkage
ALTER TABLE dhr_summary_version ADD COLUMN submitted_by_id VARCHAR(64);
CREATE TABLE dhr_evidence_impact (
    id BIGSERIAL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    event_id VARCHAR(200) NOT NULL,
    request_id BIGINT NOT NULL REFERENCES record_control_request(id),
    record_id BIGINT NOT NULL REFERENCES form_instance_record(id),
    summary_version_id BIGINT NOT NULL REFERENCES dhr_summary_version(id),
    from_revision_id BIGINT NOT NULL REFERENCES form_instance_revision(id),
    to_revision_id BIGINT NOT NULL REFERENCES form_instance_revision(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('CHANGE','OBSOLETE')),
    occurred_at TIMESTAMP NOT NULL,
    UNIQUE (tenant_id,event_id,summary_version_id)
);
CREATE INDEX idx_dhr_evidence_impact_version ON dhr_evidence_impact(tenant_id,summary_version_id,record_id);
CREATE TABLE dhr_impact_notification (
    impact_id BIGINT NOT NULL REFERENCES dhr_evidence_impact(id),
    recipient_id VARCHAR(64) NOT NULL,
    read_at TIMESTAMP,
    PRIMARY KEY (impact_id,recipient_id)
);
CREATE INDEX idx_dhr_impact_notification_recipient ON dhr_impact_notification(recipient_id,impact_id DESC);
--rollback DROP TABLE dhr_impact_notification;
--rollback DROP TABLE dhr_evidence_impact;
--rollback ALTER TABLE dhr_summary_version DROP COLUMN submitted_by_id;
