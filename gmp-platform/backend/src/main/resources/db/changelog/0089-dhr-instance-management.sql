--liquibase formatted sql
--changeset codex:0089-dhr-instance-management

CREATE SEQUENCE dhr_instance_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE dhr_instance (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    dhr_no VARCHAR(64) NOT NULL,
    production_object_id BIGINT NOT NULL,
    object_no VARCHAR(64) NOT NULL,
    object_type VARCHAR(16) NOT NULL,
    work_order_id BIGINT NOT NULL,
    work_order_no VARCHAR(64) NOT NULL,
    product_id BIGINT NOT NULL,
    product_code VARCHAR(128),
    product_name VARCHAR(256),
    process_version_id BIGINT NOT NULL,
    process_version VARCHAR(64),
    route_version_id BIGINT NOT NULL,
    route_version VARCHAR(64),
    route_code VARCHAR(128),
    route_name VARCHAR(256),
    dhr_template_id BIGINT NOT NULL,
    dhr_template_version_id BIGINT NOT NULL,
    dhr_template_version VARCHAR(64),
    dhr_template_code VARCHAR(128),
    dhr_template_name VARCHAR(256),
    context_snapshot TEXT NOT NULL,
    directory_snapshot TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_by VARCHAR(192),
    created_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(192),
    updated_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT uk_dhr_instance_number UNIQUE (tenant_id, dhr_no),
    CONSTRAINT uk_dhr_instance_object UNIQUE (tenant_id, production_object_id),
    CONSTRAINT ck_dhr_instance_object_type CHECK (object_type IN ('BATCH', 'SN')),
    CONSTRAINT ck_dhr_instance_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    CONSTRAINT fk_dhr_instance_object FOREIGN KEY (production_object_id) REFERENCES production_object(id),
    CONSTRAINT fk_dhr_instance_order FOREIGN KEY (work_order_id) REFERENCES work_order(id),
    CONSTRAINT fk_dhr_instance_product FOREIGN KEY (product_id) REFERENCES material(id),
    CONSTRAINT fk_dhr_instance_process FOREIGN KEY (process_version_id) REFERENCES product_process_version(id),
    CONSTRAINT fk_dhr_instance_route FOREIGN KEY (route_version_id) REFERENCES route_version(id),
    CONSTRAINT fk_dhr_instance_template FOREIGN KEY (dhr_template_id) REFERENCES dhr_template(id),
    CONSTRAINT fk_dhr_instance_template_version FOREIGN KEY (dhr_template_version_id) REFERENCES dhr_template_version(id)
);

CREATE INDEX idx_dhr_instance_list
ON dhr_instance(tenant_id, created_at DESC, id DESC);

CREATE INDEX idx_dhr_instance_context
ON dhr_instance(tenant_id, object_type, status, work_order_id);

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'records.dhr-management', 'DHR管理', 'PAGE', 'records', 2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'records.dhr-management');

INSERT INTO permission (id, code, name, type, parent_code, sort_order)
SELECT nextval('hibernate_sequence'), 'dhr.instances.view', 'DHR实例查看', 'BUTTON', 'records.dhr-management', 1
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code = 'dhr.instances.view');

INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence'), r.id, p.id
FROM role r
JOIN permission p ON p.code IN ('records', 'records.dhr-management', 'dhr.instances.view')
WHERE r.code = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
