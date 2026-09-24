--liquibase formatted sql
--changeset codex:0099-dhr-approval-display-name

-- Rename customer-facing permission labels only. Stable codes and grants stay unchanged.
UPDATE permission SET name = 'DHR审批'
WHERE code = 'records.dhr-review' AND name = 'DHR审核';

UPDATE permission SET name = 'DHR审批处理'
WHERE code = 'dhr.reviews.act' AND name = 'DHR审核处理';
