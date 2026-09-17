package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.production.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;
import java.util.*;
import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Personal views of source execution state/history. Does not create tasks or grant source actions. */
@Service
@RequiredArgsConstructor
public class FormWorklistService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final ProductionExecutionService executions;
    private static final Set<String> VIEWS = Set.of("FILLABLE", "CREATED", "FILLED", "REVIEW_PENDING", "REVIEW_DONE");

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public WorklistPage list(String view, MultiValueMap<String, String> params) {
        authorize(view);
        var page = query(view, new FormWorklistQuery(view, params), false);
        return new WorklistPage(page.getContent(), page.getPage(), page.getSize(), page.getTotalElements(), page.getTotalPages(), "STRUCTURED_EVENTS_ONLY");
    }

    public record WorklistPage(List<ObjectNode> content, int page, int size, long totalElements, int totalPages, String historyCoverage) {}

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public ObjectNode detail(String view, MultiValueMap<String, String> params) {
        authorize(view);
        if (!params.keySet().equals(Set.of("productionObjectId", "operationId", "formId", "copyId"))) throw invalid("详情必须且只能指定生产对象、工序、表单绑定及具体份");
        var result = query(view, new FormWorklistQuery(view, params), true);
        if (result.getContent().isEmpty()) throw new BusinessException(ErrorCode.FORM_001);
        return result.getContent().getFirst();
    }

    private void authorize(String view) {
        if (!VIEWS.contains(view)) throw invalid("不支持的个人表单视图");
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String permission = view.startsWith("REVIEW_") ? "form-management.review" : "form-management.filling";
        if (authentication == null || authentication.getAuthorities().stream().noneMatch(a -> permission.equals(a.getAuthority()))) throw new AccessDeniedException("无个人表单查询权限");
    }

    private PageResult<ObjectNode> query(String view, FormWorklistQuery filter, boolean detail) {
        String actor = AuditContext.getOperatorId();
        if (actor == null || actor.isBlank()) throw new AccessDeniedException("未登录");
        List<ObjectNode> result = new ArrayList<>();
        long count = 0, lastId = Long.MAX_VALUE;
        Map<String, String> templateIds = new HashMap<>();
        // Bounded source batches avoid downloading every record to the browser or an unbounded in-memory result.
        // Dynamic subject authorization is evaluated before counting/pagination using the existing source view.
        while (true) {
            String objectFilter = filter.values.containsKey("productionObjectId") ? " AND o.id=?" : "";
            List<Object> args = new ArrayList<>(List.of("default", lastId));
            if (!objectFilter.isEmpty()) args.add(Long.valueOf(filter.values.get("productionObjectId")));
            var sources = jdbc.queryForList("""
                SELECT e.*,o.object_no,o.status AS object_status,w.status AS order_status,w.product_id
                FROM production_execution e JOIN production_object o ON o.id=e.object_id
                JOIN work_order w ON w.id=o.work_order_id AND w.tenant_id=o.tenant_id
                WHERE o.tenant_id=? AND o.id<?
                """ + objectFilter + " ORDER BY o.id DESC LIMIT 32", args.toArray());
            if (sources.isEmpty()) break;
            for (var source : sources) {
                long objectId = ((Number) source.get("object_id")).longValue(); lastId = objectId;
                var execution = ProductionExecution.builder().objectId(objectId).snapshotJson((String) source.get("snapshot_json"))
                    .stateJson((String) source.get("state_json")).revision(((Number) source.get("revision")).longValue())
                    .startedAt(((java.sql.Timestamp) source.get("started_at")).toLocalDateTime()).build();
                var object = ProductionObject.builder().id(objectId).objectNo((String) source.get("object_no")).status((String) source.get("object_status")).build();
                var order = WorkOrder.builder().productId(((Number) source.get("product_id")).longValue()).status((String) source.get("order_status")).build();
                ObjectNode sourceView = executions.view(object, order, execution);
                JsonNode snapshot = sourceView.path("snapshot"), state = sourceView.path("state"), context = snapshot.path("context");
                Map<String, JsonNode> records = new HashMap<>();
                jdbc.query("SELECT id,instance_no,operation_id,copy_id,template_id FROM form_instance_record WHERE tenant_id=? AND object_id=?", rs -> {
                    ObjectNode record = mapper.createObjectNode().put("id", rs.getString("id")).put("instanceNo", rs.getString("instance_no")).put("templateId", rs.getString("template_id"));
                    records.put(rs.getString("operation_id") + "\u0000" + rs.getString("copy_id"), record);
                }, "default", objectId);
                for (JsonNode op : snapshot.path("operations")) for (JsonNode form : op.path("forms")) {
                    if (form.hasNonNull("fulfilledBy")) continue; // Alias bindings are not another physical record.
                    String opId = op.path("id").asText(), formId = form.path("id").asText();
                    JsonNode current = state.path("operations").path(opId);
                    for (String copyId : ExecutionFormCopies.ids(current, formId)) {
                        JsonNode copy = current.path("forms").path(copyId);
                        if (!copy.isObject()) continue; // Not reached yet, never invent a task.
                        JsonNode controls = sourceView.path("availability").path(opId).path("formCopies").path(formId).path("instances").path(copyId);
                        String nodeId = controls.path("nodeId").asText("");
                        String nodeKind = "START";
                        for (JsonNode node : form.path("flow").path("nodes")) if (nodeId.equals(node.path("id").asText())) nodeKind = node.path("data").path("kind").asText();
                        JsonNode lastEvent = null;
                        var events = mapper.createArrayNode();
                        for (JsonNode event : state.path("history")) {
                            if (!actor.equals(event.path("operator").asText()) || !opId.equals(event.path("operationId").asText())
                                || !formId.equals(event.path("formId").asText()) || !copyId.equals(event.path("copyId").asText())) continue;
                            String action = event.path("actionCode").asText();
                            boolean matches = view.equals("FILLED") && action.equals("SUBMIT") && "START".equals(event.path("nodeKind").asText()) && filter.inRange("submitted", event.path("at").asText(null))
                                || view.equals("REVIEW_DONE") && Set.of("APPROVE", "RETURN").contains(action) && "APPROVAL".equals(event.path("nodeKind").asText())
                                && (!filter.values.containsKey("reviewResult") || action.equals(filter.values.get("reviewResult"))) && filter.inRange("reviewed", event.path("at").asText(null));
                            if (matches && filter.matchesEventNode(event)) { lastEvent = event; events.add(event); }
                        }
                        boolean pending = Set.of("FILLABLE", "REVIEW_PENDING").contains(view);
                        boolean eligible = switch (view) {
                            case "FILLABLE" -> controls.path("canAct").asBoolean() && nodeKind.equals("START");
                            case "REVIEW_PENDING" -> controls.path("canAct").asBoolean() && nodeKind.equals("APPROVAL");
                            case "CREATED" -> actor.equals(copy.path("explicitCreatorId").asText());
                            default -> lastEvent != null;
                        };
                        if (!eligible) continue;
                        JsonNode record = records.getOrDefault(opId + "\u0000" + copyId, mapper.createObjectNode());
                        String versionId = form.path("versionId").asText();
                        String templateId = record.path("templateId").asText(null);
                        if (templateId == null) templateId = templateIds.computeIfAbsent(versionId, id -> jdbc.query("SELECT v.template_id FROM form_template_version v JOIN form_template t ON t.id=v.template_id WHERE v.id=? AND t.tenant_id='default'",
                            (rs, n) -> rs.getString(1), Long.valueOf(id)).stream().findFirst().orElse(""));
                        ObjectNode row = mapper.createObjectNode().put("view", view).put("formInstanceId", record.path("id").asText(null)).put("instanceNo", record.path("instanceNo").asText(null))
                            .put("templateId", templateId).put("templateVersionId", versionId).put("templateCode", form.path("code").asText(null))
                            .put("templateName", form.path("name").asText(null)).put("templateVersion", form.path("version").asText(null))
                            .put("productionObjectId", String.valueOf(objectId)).put("productionObjectNo", context.path("objectNo").asText(null))
                            .put("productionObjectType", context.path("objectType").asText(null)).put("workOrderId", context.path("workOrderId").asText(null))
                            .put("workOrderNo", context.path("workOrderNo").asText(null)).put("operationId", opId).put("operationName", op.path("name").asText())
                            .put("formId", formId).put("copyId", copyId).put("recordStatus", copy.path("status").asText())
                            .put("creationType", actor.equals(copy.path("explicitCreatorId").asText())
                                ? (copyId.equals(formId) && "CUSTOM".equals(form.path("sourceType").asText()) ? "CUSTOM_FORM" : "ADDED_COPY") : null)
                            .put("creatorId", copy.path("explicitCreatorId").asText(null)).put("createdAt", copy.path("explicitCreatedAt").asText(null))
                            .put("updatedAt", ((java.sql.Timestamp) source.get("updated_at")).toLocalDateTime().toString())
                            .put("saved", copy.hasNonNull("savedAt")).put("nodeId", pending ? nodeId : lastEvent == null ? null : lastEvent.path("nodeId").asText(null))
                            .put("nodeName", pending ? controls.path("nodeName").asText(null) : lastEvent == null ? null : lastEvent.path("nodeName").asText(null))
                            .put("arrivedAt", pending ? copy.path("nodeArrivedAt").path(nodeId).asText(null) : null)
                            .put("handledAt", lastEvent == null ? null : lastEvent.path("at").asText(null))
                            .put("handledAction", lastEvent == null ? null : lastEvent.path("actionCode").asText(null))
                            .put("revision", execution.getRevision()).put("historyCoverage", "STRUCTURED_EVENTS_ONLY");
                        if (!filter.matches(row)) continue;
                        if (detail || count >= (long) filter.page * filter.size && result.size() < filter.size) {
                            if (detail) {
                                row.set("snapshot", form); row.set("fieldValues", copy.path("values")); row.set("myEvents", events);
                                ObjectNode projected = pending && controls.isObject() ? ((ObjectNode) controls).deepCopy() : mapper.createObjectNode();
                                if (!pending || !projected.has("canAct")) projected.put("canAct", false);
                                if (!projected.has("buttons")) projected.putArray("buttons");
                                if (!projected.has("permissions")) projected.putObject("permissions");
                                row.set("controls", projected);
                            }
                            result.add(row);
                        }
                        count++;
                    }
                }
            }
        }
        return PageResult.of(result, filter.page, filter.size, count);
    }
}
