--liquibase formatted sql
--changeset edhr:0068-production-object-early-termination
ALTER TABLE production_object ADD COLUMN IF NOT EXISTS termination_reason TEXT;
ALTER TABLE production_object ADD COLUMN IF NOT EXISTS termination_at TIMESTAMP;
