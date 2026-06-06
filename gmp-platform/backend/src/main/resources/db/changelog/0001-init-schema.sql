--liquibase formatted sql
--changeset edhr:0001-init-schema

-- ============================================================
-- Identity Domain: Tenant, Organization, Users, Roles, Permissions
-- ============================================================

CREATE TABLE IF NOT EXISTS tenant (
    id BIGINT PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_tenant_code ON tenant(code);

CREATE TABLE IF NOT EXISTS site (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    address VARCHAR(512),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_site_code ON site(tenant_id, code);

CREATE TABLE IF NOT EXISTS workshop (
    id BIGINT PRIMARY KEY,
    site_id BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_workshop_code ON workshop(site_id, code);

CREATE TABLE IF NOT EXISTS production_line (
    id BIGINT PRIMARY KEY,
    workshop_id BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_line_code ON production_line(workshop_id, code);

CREATE TABLE IF NOT EXISTS department (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    parent_id BIGINT,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_dept_code ON department(tenant_id, code);

CREATE TABLE IF NOT EXISTS user_account (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    username VARCHAR(128) NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    email VARCHAR(256),
    phone VARCHAR(32),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_username ON user_account(tenant_id, username);

CREATE TABLE IF NOT EXISTS user_department (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_dept ON user_department(user_id, department_id);

CREATE TABLE IF NOT EXISTS role (
    id BIGINT PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 0,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_role_code ON role(tenant_id, code);

CREATE TABLE IF NOT EXISTS permission (
    id BIGINT PRIMARY KEY,
    code VARCHAR(128) NOT NULL,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'PAGE',
    parent_code VARCHAR(128),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_permission_code ON permission(code);

CREATE TABLE IF NOT EXISTS role_permission (
    id BIGINT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_role_perm ON role_permission(role_id, permission_id);

CREATE TABLE IF NOT EXISTS user_role (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_user_role ON user_role(user_id, role_id);

CREATE TABLE IF NOT EXISTS data_scope_policy (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    scope_type VARCHAR(32) NOT NULL DEFAULT 'SELF',
    entity_type VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Compliance Domain: Audit, Signature, File, Numbering
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_event (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    entity_type VARCHAR(128) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    content_before JSONB,
    content_after JSONB,
    operator_id VARCHAR(64),
    operator_name VARCHAR(128),
    source VARCHAR(32) NOT NULL DEFAULT 'UI',
    reason TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_event(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_operator ON audit_event(operator_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_event(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_event(created_at);

CREATE TABLE IF NOT EXISTS signature (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    meaning VARCHAR(64) NOT NULL,
    signer_id VARCHAR(64) NOT NULL,
    signer_name VARCHAR(128) NOT NULL,
    auth_method VARCHAR(32) NOT NULL DEFAULT 'PASSWORD',
    auth_event_ref VARCHAR(256),
    snapshot_hash VARCHAR(256),
    snapshot_data JSONB,
    signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sig_target ON signature(target_type, target_id);

CREATE TABLE IF NOT EXISTS file_object (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    original_name VARCHAR(512) NOT NULL,
    stored_path VARCHAR(1024) NOT NULL,
    mime_type VARCHAR(128),
    file_size BIGINT NOT NULL DEFAULT 0,
    md5_hash VARCHAR(64),
    target_type VARCHAR(64),
    target_id VARCHAR(64),
    uploaded_by VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_file_target ON file_object(target_type, target_id);

CREATE TABLE IF NOT EXISTS numbering_rule (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    business_type VARCHAR(64) NOT NULL,
    template VARCHAR(256) NOT NULL,
    reset_strategy VARCHAR(32) NOT NULL DEFAULT 'DAILY',
    seq_length INTEGER NOT NULL DEFAULT 4,
    current_seq INTEGER NOT NULL DEFAULT 0,
    last_reset_value VARCHAR(32),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_numbering_type ON numbering_rule(tenant_id, business_type);

CREATE TABLE IF NOT EXISTS controlled_reason (
    id BIGINT PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    description VARCHAR(512) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'CHANGE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_reason_code ON controlled_reason(code);

-- ============================================================
-- Workflow Domain: Definition, Version, Node, Edge, Binding, Instance, Task, Log
-- ============================================================

CREATE TABLE IF NOT EXISTS workflow_definition (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    name VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'REVIEW',
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_definition_version (
    id BIGINT PRIMARY KEY,
    definition_id BIGINT NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    nodes_json JSONB,
    edges_json JSONB,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_wf_def_version ON workflow_definition_version(definition_id, version_number);

CREATE TABLE IF NOT EXISTS workflow_node (
    id BIGINT PRIMARY KEY,
    version_id BIGINT NOT NULL,
    node_type VARCHAR(32) NOT NULL,
    name VARCHAR(256) NOT NULL,
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    properties JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workflow_edge (
    id BIGINT PRIMARY KEY,
    version_id BIGINT NOT NULL,
    source_node_id BIGINT NOT NULL,
    target_node_id BIGINT NOT NULL,
    label VARCHAR(256),
    condition_expression JSONB
);

CREATE TABLE IF NOT EXISTS workflow_binding_rule (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    business_type VARCHAR(64) NOT NULL,
    definition_id BIGINT NOT NULL,
    version_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_instance (
    id BIGINT PRIMARY KEY,
    definition_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    business_type VARCHAR(64),
    business_id VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
    current_node_ids VARCHAR(1024),
    context_snapshot JSONB,
    initiator_id VARCHAR(64),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wf_instance_biz ON workflow_instance(business_type, business_id);
CREATE INDEX IF NOT EXISTS idx_wf_instance_status ON workflow_instance(status);

CREATE TABLE IF NOT EXISTS workflow_task (
    id BIGINT PRIMARY KEY,
    instance_id BIGINT NOT NULL,
    node_id BIGINT NOT NULL,
    task_type VARCHAR(32) NOT NULL DEFAULT 'TODO',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    assignee_id VARCHAR(64),
    original_assignee_id VARCHAR(64),
    action VARCHAR(32),
    opinion TEXT,
    signature_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wf_task_assignee ON workflow_task(assignee_id);
CREATE INDEX IF NOT EXISTS idx_wf_task_instance ON workflow_task(instance_id);
CREATE INDEX IF NOT EXISTS idx_wf_task_status ON workflow_task(status);

CREATE TABLE IF NOT EXISTS workflow_action_log (
    id BIGINT PRIMARY KEY,
    instance_id BIGINT NOT NULL,
    task_id BIGINT,
    node_id VARCHAR(64),
    action VARCHAR(32) NOT NULL,
    operator_id VARCHAR(64),
    operator_name VARCHAR(128),
    comment TEXT,
    snapshot JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_wf_log_instance ON workflow_action_log(instance_id);

CREATE TABLE IF NOT EXISTS workflow_intervention (
    id BIGINT PRIMARY KEY,
    instance_id BIGINT NOT NULL,
    action VARCHAR(32) NOT NULL,
    operator_id VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    signature_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MasterData Domain: Product, Equipment, Operation, Route, SOP
-- ============================================================

CREATE TABLE IF NOT EXISTS product_family (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_pf_code ON product_family(tenant_id, code);

CREATE TABLE IF NOT EXISTS product (
    id BIGINT PRIMARY KEY,
    family_id BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_prod_code ON product(family_id, code);

CREATE TABLE IF NOT EXISTS product_version (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    version_number VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    effective_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS unit_of_measure (
    id BIGINT PRIMARY KEY,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(64) NOT NULL,
    symbol VARCHAR(16),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_uom_code ON unit_of_measure(code);

CREATE TABLE IF NOT EXISTS sop_document (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    title VARCHAR(256) NOT NULL,
    version VARCHAR(32),
    file_reference VARCHAR(1024),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_sop_code ON sop_document(tenant_id, code);

CREATE TABLE IF NOT EXISTS equipment_type (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_eqtype_code ON equipment_type(tenant_id, code);

CREATE TABLE IF NOT EXISTS equipment (
    id BIGINT PRIMARY KEY,
    equipment_type_id BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    model VARCHAR(128),
    serial_number VARCHAR(128),
    site_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_eq_code ON equipment(code);

CREATE TABLE IF NOT EXISTS operation (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    default_duration_minutes INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_op_code ON operation(tenant_id, code);

CREATE TABLE IF NOT EXISTS route (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    product_family_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_route_code ON route(tenant_id, code);

CREATE TABLE IF NOT EXISTS route_operation (
    id BIGINT PRIMARY KEY,
    route_id BIGINT NOT NULL,
    operation_id BIGINT NOT NULL,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_route_op ON route_operation(route_id, operation_id);

-- ============================================================
-- Template Domain: Form Templates, DHR Templates, Release, Traveler
-- ============================================================

CREATE TABLE IF NOT EXISTS form_template (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'FORM',
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_ft_code ON form_template(tenant_id, code);

CREATE TABLE IF NOT EXISTS form_template_version (
    id BIGINT PRIMARY KEY,
    template_id BIGINT NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    structure_snapshot JSONB,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_ftv ON form_template_version(template_id, version_number);

CREATE TABLE IF NOT EXISTS form_section (
    id BIGINT PRIMARY KEY,
    version_id BIGINT NOT NULL,
    name VARCHAR(256) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_repeatable BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS form_field (
    id BIGINT PRIMARY KEY,
    section_id BIGINT NOT NULL,
    field_code VARCHAR(64) NOT NULL,
    field_name VARCHAR(128) NOT NULL,
    field_type VARCHAR(32) NOT NULL DEFAULT 'TEXT',
    options JSONB,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_field_code ON form_field(section_id, field_code);

CREATE TABLE IF NOT EXISTS form_table (
    id BIGINT PRIMARY KEY,
    section_id BIGINT NOT NULL,
    table_code VARCHAR(64) NOT NULL,
    table_name VARCHAR(128),
    columns_definition JSONB,
    min_rows INTEGER NOT NULL DEFAULT 0,
    max_rows INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS form_validation_rule (
    id BIGINT PRIMARY KEY,
    field_id BIGINT NOT NULL,
    rule_type VARCHAR(32) NOT NULL,
    rule_config JSONB,
    error_message VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS form_signature_block (
    id BIGINT PRIMARY KEY,
    version_id BIGINT NOT NULL,
    block_name VARCHAR(128) NOT NULL,
    meaning VARCHAR(64),
    position INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS form_review_block (
    id BIGINT PRIMARY KEY,
    version_id BIGINT NOT NULL,
    review_type VARCHAR(64),
    reviewer_config VARCHAR(512),
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS field_permission_policy (
    id BIGINT PRIMARY KEY,
    workflow_node_id BIGINT NOT NULL,
    field_id BIGINT NOT NULL,
    permission_level VARCHAR(16) NOT NULL DEFAULT 'EDIT'
);

CREATE TABLE IF NOT EXISTS dhr_template (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    product_family_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_dhr_code ON dhr_template(tenant_id, code);

CREATE TABLE IF NOT EXISTS dhr_template_version (
    id BIGINT PRIMARY KEY,
    dhr_template_id BIGINT NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    directory_snapshot JSONB,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dhr_directory (
    id BIGINT PRIMARY KEY,
    version_id BIGINT NOT NULL,
    name VARCHAR(256) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    parent_id BIGINT
);

CREATE TABLE IF NOT EXISTS dhr_template_item (
    id BIGINT PRIMARY KEY,
    directory_id BIGINT NOT NULL,
    form_template_id BIGINT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS release_form_template (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    dhr_template_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_rft_code ON release_form_template(tenant_id, code);

CREATE TABLE IF NOT EXISTS traveler_template (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    route_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_tt_code ON traveler_template(tenant_id, code);

-- ============================================================
-- Process Domain (Phase 0: schema only, no CRUD)
-- ============================================================

CREATE TABLE IF NOT EXISTS process_definition (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    product_family_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_pd_code ON process_definition(tenant_id, code);

CREATE TABLE IF NOT EXISTS process_definition_version (
    id BIGINT PRIMARY KEY,
    process_definition_id BIGINT NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS process_route_binding (
    id BIGINT PRIMARY KEY,
    process_version_id BIGINT NOT NULL,
    route_id BIGINT NOT NULL,
    sequence_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS batch (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    code VARCHAR(64) NOT NULL,
    product_version_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    planned_quantity DECIMAL(15, 4),
    actual_quantity DECIMAL(15, 4),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_batch_code ON batch(tenant_id, code);

CREATE TABLE IF NOT EXISTS serial_number (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    sn VARCHAR(128) NOT NULL,
    product_version_id BIGINT,
    batch_id BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_sn ON serial_number(tenant_id, sn);

-- ============================================================
-- Rollback
-- ============================================================
-- rollback DROP TABLE IF EXISTS
--     serial_number, batch, process_route_binding, process_definition_version,
--     process_definition, traveler_template, release_form_template, dhr_template_item,
--     dhr_directory, dhr_template_version, dhr_template, field_permission_policy,
--     form_review_block, form_signature_block, form_validation_rule, form_table,
--     form_field, form_section, form_template_version, form_template,
--     route_operation, route, operation, equipment, equipment_type, sop_document,
--     unit_of_measure, product_version, product, product_family,
--     workflow_intervention, workflow_action_log, workflow_task, workflow_instance,
--     workflow_binding_rule, workflow_edge, workflow_node, workflow_definition_version,
--     workflow_definition, controlled_reason, numbering_rule, file_object, signature,
--     audit_event, data_scope_policy, user_role, role_permission, permission, role,
--     user_department, user_account, department, production_line, workshop, site, tenant
--     CASCADE;
