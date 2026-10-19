--liquibase formatted sql
--changeset codex:0116-trace-field-single-binding splitStatements:false
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
            SELECT jsonb_build_array(COALESCE(b->>'tableId', ''), s.value)::TEXT AS source_key
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
                WHERE NOT conflicts ? jsonb_build_array(COALESCE(binding->>'tableId', ''), s.value#>>'{}')::TEXT;
                IF sources = '{}'::JSONB THEN CONTINUE; END IF;
                binding := jsonb_set(binding, '{sources}', sources);
            END IF;
            bindings := bindings || jsonb_build_array(binding);
        END LOOP;
        model := jsonb_set(model, '{projection,bindings}', bindings);
        IF design ? 'payload' THEN design := jsonb_set(design, '{payload}', model); ELSE design := model; END IF;
        UPDATE form_template_version SET model_design_json = design::TEXT,
            lock_version = COALESCE(lock_version, 0) + 1,
            updated_by = 'system:0116-trace-field-single-binding', updated_at = CURRENT_TIMESTAMP
        WHERE id = version_row.id;
    END LOOP;
END $$;
