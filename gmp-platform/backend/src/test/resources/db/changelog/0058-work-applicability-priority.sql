--liquibase formatted sql
--changeset edhr:0058-work-applicability-priority

UPDATE workflow_binding_rule
SET priority = CASE rule_type
    WHEN 'EXCEPTION' THEN 30
    WHEN 'SCOPED' THEN 20
    WHEN 'GLOBAL' THEN 10
    ELSE 10
END
WHERE business_type = 'WORK';
