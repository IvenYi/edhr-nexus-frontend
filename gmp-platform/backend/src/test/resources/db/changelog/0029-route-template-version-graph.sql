ALTER TABLE route ADD COLUMN IF NOT EXISTS common_asset BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS route_version (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    route_id BIGINT NOT NULL,
    version VARCHAR(64) NOT NULL,
    version_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    effective_date TIMESTAMP,
    expiry_date TIMESTAMP,
    created_by VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(128),
    updated_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_route_version ON route_version(route_id, version);
CREATE INDEX IF NOT EXISTS idx_route_version_route_id ON route_version(route_id);

CREATE TABLE IF NOT EXISTS route_node (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    route_version_id BIGINT NOT NULL,
    node_key VARCHAR(128) NOT NULL,
    operation_id BIGINT,
    operation_code VARCHAR(64),
    operation_name VARCHAR(128),
    node_type VARCHAR(32) NOT NULL DEFAULT 'OPERATION',
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    config_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_route_node_key ON route_node(route_version_id, node_key);
CREATE INDEX IF NOT EXISTS idx_route_node_version_id ON route_node(route_version_id);

CREATE TABLE IF NOT EXISTS route_relation (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) DEFAULT 'default',
    route_version_id BIGINT NOT NULL,
    source_node_key VARCHAR(128) NOT NULL,
    target_node_key VARCHAR(128) NOT NULL,
    relation_type VARCHAR(32) NOT NULL,
    label VARCHAR(128),
    rule_expression TEXT,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_route_relation_version_id ON route_relation(route_version_id);
CREATE INDEX IF NOT EXISTS idx_route_relation_type ON route_relation(relation_type);
