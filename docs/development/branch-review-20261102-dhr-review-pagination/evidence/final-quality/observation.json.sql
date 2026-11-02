WITH visible AS NOT MATERIALIZED (SELECT t.id AS task_id,t.status AS task_status,t.opinion,t.action,t.created_at,t.completed_at,n.name AS node_name,
  v.id AS version_id,v.version_no,v.snapshot_hash,v.dhr_instance_id,v.submitted_by,v.submitted_at,
  d.dhr_no,d.object_no,d.work_order_no,d.product_name
FROM dhr_summary_review r JOIN workflow_task t ON t.instance_id=r.workflow_instance_id
JOIN workflow_node n ON n.id=t.node_id JOIN dhr_summary_version v ON v.id=r.summary_version_id
JOIN dhr_instance d ON d.id=v.dhr_instance_id WHERE v.tenant_id='default'
 AND r.status='PENDING_REVIEW' AND t.status IN ('PENDING','PROCESSING') AND (
   CASE jsonb_typeof(t.candidate_snapshot->'unrestricted')
     WHEN 'boolean' THEN t.candidate_snapshot->>'unrestricted'='true'
     WHEN 'string' THEN regexp_replace(t.candidate_snapshot->>'unrestricted',
       '^[\x01-\x20]+|[\x01-\x20]+$', '', 'g')='true'
     WHEN 'number' THEN t.candidate_snapshot->>'unrestricted' ~ '^-?[0-9]+$'
       AND (t.candidate_snapshot->>'unrestricted')::numeric<>0
     ELSE FALSE END
   OR CASE
     WHEN (jsonb_typeof(t.candidate_snapshot->'userIds')='array' AND t.candidate_snapshot->'userIds'<>'[]'::jsonb)
       OR (jsonb_typeof(t.candidate_snapshot->'userIds')='object' AND t.candidate_snapshot->'userIds'<>'{}'::jsonb)
     THEN EXISTS (
       SELECT 1 FROM (
         SELECT value FROM jsonb_array_elements(CASE WHEN jsonb_typeof(t.candidate_snapshot->'userIds')='array'
           THEN t.candidate_snapshot->'userIds' ELSE '[]'::jsonb END)
         UNION ALL
         SELECT value FROM jsonb_each(CASE WHEN jsonb_typeof(t.candidate_snapshot->'userIds')='object'
           THEN t.candidate_snapshot->'userIds' ELSE '{}'::jsonb END)
       ) candidates WHERE jsonb_typeof(value) NOT IN ('object','array')
         AND COALESCE(value#>>'{}','null')=?
     ) ELSE t.assignee_id=? END
 )
), page AS (SELECT * FROM visible ORDER BY task_id DESC LIMIT ? OFFSET ?)
SELECT page.*,totals.total FROM (SELECT COUNT(*) AS total FROM visible) totals
LEFT JOIN page ON TRUE ORDER BY page.task_id DESC
