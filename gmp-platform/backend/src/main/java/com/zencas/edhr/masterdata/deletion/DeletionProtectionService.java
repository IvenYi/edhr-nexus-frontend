package com.zencas.edhr.masterdata.deletion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DeletionProtectionService {
    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper mapper;

    private record Row(String table, JsonNode data) {
        String id() { return data.path("id").asText(); }
        String key() { return table + ":" + id(); }
    }

    /** Called inside the deletion transaction. Locks stay held through the original delete and audit. */
    public void check(String table, long id) {
        if (!DeletionRelations.ENTITIES.containsKey(table)) throw new IllegalArgumentException("Unknown deletion target");
        Row target = row(table, id, true);
        if (target == null || !sameTenant(target)) throw new BusinessException(ErrorCode.GENERAL_001, "记录不存在，请刷新后重试");
        if (!canView(destination(target))) throw new org.springframework.security.access.AccessDeniedException("无操作权限");
        Map<String, Row> owned = new LinkedHashMap<>();
        if (table.equals("dhr_directory")) owned.put(target.key(), target);
        else collectOwned(target, owned);
        Map<String, Row> blockers = new LinkedHashMap<>();
        for (Row parent : owned.values()) {
            for (var relation : DeletionRelations.REFERENCES) {
                if (!relation.parent().equals(parent.table())) continue;
                for (Row child : children(parent, relation)) {
                    if (!owned.containsKey(child.key())) collectDependents(child, owned.keySet(), blockers);
                }
            }
        }
        if (blockers.isEmpty()) return;
        Map<String, List<Row>> groups = new LinkedHashMap<>();
        for (Row blocker : blockers.values()) {
            String key = blocker.table() + ":" + destination(blocker) + ":" + dataType(blocker);
            groups.computeIfAbsent(key, ignored -> new ArrayList<>()).add(blocker);
        }
        List<DeletionImpact.Group> result = new ArrayList<>();
        for (var entry : groups.entrySet()) {
            Row first = entry.getValue().getFirst();
            var entity = DeletionRelations.ENTITIES.get(first.table());
            String path = destination(first);
            String dataType = dataType(first);
            boolean allowed = canView(path) && entry.getValue().stream().allMatch(this::sameTenant);
            String guidance = entity.history() || first.data().hasNonNull("object_id")
                    ? "已产生生产或追溯记录，请保留主数据；如需停止使用，请使用该模块已有的停用或失效功能。"
                    : "点击记录下方的“定位数据”，进入对应位置解除引用或处理下级数据，再返回此弹窗刷新关联。";
            if (first.table().equals("product_family_member")) guidance = "进入产品簇的产品成员，移除该成员关系后再删除物料。";
            boolean legacy = Set.of("product", "product_version", "process_definition", "process_definition_version", "process_route_binding",
                    "traveler_template", "batch", "serial_number", "operation_execution", "dhr_evidence_item", "release_order", "release_form_template").contains(first.table());
            if (legacy) guidance = "该关联来自历史模块，请联系管理员按记录编号核对处理；生产追溯记录需保留。";
            if (dataType.equals("RETAINED")) guidance = "这些生产记录或执行快照仍引用当前数据，需保留，不作为待解绑业务清单。请使用停用或失效功能停止后续使用。";
            if (dataType.equals("ORPHAN")) guidance = "所属业务数据已缺失，但引用仍存在。这是异常遗留关联，并非已确认的追溯快照；请由管理员核对修复。";
            result.add(new DeletionImpact.Group(entry.getKey(), entity.label(), module(first), allowed && !legacy && !dataType.equals("ORPHAN") ? path : null,
                    allowed ? guidance : "你没有关联模块的查看权限，请联系有权限的管理员处理。",
                    entry.getValue().size(), !allowed,
                    allowed ? entry.getValue().stream().map(this::item).toList() : List.of(), dataType));
        }
        throw new DeletionBlockedException(new DeletionImpact("DELETION_BLOCKED", label(target), text(target, "code"), result,
                table, target.id(), module(target)));
    }

    private void collectOwned(Row parent, Map<String, Row> rows) {
        if (rows.putIfAbsent(parent.key(), parent) != null) return;
        for (var relation : DeletionRelations.REFERENCES) {
            if (!relation.owned() || !relation.parent().equals(parent.table())) continue;
            for (Row child : children(parent, relation)) {
                Row locked = row(child.table(), Long.parseLong(child.id()), true);
                if (locked != null) collectOwned(locked, rows);
            }
        }
    }

    private void collectDependents(Row child, Set<String> owned, Map<String, Row> result) {
        if (owned.contains(child.key()) || result.putIfAbsent(child.key(), child) != null) return;
        for (var relation : DeletionRelations.REFERENCES) {
            if (!relation.parent().equals(child.table())) continue;
            // Internal layout nodes add no actionable relation; their external consumers are inspected via normal targets.
            if (relation.owned()) continue;
            for (Row next : children(child, relation)) collectDependents(next, owned, result);
        }
    }

    private List<Row> children(Row parent, DeletionRelations.Reference relation) {
        Object value = relation.parentField().equals("id") ? Long.valueOf(parent.id()) : text(parent, relation.parentField());
        Map<String, Object> args = new HashMap<>();
        args.put("value", value);
        args.put("template_type", text(parent, "template_type"));
        args.put("tenant", first(parent, "tenant_id").isBlank() ? "default" : text(parent, "tenant_id"));
        String predicate = relation.parentField().equals("id") ? relation.column() + " = :value"
                : "lower(trim(" + relation.column() + ")) = lower(trim(:value)) AND COALESCE(to_jsonb(r)->>'tenant_id', 'default') = :tenant";
        return jdbc.query("SELECT to_jsonb(r)::text FROM " + relation.child() + " r WHERE " + predicate
                        + (relation.filter().isBlank() ? "" : " AND " + relation.filter()) + " ORDER BY r.id",
                args, (rs, n) -> new Row(relation.child(), parse(rs.getString(1))));
    }

    private Row row(String table, long id, boolean lock) {
        List<Row> rows = jdbc.query("SELECT to_jsonb(r)::text FROM " + table + " r WHERE id = :id" + (lock ? " FOR UPDATE" : ""),
                Map.of("id", id), (rs, n) -> new Row(table, parse(rs.getString(1))));
        return rows.isEmpty() ? null : rows.getFirst();
    }

    private JsonNode parse(String json) {
        try { return mapper.readTree(json); }
        catch (java.io.IOException ex) { throw new IllegalStateException("Cannot read deletion reference", ex); }
    }

    private boolean sameTenant(Row row) {
        if (row.table().equals("workshop")) return !row.data().hasNonNull("tenant_id") || row.data().path("tenant_id").asLong() == 1L;
        return !row.data().hasNonNull("tenant_id") || "default".equals(text(row, "tenant_id"));
    }

    private boolean canView(String path) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        String permission = path.substring(1).replace('/', '.');
        Set<String> permissions = auth.getAuthorities().stream().map(org.springframework.security.core.GrantedAuthority::getAuthority).collect(java.util.stream.Collectors.toSet());
        if (path.equals("/form-management/list")) return permissions.contains("form-instances.view") && permissions.contains("production.execution");
        if (path.equals("/dhr-management/list")) return permissions.contains("dhr.instances.view");
        if (path.equals("/master-data/equipment-types")) return permissions.contains("master-data.equipment");
        return permissions.contains(permission);
    }

    private DeletionImpact.Item item(Row row) {
        String context = context(row, 0);
        Row named = row;
        while (first(named, "order_no", "code", "object_no", "dhr_no", "instance_no", "sn").isBlank() && displayParent(named) != null) named = displayParent(named);
        String code = first(named, "order_no", "code", "object_no", "dhr_no", "instance_no", "sn");
        String path = recordPath(row);
        String name = label(row);
        if (row.table().equals("product_process_version")) name = context + " / 制程版本 " + first(row, "version_label", "version");
        return new DeletionImpact.Item(row.id(), name, code,
                first(row, "version_label", "version", "version_number"), first(row, "status", "version_status"), context,
                path, location(row, 0), path == null ? navigationHint(row) : "");
    }

    private String location(Row record, int depth) {
        String own = DeletionRelations.ENTITIES.get(record.table()).label();
        if (depth >= 8) return own;
        Row parent = displayParent(record);
        if (parent == null) return own;
        String name = first(parent, "name", "title", "display_name", "work_node_label", "operation_name");
        if (name.isBlank()) name = DeletionRelations.ENTITIES.get(parent.table()).label();
        String version = first(parent, "version_label", "version", "version_number");
        String parentLocation = location(parent, depth + 1);
        String parentType = DeletionRelations.ENTITIES.get(parent.table()).label();
        String prefix = parentLocation.substring(0, parentLocation.length() - parentType.length());
        return prefix + name + (version.isBlank() || name.endsWith(version) ? "" : " · " + version) + " / " + own;
    }

    private String dataType(Row record) {
        if ((DeletionRelations.ENTITIES.get(record.table()).history()
                && !Set.of("work_order", "production_object").contains(record.table()))
                || (record.table().equals("deletion_form_reference") && record.data().hasNonNull("object_id"))) return "RETAINED";
        return missingOwner(record) ? "ORPHAN" : "BUSINESS";
    }

    private boolean missingOwner(Row record) {
        Row current = record;
        for (int depth = 0; depth < 8; depth++) {
            Row parent = displayParent(current);
            if (parent == null) return Set.of("product_process", "product_process_version", "product_process_operation_binding",
                    "product_process_operation_form_binding", "product_process_operation_document_binding", "product_process_operation_sop_binding", "product_family_member",
                    "route_version", "route_node", "route_relation", "route_operation", "dhr_template_version", "dhr_directory", "dhr_template_item",
                    "document_version", "form_template_version").contains(current.table());
            current = parent;
        }
        return false;
    }

    private String navigationHint(Row record) {
        if (missingOwner(record)) return "所属业务数据缺失，无法定位；请联系管理员修复异常关联。";
        return "该记录暂无直接管理页面，请联系管理员核对上述业务位置。";
    }

    private String label(Row row) {
        String label = first(row, "name", "title", "display_name", "work_node_label", "operation_name", "dhr_no", "instance_no", "object_no", "order_no", "code", "sn");
        if (!label.isBlank()) return label;
        String referenceTable = switch (row.table()) {
            case "product_process_operation_form_binding", "dhr_template_item", "deletion_form_reference" -> "form_template_version";
            case "product_process_operation_document_binding" -> "document_version";
            default -> null;
        };
        if (referenceTable != null) {
            String field = referenceTable.equals("document_version") ? "document_version_id" : "form_template_version_id";
            Row reference = row.data().hasNonNull(field) ? row(referenceTable, row.data().path(field).asLong(), false) : null;
            if (reference != null) return context(reference, 0) + " / " + label(reference);
        }
        String version = first(row, "version_label", "version", "version_number");
        if (!version.isBlank()) return DeletionRelations.ENTITIES.get(row.table()).label() + " · " + version;
        if (row.table().equals("product_process")) return "制程配置";
        if (row.table().equals("product_family_member")) {
            Row product = row("material", row.data().path("product_id").asLong(), false);
            if (product != null) return label(product);
        }
        return DeletionRelations.ENTITIES.get(row.table()).label();
    }

    private String context(Row row, int depth) {
        if (depth >= 6) return "";
        Row parent = displayParent(row);
        if (parent == null) return "";
        String prefix = context(parent, depth + 1);
        String version = first(parent, "version_label", "version", "version_number");
        String name = label(parent);
        return (prefix.isBlank() ? "" : prefix + " / ") + name + (version.isBlank() || name.endsWith(version) ? "" : " · " + version);
    }

    private Row displayParent(Row row) {
        String field;
        String table;
        switch (row.table()) {
            case "product_process" -> { field = "owner_id"; table = "PRODUCT_FAMILY".equals(text(row, "owner_type")) ? "product_family" : "material"; }
            case "product_process_version" -> { field = "product_process_id"; table = "product_process"; }
            case "product_process_operation_binding" -> { field = "product_process_version_id"; table = "product_process_version"; }
            case "product_process_operation_form_binding", "product_process_operation_document_binding", "product_process_operation_sop_binding" -> { field = "product_process_operation_binding_id"; table = "product_process_operation_binding"; }
            case "product_family_member" -> { field = "product_family_id"; table = "product_family"; }
            case "route_version" -> { field = "route_id"; table = "route"; }
            case "route_operation" -> { field = "route_id"; table = "route"; }
            case "route_node", "route_relation" -> { field = "route_version_id"; table = "route_version"; }
            case "dhr_template_version" -> { field = "dhr_template_id"; table = "dhr_template"; }
            case "dhr_directory" -> { field = "version_id"; table = "dhr_template_version"; }
            case "dhr_template_item" -> { field = "directory_id"; table = "dhr_directory"; }
            case "document_version" -> { field = "document_id"; table = "sop_document"; }
            case "form_template_version" -> { field = "template_id"; table = "form_template"; }
            case "production_object" -> { field = "work_order_id"; table = "work_order"; }
            case "form_instance_record" -> { field = "object_id"; table = "production_object"; }
            case "deletion_form_reference" -> {
                field = row.data().hasNonNull("object_id") ? "object_id" : "workflow_version_id";
                table = row.data().hasNonNull("object_id") ? "production_object" : "workflow_definition_version";
            }
            case "work_form_process_reference" -> { field = "work_version_id"; table = "workflow_definition_version"; }
            case "workflow_binding_rule", "workflow_definition_version" -> { field = "definition_id"; table = "workflow_definition"; }
            default -> { return null; }
        }
        return row.data().hasNonNull(field) ? row(table, row.data().path(field).asLong(), false) : null;
    }

    private String destination(Row row) {
        if (row.table().equals("production_object") && "SN".equals(text(row, "object_type"))) return "/production/work-orders";
        if (row.table().equals("deletion_form_reference") && row.data().hasNonNull("object_id")) {
            Row object = displayParent(row);
            return object == null ? "/production/batches" : destination(object);
        }
        if (row.table().equals("template_category") && text(row, "template_type").equals("DHR")) return "/master-data/batch-record-templates";
        Row current = row;
        for (int i = 0; i < 6 && current != null; i++) {
            if (current.table().equals("product_process"))
                return "PRODUCT_FAMILY".equals(text(current, "owner_type")) ? "/master-data/product-families" : "/master-data/products";
            current = displayParent(current);
        }
        return DeletionRelations.ENTITIES.get(row.table()).path();
    }

    private String module(Row row) {
        return switch (destination(row)) {
            case "/master-data/materials" -> "数据 / 工艺建模 / 物料管理";
            case "/master-data/products" -> "数据 / 工艺建模 / 产品管理";
            case "/master-data/product-families" -> "数据 / 工艺建模 / 产品簇";
            case "/master-data/operations" -> "数据 / 工艺建模 / 工序管理";
            case "/master-data/routes" -> "数据 / 工艺建模 / 工艺路线";
            case "/master-data/documents" -> "数据 / 工艺建模 / 文档管理";
            case "/master-data/form-templates" -> "数据 / 模板建模 / 表单模板";
            case "/master-data/batch-record-templates" -> "数据 / 模板建模 / 批记录模板";
            case "/master-data/equipment-types" -> "数据 / 设备建模 / 设备类型";
            case "/master-data/equipment" -> "数据 / 设备建模 / 设备列表";
            case "/master-data/workshops" -> "数据 / 工厂建模 / 车间管理";
            case "/form-management/list" -> "记录 / 表单管理 / 表单列表";
            case "/dhr-management/list" -> "记录 / DHR 管理 / DHR 列表";
            case "/production/batches" -> "生产 / 生产准备 / 批次管理";
            case "/production/work-orders" -> "生产 / 生产准备 / 工单管理";
            default -> DeletionRelations.ENTITIES.get(row.table()).module();
        };
    }

    private String recordPath(Row record) {
        if (record.table().equals("route_operation")) return null;
        Set<String> roots = Set.of("material", "product_family", "operation", "route", "sop_document", "form_template",
                "dhr_template", "equipment_type", "equipment", "workshop", "work_order", "production_object", "dhr_instance",
                "form_instance_record", "workflow_definition");
        List<Row> chain = new ArrayList<>();
        Row root = record;
        for (int depth = 0; depth < 8; depth++) {
            chain.add(root);
            if (roots.contains(root.table()) && !(root.table().equals("production_object") && "SN".equals(text(root, "object_type")))) break;
            root = displayParent(root);
            if (root == null) return null;
        }
        if (!roots.contains(root.table())) return null;
        boolean workflowEditor = root.table().equals("workflow_definition") && !Set.of("workflow_binding_rule", "workflow_definition").contains(record.table());
        StringBuilder path = new StringBuilder(destination(record));
        if (workflowEditor) path.append('/').append(root.id());
        path.append("?locateId=").append(root.id());
        String keyword = first(root, "order_no", "code", "object_no", "dhr_no", "instance_no", "name", "title");
        path.append("&locateKeyword=").append(java.net.URLEncoder.encode(keyword, java.nio.charset.StandardCharsets.UTF_8));
        if (Set.of("form_template", "dhr_template").contains(root.table()))
            path.append("&locateName=").append(java.net.URLEncoder.encode(text(root, "name"), java.nio.charset.StandardCharsets.UTF_8));
        for (Row child : chain) {
            if (Set.of("product_process_version", "route_version", "form_template_version", "dhr_template_version", "document_version", "workflow_definition_version").contains(child.table()))
                path.append("&locateVersion=").append(child.id());
        }
        Row located = chain.stream().filter(child -> child.table().equals("production_object") && "SN".equals(text(child, "object_type"))).findFirst().orElse(record);
        if (!located.id().equals(root.id())) path.append("&locateChild=").append(located.id()).append("&locateType=").append(located.table());
        for (Row child : chain) {
            String node = first(child, "route_node_key", "node_key", "work_node_id");
            if (!node.isBlank()) path.append("&locateNode=").append(java.net.URLEncoder.encode(node, java.nio.charset.StandardCharsets.UTF_8));
        }
        String reference = first(record, "dhr_template_item_id", "form_template_version_id", "document_version_id");
        if (record.table().equals("product_family_member")) reference = text(record, "product_id");
        if (!reference.isBlank()) path.append("&locateReference=").append(reference);
        return path.toString();
    }

    private static String text(Row row, String key) { return row.data().path(key).asText(""); }
    private static String first(Row row, String... keys) {
        for (String key : keys) if (!text(row, key).isBlank()) return text(row, key);
        return "";
    }
}
