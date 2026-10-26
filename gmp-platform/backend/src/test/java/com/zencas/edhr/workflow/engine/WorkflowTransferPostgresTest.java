package com.zencas.edhr.workflow.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.SubjectResolver;
import com.zencas.edhr.workflow.controller.WorkflowTaskController;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Real engine, JPA, PostgreSQL queues, audit and transaction boundaries; synthetic task resolution is seeded. */
@EnabledIfEnvironmentVariable(named = "W3_TRANSFER_DATABASE_URL", matches = "jdbc:postgresql:.*")
@SpringBootTest(classes = WorkflowTransferPostgresTest.Config.class,
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = {"spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.datasource.driver-class-name=org.postgresql.Driver",
                "spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect"})
class WorkflowTransferPostgresTest {
    private static final long TASK = 10L;
    @Autowired WorkflowEngine engine;
    @Autowired WorkflowTaskController controller;
    @Autowired WorkflowTaskRepository tasks;
    @Autowired AuditEventRepository audits;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired DataSource dataSource;
    private MockMvc mvc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        String url = System.getenv("W3_TRANSFER_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_transfer_test")) {
            throw new IllegalArgumentException("Use only the owned loopback edhr_w3_transfer_test database");
        }
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> "edhr");
        registry.add("spring.datasource.password", () -> "");
    }

    @BeforeEach
    void seed() {
        for (String table : List.of("audit_event", "workflow_action_log", "workflow_task", "workflow_instance",
                "workflow_edge", "workflow_node", "workflow_binding_rule", "workflow_definition_version",
                "workflow_definition", "user_account")) jdbc.update("DELETE FROM " + table);
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES "
                + "(1,9,'operator1','操作员一','synthetic','ACTIVE'),(2,9,'reviewer2','复核甲','synthetic','ACTIVE'),"
                + "(3,9,'reviewer3','复核乙','synthetic','ACTIVE'),(4,9,'inactive4','停用人员','synthetic','INACTIVE'),"
                + "(5,9,'locked5','锁定人员','synthetic','ACTIVE'),(6,10,'other6','跨租户人员','synthetic','ACTIVE'),"
                + "(7,9,'candidate7','原候选七','synthetic','ACTIVE')");
        jdbc.update("UPDATE user_account SET locked_until=current_timestamp+interval '1 hour' WHERE id=5");
        jdbc.update("INSERT INTO workflow_definition(id,type,name,code,status) VALUES (50,'FORM_PROCESS','合成转办流程','W3-TRANSFER','ACTIVE')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES (51,50,1,'PUBLISHED',true,'[]','[]')");
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES (30,51,'APPROVAL','合成审批','{}'),(31,51,'END','结束','{}')");
        jdbc.update("INSERT INTO workflow_edge(id,version_id,source_node_id,target_node_id) VALUES (40,51,30,31)");
        jdbc.update("INSERT INTO workflow_instance(id,definition_id,version_id,business_type,business_id,status,current_node_ids,context_snapshot,initiator_id,started_at) "
                + "VALUES (20,50,51,'FORM_TEST','synthetic-1','RUNNING','30','{\"formValue\":22}','1',current_timestamp)");
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,task_type,status,assignee_id,candidate_snapshot,created_at) VALUES (10,20,30,'APPROVAL','PENDING','1',?::jsonb,current_timestamp)",
                "{\"userIds\":[\"1\",\"7\"],\"sources\":{\"1\":[{\"type\":\"ROLE\",\"id\":\"7\"}],\"7\":[{\"type\":\"USER\",\"id\":\"7\"}]},\"unresolvedSubjects\":[{\"type\":\"DEPARTMENT\",\"id\":\"8\"}]}");
        operator("1");
        // This checks controller JSON/authenticated-identity wiring, without claiming a full JWT/filter-chain test.
        mvc = MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @AfterEach
    void clearOperator() {
        AuditContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void repeatedDelegationPreservesOriginalSourcesAndOnlyCurrentTargetCanComplete() throws Exception {
        String original = taskSnapshot();
        String instanceBefore = row("workflow_instance");
        assertThat(todo("1")).containsExactly(TASK);
        assertThat(todo("7")).containsExactly(TASK);
        assertThat(todo("2")).isEmpty();

        engine.transferTask(TASK, "2", "1", "  交由复核甲  ");

        assertThat(row("workflow_instance")).isEqualTo(instanceBefore);
        assertCurrentTarget("2", original);
        assertThat(todo("1")).isEmpty();
        assertThat(todo("7")).isEmpty();
        assertThat(todo("2")).containsExactly(TASK);
        assertThat(tasks.findPendingByCandidateUserId("[\"1\"]")).isEmpty();
        assertThat(tasks.findPendingByCandidateUserId("[\"2\"]")).extracting(WorkflowTask::getId).containsExactly(TASK);
        Map<String, String> beforeFormerCandidate = state();
        assertThatThrownBy(() -> engine.completeTask(TASK, "APPROVE", "不应成功", "7", null)).hasMessageContaining("待处理人");
        assertThat(state()).isEqualTo(beforeFormerCandidate);

        operator("2");
        engine.transferTask(TASK, "3", "2", "交由复核乙");
        assertCurrentTarget("3", original);
        assertThat(row("workflow_instance")).isEqualTo(instanceBefore);
        assertThat(todo("2")).isEmpty();
        assertThat(todo("3")).containsExactly(TASK);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_task", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForList("SELECT action FROM workflow_action_log ORDER BY id", String.class)).containsExactly("TASK_TRANSFER", "TASK_TRANSFER");
        assertThat(audits.findAll()).hasSize(2).allSatisfy(event -> {
            assertThat(event.getAction()).isEqualTo("TRANSFER");
            assertThat(event.getEntityId()).isEqualTo("10");
            assertThat(event.getSnapshotHash()).matches("[0-9a-f]{64}");
            assertThat(event.getCreatedAt()).isNotNull();
        });
        assertThat(jdbc.queryForList("SELECT reason FROM audit_event ORDER BY id", String.class)).containsExactly("交由复核甲", "交由复核乙");
        assertThat(jdbc.queryForList("SELECT operator_id FROM audit_event ORDER BY id", String.class)).containsExactly("1", "2");

        Map<String, String> beforeFormerTarget = state();
        assertThatThrownBy(() -> engine.completeTask(TASK, "APPROVE", "不应成功", "2", null)).hasMessageContaining("待处理人");
        assertThat(state()).isEqualTo(beforeFormerTarget);
        operator("3");
        engine.completeTask(TASK, "APPROVE", "已复核", "3", null);
        WorkflowTask completed = tasks.findById(TASK).orElseThrow();
        assertThat(completed.getStatus()).isEqualTo("COMPLETED");
        assertThat(completed.getAssigneeId()).isEqualTo("3");
        assertThat(completed.getOpinion()).isEqualTo("已复核");
        assertThat(mapper.readTree(completed.getCandidateSnapshot()).path("originSnapshot").asText()).isEqualTo(original);
        assertThat(jdbc.queryForObject("SELECT status FROM workflow_instance WHERE id=20", String.class)).isEqualTo("COMPLETED");
        assertThat(todo("3")).isEmpty();
    }

    @Test
    void unrestrictedTaskBecomesTargetOnlyWithoutLosingTheOpenOrigin() throws Exception {
        jdbc.update("UPDATE workflow_task SET candidate_snapshot=?::jsonb WHERE id=10",
                "{\"unrestricted\":true,\"userIds\":[],\"sources\":{},\"unresolvedSubjects\":[]}");
        String original = taskSnapshot();
        assertThat(todo("3")).containsExactly(TASK);
        engine.transferTask(TASK, "2", "1", "由复核甲负责");
        assertCurrentTarget("2", original);
        assertThat(todo("1")).isEmpty();
        assertThat(todo("3")).isEmpty();
        assertThat(todo("2")).containsExactly(TASK);
        assertThatThrownBy(() -> engine.transferTask(TASK, "3", "1", "旧处理人再转")).hasMessageContaining("待处理人");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Long.class)).isEqualTo(1);
    }

    @Test
    void legacyAlreadyTransferredOriginIsMarkedAsPartialRatherThanInvented() throws Exception {
        jdbc.update("UPDATE workflow_task SET original_assignee_id='7', candidate_snapshot=?::jsonb WHERE id=10",
                "{\"userIds\":[\"1\"],\"sources\":{\"1\":[{\"type\":\"TRANSFER\"}]},\"unresolvedSubjects\":[]}");
        String availableBefore = taskSnapshot();
        engine.transferTask(TASK, "2", "1", "保留目前可得来源");
        JsonNode first = mapper.readTree(taskSnapshot());
        assertThat(first.path("originSnapshot").asText()).isEqualTo(availableBefore);
        assertThat(first.path("originRecordedAfterPriorTransfer").asBoolean()).isTrue();
        engine.transferTask(TASK, "3", "2", "后续转办");
        JsonNode second = mapper.readTree(taskSnapshot());
        assertThat(second.path("originSnapshot").asText()).isEqualTo(availableBefore);
        assertThat(second.path("originRecordedAfterPriorTransfer").asBoolean()).isTrue();
    }

    @Test
    void personnelSearchAndCommandUseTheSameTenantAvailabilityWithRealSql() {
        assertThat(engine.transferTargets(TASK, "1", "")).extracting(item -> item.get("id")).containsExactlyInAnyOrder("2", "3", "7");
        assertThat(engine.transferTargets(TASK, "1", "REVIEWER")).extracting(item -> item.get("id")).containsExactly("3", "2");
        assertThat(engine.transferTargets(TASK, "1", "复核")).extracting(item -> item.get("id")).containsExactly("3", "2");
        assertThat(engine.transferTargets(TASK, "1", " reviewer2 ")).extracting(item -> item.get("id")).containsExactly("2");
        assertThat(engine.transferTargets(TASK, "1", "no-match")).isEmpty();
        engine.transferTask(TASK, "02", "1", "按实际用户标识记录");
        assertThat(tasks.findById(TASK).orElseThrow().getAssigneeId()).isEqualTo("2");
        assertThat(todo("2")).containsExactly(TASK);
    }

    static Stream<Arguments> rejectedCommands() {
        return Stream.of(
                Arguments.of("3", "2", "原因", "待处理人"),
                Arguments.of("1", "1", "原因", "当前处理人"),
                Arguments.of("1", "6", "原因", "租户"),
                Arguments.of("1", "4", "原因", "停用"),
                Arguments.of("1", "5", "原因", "锁定"),
                Arguments.of("1", "999", "原因", "不存在"),
                Arguments.of("1", "invalid", "原因", "不存在"),
                Arguments.of("1", null, "原因", "请选择"),
                Arguments.of("1", "2", null, "转办原因"),
                Arguments.of("1", "2", "  ", "转办原因"),
                Arguments.of("1", "2", "长".repeat(501), "500"));
    }

    @ParameterizedTest(name = "rejects invalid transfer #{index}")
    @MethodSource("rejectedCommands")
    void invalidTransferDoesNotMutateTaskInstanceLogOrAudit(String actor, String target, String reason, String message) {
        Map<String, String> before = state();
        assertThatThrownBy(() -> engine.transferTask(TASK, target, actor, reason)).hasMessageContaining(message);
        assertThat(state()).isEqualTo(before);
    }

    @ParameterizedTest
    @ValueSource(strings = {"COMPLETED", "TERMINATED"})
    void endedTaskRejectsSearchAndTransferWithoutWrites(String taskStatus) {
        jdbc.update("UPDATE workflow_task SET status=? WHERE id=10", taskStatus);
        Map<String, String> before = state();
        assertThatThrownBy(() -> engine.transferTargets(TASK, "1", "")).hasMessageContaining("无权转办");
        assertThatThrownBy(() -> engine.transferTask(TASK, "2", "1", "无效请求")).isInstanceOf(RuntimeException.class);
        assertThat(state()).isEqualTo(before);
    }

    @Test
    void terminatedInstanceRejectsBothEntrypoints() {
        jdbc.update("UPDATE workflow_instance SET status='TERMINATED' WHERE id=20");
        Map<String, String> before = state();
        assertThatThrownBy(() -> engine.transferTargets(TASK, "1", "")).hasMessageContaining("无权转办");
        assertThatThrownBy(() -> engine.transferTask(TASK, "2", "1", "无效请求")).hasMessageContaining("已结束");
        assertThat(state()).isEqualTo(before);
    }

    @Test
    void dhrTaskStillCannotUseGenericSearchTransferOrQueue() {
        jdbc.update("UPDATE workflow_instance SET business_type='DHR_SUMMARY' WHERE id=20");
        Map<String, String> before = state();
        assertThatThrownBy(() -> engine.transferTargets(TASK, "1", "")).hasMessageContaining("DHR");
        assertThatThrownBy(() -> engine.transferTask(TASK, "2", "1", "无效请求")).hasMessageContaining("DHR");
        assertThat(todo("1")).isEmpty();
        assertThat(state()).isEqualTo(before);
    }

    @Test
    void realAuditInsertFailureRollsBackResponsibilityAndActionLog() {
        Map<String, String> before = state();
        jdbc.execute("CREATE FUNCTION w3_reject_transfer_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic transfer audit rejection'; END $$");
        jdbc.execute("CREATE TRIGGER w3_reject_transfer_audit BEFORE INSERT ON audit_event FOR EACH ROW EXECUTE FUNCTION w3_reject_transfer_audit()");
        try {
            assertThatThrownBy(() -> engine.transferTask(TASK, "2", "1", "必须整体回滚"))
                    .isInstanceOf(RuntimeException.class).hasStackTraceContaining("synthetic transfer audit rejection");
            assertThat(state()).isEqualTo(before);
        } finally {
            jdbc.execute("DROP TRIGGER w3_reject_transfer_audit ON audit_event");
            jdbc.execute("DROP FUNCTION w3_reject_transfer_audit()");
        }
    }

    @Test
    void concurrentTransfersFromTheSameFormerOperatorAcceptOnlyOneResponsibilityChange() throws Exception {
        String original = taskSnapshot();
        var blocker = dataSource.getConnection();
        blocker.setAutoCommit(false);
        try (var executor = Executors.newFixedThreadPool(2)) {
            try {
                try (var statement = blocker.createStatement()) {
                    statement.executeQuery("SELECT id FROM workflow_instance WHERE id=20 FOR UPDATE").close();
                }
                java.util.concurrent.Callable<Boolean> first = () -> transferAttempt("2");
                java.util.concurrent.Callable<Boolean> second = () -> transferAttempt("3");
                var a = executor.submit(first);
                var b = executor.submit(second);
                awaitInstanceLockWaiters(2);
                blocker.commit();
                assertThat(List.of(a.get(15, TimeUnit.SECONDS), b.get(15, TimeUnit.SECONDS))).containsExactlyInAnyOrder(true, false);
                assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Long.class)).isEqualTo(1);
                assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_action_log WHERE action='TASK_TRANSFER'", Long.class)).isEqualTo(1);
                assertThat(mapper.readTree(taskSnapshot()).path("originSnapshot").asText()).isEqualTo(original);
            } finally {
                blocker.rollback();
                blocker.close();
            }
        }
    }

    @Test
    void formerCandidateWaitingBehindTransferCannotCompleteFromItsCachedSnapshot() throws Exception {
        String original = taskSnapshot();
        var blocker = dataSource.getConnection();
        blocker.setAutoCommit(false);
        try (var executor = Executors.newFixedThreadPool(2)) {
            try {
                try (var statement = blocker.createStatement()) {
                    statement.executeQuery("SELECT id FROM workflow_instance WHERE id=20 FOR UPDATE").close();
                }
                var transfer = executor.submit(() -> transferAttempt("2"));
                // PostgreSQL queues the transfer first. The old candidate then reads before waiting behind it.
                awaitInstanceLockWaiters(1);
                var completion = executor.submit(() -> {
                    AuditContext.setOperator("7", "等待中的原候选");
                    try {
                        engine.completeTask(TASK, "APPROVE", "不应按旧资格完成", "7", null);
                        return true;
                    } catch (com.zencas.edhr.common.exception.BusinessException expected) {
                        assertThat(expected.getMessage()).contains("待处理人");
                        return false;
                    } finally { AuditContext.clear(); }
                });
                awaitInstanceLockWaiters(2);
                blocker.commit();
                assertThat(transfer.get(15, TimeUnit.SECONDS)).isTrue();
                assertThat(completion.get(15, TimeUnit.SECONDS)).isFalse();
                assertCurrentTarget("2", original);
                assertThat(jdbc.queryForObject("SELECT status FROM workflow_instance WHERE id=20", String.class)).isEqualTo("RUNNING");
                assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Long.class)).isEqualTo(1);
                assertThat(jdbc.queryForList("SELECT action FROM workflow_action_log", String.class)).containsExactly("TASK_TRANSFER");
            } finally {
                blocker.rollback();
                blocker.close();
            }
        }
    }

    private void awaitInstanceLockWaiters(int expected) throws InterruptedException {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
        int waiting;
        do {
            waiting = jdbc.queryForObject("SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() "
                    + "AND wait_event_type='Lock' AND query LIKE '%workflow_instance%'", Integer.class);
            if (waiting < expected) Thread.sleep(20);
        } while (waiting < expected && System.nanoTime() < deadline);
        assertThat(waiting).as("transactions reached the real instance lock after their initial task read").isEqualTo(expected);
    }

    private boolean transferAttempt(String target) {
        AuditContext.setOperator("1", "并发合成用户");
        try {
            engine.transferTask(TASK, target, "1", "并发转办");
            return true;
        } catch (com.zencas.edhr.common.exception.BusinessException expected) {
            assertThat(expected.getMessage()).contains("待处理人");
            return false;
        } finally { AuditContext.clear(); }
    }

    @Test
    void controllerUsesAuthenticatedActorAndRequiresTheTargetAndReasonInJson() throws Exception {
        String original = taskSnapshot();
        mvc.perform(get("/api/v1/workflow/tasks/10/transfer-targets").param("keyword", "reviewer2"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].id").value("2"));
        mvc.perform(post("/api/v1/workflow/tasks/10/transfer").contentType("application/json")
                        .content("{\"newAssigneeId\":\"2\",\"operatorId\":\"6\",\"reason\":\"  认证用户发起委托  \"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.newAssigneeId").value("2"));
        assertCurrentTarget("2", original);
        assertThat(jdbc.queryForObject("SELECT operator_id FROM audit_event", String.class)).isEqualTo("1");
        assertThat(jdbc.queryForObject("SELECT reason FROM audit_event", String.class)).isEqualTo("认证用户发起委托");
        Map<String, String> before = state();
        mvc.perform(get("/api/v1/workflow/tasks/10/transfer-targets")).andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/workflow/tasks/10/transfer").contentType("application/json")
                        .content("{\"newAssigneeId\":\"3\",\"operatorId\":\"2\",\"reason\":\"伪造处理人\"}"))
                .andExpect(status().isBadRequest());
        assertThat(state()).isEqualTo(before);
        operator("2");
        mvc.perform(post("/api/v1/workflow/tasks/10/transfer").contentType("application/json")
                        .content("{\"newAssigneeId\":\"3\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("请填写转办原因"));
        mvc.perform(post("/api/v1/workflow/tasks/10/transfer").contentType("application/json")
                        .content("{\"reason\":\"没有目标\"}"))
                .andExpect(status().isBadRequest());
        assertThat(state()).isEqualTo(before);
    }

    private void operator(String id) {
        AuditContext.setOperator(id, "合成用户" + id);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(id, null, List.of()));
    }

    private void assertCurrentTarget(String target, String original) throws Exception {
        WorkflowTask task = tasks.findById(TASK).orElseThrow();
        JsonNode snapshot = mapper.readTree(task.getCandidateSnapshot());
        assertThat(task.getId()).isEqualTo(TASK);
        assertThat(task.getNodeId()).isEqualTo(30L);
        assertThat(task.getStatus()).isEqualTo("PENDING");
        assertThat(task.getAction()).isNull();
        assertThat(task.getCompletedAt()).isNull();
        assertThat(task.getAssigneeId()).isEqualTo(target);
        assertThat(snapshot.path("userIds")).hasSize(1);
        assertThat(snapshot.path("userIds").get(0).asText()).isEqualTo(target);
        assertThat(snapshot.path("unrestricted").asBoolean()).isFalse();
        assertThat(snapshot.path("originSnapshot").asText()).isEqualTo(original);
        assertThat(snapshot.path("originRecordedAfterPriorTransfer").asBoolean()).isFalse();
    }

    private String taskSnapshot() { return jdbc.queryForObject("SELECT candidate_snapshot::text FROM workflow_task WHERE id=10", String.class); }
    private List<Long> todo(String actor) { return tasks.findTodoForUser(actor, "[\"" + actor + "\"]", Integer.MAX_VALUE, 0L).stream().map(WorkflowTask::getId).toList(); }
    private String row(String table) { return jdbc.queryForObject("SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]') FROM " + table + " t", String.class); }
    private Map<String, String> state() {
        Map<String, String> rows = new LinkedHashMap<>();
        for (String table : List.of("workflow_task", "workflow_instance", "workflow_action_log", "audit_event")) rows.put(table, row(table));
        return rows;
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({WorkflowEngine.class, WorkflowTaskController.class})
    static class Config {
        @Bean EntityManager em(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes types() { return PersistenceManagedTypes.of(WorkflowDefinition.class.getName(), WorkflowDefinitionVersion.class.getName(), WorkflowBindingRule.class.getName(), WorkflowInstance.class.getName(), WorkflowTask.class.getName(), WorkflowActionLog.class.getName(), WorkflowNode.class.getName(), WorkflowEdge.class.getName(), UserAccount.class.getName(), AuditEvent.class.getName()); }
        @Bean WorkflowDefinitionRepository definitions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowDefinitionRepository.class); }
        @Bean WorkflowDefinitionVersionRepository versions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowDefinitionVersionRepository.class); }
        @Bean WorkflowBindingRuleRepository bindings(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowBindingRuleRepository.class); }
        @Bean WorkflowInstanceRepository instances(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowInstanceRepository.class); }
        @Bean WorkflowTaskRepository tasks(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowTaskRepository.class); }
        @Bean WorkflowActionLogRepository logs(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowActionLogRepository.class); }
        @Bean WorkflowNodeRepository nodes(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowNodeRepository.class); }
        @Bean WorkflowEdgeRepository edges(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowEdgeRepository.class); }
        @Bean UserAccountRepository users(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(UserAccountRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean StateMachineService states() { return mock(StateMachineService.class); }
        @Bean SubjectResolver subjects() { return mock(SubjectResolver.class); }
    }
}
