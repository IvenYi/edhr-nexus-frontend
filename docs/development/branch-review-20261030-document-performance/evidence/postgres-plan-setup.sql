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
ALTER TABLE public.document_category ADD PRIMARY KEY(id);
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
ALTER TABLE public.sop_document ADD PRIMARY KEY(id);
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
ALTER TABLE public.document_version ADD PRIMARY KEY(id);
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
ALTER TABLE public.file_object ADD PRIMARY KEY(id);
CREATE INDEX idx_document_version_document ON document_version(document_id,created_at DESC);
CREATE INDEX idx_sop_document_category_id ON sop_document(category_id);
INSERT INTO document_category(id,name) SELECT g,'分类'||g FROM generate_series(1,4) g;
INSERT INTO file_object(id,original_name,stored_path,mime_type,file_size) SELECT 50000+g,'文件'||g,'/synthetic/document-plan/'||g,'application/pdf',123 FROM generate_series(0,99) g;
INSERT INTO sop_document(id,title,category_id,updated_at) SELECT g,'文档'||g,1+(g%4),TIMESTAMP '2026-01-01' + g*INTERVAL '1 second' FROM generate_series(1,10000) g;
INSERT INTO document_version(id,document_id,version,code,file_id) SELECT d*10+v,d,'V'||v,'CODE-'||d||'-'||v||CASE WHEN d%100=0 THEN '-needle' ELSE '' END,50000+(d%100) FROM generate_series(1,10000) d CROSS JOIN generate_series(1,3) v;
ANALYZE sop_document; ANALYZE document_version; ANALYZE document_category; ANALYZE file_object;
