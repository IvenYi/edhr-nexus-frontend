\set ON_ERROR_STOP on
BEGIN;
CREATE SCHEMA form_instance_migration_test;
SET LOCAL search_path TO form_instance_migration_test;
CREATE SEQUENCE hibernate_sequence;
CREATE TABLE production_object(id BIGINT, tenant_id TEXT);
CREATE TABLE production_execution(object_id BIGINT, snapshot_json TEXT, state_json TEXT);
CREATE TABLE form_template_version(id BIGINT, template_id BIGINT);
CREATE TABLE audit_event(id BIGINT, entity_type TEXT, entity_id TEXT, action TEXT, content_after JSONB,
    operator_name TEXT, source TEXT, module_name TEXT, menu_name TEXT, function_name TEXT, data_summary TEXT, created_at TIMESTAMP);
INSERT INTO production_object VALUES(101,'default'),(102,'default');
INSERT INTO form_template_version VALUES(5,5);
INSERT INTO production_execution VALUES(101,
    '{"operations":[{"id":"a","forms":[{"id":"f","versionId":"5","name":"原模板"},{"id":"alias","versionId":"5","fulfilledBy":"f"}]}]}',
    '{"operations":{"a":{"formGroups":{"f":{"instanceIds":["f","f:copy:2","f:copy:3"]}},"forms":{"f":{"savedAt":"2026-09-14T10:00:00","status":"COMPLETED","values":{"v":1}},"f:copy:2":{"savedAt":"2026-09-14T11:00:00","status":"ACTIVE","values":{"v":2}},"f:copy:3":{"status":"ACTIVE","values":{}}}}}}');
INSERT INTO production_execution SELECT 102,snapshot_json,state_json FROM production_execution WHERE object_id=101;
CREATE TEMP TABLE original_execution AS SELECT * FROM production_execution;
\ir ../src/main/resources/db/changelog/0082-form-instance-records.sql
DO $$ BEGIN
    IF (SELECT count(*) FROM form_instance_record) <> 4 THEN RAISE EXCEPTION 'saved copies were not migrated exactly once'; END IF;
    IF (SELECT count(DISTINCT instance_no) FROM form_instance_record) <> 4 THEN RAISE EXCEPTION 'duplicate numbers'; END IF;
    IF EXISTS(SELECT 1 FROM form_instance_record WHERE created_at IS NOT NULL OR created_by IS NOT NULL OR NOT legacy) THEN RAISE EXCEPTION 'invented history'; END IF;
    IF (SELECT count(*) FROM audit_event WHERE action='BASELINE') <> 4 THEN RAISE EXCEPTION 'missing baseline audit'; END IF;
    IF EXISTS((SELECT * FROM production_execution EXCEPT SELECT * FROM original_execution) UNION ALL
              (SELECT * FROM original_execution EXCEPT SELECT * FROM production_execution)) THEN RAISE EXCEPTION 'execution source changed'; END IF;
    IF nextval('form_instance_number_seq') <= (SELECT max(id) FROM form_instance_record) THEN RAISE EXCEPTION 'sequence not advanced'; END IF;
END $$;
ROLLBACK;
\echo 'form instance migration passed; fixture rolled back'
