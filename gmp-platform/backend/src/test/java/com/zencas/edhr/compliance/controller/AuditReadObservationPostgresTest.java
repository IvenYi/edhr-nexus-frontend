package com.zencas.edhr.compliance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.dto.AuditLogItem;
import com.zencas.edhr.production.service.FormProjectionWorker;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.test.context.*;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.*;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.lang.management.ManagementFactory;
import java.nio.file.*;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

/** Real controller/repositories with their normal independent transactions and open-in-view=false. */
class AuditReadObservationPostgresTest extends AuditReadPostgresSupport {
    static Stream<Arguments> scaleCases() {
        return Stream.of("shared", "distinct", "missing", "blank").flatMap(axis -> Stream.of(100, 1000, 5000).map(n -> Arguments.of(axis, n)));
    }
    @ParameterizedTest @MethodSource("scaleCases")
    void observeSmallPageAsMatchingHistoryGrows(String axis, int count) throws Exception {
        seed(count, axis, 0);
        var result = observe(axis + "_" + count, () -> list(1, 20, null, null, null, null));
        assertThat(result.getTotalElements()).isEqualTo(count); assertThat(result.getContent()).hasSize(20);
        assertThat(result.getContent()).extracting(AuditLogItem::getId).containsExactlyElementsOf(java.util.stream.LongStream.iterate(count, n -> n - 1).limit(20).boxed().toList());
        assertThat(result.getContent().getFirst().getOperatorDisplayName()).isEqualTo(axis.equals("blank") ? "-" : axis.equals("missing") ? "历史姓名" + count : axis.equals("shared") ? "当前姓名1" : "当前姓名" + count);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class)).isEqualTo(count);
    }
    @ParameterizedTest @ValueSource(ints = {1024, 131072})
    void observeFullEntityJsonWidthEvenForTwentyReturnedRows(int width) throws Exception {
        seed(1000, "shared", width);
        var result = observe("wide_" + width, () -> list(1, 20, null, null, null, null));
        assertThat(result.getTotalElements()).isEqualTo(1000); assertThat(result.getContent()).hasSize(20);
        assertThat(result.getContent().getFirst().getContentAfter()).contains("x".repeat(width));
    }
    @Test void fallbackFilteringRetainsCurrentProjectionAndOnlyReturnsMatchingRows() throws Exception {
        seed(1000, "shared", 0); jdbc.update("UPDATE audit_event SET entity_type='SYSTEM_SETTING' WHERE id=1000");
        var result = observe("fallback_selective", () -> list(1, 20, null, null, "系统管理 · 系统设置", null));
        assertThat(result.getContent()).extracting(AuditLogItem::getId).containsExactly(1000L); assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().getFirst().getDataSummary()).isEqualTo("系统管理 · 系统设置 #target");
    }
    @Test void profileBoundaryUsesTargetAccountAndIncludesAdministratorChanges() throws Exception {
        seed(6, "shared", 0); jdbc.update("UPDATE audit_event SET entity_id='910001',operator_id='administrator' WHERE id IN(1,2,3)");
        jdbc.update("UPDATE audit_event SET operator_id='910001' WHERE id IN(4,5,6)");
        var result = observe("profile", () -> controller.listMyProfileLogs("910001", 2, 2, "createdAt", "desc").getData());
        assertThat(result.getTotalElements()).isEqualTo(3); assertThat(result.getContent()).extracting(AuditLogItem::getId).containsExactly(1L);
    }
    @Test void assessIndexBoundaryWithoutChangingProductionSchemaOrTheQueryImplementation() throws Exception {
        seed(10000, "shared", 1024); jdbc.update("UPDATE audit_event SET entity_id='sparse' WHERE id%1000=0"); jdbc.execute("ANALYZE audit_event");
        String query = "SELECT * FROM audit_event WHERE lower(entity_type)='user_account' AND entity_id='sparse' ORDER BY created_at DESC LIMIT 20";
        String before = jdbc.queryForObject("EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + query, String.class);
        var ids = jdbc.queryForList("SELECT id FROM (" + query + ") q", Long.class);
        var indexes = jdbc.queryForList("SELECT indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='audit_event' ORDER BY indexname");
        String candidate = new TransactionTemplate(transactions).execute(status -> {
            jdbc.execute("CREATE INDEX audit_read_probe_expression_order ON audit_event(lower(entity_type),entity_id,created_at DESC)");
            String plan = jdbc.queryForObject("EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + query, String.class);
            assertThat(jdbc.queryForList("SELECT id FROM (" + query + ") q", Long.class)).isEqualTo(ids);
            status.setRollbackOnly(); return plan;
        });
        assertThat(jdbc.queryForObject("SELECT count(*) FROM pg_indexes WHERE indexname='audit_read_probe_expression_order'", Integer.class)).isZero();
        assertThat(ids).containsExactly(10000L,9000L,8000L,7000L,6000L,5000L,4000L,3000L,2000L,1000L);
        Path out = Path.of(System.getProperty("edhr.audit.readOutput")); Files.createDirectories(out);
        mapper.writerWithDefaultPrettyPrinter().writeValue(out.resolve("index_boundary.json").toFile(), Map.of("query", query, "existingIndexes", indexes, "beforePlan", mapper.readTree(before), "temporaryCandidatePlan", mapper.readTree(candidate), "candidateRolledBack", true,
                "scope", "representative lower(type)/target/order page only; not full actual JPQL or derived-filter equivalence; no production index change"));
    }
}

@EnabledIfSystemProperty(named = "edhr.audit.readObservation", matches = "true")
@EnabledIfEnvironmentVariable(named = "AUDIT_READ_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_audit_read_test_[a-z0-9_]+")
@SpringBootTest(properties = {"spring.liquibase.enabled=true", "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false", "spring.jpa.properties.hibernate.generate_statistics=true", "logging.level.org.hibernate.stat=OFF", "logging.level.org.hibernate.SQL=OFF"})
@Import(AuditReadPostgresSupport.Config.class)
abstract class AuditReadPostgresSupport {
    static final ThreadLocal<Measurement> CURRENT = new ThreadLocal<>();
    @Autowired AuditController controller;
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManagerFactory factory;
    @Autowired PlatformTransactionManager transactions;
    @Autowired ObjectMapper mapper;
    @MockBean FormProjectionWorker worker;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        String url = System.getenv("AUDIT_READ_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_audit_read_test_[a-z0-9_]+")) throw new IllegalStateException("Owned disposable audit read database required");
        p.add("spring.datasource.url", () -> url); p.add("spring.datasource.username", () -> System.getenv("PGUSER")); p.add("spring.datasource.password", () -> ""); p.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }
    @BeforeEach void reset() { jdbc.execute("TRUNCATE audit_event"); jdbc.update("DELETE FROM user_account WHERE id>=910001"); }
    @AfterEach void clear() { CURRENT.remove(); }

    void seed(int count, String axis, int width) {
        int people = axis.equals("distinct") ? count : 1;
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,password_hash,display_name,status) SELECT 910000+g,0,'probe-'||g,'synthetic-only','当前姓名'||g,'ACTIVE' FROM generate_series(1,?)g", people);
        jdbc.update("""
            INSERT INTO audit_event(id,tenant_id,entity_type,entity_id,action,operator_id,operator_name,operator_account,
              content_after,snapshot_hash,created_at)
            SELECT g,'default','USER_ACCOUNT','target','UPDATE','historical-id',
              CASE WHEN ?='blank' THEN NULL ELSE '历史姓名'||g END,
              CASE WHEN ?='blank' THEN NULL WHEN ?='missing' THEN 'missing-'||g WHEN ?='distinct' THEN 'probe-'||g ELSE 'probe-1' END,
              jsonb_build_object('text',repeat('x',?)),repeat('a',64),TIMESTAMP '2026-01-01' + g * INTERVAL '1 second'
            FROM generate_series(1,?)g
            """, axis, axis, axis, axis, width, count);
        if (axis.equals("blank")) jdbc.update("UPDATE audit_event SET operator_id=NULL");
    }
    PageResult<AuditLogItem> list(int page, int size, String entityType, String action, String menu, String summary) {
        return controller.list(page, size, "createdAt", "desc", entityType, null, action, null, null, null, menu, summary).getData();
    }
    PageResult<AuditLogItem> observe(String name, Supplier<PageResult<AuditLogItem>> action) throws Exception {
        var stats = factory.unwrap(SessionFactoryImplementor.class).getStatistics(); stats.clear(); var measure = new Measurement(name);
        var bean = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean(); bean.setThreadAllocatedMemoryEnabled(true);
        long thread = Thread.currentThread().threadId(), before = bean.getThreadAllocatedBytes(thread), start = System.nanoTime();
        PageResult<AuditLogItem> result;
        CURRENT.set(measure); try { result = action.get(); } finally { CURRENT.remove(); }
        long nanos = System.nanoTime() - start, bytes = bean.getThreadAllocatedBytes(thread) - before;
        var data = new LinkedHashMap<String, Object>(); data.put("name", name); data.put("threadAllocatedBytes", bytes); data.put("elapsedNanos", nanos);
        data.put("prepareStatements", stats.getPrepareStatementCount()); data.put("entityLoads", stats.getEntityLoadCount()); data.put("entityInserts", stats.getEntityInsertCount()); data.put("entityUpdates", stats.getEntityUpdateCount()); data.put("entityDeletes", stats.getEntityDeleteCount());
        var shapes = new ArrayList<Map<String, Object>>(); measure.statements.forEach((sql, n) -> shapes.add(Map.of("sql", sql, "count", n[0]))); data.put("sqlShapes", shapes);
        data.put("total", result.getTotalElements()); data.put("ids", result.getContent().stream().map(AuditLogItem::getId).toList());
        data.put("measurement", "normal repository transactions; no outer transaction/OSIV; marker/count observer included; calling-thread cumulative heap, not peak/RSS/SLA");
        Path out = Path.of(System.getProperty("edhr.audit.readOutput")); Files.createDirectories(out); mapper.writerWithDefaultPrettyPrinter().writeValue(out.resolve(name + ".json").toFile(), data);
        assertThat(stats.getEntityInsertCount()).isZero(); assertThat(stats.getEntityUpdateCount()).isZero(); assertThat(stats.getEntityDeleteCount()).isZero();
        return result;
    }
    static class Measurement {
        final String name; final Map<String, int[]> statements = new LinkedHashMap<>(); final Map<String, String> marked = new HashMap<>();
        Measurement(String name) { this.name = name; }
    }
    @TestConfiguration static class Config {
        @Bean HibernatePropertiesCustomizer inspector() { return p -> p.put("hibernate.session_factory.statement_inspector", (StatementInspector) sql -> {
            var current = CURRENT.get(); if (current == null) return sql;
            current.statements.computeIfAbsent(sql, ignored -> new int[1])[0]++;
            return current.marked.computeIfAbsent(sql, text -> "/*audit_read_" + current.name + "*/ " + text);
        }); }
    }
}
