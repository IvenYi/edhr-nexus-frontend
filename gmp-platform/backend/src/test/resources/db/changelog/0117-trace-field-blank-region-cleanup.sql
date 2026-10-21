--liquibase formatted sql
--changeset codex:0117-trace-field-blank-region-cleanup splitStatements:false
-- Follow-up to applied 0116: blank table IDs have the same main-table identity as omission.
-- Match Java String.isBlank, without trimming nonblank IDs or changing the 0116 checksum.
-- Remove every trace assignment of a multiply assigned field, never pick a winner.
-- Only template configuration changes; saved instances and execution/DHR evidence stay intact.
DO $$
DECLARE
    version_row RECORD;
    design JSONB;
    model JSONB;
    conflicts JSONB;
    binding JSONB;
    sources JSONB;
    bindings JSONB;
BEGIN
    FOR version_row IN
        SELECT id, model_design_json FROM form_template_version
        WHERE model_design_json LIKE '%"formTrace"%' FOR UPDATE
    LOOP
        design := version_row.model_design_json::JSONB;
        model := COALESCE(design->'payload', design);
        IF jsonb_typeof(model#>'{projection,bindings}') IS DISTINCT FROM 'array' THEN CONTINUE; END IF;
        SELECT jsonb_object_agg(source_key, TRUE) INTO conflicts FROM (
            SELECT jsonb_build_array(regexp_replace(COALESCE(b->>'tableId', ''), U&'^[\0009-\000D\001C-\0020\1680\2000-\2006\2008-\200A\2028\2029\205F\3000]*$', ''), s.value)::TEXT AS source_key
            FROM jsonb_array_elements(model#>'{projection,bindings}') b
            CROSS JOIN LATERAL jsonb_each_text(COALESCE(b->'sources', '{}'::JSONB)) s
            WHERE b->>'modelId' = 'formTrace'
            GROUP BY source_key HAVING COUNT(*) > 1
        ) duplicates;
        IF conflicts IS NULL THEN CONTINUE; END IF;
        bindings := '[]'::JSONB;
        FOR binding IN SELECT value FROM jsonb_array_elements(model#>'{projection,bindings}') LOOP
            IF binding->>'modelId' = 'formTrace' THEN
                SELECT COALESCE(jsonb_object_agg(s.key, s.value), '{}'::JSONB) INTO sources
                FROM jsonb_each(binding->'sources') s
                WHERE NOT conflicts ? jsonb_build_array(regexp_replace(COALESCE(binding->>'tableId', ''), U&'^[\0009-\000D\001C-\0020\1680\2000-\2006\2008-\200A\2028\2029\205F\3000]*$', ''), s.value#>>'{}')::TEXT;
                IF sources = '{}'::JSONB THEN CONTINUE; END IF;
                binding := jsonb_set(binding, '{sources}', sources);
            END IF;
            bindings := bindings || jsonb_build_array(binding);
        END LOOP;
        model := jsonb_set(model, '{projection,bindings}', bindings);
        IF design ? 'payload' THEN design := jsonb_set(design, '{payload}', model); ELSE design := model; END IF;
        UPDATE form_template_version SET model_design_json = design::TEXT,
            lock_version = COALESCE(lock_version, 0) + 1,
            updated_by = 'system:0117-trace-field-blank-region-cleanup', updated_at = CURRENT_TIMESTAMP
        WHERE id = version_row.id;
    END LOOP;
END $$;
