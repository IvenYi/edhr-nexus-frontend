--liquibase formatted sql
--changeset codex:0094-created-at-schema-compatibility

-- Match existing entity mappings without inventing historical creation times.
ALTER TABLE field_permission_policy ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE form_field ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE form_review_block ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE form_section ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE form_signature_block ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE form_table ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE form_validation_rule ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE process_route_binding ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE route_operation ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
