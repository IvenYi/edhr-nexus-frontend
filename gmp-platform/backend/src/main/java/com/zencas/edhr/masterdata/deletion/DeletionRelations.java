package com.zencas.edhr.masterdata.deletion;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

/** Explicit business references, including references that predate database foreign keys. */
final class DeletionRelations {
    record Entity(String label, String module, String path, String permission, boolean history) {}
    record Reference(String parent, String child, String column, boolean owned, String parentField, String filter) {
        Reference(String parent, String child, String column, boolean owned) {
            this(parent, child, column, owned, "id", "");
        }
    }

    static final Map<String, Entity> ENTITIES = new LinkedHashMap<>();
    static {
        add("material", "物料版本", "物料管理", "materials", false);
        add("product_family", "产品簇", "产品簇", "product-families", false);
        add("product_family_member", "产品簇成员", "产品簇", "product-families", false);
        add("product", "历史产品", "产品管理", "products", false);
        add("product_version", "历史产品版本", "产品管理", "products", false);
        add("product_process", "制程配置", "产品管理", "products", false);
        add("product_process_version", "制程配置版本", "产品管理", "products", false);
        add("product_process_operation_binding", "制程工序", "产品管理", "products", false);
        add("product_process_operation_document_binding", "工序文档绑定", "产品管理", "products", false);
        add("product_process_operation_form_binding", "工序表单绑定", "产品管理", "products", false);
        add("product_process_operation_sop_binding", "工序 SOP 绑定", "产品管理", "products", false);
        add("operation", "工序", "工序管理", "operations", false);
        add("operation_category", "工序分类", "工序管理", "operations", false);
        add("route", "工艺路线", "工艺路线", "routes", false);
        add("route_version", "工艺路线版本", "工艺路线", "routes", false);
        add("route_node", "路线工序节点", "工艺路线", "routes", false);
        add("route_relation", "路线连线", "工艺路线", "routes", false);
        add("route_operation", "路线工序", "工艺路线", "routes", false);
        add("process_definition", "历史制程定义", "工艺路线", "routes", false);
        add("process_definition_version", "历史制程版本", "工艺路线", "routes", false);
        add("process_route_binding", "历史路线绑定", "工艺路线", "routes", false);
        add("traveler_template", "流转单模板", "工艺路线", "routes", false);
        add("sop_document", "文档", "文档管理", "documents", false);
        add("document_version", "文档版本", "文档管理", "documents", false);
        add("document_category", "文档分类", "文档管理", "documents", false);
        add("form_template", "表单模板", "表单模板", "form-templates", false);
        add("form_template_version", "表单模板版本", "表单模板", "form-templates", false);
        for (String table : List.of("form_section", "form_field", "form_table", "form_validation_rule", "form_signature_block", "form_review_block", "form_template_analysis", "form_template_source_revision"))
            add(table, "表单设计内容", "表单模板", "form-templates", false);
        add("dhr_template", "批记录模板", "批记录模板", "batch-record-templates", false);
        add("dhr_template_version", "批记录模板版本", "批记录模板", "batch-record-templates", false);
        add("dhr_directory", "批记录目录", "批记录模板", "batch-record-templates", false);
        add("dhr_template_item", "批记录表单引用", "批记录模板", "batch-record-templates", false);
        add("template_category", "模板分类", "表单模板", "form-templates", false);
        add("release_form_template", "放行表模板", "批记录模板", "batch-record-templates", false);
        add("equipment_category", "设备分类", "设备类型", "equipment-types", false);
        add("equipment_type", "设备类型", "设备类型", "equipment-types", false);
        add("equipment", "设备", "设备列表", "equipment", false);
        add("workshop", "车间", "车间管理", "workshops", false);
        add("production_line", "产线", "车间管理", "workshops", false);
        add("unit_of_measure", "计量单位", "业务字典", "/system/dictionaries", false);
        add("work_order", "工单", "生产 / 生产准备 / 工单管理", "/production/work-orders", true);
        add("production_object", "生产对象", "生产 / 生产准备 / 批次管理", "/production/batches", true);
        for (String table : List.of("batch", "serial_number", "operation_execution", "dhr_evidence_item", "release_order"))
            add(table, "生产追溯记录", "生产 / 批次管理", "/production/batches", true);
        add("dhr_instance", "DHR 实例", "记录 / DHR 管理", "/dhr-management/list", true);
        for (String table : List.of("form_instance", "form_instance_record", "form_field_value"))
            add(table, "表单实例", "表单管理 / 表单实例", "/form-management/list", true);
        add("workflow_binding_rule", "作业适用规则", "生产 / 生产配置 / 作业模板", "/production/work-templates", false);
        add("work_form_process_reference", "作业表单节点", "生产 / 生产配置 / 作业模板", "/production/work-templates", false);
        add("deletion_form_reference", "表单使用记录", "生产 / 生产配置 / 作业模板", "/production/work-templates", false);
        add("workflow_definition_version", "作业模板版本", "生产 / 生产配置 / 作业模板", "/production/work-templates", false);
        add("workflow_definition", "作业模板", "生产 / 生产配置 / 作业模板", "/production/work-templates", false);
    }

