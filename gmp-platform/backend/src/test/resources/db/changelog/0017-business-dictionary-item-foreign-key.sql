--liquibase formatted sql
--changeset edhr:0017-business-dictionary-item-foreign-key

ALTER TABLE business_dictionary_item
    ADD CONSTRAINT fk_business_dictionary_item_dictionary
    FOREIGN KEY (dictionary_id) REFERENCES business_dictionary(id)
    ON DELETE RESTRICT;
