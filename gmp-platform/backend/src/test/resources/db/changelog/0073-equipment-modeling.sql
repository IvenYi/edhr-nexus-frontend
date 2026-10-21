--liquibase formatted sql

--changeset edhr:0073-equipment-modeling
CREATE TABLE equipment_category (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'default',
    name VARCHAR(128) NOT NULL,
    system_category BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_equipment_category_name UNIQUE (tenant_id, name)
);
INSERT INTO equipment_category (id, name, system_category, sort_order) VALUES
    (-1, '生产设备', TRUE, 1),
    (-2, '检验设备', TRUE, 2),
    (-3, '计量器具', TRUE, 3);
ALTER TABLE equipment_type ADD COLUMN category_id BIGINT;
ALTER TABLE equipment_type ADD CONSTRAINT fk_equipment_type_category FOREIGN KEY (category_id) REFERENCES equipment_category(id);
CREATE INDEX idx_equipment_type_category ON equipment_type(category_id);
CREATE INDEX idx_equipment_type_reference ON equipment(equipment_type_id);

--rollback DROP INDEX idx_equipment_type_reference;
--rollback DROP INDEX idx_equipment_type_category;
--rollback ALTER TABLE equipment_type DROP CONSTRAINT fk_equipment_type_category;
--rollback ALTER TABLE equipment_type DROP COLUMN category_id;
--rollback DROP TABLE equipment_category;

--changeset edhr:0073-equipment-reference-integrity dbms:postgresql
-- Preserve any legacy orphan references while enforcing integrity for new writes.
ALTER TABLE equipment ADD CONSTRAINT fk_equipment_type FOREIGN KEY (equipment_type_id) REFERENCES equipment_type(id) NOT VALID;
--rollback ALTER TABLE equipment DROP CONSTRAINT fk_equipment_type;
