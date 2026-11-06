package com.zencas.edhr.compliance.entity;

import liquibase.*;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.sql.*;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/** Actual old-master upgrade and old-application column-set compatibility in an owned database. */
@EnabledIfEnvironmentVariable(named = "AUDIT_HASH_MIGRATION_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_audit_hash_migration_test_[a-z0-9_]+")
class AuditHashMigrationPostgresTest {
    private Connection connection;
    @BeforeEach void setup() throws Exception {
        connection = DriverManager.getConnection(System.getenv("AUDIT_HASH_MIGRATION_DATABASE_URL"), System.getenv("PGUSER"), "");
        connection.createStatement().execute("DROP SCHEMA public CASCADE"); connection.createStatement().execute("CREATE SCHEMA public");
    }
    @AfterEach void close() throws Exception { connection.close(); }
    private void migrate(String resource) throws Exception {
        var liquibase = new Liquibase(resource, new ClassLoaderResourceAccessor(), new JdbcConnection(connection));
        liquibase.update(new Contexts(), new LabelExpression()); connection.setAutoCommit(true);
    }
    private String scalar(String sql) throws Exception { try (var statement = connection.createStatement(); var rs = statement.executeQuery(sql)) { rs.next(); return rs.getString(1); } }

    @Test void upgradeOnlyAddsNullableVersionAndPreservesAllLegacyValues() throws Exception {
        for (String file : List.of("baseline/0001-current-schema.sql", "baseline/0002-current-seed.sql", "0087-record-control.sql", "0088-record-change-menu-permissions.sql", "0089-record-control-dhr-linkage.sql", "0090-workflow-operations.sql", "0091-dhr-review-query-indexes.sql")) migrate("db/changelog/" + file);
        connection.createStatement().execute("INSERT INTO audit_event(id,entity_type,entity_id,action,content_before,content_after,snapshot_hash,created_at) VALUES(1,'LEGACY','42','UPDATE','null','{\"z\":1.00}',repeat('a',64),'2026-11-06 12:00:00.123456'),(2,'EXTERNAL','42','UPDATE',NULL,'[1,2]',repeat('b',64),'2026-11-06 12:00:01'),(3,'LEGACY_NULL','42','UPDATE',NULL,NULL,NULL,'2026-11-06 12:00:02')");
        String before = scalar("SELECT jsonb_agg(to_jsonb(t) ORDER BY id)::text FROM audit_event t");
        migrate("db/changelog/db.changelog-master.yaml");
        assertThat(scalar("SELECT jsonb_agg(to_jsonb(t)-'snapshot_hash_version' ORDER BY id)::text FROM audit_event t")).isEqualTo(before);
        assertThat(scalar("SELECT count(*) FROM audit_event WHERE snapshot_hash_version IS NOT NULL")).isEqualTo("0");
        assertThat(scalar("SELECT is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_event' AND column_name='snapshot_hash_version'")).isEqualTo("YES");
        assertThat(scalar("SELECT column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='audit_event' AND column_name='snapshot_hash_version'")).isNull();
        migrate("db/changelog/db.changelog-master.yaml");
        assertThat(scalar("SELECT count(*) FROM databasechangelog WHERE id='0092-audit-event-hash-version'")).isEqualTo("1");
        assertThat(scalar("SELECT jsonb_agg(to_jsonb(t)-'snapshot_hash_version' ORDER BY id)::text FROM audit_event t")).isEqualTo(before);
    }
    @Test void oldApplicationInsertAndReadRemainCompatibleAlongsideMarkedNewRows() throws Exception {
        migrate("db/changelog/db.changelog-master.yaml");
        connection.createStatement().execute("INSERT INTO audit_event(id,entity_type,entity_id,action,snapshot_hash,snapshot_hash_version) VALUES(10,'NEW','42','UPDATE',repeat('c',64),'audit-event-v2')");
        connection.createStatement().execute("INSERT INTO audit_event(id,entity_type,entity_id,action,snapshot_hash) VALUES(11,'OLD_APP','42','UPDATE',repeat('d',64))");
        assertThat(scalar("SELECT snapshot_hash FROM audit_event WHERE id=10")).isEqualTo("c".repeat(64));
        assertThat(scalar("SELECT snapshot_hash_version FROM audit_event WHERE id=11")).isNull();
        assertThat(scalar("SELECT snapshot_hash FROM audit_event WHERE id=11")).isEqualTo("d".repeat(64));
        assertThat(scalar("SELECT snapshot_hash_version FROM audit_event WHERE id=10")).isEqualTo("audit-event-v2");
    }
}
