--liquibase formatted sql
--changeset codex:0086-reference-id splitStatements:false
CREATE FUNCTION deletion_reference_id(value TEXT) RETURNS BIGINT LANGUAGE sql IMMUTABLE STRICT AS $$
    SELECT CASE WHEN value ~ '^-?[0-9]{1,19}$' THEN
        CASE WHEN value::NUMERIC BETWEEN -9223372036854775808 AND 9223372036854775807 THEN value::BIGINT END
    END;
$$;

--changeset codex:0086-master-data-reference-constraints
--validCheckSum: 9:add5b4810548a5dd528f04cf1c6a4eaa
-- NOT VALID keeps legacy orphan rows; PostgreSQL enforces new references and future deletes.
ALTER TABLE work_order ADD CONSTRAINT fk_delete_guard_000 FOREIGN KEY (product_id) REFERENCES material(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE workflow_binding_rule ADD CONSTRAINT fk_delete_guard_002 FOREIGN KEY (product_id) REFERENCES material(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product ADD CONSTRAINT fk_delete_guard_004 FOREIGN KEY (family_id) REFERENCES product_family(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE route ADD COLUMN deletion_family_id BIGINT GENERATED ALWAYS AS (deletion_reference_id(product_family_id)) STORED;
ALTER TABLE route ADD CONSTRAINT fk_delete_guard_005 FOREIGN KEY (deletion_family_id) REFERENCES product_family(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE dhr_template ADD CONSTRAINT fk_delete_guard_006 FOREIGN KEY (product_family_id) REFERENCES product_family(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE process_definition ADD CONSTRAINT fk_delete_guard_007 FOREIGN KEY (product_family_id) REFERENCES product_family(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE workflow_binding_rule ADD CONSTRAINT fk_delete_guard_008 FOREIGN KEY (product_family_id) REFERENCES product_family(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product_version ADD CONSTRAINT fk_delete_guard_009 FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE batch ADD CONSTRAINT fk_delete_guard_010 FOREIGN KEY (product_version_id) REFERENCES product_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE serial_number ADD CONSTRAINT fk_delete_guard_011 FOREIGN KEY (product_version_id) REFERENCES product_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product_process_version ADD CONSTRAINT fk_delete_guard_012 FOREIGN KEY (product_process_id) REFERENCES product_process(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE work_order ADD CONSTRAINT fk_delete_guard_013 FOREIGN KEY (process_version_id) REFERENCES product_process_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE production_object ADD CONSTRAINT fk_delete_guard_014 FOREIGN KEY (process_version_id) REFERENCES product_process_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product_process_operation_binding ADD CONSTRAINT fk_delete_guard_015 FOREIGN KEY (product_process_version_id) REFERENCES product_process_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process_operation_document_binding ADD CONSTRAINT fk_delete_guard_016 FOREIGN KEY (product_process_operation_binding_id) REFERENCES product_process_operation_binding(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process_operation_form_binding ADD CONSTRAINT fk_delete_guard_017 FOREIGN KEY (product_process_operation_binding_id) REFERENCES product_process_operation_binding(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process_operation_sop_binding ADD CONSTRAINT fk_delete_guard_018 FOREIGN KEY (product_process_operation_binding_id) REFERENCES product_process_operation_binding(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE route_node ADD CONSTRAINT fk_delete_guard_019 FOREIGN KEY (operation_id) REFERENCES operation(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE route_operation ADD CONSTRAINT fk_delete_guard_020 FOREIGN KEY (operation_id) REFERENCES operation(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product_process_operation_binding ADD CONSTRAINT fk_delete_guard_021 FOREIGN KEY (operation_id) REFERENCES operation(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE workflow_binding_rule ADD CONSTRAINT fk_delete_guard_022 FOREIGN KEY (operation_id) REFERENCES operation(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE route_version ADD CONSTRAINT fk_delete_guard_025 FOREIGN KEY (route_id) REFERENCES route(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE route_operation ADD CONSTRAINT fk_delete_guard_026 FOREIGN KEY (route_id) REFERENCES route(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE process_route_binding ADD CONSTRAINT fk_delete_guard_027 FOREIGN KEY (route_id) REFERENCES route(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE traveler_template ADD CONSTRAINT fk_delete_guard_028 FOREIGN KEY (route_id) REFERENCES route(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE route_node ADD CONSTRAINT fk_delete_guard_029 FOREIGN KEY (route_version_id) REFERENCES route_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE route_relation ADD CONSTRAINT fk_delete_guard_030 FOREIGN KEY (route_version_id) REFERENCES route_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process_version ADD CONSTRAINT fk_delete_guard_031 FOREIGN KEY (route_version_id) REFERENCES route_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE document_version ADD CONSTRAINT fk_delete_guard_032 FOREIGN KEY (document_id) REFERENCES sop_document(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process_operation_sop_binding ADD CONSTRAINT fk_delete_guard_033 FOREIGN KEY (sop_document_id) REFERENCES sop_document(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product_process_operation_document_binding ADD CONSTRAINT fk_delete_guard_034 FOREIGN KEY (document_version_id) REFERENCES document_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE sop_document ADD CONSTRAINT fk_delete_guard_035 FOREIGN KEY (category_id) REFERENCES document_category(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE form_template_version ADD CONSTRAINT fk_delete_guard_036 FOREIGN KEY (template_id) REFERENCES form_template(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE dhr_template_item ADD CONSTRAINT fk_delete_guard_037 FOREIGN KEY (form_template_id) REFERENCES form_template(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE form_instance_record ADD CONSTRAINT fk_delete_guard_039 FOREIGN KEY (template_id) REFERENCES form_template(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE IF EXISTS form_template_analysis ADD CONSTRAINT fk_delete_guard_040 FOREIGN KEY (template_id) REFERENCES form_template(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE IF EXISTS form_template_source_revision ADD CONSTRAINT fk_delete_guard_041 FOREIGN KEY (template_id) REFERENCES form_template(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE dhr_template_item ADD CONSTRAINT fk_delete_guard_042 FOREIGN KEY (form_template_version_id) REFERENCES form_template_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product_process_operation_form_binding ADD CONSTRAINT fk_delete_guard_043 FOREIGN KEY (form_template_version_id) REFERENCES form_template_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE work_form_process_reference ADD CONSTRAINT fk_delete_guard_044 FOREIGN KEY (form_template_version_id) REFERENCES form_template_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE form_instance_record ADD CONSTRAINT fk_delete_guard_047 FOREIGN KEY (version_id) REFERENCES form_template_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE form_section ADD CONSTRAINT fk_delete_guard_048 FOREIGN KEY (version_id) REFERENCES form_template_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE form_signature_block ADD CONSTRAINT fk_delete_guard_049 FOREIGN KEY (version_id) REFERENCES form_template_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE form_review_block ADD CONSTRAINT fk_delete_guard_050 FOREIGN KEY (version_id) REFERENCES form_template_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE IF EXISTS form_template_analysis ADD CONSTRAINT fk_delete_guard_051 FOREIGN KEY (version_id) REFERENCES form_template_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE IF EXISTS form_template_source_revision ADD CONSTRAINT fk_delete_guard_052 FOREIGN KEY (version_id) REFERENCES form_template_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE form_field ADD CONSTRAINT fk_delete_guard_053 FOREIGN KEY (section_id) REFERENCES form_section(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE form_table ADD CONSTRAINT fk_delete_guard_054 FOREIGN KEY (section_id) REFERENCES form_section(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE form_validation_rule ADD CONSTRAINT fk_delete_guard_055 FOREIGN KEY (field_id) REFERENCES form_field(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE dhr_template_version ADD CONSTRAINT fk_delete_guard_057 FOREIGN KEY (dhr_template_id) REFERENCES dhr_template(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE release_form_template ADD CONSTRAINT fk_delete_guard_059 FOREIGN KEY (dhr_template_id) REFERENCES dhr_template(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE dhr_directory ADD CONSTRAINT fk_delete_guard_060 FOREIGN KEY (version_id) REFERENCES dhr_template_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process_version ADD CONSTRAINT fk_delete_guard_061 FOREIGN KEY (dhr_template_version_id) REFERENCES dhr_template_version(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE dhr_directory ADD CONSTRAINT fk_delete_guard_063 FOREIGN KEY (parent_id) REFERENCES dhr_directory(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE dhr_template_item ADD CONSTRAINT fk_delete_guard_064 FOREIGN KEY (directory_id) REFERENCES dhr_directory(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process_operation_form_binding ADD CONSTRAINT fk_delete_guard_066 FOREIGN KEY (dhr_template_item_id) REFERENCES dhr_template_item(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE IF EXISTS dhr_evidence_item ADD CONSTRAINT fk_delete_guard_067 FOREIGN KEY (dhr_template_item_id) REFERENCES dhr_template_item(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE form_instance_record ADD CONSTRAINT fk_delete_guard_073 FOREIGN KEY (object_id) REFERENCES production_object(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE serial_number ADD CONSTRAINT fk_delete_guard_074 FOREIGN KEY (batch_id) REFERENCES batch(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE product_process ADD COLUMN deletion_product_owner_id BIGINT GENERATED ALWAYS AS (CASE WHEN owner_type = 'PRODUCT' THEN owner_id END) STORED;
ALTER TABLE product_process ADD COLUMN deletion_family_owner_id BIGINT GENERATED ALWAYS AS (CASE WHEN owner_type = 'PRODUCT_FAMILY' THEN owner_id END) STORED;
ALTER TABLE product_process ADD CONSTRAINT fk_delete_product_owner FOREIGN KEY (deletion_product_owner_id) REFERENCES material(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE product_process ADD CONSTRAINT fk_delete_family_owner FOREIGN KEY (deletion_family_owner_id) REFERENCES product_family(id) ON DELETE CASCADE NOT VALID;

--changeset codex:0086-form-reference-index
-- Both draft work graphs and frozen execution forms can hold references outside binding tables.
CREATE TABLE deletion_form_reference (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    workflow_version_id BIGINT,
    object_id BIGINT,
    form_template_version_id BIGINT NOT NULL,
    CHECK ((workflow_version_id IS NULL) <> (object_id IS NULL)),
    UNIQUE (workflow_version_id, form_template_version_id),
    UNIQUE (object_id, form_template_version_id)
);
CREATE INDEX idx_deletion_form_target ON deletion_form_reference(form_template_version_id);
INSERT INTO deletion_form_reference (workflow_version_id, form_template_version_id)
SELECT DISTINCT v.id, deletion_reference_id(value #>> '{}')
FROM workflow_definition_version v
CROSS JOIN LATERAL jsonb_path_query(v.nodes_json, '$.**.formTemplateVersionId') value
WHERE deletion_reference_id(value #>> '{}') IS NOT NULL;
INSERT INTO deletion_form_reference (object_id, form_template_version_id)
SELECT DISTINCT e.object_id, deletion_reference_id(value #>> '{}')
FROM production_execution e
CROSS JOIN LATERAL jsonb_path_query(e.snapshot_json::jsonb, '$.operations[*].forms[*].versionId') value
WHERE deletion_reference_id(value #>> '{}') IS NOT NULL;
ALTER TABLE deletion_form_reference ADD CONSTRAINT fk_deletion_form_workflow FOREIGN KEY (workflow_version_id) REFERENCES workflow_definition_version(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE deletion_form_reference ADD CONSTRAINT fk_deletion_form_object FOREIGN KEY (object_id) REFERENCES production_object(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE deletion_form_reference ADD CONSTRAINT fk_deletion_form_version FOREIGN KEY (form_template_version_id) REFERENCES form_template_version(id) ON DELETE RESTRICT NOT VALID;

--changeset codex:0086-form-reference-sync splitStatements:false
CREATE FUNCTION sync_deletion_form_references() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME = 'workflow_definition_version' THEN
        DELETE FROM deletion_form_reference WHERE workflow_version_id = NEW.id
          AND form_template_version_id NOT IN (
            SELECT deletion_reference_id(value #>> '{}') FROM jsonb_path_query(NEW.nodes_json, '$.**.formTemplateVersionId') value
            WHERE deletion_reference_id(value #>> '{}') IS NOT NULL);
        INSERT INTO deletion_form_reference (workflow_version_id, form_template_version_id)
        SELECT DISTINCT NEW.id, deletion_reference_id(value #>> '{}') FROM jsonb_path_query(NEW.nodes_json, '$.**.formTemplateVersionId') value
        WHERE deletion_reference_id(value #>> '{}') IS NOT NULL
        ON CONFLICT (workflow_version_id, form_template_version_id) DO NOTHING;
    ELSE
        DELETE FROM deletion_form_reference WHERE object_id = NEW.object_id
          AND form_template_version_id NOT IN (
            SELECT deletion_reference_id(value #>> '{}') FROM jsonb_path_query(NEW.snapshot_json::jsonb, '$.operations[*].forms[*].versionId') value
            WHERE deletion_reference_id(value #>> '{}') IS NOT NULL);
        INSERT INTO deletion_form_reference (object_id, form_template_version_id)
        SELECT DISTINCT NEW.object_id, deletion_reference_id(value #>> '{}') FROM jsonb_path_query(NEW.snapshot_json::jsonb, '$.operations[*].forms[*].versionId') value
        WHERE deletion_reference_id(value #>> '{}') IS NOT NULL
        ON CONFLICT (object_id, form_template_version_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

--changeset codex:0086-form-reference-triggers
CREATE TRIGGER deletion_work_form_references AFTER INSERT OR UPDATE OF nodes_json ON workflow_definition_version
FOR EACH ROW EXECUTE FUNCTION sync_deletion_form_references();
CREATE TRIGGER deletion_execution_form_references AFTER INSERT OR UPDATE OF snapshot_json ON production_execution
FOR EACH ROW EXECUTE FUNCTION sync_deletion_form_references();

--changeset codex:0086-named-category-references
-- These older classifications store names. Deferred FKs preserve transactional category renaming.
ALTER TABLE operation_category ADD COLUMN deletion_name VARCHAR GENERATED ALWAYS AS (lower(name)) STORED;
ALTER TABLE operation_category ADD CONSTRAINT uk_deletion_operation_category UNIQUE (tenant_id, deletion_name);
ALTER TABLE operation ADD COLUMN deletion_category_name VARCHAR GENERATED ALWAYS AS (NULLIF(lower(operation_category), '')) STORED;
ALTER TABLE operation ADD CONSTRAINT fk_deletion_operation_category FOREIGN KEY (tenant_id, deletion_category_name)
REFERENCES operation_category(tenant_id, deletion_name) DEFERRABLE INITIALLY DEFERRED NOT VALID;
ALTER TABLE template_category ADD COLUMN deletion_name VARCHAR GENERATED ALWAYS AS (lower(name)) STORED;
ALTER TABLE template_category ADD CONSTRAINT uk_deletion_template_category UNIQUE (tenant_id, template_type, deletion_name);
ALTER TABLE form_template ADD COLUMN deletion_category_type VARCHAR GENERATED ALWAYS AS ('FORM') STORED;
ALTER TABLE form_template ADD COLUMN deletion_category_name VARCHAR GENERATED ALWAYS AS (NULLIF(lower(category_name), '')) STORED;
ALTER TABLE dhr_template ADD COLUMN deletion_category_type VARCHAR GENERATED ALWAYS AS ('DHR') STORED;
ALTER TABLE dhr_template ADD COLUMN deletion_category_name VARCHAR GENERATED ALWAYS AS (NULLIF(lower(category_name), '')) STORED;
ALTER TABLE form_template ADD CONSTRAINT fk_deletion_form_category FOREIGN KEY (tenant_id, deletion_category_type, deletion_category_name)
REFERENCES template_category(tenant_id, template_type, deletion_name) DEFERRABLE INITIALLY DEFERRED NOT VALID;
ALTER TABLE dhr_template ADD CONSTRAINT fk_deletion_dhr_category FOREIGN KEY (tenant_id, deletion_category_type, deletion_category_name)
REFERENCES template_category(tenant_id, template_type, deletion_name) DEFERRABLE INITIALLY DEFERRED NOT VALID;
