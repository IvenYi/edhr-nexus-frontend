--liquibase formatted sql
--changeset edhr:0025-material-version-display-fields

ALTER TABLE material ADD COLUMN IF NOT EXISTS material_purpose VARCHAR(32) NOT NULL DEFAULT '生产物料';
ALTER TABLE material ADD COLUMN IF NOT EXISTS effective_date TIMESTAMP;
ALTER TABLE material ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;

UPDATE material SET material_purpose = '生产物料'
WHERE material_purpose IS NULL OR TRIM(material_purpose) = '';
