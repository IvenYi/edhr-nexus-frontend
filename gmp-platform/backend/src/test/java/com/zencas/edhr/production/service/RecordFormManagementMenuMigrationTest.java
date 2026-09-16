package com.zencas.edhr.production.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.assertThat;

class RecordFormManagementMenuMigrationTest {
    @Test
    void recordsNavigationIsSeededAndAdminGrantIsIdempotent() throws Exception {
        String url = System.getProperty("records.menu.migration.url", "jdbc:h2:mem:records-menu-migration;MODE=PostgreSQL");
        if (!url.startsWith("jdbc:h2:mem:records-menu-migration")) {
            throw new IllegalArgumentException("Only isolated records menu test databases allowed");
        }
        try (var connection = DriverManager.getConnection(url, "sa", "")) {
            var sql = connection.createStatement();
            sql.execute("CREATE SEQUENCE hibernate_sequence START WITH 1000");
            sql.execute("CREATE TABLE permission(id BIGINT PRIMARY KEY,code VARCHAR(128) UNIQUE,name VARCHAR(128),type VARCHAR(32),parent_code VARCHAR(128),sort_order INT)");
            sql.execute("CREATE TABLE role(id BIGINT PRIMARY KEY,code VARCHAR(64))");
            sql.execute("CREATE TABLE role_permission(id BIGINT PRIMARY KEY,role_id BIGINT,permission_id BIGINT)");
            sql.execute("INSERT INTO role VALUES(1,'ADMIN'),(2,'OPERATOR')");
            try (var migration = new Liquibase("db/changelog/0085-record-form-management-menu.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
                migration.update(new Contexts(), new LabelExpression());
                try (var rows = sql.executeQuery("SELECT code,type,parent_code FROM permission ORDER BY code")) {
                    assertThat(rows.next()).isTrue();
                    assertThat(rows.getString(1)).isEqualTo("records");
                    assertThat(rows.getString(2)).isEqualTo("PAGE");
                    assertThat(rows.getString(3)).isNull();
                    assertThat(rows.next()).isTrue();
                    assertThat(rows.getString(1)).isEqualTo("records.form-management");
                    assertThat(rows.getString(2)).isEqualTo("PAGE");
                    assertThat(rows.getString(3)).isEqualTo("records");
                    assertThat(rows.next()).isFalse();
                }
                try (var rows = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=1")) {
                    rows.next();
                    assertThat(rows.getInt(1)).isEqualTo(2);
                }
                try (var rows = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=2")) {
                    rows.next();
                    assertThat(rows.getInt(1)).isZero();
                }
            }
        }
    }
}
