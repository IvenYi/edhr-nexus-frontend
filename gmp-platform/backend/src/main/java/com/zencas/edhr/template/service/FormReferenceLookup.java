package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

/** Shared, parameterized reference lookup for template trials and frozen production forms. */
@Service
@RequiredArgsConstructor
public class FormReferenceLookup {
    private final JdbcTemplate jdbc;

    private record Source(String from, String active, Map<String, String> columns, String defaultField) {}
    private static Source source(String type) {
        return source(type, false);
    }
    private static Source source(String type, boolean retainReason) {
        return switch (type) {
            case "user" -> new Source("user_account r", "r.status='ACTIVE'", Map.of("username", "r.username", "displayName", "r.display_name", "phone", "r.phone", "email", "r.email",
                    "departmentIds", "(SELECT STRING_AGG(CAST(ud.department_id AS VARCHAR), ',') FROM user_department ud WHERE ud.user_id=r.id)",
                    "departmentName", "(SELECT STRING_AGG(d.name, '、') FROM user_department ud JOIN department d ON d.id=ud.department_id WHERE ud.user_id=r.id)"), "displayName");
            case "department" -> new Source("department r LEFT JOIN department p ON p.id=r.parent_id", "1=1", Map.of("code", "r.code", "name", "r.name", "parentName", "p.name"), "name");
            case "material" -> new Source("material r", "r.status='ACTIVE'", Map.of("code", "r.code", "name", "r.name", "specification", "r.specification", "unit", "r.unit", "status", "r.status"), "name");
            case "product" -> new Source("material r JOIN material_type t ON t.id=r.material_type_id", "r.status='ACTIVE' AND t.name IN ('产成品','半成品')", Map.of("code", "r.code", "name", "r.name", "specification", "r.specification", "unit", "r.unit", "status", "r.status"), "name");
            case "equipment" -> new Source("equipment r", "r.status='ACTIVE'", Map.of("code", "r.code", "name", "r.name", "model", "r.model", "status", "r.status"), "name");
            case "productionBatch", "serialNumber" -> new Source("production_object r JOIN work_order w ON w.id=r.work_order_id LEFT JOIN material m ON m.id=w.product_id", "r.tenant_id='default' AND w.tenant_id='default' AND r.object_type='" + ("productionBatch".equals(type) ? "BATCH" : "SN") + "'", Map.of("code", "r.object_no", "name", "r.object_no", "workOrderNo", "w.order_no", "productCode", "m.code", "productName", "m.name", "specification", "m.specification", "status", "r.status"), "code");
            case "productionObject" -> new Source("production_object r JOIN work_order w ON w.id=r.work_order_id LEFT JOIN material m ON m.id=w.product_id", "r.tenant_id='default' AND w.tenant_id='default' AND r.object_type IN ('BATCH','SN')", Map.of("code", "r.object_no", "name", "r.object_no", "workOrderNo", "w.order_no", "productCode", "m.code", "productName", "m.name", "specification", "m.specification", "status", "r.status", "objectType", "r.object_type", "objectTypeName", "CASE r.object_type WHEN 'BATCH' THEN '批次' WHEN 'SN' THEN 'SN' END"), "code");
            case "workOrder" -> new Source("work_order r LEFT JOIN material m ON m.id=r.product_id", "r.tenant_id='default'", Map.of("code", "r.order_no", "name", "r.order_no", "productCode", "m.code", "productName", "m.name", "status", "r.status"), "code");
            case "operation" -> new Source("operation r", "r.tenant_id='default'", Map.of("code", "r.code", "name", "r.name"), "name");
            case "dictionary" -> new Source("business_dictionary_item r JOIN business_dictionary d ON d.id=r.dictionary_id", "r.status='ACTIVE' AND d.status='ACTIVE'", Map.of("code", "d.code", "name", "r.label", "value", "r.value"), "name");
            case "defectReason", "scrapReason" -> new Source("quality_reason r", "r.tenant_id='default'" + (retainReason ? "" : " AND r.status='ACTIVE'") + " AND r.reason_type='" + ("defectReason".equals(type) ? "DEFECT" : "SCRAP") + "'", Map.of("code", "r.code", "name", "r.name", "description", "r.description", "status", "r.status"), "name");
            default -> throw invalid("引用来源尚不可用，请重新配置引用字段");
        };
    }

    private static Source source(JsonNode config, boolean retainReason) {
        Source source = source(config.path("sourceType").asText(), retainReason);
        if ("material".equals(config.path("sourceType").asText()) && config.has("referenceMaterialScope")) {
            Map<String, String> columns = new LinkedHashMap<>(source.columns);
            columns.put("materialTypeName", "t.name");
            return new Source("material r LEFT JOIN material_type t ON t.id=r.material_type_id", source.active, columns, source.defaultField);
        }
        return source;
    }

