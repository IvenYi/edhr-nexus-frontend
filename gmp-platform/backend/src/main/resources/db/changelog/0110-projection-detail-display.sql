--liquibase formatted sql
--changeset codex:0110-projection-detail-display
ALTER TABLE form_projection_record ADD COLUMN details JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE form_lookup_item SET name='生产批次/SN', description='本表单记录的系统内生产对象编号；实际生产和DHR归属由执行上下文确定。', revision=revision+1
WHERE tenant_id='default' AND id='lookup_production_batch';
