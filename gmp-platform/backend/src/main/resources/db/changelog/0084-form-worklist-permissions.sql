--liquibase formatted sql
--changeset codex:0084-form-worklist-permissions
--validCheckSum: 9:7d02ccb2e185895f184d04b8d95f4d8e
INSERT INTO permission(id,code,name,type,parent_code,sort_order)
SELECT nextval('hibernate_sequence'),'form-management.filling','个人表单填报查询','BUTTON','production.execution',2
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code='form-management.filling');
INSERT INTO permission(id,code,name,type,parent_code,sort_order)
SELECT nextval('hibernate_sequence'),'form-management.review','个人表单审批查询','BUTTON','production.execution',3
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE code='form-management.review');
INSERT INTO role_permission(id,role_id,permission_id)
SELECT nextval('hibernate_sequence'),r.id,p.id FROM role r
JOIN permission p ON p.code IN ('form-management.filling','form-management.review')
WHERE r.code='ADMIN' AND NOT EXISTS(SELECT 1 FROM role_permission rp WHERE rp.role_id=r.id AND rp.permission_id=p.id);
