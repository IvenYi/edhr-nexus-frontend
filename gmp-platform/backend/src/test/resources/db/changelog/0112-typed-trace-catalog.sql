--liquibase formatted sql
--changeset codex:0112-typed-trace-catalog
ALTER TABLE form_lookup_item DROP CONSTRAINT form_lookup_item_value_type_check;
ALTER TABLE form_lookup_item ADD CONSTRAINT form_lookup_item_value_type_check CHECK (value_type IN ('text','number','date'));
ALTER TABLE form_trace_value ADD COLUMN value_type VARCHAR(16) NOT NULL DEFAULT 'text' CHECK (value_type IN ('text','number','date'));

-- Retire obsolete MVP definitions. Do not guess whether old SN bindings represent the form owner or a component.
-- Saved instance snapshots and their evidence are not rewritten; new designs must select an explicit current meaning.
DELETE FROM form_lookup_item WHERE tenant_id='default' AND builtin=true
    AND id IN ('serialNumberText','lookup_related_batch','teamText','documentNumberText');
