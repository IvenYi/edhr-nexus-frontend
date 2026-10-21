--liquibase formatted sql
--changeset codex:0113-trace-date-preset
INSERT INTO form_lookup_item (id,name,description,value_type,builtin) VALUES
('lookup_trace_date','追溯日期','绑定表单中用于追溯的业务日期字段，按起止日期查询；不自动取创建时间。','date',true)
ON CONFLICT (tenant_id,id) DO NOTHING;
