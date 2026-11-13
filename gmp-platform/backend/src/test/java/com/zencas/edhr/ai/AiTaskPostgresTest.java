package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real canonical migrations and identities; intentionally only runs against an owned disposable database. */
@EnabledIfEnvironmentVariable(named = "AI_TASK_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_ai_task_test_[a-z0-9_]+")
@SpringBootTest(classes = AiTaskPostgresTest.Application.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.liquibase.enabled=true", "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "app.jwt.secret=ai-foundation-test-secret-not-for-production-1234567890", "app.jwt.expiration-ms=3600000"
})
@AutoConfigureMockMvc
class AiTaskPostgresTest {
    private static final long OWNER = 910001, OTHER = 910002, UNAUTHORIZED = 910003, MANAGER = 910004;
    private static final String KEY = "local-test-worker-key-not-for-production-123456";
    @Autowired AiTaskService tasks;
    @Autowired AiProperties config;
    @Autowired AiAccess access;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;
    @Autowired PlatformTransactionManager transactions;
    @LocalServerPort int port;

    @Configuration
    @EnableAutoConfiguration(exclude = {HibernateJpaAutoConfiguration.class, JpaRepositoriesAutoConfiguration.class})
    @Import({AiTaskService.class, AiAccess.class, AiController.class, AiWorkerController.class,
            AiExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
            GlobalExceptionHandler.class})
    static class Application { }

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) {
        String url = System.getenv("AI_TASK_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_ai_task_test_[a-z0-9_]+")) {
            throw new IllegalStateException("Owned disposable AI database required");
        }
        properties.add("spring.datasource.url", () -> url);
        properties.add("spring.datasource.username", () -> System.getenv("PGUSER"));
        properties.add("spring.datasource.password", () -> "");
    }

    @BeforeEach
    void setup() {
        jdbc.execute("TRUNCATE ai_task_event, ai_task_action, ai_model_reservation, ai_run, ai_task, ai_capability RESTART IDENTITY CASCADE");
        jdbc.update("""
                INSERT INTO user_account(id, username, password_hash, display_name) VALUES
                 (910001, 'ai-test-owner', 'unused', 'AI test owner'),
                 (910002, 'ai-test-other', 'unused', 'AI test other'),
                 (910003, 'ai-test-denied', 'unused', 'AI test denied'),
                 (910004, 'ai-test-manager', 'unused', 'AI test manager') ON CONFLICT DO NOTHING
                """);
        jdbc.update("UPDATE user_account SET status='ACTIVE', locked_until=NULL, tenant_id=0 WHERE id BETWEEN 910001 AND 910004");
        jdbc.update("INSERT INTO role(id, code, name) VALUES (910001, 'AI_TEST_FORM', 'AI test form'), (910002, 'AI_TEST_SETTINGS', 'AI test settings') ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO user_role(id, user_id, role_id) VALUES (910001,910001,910001),(910002,910002,910001),(910004,910004,910002) ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO role_permission(id, role_id, permission_id) SELECT 910001,910001,id FROM permission WHERE code='master-data.form-templates' ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO role_permission(id, role_id, permission_id) SELECT 910002,910002,id FROM permission WHERE code='system.settings' ON CONFLICT DO NOTHING");
        config.setEnabled(true); config.setWorkerKey(KEY); config.setInstallationId("default");
        config.setMaxRequests(3); config.setMaxOutputTokens(4096); config.setBudgetMicros(300000);
        config.setRequestReserveMicros(100000); config.setRunSeconds(600); config.setLeaseSeconds(30);
        config.setPluginVersion("form-foundation-1"); config.setKnowledgePackage("unpublished");
        tasks.setEnabled(MANAGER, true);
    }

    @Test void migrationDefaultsAreDisabledAndPreserveNativeTables() {
        jdbc.update("INSERT INTO ai_capability(installation_id) VALUES ('disabled-installation')");
        assertThat(jdbc.queryForObject("SELECT enabled FROM ai_capability WHERE installation_id='disabled-installation'", Boolean.class)).isFalse();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM databasechangelog WHERE id='0093-ai-task-foundation'", Integer.class)).isEqualTo(1);
        long original = count("form_template");
        tasks.create(OWNER, "create", "fixture"); tasks.claim();
        assertThat(count("form_template")).isEqualTo(original);
    }

    @Test void concurrentCreateIsIdempotentAndDifferentPayloadRejected() throws Exception {
        var results = race(() -> tasks.create(OWNER, "same", "fixture"), () -> tasks.create(OWNER, "same", "fixture"));
        assertThat(results.get(0).get("taskId")).isEqualTo(results.get(1).get("taskId"));
        assertThat(count("ai_task")).isEqualTo(1); assertThat(count("ai_run")).isEqualTo(1);
        assertReason("IDEMPOTENCY_CONFLICT", () -> tasks.create(OWNER, "same", "other"));
    }

    @Test void sameRequestKeyIsScopedToOwnerAndTaskReadIsPrivate() {
        var a = tasks.create(OWNER, "same", "fixture");
        var b = tasks.create(OTHER, "same", "fixture");
        assertThat(a.get("taskId")).isNotEqualTo(b.get("taskId"));
        assertReason("TASK_NOT_FOUND", () -> tasks.get(OTHER, id(a, "taskId")));
        assertReason("TASK_NOT_FOUND", () -> tasks.action(OTHER, id(a, "taskId"), "stop", id(a, "runId"), "stop"));
        assertReason("PERMISSION_DENIED", () -> tasks.create(UNAUTHORIZED, "create", "fixture"));
        assertReason("PERMISSION_DENIED", () -> tasks.setEnabled(OWNER, false));
    }

    @Test void databaseRevocationOverridesJwtAndStopsCurrentRun() throws Exception {
        String token = token(OWNER); // Carries the original form permission.
        var run = running();
        jdbc.update("DELETE FROM role_permission WHERE id=910001");
        mvc.perform(get("/api/v1/ai/tasks/" + run.get("taskId")).header("Authorization", token))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.data.reason").value("PERMISSION_DENIED"));
        assertReason("EXECUTION_REVOKED", () -> tasks.renew(id(run, "taskId"), id(run, "runId"), 1));
        assertThat(state(run)).isEqualTo("STOPPED");
    }

    @Test void inactiveLockedAndNonDefaultTenantAccountsCannotExecute() {
        jdbc.update("UPDATE user_account SET status='DISABLED' WHERE id=?", OWNER);
        assertReason("PERMISSION_DENIED", () -> tasks.create(OWNER, "1", "fixture"));
        jdbc.update("UPDATE user_account SET status='ACTIVE', locked_until=CURRENT_TIMESTAMP + interval '1 hour' WHERE id=?", OWNER);
        assertReason("PERMISSION_DENIED", () -> tasks.create(OWNER, "2", "fixture"));
        jdbc.update("UPDATE user_account SET locked_until=NULL, tenant_id=99 WHERE id=?", OWNER);
        assertReason("PERMISSION_DENIED", () -> tasks.create(OWNER, "3", "fixture"));
    }

    @Test void accountDeletionPreservesAiHistoryWithoutAllowingFurtherAccess() {
        var run = running(); UUID taskId = id(run, "taskId");
        // Existing UserController.delete order for an ordinary, non-protected account.
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            jdbc.update("DELETE FROM user_role WHERE user_id=?", OWNER);
            jdbc.update("DELETE FROM user_department WHERE user_id=?", OWNER);
            assertThat(jdbc.update("DELETE FROM user_account WHERE id=?", OWNER)).isEqualTo(1);
        });
        assertThat(count("ai_task")).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT owner_id FROM ai_task WHERE id=?", Long.class, taskId)).isEqualTo(OWNER);
        assertReason("PERMISSION_DENIED", () -> tasks.get(OWNER, taskId));
        assertReason("EXECUTION_REVOKED", () -> tasks.renew(taskId, id(run, "runId"), 1));
        assertThat(state(run)).isEqualTo("STOPPED");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM ai_task_event WHERE task_id=? AND actor=?", Long.class,
                taskId, Long.toString(OWNER))).isEqualTo(1);
        assertReason("TASK_NOT_FOUND", () -> tasks.get(OTHER, taskId));
    }

    @Test void disableStopsAllRunsAndEnableDoesNotReviveThem() {
        var running = running(); var queued = tasks.create(OTHER, "queued", "fixture");
        tasks.setEnabled(MANAGER, false);
        assertThat(state(running)).isEqualTo("STOPPED"); assertThat(state(queued)).isEqualTo("STOPPED");
        assertThat(tasks.get(OWNER, id(running, "taskId")).get("state")).isEqualTo("STOPPED");
        assertReason("CAPABILITY_DISABLED", () -> tasks.create(OWNER, "new", "fixture"));
        tasks.setEnabled(MANAGER, true);
        assertThat(tasks.claim()).containsEntry("idle", true);
        tasks.action(OWNER, id(running, "taskId"), "continue", id(running, "runId"), "continue");
        assertThat(count("ai_run")).isEqualTo(3);
    }

    @Test void stopAndContinueReceiptsDoNotStopNewRunOrCreateDuplicates() {
        var run = running(); UUID task = id(run, "taskId"), old = id(run, "runId");
        tasks.action(OWNER, task, "stop", old, "stop");
        var receipt = tasks.action(OWNER, task, "continue", old, "continue");
        assertThat(tasks.action(OWNER, task, "continue", old, "continue").get("receipt").toString()).contains("QUEUED");
        assertThat(receipt).containsKey("receipt");
        tasks.action(OWNER, task, "stop", old, "stop"); // Same old receipt, no effect on new run.
        assertThat(tasks.get(OWNER, task).get("state")).isEqualTo("QUEUED");
        assertThat(count("ai_run")).isEqualTo(2);
        assertReason("STALE_RUN", () -> tasks.action(OWNER, task, "different-stop", old, "stop"));
        assertReason("IDEMPOTENCY_CONFLICT", () -> tasks.action(OWNER, task, "continue", old, "stop"));
        assertReason("STALE_RUN", () -> tasks.renew(task, old, 1));
    }

    @Test void concurrentClaimHasOnlyOneWinner() throws Exception {
        tasks.create(OWNER, "create", "fixture");
        var results = race(tasks::claim, tasks::claim);
        assertThat(results.stream().filter(r -> "RUNNING".equals(r.get("state"))).count()).isEqualTo(1);
        assertThat(results.stream().filter(r -> Boolean.TRUE.equals(r.get("idle"))).count()).isEqualTo(1);
    }

    @Test void validLeasesCannotHideLaterQueuedTasksBehindTheScanLimit() {
        for (int i = 0; i < 101; i++) tasks.create(OWNER, "queue-" + i, "fixture");
        for (int i = 0; i < 100; i++) assertThat(tasks.claim()).containsEntry("state", "RUNNING");
        assertThat(tasks.claim()).containsEntry("state", "RUNNING");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM ai_run WHERE state='QUEUED'", Long.class)).isZero();
        assertThat(tasks.claim()).containsEntry("idle", true);
    }

    @Test void expiredLeaseIsReclaimedWithNewEpochWithoutExtendingDeadline() {
        var run = running(); expireLease(run);
        assertReason("LEASE_EXPIRED", () -> tasks.renew(id(run, "taskId"), id(run, "runId"), 1));
        var reclaimed = tasks.claim();
        assertThat(reclaimed.get("runId")).isEqualTo(run.get("runId"));
        assertThat(reclaimed.get("leaseEpoch")).isEqualTo(2L);
        assertThat(reclaimed.get("deadlineAt")).isEqualTo(run.get("deadlineAt"));
        assertReason("LEASE_EXPIRED", () -> tasks.reserve(id(run, "taskId"), id(run, "runId"), 1, "old-worker"));
    }

    @Test void elapsedRunAndIncompatibleConfigCannotBeReclaimed() {
        var run = running();
        jdbc.update("UPDATE ai_run SET deadline_at=clock_timestamp()-interval '1 second' WHERE id=?", id(run, "runId"));
        assertReason("RUN_TIME_LIMIT", () -> tasks.renew(id(run, "taskId"), id(run, "runId"), 1));
        assertThat(state(run)).isEqualTo("FAILED");
        tasks.action(OWNER, id(run, "taskId"), "continue", id(run, "runId"), "continue");
        config.setPluginVersion("incompatible-v2");
        assertThat(tasks.claim()).containsEntry("idle", true);
        assertThat(tasks.get(OWNER, id(run, "taskId")).get("reason")).isEqualTo("CONFIG_UNAVAILABLE");
    }

    @Test void reservationsAreIdempotentAndSurviveServiceReconstructionAndNewRun() {
        var run = running(); UUID task = id(run, "taskId"), runId = id(run, "runId");
        assertThat(tasks.reserve(task, runId, 1, "call-1")).containsEntry("replayed", false);
        assertThat(tasks.reserve(task, runId, 1, "call-1")).containsEntry("replayed", true);
        var restarted = new AiTaskService(jdbc, access, config, mapper);
        var tx = new TransactionTemplate(transactions);
        Map<String, Object> persisted = tx.execute(status -> restarted.get(OWNER, task));
        assertThat(persisted).containsEntry("usedRequests", 1).containsEntry("chargedMicros", 100000L);
        tasks.action(OWNER, task, "stop", runId, "stop");
        tasks.action(OWNER, task, "continue", runId, "continue");
        assertThat(tasks.get(OWNER, task)).containsEntry("usedRequests", 1).containsEntry("chargedMicros", 100000L);
    }

    @Test void concurrentReservationsCannotExceedBudgetAndExhaustionEndsRun() throws Exception {
        config.setBudgetMicros(100000);
        var run = running();
        var results = race(() -> reserveOrError(run, "a"), () -> reserveOrError(run, "b"));
        assertThat(results.stream().filter(r -> r.containsKey("reservedMicros")).count()).isEqualTo(1);
        assertThat(results.stream().filter(r -> "BUDGET_EXHAUSTED".equals(r.get("error"))).count()).isEqualTo(1);
        assertThat(tasks.get(OWNER, id(run, "taskId"))).containsEntry("usedRequests", 1).containsEntry("chargedMicros", 100000L);
        assertThat(state(run)).isEqualTo("FAILED");
    }

    @Test void settlementIsIdempotentAndOverageBlocksMoreRequests() {
        var run = running(); UUID task = id(run, "taskId"), runId = id(run, "runId");
        tasks.reserve(task, runId, 1, "call-1");
        tasks.settle(task, runId, 1, "call-1", 350000);
        tasks.settle(task, runId, 1, "call-1", 350000);
        assertThat(tasks.get(OWNER, task)).containsEntry("chargedMicros", 350000L).containsEntry("usedRequests", 1);
        assertReason("IDEMPOTENCY_CONFLICT", () -> tasks.settle(task, runId, 1, "call-1", 1));
        assertReason("BUDGET_EXHAUSTED", () -> tasks.reserve(task, runId, 1, "call-2"));
    }

    @Test void requestCountLimitIsNotRefundedByZeroCostSettlement() {
        config.setMaxRequests(1);
        var run = running(); UUID task = id(run, "taskId"), runId = id(run, "runId");
        tasks.reserve(task, runId, 1, "call-1"); tasks.settle(task, runId, 1, "call-1", 0);
        assertReason("BUDGET_EXHAUSTED", () -> tasks.reserve(task, runId, 1, "call-2"));
        assertReason("BUDGET_EXHAUSTED", () -> tasks.action(OWNER, task, "continue", runId, "continue"));
    }

    @Test void stopAndReserveHaveDeterministicSerializedResults() throws Exception {
        var run = running();
        race(() -> tasks.action(OWNER, id(run, "taskId"), "stop", id(run, "runId"), "stop"), () -> reserveOrError(run, "call-1"));
        assertThat(state(run)).isEqualTo("STOPPED");
        assertReason("RUN_NOT_ACTIVE", () -> tasks.reserve(id(run, "taskId"), id(run, "runId"), 1, "call-2"));
        long charged = ((Number) tasks.get(OWNER, id(run, "taskId")).get("chargedMicros")).longValue();
        assertThat(charged).isIn(0L, 100000L);
        var events = tasks.events(OWNER, id(run, "taskId"), 0);
        assertThat(events.getLast().get("action")).isEqualTo("STOPPED");
    }

    @Test void forcedTransactionFailureRollsBackTaskAndEvents() {
        var tx = new TransactionTemplate(transactions);
        assertThatThrownBy(() -> tx.execute(status -> {
            tasks.create(OWNER, "rollback", "fixture");
            throw new IllegalStateException("simulated process failure before commit");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(count("ai_task")).isZero(); assertThat(count("ai_run")).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM ai_task_event WHERE task_id IS NOT NULL", Long.class)).isZero();
    }

    @Test void httpFlowUsesRealJwtDatabaseAuthorityAndInternalCredential() throws Exception {
        var result = mvc.perform(post("/api/v1/ai/tasks").header("Authorization", token(OWNER)).contentType("application/json")
                .content("{\"clientRequestId\":\"http\",\"instruction\":\"fixture\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.state").value("QUEUED"))
                .andExpect(jsonPath("$.data.businessWritesAvailable").value(false)).andReturn();
        String taskId = mapper.readTree(result.getResponse().getContentAsString()).path("data").path("taskId").asText();
        mvc.perform(post("/api/v1/ai/internal/claim").servletPath("/api/v1/ai/internal/claim").header("X-EDHR-AI-Worker-Key", KEY))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.taskId").value(taskId)).andExpect(jsonPath("$.data.state").value("RUNNING"));
        mvc.perform(get("/api/v1/ai/tasks/" + taskId).header("Authorization", token(OTHER)))
                .andExpect(status().isNotFound());
    }

    @Test void actualHttpServerCreatesClaimsAndStopsPersistedTask() throws Exception {
        try (var client = HttpClient.newHttpClient()) {
            String base = "http://127.0.0.1:" + port;
            var created = client.send(HttpRequest.newBuilder(URI.create(base + "/api/v1/ai/tasks"))
                    .header("Authorization", token(OWNER)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{\"clientRequestId\":\"socket\",\"instruction\":\"fixture\"}")).build(), HttpResponse.BodyHandlers.ofString());
            assertThat(created.statusCode()).isEqualTo(200);
            var task = mapper.readTree(created.body()).path("data");
            var claimed = client.send(HttpRequest.newBuilder(URI.create(base + "/api/v1/ai/internal/claim"))
                    .header("X-EDHR-AI-Worker-Key", KEY).POST(HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString());
            assertThat(claimed.statusCode()).isEqualTo(200);
            assertThat(mapper.readTree(claimed.body()).path("data").path("state").asText()).isEqualTo("RUNNING");
            var stopped = client.send(HttpRequest.newBuilder(URI.create(base + "/api/v1/ai/tasks/" + task.path("taskId").asText() + "/actions"))
                    .header("Authorization", token(OWNER)).header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(Map.of("clientRequestId", "socket-stop",
                            "expectedRunId", task.path("runId").asText(), "action", "stop")))).build(), HttpResponse.BodyHandlers.ofString());
            assertThat(stopped.statusCode()).isEqualTo(200);
            assertThat(jdbc.queryForObject("SELECT state FROM ai_run WHERE id=?", String.class, UUID.fromString(task.path("runId").asText()))).isEqualTo("STOPPED");
        }
    }

    @Test void workerKeyCannotBecomeUserCredentialAndJwtCannotBecomeWorkerCredential() throws Exception {
        mvc.perform(post("/api/v1/ai/internal/claim").servletPath("/api/v1/ai/internal/claim").header("Authorization", token(MANAGER)))
                .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").value("WORKER_AUTH_REQUIRED"));
        mvc.perform(post("/api/v1/ai/internal/claim").servletPath("/api/v1/ai/internal/claim").header("X-EDHR-AI-Worker-Key", "bad"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/ai/capabilities").header("X-EDHR-AI-Worker-Key", KEY)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/master-data/template-modeling/form-templates").header("X-EDHR-AI-Worker-Key", KEY)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/ai/tasks").header("Authorization", token(UNAUTHORIZED)).contentType("application/json")
                .content("{\"clientRequestId\":\"http\",\"instruction\":\"fixture\"}"))
                .andExpect(status().isForbidden());
    }

    @Test void malformedAndUnsupportedCommandsCannotReportSuccess() throws Exception {
        mvc.perform(get("/api/v1/ai/tasks/not-a-uuid").header("Authorization", token(OWNER)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.data.reason").value("INVALID_PARAMETER"));
        mvc.perform(post("/api/v1/ai/tasks").header("Authorization", token(OWNER)).contentType("application/json")
                .content("{\"clientRequestId\":\"http\",\"instruction\":\"\"}"))
                .andExpect(status().isBadRequest());
        var run = running();
        mvc.perform(get("/api/v1/ai/tasks/" + run.get("taskId") + "/events?after=not-a-number").header("Authorization", token(OWNER)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.data.reason").value("INVALID_PARAMETER"));
        assertReason("UNSUPPORTED_ACTION", () -> tasks.action(OWNER, id(run, "taskId"), "success", id(run, "runId"), "succeeded"));
        mvc.perform(post("/api/v1/ai/internal/settle").servletPath("/api/v1/ai/internal/settle").header("X-EDHR-AI-Worker-Key", KEY)
                .contentType("application/json").content(mapper.writeValueAsString(Map.of("taskId",run.get("taskId"),"runId",run.get("runId"),
                        "leaseEpoch",1,"requestId","call","actualMicros",-1))))
                .andExpect(status().isBadRequest());
        assertThat(state(run)).isEqualTo("RUNNING");
        mvc.perform(post("/api/v1/ai/internal/settle").servletPath("/api/v1/ai/internal/settle").header("X-EDHR-AI-Worker-Key", KEY)
                .contentType("application/json").content(mapper.writeValueAsString(Map.of("taskId",run.get("taskId"),"runId",run.get("runId"),
                        "leaseEpoch",1,"requestId","call"))))
                .andExpect(status().isBadRequest());
    }

    @Test void deploymentOffRejectsWorkAndDoesNotAffectUnrelatedSecurityRoutes() throws Exception {
        var run = running(); config.setEnabled(false);
        assertThat(tasks.capabilities(OWNER)).containsEntry("available", false);
        assertReason("EXECUTION_REVOKED", () -> tasks.renew(id(run, "taskId"), id(run, "runId"), 1));
        assertThat(tasks.get(OWNER, id(run, "taskId"))).containsEntry("state", "STOPPED");
        mvc.perform(get("/actuator/health")).andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401));
    }

    private Map<String, Object> running() { tasks.create(OWNER, "create", "fixture"); return tasks.claim(); }
    private UUID id(Map<String, Object> result, String key) { return (UUID) result.get(key); }
    private long count(String table) { return jdbc.queryForObject("SELECT count(*) FROM " + table, Long.class); }
    private String state(Map<String, Object> run) { return jdbc.queryForObject("SELECT state FROM ai_run WHERE id=?", String.class, id(run, "runId")); }
    private void expireLease(Map<String, Object> run) { jdbc.update("UPDATE ai_run SET lease_until=clock_timestamp()-interval '1 second' WHERE id=?", id(run, "runId")); }
    private String token(long actor) { return "Bearer " + tokens.generateToken(Long.toString(actor), "test", "Test", 60, List.of(AiAccess.FORM_PERMISSION, "system.settings")); }
    private void assertReason(String reason, org.assertj.core.api.ThrowableAssert.ThrowingCallable action) {
        assertThatThrownBy(action).isInstanceOf(AiException.class).hasMessage(reason);
    }
    private Map<String, Object> reserveOrError(Map<String, Object> run, String request) {
        try { return tasks.reserve(id(run, "taskId"), id(run, "runId"), 1, request); }
        catch (AiException error) { return Map.of("error", error.getReason()); }
    }
    private List<Map<String, Object>> race(Callable<Map<String, Object>> first, Callable<Map<String, Object>> second) throws Exception {
        var ready = new CountDownLatch(2); var start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var a = pool.submit(() -> { ready.countDown(); if (!start.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("race timeout"); return first.call(); });
            var b = pool.submit(() -> { ready.countDown(); if (!start.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("race timeout"); return second.call(); });
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue(); start.countDown();
            return List.of(a.get(15, TimeUnit.SECONDS), b.get(15, TimeUnit.SECONDS));
        }
    }
}
