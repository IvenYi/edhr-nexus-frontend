--liquibase formatted sql
--changeset edhr:0064-production-work-order-fields

ALTER TABLE work_order ADD COLUMN IF NOT EXISTS order_number VARCHAR(64);
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS planned_start_at TIMESTAMP;
ALTER TABLE work_order ADD COLUMN IF NOT EXISTS planned_end_at TIMESTAMP;
