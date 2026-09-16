package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Read projection of the existing production-owned instance registry. No new write lifecycle. */
@Service
@RequiredArgsConstructor
public class FormInstanceQueryService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final ProductionExecutionService execution;
    private static final Map<String, String> EXACT = Map.ofEntries(
        Map.entry("instanceNo", "instance_no"), Map.entry("templateId", "template_id"),
        Map.entry("templateVersionId", "version_id"), Map.entry("templateCode", "template_code"),
        Map.entry("sourceId", "object_id"), Map.entry("productionObjectId", "object_id"),
        Map.entry("productionObjectType", "object_type"), Map.entry("workOrderId", "work_order_id"),
        Map.entry("operationId", "operation_id"), Map.entry("createdById", "created_by_id"), Map.entry("updatedById", "updated_by_id"));
    private static final Map<String, String> CONTAINS = Map.of(
        "instanceNoContains", "instance_no", "templateName", "template_name", "productionObjectNo", "object_no", "workOrderNo", "work_order_no");
    private static final Map<String, String> SORTS = Map.of(
        "createdAt", "created_at", "updatedAt", "updated_at", "instanceNo", "instance_no", "templateCode", "template_code");
    private static final Set<String> SPECIAL = Set.of("sourceType", "recordStatus", "keyword", "page", "size", "sort",
        "createdFrom", "createdTo", "updatedFrom", "updatedTo");
    private static final Set<String> NUMERIC = Set.of("templateId", "templateVersionId", "sourceId", "productionObjectId", "workOrderId");
    private static final String COLUMNS = "id,instance_no,template_id,version_id,status,template_code,template_name,template_version,"
        + "object_id,operation_id,form_id,copy_id,work_order_id,work_order_no,object_no,object_type,operation_name,"
        + "created_by_id,created_by,created_at,updated_by_id,updated_by,updated_at,legacy";

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public PageResult<ObjectNode> list(MultiValueMap<String, String> query) {
        for (var entry : query.entrySet()) {
            String key = entry.getKey();
            if (!EXACT.containsKey(key) && !CONTAINS.containsKey(key) && !SPECIAL.contains(key)) throw invalid("不支持的查询参数：" + key);
            if (!key.equals("recordStatus") && entry.getValue().size() != 1) throw invalid("参数不能重复：" + key);
            for (String value : entry.getValue()) if (value == null || value.isBlank() || value.length() > 512) throw invalid("参数不能为空或超过512字符：" + key);
        }
        int page = integer(query, "page", 0, 0, Integer.MAX_VALUE);
        int size = integer(query, "size", 20, 1, 200);
        if (query.containsKey("instanceNo") && query.containsKey("instanceNoContains")) throw invalid("实例号精确与模糊条件不能同时传入");
        if (query.containsKey("sourceType") && !"PRODUCTION_EXECUTION".equals(value(query, "sourceType"))) throw invalid("当前仅支持 PRODUCTION_EXECUTION 来源");
        if (query.containsKey("sourceId") && !query.containsKey("sourceType")) throw invalid("sourceId 必须同时指定 sourceType");
        if (query.containsKey("productionObjectType") && !Set.of("BATCH", "SN").contains(value(query, "productionObjectType"))) throw invalid("生产对象类型必须为 BATCH 或 SN");
        String[] sort = query.getFirst("sort") == null ? new String[]{"createdAt", "desc"} : value(query, "sort").split(",", -1);
        if (sort.length != 2 || !SORTS.containsKey(sort[0]) || !Set.of("asc", "desc").contains(sort[1])) throw invalid("排序必须为白名单字段,asc或desc");
        StringBuilder where = new StringBuilder(" WHERE tenant_id=?");
        List<Object> args = new ArrayList<>(List.of("default"));
        EXACT.forEach((key, column) -> {
            if (query.containsKey(key)) {
                where.append(" AND ").append(column).append("=?");
                args.add(NUMERIC.contains(key) && !key.equals("workOrderId") ? positiveId(value(query, key)) : value(query, key));
            }
        });
        if (query.containsKey("workOrderId")) positiveId(value(query, "workOrderId"));
        CONTAINS.forEach((key, column) -> {
            if (query.containsKey(key)) { where.append(" AND ").append(column).append(" LIKE ? ESCAPE '!'"); args.add(pattern(value(query, key))); }
        });
        if (query.containsKey("recordStatus")) {
            var statuses = query.get("recordStatus").stream().map(String::trim).distinct().toList();
            if (!Set.of("ACTIVE", "COMPLETED").containsAll(statuses)) throw invalid("当前记录状态仅支持 ACTIVE、COMPLETED");
            where.append(" AND status IN (").append(String.join(",", java.util.Collections.nCopies(statuses.size(), "?"))).append(")");
            args.addAll(statuses);
        }
        for (String prefix : List.of("created", "updated")) {
            LocalDateTime from = time(query, prefix + "From"), to = time(query, prefix + "To");
            if (from != null && to != null && !from.isBefore(to)) throw invalid("时间区间必须为左闭右开且起点早于终点");
            if (from != null) { where.append(" AND ").append(prefix).append("_at>=?"); args.add(from); }
            if (to != null) { where.append(" AND ").append(prefix).append("_at<?"); args.add(to); }
        }
        if (query.containsKey("keyword")) {
            where.append(" AND (instance_no LIKE ? ESCAPE '!' OR template_name LIKE ? ESCAPE '!' OR template_code LIKE ? ESCAPE '!' OR object_no LIKE ? ESCAPE '!' OR work_order_no LIKE ? ESCAPE '!')");
            for (int i = 0; i < 5; i++) args.add(pattern(value(query, "keyword")));
        }
        // AND conditions deliberately return zero for mismatched identities, without probing unrelated master data.
        Long count = jdbc.queryForObject("SELECT count(*) FROM form_instance_record" + where, Long.class, args.toArray());
        args.add(size); args.add((long) page * size);
        var rows = jdbc.query("SELECT " + COLUMNS + " FROM form_instance_record" + where + " ORDER BY " + SORTS.get(sort[0])
            + " " + sort[1] + " NULLS LAST,id DESC LIMIT ? OFFSET ?", (rs, index) -> row(rs, false), args.toArray());
        return PageResult.of(rows, page, size, count == null ? 0 : count);
    }

    @Transactional(readOnly = true)
    public ObjectNode detail(String id) { return find("id", positiveId(id)); }

    @Transactional(readOnly = true)
    public ObjectNode byNumber(String number) {
        if (number == null || number.isBlank() || number.length() > 64) throw invalid("实例号格式不正确");
        return find("instance_no", number.trim());
    }

    @Transactional(readOnly = true)
    public ObjectNode operationContext(String id, String intent) {
        if (!"FILL".equals(intent)) throw invalid("当前仅支持 FILL 定位，不支持变更或作废资格查询");
        ObjectNode record = detail(id);
        ObjectNode source = (ObjectNode) record.path("source");
        ObjectNode view = execution.get(Long.valueOf(source.path("sourceId").asText()));
        var controls = view.path("availability").path(source.path("operationId").asText()).path("formCopies")
            .path(source.path("formId").asText()).path("instances").path(source.path("copyId").asText());
        ObjectNode result = mapper.createObjectNode().put("formInstanceId", id).put("intent", intent);
        result.set("source", source);
        result.set("revision", view.path("revision"));
        // This is exactly the existing source's control projection, not a second authorization evaluator.
        ObjectNode projected = controls.isObject() ? ((ObjectNode) controls).deepCopy() : mapper.createObjectNode();
        if (!projected.has("canAct")) projected.put("canAct", false);
        if (!projected.has("buttons")) projected.putArray("buttons");
        if (!projected.has("permissions")) projected.putObject("permissions");
        result.set("controls", projected);
        return result;
    }

    private ObjectNode find(String column, Object value) {
        var rows = jdbc.query("SELECT " + COLUMNS + ",snapshot_json,values_json FROM form_instance_record WHERE tenant_id=? AND " + column + "=?",
            (rs, index) -> row(rs, true), "default", value);
        if (rows.isEmpty()) throw new BusinessException(ErrorCode.FORM_001);
        return rows.getFirst();
    }

    private ObjectNode row(ResultSet rs, boolean detail) throws SQLException {
        ObjectNode row = mapper.createObjectNode().put("formInstanceId", rs.getString("id")).put("instanceNo", rs.getString("instance_no"))
            .put("templateId", rs.getString("template_id")).put("templateVersionId", rs.getString("version_id"))
            .put("templateCode", rs.getString("template_code")).put("templateName", rs.getString("template_name"))
            .put("templateVersion", rs.getString("template_version")).put("recordStatus", rs.getString("status"))
            .put("createdById", rs.getString("created_by_id")).put("createdByName", rs.getString("created_by"))
            .put("updatedById", rs.getString("updated_by_id")).put("updatedByName", rs.getString("updated_by"))
            .put("createdAt", localTime(rs, "created_at")).put("updatedAt", localTime(rs, "updated_at"))
            .put("legacy", rs.getBoolean("legacy"));
        row.putObject("source").put("sourceType", "PRODUCTION_EXECUTION").put("sourceId", rs.getString("object_id"))
            .put("productionObjectId", rs.getString("object_id")).put("productionObjectNo", rs.getString("object_no"))
            .put("productionObjectType", rs.getString("object_type")).put("workOrderId", rs.getString("work_order_id"))
            .put("workOrderNo", rs.getString("work_order_no")).put("operationId", rs.getString("operation_id"))
            .put("operationName", rs.getString("operation_name")).put("formId", rs.getString("form_id")).put("copyId", rs.getString("copy_id"));
        if (detail) {
            try { row.set("snapshot", mapper.readTree(rs.getString("snapshot_json"))); row.set("fieldValues", mapper.readTree(rs.getString("values_json"))); }
            catch (java.io.IOException error) { throw new SQLException("表单记录快照不可读取", error); }
        }
        return row;
    }

    private static String localTime(ResultSet rs, String column) throws SQLException {
        var value = rs.getObject(column, LocalDateTime.class);
        return value == null ? null : value.toString();
    }
    private static String value(MultiValueMap<String, String> query, String key) { return query.getFirst(key).trim(); }
    private static String pattern(String value) { return "%" + value.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%"; }
    public static long positiveId(String value) {
        try { if (!value.matches("[1-9][0-9]*")) throw new NumberFormatException(); return Long.parseLong(value); }
        catch (NumberFormatException error) { throw invalid("ID 必须为正整数"); }
    }
    private static int integer(MultiValueMap<String, String> query, String key, int fallback, int min, int max) {
        if (!query.containsKey(key)) return fallback;
        try { int result = Integer.parseInt(value(query, key)); if (result < min || result > max) throw new NumberFormatException(); return result; }
        catch (NumberFormatException error) { throw invalid(key + " 超出允许范围"); }
    }
    private static LocalDateTime time(MultiValueMap<String, String> query, String key) {
        if (!query.containsKey(key)) return null;
        // Existing source timestamps are local TIMESTAMPs; never invent an offset for historical evidence.
        try { return LocalDateTime.parse(value(query, key)); }
        catch (DateTimeParseException error) { throw invalid(key + " 必须为来源本地时间 YYYY-MM-DDTHH:mm:ss，不附加时区"); }
    }
}
