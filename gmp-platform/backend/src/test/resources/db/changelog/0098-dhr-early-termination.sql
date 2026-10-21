--liquibase formatted sql
--changeset codex:0098-dhr-early-termination

ALTER TABLE dhr_instance DROP CONSTRAINT ck_dhr_instance_status;
ALTER TABLE dhr_instance ADD CONSTRAINT ck_dhr_instance_status
    CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'EARLY_TERMINATED'));

CREATE TABLE dhr_termination (
    dhr_instance_id BIGINT PRIMARY KEY REFERENCES dhr_instance(id),
    tenant_id VARCHAR(64) NOT NULL,
    reason TEXT,
    terminated_at TIMESTAMP,
    terminated_by VARCHAR(192),
    recorded_at TIMESTAMP NOT NULL,
    snapshot_json TEXT,
    snapshot_hash VARCHAR(64),
    historical BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT ck_dhr_termination_snapshot CHECK (
        (historical AND snapshot_json IS NULL AND snapshot_hash IS NULL)
        OR (NOT historical AND snapshot_json IS NOT NULL AND snapshot_hash IS NOT NULL)
    )
);

-- Only unambiguous old records are corrected. The original evidence at termination
-- cannot be reconstructed; the row deliberately carries no historical snapshot.
WITH corrected AS (
    UPDATE dhr_instance d SET status='EARLY_TERMINATED', updated_at=CURRENT_TIMESTAMP,
        updated_by='SYSTEM'
    FROM production_object p
    WHERE p.id=d.production_object_id AND p.tenant_id=d.tenant_id
      AND p.status='EARLY_TERMINATED' AND d.status='IN_PROGRESS'
      AND d.summary_status='NOT_STARTED'
      AND NOT EXISTS (SELECT 1 FROM dhr_summary_draft draft WHERE draft.dhr_instance_id=d.id)
      AND NOT EXISTS (SELECT 1 FROM dhr_summary_version version WHERE version.dhr_instance_id=d.id)
    RETURNING d.id,d.tenant_id,d.production_object_id
)
INSERT INTO dhr_termination(dhr_instance_id,tenant_id,reason,terminated_at,recorded_at,historical)
SELECT corrected.id,corrected.tenant_id,p.termination_reason,p.termination_at,CURRENT_TIMESTAMP,TRUE
FROM corrected JOIN production_object p ON p.id=corrected.production_object_id;

-- Record this as a migration-time correction, never as the original termination event.
INSERT INTO audit_event(id,tenant_id,entity_type,entity_id,action,content_before,content_after,
                        operator_name,source,reason,module_name,menu_name,function_name,data_summary,created_at)
SELECT nextval('hibernate_sequence'),t.tenant_id,'DHR_INSTANCE',t.dhr_instance_id::text,'BASELINE',
       jsonb_build_object('status','IN_PROGRESS'),
       jsonb_build_object('status','EARLY_TERMINATED','historical',true,'snapshotAvailable',false,
                          'terminationAt',t.terminated_at,'terminationReason',t.reason),
       '系统','SYSTEM','历史状态修正；原始操作者和终止时快照未知',
       '记录','DHR管理','提前结束历史修正',d.dhr_no,CURRENT_TIMESTAMP
FROM dhr_termination t JOIN dhr_instance d ON d.id=t.dhr_instance_id
WHERE t.historical=TRUE;
