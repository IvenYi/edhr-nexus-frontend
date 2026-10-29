--liquibase formatted sql
--changeset codex:0090-workflow-operations
-- Keep existing codes and grants; intervention becomes a navigable page and retains its action permission.
UPDATE permission SET name='流程日志' WHERE code='workflow.instances';
UPDATE permission SET name='流程干预',type='PAGE',parent_code='workflow',sort_order=6 WHERE code='workflow.intervene';
