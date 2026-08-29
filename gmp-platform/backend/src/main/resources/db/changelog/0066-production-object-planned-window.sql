--liquibase formatted sql

--changeset edhr:0066-production-object-planned-window
ALTER TABLE production_object ADD COLUMN IF NOT EXISTS planned_start_at TIMESTAMP;
ALTER TABLE production_object ADD COLUMN IF NOT EXISTS planned_end_at TIMESTAMP;
ALTER TABLE production_object ADD CONSTRAINT ck_production_object_planned_window
    CHECK (planned_start_at IS NULL OR planned_end_at IS NULL OR planned_end_at >= planned_start_at);
