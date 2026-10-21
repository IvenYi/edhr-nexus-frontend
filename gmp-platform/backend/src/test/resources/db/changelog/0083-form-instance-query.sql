--liquibase formatted sql
--changeset codex:0083-form-instance-query-columns
-- Search projections of frozen source metadata, not a second instance registry.
ALTER TABLE form_instance_record ADD COLUMN template_code VARCHAR(256);
ALTER TABLE form_instance_record ADD COLUMN template_name VARCHAR(512);
ALTER TABLE form_instance_record ADD COLUMN template_version VARCHAR(192);
ALTER TABLE form_instance_record ADD COLUMN work_order_id VARCHAR(64);
ALTER TABLE form_instance_record ADD COLUMN work_order_no VARCHAR(192);
ALTER TABLE form_instance_record ADD COLUMN object_no VARCHAR(192);
ALTER TABLE form_instance_record ADD COLUMN object_type VARCHAR(32);
ALTER TABLE form_instance_record ADD COLUMN operation_name VARCHAR(512);
ALTER TABLE form_instance_record ADD COLUMN created_by_id VARCHAR(192);
ALTER TABLE form_instance_record ADD COLUMN updated_by_id VARCHAR(192);
CREATE INDEX idx_form_instance_updated ON form_instance_record(tenant_id,updated_at DESC,id DESC);
CREATE INDEX idx_form_instance_created ON form_instance_record(tenant_id,created_at DESC NULLS LAST,id DESC);
CREATE INDEX idx_form_instance_object ON form_instance_record(tenant_id,object_id,operation_id);
CREATE INDEX idx_form_instance_order ON form_instance_record(tenant_id,work_order_id);

--changeset codex:0083-form-instance-query-history dbms:postgresql
-- Never guess historical principal IDs from display names; unknown remains NULL.
UPDATE form_instance_record SET
    template_code = snapshot_json::jsonb->>'code',
    template_name = snapshot_json::jsonb->>'name',
    template_version = snapshot_json::jsonb->>'version';
UPDATE form_instance_record r SET
    work_order_id = e.snapshot_json::jsonb->'context'->>'workOrderId',
    work_order_no = e.snapshot_json::jsonb->'context'->>'workOrderNo',
    object_no = e.snapshot_json::jsonb->'context'->>'objectNo',
    object_type = e.snapshot_json::jsonb->'context'->>'objectType',
    operation_name = (SELECT op->>'name' FROM jsonb_array_elements(e.snapshot_json::jsonb->'operations') op
        WHERE op->>'id' = r.operation_id LIMIT 1)
FROM production_execution e JOIN production_object o ON o.id=e.object_id
WHERE r.object_id=e.object_id AND r.tenant_id=o.tenant_id;

--changeset codex:0083-form-instance-query-permission
INSERT INTO permission(id,code,name,type,parent_code,sort_order)
SELECT nextval('hibernate_sequence'),'form-instances.view','表单实例查看','BUTTON','production.execution',1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code='form-instances.view');
INSERT INTO role_permission(id,role_id,permission_id)
SELECT nextval('hibernate_sequence'),r.id,p.id FROM role r
JOIN permission p ON p.code='form-instances.view'
WHERE r.code='ADMIN' AND NOT EXISTS (
    SELECT 1 FROM role_permission rp WHERE rp.role_id=r.id AND rp.permission_id=p.id
);