    /** The same SQL attribute whitelist used by design-condition validation. */
    public static Set<String> sourceFields(JsonNode config) {
        return Set.copyOf(source(config, false).columns.keySet());
    }

    private record Query(String sql, List<Object> args) {}
    private Query query(JsonNode config, JsonNode values) {
        return query(config, values, false);
    }
    private Query query(JsonNode config, JsonNode values, boolean retainReason) {
        Source source = source(config, retainReason);
        List<String> displayFields = configuredFields(config, "referenceDisplayFields", source);
        configuredFields(config, "referenceSearchFields", source);
        String display = displayFields.isEmpty() ? config.path("referenceField").asText() : source.defaultField;
        if (display.isBlank()) display = source.defaultField;
        String column = column(source, display);
        String code = column(source, switch (config.path("sourceType").asText()) { case "user" -> "username"; case "dictionary" -> "value"; default -> "code"; });
        StringBuilder sql = new StringBuilder("SELECT r.id, COALESCE(" + column + ",'') AS name, COALESCE(" + code + ",'') AS code");
        for (var entry : new TreeMap<>(source.columns).entrySet()) sql.append(", COALESCE(").append(entry.getValue()).append(",'') AS \"reference_").append(entry.getKey()).append('"');
        sql.append(" FROM ").append(source.from).append(" WHERE ").append(source.active);
        List<Object> args = new ArrayList<>();
        appendScope(config, sql, args);
        // Absent in frozen legacy forms; explicit empty scope denotes an unfinished new configuration.
        if ("dictionary".equals(config.path("sourceType").asText()) && config.has("referenceDictionaryId")) {
            long dictionaryId;
            try { dictionaryId = Long.parseLong(config.path("referenceDictionaryId").asText()); }
            catch (NumberFormatException e) { throw invalid("请先为引用字段选择具体业务字典"); }
            sql.append(" AND r.dictionary_id=?");
            args.add(dictionaryId);
        }
        JsonNode conditions = config.path("referenceQueryConditions");
        if (!conditions.isMissingNode() && !conditions.isNull() && !conditions.isArray()) throw invalid("引用查询条件格式不正确");
        for (JsonNode condition : conditions) {
            String sourceField = condition.path("sourceField").asText();
            String target = condition.path("targetFieldId").asText();
            if (sourceField.isBlank() && target.isBlank()) continue;
            if (sourceField.isBlank() || target.isBlank()) throw invalid("请完整配置引用查询条件");
            String sourceColumn = column(source, sourceField);
            String operator = condition.path("operator").asText("eq");
            if (!Set.of("eq", "ne", "contains", "notContains").contains(operator)) throw invalid("引用查询条件运算符不支持");
            JsonNode raw = values == null ? null : values.get(target);
            if (raw != null && raw.isObject()) raw = conditionValue(raw, sourceField);
            if (raw == null || raw.isNull() || raw.isMissingNode() || raw.asText().isBlank()) {
                sql.append(" AND 1=0");
                continue;
            }
            if (!raw.isValueNode()) throw invalid("引用查询条件只支持单值字段");
            String value = raw.asText();
            switch (operator) {
                case "eq" -> sql.append(" AND ").append(sourceColumn).append(" = ?");
                case "ne" -> sql.append(" AND ").append(sourceColumn).append(" <> ?");
                case "contains", "notContains" -> {
                    sql.append(" AND ").append(sourceColumn).append(operator.equals("contains") ? " LIKE ?" : " NOT LIKE ?").append(" ESCAPE '!'");
                    value = "%" + escape(value) + "%";
                }
                default -> throw invalid("引用查询条件运算符不支持");
            }
            args.add(value);
        }
        return new Query(sql.toString(), args);
    }

