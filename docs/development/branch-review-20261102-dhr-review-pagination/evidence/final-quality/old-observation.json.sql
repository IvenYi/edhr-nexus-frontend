SELECT t.id AS task_id,t.status AS task_status,t.assignee_id,t.candidate_snapshot,t.opinion,t.action,
  t.created_at,t.completed_at,n.name AS node_name,n.properties,v.id AS version_id,v.version_no,v.snapshot_hash,
  v.check_result_snapshot,
  v.dhr_instance_id,v.submitted_by,v.submitted_at,d.dhr_no,d.object_no,d.object_type,
  d.work_order_no,d.product_name,r.status AS review_status,r.workflow_instance_id
FROM dhr_summary_review r JOIN workflow_task t ON t.instance_id=r.workflow_instance_id
JOIN workflow_node n ON n.id=t.node_id JOIN dhr_summary_version v ON v.id=r.summary_version_id
JOIN dhr_instance d ON d.id=v.dhr_instance_id WHERE v.tenant_id='default'
 AND t.id<? ORDER BY t.id DESC LIMIT 64