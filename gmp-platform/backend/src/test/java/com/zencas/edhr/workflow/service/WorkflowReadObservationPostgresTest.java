package com.zencas.edhr.workflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.TenantTransferTargets;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import javax.sql.DataSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/** Opt-in native read-cost observation. SQL counts are evidence, not inefficient contracts to preserve. */
@EnabledIfSystemProperty(named = "edhr.audit.workflowReads", matches = "true")
@EnabledIfEnvironmentVariable(named = "WORKFLOW_READ_TEST_DATABASE_URL",
        matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_workflow_read_test_[a-z0-9_]+")
@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.liquibase.enabled=true", "spring.jpa.show-sql=false"})
@Import(WorkflowReadObservationPostgresTest.Config.class)
class WorkflowReadObservationPostgresTest {
    private static final ThreadLocal<Read<?>> CURRENT = new ThreadLocal<>();
    @Autowired JdbcTemplate jdbc;
    @Autowired WorkflowOperationsQuery operations;
    @Autowired UserAccountRepository users;
    @Autowired ObjectMapper mapper;
    @MockBean com.zencas.edhr.production.service.FormProjectionWorker worker;

    @DynamicPropertySource static void database(DynamicPropertyRegistry properties) {
        String url = System.getenv("WORKFLOW_READ_TEST_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_workflow_read_test_[a-z0-9_]+"))
            throw new IllegalStateException("A disposable workflow read-observation database is required");
        properties.add("spring.datasource.url", () -> url);
        properties.add("spring.datasource.username", () -> System.getenv("PGUSER"));
        properties.add("spring.datasource.password", () -> "");
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @BeforeEach void fixture() {
        jdbc.execute("TRUNCATE workflow_task,workflow_instance,workflow_node,workflow_edge,workflow_action_log,workflow_definition,user_account CASCADE");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES (41,0,'read-applicant','申请人','not-used','ACTIVE'),(42,0,'read-assignee-a','甲审批人','not-used','ACTIVE'),(43,0,'read-assignee-b','乙审批人','not-used','ACTIVE')");
        jdbc.update("INSERT INTO workflow_definition(id,name,type,business_type,status) VALUES(900101,'读取观测','GENERAL','READ_OBSERVATION','PUBLISHED')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,status,is_current,nodes_json,edges_json) VALUES(900102,900101,'PUBLISHED',true,'[]','[]')");
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(900103,900102,'APPROVAL','审批','{}')");
        jdbc.update("INSERT INTO workflow_instance(id,definition_id,version_id,business_type,business_id,initiator_id,status,current_node_ids,started_at) VALUES(900100,900101,900102,'READ_OBSERVATION','READ-OBS-1','41','RUNNING','900103',CURRENT_TIMESTAMP)");
        AuditContext.setOperator("41", "申请人");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("41", null,
                List.of(new SimpleGrantedAuthority("workflow.intervene"))));
    }

    @AfterEach void clear() { CURRENT.remove(); AuditContext.clear(); SecurityContextHolder.clearContext(); }

    @ParameterizedTest @ValueSource(ints = {0, 1, 100, 1000})
    void detailObservesRepeatedNullAndMissingAssigneeLookups(int count) throws Exception {
        jdbc.update("""
                INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot,opinion,action,created_at)
                SELECT 10000+n,900100,900103,'COMPLETED',
                    CASE n%4 WHEN 0 THEN '42' WHEN 1 THEN '43' WHEN 2 THEN NULL ELSE '999999' END,
                    '{"userIds":["42","43"]}'::jsonb,'观测意见','APPROVE',CURRENT_TIMESTAMP
                FROM generate_series(0,?-1) n
                """, count);
        Read<Map<String, Object>> read = capture(() -> operations.detail(900100L));
        @SuppressWarnings("unchecked") var tasks = (List<Map<String, Object>>) read.value.get("tasks");
        assertThat(tasks).hasSize(count);
        assertThat(read.value.get("businessType")).isEqualTo("READ_OBSERVATION");
        for (var task : tasks) {
            int ordinal = Integer.parseInt(task.get("id").toString()) - 10000;
            assertThat(task.get("assigneeName")).isEqualTo(switch (ordinal % 4) {
                case 0 -> "甲审批人"; case 1 -> "乙审批人"; default -> "待候选人处理";
            });
            assertThat(task.get("status")).isEqualTo("COMPLETED");
            assertThat(task.get("opinion")).isEqualTo("观测意见");
            assertThat(task.get("action")).isEqualTo("APPROVE");
            assertThat(task.get("taskState").toString()).isNotBlank();
        }
        record("workflow-detail", Map.of("tasks", count, "existingAssignees", Math.min(count, 2),
                "returnedTasks", tasks.size(), "assigneeKinds", "two repeated existing IDs, null, missing ID"), read);
        assertThat(nameReads(read)).isLessThanOrEqualTo(1);
        assertThat(read.jdbcSql.size() + read.hibernateSql.size()).isLessThanOrEqualTo(count == 0 ? 5 : 6);
    }

    @Test void noAssigneesSkipTheNameRead() throws Exception {
        jdbc.update("""
                INSERT INTO workflow_task(id,instance_id,node_id,status,candidate_snapshot)
                SELECT 10000+n,900100,900103,'COMPLETED','{}'::jsonb FROM generate_series(0,24) n
                """);
        Read<Map<String, Object>> read = capture(() -> operations.detail(900100L));
        @SuppressWarnings("unchecked") var tasks = (List<Map<String, Object>>) read.value.get("tasks");
        assertThat(tasks).hasSize(25).allSatisfy(task -> {
            assertThat(task.get("assigneeId")).isNull();
            assertThat(task.get("assigneeName")).isEqualTo("待候选人处理");
        });
        record("workflow-detail-null-only", Map.of("tasks", 25), read);
        assertThat(nameReads(read)).isZero();
        assertThat(read.jdbcSql.size() + read.hibernateSql.size()).isEqualTo(5);
    }

    @Test void batchNamesPreserveTextIdentityAndHistoricalEvidence() throws Exception {
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES (-1,0,'read-negative','负ID账户','not-used','ACTIVE'),(44,0,'read-blank','','not-used','ACTIVE')");
        var assignees = Arrays.asList("42", "43", "42", null, "999999", "00042", " 42", "42 ", "+42", "not-an-id", "", "9223372036854775808", "' OR 1=1 --", "-1", "44");
        var rows = new ArrayList<Object[]>();
        for (int i = 0; i < assignees.size(); i++) rows.add(new Object[]{10000L + i, assignees.get(i)});
        jdbc.batchUpdate("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot,opinion,action,signature_id) VALUES(?,900100,900103,'COMPLETED',?,'{}'::jsonb,'保留意见','APPROVE',777)", rows);
        jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,signature_password_hash,snapshot_data) VALUES(777,'WORKFLOW_TASK','10000','审批','42','签署时旧名','not-used','{\"signerName\":\"签署时旧名\"}'::jsonb)");
        jdbc.update("INSERT INTO workflow_action_log(id,instance_id,task_id,node_id,action,operator_id,operator_name,snapshot) VALUES(920001,900100,10000,'900103','TASK_COMPLETE','42','日志存储旧名','{\"signerName\":\"快照旧名\"}'::jsonb)");
        String frozenSignature = jdbc.queryForObject("SELECT snapshot_data::text FROM signature WHERE id=777", String.class);
        String candidate = jdbc.queryForObject("SELECT candidate_snapshot::text FROM workflow_task WHERE id=10000", String.class);
        Read<Map<String, Object>> read = capture(() -> operations.detail(900100L));
        @SuppressWarnings("unchecked") var tasks = (List<Map<String, Object>>) read.value.get("tasks");
        assertThat(tasks).hasSize(assignees.size());
        for (var task : tasks) {
            int ordinal = Integer.parseInt(task.get("id").toString()) - 10000;
            String assignee = assignees.get(ordinal);
            assertThat(task.get("assigneeId")).isEqualTo(assignee);
            String name = "42".equals(assignee) ? "甲审批人" : "43".equals(assignee) ? "乙审批人"
                    : "-1".equals(assignee) ? "负ID账户" : "44".equals(assignee) ? "" : "待候选人处理";
            assertThat(task.get("assigneeName")).isEqualTo(name);
            assertThat(task.get("opinion")).isEqualTo("保留意见");
            assertThat(task.get("action")).isEqualTo("APPROVE");
            assertThat(task.get("signatureId")).isEqualTo("777");
            assertThat(task.get("taskState")).isEqualTo(WorkflowResponsibilityService.taskState(
                    com.zencas.edhr.workflow.entity.WorkflowTask.builder().id(10000L + ordinal).nodeId(900103L)
                            .status("COMPLETED").assigneeId(assignee).candidateSnapshot(candidate).build()));
        }
        @SuppressWarnings("unchecked") var logs = (List<Map<String, Object>>) read.value.get("logs");
        assertThat(logs).hasSize(1);
        assertThat(logs.getFirst().get("operatorName")).isEqualTo("甲审批人");
        assertThat(mapper.readTree(logs.getFirst().get("snapshot").toString()).path("signerName").asText()).isEqualTo("快照旧名");
        assertThat(jdbc.queryForObject("SELECT snapshot_data::text FROM signature WHERE id=777", String.class)).isEqualTo(frozenSignature);
        record("workflow-detail-text-identities", Map.of("tasks", assignees.size()), read);
        assertThat(nameReads(read)).isLessThanOrEqualTo(1);
    }

    @Test void distinctAssigneesAreReadTogether() throws Exception {
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) SELECT 40000+n,0,'distinct-'||n,'批量姓名-'||n,'not-used','ACTIVE' FROM generate_series(0,999) n");
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot) SELECT 10000+n,900100,900103,'COMPLETED',(40000+n)::text,'{}'::jsonb FROM generate_series(0,999) n");
        Read<Map<String, Object>> read = capture(() -> operations.detail(900100L));
        @SuppressWarnings("unchecked") var tasks = (List<Map<String, Object>>) read.value.get("tasks");
        assertThat(tasks).hasSize(1000);
        for (var task : tasks) assertThat(task.get("assigneeName")).isEqualTo("批量姓名-" + (Integer.parseInt(task.get("id").toString()) - 10000));
        record("workflow-detail-distinct-identities", Map.of("tasks", 1000, "distinctAssignees", 1000), read);
        assertThat(nameReads(read)).isLessThanOrEqualTo(1);
        assertThat(read.jdbcSql.size() + read.hibernateSql.size()).isLessThanOrEqualTo(6);
    }

    private static long nameReads(Read<?> read) {
        return read.jdbcSql.stream().filter(sql -> sql.contains("FROM user_account WHERE CAST(id AS VARCHAR)")).count();
    }

    @ParameterizedTest @ValueSource(ints = {0, 1, 99, 100, 101, 5000})
    void personnelDirectoryObservesFullPageCount(int count) throws Exception {
        jdbc.update("""
                INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status)
                SELECT 30000+n,0,'directory-read-'||n,'dir-scope-'||lpad(n::text,5,'0'),'not-used','ACTIVE'
                FROM generate_series(0,?-1) n
                """, count);
        Read<List<Map<String, String>>> read = capture(() -> new TenantTransferTargets(users).search(0L, "42", "dir-scope"));
        assertThat(read.value).hasSize(Math.min(count, 100));
        for (int i = 0; i < read.value.size(); i++) {
            assertThat(read.value.get(i).get("id")).isEqualTo(String.valueOf(30000 + i));
            assertThat(read.value.get(i).get("name")).isEqualTo("dir-scope-%05d".formatted(i));
        }
        record("personnel-directory", Map.of("matchingPersonnel", count, "resultLimit", 100, "returnedPersonnel", read.value.size()), read);
    }

    private static class Read<T> {
        T value;
        long elapsedNanos;
        final List<String> jdbcSql = new ArrayList<>();
        final List<String> hibernateSql = new ArrayList<>();
    }
    private static <T> Read<T> capture(Supplier<T> action) {
        var read = new Read<T>(); CURRENT.set(read); long started = System.nanoTime();
        try { read.value = action.get(); return read; }
        finally { read.elapsedNanos = System.nanoTime() - started; CURRENT.remove(); }
    }
    private void record(String kind, Map<String, Object> data, Read<?> read) throws Exception {
        String output = System.getProperty("edhr.audit.workflowReadOutput");
        var event = mapper.createObjectNode().put("kind", kind).put("elapsedNanos", read.elapsedNanos)
                .put("jdbcStatements", read.jdbcSql.size()).put("hibernateStatements", read.hibernateSql.size())
                .put("totalStatements", read.jdbcSql.size() + read.hibernateSql.size());
        event.set("data", mapper.valueToTree(data)); event.set("jdbcSql", mapper.valueToTree(read.jdbcSql));
        event.set("hibernateSql", mapper.valueToTree(read.hibernateSql));
        event.set("jdbcSqlCounts", mapper.valueToTree(read.jdbcSql.stream().collect(Collectors.groupingBy(sql -> sql, Collectors.counting()))));
        if (output != null) Files.writeString(Path.of(output), event + "\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }
    @TestConfiguration static class Config {
        @Bean JdbcTemplate observedJdbc(DataSource source) {
            return new JdbcTemplate(source) {
                @Override public List<Map<String, Object>> queryForList(String sql, Object... args) {
                    Read<?> read = CURRENT.get(); if (read != null) read.jdbcSql.add(sql);
                    return super.queryForList(sql, args);
                }
            };
        }
        @Bean HibernatePropertiesCustomizer inspectQueries() {
            return properties -> properties.put("hibernate.session_factory.statement_inspector", (StatementInspector) sql -> {
                Read<?> read = CURRENT.get(); if (read != null) read.hibernateSql.add(sql);
                return sql;
            });
        }
    }
}
