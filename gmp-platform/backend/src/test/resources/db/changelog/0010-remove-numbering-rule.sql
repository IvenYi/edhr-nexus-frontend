--liquibase formatted sql
--changeset edhr:0010-remove-numbering-rule

DELETE FROM role_permission
WHERE permission_id IN (
    SELECT id FROM permission WHERE code = 'system.numbering-rules'
);

DELETE FROM permission WHERE code = 'system.numbering-rules';

DROP TABLE IF EXISTS numbering_rule;
