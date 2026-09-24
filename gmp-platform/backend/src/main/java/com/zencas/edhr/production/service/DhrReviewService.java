package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.repository.WorkflowInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Personal review projection. Submitted evidence is never updated by a review action. */
@Service
@RequiredArgsConstructor
public class DhrReviewService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final DhrSummaryService summaries;
    private final WorkflowEngine engine;
    private final WorkflowInstanceRepository workflows;
    private final ExecutionAccess access;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;
    private final DhrEvidenceImpactService impacts;

    private static final String SELECT = """
        SELECT t.id AS task_id,t.status AS task_status,t.assignee_id,t.candidate_snapshot,t.opinion,t.action,
          t.created_at,t.completed_at,n.name AS node_name,n.properties,v.id AS version_id,v.version_no,v.snapshot_hash,
          v.dhr_instance_id,v.submitted_by,v.submitted_at,d.dhr_no,d.object_no,d.object_type,
          d.work_order_no,d.product_name,r.status AS review_status,r.workflow_instance_id
        FROM dhr_summary_review r JOIN workflow_task t ON t.instance_id=r.workflow_instance_id
        JOIN workflow_node n ON n.id=t.node_id JOIN dhr_summary_version v ON v.id=r.summary_version_id
        JOIN dhr_instance d ON d.id=v.dhr_instance_id WHERE v.tenant_id='default'
        """;

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> list(String view, String keyword, int page, int size) {
        if (!Set.of("PENDING", "DONE").contains(view)) throw invalid("不支持的审批视图");
        String actor = actor();
        page = Math.max(0, page); size = Math.max(1, Math.min(200, size));
        List<ObjectNode> result = new ArrayList<>();
        long count = 0, lastId = Long.MAX_VALUE;
        String needle = keyword == null ? "" : keyword.strip().toLowerCase(Locale.ROOT);
        while (true) {
            var batch = jdbc.queryForList(SELECT + " AND t.id<? ORDER BY t.id DESC LIMIT 64", lastId);
            if (batch.isEmpty()) break;
            for (var row : batch) {
                lastId = ((Number) row.get("task_id")).longValue();
                boolean pending = pending(row);
                if (view.equals("PENDING") ? !pending || !eligible(row, actor) : pending || !handled(row, actor)) continue;
                if (!needle.isEmpty() && !List.of("dhr_no", "object_no", "work_order_no", "product_name", "submitted_by")
                        .stream().anyMatch(k -> text(row, k).toLowerCase(Locale.ROOT).contains(needle))) continue;
                if (count >= (long) page * size && result.size() < size) result.add(project(row));
                count++;
            }
        }
        return PageResult.of(result, page, size, count);
    }

    @Transactional(readOnly = true)
    public ObjectNode detail(Long taskId) {
        var row = requireTask(taskId);
        if (!(pending(row) && eligible(row, actor())) && !handled(row, actor())) throw new AccessDeniedException("无此 DHR 审批任务权限");
        ObjectNode result = summaries.version(number(row, "dhr_instance_id"), number(row, "version_id"));
        result.set("task", project(row));
        result.set("evidenceChanges", evidenceChanges(number(row, "version_id"), false));
        result.set("buttons", buttons(row));
        result.put("canAct", pending(row) && eligible(row, actor()));
        return result;
    }

    @Transactional
    public ObjectNode act(Long taskId, JsonNode command) {
        var reference = requireTask(taskId);
        // Lock order is instance -> DHR -> evidence -> task; engine reuses this instance lock.
        var workflow = workflows.findByIdForUpdate(number(reference, "workflow_instance_id")).orElseThrow(() -> invalid("审批流程不存在"));
        Long dhrId = number(reference, "dhr_instance_id"), versionId = number(reference, "version_id");
        var dhr = jdbc.queryForMap("SELECT summary_status FROM dhr_instance WHERE tenant_id='default' AND id=? FOR UPDATE", dhrId);
        var row = requireTask(taskId);
        if (!pending(row) || !"RUNNING".equals(workflow.getStatus()) || !"PENDING_REVIEW".equals(dhr.get("summary_status"))) throw invalid("审批任务已处理，请刷新");
        if (!eligible(row, actor())) throw new AccessDeniedException("当前用户不是审批处理人");
        if (!text(row, "snapshot_hash").equals(command.path("expectedSnapshotHash").asText())) throw invalid("审批版本已变化，请重新打开");
        String action = command.path("action").asText();
        JsonNode button = null;
        for (JsonNode item : buttons(row)) if (action.equals(item.path("action").asText())) button = item;
        if (button == null) throw invalid("当前节点不支持该审批动作");
        String opinion = command.path("opinion").asText("").strip();
        if (("RETURN".equals(action) || button.path("requireOpinion").asBoolean()) && opinion.isBlank()) throw invalid("请填写审批意见");
        ArrayNode changes = evidenceChanges(versionId, true);
        if ("APPROVE".equals(action) && !changes.isEmpty()) throw invalid("已纳入表单发生变化，不能按过时证据批准；请退回整理");
        Long signatureId = null;
        if (button.path("requiresSignature").asBoolean()) {
            ObjectNode evidence = mapper.createObjectNode().put("summaryVersionId", versionId.toString())
                    .put("snapshotHash", text(row, "snapshot_hash")).put("taskId", taskId.toString()).put("opinion", opinion);
            signatureId = Long.valueOf(access.signTarget("DHR_SUMMARY", versionId.toString(), taskId.toString(), action, evidence,
                    command.path("account").asText(), command.path("password").asText()));
        }
        engine.completeDhrTask(taskId, "RETURN".equals(action) ? "REJECT" : "APPROVE", opinion, actor(), signatureId);
        var after = workflows.findById(workflow.getId()).orElseThrow();
        String outcome = "RETURN".equals(action) ? "RETURNED" : "COMPLETED".equals(after.getStatus()) ? "APPROVED" : "PENDING_REVIEW";
        jdbc.update("UPDATE dhr_summary_review SET status=?,updated_at=? WHERE summary_version_id=?", outcome, LocalDateTime.now(), versionId);
        if ("RETURNED".equals(outcome)) summaries.prepareNextDraft(dhrId, versionId, opinion);
        if ("APPROVED".equals(outcome)) jdbc.update("UPDATE dhr_instance SET summary_status='FORMALIZED',updated_by=?,updated_at=? WHERE id=?", AuditContext.getOperatorName(), LocalDateTime.now(), dhrId);
        ObjectNode evidence = mapper.createObjectNode().put("dhrId", dhrId.toString()).put("summaryVersionId", versionId.toString())
                .put("taskId", taskId.toString()).put("action", action).put("outcome", outcome).put("opinion", opinion)
                .put("snapshotHash", text(row, "snapshot_hash"));
        evidence.set("evidenceChanges", changes);
        audits.save(AuditEvent.builder().id(ids.nextId()).entityType("DHR_SUMMARY_REVIEW").entityId(versionId.toString())
                .action(action).contentBefore(mapper.createObjectNode().put("status", "PENDING_REVIEW").toString()).contentAfter(evidence.toString())
                .reason(opinion).operatorId(actor()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("记录").menuName("DHR管理 · DHR审批").functionName("RETURN".equals(action) ? "退回整理" : "审批通过")
                .dataSummary(text(row, "dhr_no")).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
        return evidence;
    }

    /** Compare only included record identity/content/status. A new candidate does not rewrite old evidence. */
    ArrayNode evidenceChanges(Long versionId, boolean lock) {
        return impacts.changes(versionId, lock);
    }

    private ArrayNode buttons(Map<String, Object> row) {
        JsonNode properties = json(text(row, "properties"));
        JsonNode config = properties.has("config") ? properties.path("config") : properties;
        if (!config.isObject()) throw invalid("审批节点配置无法读取，不能执行审批动作");
        ArrayNode result = mapper.createArrayNode();
        for (String action : List.of("APPROVE", "RETURN")) {
            ObjectNode button = mapper.createObjectNode().put("action", action).put("label", "RETURN".equals(action) ? "退回整理" : "审批通过")
                    .put("style", "RETURN".equals(action) ? "DANGER" : "PRIMARY").put("requiresSignature", false);
            boolean visible = true;
            for (JsonNode b : config.path("buttons")) if (action.equals(b.path("action").asText())) {
                visible = b.path("visible").asBoolean(true);
                if (!b.path("label").asText().isBlank()) button.put("label", b.path("label").asText());
                button.put("requireOpinion", b.path("requireOpinion").asBoolean());
                if (b.hasNonNull("style")) button.put("style", b.path("style").asText());
                if (b.hasNonNull("size")) button.put("size", b.path("size").asText());
            }
            for (JsonNode event : config.path("buttonEvents")) if (action.equals(event.path("action").asText())
                    && event.path("enabled").asBoolean(true) && "BEFORE".equals(event.path("event").asText())
                    && "ACCOUNT_PASSWORD".equals(event.path("signatureMethod").asText())) button.put("requiresSignature", true);
            if (visible) result.add(button);
        }
        return result;
    }

    private Map<String, Object> requireTask(Long id) {
        var rows = jdbc.queryForList(SELECT + " AND t.id=?", id);
        if (rows.isEmpty()) throw invalid("DHR 审批任务不存在");
        return rows.getFirst();
    }
    private boolean pending(Map<String, Object> row) { return "PENDING_REVIEW".equals(row.get("review_status")) && Set.of("PENDING", "PROCESSING").contains(text(row, "task_status")); }
    private boolean handled(Map<String, Object> row, String actor) { return actor.equals(text(row, "assignee_id")) && Set.of("COMPLETED", "REJECTED").contains(text(row, "task_status")); }
    private boolean eligible(Map<String, Object> row, String actor) {
        JsonNode snapshot = json(text(row, "candidate_snapshot"));
        if (snapshot.path("unrestricted").asBoolean()) return true;
        if (!snapshot.path("userIds").isEmpty()) {
            for (JsonNode id : snapshot.path("userIds")) if (actor.equals(id.asText())) return true;
            return false;
        }
        return actor.equals(text(row, "assignee_id"));
    }
    private ObjectNode project(Map<String, Object> row) {
        ObjectNode result = mapper.createObjectNode();
        String[][] fields = {{"task_id","id"},{"dhr_instance_id","dhrId"},{"version_id","versionId"},{"dhr_no","dhrNo"},{"object_no","objectNo"},{"work_order_no","workOrderNo"},{"product_name","productName"},{"node_name","nodeName"},{"submitted_by","submittedBy"},{"submitted_at","submittedAt"},{"completed_at","completedAt"},{"task_status","status"},{"snapshot_hash","snapshotHash"},{"opinion","opinion"},{"action","action"}};
        for (String[] field : fields) result.put(field[1], text(row, field[0]));
        result.put("versionNo", ((Number) row.get("version_no")).intValue());
        return result;
    }
    private static String text(Map<String, Object> row, String key) {
        Object value = row.get(key);
        // JDBC drivers expose native JSON as either a JSON object or UTF-8 bytes.
        return value == null ? "" : value instanceof byte[] bytes ? new String(bytes, java.nio.charset.StandardCharsets.UTF_8) : value.toString();
    }
    private static Long number(Map<String, Object> row, String key) { return ((Number) row.get(key)).longValue(); }
    private String actor() { String actor = AuditContext.getOperatorId(); if (actor == null || actor.isBlank()) throw new AccessDeniedException("未登录"); return actor; }
    private JsonNode json(String value) { if (value.isBlank()) return mapper.createObjectNode(); try { return mapper.readTree(value); } catch (Exception e) { throw invalid("审批证据无法读取"); } }
}
