--liquibase formatted sql

--changeset edhr:0075-equipment-brand-purchase-date
ALTER TABLE equipment ADD COLUMN brand VARCHAR(128);
ALTER TABLE equipment ADD COLUMN purchase_date DATE;

--rollback ALTER TABLE equipment DROP COLUMN purchase_date;
--rollback ALTER TABLE equipment DROP COLUMN brand;
