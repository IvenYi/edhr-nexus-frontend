--liquibase formatted sql
--changeset codex:0105-dhr-office-attachments
-- Standard DOCX/XLSX MIME types exceed the original 64-character field.
ALTER TABLE dhr_attachment ALTER COLUMN mime_type TYPE VARCHAR(128);
