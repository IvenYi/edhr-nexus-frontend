package com.zencas.edhr.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/** Single-installation task coordinator. Every mutation locks capability -> task -> run.
 * No business write tool or provider call is exposed by this foundation slice.
 */
@Service
@RequiredArgsConstructor
@Transactional(noRollbackFor = AiException.class)
public class AiTaskService {
    private final JdbcTemplate jdbc;
    private final AiAccess access;
    private final AiProperties config;
    private final ObjectMapper mapper;

    public Map<String, Object> capabilities(long actor) {
        boolean enabled = jdbc.queryForList("SELECT enabled FROM ai_capability WHERE installation_id = ?",
                Boolean.class, config.getInstallationId()).stream().findFirst().orElse(false);
        return Map.of("id", "form-builder", "available", deployed() && enabled && access.permitted(actor, AiAccess.FORM_PERMISSION),
                "stage", "task-foundation", "businessWritesAvailable", false);
    }

    public Map<String, Object> setEnabled(long actor, boolean enabled) {
        access.require(actor, "system.settings");
        lockCapability();
        if (enabled && !deployed()) throw new AiException(409, "DEPLOYMENT_DISABLED");
        jdbc.update("UPDATE ai_capability SET enabled = ? WHERE installation_id = ?", enabled, config.getInstallationId());
        if (!enabled) {
            var runs = jdbc.queryForList("""
                    SELECT r.* FROM ai_run r JOIN ai_task t ON t.id = r.task_id
                    WHERE t.installation_id = ? AND r.state IN ('QUEUED','RUNNING') ORDER BY r.created_at
                    """, config.getInstallationId());
            for (var run : runs) end(run, "STOPPED", "CAPABILITY_DISABLED", Long.toString(actor));
        }
        event(null, null, Long.toString(actor), "CAPABILITY_CHANGED", Map.of("enabled", enabled));
        return Map.of("enabled", enabled);
    }

