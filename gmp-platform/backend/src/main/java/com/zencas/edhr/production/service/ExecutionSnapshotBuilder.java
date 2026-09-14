package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.*;

/** Builds the immutable, self-contained execution basis from configured versions. */
@Component
@RequiredArgsConstructor
public class ExecutionSnapshotBuilder {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public ObjectNode build(ProductionObject object, WorkOrder order) {
        ObjectNode root = mapper.createObjectNode();
        root.put("schemaVersion", 1);
        ObjectNode context = one("""
            SELECT m.id AS "productId", m.code AS "productCode", m.name AS "productName",
                   m.specification, m.unit, p.id AS "processVersionId", p.version_label AS "processVersion",
                   p.production_mode AS "productionMode", p.production_form AS "productionForm",
                   r.id AS "routeVersionId", r.version AS "routeVersion", rt.name AS "routeName",
                   rt.code AS "routeCode", d.id AS "dhrTemplateVersionId", d.version_label AS "dhrVersion",
                   dt.name AS "dhrName", dt.code AS "dhrCode"
            FROM product_process_version p JOIN material m ON m.id = ?
            JOIN route_version r ON r.id = p.route_version_id JOIN route rt ON rt.id = r.route_id
            JOIN dhr_template_version d ON d.id = p.dhr_template_version_id
            JOIN dhr_template dt ON dt.id = d.dhr_template_id
            WHERE p.id = ? AND p.tenant_id = 'default' AND m.tenant_id = 'default'
            """, order.getProductId(), object.getProcessVersionId());
        context.put("objectId", object.getId().toString()).put("objectNo", object.getObjectNo())
                .put("objectType", object.getObjectType()).put("workOrderId", order.getId().toString())
                .put("workOrderNo", order.getOrderNo()).put("targetQuantity", object.getTargetQuantity());
        root.set("context", context);
        long routeId = context.path("routeVersionId").asLong();
        ArrayNode nodes = rows("""
            SELECT node_key AS id, operation_id AS "operationId", operation_code AS code,
                   operation_name AS name, node_type AS type, config_json AS config
            FROM route_node WHERE route_version_id = ? ORDER BY sort_order, id
            """, routeId);
        ArrayNode edges = rows("""
            SELECT source_node_key AS source, target_node_key AS target, relation_type AS type,
                   rule_expression AS rule FROM route_relation WHERE route_version_id = ? ORDER BY priority, id
            """, routeId);
        root.set("routeNodes", nodes); root.set("routeEdges", edges);
        ArrayNode operations = root.putArray("operations");
        ArrayNode rules = rows("""
            SELECT b.id, b.definition_id AS "definitionId", b.rule_type AS type,
                   b.product_id AS "productId", b.product_family_id AS "familyId", b.operation_id AS "operationId"
            FROM workflow_binding_rule b JOIN workflow_definition d ON d.id = b.definition_id
            WHERE d.type = 'WORK' AND b.is_active = true AND b.tenant_id = 'default' AND d.tenant_id = 'default'
            ORDER BY b.id
            """);
        ArrayNode families = rows("SELECT product_family_id AS id FROM product_family_member WHERE product_id = ? AND tenant_id = 'default'", order.getProductId());
        String family = families.isEmpty() ? "" : families.get(0).path("id").asText();
        for (JsonNode node : nodes) {
            if (!Set.of("OPERATION", "REWORK").contains(node.path("type").asText())) continue;
            ObjectNode op = ((ObjectNode) node).deepCopy();
            op.set("config", json(node.path("config").asText(), mapper.createObjectNode()));
            ArrayNode bindings = rows("SELECT id FROM product_process_operation_binding WHERE product_process_version_id = ? AND route_node_key = ?",
                    object.getProcessVersionId(), node.path("id").asText());
            ArrayNode forms = op.putArray("forms"); ArrayNode documents = op.putArray("documents");
            if (!bindings.isEmpty()) {
                long bindingId = bindings.get(0).path("id").asLong();
                for (JsonNode binding : rows("""
                    SELECT id, form_template_version_id AS "versionId", dhr_template_item_id AS "dhrItemId", required
                    FROM product_process_operation_form_binding WHERE product_process_operation_binding_id = ? ORDER BY sort_order, id
                    """, bindingId)) {
                    ObjectNode form = form(binding.path("versionId").asText());
                    form.put("id", "form-" + binding.path("id").asText());
                    form.set("required", binding.path("required")); form.set("dhrItemId", binding.path("dhrItemId"));
                    forms.add(form);
                }
                documents.addAll(rows("""
                    SELECT b.id, v.id AS "versionId", s.title AS name, v.code, v.version, v.file_id AS "fileId",
                           b.page_start AS "pageStart", b.page_end AS "pageEnd"
                    FROM product_process_operation_document_binding b JOIN document_version v ON v.id = b.document_version_id
                    JOIN sop_document s ON s.id = v.document_id
                    WHERE b.product_process_operation_binding_id = ? ORDER BY b.sort_order, b.id
                    """, bindingId));
            }
            ArrayNode works = op.putArray("works");
            Map<String, List<JsonNode>> matched = new LinkedHashMap<>();
            for (JsonNode rule : rules) {
                if (matches(rule, "productId", order.getProductId().toString()) && matches(rule, "familyId", family)
                        && matches(rule, "operationId", node.path("operationId").asText())) {
                    matched.computeIfAbsent(rule.path("definitionId").asText(), ignored -> new ArrayList<>()).add(rule);
                }
            }
            for (var entry : matched.entrySet()) {
                if (entry.getValue().stream().anyMatch(rule -> "EXCEPTION".equals(rule.path("type").asText()))) continue;
                if (entry.getValue().stream().noneMatch(rule -> Set.of("GLOBAL", "SCOPED").contains(rule.path("type").asText()))) continue;
                ObjectNode work = one("""
                    SELECT v.id AS "versionId", v.version_number AS version, d.id, d.name,
                           v.nodes_json AS nodes, v.edges_json AS edges
                    FROM workflow_definition d JOIN workflow_definition_version v ON v.definition_id = d.id
                    WHERE d.id = ? AND v.is_current = true AND v.status = 'PUBLISHED'
                    """, Long.valueOf(entry.getKey()));
                work.set("rules", mapper.valueToTree(entry.getValue()));
                work.set("nodes", json(work.path("nodes").asText(), mapper.createArrayNode()));
                work.set("edges", json(work.path("edges").asText(), mapper.createArrayNode()));
                for (JsonNode workNode : work.path("nodes")) {
                    if (!"FORM".equals(workNode.path("data").path("kind").asText())) continue;
                    JsonNode config = workNode.path("data").path("config");
                    ObjectNode form = form(config.path("formTemplateVersionId").asText());
                    form.put("id", "work-" + work.path("id").asText() + "-" + workNode.path("id").asText());
                    form.put("workId", work.path("id").asText()).put("workNodeId", workNode.path("id").asText());
                    form.set("binding", config.deepCopy());
                    String processId = config.path("formProcessVersionId").asText();
                    if (!processId.isBlank()) {
                        ObjectNode flow = one("SELECT nodes_json AS nodes, edges_json AS edges FROM workflow_definition_version WHERE id = ? AND status = 'PUBLISHED'", Long.valueOf(processId));
                        flow.put("versionId", processId);
                        flow.set("nodes", json(flow.path("nodes").asText(), mapper.createArrayNode()));
                        flow.set("edges", json(flow.path("edges").asText(), mapper.createArrayNode()));
                        form.set("flow", flow);
                    }
                    // A work-bound form satisfies the matching eDHR item; do not require a second independent submission.
                    for (JsonNode direct : forms) {
                        if (direct.path("versionId").asText().equals(form.path("versionId").asText()) && !direct.has("workId")) {
                            ((ObjectNode) direct).put("fulfilledBy", form.path("id").asText());
                            form.set("dhrItemId", direct.path("dhrItemId"));
                        }
                    }
                    forms.add(form);
                }
                works.add(work);
            }
            operations.add(op);
        }
        return root;
    }

