--liquibase formatted sql
--changeset edhr:0002-seed-data
--validCheckSum: 9:66667c278c075f6f0fae02047f30e0b8
--validCheckSum: 9:1ce12afc133d77632f79ae871d79b6e8

-- ============================================================
-- Seed Data: Default tenant, admin user, core roles, permissions
-- ============================================================

-- Default tenant
INSERT INTO tenant (id, code, name, status) VALUES
(1, 'default', '默认租户', 'ACTIVE');

-- Default site
INSERT INTO site (id, tenant_id, code, name, status) VALUES
(1, 1, 'SITE-01', '主工厂', 'ACTIVE');

-- Default admin user (password: admin123, BCrypt encoded)
INSERT INTO user_account (id, tenant_id, username, password_hash, display_name, email, status) VALUES
(1, 1, 'admin', '$2a$10$2qksi9uRWGtf4q8NN0gmceSCwi/LsXEnAVfC4Of0y.sOK5q8G2Bby', '系统管理员', 'admin@zencas.com', 'ACTIVE');

-- Core roles
INSERT INTO role (id, tenant_id, code, name, description) VALUES
(1, 1, 'ADMIN', '系统管理员', '系统最高权限角色'),
(2, 1, 'QUALITY_MGR', '质量经理', '质量管理与审核流程配置'),
(3, 1, 'OPERATOR', '生产操作员', '生产操作与表单填写'),
(4, 1, 'WORKFLOW_ADMIN', '流程管理员', '流程监控与干预');

-- --------------------------------------------------
-- Permissions (tree structured via parent_code)
-- --------------------------------------------------

-- Dashboard
INSERT INTO permission (id, code, name, type, parent_code, sort_order) VALUES
(10, 'dashboard', '首页工作台', 'PAGE', NULL, 1),
(11, 'dashboard.todo', '我的待办', 'PAGE', 'dashboard', 1),
(12, 'dashboard.done', '我的已办', 'PAGE', 'dashboard', 2);

-- Workflow Center
INSERT INTO permission (id, code, name, type, parent_code, sort_order) VALUES
(20, 'workflow', '流程中心', 'PAGE', NULL, 2),
(21, 'workflow.review-templates', '审核流程模板', 'PAGE', 'workflow', 1),
(22, 'workflow.txn-templates', '事务流程模板', 'PAGE', 'workflow', 2),
(23, 'workflow.binding-rules', '流程绑定配置', 'PAGE', 'workflow', 3),
(24, 'workflow.instances', '流程实例', 'PAGE', 'workflow', 4),
(25, 'workflow.logs', '流程日志', 'PAGE', 'workflow', 5),
(26, 'workflow.template.edit', '编辑流程模板', 'BUTTON', 'workflow.review-templates', 1),
(27, 'workflow.template.publish', '发布流程模板', 'BUTTON', 'workflow.review-templates', 2),
(28, 'workflow.task.approve', '审核通过/退回', 'BUTTON', 'workflow.instances', 1),
(29, 'workflow.task.transfer', '转办', 'BUTTON', 'workflow.instances', 2),
(30, 'workflow.intervene', '流程干预', 'BUTTON', 'workflow.instances', 3);

-- Master Data
INSERT INTO permission (id, code, name, type, parent_code, sort_order) VALUES
(40, 'master-data', '基础主数据', 'PAGE', NULL, 3),
(41, 'master-data.product-families', '产品家族', 'PAGE', 'master-data', 1),
(42, 'master-data.units', '计量单位', 'PAGE', 'master-data', 2),
(43, 'master-data.equipment', '设备管理', 'PAGE', 'master-data', 3),
(44, 'master-data.sop-documents', 'SOP文档', 'PAGE', 'master-data', 4),
(45, 'master-data.operations', '工序管理', 'PAGE', 'master-data', 5),
(46, 'master-data.routes', '工艺路线', 'PAGE', 'master-data', 6),
(47, 'master-data.sites', '工厂/车间/产线', 'PAGE', 'master-data', 7),
(48, 'master-data.edit', '编辑主数据', 'BUTTON', 'master-data', 1);

-- System
INSERT INTO permission (id, code, name, type, parent_code, sort_order) VALUES
(60, 'system', '系统管理', 'PAGE', NULL, 4),
(62, 'system.organization', '组织管理', 'PAGE', 'system', 2),
(63, 'system.users', '用户管理', 'PAGE', 'system', 3),
(64, 'system.roles', '角色管理', 'PAGE', 'system', 4),
(66, 'system.numbering-rules', '编码规则', 'PAGE', 'system', 6),
(67, 'system.audit-logs', '审计日志', 'PAGE', 'system', 7),
(68, 'system.signatures', '签名记录', 'PAGE', 'system', 8),
(70, 'system.edit', '编辑系统配置', 'BUTTON', 'system', 1);

-- Set sequence to a high value (MUST be created before role_permission insert)
CREATE SEQUENCE IF NOT EXISTS hibernate_sequence START WITH 10000;

-- --------------------------------------------------
-- Assign all permissions to ADMIN role
-- --------------------------------------------------
INSERT INTO role_permission (id, role_id, permission_id)
SELECT nextval('hibernate_sequence') AS id, 1 AS role_id, p.id AS permission_id
FROM permission p;

-- Assign ADMIN role to admin user
INSERT INTO user_role (id, user_id, role_id) VALUES (1, 1, 1);