    public Map<String, Object> create(long actor, String requestId, String instruction) {
        boolean enabled = lockCapability();
        access.require(actor, AiAccess.FORM_PERMISSION);
        String digest = hash(instruction);
        var existing = jdbc.queryForList("SELECT * FROM ai_task WHERE installation_id = ? AND owner_id = ? AND request_id = ?",
                config.getInstallationId(), actor, requestId);
        if (!existing.isEmpty()) {
            sameDigest(existing.getFirst().get("request_hash"), digest);
            return view(existing.getFirst());
        }
        requireEnabled(enabled);
        UUID task = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO ai_task(id, installation_id, owner_id, request_id, request_hash, instruction,
                  max_requests, max_output_tokens, budget_micros, request_reserve_micros)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, task, config.getInstallationId(), actor, requestId, digest, instruction, config.getMaxRequests(),
                config.getMaxOutputTokens(), config.getBudgetMicros(), config.getRequestReserveMicros());
        newRun(task, baseline(), Long.toString(actor));
        return view(task(task));
    }

    public Map<String, Object> get(long actor, UUID taskId) {
        access.require(actor, AiAccess.FORM_PERMISSION);
        var task = task(taskId);
        requireOwner(task, actor);
        return view(task);
    }

    public List<Map<String, Object>> events(long actor, UUID taskId, long after) {
        get(actor, taskId);
        return jdbc.query("""
                SELECT id, run_id, actor, action, detail_json::text, created_at FROM ai_task_event
                WHERE task_id = ? AND id > ? ORDER BY id LIMIT 100
                """, (rs, n) -> {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("id", rs.getLong(1)); event.put("runId", rs.getString(2));
            event.put("actor", rs.getString(3)); event.put("action", rs.getString(4));
            event.put("detail", parse(rs.getString(5))); event.put("createdAt", rs.getTimestamp(6).toInstant());
            return event;
        }, taskId, after);
    }

    public Map<String, Object> action(long actor, UUID taskId, String requestId, UUID expectedRun, String action) {
        boolean enabled = lockCapability();
        access.require(actor, AiAccess.FORM_PERMISSION);
        var task = lockedTask(taskId);
        requireOwner(task, actor);
        String digest = hash(expectedRun + ":" + action);
        var prior = jdbc.queryForList("SELECT request_hash, result_json::text FROM ai_task_action WHERE task_id = ? AND request_id = ?",
                taskId, requestId);
        if (!prior.isEmpty()) {
            sameDigest(prior.getFirst().get("request_hash"), digest);
            return Map.of("receipt", parse((String) prior.getFirst().get("result_json")));
        }
        if (!Objects.equals(task.get("current_run_id"), expectedRun)) throw new AiException(409, "STALE_RUN");
        var run = run(expectedRun);
        if ("stop".equals(action)) {
            if (active(run)) end(run, "STOPPED", "USER_STOPPED", Long.toString(actor));
        } else if ("continue".equals(action)) {
            requireEnabled(enabled);
            if (active(run)) throw new AiException(409, "RUN_ALREADY_ACTIVE");
            requireBudget(task);
            newRun(taskId, parse(run.get("config_json").toString()), Long.toString(actor));
        } else {
            throw new AiException(400, "UNSUPPORTED_ACTION");
        }
        var result = view(task(taskId));
        jdbc.update("INSERT INTO ai_task_action(task_id, request_id, request_hash, result_json) VALUES (?, ?, ?, ?::jsonb)",
                taskId, requestId, digest, json(result));
        return Map.of("receipt", result);
    }

    public Map<String, Object> claim() {
        boolean enabled = lockCapability();
        var candidates = jdbc.queryForList("""
                SELECT r.* FROM ai_run r JOIN ai_task t ON t.id = r.task_id
                WHERE t.installation_id = ? AND r.state IN ('QUEUED','RUNNING')
                  AND (r.state = 'QUEUED' OR r.lease_until <= clock_timestamp()
                       OR r.deadline_at <= clock_timestamp() OR ?)
                ORDER BY r.created_at, r.id LIMIT 100
                """, config.getInstallationId(), !enabled || !deployed());
        Instant now = now();
        for (var run : candidates) {
            var task = lockedTask((UUID) run.get("task_id"));
            if (!enabled || !deployed()) {
                end(run, "STOPPED", "CAPABILITY_DISABLED", "worker"); continue;
            }
            if (!access.permitted(number(task, "owner_id"), AiAccess.FORM_PERMISSION)) {
                end(run, "STOPPED", "PERMISSION_REVOKED", "worker"); continue;
            }
            Instant deadline = instant(run, "deadline_at");
            if (deadline != null && !deadline.isAfter(now)) {
                end(run, "FAILED", "RUN_TIME_LIMIT", "worker"); continue;
            }
            if ("RUNNING".equals(run.get("state")) && instant(run, "lease_until").isAfter(now)) continue;
            JsonNode baseline = parse(run.get("config_json").toString());
            if (!compatible(baseline)) {
                end(run, "FAILED", "CONFIG_UNAVAILABLE", "worker"); continue;
            }
            if (deadline == null) deadline = now.plusSeconds(baseline.path("runSeconds").asInt());
            long epoch = number(run, "lease_epoch") + 1;
            Instant until = earlier(now.plusSeconds(config.getLeaseSeconds()), deadline);
            jdbc.update("UPDATE ai_run SET state = 'RUNNING', lease_epoch = ?, lease_until = ?, deadline_at = ? WHERE id = ?",
                    epoch, timestamp(until), timestamp(deadline), run.get("id"));
            event((UUID) task.get("id"), (UUID) run.get("id"), "worker", "CLAIMED", Map.of("leaseEpoch", epoch));
            return view(task);
        }
        return Map.of("idle", true);
    }

    public Map<String, Object> renew(UUID taskId, UUID runId, long epoch) {
        var context = execution(taskId, runId, epoch);
        Instant until = earlier(now().plusSeconds(config.getLeaseSeconds()), instant(context.run(), "deadline_at"));
        jdbc.update("UPDATE ai_run SET lease_until = ? WHERE id = ?", timestamp(until), runId);
        return view(context.task());
    }

    public Map<String, Object> reserve(UUID taskId, UUID runId, long epoch, String requestId) {
        var context = execution(taskId, runId, epoch);
        var prior = jdbc.queryForList("SELECT reserved_micros FROM ai_model_reservation WHERE run_id = ? AND request_id = ?",
                runId, requestId);
        if (!prior.isEmpty()) return reservation(context.task(), requestId, number(prior.getFirst(), "reserved_micros"), true);
        try {
            requireBudget(context.task());
        } catch (AiException error) {
            end(context.run(), "FAILED", "BUDGET_EXHAUSTED", "worker");
            throw error;
        }
        long reserved = number(context.task(), "request_reserve_micros");
        jdbc.update("INSERT INTO ai_model_reservation(run_id, request_id, reserved_micros) VALUES (?, ?, ?)", runId, requestId, reserved);
        jdbc.update("UPDATE ai_task SET used_requests = used_requests + 1, charged_micros = charged_micros + ? WHERE id = ?", reserved, taskId);
        event(taskId, runId, "worker", "REQUEST_RESERVED", Map.of("requestId", requestId, "reservedMicros", reserved));
        return reservation(task(taskId), requestId, reserved, false);
    }

    public Map<String, Object> settle(UUID taskId, UUID runId, long epoch, String requestId, long actualMicros) {
        execution(taskId, runId, epoch);
        var rows = jdbc.queryForList("SELECT * FROM ai_model_reservation WHERE run_id = ? AND request_id = ?", runId, requestId);
        if (rows.isEmpty()) throw new AiException(404, "RESERVATION_NOT_FOUND");
        var row = rows.getFirst();
        if (row.get("actual_micros") != null) {
            if (number(row, "actual_micros") != actualMicros) throw new AiException(409, "IDEMPOTENCY_CONFLICT");
        } else {
            jdbc.update("UPDATE ai_model_reservation SET actual_micros = ? WHERE run_id = ? AND request_id = ?", actualMicros, runId, requestId);
            jdbc.update("UPDATE ai_task SET charged_micros = charged_micros + ? WHERE id = ?", actualMicros - number(row, "reserved_micros"), taskId);
            event(taskId, runId, "worker", "REQUEST_SETTLED", Map.of("requestId", requestId, "actualMicros", actualMicros));
        }
        return view(task(taskId));
    }

    public Map<String, Object> fail(UUID taskId, UUID runId, long epoch) {
        var context = execution(taskId, runId, epoch);
        end(context.run(), "FAILED", "WORKER_FAILURE", "worker");
        return view(context.task());
    }

    private Execution execution(UUID taskId, UUID runId, long epoch) {
        boolean enabled = lockCapability();
        var task = lockedTask(taskId);
        if (!Objects.equals(task.get("current_run_id"), runId)) throw new AiException(409, "STALE_RUN");
        var run = run(runId);
        if (!enabled || !deployed() || !access.permitted(number(task, "owner_id"), AiAccess.FORM_PERMISSION)) {
            if (active(run)) end(run, "STOPPED", !enabled || !deployed() ? "CAPABILITY_DISABLED" : "PERMISSION_REVOKED", "worker");
            throw new AiException(403, "EXECUTION_REVOKED");
        }
        if (!"RUNNING".equals(run.get("state"))) throw new AiException(409, "RUN_NOT_ACTIVE");
        Instant now = now();
        if (!instant(run, "deadline_at").isAfter(now)) {
            end(run, "FAILED", "RUN_TIME_LIMIT", "worker");
            throw new AiException(409, "RUN_TIME_LIMIT");
        }
        if (number(run, "lease_epoch") != epoch || !instant(run, "lease_until").isAfter(now)) throw new AiException(409, "LEASE_EXPIRED");
        if (!compatible(parse(run.get("config_json").toString()))) throw new AiException(409, "CONFIG_UNAVAILABLE");
        return new Execution(task, run);
    }

    private void newRun(UUID taskId, JsonNode baseline, String actor) {
        UUID runId = UUID.randomUUID();
        jdbc.update("INSERT INTO ai_run(id, task_id, state, config_json) VALUES (?, ?, 'QUEUED', ?::jsonb)", runId, taskId, json(baseline));
        jdbc.update("UPDATE ai_task SET current_run_id = ? WHERE id = ?", runId, taskId);
        event(taskId, runId, actor, "QUEUED", Map.of());
    }

    private void end(Map<String, Object> run, String state, String reason, String actor) {
        jdbc.update("UPDATE ai_run SET state = ?, reason = ?, lease_until = NULL WHERE id = ?", state, reason, run.get("id"));
        event((UUID) run.get("task_id"), (UUID) run.get("id"), actor, state, Map.of("reason", reason));
    }

    private void event(UUID task, UUID run, String actor, String action, Map<String, Object> detail) {
        jdbc.update("""
                INSERT INTO ai_task_event(task_id, run_id, installation_id, actor, action, detail_json)
                VALUES (?, ?, ?, ?, ?, ?::jsonb)
                """, task, run, config.getInstallationId(), actor, action, json(detail));
    }

    private boolean lockCapability() {
        jdbc.update("INSERT INTO ai_capability(installation_id) VALUES (?) ON CONFLICT DO NOTHING", config.getInstallationId());
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT enabled FROM ai_capability WHERE installation_id = ? FOR UPDATE",
                Boolean.class, config.getInstallationId()));
    }

    private Map<String, Object> task(UUID id) {
        return one(jdbc.queryForList("SELECT * FROM ai_task WHERE id = ? AND installation_id = ?", id, config.getInstallationId()));
    }

    private Map<String, Object> lockedTask(UUID id) {
        return one(jdbc.queryForList("SELECT * FROM ai_task WHERE id = ? AND installation_id = ? FOR UPDATE", id, config.getInstallationId()));
    }

    private Map<String, Object> run(UUID id) {
        return one(jdbc.queryForList("SELECT * FROM ai_run WHERE id = ? FOR UPDATE", id));
    }

    private Map<String, Object> one(List<Map<String, Object>> rows) {
        if (rows.isEmpty()) throw new AiException(404, "TASK_NOT_FOUND");
        return rows.getFirst();
    }

    private Map<String, Object> view(Map<String, Object> task) {
        var run = one(jdbc.queryForList("SELECT * FROM ai_run WHERE id = ?", task.get("current_run_id")));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("taskId", task.get("id")); result.put("runId", run.get("id"));
        result.put("instruction", task.get("instruction")); result.put("state", run.get("state"));
        result.put("reason", run.get("reason")); result.put("leaseEpoch", run.get("lease_epoch"));
        result.put("leaseUntil", instant(run, "lease_until")); result.put("deadlineAt", instant(run, "deadline_at"));
        result.put("config", parse(run.get("config_json").toString()));
        result.put("usedRequests", task.get("used_requests")); result.put("maxRequests", task.get("max_requests"));
        result.put("chargedMicros", task.get("charged_micros")); result.put("budgetMicros", task.get("budget_micros"));
        result.put("maxOutputTokens", task.get("max_output_tokens")); result.put("businessWritesAvailable", false);
        return result;
    }

    private Map<String, Object> reservation(Map<String, Object> task, String requestId, long reserved, boolean replay) {
        return Map.of("requestId", requestId, "reservedMicros", reserved, "replayed", replay,
                "maxOutputTokens", task.get("max_output_tokens"), "usedRequests", task.get("used_requests"));
    }

    private JsonNode baseline() {
        return mapper.valueToTree(Map.of("pluginVersion", config.getPluginVersion(), "toolProtocol", config.getToolProtocol(),
                "knowledgePackage", config.getKnowledgePackage(), "modelConfig", config.getModelConfig(), "runSeconds", config.getRunSeconds()));
    }

    private boolean compatible(JsonNode baseline) {
        JsonNode current = baseline();
        return List.of("pluginVersion", "toolProtocol", "knowledgePackage", "modelConfig").stream()
                .allMatch(key -> Objects.equals(baseline.get(key), current.get(key)));
    }

    private boolean deployed() { return config.isEnabled() && config.getWorkerKey().length() >= 32; }
    private void requireEnabled(boolean enabled) { if (!enabled || !deployed()) throw new AiException(403, "CAPABILITY_DISABLED"); }
    private void requireOwner(Map<String, Object> task, long actor) { if (number(task, "owner_id") != actor) throw new AiException(404, "TASK_NOT_FOUND"); }
    private boolean active(Map<String, Object> run) { return List.of("QUEUED", "RUNNING").contains(run.get("state")); }
    private void sameDigest(Object stored, String actual) { if (!Objects.equals(stored, actual)) throw new AiException(409, "IDEMPOTENCY_CONFLICT"); }
    private void requireBudget(Map<String, Object> task) {
        if (number(task, "used_requests") >= number(task, "max_requests") ||
                number(task, "request_reserve_micros") > number(task, "budget_micros") - number(task, "charged_micros")) {
            throw new AiException(409, "BUDGET_EXHAUSTED");
        }
    }
    private long number(Map<String, Object> row, String key) { return ((Number) row.get(key)).longValue(); }
    private Instant instant(Map<String, Object> row, String key) { return row.get(key) == null ? null : ((java.sql.Timestamp) row.get(key)).toInstant(); }
    private Instant now() { return jdbc.queryForObject("SELECT clock_timestamp()", java.sql.Timestamp.class).toInstant(); }
    private java.sql.Timestamp timestamp(Instant value) { return java.sql.Timestamp.from(value); }
    private Instant earlier(Instant a, Instant b) { return a.isBefore(b) ? a : b; }
    private String json(Object value) {
        try { return mapper.writeValueAsString(value); }
        catch (JsonProcessingException error) { throw new IllegalStateException("Cannot serialize AI state", error); }
    }
    private JsonNode parse(String value) {
        try { return mapper.readTree(value); }
        catch (JsonProcessingException error) { throw new IllegalStateException("Cannot read persisted AI state", error); }
    }
    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
    }
    private record Execution(Map<String, Object> task, Map<String, Object> run) { }
}