    private ObjectNode form(String versionId) {
        if (versionId.isBlank()) throw invalid("作业表单未绑定模板版本");
        ObjectNode form = one("""
            SELECT v.id AS "versionId", t.name, t.code, v.version_label AS version,
                   v.model_design_json AS model, v.canvas_design_json AS canvas
            FROM form_template_version v JOIN form_template t ON t.id = v.template_id WHERE v.id = ?
            """, Long.valueOf(versionId));
        JsonNode model = json(form.path("model").asText(), mapper.createObjectNode());
        form.set("fields", model.has("payload") ? model.path("payload").path("fields") : model.path("fields"));
        normalizeColumns(form.path("fields"));
        JsonNode canvas = json(form.path("canvas").asText(), mapper.createObjectNode());
        collectBindings(canvas, form.path("fields"));
        return form;
    }

    private void normalizeColumns(JsonNode fields) {
        for (JsonNode field : fields) {
            if (!"subTable".equals(field.path("type").asText())) continue;
            ObjectNode config = ((ObjectNode) field).withObject("/typeConfig");
            JsonNode raw = config.path("columns");
            if (raw.isTextual()) {
                ArrayNode columns = config.putArray("columns");
                for (String name : raw.asText().split("[\\n,，]")) {
                    if (name.isBlank()) continue;
                    ObjectNode column = columns.addObject().put("id", "sub-field-" + (columns.size())).put("name", name.trim())
                        .put("type", "text").put("status", "enabled");
                    column.putObject("typeConfig");
                }
            }
            normalizeColumns(config.path("columns"));
        }
    }

    private void collectBindings(JsonNode node, JsonNode fields) {
        if (node.isObject() && node.has("fieldId")) {
            for (JsonNode field : fields) if (node.path("fieldId").asText().equals(field.path("id").asText())) {
                if (node.path("required").asBoolean()) ((ObjectNode) field).put("required", true);
                if (node.path("readonly").asBoolean()) ((ObjectNode) field).put("readOnly", true);
            }
        }
        if (node.isContainerNode()) for (JsonNode child : node) collectBindings(child, fields);
    }

    private boolean matches(JsonNode rule, String field, String value) {
        return rule.path(field).isNull() || rule.path(field).isMissingNode() || rule.path(field).asText().equals(value);
    }

    private ObjectNode one(String sql, Object... args) {
        ArrayNode result = rows(sql, args);
        if (result.size() != 1) throw invalid("生产配置缺失或版本不唯一，请检查产品配置及已发布作业流程");
        return (ObjectNode) result.get(0);
    }

    private ArrayNode rows(String sql, Object... args) {
        ArrayNode result = mapper.createArrayNode();
        jdbc.query(sql, rs -> {
            ObjectNode row = mapper.createObjectNode();
            var metadata = rs.getMetaData();
            for (int i = 1; i <= metadata.getColumnCount(); i++) {
                String key = metadata.getColumnLabel(i);
                Object value = rs.getObject(i);
                if (value == null) row.putNull(key);
                else if (value instanceof Boolean bool) row.put(key, bool);
                else row.put(key, rs.getString(i));
            }
            result.add(row);
        }, args);
        return result;
    }

    private JsonNode json(String value, JsonNode fallback) {
        if (value == null || value.isBlank()) return fallback;
        try { return mapper.readTree(value); }
        catch (Exception e) { throw invalid("配置数据格式错误，无法生成执行依据"); }
    }

    static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
