--liquibase formatted sql
--changeset edhr:0016-remove-material-type-page-permission

DELETE FROM role_permission
WHERE permission_id IN (
    SELECT id
    FROM permission
    WHERE code = 'master-data.material-types'
);

DELETE FROM permission
WHERE code = 'master-data.material-types';