    private void appendScope(JsonNode config, StringBuilder sql, List<Object> args) {
        if ("material".equals(config.path("sourceType").asText()) && config.has("referenceMaterialScope")) {
            String scope = config.path("referenceMaterialScope").asText();
            if (!Set.of("all", "product", "types").contains(scope)) throw invalid("物料引用范围不正确");
            if ("product".equals(scope)) sql.append(" AND t.name IN ('产成品','半成品')");
            if ("types".equals(scope)) {
                JsonNode ids = config.path("referenceMaterialTypeIds");
                if (!ids.isArray() || ids.isEmpty()) throw invalid("请为物料引用选择物料类型");
                Set<Long> selected = new LinkedHashSet<>();
                for (JsonNode id : ids) {
                    long typeId;
                    try { typeId = Long.parseLong(id.asText()); }
                    catch (NumberFormatException e) { throw invalid("物料类型标识不正确"); }
                    if (typeId <= 0 || !id.isTextual() || !selected.add(typeId)) throw invalid("物料类型标识不正确");
                }
                String placeholders = String.join(",", Collections.nCopies(selected.size(), "?"));
                Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM material_type WHERE tenant_id='default' AND status='ACTIVE' AND id IN (" + placeholders + ")", Integer.class, selected.toArray());
                if (count == null || count != selected.size()) throw invalid("物料类型已失效，请重新选择");
                sql.append(" AND r.material_type_id IN (").append(placeholders).append(')');
                args.addAll(selected);
            }
        }
        if ("productionObject".equals(config.path("sourceType").asText())) {
            String scope = config.path("referenceProductionScope").asText("all");
            if (!Set.of("all", "batch", "sn").contains(scope)) throw invalid("生产批次/SN引用范围不正确");
            if (!"all".equals(scope)) {
                sql.append(" AND r.object_type=?");
                args.add("batch".equals(scope) ? "BATCH" : "SN");
            }
        }
    }

    private JsonNode conditionValue(JsonNode reference, String field) {
        if (!reference.hasNonNull("sourceType") || !reference.hasNonNull("id")) return reference.has(field) ? reference.get(field) : reference.get("name");
        long id;
        try { id = Long.parseLong(reference.path("id").asText()); } catch (NumberFormatException e) { throw invalid("引用查询条件中的记录标识不正确"); }
        Source dependency = source(reference.path("sourceType").asText(), true);
        if ("material".equals(reference.path("sourceType").asText()) && "materialTypeName".equals(field))
            dependency = source(com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode().put("sourceType", "material").put("referenceMaterialScope", "all"), true);
        String attribute = dependency.columns.get(field);
        if (attribute == null) attribute = column(dependency, dependency.defaultField);
        List<String> result = jdbc.query("SELECT " + attribute + " FROM " + dependency.from + " WHERE " + dependency.active + " AND r.id=?", (rs, i) -> rs.getString(1), id);
        return result.isEmpty() || result.getFirst() == null ? com.fasterxml.jackson.databind.node.NullNode.getInstance() : com.fasterxml.jackson.databind.node.TextNode.valueOf(result.getFirst());
    }

    public List<Map<String, String>> dictionaries(String keyword, String id) {
        List<Object> args = new ArrayList<>();
        String where;
        if (id != null && !id.isBlank()) {
            long dictionaryId;
            try { dictionaryId = Long.parseLong(id); }
            catch (NumberFormatException e) { throw invalid("业务字典标识不正确"); }
            where = "d.id=?";
            args.add(dictionaryId);
        } else {
            where = "d.status='ACTIVE' AND (LOWER(d.name) LIKE ? ESCAPE '!' OR LOWER(d.code) LIKE ? ESCAPE '!')";
            String search = "%" + escape(keyword == null ? "" : keyword.toLowerCase(Locale.ROOT)) + "%";
            args.add(search); args.add(search);
        }
        return jdbc.query("SELECT d.id,d.code,d.name,d.status FROM business_dictionary d WHERE " + where + " ORDER BY d.id LIMIT 20",
                (rs, i) -> Map.of("id", rs.getString("id"), "code", rs.getString("code"), "name", rs.getString("name"), "status", rs.getString("status")), args.toArray());
    }

    public List<Map<String, String>> materialTypes() {
        return jdbc.query("SELECT id,code,name FROM material_type WHERE tenant_id='default' AND status='ACTIVE' ORDER BY name,id",
                (rs, i) -> Map.of("id", rs.getString("id"), "code", rs.getString("code"), "name", rs.getString("name")));
    }

    public List<Map<String, String>> search(JsonNode config, String keyword, JsonNode values) {
        return search(config, keyword, values, null, null);
    }

    /** Paged callers receive one extra record to determine whether a next page exists. */
    public List<Map<String, String>> search(JsonNode config, String keyword, JsonNode values, Integer page, Integer size) {
        Query query = query(config, values);
        Source source = source(config, false);
        List<String> fields = configuredFields(config, "referenceSearchFields", source);
        if (fields.isEmpty()) fields = new ArrayList<>(new LinkedHashSet<>(List.of(source.defaultField, codeField(config))));
        String search = "%" + escape(keyword == null ? "" : keyword.toLowerCase(Locale.ROOT)) + "%";
        StringJoiner predicates = new StringJoiner(" OR ", " AND (", ")");
        for (String field : fields) { predicates.add("LOWER(" + column(source, field) + ") LIKE ? ESCAPE '!'"); query.args.add(search); }
        if (!config.path("referenceSearchFields").isArray() || config.path("referenceSearchFields").isEmpty()) {
            predicates.add("CAST(r.id AS VARCHAR) LIKE ? ESCAPE '!'"); query.args.add(search);
        }
        String sql = query.sql + predicates + " ORDER BY r.id";
        if (page == null && size == null) sql += " LIMIT 100";
        else {
            int pageSize = Math.max(1, Math.min(100, size == null ? 20 : size));
            sql += " LIMIT ? OFFSET ?";
            query.args.add(pageSize + 1); query.args.add((long) Math.max(0, page == null ? 0 : page) * pageSize);
        }
        return jdbc.query(sql, (rs, i) -> row(rs, source, config), query.args.toArray());
    }

