--liquibase formatted sql
--changeset codex:0109-saved-form-trace-index
CREATE TABLE form_trace_value (
    tenant_id VARCHAR(64) NOT NULL,
    form_instance_id BIGINT NOT NULL REFERENCES form_instance_record(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL,
    field_id VARCHAR(128) NOT NULL,
    field_name VARCHAR(512) NOT NULL,
    table_id VARCHAR(128) NOT NULL,
    row_key VARCHAR(512) NOT NULL,
    row_index INTEGER NOT NULL,
    value_text VARCHAR(512) NOT NULL,
    PRIMARY KEY (form_instance_id,table_id,row_key,item_id,field_id)
);
CREATE INDEX form_trace_lookup ON form_trace_value(tenant_id,item_id,value_text,form_instance_id);

--changeset codex:0109-saved-form-trace-index-baseline dbms:postgresql
-- Reindex saved MVP content from each instance's own frozen mappings, not from current templates or statistical facts.
WITH bindings AS (
    SELECT f.id,f.tenant_id,f.snapshot_json::jsonb AS form,f.values_json::jsonb AS values,
           binding,coalesce(binding->>'tableId','') AS table_id
    FROM form_instance_record f
    CROSS JOIN LATERAL jsonb_array_elements(coalesce(f.snapshot_json::jsonb->'projection'->'bindings','[]'::jsonb)) binding
    WHERE binding->>'modelId'='formTrace' AND binding->>'enabled'='true'
), scopes AS (
    SELECT b.*, 'form' AS row_key,-1 AS row_index,b.form->'fields' AS fields,b.values AS row_values
    FROM bindings b WHERE b.table_id=''
    UNION ALL
    SELECT b.*,coalesce(nullif(row.value->>'__rowId',''),'legacy:'||row.ordinality),
           (row.ordinality-1)::integer,table_field->'typeConfig'->'columns',row.value
    FROM bindings b
    CROSS JOIN LATERAL jsonb_array_elements(b.form->'fields') table_field
    CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(b.values->b.table_id)='array' THEN b.values->b.table_id ELSE '[]'::jsonb END
    ) WITH ORDINALITY AS row(value,ordinality)
    WHERE b.table_id<>'' AND table_field->>'id'=b.table_id AND table_field->>'type'='subTable'
), mapped AS (
    SELECT s.tenant_id,s.id,source.key AS item_id,source.value AS field_id,field->>'name' AS field_name,
           s.table_id,s.row_key,s.row_index,field,s.form->'projection'->'lookupItems'->source.key AS item,
           s.row_values->source.value AS raw
    FROM scopes s
    CROSS JOIN LATERAL jsonb_each_text(coalesce(s.binding->'sources','{}'::jsonb)) source
    CROSS JOIN LATERAL jsonb_array_elements(coalesce(s.fields,'[]'::jsonb)) field
    WHERE field->>'id'=source.value
), normalized AS (
    SELECT *,btrim(CASE
        WHEN field->>'type' IN ('text','singleSelect') AND jsonb_typeof(raw)='string' THEN raw#>>'{}'
        WHEN field->>'type'='reference' AND jsonb_typeof(raw)='object' AND jsonb_typeof(raw->'code')='string'
            AND coalesce(raw->>'id','')~'^[1-9][0-9]*$'
            AND raw->>'sourceType'=field->'typeConfig'->>'sourceType'
            AND CASE WHEN jsonb_typeof(item->'referenceSources')='array'
                THEN jsonb_exists(item->'referenceSources',field->'typeConfig'->>'sourceType')
                ELSE CASE item_id
                    WHEN 'equipmentText' THEN field->'typeConfig'->>'sourceType'='equipment'
                    WHEN 'serialNumberText' THEN field->'typeConfig'->>'sourceType'='serialNumber'
                    WHEN 'lookup_production_batch' THEN field->'typeConfig'->>'sourceType' IN ('productionBatch','serialNumber')
                    WHEN 'lookup_related_batch' THEN field->'typeConfig'->>'sourceType'='productionBatch'
                    WHEN 'lookup_work_order' THEN field->'typeConfig'->>'sourceType'='workOrder'
                    WHEN 'lookup_material_code' THEN field->'typeConfig'->>'sourceType'='material'
                    WHEN 'lookup_product_code' THEN field->'typeConfig'->>'sourceType'='product'
                    ELSE FALSE END
                END THEN raw->>'code'
    END) AS value_text FROM mapped
)
INSERT INTO form_trace_value(tenant_id,form_instance_id,item_id,field_id,field_name,table_id,row_key,row_index,value_text)
SELECT tenant_id,id,item_id,field_id,coalesce(field_name,field_id),table_id,row_key,row_index,value_text
FROM normalized WHERE value_text IS NOT NULL AND length(value_text) BETWEEN 1 AND 512
ON CONFLICT DO NOTHING;