    private static void add(String table, String label, String module, String path, boolean history) {
        String url = path.startsWith("/") ? path : "/master-data/" + path;
        String permission = url.substring(1).replace('/', '.');
        if (url.equals("/form-management/list")) permission = "form-management.list";
        ENTITIES.put(table, new Entity(label, module, url, permission, history));
    }

    static final List<Reference> REFERENCES = List.of(
        new Reference("material", "work_order", "product_id", false),
        new Reference("material", "dhr_instance", "product_id", false),
        new Reference("material", "product_family_member", "product_id", false),
        new Reference("material", "product_process", "owner_id", true, "id", "owner_type = 'PRODUCT'"),
        new Reference("material", "workflow_binding_rule", "product_id", false),
        new Reference("product_family", "product_family_member", "product_family_id", false),
        new Reference("product_family", "product_process", "owner_id", true, "id", "owner_type = 'PRODUCT_FAMILY'"),
        new Reference("product_family", "product", "family_id", false),
        new Reference("product_family", "route", "deletion_family_id", false),
        new Reference("product_family", "dhr_template", "product_family_id", false),
        new Reference("product_family", "process_definition", "product_family_id", false),
        new Reference("product_family", "workflow_binding_rule", "product_family_id", false),
        new Reference("product", "product_version", "product_id", true),
        new Reference("product_version", "batch", "product_version_id", false),
        new Reference("product_version", "serial_number", "product_version_id", false),
        new Reference("product_process", "product_process_version", "product_process_id", false),
        new Reference("product_process_version", "work_order", "process_version_id", false),
        new Reference("product_process_version", "production_object", "process_version_id", false),
        new Reference("product_process_version", "dhr_instance", "process_version_id", false),
        new Reference("product_process_version", "product_process_operation_binding", "product_process_version_id", true),
        new Reference("product_process_operation_binding", "product_process_operation_document_binding", "product_process_operation_binding_id", true),
        new Reference("product_process_operation_binding", "product_process_operation_form_binding", "product_process_operation_binding_id", true),
        new Reference("product_process_operation_binding", "product_process_operation_sop_binding", "product_process_operation_binding_id", true),
        new Reference("operation", "route_node", "operation_id", false),
        new Reference("operation", "route_operation", "operation_id", false),
        new Reference("operation", "product_process_operation_binding", "operation_id", false),
        new Reference("operation", "workflow_binding_rule", "operation_id", false),
        new Reference("operation", "operation_execution", "operation_id", false),
        new Reference("operation", "form_instance", "operation_id", false),
        new Reference("operation_category", "operation", "operation_category", false, "name", ""),
        new Reference("route", "route_version", "route_id", true),
        new Reference("route", "route_operation", "route_id", true),
        new Reference("route", "process_route_binding", "route_id", false),
        new Reference("route", "traveler_template", "route_id", false),
        new Reference("route_version", "route_node", "route_version_id", true),
        new Reference("route_version", "route_relation", "route_version_id", true),
        new Reference("route_version", "product_process_version", "route_version_id", false),
        new Reference("route_version", "dhr_instance", "route_version_id", false),
        new Reference("sop_document", "document_version", "document_id", true),
        new Reference("sop_document", "product_process_operation_sop_binding", "sop_document_id", false),
        new Reference("document_version", "product_process_operation_document_binding", "document_version_id", false),
        new Reference("document_category", "sop_document", "category_id", false),
        new Reference("form_template", "form_template_version", "template_id", true),
        new Reference("form_template", "dhr_template_item", "form_template_id", false),
        new Reference("form_template", "form_instance", "form_template_id", false),
        new Reference("form_template", "form_instance_record", "template_id", false),
        new Reference("form_template", "form_template_analysis", "template_id", true),
        new Reference("form_template", "form_template_source_revision", "template_id", true),
        new Reference("form_template_version", "dhr_template_item", "form_template_version_id", false),
        new Reference("form_template_version", "product_process_operation_form_binding", "form_template_version_id", false),
        new Reference("form_template_version", "work_form_process_reference", "form_template_version_id", false),
        new Reference("form_template_version", "deletion_form_reference", "form_template_version_id", false),
        new Reference("form_template_version", "form_instance", "form_template_version_id", false),
        new Reference("form_template_version", "form_instance_record", "version_id", false),
        new Reference("form_template_version", "form_section", "version_id", true),
        new Reference("form_template_version", "form_signature_block", "version_id", true),
        new Reference("form_template_version", "form_review_block", "version_id", true),
        new Reference("form_template_version", "form_template_analysis", "version_id", true),
        new Reference("form_template_version", "form_template_source_revision", "version_id", true),
        new Reference("form_section", "form_field", "section_id", true),
        new Reference("form_section", "form_table", "section_id", true),
        new Reference("form_field", "form_validation_rule", "field_id", true),
        new Reference("form_field", "form_field_value", "form_field_id", false),
        new Reference("dhr_template", "dhr_template_version", "dhr_template_id", true),
        new Reference("dhr_template", "dhr_instance", "dhr_template_id", false),
        new Reference("dhr_template_version", "dhr_directory", "version_id", true),
        new Reference("dhr_template_version", "product_process_version", "dhr_template_version_id", false),
        new Reference("dhr_template_version", "dhr_instance", "dhr_template_version_id", false),
        new Reference("dhr_directory", "dhr_directory", "parent_id", true),
        new Reference("dhr_directory", "dhr_template_item", "directory_id", true),
        new Reference("dhr_template_item", "product_process_operation_form_binding", "dhr_template_item_id", false),
        new Reference("template_category", "form_template", "category_name", false, "name", "'FORM' = :template_type"),
        new Reference("template_category", "dhr_template", "category_name", false, "name", "'DHR' = :template_type"),
        new Reference("equipment_category", "equipment_type", "category_id", false),
        new Reference("equipment_type", "equipment", "equipment_type_id", false),
        new Reference("workshop", "production_line", "workshop_id", false),
        new Reference("unit_of_measure", "work_order", "unit_id", false),
        new Reference("work_order", "production_object", "work_order_id", false),
        new Reference("work_order", "dhr_instance", "work_order_id", false),
        new Reference("production_object", "form_instance_record", "object_id", false),
        new Reference("production_object", "dhr_instance", "production_object_id", false),
        new Reference("batch", "serial_number", "batch_id", false),
        new Reference("batch", "operation_execution", "batch_id", false),
        new Reference("batch", "form_instance", "batch_id", false)
    );

    private DeletionRelations() {}
}
