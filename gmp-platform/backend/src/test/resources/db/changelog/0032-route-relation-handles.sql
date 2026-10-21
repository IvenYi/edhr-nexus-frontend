--liquibase formatted sql
--changeset edhr:0032-route-relation-handles
ALTER TABLE route_relation
    ADD COLUMN IF NOT EXISTS source_handle VARCHAR(64),
    ADD COLUMN IF NOT EXISTS target_handle VARCHAR(64);
