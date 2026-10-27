--liquibase formatted sql
--changeset edhr:1.0-current-schema splitStatements:false
--preconditions onFail:HALT onError:HALT
--precondition-sql-check expectedResult:0 SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name NOT IN ('databasechangelog','databasechangeloglock');
-- First-release schema. Derived from an empty installation at d405a9af, not a business-data dump.
-- Foreign keys are valid immediately; no legacy preparation, data conversion or checksum aliases.
CREATE TABLE public.quality_reason (
    id bigint PRIMARY KEY,
    tenant_id varchar(64) NOT NULL DEFAULT 'default',
    reason_type varchar(16) NOT NULL CHECK (reason_type IN ('DEFECT', 'SCRAP')),
    code varchar(64) NOT NULL CHECK (BTRIM(code) <> ''),
    name varchar(128) NOT NULL CHECK (BTRIM(name) <> ''),
    description varchar(512),
    status varchar(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    sort_order integer NOT NULL DEFAULT 0,
    created_by varchar(192),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by varchar(192),
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uk_quality_reason_code ON public.quality_reason (tenant_id, reason_type, LOWER(code));
CREATE INDEX idx_quality_reason_list ON public.quality_reason (tenant_id, reason_type, status, sort_order);

CREATE FUNCTION public.deletion_reference_id(value text) RETURNS bigint
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
    SELECT CASE WHEN value ~ '^-?[0-9]{1,19}$' THEN
        CASE WHEN value::NUMERIC BETWEEN -9223372036854775808 AND 9223372036854775807 THEN value::BIGINT END
    END;
$_$;

CREATE FUNCTION public.sync_deletion_form_references() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
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
$_$;

CREATE TABLE public.audit_event (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    entity_type character varying(128) NOT NULL,
    entity_id character varying(128) NOT NULL,
    action character varying(64) NOT NULL,
    content_before jsonb,
    content_after jsonb,
    operator_id character varying(64),
    operator_name character varying(128),
    source character varying(32) DEFAULT 'UI'::character varying NOT NULL,
    reason text,
    ip_address character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    operator_account character varying(128),
    module_name character varying(128),
    menu_name character varying(128),
    function_name character varying(128),
    data_summary character varying(512),
    snapshot_hash character varying(64)
);

CREATE TABLE public.batch (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    product_version_id bigint,
    status character varying(32) DEFAULT 'NOT_STARTED'::character varying NOT NULL,
    planned_quantity numeric(15,4),
    actual_quantity numeric(15,4),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.business_dictionary (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    description character varying(512),
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    builtin boolean DEFAULT false NOT NULL,
    created_by character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(64),
    updated_at timestamp without time zone
);

CREATE TABLE public.business_dictionary_item (
    id bigint NOT NULL,
    dictionary_id bigint NOT NULL,
    value character varying(128) NOT NULL,
    label character varying(128) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    remark character varying(512),
    builtin boolean DEFAULT false NOT NULL,
    created_by character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(64),
    updated_at timestamp without time zone
);

CREATE TABLE public.controlled_reason (
    id bigint NOT NULL,
    code character varying(64) NOT NULL,
    description character varying(512) NOT NULL,
    category character varying(32) DEFAULT 'CHANGE'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.data_scope_policy (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    scope_type character varying(32) DEFAULT 'SELF'::character varying NOT NULL,
    entity_type character varying(64) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.deletion_form_reference (
    id bigint NOT NULL,
    workflow_version_id bigint,
    object_id bigint,
    form_template_version_id bigint NOT NULL,
    CONSTRAINT deletion_form_reference_check CHECK (((workflow_version_id IS NULL) <> (object_id IS NULL)))
);

ALTER TABLE public.deletion_form_reference ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.deletion_form_reference_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE public.department (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    parent_id bigint,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.dhr_attachment (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    dhr_instance_id bigint NOT NULL,
    original_name character varying(512) NOT NULL,
    stored_path character varying(1024) NOT NULL,
    mime_type character varying(128) NOT NULL,
    file_size bigint NOT NULL,
    sha256 character varying(64) NOT NULL,
    source_kind character varying(32) NOT NULL,
    purpose character varying(500) NOT NULL,
    original_recorded_at timestamp without time zone,
    custody_location character varying(500),
    active boolean DEFAULT true NOT NULL,
    verification_status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    verified_by character varying(192),
    verified_at timestamp without time zone,
    linked_by character varying(192),
    linked_at timestamp without time zone NOT NULL,
    unlinked_by character varying(192),
    unlinked_at timestamp without time zone,
    unlink_reason character varying(500),
    CONSTRAINT ck_dhr_attachment_source CHECK (((source_kind)::text = ANY ((ARRAY['EXTERNAL_REPORT'::character varying, 'CERTIFICATE'::character varying, 'PAPER_SCAN'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT ck_dhr_attachment_verification CHECK (((verification_status)::text = ANY ((ARRAY['PENDING'::character varying, 'VERIFIED'::character varying, 'REJECTED'::character varying])::text[])))
);

CREATE TABLE public.dhr_directory (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    name character varying(256) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    parent_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.dhr_instance (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    dhr_no character varying(64) NOT NULL,
    production_object_id bigint NOT NULL,
    object_no character varying(64) NOT NULL,
    object_type character varying(16) NOT NULL,
    work_order_id bigint NOT NULL,
    work_order_no character varying(64) NOT NULL,
    product_id bigint NOT NULL,
    product_code character varying(128),
    product_name character varying(256),
    process_version_id bigint NOT NULL,
    process_version character varying(64),
    route_version_id bigint NOT NULL,
    route_version character varying(64),
    route_code character varying(128),
    route_name character varying(256),
    dhr_template_id bigint NOT NULL,
    dhr_template_version_id bigint NOT NULL,
    dhr_template_version character varying(64),
    dhr_template_code character varying(128),
    dhr_template_name character varying(256),
    context_snapshot text NOT NULL,
    directory_snapshot text NOT NULL,
    status character varying(32) NOT NULL,
    created_by character varying(192),
    created_at timestamp without time zone NOT NULL,
    updated_by character varying(192),
    updated_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    summary_status character varying(24) DEFAULT 'NOT_STARTED'::character varying NOT NULL,
    dhr_review_mode character varying(16) DEFAULT 'NONE'::character varying NOT NULL,
    dhr_review_workflow_definition_id bigint,
    dhr_review_workflow_version_id bigint,
    CONSTRAINT ck_dhr_instance_object_type CHECK (((object_type)::text = ANY ((ARRAY['BATCH'::character varying, 'SN'::character varying])::text[]))),
    CONSTRAINT ck_dhr_instance_review_binding CHECK (((((dhr_review_mode)::text = 'NONE'::text) AND (dhr_review_workflow_definition_id IS NULL) AND (dhr_review_workflow_version_id IS NULL)) OR (((dhr_review_mode)::text = 'REQUIRED'::text) AND (dhr_review_workflow_definition_id IS NOT NULL) AND (dhr_review_workflow_version_id IS NOT NULL)))),
    CONSTRAINT ck_dhr_instance_review_mode CHECK (((dhr_review_mode)::text = ANY ((ARRAY['NONE'::character varying, 'REQUIRED'::character varying])::text[]))),
    CONSTRAINT ck_dhr_instance_status CHECK (((status)::text = ANY ((ARRAY['IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'EARLY_TERMINATED'::character varying])::text[]))),
    CONSTRAINT ck_dhr_instance_summary_status CHECK (((summary_status)::text = ANY ((ARRAY['NOT_STARTED'::character varying, 'DRAFT'::character varying, 'PENDING_REVIEW'::character varying, 'FORMALIZED'::character varying])::text[])))
);

CREATE SEQUENCE public.dhr_instance_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.dhr_summary_draft (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    dhr_instance_id bigint NOT NULL,
    overlay_directory_json text NOT NULL,
    evidence_placement_json text NOT NULL,
    revision integer DEFAULT 1 NOT NULL,
    created_by character varying(192),
    created_at timestamp without time zone NOT NULL,
    updated_by character varying(192),
    updated_at timestamp without time zone NOT NULL,
    source_scope_hash character varying(64)
);

CREATE TABLE public.dhr_summary_evidence (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    summary_version_id bigint NOT NULL,
    source_record_id bigint NOT NULL,
    target_node_key character varying(128) NOT NULL,
    origin_kind character varying(32) NOT NULL,
    source_snapshot text NOT NULL,
    source_hash character varying(64) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    before_node_key character varying(128),
    display_order integer,
    display_name character varying(120),
    CONSTRAINT ck_dhr_summary_evidence_origin CHECK (((origin_kind)::text = ANY ((ARRAY['DIRECTORY'::character varying, 'WORK'::character varying, 'CUSTOM'::character varying])::text[])))
);

CREATE TABLE public.dhr_summary_review (
    summary_version_id bigint NOT NULL,
    workflow_instance_id bigint NOT NULL,
    status character varying(24) NOT NULL,
    submitted_by_id character varying(64) NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    CONSTRAINT dhr_summary_review_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING_REVIEW'::character varying, 'APPROVED'::character varying, 'RETURNED'::character varying])::text[])))
);

CREATE TABLE public.dhr_summary_version (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    dhr_instance_id bigint NOT NULL,
    version_no integer NOT NULL,
    status character varying(24) NOT NULL,
    review_mode character varying(16) NOT NULL,
    review_workflow_definition_id bigint,
    review_workflow_version_id bigint,
    base_directory_snapshot text NOT NULL,
    overlay_directory_snapshot text NOT NULL,
    candidate_snapshot text NOT NULL,
    snapshot_hash character varying(64) NOT NULL,
    submitted_by character varying(192),
    submitted_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone NOT NULL,
    check_result_snapshot text NOT NULL,
    attachment_snapshot text DEFAULT '[]'::text NOT NULL,
    CONSTRAINT ck_dhr_summary_version_review_binding CHECK (((((review_mode)::text = 'NONE'::text) AND (review_workflow_definition_id IS NULL) AND (review_workflow_version_id IS NULL)) OR (((review_mode)::text = 'REQUIRED'::text) AND (review_workflow_definition_id IS NOT NULL) AND (review_workflow_version_id IS NOT NULL)))),
    CONSTRAINT ck_dhr_summary_version_review_mode CHECK (((review_mode)::text = ANY ((ARRAY['NONE'::character varying, 'REQUIRED'::character varying])::text[]))),
    CONSTRAINT ck_dhr_summary_version_status CHECK (((status)::text = ANY ((ARRAY['PENDING_REVIEW'::character varying, 'FORMALIZED'::character varying])::text[])))
);

CREATE TABLE public.dhr_template (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64),
    name character varying(256) NOT NULL,
    product_family_id bigint,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    category_name character varying(128),
    description text,
    created_by character varying(128),
    updated_by character varying(128),
    deletion_category_type character varying GENERATED ALWAYS AS ('DHR'::character varying) STORED,
    deletion_category_name character varying GENERATED ALWAYS AS (NULLIF(lower((category_name)::text), ''::text)) STORED
);

CREATE TABLE public.dhr_template_item (
    id bigint NOT NULL,
    directory_id bigint NOT NULL,
    form_template_id bigint,
    sort_order integer DEFAULT 0 NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    form_template_version_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    display_name character varying(256)
);

CREATE TABLE public.dhr_template_version (
    id bigint NOT NULL,
    dhr_template_id bigint NOT NULL,
    version_number integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description text,
    effective_from timestamp without time zone,
    effective_to timestamp without time zone,
    version_label character varying(64) NOT NULL,
    code character varying(64),
    offline_version character varying(20)
);

CREATE TABLE public.dhr_termination (
    dhr_instance_id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    reason text,
    terminated_at timestamp without time zone,
    terminated_by character varying(192),
    recorded_at timestamp without time zone NOT NULL,
    snapshot_json text,
    snapshot_hash character varying(64),
    historical boolean DEFAULT false NOT NULL,
    CONSTRAINT ck_dhr_termination_snapshot CHECK (((historical AND (snapshot_json IS NULL) AND (snapshot_hash IS NULL)) OR ((NOT historical) AND (snapshot_json IS NOT NULL) AND (snapshot_hash IS NOT NULL))))
);

CREATE TABLE public.document_category (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    name character varying(128) NOT NULL,
    system_category boolean DEFAULT false NOT NULL,
    sort_order integer,
    created_by character varying(128),
    created_at timestamp without time zone,
    updated_by character varying(128),
    updated_at timestamp without time zone
);

CREATE TABLE public.document_version (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    document_id bigint NOT NULL,
    version character varying(64) NOT NULL,
    file_id bigint,
    file_reference character varying(1024),
    description text,
    effective_date timestamp without time zone,
    expiry_date timestamp without time zone,
    version_status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    code character varying(64) NOT NULL,
    CONSTRAINT ck_document_version_effective_range CHECK (((expiry_date IS NULL) OR (effective_date IS NULL) OR (expiry_date >= effective_date)))
);

CREATE TABLE public.equipment (
    id bigint NOT NULL,
    equipment_type_id bigint NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    model character varying(128),
    serial_number character varying(128),
    site_id bigint,
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(128),
    updated_by character varying(128),
    brand character varying(128),
    purchase_date date,
    description character varying(512)
);

CREATE TABLE public.equipment_category (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    name character varying(128) NOT NULL,
    system_category boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 100 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.equipment_type (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    category_id bigint,
    created_by character varying(128),
    updated_by character varying(128),
    description character varying(512)
);

CREATE TABLE public.field_permission_policy (
    id bigint NOT NULL,
    workflow_node_id bigint NOT NULL,
    field_id bigint NOT NULL,
    permission_level character varying(16) DEFAULT 'EDIT'::character varying NOT NULL,
    created_at timestamp without time zone
);

CREATE TABLE public.file_object (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    original_name character varying(512) NOT NULL,
    stored_path character varying(1024) NOT NULL,
    mime_type character varying(128),
    file_size bigint DEFAULT 0 NOT NULL,
    md5_hash character varying(64),
    target_type character varying(64),
    target_id character varying(64),
    uploaded_by character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.form_field (
    id bigint NOT NULL,
    section_id bigint NOT NULL,
    field_code character varying(64) NOT NULL,
    field_name character varying(128) NOT NULL,
    field_type character varying(32) DEFAULT 'TEXT'::character varying NOT NULL,
    options jsonb,
    is_required boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone
);

CREATE SEQUENCE public.form_instance_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.form_instance_record (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    instance_no character varying(64) NOT NULL,
    object_id bigint NOT NULL,
    operation_id character varying(192) NOT NULL,
    form_id character varying(192) NOT NULL,
    copy_id character varying(256) NOT NULL,
    template_id bigint NOT NULL,
    version_id bigint NOT NULL,
    snapshot_json text NOT NULL,
    values_json text NOT NULL,
    status character varying(32) NOT NULL,
    created_by character varying(192),
    created_at timestamp without time zone,
    updated_by character varying(192),
    updated_at timestamp without time zone NOT NULL,
    numbered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    legacy boolean DEFAULT false NOT NULL,
    template_code character varying(256),
    template_name character varying(512),
    template_version character varying(192),
    work_order_id character varying(64),
    work_order_no character varying(192),
    object_no character varying(192),
    object_type character varying(32),
    operation_name character varying(512),
    created_by_id character varying(192),
    updated_by_id character varying(192),
    source_type character varying(64) NOT NULL,
    saved_stage character varying(32)
);

CREATE TABLE public.form_lookup_item (
    id character varying(64) NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    name character varying(80) NOT NULL,
    description character varying(512) DEFAULT ''::character varying NOT NULL,
    value_type character varying(16) DEFAULT 'text'::character varying NOT NULL,
    builtin boolean DEFAULT false NOT NULL,
    revision bigint DEFAULT 1 NOT NULL,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT form_lookup_item_value_type_check CHECK (((value_type)::text = ANY ((ARRAY['text'::character varying, 'number'::character varying, 'date'::character varying])::text[])))
);

CREATE TABLE public.form_projection_batch (
    id bigint NOT NULL,
    tenant_id character varying(64) NOT NULL,
    form_instance_id bigint NOT NULL,
    final_revision integer NOT NULL,
    rule_version character varying(64) NOT NULL,
    source_json jsonb NOT NULL,
    status character varying(24) DEFAULT 'PENDING'::character varying NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    error_message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at timestamp without time zone,
    CONSTRAINT form_projection_batch_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'SUCCEEDED'::character varying, 'FAILED'::character varying, 'INVALIDATED'::character varying])::text[])))
);

CREATE SEQUENCE public.form_projection_batch_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.form_projection_batch_id_seq OWNED BY public.form_projection_batch.id;

CREATE TABLE public.form_projection_record (
    id bigint NOT NULL,
    batch_id bigint NOT NULL,
    binding_id character varying(128) NOT NULL,
    row_key character varying(512) NOT NULL,
    model_id character varying(64) NOT NULL,
    attributes jsonb NOT NULL,
    sources jsonb NOT NULL,
    table_id character varying(128) NOT NULL,
    details jsonb DEFAULT '[]'::jsonb NOT NULL
);

CREATE SEQUENCE public.form_projection_record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.form_projection_record_id_seq OWNED BY public.form_projection_record.id;

CREATE TABLE public.form_review_block (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    review_type character varying(64),
    reviewer_config character varying(512),
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone
);

CREATE TABLE public.form_section (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    name character varying(256) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_repeatable boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone
);

CREATE TABLE public.form_signature_block (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    block_name character varying(128) NOT NULL,
    meaning character varying(64),
    "position" integer DEFAULT 0 NOT NULL,
    is_required boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone
);

CREATE TABLE public.form_table (
    id bigint NOT NULL,
    section_id bigint NOT NULL,
    table_code character varying(64) NOT NULL,
    table_name character varying(128),
    columns_definition jsonb,
    min_rows integer DEFAULT 0 NOT NULL,
    max_rows integer DEFAULT 100 NOT NULL,
    created_at timestamp without time zone
);

CREATE TABLE public.form_template (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    type character varying(32) DEFAULT 'FORM'::character varying NOT NULL,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    category_name character varying(128),
    description text,
    created_by character varying(128),
    updated_by character varying(128),
    deletion_category_type character varying GENERATED ALWAYS AS ('FORM'::character varying) STORED,
    deletion_category_name character varying GENERATED ALWAYS AS (NULLIF(lower((category_name)::text), ''::text)) STORED
);

CREATE TABLE public.form_template_version (
    id bigint NOT NULL,
    template_id bigint NOT NULL,
    version_number integer DEFAULT 1 NOT NULL,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    structure_snapshot jsonb,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    version_label character varying(64),
    description text,
    effective_from timestamp without time zone,
    effective_to timestamp without time zone,
    source_file_name character varying(256),
    source_file_id bigint,
    source_file_type character varying(32),
    import_status character varying(32) DEFAULT '未导入'::character varying,
    model_design_json text,
    canvas_design_json text,
    workflow_design_json text,
    created_by character varying(128),
    updated_by character varying(128),
    updated_at timestamp without time zone,
    projection_frozen_json text,
    lock_version bigint DEFAULT 0 NOT NULL
);

CREATE TABLE public.form_trace_value (
    tenant_id character varying(64) NOT NULL,
    form_instance_id bigint NOT NULL,
    item_id character varying(64) NOT NULL,
    field_id character varying(128) NOT NULL,
    field_name character varying(512) NOT NULL,
    table_id character varying(128) NOT NULL,
    row_key character varying(512) NOT NULL,
    row_index integer NOT NULL,
    value_text character varying(512) NOT NULL,
    value_type character varying(16) DEFAULT 'text'::character varying NOT NULL,
    CONSTRAINT form_trace_value_value_type_check CHECK (((value_type)::text = ANY ((ARRAY['text'::character varying, 'number'::character varying, 'date'::character varying])::text[])))
);

CREATE TABLE public.form_validation_rule (
    id bigint NOT NULL,
    field_id bigint NOT NULL,
    rule_type character varying(32) NOT NULL,
    rule_config jsonb,
    error_message character varying(512),
    created_at timestamp without time zone
);

CREATE SEQUENCE public.hibernate_sequence
    START WITH 10000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.icon_asset (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    group_id bigint,
    file_id bigint,
    name character varying(128) NOT NULL,
    builtin_key character varying(128),
    tags character varying(512),
    source character varying(32) DEFAULT 'UPLOAD'::character varying NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(64),
    updated_at timestamp without time zone
);

CREATE TABLE public.icon_group (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    name character varying(128) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(64),
    updated_at timestamp without time zone,
    builtin boolean DEFAULT false NOT NULL
);

CREATE TABLE public.login_log (
    id bigint NOT NULL,
    tenant_id bigint DEFAULT 0 NOT NULL,
    operator_id bigint,
    operator_name character varying(128),
    username character varying(128),
    event_type character varying(32) NOT NULL,
    auth_method character varying(32) NOT NULL,
    occurred_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    platform character varying(32) NOT NULL,
    client_type character varying(32) NOT NULL,
    browser character varying(64),
    ip_address character varying(64),
    user_agent text
);

CREATE TABLE public.material (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    specification character varying(128),
    material_type_id bigint,
    unit character varying(32),
    description text,
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    version character varying(64) DEFAULT 'V1.0'::character varying NOT NULL,
    material_purpose character varying(32) DEFAULT '生产物料'::character varying NOT NULL,
    effective_date timestamp without time zone,
    expiry_date timestamp without time zone,
    brand_name character varying(255)
);

CREATE TABLE public.material_type (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    description text,
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone
);

CREATE TABLE public.operation (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    description text,
    default_duration_minutes integer,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    remark text,
    created_by character varying(128),
    updated_by character varying(128),
    operation_category character varying(128),
    general_description text,
    default_operation_type character varying(64) DEFAULT '普通工序'::character varying NOT NULL,
    deletion_category_name character varying GENERATED ALWAYS AS (NULLIF(lower((operation_category)::text), ''::text)) STORED
);

CREATE TABLE public.operation_category (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    name character varying(128) NOT NULL,
    created_by character varying(128),
    created_at timestamp without time zone,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    sort_order integer,
    deletion_name character varying GENERATED ALWAYS AS (lower((name)::text)) STORED
);

CREATE TABLE public.permission (
    id bigint NOT NULL,
    code character varying(128) NOT NULL,
    name character varying(128) NOT NULL,
    type character varying(32) DEFAULT 'PAGE'::character varying NOT NULL,
    parent_code character varying(128),
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.process_definition (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    product_family_id bigint,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.process_definition_version (
    id bigint NOT NULL,
    process_definition_id bigint NOT NULL,
    version_number integer DEFAULT 1 NOT NULL,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.process_route_binding (
    id bigint NOT NULL,
    process_version_id bigint NOT NULL,
    route_id bigint NOT NULL,
    sequence_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone
);

CREATE TABLE public.product (
    id bigint NOT NULL,
    family_id bigint NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    specification character varying(128),
    unit character varying(32),
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    remark text,
    created_by character varying(128),
    updated_by character varying(128)
);

CREATE TABLE public.product_family (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_by character varying(128),
    updated_by character varying(128)
);

CREATE TABLE public.product_family_member (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    product_family_id bigint NOT NULL,
    product_id bigint NOT NULL,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone
);

CREATE TABLE public.product_process (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    product_version_id bigint,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    owner_type character varying(32) NOT NULL,
    owner_id bigint NOT NULL,
    deletion_product_owner_id bigint GENERATED ALWAYS AS (
CASE
    WHEN ((owner_type)::text = 'PRODUCT'::text) THEN owner_id
    ELSE NULL::bigint
END) STORED,
    deletion_family_owner_id bigint GENERATED ALWAYS AS (
CASE
    WHEN ((owner_type)::text = 'PRODUCT_FAMILY'::text) THEN owner_id
    ELSE NULL::bigint
END) STORED,
    CONSTRAINT ck_product_process_owner_type CHECK (((owner_type)::text = ANY ((ARRAY['PRODUCT'::character varying, 'PRODUCT_FAMILY'::character varying])::text[])))
);

CREATE TABLE public.product_process_operation_binding (
    id bigint NOT NULL,
    product_process_version_id bigint NOT NULL,
    route_node_key character varying(128) NOT NULL,
    operation_id bigint,
    operation_code character varying(64),
    operation_name character varying(128) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    final_output boolean DEFAULT false NOT NULL
);

CREATE TABLE public.product_process_operation_document_binding (
    id bigint NOT NULL,
    product_process_operation_binding_id bigint NOT NULL,
    document_version_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    page_start integer,
    page_end integer
);

CREATE TABLE public.product_process_operation_form_binding (
    id bigint NOT NULL,
    product_process_operation_binding_id bigint NOT NULL,
    form_template_version_id bigint NOT NULL,
    required boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dhr_template_item_id bigint,
    fill_settings_json text
);

CREATE TABLE public.product_process_operation_sop_binding (
    id bigint NOT NULL,
    product_process_operation_binding_id bigint NOT NULL,
    sop_document_id bigint NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.product_process_version (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    product_process_id bigint NOT NULL,
    version_label character varying(64) NOT NULL,
    production_mode character varying(64) NOT NULL,
    production_form character varying(64) NOT NULL,
    route_version_id bigint NOT NULL,
    dhr_template_version_id bigint NOT NULL,
    description text,
    effective_from timestamp without time zone,
    effective_to timestamp without time zone,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    dhr_review_mode character varying(16) DEFAULT 'NONE'::character varying NOT NULL,
    dhr_review_workflow_definition_id bigint,
    dhr_review_workflow_version_id bigint,
    CONSTRAINT ck_product_process_dhr_review_binding CHECK (((((dhr_review_mode)::text = 'NONE'::text) AND (dhr_review_workflow_definition_id IS NULL) AND (dhr_review_workflow_version_id IS NULL)) OR (((dhr_review_mode)::text = 'REQUIRED'::text) AND (dhr_review_workflow_definition_id IS NOT NULL) AND (dhr_review_workflow_version_id IS NOT NULL)))),
    CONSTRAINT ck_product_process_dhr_review_mode CHECK (((dhr_review_mode)::text = ANY ((ARRAY['NONE'::character varying, 'REQUIRED'::character varying])::text[]))),
    CONSTRAINT ck_product_process_effective_range CHECK (((effective_to IS NULL) OR (effective_from IS NULL) OR (effective_to >= effective_from)))
);

CREATE TABLE public.product_version (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    version_number character varying(64) NOT NULL,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    effective_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.production_execution (
    object_id bigint NOT NULL,
    snapshot_json text NOT NULL,
    state_json text NOT NULL,
    revision bigint DEFAULT 0 NOT NULL,
    started_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

CREATE TABLE public.production_line (
    id bigint NOT NULL,
    workshop_id bigint NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.production_object (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    work_order_id bigint NOT NULL,
    object_no character varying(64) NOT NULL,
    object_type character varying(16) NOT NULL,
    process_version_id bigint NOT NULL,
    target_quantity numeric(15,4) NOT NULL,
    good_quantity numeric(15,4) DEFAULT 0 NOT NULL,
    ng_quantity numeric(15,4) DEFAULT 0 NOT NULL,
    scrap_quantity numeric(15,4) DEFAULT 0 NOT NULL,
    status character varying(32) DEFAULT 'CREATED'::character varying NOT NULL,
    remark text,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    planned_start_at timestamp without time zone,
    planned_end_at timestamp without time zone,
    termination_reason text,
    termination_at timestamp without time zone,
    CONSTRAINT ck_production_object_planned_window CHECK (((planned_start_at IS NULL) OR (planned_end_at IS NULL) OR (planned_end_at >= planned_start_at))),
    CONSTRAINT ck_production_object_results CHECK (((good_quantity >= (0)::numeric) AND (ng_quantity >= (0)::numeric) AND (scrap_quantity >= (0)::numeric) AND (((good_quantity + ng_quantity) + scrap_quantity) <= target_quantity))),
    CONSTRAINT ck_production_object_target CHECK ((target_quantity > (0)::numeric)),
    CONSTRAINT ck_production_object_type CHECK (((object_type)::text = ANY ((ARRAY['BATCH'::character varying, 'SN'::character varying])::text[])))
);

CREATE TABLE public.release_form_template (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    dhr_template_id bigint,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.role (
    id bigint NOT NULL,
    tenant_id bigint DEFAULT 0 NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    description character varying(512),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.role_permission (
    id bigint NOT NULL,
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.route (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64),
    name character varying(256) NOT NULL,
    product_family_id character varying(64),
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    description text,
    remark text,
    created_by character varying(128),
    updated_by character varying(128),
    common_asset boolean DEFAULT true NOT NULL,
    deletion_family_id bigint GENERATED ALWAYS AS (public.deletion_reference_id((product_family_id)::text)) STORED
);

CREATE TABLE public.route_node (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    route_version_id bigint NOT NULL,
    node_key character varying(128) NOT NULL,
    operation_id bigint,
    operation_code character varying(64),
    operation_name character varying(128),
    node_type character varying(32) DEFAULT 'OPERATION'::character varying NOT NULL,
    position_x integer DEFAULT 0 NOT NULL,
    position_y integer DEFAULT 0 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    config_json text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.route_operation (
    id bigint NOT NULL,
    route_id bigint NOT NULL,
    operation_id bigint NOT NULL,
    sequence_order integer DEFAULT 0 NOT NULL,
    is_mandatory boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone
);

CREATE TABLE public.route_relation (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    route_version_id bigint NOT NULL,
    source_node_key character varying(128) NOT NULL,
    target_node_key character varying(128) NOT NULL,
    relation_type character varying(32) NOT NULL,
    label character varying(128),
    rule_expression text,
    priority integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    source_handle character varying(64),
    target_handle character varying(64)
);

CREATE TABLE public.route_version (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    route_id bigint NOT NULL,
    version character varying(64) NOT NULL,
    version_status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    effective_date timestamp without time zone,
    expiry_date timestamp without time zone,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    description text,
    code character varying(64) NOT NULL
);

CREATE TABLE public.serial_number (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    sn character varying(128) NOT NULL,
    product_version_id bigint,
    batch_id bigint,
    status character varying(32) DEFAULT 'CREATED'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.signature (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    target_type character varying(64) NOT NULL,
    target_id character varying(64) NOT NULL,
    meaning character varying(64) NOT NULL,
    signer_id character varying(64) NOT NULL,
    signer_name character varying(128) NOT NULL,
    auth_method character varying(32) DEFAULT 'PASSWORD'::character varying NOT NULL,
    auth_event_ref character varying(256),
    snapshot_hash character varying(256),
    snapshot_data text,
    signature_password_hash character varying(256),
    signed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    signature_key character varying(96),
    certified_at_epoch bigint,
    certified_at timestamp without time zone,
    expires_at_epoch bigint,
    expires_at timestamp without time zone,
    authorization_notice_file_id bigint,
    CONSTRAINT ck_signature_snapshot_data_json CHECK (((snapshot_data IS NULL) OR ((snapshot_data)::jsonb IS NOT NULL)))
);

CREATE TABLE public.site (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    address character varying(512),
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.sop_document (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64),
    title character varying(256) NOT NULL,
    version character varying(32),
    file_reference character varying(1024),
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    description text,
    created_by character varying(128),
    updated_by character varying(128),
    document_type character varying(32) DEFAULT 'SOP'::character varying NOT NULL,
    category_id bigint
);

CREATE TABLE public.system_menu_configuration (
    id bigint NOT NULL,
    modules_json jsonb,
    created_by character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(64),
    updated_at timestamp without time zone,
    CONSTRAINT system_menu_configuration_id_check CHECK ((id = 1))
);

CREATE TABLE public.system_setting (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    system_name character varying(128) NOT NULL,
    system_logo_file_id bigint,
    browser_title character varying(256) NOT NULL,
    browser_icon_file_id bigint,
    created_by character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(64),
    updated_at timestamp without time zone,
    logo_width integer DEFAULT 32 NOT NULL,
    logo_height integer DEFAULT 32 NOT NULL,
    login_subtitle character varying(128) DEFAULT '电子设备历史记录平台'::character varying NOT NULL,
    login_description character varying(512) DEFAULT '面向医疗器械生产的 GMP 合规数字化解决方案，确保每一批次全程可追溯、可审计。'::character varying NOT NULL,
    login_compliance_items text DEFAULT '21 CFR Part 11|合规标准
ISO 13485|质量体系
GAMP 5|验证框架'::text NOT NULL,
    force_password_change_on_first_login boolean DEFAULT true NOT NULL,
    password_change_cycle_enabled boolean DEFAULT false NOT NULL,
    password_change_cycle_days integer DEFAULT 90 NOT NULL,
    password_complexity character varying(32) DEFAULT 'MEDIUM'::character varying NOT NULL,
    password_failure_lock_threshold integer DEFAULT 5 NOT NULL,
    password_failure_lock_minutes integer DEFAULT 30 NOT NULL,
    idle_logout_minutes integer DEFAULT 30 NOT NULL,
    token_validity_minutes integer DEFAULT 480 NOT NULL,
    force_signature_on_first_login boolean DEFAULT false NOT NULL,
    signature_change_cycle_enabled boolean DEFAULT true NOT NULL,
    signature_change_cycle_days integer DEFAULT 30 NOT NULL,
    email_enabled boolean DEFAULT true NOT NULL,
    smtp_host character varying(256),
    smtp_port integer DEFAULT 25 NOT NULL,
    smtp_ssl_enabled boolean DEFAULT false NOT NULL,
    smtp_username character varying(256),
    smtp_password character varying(512),
    mail_from_name character varying(128)
);

CREATE TABLE public.template_category (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    template_type character varying(32) NOT NULL,
    name character varying(128) NOT NULL,
    sort_order integer,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    deletion_name character varying GENERATED ALWAYS AS (lower((name)::text)) STORED
);

CREATE TABLE public.tenant (
    id bigint NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.traveler_template (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    code character varying(64) NOT NULL,
    name character varying(256) NOT NULL,
    route_id bigint,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone
);

CREATE TABLE public.unit_of_measure (
    id bigint NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(64) NOT NULL,
    symbol character varying(16),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.user_account (
    id bigint NOT NULL,
    tenant_id bigint DEFAULT 0 NOT NULL,
    username character varying(128) NOT NULL,
    password_hash character varying(256) NOT NULL,
    display_name character varying(128) NOT NULL,
    email character varying(256),
    phone character varying(32),
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    avatar_file_id bigint,
    birthday date,
    gender character varying(16),
    biography character varying(512),
    password_changed_at timestamp without time zone,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp without time zone
);

CREATE TABLE public.user_department (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    department_id bigint NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.user_role (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.work_form_process_reference (
    id bigint NOT NULL,
    work_definition_id bigint NOT NULL,
    work_version_id bigint NOT NULL,
    work_node_id character varying(128) NOT NULL,
    work_node_label character varying(256),
    form_process_definition_id bigint NOT NULL,
    form_process_version_id bigint NOT NULL,
    form_template_version_id bigint,
    form_template_name character varying(512),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

CREATE TABLE public.work_order (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying NOT NULL,
    order_no character varying(64) NOT NULL,
    product_id bigint NOT NULL,
    production_mode character varying(32) DEFAULT '量产'::character varying,
    production_form character varying(32),
    planned_quantity numeric(15,4) NOT NULL,
    status character varying(32) DEFAULT 'CREATED'::character varying NOT NULL,
    remark text,
    created_by character varying(128),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_by character varying(128),
    updated_at timestamp without time zone,
    order_number character varying(64),
    planned_start_at timestamp without time zone,
    planned_end_at timestamp without time zone,
    termination_reason character varying(500),
    termination_at timestamp without time zone
);

CREATE TABLE public.workflow_action_log (
    id bigint NOT NULL,
    instance_id bigint NOT NULL,
    task_id bigint,
    node_id character varying(64),
    action character varying(32) NOT NULL,
    operator_id character varying(64),
    operator_name character varying(128),
    comment text,
    snapshot jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.workflow_binding_rule (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    business_type character varying(64) NOT NULL,
    definition_id bigint NOT NULL,
    version_id bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    name character varying(256),
    rule_type character varying(32) DEFAULT 'GLOBAL'::character varying NOT NULL,
    product_family_id bigint,
    product_id bigint,
    operation_id bigint,
    priority integer DEFAULT 0 NOT NULL,
    description text
);

CREATE TABLE public.workflow_definition (
    id bigint NOT NULL,
    tenant_id character varying(64) DEFAULT 'default'::character varying,
    name character varying(256) NOT NULL,
    type character varying(32) DEFAULT 'RECORD_CONTROL'::character varying NOT NULL,
    business_type character varying(32),
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    code character varying(64),
    CONSTRAINT ck_workflow_definition_record_control_category CHECK ((((type)::text <> 'RECORD_CONTROL'::text) OR ((business_type)::text = ANY ((ARRAY['CHANGE'::character varying, 'OBSOLETE'::character varying, 'DHR_SUMMARY'::character varying])::text[]))))
);

CREATE TABLE public.workflow_definition_version (
    id bigint NOT NULL,
    definition_id bigint NOT NULL,
    version_number integer DEFAULT 1 NOT NULL,
    status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    nodes_json jsonb,
    edges_json jsonb,
    is_current boolean DEFAULT false NOT NULL,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.workflow_edge (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    source_node_id bigint NOT NULL,
    target_node_id bigint NOT NULL,
    label character varying(256),
    condition_expression jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.workflow_instance (
    id bigint NOT NULL,
    definition_id bigint NOT NULL,
    version_id bigint NOT NULL,
    business_type character varying(64),
    business_id character varying(128),
    status character varying(32) DEFAULT 'RUNNING'::character varying NOT NULL,
    current_node_ids character varying(1024),
    context_snapshot jsonb,
    idempotency_key character varying(128),
    audit_correlation_id character varying(128),
    workflow_snapshot_hash character varying(64),
    initiator_id character varying(64),
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp without time zone
);

CREATE TABLE public.workflow_intervention (
    id bigint NOT NULL,
    instance_id bigint NOT NULL,
    action character varying(32) NOT NULL,
    operator_id character varying(64) NOT NULL,
    reason text NOT NULL,
    signature_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.workflow_node (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    node_type character varying(32) NOT NULL,
    name character varying(256) NOT NULL,
    position_x integer DEFAULT 0 NOT NULL,
    position_y integer DEFAULT 0 NOT NULL,
    properties jsonb,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.workflow_task (
    id bigint NOT NULL,
    instance_id bigint NOT NULL,
    node_id bigint NOT NULL,
    task_type character varying(32) DEFAULT 'TODO'::character varying NOT NULL,
    status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    assignee_id character varying(64),
    original_assignee_id character varying(64),
    action character varying(32),
    opinion text,
    signature_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp without time zone,
    candidate_snapshot jsonb
);

CREATE TABLE public.workshop (
    id bigint NOT NULL,
    code character varying(64) NOT NULL,
    name character varying(128) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone,
    tenant_id bigint NOT NULL,
    description character varying(512),
    status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    CONSTRAINT ck_workshop_status CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying])::text[])))
);

ALTER TABLE ONLY public.form_projection_batch ALTER COLUMN id SET DEFAULT nextval('public.form_projection_batch_id_seq'::regclass);

ALTER TABLE ONLY public.form_projection_record ALTER COLUMN id SET DEFAULT nextval('public.form_projection_record_id_seq'::regclass);

ALTER TABLE ONLY public.audit_event
    ADD CONSTRAINT audit_event_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.batch
    ADD CONSTRAINT batch_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.business_dictionary_item
    ADD CONSTRAINT business_dictionary_item_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.business_dictionary
    ADD CONSTRAINT business_dictionary_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.controlled_reason
    ADD CONSTRAINT controlled_reason_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.data_scope_policy
    ADD CONSTRAINT data_scope_policy_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.deletion_form_reference
    ADD CONSTRAINT deletion_form_reference_object_id_form_template_version_id_key UNIQUE (object_id, form_template_version_id);

ALTER TABLE ONLY public.deletion_form_reference
    ADD CONSTRAINT deletion_form_reference_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.deletion_form_reference
    ADD CONSTRAINT deletion_form_reference_workflow_version_id_form_template_v_key UNIQUE (workflow_version_id, form_template_version_id);

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_attachment
    ADD CONSTRAINT dhr_attachment_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_directory
    ADD CONSTRAINT dhr_directory_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT dhr_instance_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_summary_draft
    ADD CONSTRAINT dhr_summary_draft_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_summary_evidence
    ADD CONSTRAINT dhr_summary_evidence_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_summary_review
    ADD CONSTRAINT dhr_summary_review_pkey PRIMARY KEY (summary_version_id);

ALTER TABLE ONLY public.dhr_summary_review
    ADD CONSTRAINT dhr_summary_review_workflow_instance_id_key UNIQUE (workflow_instance_id);

ALTER TABLE ONLY public.dhr_summary_version
    ADD CONSTRAINT dhr_summary_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_template_item
    ADD CONSTRAINT dhr_template_item_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_template
    ADD CONSTRAINT dhr_template_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_template_version
    ADD CONSTRAINT dhr_template_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.dhr_termination
    ADD CONSTRAINT dhr_termination_pkey PRIMARY KEY (dhr_instance_id);

ALTER TABLE ONLY public.document_category
    ADD CONSTRAINT document_category_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.document_version
    ADD CONSTRAINT document_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment_category
    ADD CONSTRAINT equipment_category_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT equipment_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.equipment_type
    ADD CONSTRAINT equipment_type_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.field_permission_policy
    ADD CONSTRAINT field_permission_policy_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.file_object
    ADD CONSTRAINT file_object_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_field
    ADD CONSTRAINT form_field_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_instance_record
    ADD CONSTRAINT form_instance_record_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_lookup_item
    ADD CONSTRAINT form_lookup_item_pkey PRIMARY KEY (tenant_id, id);

ALTER TABLE ONLY public.form_projection_batch
    ADD CONSTRAINT form_projection_batch_form_instance_id_final_revision_rule__key UNIQUE (form_instance_id, final_revision, rule_version);

ALTER TABLE ONLY public.form_projection_batch
    ADD CONSTRAINT form_projection_batch_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_projection_record
    ADD CONSTRAINT form_projection_record_batch_id_binding_id_row_key_key UNIQUE (batch_id, binding_id, row_key);

ALTER TABLE ONLY public.form_projection_record
    ADD CONSTRAINT form_projection_record_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_review_block
    ADD CONSTRAINT form_review_block_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_section
    ADD CONSTRAINT form_section_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_signature_block
    ADD CONSTRAINT form_signature_block_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_table
    ADD CONSTRAINT form_table_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_template
    ADD CONSTRAINT form_template_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_template_version
    ADD CONSTRAINT form_template_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.form_trace_value
    ADD CONSTRAINT form_trace_value_pkey PRIMARY KEY (form_instance_id, table_id, row_key, item_id, field_id);

ALTER TABLE ONLY public.form_validation_rule
    ADD CONSTRAINT form_validation_rule_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.icon_asset
    ADD CONSTRAINT icon_asset_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.icon_group
    ADD CONSTRAINT icon_group_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.login_log
    ADD CONSTRAINT login_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.material
    ADD CONSTRAINT material_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.material_type
    ADD CONSTRAINT material_type_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.operation_category
    ADD CONSTRAINT operation_category_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.operation
    ADD CONSTRAINT operation_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.process_definition
    ADD CONSTRAINT process_definition_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.process_definition_version
    ADD CONSTRAINT process_definition_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.process_route_binding
    ADD CONSTRAINT process_route_binding_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_family_member
    ADD CONSTRAINT product_family_member_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_family
    ADD CONSTRAINT product_family_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_process_operation_binding
    ADD CONSTRAINT product_process_operation_binding_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_process_operation_document_binding
    ADD CONSTRAINT product_process_operation_document_binding_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_process_operation_form_binding
    ADD CONSTRAINT product_process_operation_form_binding_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_process_operation_sop_binding
    ADD CONSTRAINT product_process_operation_sop_binding_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_process
    ADD CONSTRAINT product_process_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_process_version
    ADD CONSTRAINT product_process_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.product_version
    ADD CONSTRAINT product_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.production_execution
    ADD CONSTRAINT production_execution_pkey PRIMARY KEY (object_id);

ALTER TABLE ONLY public.production_line
    ADD CONSTRAINT production_line_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.production_object
    ADD CONSTRAINT production_object_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.release_form_template
    ADD CONSTRAINT release_form_template_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.route_node
    ADD CONSTRAINT route_node_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.route_operation
    ADD CONSTRAINT route_operation_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.route
    ADD CONSTRAINT route_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.route_relation
    ADD CONSTRAINT route_relation_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.route_version
    ADD CONSTRAINT route_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.serial_number
    ADD CONSTRAINT serial_number_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.signature
    ADD CONSTRAINT signature_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.site
    ADD CONSTRAINT site_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.sop_document
    ADD CONSTRAINT sop_document_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.system_menu_configuration
    ADD CONSTRAINT system_menu_configuration_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.system_setting
    ADD CONSTRAINT system_setting_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.template_category
    ADD CONSTRAINT template_category_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.tenant
    ADD CONSTRAINT tenant_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.traveler_template
    ADD CONSTRAINT traveler_template_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.operation_category
    ADD CONSTRAINT uk_deletion_operation_category UNIQUE (tenant_id, deletion_name);

ALTER TABLE ONLY public.template_category
    ADD CONSTRAINT uk_deletion_template_category UNIQUE (tenant_id, template_type, deletion_name);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT uk_dhr_instance_number UNIQUE (tenant_id, dhr_no);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT uk_dhr_instance_object UNIQUE (tenant_id, production_object_id);

ALTER TABLE ONLY public.dhr_summary_draft
    ADD CONSTRAINT uk_dhr_summary_draft_instance UNIQUE (tenant_id, dhr_instance_id);

ALTER TABLE ONLY public.dhr_summary_evidence
    ADD CONSTRAINT uk_dhr_summary_evidence_source UNIQUE (tenant_id, summary_version_id, source_record_id);

ALTER TABLE ONLY public.dhr_summary_version
    ADD CONSTRAINT uk_dhr_summary_version_hash UNIQUE (tenant_id, dhr_instance_id, snapshot_hash);

ALTER TABLE ONLY public.dhr_summary_version
    ADD CONSTRAINT uk_dhr_summary_version_no UNIQUE (tenant_id, dhr_instance_id, version_no);

ALTER TABLE ONLY public.equipment_category
    ADD CONSTRAINT uk_equipment_category_name UNIQUE (tenant_id, name);

ALTER TABLE ONLY public.form_instance_record
    ADD CONSTRAINT uk_form_instance_number UNIQUE (tenant_id, instance_no);

ALTER TABLE ONLY public.form_instance_record
    ADD CONSTRAINT uk_form_instance_source UNIQUE (tenant_id, object_id, operation_id, copy_id);

ALTER TABLE ONLY public.unit_of_measure
    ADD CONSTRAINT unit_of_measure_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_department
    ADD CONSTRAINT user_department_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.work_form_process_reference
    ADD CONSTRAINT work_form_process_reference_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.work_order
    ADD CONSTRAINT work_order_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_action_log
    ADD CONSTRAINT workflow_action_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_binding_rule
    ADD CONSTRAINT workflow_binding_rule_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_definition
    ADD CONSTRAINT workflow_definition_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_definition_version
    ADD CONSTRAINT workflow_definition_version_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_edge
    ADD CONSTRAINT workflow_edge_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_instance
    ADD CONSTRAINT workflow_instance_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_intervention
    ADD CONSTRAINT workflow_intervention_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_node
    ADD CONSTRAINT workflow_node_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workflow_task
    ADD CONSTRAINT workflow_task_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.workshop
    ADD CONSTRAINT workshop_pkey PRIMARY KEY (id);

CREATE INDEX form_projection_attributes ON public.form_projection_record USING gin (attributes);

CREATE INDEX form_projection_pending ON public.form_projection_batch USING btree (status, id);

CREATE INDEX form_trace_lookup ON public.form_trace_value USING btree (tenant_id, item_id, value_text, form_instance_id);

CREATE INDEX idx_audit_action ON public.audit_event USING btree (action);

CREATE INDEX idx_audit_created ON public.audit_event USING btree (created_at);

CREATE INDEX idx_audit_entity ON public.audit_event USING btree (entity_type, entity_id);

CREATE INDEX idx_audit_operator ON public.audit_event USING btree (operator_id);

CREATE INDEX idx_audit_snapshot_hash ON public.audit_event USING btree (snapshot_hash);

CREATE INDEX idx_business_dictionary_item_dictionary_sort ON public.business_dictionary_item USING btree (dictionary_id, sort_order);

CREATE INDEX idx_business_dictionary_tenant_sort ON public.business_dictionary USING btree (tenant_id, sort_order);

CREATE INDEX idx_deletion_form_target ON public.deletion_form_reference USING btree (form_template_version_id);

CREATE INDEX idx_dhr_attachment_active ON public.dhr_attachment USING btree (tenant_id, dhr_instance_id, active);

CREATE INDEX idx_dhr_directory_version ON public.dhr_directory USING btree (version_id, sort_order);

CREATE INDEX idx_dhr_instance_context ON public.dhr_instance USING btree (tenant_id, object_type, status, work_order_id);

CREATE INDEX idx_dhr_instance_list ON public.dhr_instance USING btree (tenant_id, created_at DESC, id DESC);

CREATE INDEX idx_dhr_summary_evidence_version ON public.dhr_summary_evidence USING btree (tenant_id, summary_version_id, target_node_key);

CREATE INDEX idx_dhr_summary_version_instance ON public.dhr_summary_version USING btree (tenant_id, dhr_instance_id, version_no DESC);

CREATE INDEX idx_dhr_template_item_directory ON public.dhr_template_item USING btree (directory_id, sort_order);

CREATE INDEX idx_dhr_template_version_template ON public.dhr_template_version USING btree (dhr_template_id, version_number DESC);

CREATE INDEX idx_document_version_document ON public.document_version USING btree (document_id, created_at DESC);

CREATE INDEX idx_equipment_type_category ON public.equipment_type USING btree (category_id);

CREATE INDEX idx_equipment_type_reference ON public.equipment USING btree (equipment_type_id);

CREATE INDEX idx_file_target ON public.file_object USING btree (target_type, target_id);

CREATE INDEX idx_form_instance_created ON public.form_instance_record USING btree (tenant_id, created_at DESC NULLS LAST, id DESC);

CREATE INDEX idx_form_instance_object ON public.form_instance_record USING btree (tenant_id, object_id, operation_id);

CREATE INDEX idx_form_instance_order ON public.form_instance_record USING btree (tenant_id, work_order_id);

CREATE INDEX idx_form_instance_source ON public.form_instance_record USING btree (tenant_id, source_type, updated_at DESC, id DESC);

CREATE INDEX idx_form_instance_template ON public.form_instance_record USING btree (tenant_id, template_id, numbered_at DESC, id DESC);

CREATE INDEX idx_form_instance_updated ON public.form_instance_record USING btree (tenant_id, updated_at DESC, id DESC);

CREATE INDEX idx_icon_asset_file ON public.icon_asset USING btree (file_id);

CREATE INDEX idx_icon_asset_group_sort ON public.icon_asset USING btree (tenant_id, group_id, sort_order);

CREATE INDEX idx_icon_group_tenant_sort ON public.icon_group USING btree (tenant_id, sort_order);

CREATE INDEX idx_login_log_event_type ON public.login_log USING btree (event_type);

CREATE INDEX idx_login_log_occurred_at ON public.login_log USING btree (occurred_at);

CREATE INDEX idx_login_log_operator ON public.login_log USING btree (operator_id);

CREATE INDEX idx_login_log_username ON public.login_log USING btree (username);

CREATE INDEX idx_operation_tenant_code ON public.operation USING btree (tenant_id, lower((code)::text));

CREATE INDEX idx_product_family_member_tenant_family ON public.product_family_member USING btree (tenant_id, product_family_id, created_at);

CREATE INDEX idx_product_process_form_binding_dhr_item ON public.product_process_operation_form_binding USING btree (dhr_template_item_id);

CREATE INDEX idx_product_process_operation_document_binding ON public.product_process_operation_document_binding USING btree (product_process_operation_binding_id);

CREATE INDEX idx_product_process_version_applicability ON public.product_process_version USING btree (product_process_id, production_mode, production_form, effective_from, effective_to);

CREATE INDEX idx_production_object_order ON public.production_object USING btree (tenant_id, work_order_id);

CREATE INDEX idx_production_object_status ON public.production_object USING btree (tenant_id, status);

CREATE INDEX idx_route_node_version_id ON public.route_node USING btree (route_version_id);

CREATE INDEX idx_route_relation_type ON public.route_relation USING btree (relation_type);

CREATE INDEX idx_route_relation_version_id ON public.route_relation USING btree (route_version_id);

CREATE INDEX idx_route_version_route_id ON public.route_version USING btree (route_id);

CREATE INDEX idx_sig_target ON public.signature USING btree (target_type, target_id);

CREATE INDEX idx_signature_expires_at ON public.signature USING btree (expires_at);

CREATE INDEX idx_sop_document_category_id ON public.sop_document USING btree (category_id);

CREATE INDEX idx_user_avatar_file ON public.user_account USING btree (avatar_file_id);

CREATE INDEX idx_wf_instance_biz ON public.workflow_instance USING btree (business_type, business_id);

CREATE INDEX idx_wf_instance_status ON public.workflow_instance USING btree (status);

CREATE INDEX idx_wf_log_instance ON public.workflow_action_log USING btree (instance_id);

CREATE INDEX idx_wf_task_assignee ON public.workflow_task USING btree (assignee_id);

CREATE INDEX idx_wf_task_instance ON public.workflow_task USING btree (instance_id);

CREATE INDEX idx_wf_task_status ON public.workflow_task USING btree (status);

CREATE INDEX idx_work_form_process_reference_process_definition ON public.work_form_process_reference USING btree (form_process_definition_id);

CREATE INDEX idx_work_form_process_reference_process_version ON public.work_form_process_reference USING btree (form_process_version_id);

CREATE INDEX idx_work_form_process_reference_work_version ON public.work_form_process_reference USING btree (work_version_id);

CREATE INDEX idx_work_order_product ON public.work_order USING btree (tenant_id, product_id);

CREATE INDEX idx_work_order_status ON public.work_order USING btree (tenant_id, status);

CREATE INDEX idx_workflow_binding_rule_definition ON public.workflow_binding_rule USING btree (definition_id);

CREATE INDEX idx_workflow_definition_business_type ON public.workflow_definition USING btree (type, business_type);

CREATE INDEX idx_workflow_task_candidate_snapshot ON public.workflow_task USING gin (candidate_snapshot);

CREATE UNIQUE INDEX uk_batch_code ON public.batch USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_business_dictionary_item_dictionary_value ON public.business_dictionary_item USING btree (dictionary_id, value);

CREATE UNIQUE INDEX uk_business_dictionary_tenant_code ON public.business_dictionary USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_dept_code ON public.department USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_dhr_template_item_directory_form ON public.dhr_template_item USING btree (directory_id, form_template_id) WHERE (form_template_id IS NOT NULL);

CREATE UNIQUE INDEX uk_dhr_template_version_code ON public.dhr_template_version USING btree (lower((code)::text)) WHERE ((code IS NOT NULL) AND (btrim((code)::text) <> ''::text));

CREATE UNIQUE INDEX uk_dhr_template_version_label ON public.dhr_template_version USING btree (dhr_template_id, lower((version_label)::text));

CREATE UNIQUE INDEX uk_dhr_template_version_number ON public.dhr_template_version USING btree (dhr_template_id, version_number);

CREATE UNIQUE INDEX uk_document_category_tenant_name ON public.document_category USING btree (tenant_id, lower((name)::text));

CREATE UNIQUE INDEX uk_document_version_code ON public.document_version USING btree (tenant_id, lower((code)::text));

CREATE UNIQUE INDEX uk_document_version_label ON public.document_version USING btree (document_id, lower((version)::text));

CREATE UNIQUE INDEX uk_eq_code ON public.equipment USING btree (code);

CREATE UNIQUE INDEX uk_eqtype_code ON public.equipment_type USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_field_code ON public.form_field USING btree (section_id, field_code);

CREATE UNIQUE INDEX uk_form_lookup_item_name ON public.form_lookup_item USING btree (tenant_id, lower((name)::text));

CREATE UNIQUE INDEX uk_form_template_version_label ON public.form_template_version USING btree (template_id, lower((version_label)::text)) WHERE ((version_label IS NOT NULL) AND (btrim((version_label)::text) <> ''::text));

CREATE UNIQUE INDEX uk_ft_code ON public.form_template USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_ftv ON public.form_template_version USING btree (template_id, version_number);

CREATE UNIQUE INDEX uk_icon_asset_builtin_key ON public.icon_asset USING btree (tenant_id, builtin_key) WHERE (((source)::text = 'BUILTIN'::text) AND (builtin_key IS NOT NULL));

CREATE UNIQUE INDEX uk_icon_group_builtin_tenant ON public.icon_group USING btree (tenant_id) WHERE (builtin = true);

CREATE UNIQUE INDEX uk_line_code ON public.production_line USING btree (workshop_id, code);

CREATE UNIQUE INDEX uk_material_code_version ON public.material USING btree (tenant_id, code, version);

CREATE UNIQUE INDEX uk_material_type_code ON public.material_type USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_op_code ON public.operation USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_operation_category_tenant_name ON public.operation_category USING btree (tenant_id, lower((name)::text));

CREATE UNIQUE INDEX uk_pd_code ON public.process_definition USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_permission_code ON public.permission USING btree (code);

CREATE UNIQUE INDEX uk_process_version_final_output ON public.product_process_operation_binding USING btree (product_process_version_id) WHERE final_output;

CREATE UNIQUE INDEX uk_prod_code ON public.product USING btree (family_id, code);

CREATE UNIQUE INDEX uk_product_family_member_tenant_family_product ON public.product_family_member USING btree (tenant_id, product_family_id, product_id);

CREATE UNIQUE INDEX uk_product_family_member_tenant_product ON public.product_family_member USING btree (tenant_id, product_id);

CREATE UNIQUE INDEX uk_product_family_tenant_code_ci ON public.product_family USING btree (tenant_id, lower((code)::text));

CREATE UNIQUE INDEX uk_product_process_operation_binding_node ON public.product_process_operation_binding USING btree (product_process_version_id, route_node_key);

CREATE UNIQUE INDEX uk_product_process_operation_document_binding ON public.product_process_operation_document_binding USING btree (product_process_operation_binding_id, document_version_id);

CREATE UNIQUE INDEX uk_product_process_operation_form_binding ON public.product_process_operation_form_binding USING btree (product_process_operation_binding_id, dhr_template_item_id);

CREATE UNIQUE INDEX uk_product_process_operation_sop_binding ON public.product_process_operation_sop_binding USING btree (product_process_operation_binding_id, sop_document_id);

CREATE UNIQUE INDEX uk_product_process_owner ON public.product_process USING btree (tenant_id, owner_type, owner_id);

CREATE UNIQUE INDEX uk_product_process_product_version ON public.product_process USING btree (tenant_id, product_version_id);

CREATE UNIQUE INDEX uk_product_process_version_label ON public.product_process_version USING btree (product_process_id, lower((version_label)::text));

CREATE UNIQUE INDEX uk_production_object_no ON public.production_object USING btree (tenant_id, object_no);

CREATE UNIQUE INDEX uk_reason_code ON public.controlled_reason USING btree (code);

CREATE UNIQUE INDEX uk_rft_code ON public.release_form_template USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_role_code ON public.role USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_role_perm ON public.role_permission USING btree (role_id, permission_id);

CREATE UNIQUE INDEX uk_route_code ON public.route USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_route_node_key ON public.route_node USING btree (route_version_id, node_key);

CREATE UNIQUE INDEX uk_route_op ON public.route_operation USING btree (route_id, operation_id);

CREATE UNIQUE INDEX uk_route_version ON public.route_version USING btree (route_id, version);

CREATE UNIQUE INDEX uk_route_version_tenant_code ON public.route_version USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_signature_key ON public.signature USING btree (signature_key) WHERE (signature_key IS NOT NULL);

CREATE UNIQUE INDEX uk_site_code ON public.site USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_sn ON public.serial_number USING btree (tenant_id, sn);

CREATE UNIQUE INDEX uk_system_setting_tenant ON public.system_setting USING btree (tenant_id);

CREATE UNIQUE INDEX uk_template_category_name ON public.template_category USING btree (tenant_id, template_type, lower((name)::text));

CREATE UNIQUE INDEX uk_tenant_code ON public.tenant USING btree (code);

CREATE UNIQUE INDEX uk_tt_code ON public.traveler_template USING btree (tenant_id, code);

CREATE UNIQUE INDEX uk_uom_code ON public.unit_of_measure USING btree (code);

CREATE UNIQUE INDEX uk_user_dept ON public.user_department USING btree (user_id, department_id);

CREATE UNIQUE INDEX uk_user_role ON public.user_role USING btree (user_id, role_id);

CREATE UNIQUE INDEX uk_user_username ON public.user_account USING btree (tenant_id, username);

CREATE UNIQUE INDEX uk_wf_def_version ON public.workflow_definition_version USING btree (definition_id, version_number);

CREATE UNIQUE INDEX uk_wf_instance_idempotency_key ON public.workflow_instance USING btree (idempotency_key) WHERE (idempotency_key IS NOT NULL);

CREATE UNIQUE INDEX uk_work_form_process_reference_node ON public.work_form_process_reference USING btree (work_version_id, work_node_id);

CREATE UNIQUE INDEX uk_work_order_no ON public.work_order USING btree (tenant_id, order_no);

CREATE UNIQUE INDEX uk_workflow_definition_version_one_draft ON public.workflow_definition_version USING btree (definition_id) WHERE ((status)::text = 'DRAFT'::text);

CREATE UNIQUE INDEX uk_workflow_definition_work_code ON public.workflow_definition USING btree (lower((code)::text)) WHERE (((type)::text = 'WORK'::text) AND (code IS NOT NULL));

CREATE UNIQUE INDEX uk_workshop_tenant_code ON public.workshop USING btree (tenant_id, lower((code)::text));

CREATE UNIQUE INDEX uq_workflow_task_active_instance_node ON public.workflow_task USING btree (instance_id, node_id) WHERE ((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PROCESSING'::character varying])::text[]));

CREATE TRIGGER deletion_execution_form_references AFTER INSERT OR UPDATE OF snapshot_json ON public.production_execution FOR EACH ROW EXECUTE FUNCTION public.sync_deletion_form_references();

CREATE TRIGGER deletion_work_form_references AFTER INSERT OR UPDATE OF nodes_json ON public.workflow_definition_version FOR EACH ROW EXECUTE FUNCTION public.sync_deletion_form_references();

ALTER TABLE ONLY public.dhr_summary_review
    ADD CONSTRAINT dhr_summary_review_summary_version_id_fkey FOREIGN KEY (summary_version_id) REFERENCES public.dhr_summary_version(id);

ALTER TABLE ONLY public.dhr_summary_review
    ADD CONSTRAINT dhr_summary_review_workflow_instance_id_fkey FOREIGN KEY (workflow_instance_id) REFERENCES public.workflow_instance(id);

ALTER TABLE ONLY public.dhr_termination
    ADD CONSTRAINT dhr_termination_dhr_instance_id_fkey FOREIGN KEY (dhr_instance_id) REFERENCES public.dhr_instance(id);

ALTER TABLE ONLY public.business_dictionary_item
    ADD CONSTRAINT fk_business_dictionary_item_dictionary FOREIGN KEY (dictionary_id) REFERENCES public.business_dictionary(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_process
    ADD CONSTRAINT fk_delete_family_owner FOREIGN KEY (deletion_family_owner_id) REFERENCES public.product_family(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.work_order
    ADD CONSTRAINT fk_delete_guard_000 FOREIGN KEY (product_id) REFERENCES public.material(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.workflow_binding_rule
    ADD CONSTRAINT fk_delete_guard_002 FOREIGN KEY (product_id) REFERENCES public.material(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product
    ADD CONSTRAINT fk_delete_guard_004 FOREIGN KEY (family_id) REFERENCES public.product_family(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.route
    ADD CONSTRAINT fk_delete_guard_005 FOREIGN KEY (deletion_family_id) REFERENCES public.product_family(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.dhr_template
    ADD CONSTRAINT fk_delete_guard_006 FOREIGN KEY (product_family_id) REFERENCES public.product_family(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.process_definition
    ADD CONSTRAINT fk_delete_guard_007 FOREIGN KEY (product_family_id) REFERENCES public.product_family(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.workflow_binding_rule
    ADD CONSTRAINT fk_delete_guard_008 FOREIGN KEY (product_family_id) REFERENCES public.product_family(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_version
    ADD CONSTRAINT fk_delete_guard_009 FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.batch
    ADD CONSTRAINT fk_delete_guard_010 FOREIGN KEY (product_version_id) REFERENCES public.product_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.serial_number
    ADD CONSTRAINT fk_delete_guard_011 FOREIGN KEY (product_version_id) REFERENCES public.product_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_process_version
    ADD CONSTRAINT fk_delete_guard_012 FOREIGN KEY (product_process_id) REFERENCES public.product_process(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.production_object
    ADD CONSTRAINT fk_delete_guard_014 FOREIGN KEY (process_version_id) REFERENCES public.product_process_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_process_operation_binding
    ADD CONSTRAINT fk_delete_guard_015 FOREIGN KEY (product_process_version_id) REFERENCES public.product_process_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_process_operation_document_binding
    ADD CONSTRAINT fk_delete_guard_016 FOREIGN KEY (product_process_operation_binding_id) REFERENCES public.product_process_operation_binding(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_process_operation_form_binding
    ADD CONSTRAINT fk_delete_guard_017 FOREIGN KEY (product_process_operation_binding_id) REFERENCES public.product_process_operation_binding(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_process_operation_sop_binding
    ADD CONSTRAINT fk_delete_guard_018 FOREIGN KEY (product_process_operation_binding_id) REFERENCES public.product_process_operation_binding(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.route_node
    ADD CONSTRAINT fk_delete_guard_019 FOREIGN KEY (operation_id) REFERENCES public.operation(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.route_operation
    ADD CONSTRAINT fk_delete_guard_020 FOREIGN KEY (operation_id) REFERENCES public.operation(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_process_operation_binding
    ADD CONSTRAINT fk_delete_guard_021 FOREIGN KEY (operation_id) REFERENCES public.operation(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.workflow_binding_rule
    ADD CONSTRAINT fk_delete_guard_022 FOREIGN KEY (operation_id) REFERENCES public.operation(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.route_version
    ADD CONSTRAINT fk_delete_guard_025 FOREIGN KEY (route_id) REFERENCES public.route(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.route_operation
    ADD CONSTRAINT fk_delete_guard_026 FOREIGN KEY (route_id) REFERENCES public.route(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.process_route_binding
    ADD CONSTRAINT fk_delete_guard_027 FOREIGN KEY (route_id) REFERENCES public.route(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.traveler_template
    ADD CONSTRAINT fk_delete_guard_028 FOREIGN KEY (route_id) REFERENCES public.route(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.route_node
    ADD CONSTRAINT fk_delete_guard_029 FOREIGN KEY (route_version_id) REFERENCES public.route_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.route_relation
    ADD CONSTRAINT fk_delete_guard_030 FOREIGN KEY (route_version_id) REFERENCES public.route_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_process_version
    ADD CONSTRAINT fk_delete_guard_031 FOREIGN KEY (route_version_id) REFERENCES public.route_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.document_version
    ADD CONSTRAINT fk_delete_guard_032 FOREIGN KEY (document_id) REFERENCES public.sop_document(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_process_operation_sop_binding
    ADD CONSTRAINT fk_delete_guard_033 FOREIGN KEY (sop_document_id) REFERENCES public.sop_document(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_process_operation_document_binding
    ADD CONSTRAINT fk_delete_guard_034 FOREIGN KEY (document_version_id) REFERENCES public.document_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.sop_document
    ADD CONSTRAINT fk_delete_guard_035 FOREIGN KEY (category_id) REFERENCES public.document_category(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.form_template_version
    ADD CONSTRAINT fk_delete_guard_036 FOREIGN KEY (template_id) REFERENCES public.form_template(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.dhr_template_item
    ADD CONSTRAINT fk_delete_guard_037 FOREIGN KEY (form_template_id) REFERENCES public.form_template(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.form_instance_record
    ADD CONSTRAINT fk_delete_guard_039 FOREIGN KEY (template_id) REFERENCES public.form_template(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.dhr_template_item
    ADD CONSTRAINT fk_delete_guard_042 FOREIGN KEY (form_template_version_id) REFERENCES public.form_template_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_process_operation_form_binding
    ADD CONSTRAINT fk_delete_guard_043 FOREIGN KEY (form_template_version_id) REFERENCES public.form_template_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.work_form_process_reference
    ADD CONSTRAINT fk_delete_guard_044 FOREIGN KEY (form_template_version_id) REFERENCES public.form_template_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.form_instance_record
    ADD CONSTRAINT fk_delete_guard_047 FOREIGN KEY (version_id) REFERENCES public.form_template_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.form_section
    ADD CONSTRAINT fk_delete_guard_048 FOREIGN KEY (version_id) REFERENCES public.form_template_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.form_signature_block
    ADD CONSTRAINT fk_delete_guard_049 FOREIGN KEY (version_id) REFERENCES public.form_template_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.form_review_block
    ADD CONSTRAINT fk_delete_guard_050 FOREIGN KEY (version_id) REFERENCES public.form_template_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.form_field
    ADD CONSTRAINT fk_delete_guard_053 FOREIGN KEY (section_id) REFERENCES public.form_section(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.form_table
    ADD CONSTRAINT fk_delete_guard_054 FOREIGN KEY (section_id) REFERENCES public.form_section(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.form_validation_rule
    ADD CONSTRAINT fk_delete_guard_055 FOREIGN KEY (field_id) REFERENCES public.form_field(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.dhr_template_version
    ADD CONSTRAINT fk_delete_guard_057 FOREIGN KEY (dhr_template_id) REFERENCES public.dhr_template(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.release_form_template
    ADD CONSTRAINT fk_delete_guard_059 FOREIGN KEY (dhr_template_id) REFERENCES public.dhr_template(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.dhr_directory
    ADD CONSTRAINT fk_delete_guard_060 FOREIGN KEY (version_id) REFERENCES public.dhr_template_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_process_version
    ADD CONSTRAINT fk_delete_guard_061 FOREIGN KEY (dhr_template_version_id) REFERENCES public.dhr_template_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.dhr_directory
    ADD CONSTRAINT fk_delete_guard_063 FOREIGN KEY (parent_id) REFERENCES public.dhr_directory(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.dhr_template_item
    ADD CONSTRAINT fk_delete_guard_064 FOREIGN KEY (directory_id) REFERENCES public.dhr_directory(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.product_process_operation_form_binding
    ADD CONSTRAINT fk_delete_guard_066 FOREIGN KEY (dhr_template_item_id) REFERENCES public.dhr_template_item(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.form_instance_record
    ADD CONSTRAINT fk_delete_guard_073 FOREIGN KEY (object_id) REFERENCES public.production_object(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.serial_number
    ADD CONSTRAINT fk_delete_guard_074 FOREIGN KEY (batch_id) REFERENCES public.batch(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.product_process
    ADD CONSTRAINT fk_delete_product_owner FOREIGN KEY (deletion_product_owner_id) REFERENCES public.material(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.dhr_template
    ADD CONSTRAINT fk_deletion_dhr_category FOREIGN KEY (tenant_id, deletion_category_type, deletion_category_name) REFERENCES public.template_category(tenant_id, template_type, deletion_name) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.form_template
    ADD CONSTRAINT fk_deletion_form_category FOREIGN KEY (tenant_id, deletion_category_type, deletion_category_name) REFERENCES public.template_category(tenant_id, template_type, deletion_name) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.deletion_form_reference
    ADD CONSTRAINT fk_deletion_form_object FOREIGN KEY (object_id) REFERENCES public.production_object(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.deletion_form_reference
    ADD CONSTRAINT fk_deletion_form_version FOREIGN KEY (form_template_version_id) REFERENCES public.form_template_version(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.deletion_form_reference
    ADD CONSTRAINT fk_deletion_form_workflow FOREIGN KEY (workflow_version_id) REFERENCES public.workflow_definition_version(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.operation
    ADD CONSTRAINT fk_deletion_operation_category FOREIGN KEY (tenant_id, deletion_category_name) REFERENCES public.operation_category(tenant_id, deletion_name) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.dhr_attachment
    ADD CONSTRAINT fk_dhr_attachment_instance FOREIGN KEY (dhr_instance_id) REFERENCES public.dhr_instance(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_object FOREIGN KEY (production_object_id) REFERENCES public.production_object(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_order FOREIGN KEY (work_order_id) REFERENCES public.work_order(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_process FOREIGN KEY (process_version_id) REFERENCES public.product_process_version(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_product FOREIGN KEY (product_id) REFERENCES public.material(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_review_definition FOREIGN KEY (dhr_review_workflow_definition_id) REFERENCES public.workflow_definition(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_review_version FOREIGN KEY (dhr_review_workflow_version_id) REFERENCES public.workflow_definition_version(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_route FOREIGN KEY (route_version_id) REFERENCES public.route_version(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_template FOREIGN KEY (dhr_template_id) REFERENCES public.dhr_template(id);

ALTER TABLE ONLY public.dhr_instance
    ADD CONSTRAINT fk_dhr_instance_template_version FOREIGN KEY (dhr_template_version_id) REFERENCES public.dhr_template_version(id);

ALTER TABLE ONLY public.dhr_summary_draft
    ADD CONSTRAINT fk_dhr_summary_draft_instance FOREIGN KEY (dhr_instance_id) REFERENCES public.dhr_instance(id);

ALTER TABLE ONLY public.dhr_summary_evidence
    ADD CONSTRAINT fk_dhr_summary_evidence_record FOREIGN KEY (source_record_id) REFERENCES public.form_instance_record(id);

ALTER TABLE ONLY public.dhr_summary_evidence
    ADD CONSTRAINT fk_dhr_summary_evidence_version FOREIGN KEY (summary_version_id) REFERENCES public.dhr_summary_version(id);

ALTER TABLE ONLY public.dhr_summary_version
    ADD CONSTRAINT fk_dhr_summary_version_instance FOREIGN KEY (dhr_instance_id) REFERENCES public.dhr_instance(id);

ALTER TABLE ONLY public.dhr_summary_version
    ADD CONSTRAINT fk_dhr_summary_version_review_definition FOREIGN KEY (review_workflow_definition_id) REFERENCES public.workflow_definition(id);

ALTER TABLE ONLY public.dhr_summary_version
    ADD CONSTRAINT fk_dhr_summary_version_review_version FOREIGN KEY (review_workflow_version_id) REFERENCES public.workflow_definition_version(id);

ALTER TABLE ONLY public.equipment
    ADD CONSTRAINT fk_equipment_type FOREIGN KEY (equipment_type_id) REFERENCES public.equipment_type(id);

ALTER TABLE ONLY public.equipment_type
    ADD CONSTRAINT fk_equipment_type_category FOREIGN KEY (category_id) REFERENCES public.equipment_category(id);

ALTER TABLE ONLY public.product_family_member
    ADD CONSTRAINT fk_product_family_member_family FOREIGN KEY (product_family_id) REFERENCES public.product_family(id);

ALTER TABLE ONLY public.product_family_member
    ADD CONSTRAINT fk_product_family_member_product FOREIGN KEY (product_id) REFERENCES public.material(id);

ALTER TABLE ONLY public.product_process_version
    ADD CONSTRAINT fk_product_process_dhr_review_definition FOREIGN KEY (dhr_review_workflow_definition_id) REFERENCES public.workflow_definition(id);

ALTER TABLE ONLY public.product_process_version
    ADD CONSTRAINT fk_product_process_dhr_review_version FOREIGN KEY (dhr_review_workflow_version_id) REFERENCES public.workflow_definition_version(id);

ALTER TABLE ONLY public.production_line
    ADD CONSTRAINT fk_production_line_workshop FOREIGN KEY (workshop_id) REFERENCES public.workshop(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.workflow_definition_version
    ADD CONSTRAINT fk_workflow_definition_version_definition FOREIGN KEY (definition_id) REFERENCES public.workflow_definition(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.form_projection_batch
    ADD CONSTRAINT form_projection_batch_form_instance_id_fkey FOREIGN KEY (form_instance_id) REFERENCES public.form_instance_record(id);

ALTER TABLE ONLY public.form_projection_record
    ADD CONSTRAINT form_projection_record_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.form_projection_batch(id);

ALTER TABLE ONLY public.form_trace_value
    ADD CONSTRAINT form_trace_value_form_instance_id_fkey FOREIGN KEY (form_instance_id) REFERENCES public.form_instance_record(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.production_execution
    ADD CONSTRAINT production_execution_object_id_fkey FOREIGN KEY (object_id) REFERENCES public.production_object(id);

ALTER TABLE ONLY public.production_object
    ADD CONSTRAINT production_object_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_order(id);
