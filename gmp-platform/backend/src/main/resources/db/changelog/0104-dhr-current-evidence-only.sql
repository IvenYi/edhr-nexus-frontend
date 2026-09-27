--liquibase formatted sql
--changeset codex:0104-dhr-current-evidence-only splitStatements:false

-- Development-model correction. Back up the database before applying: old frozen
-- summaries are not valid current attestations. Recover layout as a draft only.
-- Do not rewrite applied migrations or reconstruct historical human confirmations.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM dhr_summary_version v
               WHERE v.evidence_model_version <> 2 AND
                 (v.review_mode <> 'NONE' OR EXISTS
                   (SELECT 1 FROM dhr_summary_review r WHERE r.summary_version_id=v.id))) THEN
        RAISE EXCEPTION 'Legacy DHR has a review workflow; stop for explicit dependency cleanup';
    END IF;
    IF EXISTS (SELECT 1 FROM dhr_summary_version v JOIN dhr_instance d ON d.id=v.dhr_instance_id
               WHERE v.evidence_model_version <> 2 AND d.status <> 'COMPLETED') THEN
        RAISE EXCEPTION 'Legacy DHR is not completed; stop before altering production lifecycle';
    END IF;
END $$;

CREATE TEMP TABLE obsolete_dhr_summary ON COMMIT DROP AS
SELECT * FROM dhr_summary_version WHERE evidence_model_version <> 2;

-- An existing current draft or current frozen version always wins. Use the most
-- recent obsolete layout only when there is no current work to preserve.
INSERT INTO dhr_summary_draft(id,tenant_id,dhr_instance_id,overlay_directory_json,
    evidence_placement_json,source_scope_hash,revision,created_by,created_at,updated_by,updated_at)
SELECT v.id,v.tenant_id,v.dhr_instance_id,v.overlay_directory_snapshot,
    COALESCE((SELECT jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'recordId',e.source_record_id::text,'targetNodeKey',e.target_node_key,
        'beforeNodeKey',e.before_node_key,'displayOrder',e.display_order,'displayName',e.display_name)) ORDER BY e.id)::text
      FROM dhr_summary_evidence e
      JOIN form_instance_record f ON f.id=e.source_record_id AND f.tenant_id=e.tenant_id
      JOIN dhr_instance d ON d.id=v.dhr_instance_id AND d.tenant_id=v.tenant_id
      WHERE e.summary_version_id=v.id AND e.tenant_id=v.tenant_id
        AND f.object_id=d.production_object_id AND f.source_type='PRODUCTION_EXECUTION'
        AND (e.display_name IS NOT NULL OR (e.origin_kind<>'DIRECTORY'
             AND e.target_node_key NOT IN ('source-work','source-custom','source-directory')))), '[]'),
    NULL,1,'migration:0104',CURRENT_TIMESTAMP,'migration:0104',CURRENT_TIMESTAMP
FROM obsolete_dhr_summary v
WHERE NOT EXISTS (SELECT 1 FROM obsolete_dhr_summary newer
                  WHERE newer.tenant_id=v.tenant_id AND newer.dhr_instance_id=v.dhr_instance_id AND newer.version_no>v.version_no)
  AND NOT EXISTS (SELECT 1 FROM dhr_summary_version current_version
                  WHERE current_version.tenant_id=v.tenant_id AND current_version.dhr_instance_id=v.dhr_instance_id
                    AND current_version.evidence_model_version=2)
ON CONFLICT (tenant_id,dhr_instance_id) DO NOTHING;

UPDATE dhr_instance d SET summary_status='DRAFT',updated_by='migration:0104',updated_at=CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM obsolete_dhr_summary v WHERE v.tenant_id=d.tenant_id AND v.dhr_instance_id=d.id)
  AND NOT EXISTS (SELECT 1 FROM dhr_summary_version v
                  WHERE v.tenant_id=d.tenant_id AND v.dhr_instance_id=d.id AND v.evidence_model_version=2);

-- Preserve original audit events verbatim, and record the maintenance action on
-- the DHR itself. A NULL scope hash deliberately requires a fresh save/check.
INSERT INTO audit_event(id,tenant_id,entity_type,entity_id,action,content_before,content_after,
    operator_id,operator_name,source,reason,module_name,menu_name,function_name,data_summary)
SELECT nextval('hibernate_sequence'),v.tenant_id,'DHR_INSTANCE',v.dhr_instance_id::text,'MIGRATE',
    jsonb_build_object('removedSummaryVersions',jsonb_agg(jsonb_build_object(
        'id',v.id::text,'versionNo',v.version_no,'snapshotHash',v.snapshot_hash) ORDER BY v.version_no)),
    jsonb_build_object('summaryStatus',d.summary_status,'requiresFreshCheck',d.summary_status='DRAFT'),
    'migration:0104','系统数据迁移','MIGRATION','修正开发阶段旧汇总模型；保留源记录，目录转草稿，核查须重新执行',
    '记录','DHR管理','旧汇总模型清理',v.dhr_instance_id::text
FROM obsolete_dhr_summary v JOIN dhr_instance d ON d.id=v.dhr_instance_id AND d.tenant_id=v.tenant_id
GROUP BY v.tenant_id,v.dhr_instance_id,d.summary_status;

DELETE FROM dhr_summary_evidence e USING obsolete_dhr_summary v WHERE e.summary_version_id=v.id;
DELETE FROM dhr_summary_version v USING obsolete_dhr_summary old WHERE v.id=old.id;
ALTER TABLE dhr_summary_version DROP COLUMN evidence_model_version;
ALTER TABLE dhr_summary_version ALTER COLUMN check_result_snapshot SET NOT NULL;