    public Map<String, String> find(JsonNode config, String id, JsonNode values) {
        long recordId;
        try { recordId = Long.parseLong(id); } catch (NumberFormatException e) { return null; }
        Query query = query(config, values);
        query.args.add(recordId);
        return jdbc.query(query.sql + " AND r.id=?", (rs, i) -> row(rs, source(config, false), config), query.args.toArray()).stream().findFirst().orElse(null);
    }

    private Map<String, String> row(java.sql.ResultSet rs, Source source, JsonNode config) throws java.sql.SQLException {
        Map<String, String> row = new LinkedHashMap<>();
        for (String field : source.columns.keySet()) row.put(field, rs.getString("reference_" + field));
        row.put("id", rs.getString("id")); row.put("name", rs.getString("name")); row.put("code", rs.getString("code"));
        row.put("sourceType", config.path("sourceType").asText());
        return row;
    }

    private String codeField(JsonNode config) {
        return switch (config.path("sourceType").asText()) { case "user" -> "username"; case "dictionary" -> "value"; default -> "code"; };
    }

    private List<String> configuredFields(JsonNode config, String key, Source source) {
        JsonNode configured = config.path(key);
        if (configured.isMissingNode() || configured.isNull()) return List.of();
        if (!configured.isArray()) throw invalid("引用展示字段或搜索字段格式不正确");
        List<String> fields = new ArrayList<>();
        for (JsonNode field : configured) {
            if (!field.isTextual()) throw invalid("引用展示字段或搜索字段格式不正确");
            column(source, field.asText());
            if (fields.contains(field.asText())) throw invalid("引用展示字段或搜索字段不能重复");
            fields.add(field.asText());
        }
        return fields;
    }

    public void validate(JsonNode config, JsonNode value, JsonNode values) {
        validate(config, value, values, null);
    }

    public void validate(JsonNode config, JsonNode value, JsonNode values, JsonNode previous) {
        if (!value.isObject() || !value.hasNonNull("id") || !value.path("name").isTextual()) throw invalid("引用字段必须从配置来源中选择");
        long id;
        try { id = Long.parseLong(value.path("id").asText()); } catch (NumberFormatException e) { throw invalid("引用记录标识不正确"); }
        boolean retainedReason = Set.of("defectReason", "scrapReason").contains(config.path("sourceType").asText())
                && previous != null && previous.isObject() && previous.hasNonNull("sourceType") && previous.hasNonNull("code")
                && previous.equals(value);
        Query query = query(config, values, retainedReason);
        query.args.add(id);
        boolean metadata = value.has("sourceType") || value.has("code");
        if (metadata && (!value.path("sourceType").isTextual() || !value.path("code").isTextual()
                || !config.path("sourceType").asText().equals(value.path("sourceType").asText()))) throw invalid("引用对象类型或编号不正确，请重新选择");
        Source source = source(config, false);
        String lock = Set.of("defectReason", "scrapReason").contains(config.path("sourceType").asText()) ? " FOR UPDATE" : "";
        boolean found = jdbc.query(query.sql + " AND r.id=?" + lock, (rs, i) -> row(rs, source, config), query.args.toArray()).stream()
                .anyMatch(row -> {
                    if (retainedReason) return true;
                    if (!value.path("name").asText().equals(row.get("name")) || (metadata && !value.path("code").asText().equals(row.get("code")))) return false;
                    for (String attribute : source.columns.keySet()) if (!Set.of("status", "departmentIds", "departmentName").contains(attribute)
                            && value.has(attribute) && !value.path(attribute).asText().equals(row.get(attribute))) return false;
                    return true;
                });
        if (!found) throw invalid("引用记录已失效或不符合查询条件，请重新选择");
    }

    private String column(Source source, String key) {
        String result = source.columns.get(key);
        if (result == null) throw invalid("引用字段不支持该展示字段或查询字段：" + key);
        return result;
    }
    private static String escape(String value) { return value.replace("!", "!!").replace("%", "!%").replace("_", "!_"); }
    static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
