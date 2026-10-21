--liquibase formatted sql
--changeset codex:0108-form-lookup-items
CREATE TABLE form_lookup_item (
    id varchar(64) NOT NULL,
    tenant_id varchar(64) NOT NULL DEFAULT 'default',
    name varchar(80) NOT NULL,
    description varchar(512) NOT NULL DEFAULT '',
    value_type varchar(16) NOT NULL DEFAULT 'text' CHECK (value_type = 'text'),
    builtin boolean NOT NULL DEFAULT false,
    revision bigint NOT NULL DEFAULT 1,
    created_by varchar(128),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by varchar(128),
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_id, id)
);
CREATE UNIQUE INDEX uk_form_lookup_item_name ON form_lookup_item (tenant_id, lower(name));

INSERT INTO form_lookup_item (id,name,description,builtin) VALUES
('materialLotText','物料批号','记录中的物料批号；不根据文本建立物料使用关系。',true),
('serialNumberText','产品序列号','记录中的产品 SN。',true),
('equipmentText','设备编号','记录中提及的设备编号；不等同于实际设备使用。',true),
('teamText','责任班组','记录中的班组名称或编号。',true),
('documentNumberText','关联单据号','记录中提及的单据编号。',true),
('lookup_production_batch','生产批次号','记录中填写的生产批次号；系统实际归属另外保留。',true),
('lookup_work_order','工单号','记录中填写的工单号。',true),
('lookup_material_code','物料编码','按填写的物料编码查找，不自动解析物料身份。',true),
('lookup_product_code','产品编码','记录中的产品编码。',true),
('lookup_related_batch','相关生产批次号','记录中提及的其他生产批次，不改变当前生产归属。',true),
('lookup_order_number','客户订单号','记录中的客户订单编号。',true),
('lookup_supplier_lot','供应商批号','供应商提供的批号，与内部物料批号分别查询。',true);
