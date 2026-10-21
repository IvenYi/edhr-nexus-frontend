--liquibase formatted sql
--changeset codex:0097-dhr-review-workbench

-- Runtime outcome is separate from immutable submitted evidence.
CREATE TABLE dhr_summary_review (
    summary_version_id BIGINT PRIMARY KEY REFERENCES dhr_summary_version(id),
    workflow_instance_id BIGINT NOT NULL UNIQUE REFERENCES workflow_instance(id),
    status VARCHAR(24) NOT NULL CHECK (status IN ('PENDING_REVIEW','APPROVED','RETURNED')),
    submitted_by_id VARCHAR(64) NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

INSERT INTO permission (id,code,name,type,parent_code,sort_order)
SELECT nextval('hibernate_sequence'),v.code,v.name,v.type,v.parent_code,v.sort_order FROM (VALUES
 ('records.dhr-filling','DHR填报','PAGE','records.dhr-management',1),
 ('records.dhr-review','DHR审核','PAGE','records.dhr-management',3),
 ('dhr.filling.act','DHR填报处理','BUTTON','records.dhr-filling',1),
 ('dhr.filling.supplement','DHR追加补录','BUTTON','records.dhr-filling',2),
 ('dhr.reviews.act','DHR审核处理','BUTTON','records.dhr-review',1),
 ('dhr.summaries.reorganize','DHR重新整理','BUTTON','records.dhr-summary',3)
) v(code,name,type,parent_code,sort_order)
WHERE NOT EXISTS (SELECT 1 FROM permission p WHERE p.code=v.code);

INSERT INTO role_permission (id,role_id,permission_id)
SELECT nextval('hibernate_sequence'),r.id,p.id FROM role r JOIN permission p ON p.code IN
 ('records.dhr-filling','records.dhr-review','dhr.reviews.act','dhr.summaries.reorganize','dhr.filling.act','dhr.filling.supplement')
WHERE r.code='ADMIN' AND NOT EXISTS (SELECT 1 FROM role_permission rp WHERE rp.role_id=r.id AND rp.permission_id=p.id);
