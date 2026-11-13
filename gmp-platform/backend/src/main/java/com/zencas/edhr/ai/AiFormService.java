package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.service.FormEditGuard;
import com.zencas.edhr.template.service.TemplateModelingService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.UUID;

/** Atomic native actions. Worker cannot select an owner, installation, or replacement target. */
@Service
@RequiredArgsConstructor
@Transactional(noRollbackFor = AiExecutionTerminatedException.class)
public class AiFormService {
    private final AiTaskService tasks;
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final TemplateModelingService templates;
    private final FormEditGuard guard;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;

    public Map<String, Object> read(UUID taskId, UUID runId, long epoch) {
        return read(taskId, runId, epoch, null);
    }
    public Map<String, Object> read(UUID taskId, UUID runId, long epoch, String callId) {
        var execution = tasks.authorizeExecution(taskId, runId, epoch);
        var task = execution.task();
        requireTarget(task);
        long template = number(task, "form_template_id"), version = number(task, "form_version_id");
        long revision = guard.acquire(template, version, runId, ((java.sql.Timestamp) execution.run().get("lease_until")).toInstant());
        rememberRead(runId, epoch, revision);
        tasks.recordFormRead(taskId, runId, callId, revision);
        return Map.of("templateId", Long.toString(template), "version", templates.getFormTemplateVersion(template, version).getData());
    }

    public Map<String, Object> receipt(UUID taskId, String operationId) {
        // Service-authenticated read also rechecks the real owner's current permission.
        var owners = jdbc.queryForList("SELECT owner_id FROM ai_task WHERE id=?", Long.class, taskId);
        if (owners.isEmpty()) throw new AiException(404, "TASK_NOT_FOUND");
        tasks.get(owners.getFirst(), taskId); // installation and ownership checks; stopped tasks remain readable
        var rows = jdbc.queryForList("SELECT result_json::text FROM ai_form_receipt WHERE task_id=? AND operation_id=?", String.class, taskId, operationId);
        if (rows.isEmpty()) throw new AiException(404, "RECEIPT_NOT_FOUND");
        return Map.of("receipt", parse(rows.getFirst()));
    }

    public Map<String, Object> reconcile(UUID taskId, UUID runId, long epoch, String operationId) {
        tasks.authorizeExecution(taskId, runId, epoch);
        var result = receipt(taskId, operationId);
        tasks.recordRecovery(taskId, runId, result);
        return result;
    }

