--liquibase formatted sql

--changeset codex:0082-form-instance-records
CREATE SEQUENCE form_instance_number_seq START WITH 1 INCREMENT BY 1;
CREATE TABLE form_instance_record (
    id BIGINT PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    instance_no VARCHAR(64) NOT NULL,
    object_id BIGINT NOT NULL,
    operation_id VARCHAR(192) NOT NULL,
    form_id VARCHAR(192) NOT NULL,
    copy_id VARCHAR(256) NOT NULL,
    template_id BIGINT NOT NULL,
    version_id BIGINT NOT NULL,
    snapshot_json TEXT NOT NULL,
    values_json TEXT NOT NULL,
    status VARCHAR(32) NOT NULL,
    created_by VARCHAR(192),
    created_at TIMESTAMP,
    updated_by VARCHAR(192),
    updated_at TIMESTAMP NOT NULL,
    numbered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    legacy BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_form_instance_number UNIQUE (tenant_id, instance_no),
    CONSTRAINT uk_form_instance_source UNIQUE (tenant_id, object_id, operation_id, copy_id)
);
CREATE INDEX idx_form_instance_template ON form_instance_record(tenant_id, template_id, numbered_at DESC, id DESC);

--changeset codex:0082-form-instance-history dbms:postgresql
-- Index saved historical copies without rewriting execution snapshots or inventing their original author/time.
INSERT INTO form_instance_record
    (id, tenant_id, instance_no, object_id, operation_id, form_id, copy_id, template_id, version_id,
     snapshot_json, values_json, status, updated_at, legacy)
SELECT n.id, source.tenant_id, 'FR-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || lpad(n.id::text, greatest(6, length(n.id::text)), '0'),
       source.id, op->>'id', form->>'id', copy.key, v.template_id, v.id,
       form::text, coalesce(copy.value->'values', '{}'::jsonb)::text,
       coalesce(copy.value->>'status', 'ACTIVE'), (copy.value->>'savedAt')::timestamp, TRUE
FROM production_execution source_execution
JOIN production_object source ON source.id = source_execution.object_id
CROSS JOIN LATERAL jsonb_array_elements(source_execution.snapshot_json::jsonb->'operations') op
CROSS JOIN LATERAL jsonb_array_elements(op->'forms') form
JOIN form_template_version v ON v.id::text = form->>'versionId'
CROSS JOIN LATERAL jsonb_each(coalesce(source_execution.state_json::jsonb->'operations'->(op->>'id')->'forms', '{}'::jsonb)) copy
CROSS JOIN LATERAL (SELECT nextval('form_instance_number_seq') AS id WHERE copy.key IS NOT NULL) n
WHERE NOT jsonb_exists(form, 'fulfilledBy')
  AND jsonb_exists(copy.value, 'savedAt')
  AND (copy.key = form->>'id' OR
       jsonb_exists(source_execution.state_json::jsonb->'operations'->(op->>'id')->'formGroups'->(form->>'id')->'instanceIds', copy.key));

--changeset codex:0082-form-instance-history-audit dbms:postgresql
INSERT INTO audit_event (id, entity_type, entity_id, action, content_after, operator_name, source, module_name, menu_name, function_name, data_summary, created_at)
SELECT nextval('hibernate_sequence'), 'FORM_INSTANCE_RECORD', id::text, 'BASELINE',
       jsonb_build_object('instanceNo', instance_no, 'objectId', object_id::text, 'operationId', operation_id, 'copyId', copy_id, 'legacy', true),
       '系统', 'SYSTEM', '表单', '填报记录', '历史实例编号', instance_no, CURRENT_TIMESTAMP
FROM form_instance_record WHERE legacy = TRUE;
