-- Actual independent HTTP-probe fixture, submitted in two batches after the 198-test suite.
-- Use only edhr_record_control_test_ops_quality_20261030. The preceding suite supplies its one active request,
-- users 41/42, their test-only signature certification, and role 4444 with workflow.intervene.
INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status,password_changed_at)
SELECT x.id,0,x.username,x.name,u.password_hash,'ACTIVE',CURRENT_TIMESTAMP FROM user_account u
CROSS JOIN (VALUES (43,'qa-target','QA新处理人'),(44,'qa-manager','QA干预人'),(45,'qa-viewer','QA无关查看人')) x(id,username,name) WHERE u.id=42;
INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,signature_password_hash,snapshot_data)
SELECT -x.id,'USER_PROFILE',x.id::text,'QA认证',x.id::text,x.name,s.signature_password_hash,'{}' FROM signature s
CROSS JOIN (VALUES (43,'QA新处理人'),(44,'QA干预人')) x(id,name) WHERE s.id=-42;
INSERT INTO role(id,tenant_id,code,name) VALUES (4445,0,'QA_LOG_VIEWER','QA日志查看') ON CONFLICT(id) DO NOTHING;
INSERT INTO role_permission(id,role_id,permission_id)
SELECT nextval('hibernate_sequence'),4445,id FROM permission p WHERE p.code='workflow.instances'
AND NOT EXISTS(SELECT 1 FROM role_permission rp WHERE rp.role_id=4445 AND rp.permission_id=p.id);
INSERT INTO user_role(id,user_id,role_id) VALUES (4444,44,4444),(4442,42,4445),(4443,43,4445),(4445,45,4445) ON CONFLICT(id) DO NOTHING;
UPDATE user_account SET password_changed_at=CURRENT_TIMESTAMP WHERE id IN (41,42);
UPDATE workflow_task SET candidate_snapshot='{"userIds":["42","43"]}'::jsonb,assignee_id='42' WHERE status='PENDING';
UPDATE workflow_node SET properties=jsonb_set(properties,'{config,buttonEvents}','[{"id":"qa-sign","event":"BEFORE","action":"TRANSFER","signatureMethod":"ACCOUNT_PASSWORD","enabled":true}]') WHERE node_type='APPROVAL';
INSERT INTO workflow_instance(id,definition_id,version_id,business_type,business_id,status,current_node_ids,initiator_id,started_at)
VALUES (9106,201,202,'SYNTHETIC_CASE','QA-GENERIC','RUNNING','204','41',LOCALTIMESTAMP);
INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot)
VALUES (9107,9106,204,'PENDING','42','{"userIds":["42","43"]}'::jsonb);
