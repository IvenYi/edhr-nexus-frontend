package com.zencas.edhr.production.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.assertThat;

class DhrSummaryDisplayNameMigrationTest {
    @Test void nullableDisplayNamePreservesExistingEvidence() throws Exception {
        String url = "jdbc:h2:mem:dhr-summary-display-name-migration;MODE=PostgreSQL;DB_CLOSE_DELAY=-1";
        try (var connection = DriverManager.getConnection(url, "sa", "")) {
            connection.createStatement().execute("CREATE TABLE dhr_summary_evidence (id BIGINT PRIMARY KEY, source_record_id BIGINT NOT NULL)");
            connection.createStatement().execute("INSERT INTO dhr_summary_evidence VALUES (1, 101)");
            try (var migration = new Liquibase("db/changelog/0101-dhr-summary-evidence-display-name.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
                migration.update(new Contexts(), new LabelExpression());
            }
        }
        try (var connection = DriverManager.getConnection(url, "sa", "")) {
            try (var rows = connection.createStatement().executeQuery("SELECT source_record_id, display_name FROM dhr_summary_evidence WHERE id=1")) {
                assertThat(rows.next()).isTrue();
                assertThat(rows.getLong(1)).isEqualTo(101);
                assertThat(rows.getString(2)).isNull();
            }
            connection.createStatement().execute("UPDATE dhr_summary_evidence SET display_name='汇总文档' WHERE id=1");
            try (var rows = connection.createStatement().executeQuery("SELECT display_name FROM dhr_summary_evidence WHERE id=1")) {
                assertThat(rows.next()).isTrue();
                assertThat(rows.getString(1)).isEqualTo("汇总文档");
            }
        }
    }
}
