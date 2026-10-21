--liquibase formatted sql
--changeset codex:0081-material-brand-name
ALTER TABLE material RENAME COLUMN brand TO brand_name;
--rollback ALTER TABLE material RENAME COLUMN brand_name TO brand;
