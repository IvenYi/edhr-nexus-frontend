--liquibase formatted sql
--changeset edhr:0078-material-brand

ALTER TABLE material ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
