--liquibase formatted sql
--changeset edhr:0052-product-process-document-pages

-- Page ranges belong to the relationship between an operation and a document
-- version. The same document version can therefore be shown on different
-- pages at different operations.
ALTER TABLE product_process_operation_document_binding ADD COLUMN IF NOT EXISTS page_start INTEGER;
ALTER TABLE product_process_operation_document_binding ADD COLUMN IF NOT EXISTS page_end INTEGER;
