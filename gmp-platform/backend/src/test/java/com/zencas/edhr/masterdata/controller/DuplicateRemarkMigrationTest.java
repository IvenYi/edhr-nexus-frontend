package com.zencas.edhr.masterdata.controller;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.assertThat;

class DuplicateRemarkMigrationTest {
    @Test
    void removesDuplicateParentAndVersionRemarkColumnsAndCanRollbackStructure() throws Exception {
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:duplicate-remarks-migration;MODE=PostgreSQL", "sa", "")) {
            var sql = connection.createStatement();
            sql.execute("CREATE TABLE product_family (id BIGINT PRIMARY KEY, remark TEXT)");
            sql.execute("CREATE TABLE sop_document (id BIGINT PRIMARY KEY, remark TEXT)");
            sql.execute("CREATE TABLE document_version (id BIGINT PRIMARY KEY, remark TEXT)");

            try (var migration = new Liquibase("db/changelog/0095-remove-duplicate-remarks.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
                migration.update(new Contexts(), new LabelExpression());

                assertThat(countRemarkColumns(connection)).isZero();

                migration.rollback(1, new Contexts(), new LabelExpression());
                assertThat(countRemarkColumns(connection)).isEqualTo(3);
            }
        }
    }

    private int countRemarkColumns(java.sql.Connection connection) throws Exception {
        try (var columns = connection.createStatement().executeQuery(
                "SELECT COUNT(*) FROM information_schema.columns WHERE LOWER(table_name) IN ('product_family','sop_document','document_version') AND LOWER(column_name) = 'remark'")) {
            columns.next();
            return columns.getInt(1);
        }
    }
}
