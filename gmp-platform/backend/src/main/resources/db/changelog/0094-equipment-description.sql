--liquibase formatted sql

--changeset edhr:0094-equipment-description
ALTER TABLE equipment_type ADD COLUMN description VARCHAR(512);
ALTER TABLE equipment ADD COLUMN description VARCHAR(512);

--rollback ALTER TABLE equipment DROP COLUMN description;
--rollback ALTER TABLE equipment_type DROP COLUMN description;
