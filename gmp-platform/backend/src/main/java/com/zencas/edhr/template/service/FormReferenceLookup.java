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
    private Source source(String type) {
        return switch (type) {
            case "user" -> new Source("user_account r", "r.status='ACTIVE'", Map.of("username", "r.username", "displayName", "r.display_name", "phone", "r.phone", "email", "r.email"), "displayName");
            case "department" -> new Source("department r LEFT JOIN department p ON p.id=r.parent_id", "1=1", Map.of("code", "r.code", "name", "r.name", "parentName", "p.name"), "name");
            case "material" -> new Source("material r", "r.status='ACTIVE'", Map.of("code", "r.code", "name", "r.name", "specification", "r.specification"), "name");
            case "product" -> new Source("material r JOIN material_type t ON t.id=r.material_type_id", "r.status='ACTIVE' AND t.name IN ('产成品','半成品')", Map.of("code", "r.code", "name", "r.name", "specification", "r.specification"), "name");
            case "equipment" -> new Source("equipment r", "r.status='ACTIVE'", Map.of("code", "r.code", "name", "r.name", "model", "r.model"), "name");
            case "dictionary" -> new Source("business_dictionary_item r JOIN business_dictionary d ON d.id=r.dictionary_id", "r.status='ACTIVE' AND d.status='ACTIVE'", Map.of("code", "d.code", "name", "r.label", "value", "r.value"), "name");
            default -> throw invalid("引用来源尚不可用，请重新配置引用字段");
        };
    }

    private record Query(String sql, List<Object> args) {}
    private Query query(JsonNode config, JsonNode values) {
        Source source = source(config.path("sourceType").asText());
        String display = config.path("referenceField").asText();
        if (display.isBlank()) display = source.defaultField;
        String column = column(source, display);
        StringBuilder sql = new StringBuilder("SELECT r.id, COALESCE(" + column + ",'') AS name FROM " + source.from + " WHERE " + source.active);
        List<Object> args = new ArrayList<>();
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
            if (raw != null && raw.isObject()) raw = raw.get("name");
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

    public List<Map<String, String>> search(JsonNode config, String keyword, JsonNode values) {
        Query query = query(config, values);
        String search = "%" + escape(keyword == null ? "" : keyword.toLowerCase(Locale.ROOT)) + "%";
        query.args.add(search); query.args.add(search);
        return jdbc.query("SELECT id, name FROM (" + query.sql + ") refs WHERE (LOWER(name) LIKE ? ESCAPE '!' OR CAST(id AS VARCHAR) LIKE ? ESCAPE '!') ORDER BY id LIMIT 100",
                (rs, i) -> Map.of("id", rs.getString("id"), "name", rs.getString("name")), query.args.toArray());
    }

    public void validate(JsonNode config, JsonNode value, JsonNode values) {
        if (!value.isObject() || !value.hasNonNull("id") || !value.path("name").isTextual()) throw invalid("引用字段必须从配置来源中选择");
        long id;
        try { id = Long.parseLong(value.path("id").asText()); } catch (NumberFormatException e) { throw invalid("引用记录标识不正确"); }
        Query query = query(config, values);
        query.args.add(id);
        boolean found = jdbc.query(query.sql + " AND r.id=?", (rs, i) -> rs.getString("name"), query.args.toArray()).stream().anyMatch(value.path("name").asText()::equals);
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
