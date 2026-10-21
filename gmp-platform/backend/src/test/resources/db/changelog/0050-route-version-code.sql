--liquibase formatted sql
--changeset edhr:0050-route-version-code
ALTER TABLE route_version ADD COLUMN IF NOT EXISTS code VARCHAR(64);

UPDATE route_version
SET code = (SELECT r.code FROM route r WHERE r.id = route_version.route_id)
WHERE (code IS NULL OR TRIM(code) = '')
  AND (SELECT COUNT(*) FROM route_version sibling WHERE sibling.route_id = route_version.route_id) = 1
  AND COALESCE((SELECT r.code FROM route r WHERE r.id = route_version.route_id), '') <> '';

UPDATE route_version
SET code = CONCAT('RT-', id)
WHERE code IS NULL OR TRIM(code) = '';

ALTER TABLE route_version ALTER COLUMN code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_route_version_tenant_code ON route_version(tenant_id, code);

ALTER TABLE route ALTER COLUMN code DROP NOT NULL;
