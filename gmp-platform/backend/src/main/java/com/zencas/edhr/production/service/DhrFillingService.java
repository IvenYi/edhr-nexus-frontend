package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Service
@RequiredArgsConstructor
public class DhrFillingService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final ProductionExecutionService executions;
    private final ProductionExecutionEngine engine;
    private final FormInstanceRecordService records;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;

    @Transactional(readOnly = true)
    public ObjectNode workspace(Long dhrId) {
        Long objectId = objectId(dhrId);
        ObjectNode result = executions.get(objectId);
        var dhr = jdbc.queryForMap("SELECT directory_snapshot,summary_status FROM dhr_instance WHERE tenant_id='default' AND id=?", dhrId);
        result.set("directorySnapshot", DhrInstanceService.directoryForResponse(json(dhr.get("directory_snapshot"))));
        result.put("dhrSummaryStatus", dhr.get("summary_status").toString());
        if ("COMPLETED".equals(result.path("objectStatus").asText())) {
            for (JsonNode op : result.path("snapshot").path("operations")) {
                String opId = op.path("id").asText();
                JsonNode current = result.path("state").path("operations").path(opId);
                for (JsonNode form : op.path("forms")) {
                    String formId = form.path("id").asText();
                    for (String copyId : ExecutionFormCopies.ids(current, formId)) {
                        JsonNode copy = current.path("forms").path(copyId);
                        if (copy.path("supplement").isObject()) {
                            ObjectNode controls = engine.formControls(form, copy, AuditContext.getOperatorId());
                            if ("PENDING_REVIEW".equals(dhr.get("summary_status"))) {
                                controls.put("canAct", false); controls.putArray("buttons");
                            }
                            ((ObjectNode) result.path("availability").path(opId).path("formCopies").path(formId).path("instances")).set(copyId, controls);
                        }
                    }
                }
            }
        }
        return result;
    }

    @Transactional
    public ObjectNode act(Long dhrId, ProductionExecutionService.Command command) {
        if (command == null || !Set.of("SAVE", "SUBMIT", "APPROVE", "RETURN", "SIGN_FIELD").contains(command.action() == null ? "" : command.action())) throw invalid("DHR 填报不支持该生产动作");
        Long objectId = objectId(dhrId);
        String status = jdbc.queryForObject("SELECT status FROM production_object WHERE id=? AND tenant_id='default'", String.class, objectId);
        if (!"COMPLETED".equals(status)) {
            executions.act(objectId, command);
            return workspace(dhrId);
        }
        return mutate(dhrId, command, null);
    }

    @Transactional
    public ObjectNode supplement(Long dhrId, JsonNode command) {
        return mutate(dhrId, null, command);
    }

    private ObjectNode mutate(Long dhrId, ProductionExecutionService.Command action, JsonNode addition) {
        Long objectId = objectId(dhrId);
        Long orderId = jdbc.queryForObject("SELECT work_order_id FROM production_object WHERE id=?", Long.class, objectId);
        jdbc.queryForMap("SELECT id FROM work_order WHERE tenant_id='default' AND id=? FOR UPDATE", orderId);
        var object = jdbc.queryForMap("SELECT status FROM production_object WHERE tenant_id='default' AND id=? FOR UPDATE", objectId);
        var dhr = jdbc.queryForMap("SELECT summary_status FROM dhr_instance WHERE tenant_id='default' AND id=? FOR UPDATE", dhrId);
        if (!"COMPLETED".equals(object.get("status"))) throw invalid("仅生产完工后使用追加补录");
        if ("PENDING_REVIEW".equals(dhr.get("summary_status"))) throw invalid("DHR 审核中，请先退回整理后再追加补录");
        var execution = jdbc.queryForMap("SELECT snapshot_json,state_json,revision FROM production_execution WHERE object_id=? FOR UPDATE", objectId);
        long revision = ((Number) execution.get("revision")).longValue();
        Long expected = action == null ? addition.hasNonNull("revision") ? addition.path("revision").asLong() : null : action.revision();
        if (expected == null || expected != revision) throw invalid("执行记录已更新，请刷新后重试；未保存内容请保留");
        ObjectNode snapshot = json(execution.get("snapshot_json")), state = json(execution.get("state_json"));
        ObjectNode before = state.deepCopy();
        String actor = AuditContext.getOperatorId();
        if (actor == null) throw invalid("请先登录");
        String createdCopyId = null;
        if (addition != null) {
            String reason = addition.path("reason").asText("").strip();
            if (reason.isBlank()) throw invalid("请说明补录原因");
            LocalDateTime occurred;
            try { occurred = LocalDateTime.parse(addition.path("occurredAt").asText()); }
            catch (Exception e) { throw invalid("请填写实际发生时间"); }
            if (occurred.isAfter(LocalDateTime.now())) throw invalid("实际发生时间不能晚于当前时间");
            createdCopyId = "dhr-copy-" + ids.nextId();
            engine.createSupplement(snapshot, state, addition.path("operationId").asText(), addition.path("formId").asText(), createdCopyId, actor, reason, occurred.toString());
        } else {
            engine.supplementAction(snapshot, state, action.operationId(), action.formId(), action.instanceId(), action.action(),
                    action.values(), action.opinion(), action.account(), action.password(), actor, action.signatureTarget());
            records.saved(objectId, "default", snapshot, state, action.operationId(), action.formId(), action.instanceId());
        }
        jdbc.update("UPDATE production_execution SET state_json=?,revision=?,updated_at=? WHERE object_id=?", state.toString(), revision + 1, LocalDateTime.now(), objectId);
        audits.save(AuditEvent.builder().id(ids.nextId()).entityType("PRODUCTION_EXECUTION").entityId(objectId.toString())
                .action("UPDATE").contentBefore(before.toString()).contentAfter(state.toString()).operatorId(actor)
                .operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount()).source(AuditContext.getSource())
                .moduleName("记录").menuName("DHR管理 · DHR填报").functionName(addition == null ? action.action() : "追加补录")
                .reason(addition == null ? action.opinion() : addition.path("reason").asText()).dataSummary(dhrId.toString())
                .ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
        ObjectNode result = workspace(dhrId);
        if (createdCopyId != null) result.put("createdCopyId", createdCopyId);
        return result;
    }

    public Long objectId(Long dhrId) {
        var rows = jdbc.queryForList("SELECT production_object_id FROM dhr_instance WHERE tenant_id='default' AND id=?", dhrId);
        if (rows.isEmpty()) throw invalid("DHR 不存在；不能手工补建 DHR");
        return ((Number) rows.getFirst().get("production_object_id")).longValue();
    }
    private ObjectNode json(Object value) { try { return (ObjectNode) mapper.readTree(value.toString()); } catch (Exception e) { throw invalid("生产执行记录无法读取"); } }
}
