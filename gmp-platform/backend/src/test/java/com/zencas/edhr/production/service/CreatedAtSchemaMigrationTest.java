package com.zencas.edhr.production.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.sql.DriverManager;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class CreatedAtSchemaMigrationTest {
    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void addsMissingColumnsWithoutInventingOrOverwritingCreationTimes(boolean existingColumn) throws Exception {
        String[] tables = {"field_permission_policy", "form_field", "form_review_block", "form_section",
                "form_signature_block", "form_table", "form_validation_rule", "process_route_binding", "route_operation"};
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:created_at_" + UUID.randomUUID() + ";MODE=PostgreSQL", "sa", "")) {
            var sql = connection.createStatement();
            for (String table : tables) {
                sql.execute("CREATE TABLE " + table + "(id BIGINT PRIMARY KEY" + (existingColumn ? ", created_at TIMESTAMP" : "") + ")");
                sql.execute("INSERT INTO " + table + "(id) VALUES(1)");
                if (existingColumn) sql.execute("UPDATE " + table + " SET created_at=TIMESTAMP '2026-01-02 03:04:05' WHERE id=1");
            }
            try (var migration = new Liquibase("db/changelog/0094-created-at-schema-compatibility.sql",
                    new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
                migration.update(new Contexts(), new LabelExpression());
                for (String table : tables) {
                    try (var rows = sql.executeQuery("SELECT id,created_at FROM " + table)) {
                        assertThat(rows.next()).isTrue();
                        assertThat(rows.getLong(1)).isEqualTo(1);
                        assertThat(rows.getTimestamp(2)).isEqualTo(existingColumn
                                ? java.sql.Timestamp.valueOf("2026-01-02 03:04:05") : null);
                        assertThat(rows.next()).isFalse();
                    }
                }
            }
        }
    }
}
