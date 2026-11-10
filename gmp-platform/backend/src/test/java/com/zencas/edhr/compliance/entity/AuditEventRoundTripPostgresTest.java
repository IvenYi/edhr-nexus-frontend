package com.zencas.edhr.compliance.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.production.service.FormProjectionWorker;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;

import static org.assertj.core.api.Assertions.assertThat;

/** Kept byte-identical for old-source negative control and the corrected implementation. */
class AuditEventRoundTripPostgresTest extends AuditEventPostgresSupport {
    @Test void jsonbNormalizationMustNotBreakPersistedHash() throws Exception {
        var event = event(1L).contentAfter("{ \"z\" : 1.00, \"a\" : \"原始变更\" }").build();
        var reloaded = roundTrip("json", event);
        assertThat(reloaded.getContentAfter()).isNotEqualTo(event.getContentAfter());
        assertThat(reloaded.computeSnapshotHash()).isEqualTo(reloaded.getSnapshotHash());
    }

    @Test void timestampPrecisionMustNotBreakPersistedHash() throws Exception {
        var event = event(2L).createdAt(LocalDateTime.parse("2026-11-06T12:00:00.123456789")).build();
        var reloaded = roundTrip("time", event);
        assertThat(reloaded.computeSnapshotHash()).isEqualTo(reloaded.getSnapshotHash());
    }
}

@EnabledIfSystemProperty(named = "edhr.audit.hash", matches = "true")
@EnabledIfEnvironmentVariable(named = "AUDIT_HASH_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_audit_hash_test_[a-z0-9_]+")
@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.liquibase.enabled=true", "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false"})
abstract class AuditEventPostgresSupport {
    @Autowired EntityManager entityManager;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transactions;
    @MockBean FormProjectionWorker worker;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        String url = System.getenv("AUDIT_HASH_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_audit_hash_test_[a-z0-9_]+")) throw new IllegalStateException("Disposable audit hash database required");
        p.add("spring.datasource.url", () -> url); p.add("spring.datasource.username", () -> System.getenv("PGUSER"));
        p.add("spring.datasource.password", () -> ""); p.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @BeforeEach void clearAudits() { jdbc.execute("TRUNCATE audit_event"); }

    protected AuditEvent.AuditEventBuilder event(long id) {
        return AuditEvent.builder().id(id).tenantId("default").entityType("AUDIT_PROBE").entityId("42").action("UPDATE")
                .operatorId("7").operatorName("审查人员").operatorAccount("audit-probe").source("UI")
                .moduleName("审计").menuName("审计验证").functionName("修改").dataSummary("对象42")
                .reason("验证持久化").ipAddress("127.0.0.1").createdAt(LocalDateTime.parse("2026-11-06T12:00:00.123456"));
    }

    protected AuditEvent roundTrip(String name, AuditEvent event) throws Exception {
        String requestedTime = String.valueOf(event.getCreatedAt());
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            jdbc.execute("SET LOCAL application_name='audit_hash_" + name + "_write'");
            entityManager.persist(event); entityManager.flush(); entityManager.clear();
        });
        AuditEvent reloaded = new TransactionTemplate(transactions).execute(status -> {
            jdbc.execute("SET LOCAL application_name='audit_hash_" + name + "_read'");
            return entityManager.find(AuditEvent.class, event.getId());
        });
        var data = new LinkedHashMap<String, Object>();
        data.put("id", event.getId()); data.put("requestedTime", requestedTime); data.put("sealedTime", String.valueOf(event.getCreatedAt()));
        data.put("storedTime", String.valueOf(reloaded.getCreatedAt())); data.put("originalBefore", event.getContentBefore()); data.put("originalAfter", event.getContentAfter());
        data.put("storedBefore", reloaded.getContentBefore()); data.put("storedAfter", reloaded.getContentAfter()); data.put("storedHash", reloaded.getSnapshotHash());
        data.put("recomputedHash", reloaded.computeSnapshotHash());
        Path out = Path.of(System.getProperty("edhr.audit.hashOutput")); Files.createDirectories(out);
        new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(out.resolve(name + ".json").toFile(), data);
        return reloaded;
    }
}
