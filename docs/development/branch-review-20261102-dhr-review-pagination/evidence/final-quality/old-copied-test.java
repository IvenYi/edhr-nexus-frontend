package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.mock;

/** Actual PostgreSQL JSON/collation/CTE execution against canonical read-table DDL and indexes.
 * This does not replace the full-application workflow/approval tests. */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@EnabledIfEnvironmentVariable(named = "RECORD_CONTROL_TEST_DATABASE_URL",
        matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_record_control_test_[a-z0-9_]+")
class DhrReviewPaginationPostgresTest {
    private static final String SCHEMA = "dhr_review_page_test";
    private static final List<String> TABLES = List.of("dhr_instance", "dhr_summary_version", "dhr_summary_review", "workflow_node", "workflow_task");
    private final ObjectMapper mapper = new ObjectMapper();
    private JdbcTemplate jdbc;
    private CountingJdbc counted;
    private DhrReviewService service;
    private List<Map<String, Object>> originalRows;

    static class CountingJdbc extends JdbcTemplate {
        int calls, rows;
        String sql;
        Object[] args;
        CountingJdbc(DriverManagerDataSource source) { super(source); }
        @Override public List<Map<String, Object>> queryForList(String sql, Object... args) {
            this.sql = sql; this.args = args.clone(); calls++;
            var result = super.queryForList(sql, args); rows += result.size(); return result;
        }
        void reset() { calls = 0; rows = 0; }
    }

    @BeforeAll void setup() throws Exception {
        String url = System.getenv("RECORD_CONTROL_TEST_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_record_control_test_[a-z0-9_]+"))
            throw new IllegalStateException("A disposable test database is required");
        var admin = new JdbcTemplate(new DriverManagerDataSource(url, System.getenv("PGUSER"), ""));
        admin.execute("DROP SCHEMA IF EXISTS " + SCHEMA + " CASCADE");
        admin.execute("CREATE SCHEMA " + SCHEMA);
        var source = new DriverManagerDataSource(url + "?currentSchema=" + SCHEMA, System.getenv("PGUSER"), "");
        jdbc = new JdbcTemplate(source); counted = new CountingJdbc(source);
        String ddl;
        try (var input = getClass().getResourceAsStream("/db/changelog/baseline/0001-current-schema.sql")) {
            ddl = new String(Objects.requireNonNull(input).readAllBytes(), StandardCharsets.UTF_8);
        }
        for (String table : TABLES) {
            var tableDdl = Pattern.compile("CREATE TABLE public\\." + table + " \\(.*?\\n\\);", Pattern.DOTALL).matcher(ddl);
            assertThat(tableDdl.find()).as(table).isTrue();
            jdbc.execute(tableDdl.group().replace("public.", ""));
        }
        for (String statement : ddl.split(";")) {
            String sql = statement.strip();
            if (TABLES.stream().anyMatch(table -> sql.startsWith("ALTER TABLE ONLY public." + table + "\n"))
                    && (sql.contains("PRIMARY KEY") || sql.contains("UNIQUE ("))) jdbc.execute(sql.replace("public.", ""));
            if (sql.startsWith("CREATE ") && sql.contains("INDEX ") && TABLES.stream().anyMatch(table -> sql.contains(" ON public." + table + " ")))
                jdbc.execute(sql.replace("public.", ""));
        }
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(1,1,'APPROVAL','质量审批','{}')");
        var snapshots = Arrays.asList(null, "{}", "null", "[]", "{\"userIds\":[]}", "{\"userIds\":{}}",
                "{\"userIds\":null}", "{\"userIds\":\"8\"}", "{\"userIds\":[\"7\"]}", "{\"userIds\":[\"8\"]}",
                "{\"userIds\":[\"7\",\"8\"]}", "{\"userIds\":[7]}", "{\"userIds\":{\"a\":\"7\"}}",
                "{\"userIds\":[null,{},[],7.0]}", "{\"unrestricted\":true}", "{\"unrestricted\":false,\"userIds\":[\"8\"]}",
                "{\"unrestricted\":\" true \",\"userIds\":[\"8\"]}", "{\"unrestricted\":\"TRUE\"}",
                "{\"unrestricted\":\"\\ttrue\\u001f\"}",
                "{\"unrestricted\":1}", "{\"unrestricted\":0}", "{\"unrestricted\":-1}", "{\"unrestricted\":1.0}",
                "{\"unrestricted\":9223372036854775808}");
        long id = 10;
        for (String candidate : snapshots) for (String status : List.of("PENDING", "PROCESSING", "COMPLETED", "REJECTED", "TRANSFERRED"))
            for (String review : List.of("PENDING_REVIEW", "APPROVED", "RETURNED")) {
                seed(id, id % 7 == 0 ? "other" : "default", candidate, id % 4 == 0 ? null : id % 2 == 0 ? "7" : "8", status, review);
                id++;
            }
        originalRows = jdbc.queryForList(oracleSelect());
        service = new DhrReviewService(counted, mapper, mock(DhrSummaryService.class), mock(com.zencas.edhr.workflow.engine.WorkflowEngine.class),
                mock(com.zencas.edhr.workflow.repository.WorkflowInstanceRepository.class), mock(ExecutionAccess.class),
                mock(com.zencas.edhr.compliance.repository.AuditEventRepository.class), new SnowflakeIdGenerator(2), mock(DhrEvidenceImpactService.class));
    }

    private void seed(long id, String tenant, String snapshot, String assignee, String taskStatus, String reviewStatus) {
        jdbc.update("""
            INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,
              product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,
              status,created_at,updated_at,product_name)
            VALUES(?,?,?, ?,?,'BATCH',1,?,1,1,1,1,1,'{}','{}','COMPLETED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?)
            """, id, tenant, "DHR-" + id, id, "批次_100%", "WO\\literal", id % 2 == 0 ? "İ ΟΣ ÄBC 产品" : null);
        jdbc.update("""
            INSERT INTO dhr_summary_version(id,tenant_id,dhr_instance_id,version_no,status,review_mode,base_directory_snapshot,
              overlay_directory_snapshot,candidate_snapshot,snapshot_hash,submitted_by,submitted_at,created_at,check_result_snapshot)
            VALUES(?,?,?,1,'PENDING_REVIEW','NONE','{}','{}','[]','hash',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'{}')
            """, id, tenant, id, id % 3 == 0 ? null : "提交人 Alice");
        jdbc.update("INSERT INTO dhr_summary_review VALUES(?,?,?,'9',CURRENT_TIMESTAMP)", id, id, reviewStatus);
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot) VALUES(?,?,1,?,?,?::jsonb)",
                id, id, taskStatus, assignee, snapshot);
    }

    static Stream<Arguments> searches() {
        return Stream.of("PENDING", "DONE").flatMap(view -> Stream.of("7", "8", "9").flatMap(actor ->
                Arrays.asList(null, "", "  DHR-  ", "\u2003DHR-\u2003", "100%", "_100", "\\literal", "alice", "产品", "i\u0307", "ος", "ÄBC", "no-match", "' OR 1=1 --")
                        .stream().map(keyword -> Arguments.of(view, actor, keyword))));
    }

    @ParameterizedTest @MethodSource("searches")
    void nativeQueryMatchesPreviousJavaAuthorityAndLiteralSearch(String view, String actor, String keyword) throws Exception {
        compare(view, actor, keyword, 0, 20);
        compare(view, actor, keyword, 1, 20);
    }

    static Stream<Arguments> pages() {
        return Stream.of("PENDING", "DONE").flatMap(view -> Stream.of(new int[]{-1, 0}, new int[]{0, -1}, new int[]{0, 201},
                new int[]{1, 1}, new int[]{5000, 20}, new int[]{Integer.MAX_VALUE, 200}).map(p -> Arguments.of(view, p[0], p[1])));
    }
    @ParameterizedTest @MethodSource("pages")
    void countAndPageBoundariesMatchPreviousJava(String view, int page, int size) throws Exception { compare(view, "7", "", page, size); }

    private void compare(String view, String actor, String keyword, int page, int size) throws Exception {
        AuditContext.setOperator(actor, "普通账号"); counted.reset();
        var actual = service.list(view, keyword, page, size);
        String needle = keyword == null ? "" : keyword.strip().toLowerCase(Locale.ROOT);
        var expected = new ArrayList<String>();
        for (var row : originalRows) {
            boolean pending = "PENDING_REVIEW".equals(row.get("review_status")) && Set.of("PENDING", "PROCESSING").contains(row.get("status"));
            JsonNode candidate = row.get("candidate_snapshot") == null ? mapper.createObjectNode() : mapper.readTree(row.get("candidate_snapshot").toString());
            boolean eligible = candidate.path("unrestricted").asBoolean();
            if (!eligible && !candidate.path("userIds").isEmpty()) {
                for (JsonNode user : candidate.path("userIds")) if (actor.equals(user.asText())) eligible = true;
            } else if (!eligible) eligible = actor.equals(row.get("assignee_id"));
            boolean handled = actor.equals(row.get("assignee_id")) && Set.of("COMPLETED", "REJECTED").contains(row.get("status"));
            if (view.equals("PENDING") ? !pending || !eligible : pending || !handled) continue;
            if (!needle.isEmpty() && List.of("dhr_no", "object_no", "work_order_no", "product_name", "submitted_by").stream()
                    .noneMatch(k -> Objects.toString(row.get(k), "").toLowerCase(Locale.ROOT).contains(needle))) continue;
            expected.add(row.get("id").toString());
        }
        int normalizedPage = Math.max(0, page), normalizedSize = Math.max(1, Math.min(200, size));
        long offset = (long) normalizedPage * normalizedSize;
        var expectedPage = expected.stream().skip(offset).limit(normalizedSize).toList();
        assertThat(actual.getContent().stream().map(row -> row.path("id").asText())).containsExactlyElementsOf(expectedPage);
        assertThat(actual.getTotalElements()).isEqualTo(expected.size());
        assertThat(actual.getPage()).isEqualTo(normalizedPage); assertThat(actual.getSize()).isEqualTo(normalizedSize);
        assertThat(actual.getTotalPages()).isEqualTo((int) Math.ceil((double) expected.size() / normalizedSize));
        assertThat(counted.calls).as("one statement, including accurate totals on empty pages").isEqualTo(1);
        assertThat(counted.rows).isEqualTo(Math.max(1, expectedPage.size()));
    }

    @Test void unrelatedHistoryDoesNotIncreaseStatementsOrTransferredRows() throws Exception {
        AuditContext.setOperator("7", "普通账号");
        var before = service.list("PENDING", "", 0, 20);
        // Different instances respect the actual unique active-instance/node index.
        jdbc.execute("""
            INSERT INTO dhr_summary_version SELECT 100000+i,tenant_id,dhr_instance_id,i+1,status,review_mode,
              review_workflow_definition_id,review_workflow_version_id,base_directory_snapshot,overlay_directory_snapshot,candidate_snapshot,
              md5(i::text),submitted_by,submitted_at,created_at,check_result_snapshot,attachment_snapshot
            FROM dhr_summary_version CROSS JOIN generate_series(1,5000) i WHERE id=10
            """);
        jdbc.execute("INSERT INTO dhr_summary_review SELECT 100000+i,100000+i,'PENDING_REVIEW','9',CURRENT_TIMESTAMP FROM generate_series(1,5000) i");
        jdbc.execute("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot) SELECT 100000+i,100000+i,1,'PENDING','99','{\"userIds\":[\"99\"]}'::jsonb FROM generate_series(1,5000) i");
        try {
            counted.reset(); var after = service.list("PENDING", "", 0, 20);
            String output = System.getProperty("edhr.audit.dhrPageOutput");
            if (output != null) {
                Files.writeString(Path.of(output), mapper.createObjectNode().put("otherTasksAdded", 5000).put("sqlCalls", counted.calls)
                        .put("rowsTransferred", counted.rows).put("personalTotal", after.getTotalElements()).toString() + "\n");
                Files.writeString(Path.of(output + ".sql"), counted.sql);
                Files.writeString(Path.of(output + ".args.json"), mapper.writeValueAsString(counted.args));
                Files.writeString(Path.of(output + ".plan.json"), jdbc.queryForObject("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) " + counted.sql, String.class, counted.args));
            }
            assertThat(after).isEqualTo(before); assertThat(counted.calls).isEqualTo(1); assertThat(counted.rows).isEqualTo(20);
        } finally {
            jdbc.update("DELETE FROM workflow_task WHERE id>100000"); jdbc.update("DELETE FROM dhr_summary_review WHERE summary_version_id>100000");
            jdbc.update("DELETE FROM dhr_summary_version WHERE id>100000");
        }
    }

    @Test void invalidViewAndMissingActorDoNotExecuteSql() {
        counted.reset(); AuditContext.clear();
        assertThatThrownBy(() -> service.list("PENDING", "", 0, 20)).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
        AuditContext.setOperator("7", "普通账号");
        assertThatThrownBy(() -> service.list("INVALID", "", 0, 20)).hasMessageContaining("不支持");
        assertThat(counted.calls).isZero();
    }

    @Test void concurrentIndexesUpgradeRollbackAndReapplyWithoutChangingTasks() throws Exception {
        long count = jdbc.queryForObject("SELECT COUNT(*) FROM workflow_task", Long.class);
        var source = Objects.requireNonNull(jdbc.getDataSource());
        try (var connection = source.getConnection()) {
            var database = liquibase.database.DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new liquibase.database.jvm.JdbcConnection(connection));
            database.setDefaultSchemaName(SCHEMA); database.setLiquibaseSchemaName(SCHEMA);
            try (var migration = new liquibase.Liquibase("db/changelog/0091-dhr-review-query-indexes.sql", new liquibase.resource.ClassLoaderResourceAccessor(), database)) {
                migration.update(new liquibase.Contexts());
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid WHERE c.relnamespace=?::regnamespace AND c.relname IN ('idx_dhr_review_pending_workflow','idx_workflow_task_done_assignee_id') AND i.indisvalid", Integer.class, SCHEMA)).isEqualTo(2);
                migration.rollback(2, "");
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM pg_indexes WHERE schemaname=? AND indexname IN ('idx_dhr_review_pending_workflow','idx_workflow_task_done_assignee_id')", Integer.class, SCHEMA)).isZero();
                migration.update(new liquibase.Contexts());
            }
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM workflow_task", Long.class)).isEqualTo(count);
        compare("PENDING", "7", "", 0, 20);
    }

    private String oracleSelect() {
        return """
            SELECT t.id,t.status,t.assignee_id,t.candidate_snapshot,r.status review_status,d.dhr_no,d.object_no,d.work_order_no,
              d.product_name,v.submitted_by FROM workflow_task t JOIN dhr_summary_review r ON r.workflow_instance_id=t.instance_id
              JOIN dhr_summary_version v ON v.id=r.summary_version_id JOIN dhr_instance d ON d.id=v.dhr_instance_id
              JOIN workflow_node n ON n.id=t.node_id WHERE v.tenant_id='default' ORDER BY t.id DESC
            """;
    }
    @AfterEach void clear() { AuditContext.clear(); }
    @AfterAll void cleanup() { if (jdbc != null) jdbc.execute("DROP SCHEMA " + SCHEMA + " CASCADE"); }
}
