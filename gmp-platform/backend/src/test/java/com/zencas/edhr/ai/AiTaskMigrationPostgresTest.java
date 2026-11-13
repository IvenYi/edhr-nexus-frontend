package com.zencas.edhr.ai;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@EnabledIfEnvironmentVariable(named = "AI_MIGRATION_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_ai_migration_test_[a-z0-9_]+")
class AiTaskMigrationPostgresTest {
    @Test void oldMasterUpgradeAndRepeatPreserveExistingIdentityAndAudit() throws Exception {
        try (var connection = DriverManager.getConnection(System.getenv("AI_MIGRATION_DATABASE_URL"), System.getenv("PGUSER"), "")) {
            connection.createStatement().execute("DROP SCHEMA public CASCADE");
            connection.createStatement().execute("CREATE SCHEMA public");
            for (String file : List.of("baseline/0001-current-schema.sql", "baseline/0002-current-seed.sql", "0087-record-control.sql",
                    "0088-record-change-menu-permissions.sql", "0089-record-control-dhr-linkage.sql", "0090-workflow-operations.sql",
                    "0091-dhr-review-query-indexes.sql", "0092-audit-event-hash-version.sql")) migrate(connection, "db/changelog/" + file);
            connection.createStatement().execute("INSERT INTO audit_event(id,entity_type,entity_id,action,content_before,content_after) VALUES(910001,'AI_MIGRATION_FIXTURE','42','UPDATE','{}','{\"beforeAI\":true}')");
            String users = scalar(connection, "SELECT jsonb_agg(to_jsonb(t) ORDER BY id)::text FROM user_account t");
            String audit = scalar(connection, "SELECT jsonb_agg(to_jsonb(t) ORDER BY id)::text FROM audit_event t");
            migrate(connection, "db/changelog/db.changelog-master.yaml");
            migrate(connection, "db/changelog/db.changelog-master.yaml");
            assertThat(scalar(connection, "SELECT jsonb_agg(to_jsonb(t) ORDER BY id)::text FROM user_account t")).isEqualTo(users);
            assertThat(scalar(connection, "SELECT jsonb_agg(to_jsonb(t) ORDER BY id)::text FROM audit_event t")).isEqualTo(audit);
            assertThat(scalar(connection, "SELECT count(*) FROM databasechangelog WHERE id='0093-ai-task-foundation'")).isEqualTo("1");
            assertThat(scalar(connection, "SELECT count(*) FROM ai_task")).isEqualTo("0");
            // An old application can still use its original audit column set after the additive migration.
            connection.createStatement().execute("INSERT INTO audit_event(id,entity_type,entity_id,action) VALUES(910002,'OLD_APP','42','UPDATE')");
            assertThat(scalar(connection, "SELECT entity_type FROM audit_event WHERE id=910002")).isEqualTo("OLD_APP");
        }
    }

    private void migrate(Connection connection, String resource) throws Exception {
        var liquibase = new Liquibase(resource, new ClassLoaderResourceAccessor(), new JdbcConnection(connection));
        liquibase.update(new Contexts(), new LabelExpression());
        connection.setAutoCommit(true);
    }

    private String scalar(Connection connection, String sql) throws Exception {
        try (var statement = connection.createStatement(); var rows = statement.executeQuery(sql)) {
            rows.next(); return rows.getString(1);
        }
    }
}