    public Map<String, Object> write(UUID taskId, UUID runId, long epoch, String operationId, String action, TemplateModelingRequest request) {
        var execution = tasks.authorizeExecution(taskId, runId, epoch);
        var task = execution.task();
        long actor = number(task, "owner_id");
        String digest = digest(action, request);
        var prior = jdbc.queryForList("SELECT request_hash,result_json::text FROM ai_form_receipt WHERE task_id=? AND operation_id=?", taskId, operationId);
        if (!prior.isEmpty()) {
            if (!Objects.equals(digest, prior.getFirst().get("request_hash"))) throw new AiException(409, "IDEMPOTENCY_CONFLICT");
            return Map.of("receipt", parse(prior.getFirst().get("result_json").toString()), "replayed", true);
        }
        String oldId = AuditContext.getOperatorId(), oldName = AuditContext.getOperatorName(), oldAccount = AuditContext.getOperatorAccount(), oldSource = AuditContext.getSource();
        var user = jdbc.queryForMap("SELECT username,display_name FROM user_account WHERE id=?", actor);
        AuditContext.setOperator(Long.toString(actor), user.get("display_name").toString(), user.get("username").toString());
        AuditContext.setSource("AI");
        try {
            long template, version;
            if ("create".equals(action)) {
                if (task.get("form_version_id") != null) throw new AiException(409, "TARGET_ALREADY_BOUND");
                if (request.getCategoryName() == null || !Boolean.TRUE.equals(jdbc.queryForObject("""
                        SELECT EXISTS(SELECT 1 FROM template_category WHERE tenant_id='default' AND template_type='FORM' AND lower(name)=lower(?))
                        """, Boolean.class, request.getCategoryName().trim()))) throw new AiException(400, "CATEGORY_REQUIRED");
                // Defaults express no inferred business policy; version and name can be supplied explicitly.
                TemplateModelingRequest initial = mapper.convertValue(request, TemplateModelingRequest.class);
                if (initial.getCode() == null || initial.getCode().isBlank()) initial.setCode("AI-" + taskId.toString().replace("-", ""));
                if (initial.getName() == null || initial.getName().isBlank()) initial.setName("新建表单");
                if (initial.getVersion() == null || initial.getVersion().isBlank()) initial.setVersion("V1.0");
                var created = templates.createFormTemplate(initial).getData();
                template = Long.parseLong(created.id()); version = Long.parseLong(created.versions().getFirst().id());
                long revision = guard.acquire(template, version, runId, ((java.sql.Timestamp) execution.run().get("lease_until")).toInstant());
                initial.setExpectedRevision(revision);
                templates.saveFormTemplateVersionDesign(template, version, initial, runId);
                bindTarget(taskId, template, version);
            } else if ("save-design".equals(action)) {
                requireTarget(task);
                template = number(task, "form_template_id"); version = number(task, "form_version_id");
                if (!Objects.equals(execution.run().get("form_read_epoch"), epoch)
                        || !Objects.equals(execution.run().get("form_read_revision"), request.getExpectedRevision()))
                    throw new AiException(409, "READ_CURRENT_FORM_REQUIRED");
                templates.saveFormTemplateVersionDesign(template, version, request, runId);
            } else throw new AiException(400, "UNSUPPORTED_FORM_ACTION");
            var saved = templates.getFormTemplateVersion(template, version).getData();
            rememberRead(runId, epoch, saved.revision());
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("taskId", taskId); result.put("runId", runId); result.put("operationId", operationId);
            result.put("action", action); result.put("templateId", Long.toString(template)); result.put("versionId", Long.toString(version));
            result.put("revision", saved.revision()); result.put("source", "AI"); result.put("actorId", Long.toString(actor));
            long auditId = ids.nextId(); result.put("auditId", Long.toString(auditId));
            audits.saveAndFlush(AuditEvent.builder().id(auditId).tenantId("default").entityType("AI_FORM_OPERATION")
                    .entityId(operationId).action("UPDATE").contentBefore("{}").contentAfter(json(result))
                    .operatorId(Long.toString(actor)).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                    .source("AI").moduleName("数据").menuName("表单模板").functionName("AI 保存表单配置")
                    .dataSummary("表单 #" + template + " · 修订 " + saved.revision()).createdAt(LocalDateTime.now()).build());
            jdbc.update("INSERT INTO ai_form_receipt(task_id,operation_id,run_id,request_hash,action,result_json) VALUES (?,?,?,?,?,?::jsonb)", taskId, operationId, runId, digest, action, json(result));
            tasks.recordFormEvent(taskId, runId, actor, "create".equals(action) ? "FORM_CREATED" : "FORM_DESIGN_SAVED", result);
            return Map.of("receipt", result, "replayed", false);
        } finally {
            AuditContext.setOperator(oldId, oldName, oldAccount); AuditContext.setSource(oldSource);
        }
    }

    private void bindTarget(UUID task, long template, long version) {
        jdbc.update("UPDATE ai_task SET form_template_id=?,form_version_id=? WHERE id=?", template, version, task);
    }
    private void rememberRead(UUID run, long epoch, long revision) {
        jdbc.update("UPDATE ai_run SET form_read_revision=?,form_read_epoch=? WHERE id=?", revision, epoch, run);
    }
    private void requireTarget(Map<String, Object> task) { if (task.get("form_version_id") == null) throw new AiException(409, "FORM_TARGET_REQUIRED"); }
    private long number(Map<String, Object> row, String key) { return ((Number) row.get(key)).longValue(); }
    private JsonNode parse(String value) { try { return mapper.readTree(value); } catch (Exception error) { throw new IllegalStateException(error); } }
    private String json(Object value) { try { return mapper.writeValueAsString(value); } catch (Exception error) { throw new IllegalStateException(error); } }
    private Object canonical(JsonNode node) {
        if (node.isObject()) { Map<String, Object> sorted = new TreeMap<>(); node.fields().forEachRemaining(e -> sorted.put(e.getKey(), canonical(e.getValue()))); return sorted; }
        if (node.isArray()) { var values = new java.util.ArrayList<>(); node.forEach(v -> values.add(canonical(v))); return values; }
        return node;
    }
    private String digest(String action, TemplateModelingRequest request) {
        var payload = mapper.valueToTree(request);
        for (String key : java.util.List.of("modelDesignJson", "canvasDesignJson", "workflowDesignJson")) {
            if (payload.hasNonNull(key)) {
                try { ((com.fasterxml.jackson.databind.node.ObjectNode) payload).set(key, mapper.readTree(payload.path(key).asText())); }
                catch (Exception error) { throw new AiException(400, "INVALID_DESIGN_JSON"); }
            }
        }
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest((action + ":" + json(canonical(payload))).getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
    }
}
