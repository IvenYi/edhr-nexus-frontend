package com.zencas.edhr.production.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;
import java.sql.DriverManager;
import static org.assertj.core.api.Assertions.*;

class FormWorklistMigrationTest {
    @Test void personalPermissionsAreSeparateAndGrantedOnlyToAdminIdempotently() throws Exception {
        String url = System.getProperty("worklist.migration.url", "jdbc:h2:mem:form-worklist-migration;MODE=PostgreSQL");
        if (!url.startsWith("jdbc:h2:mem:form-worklist-migration") && !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_worklist_[a-z0-9_]+"))
            throw new IllegalArgumentException("Only isolated worklist test databases allowed");
        try (var connection = DriverManager.getConnection(url, System.getProperty("worklist.migration.user", "sa"), "")) {
            var sql = connection.createStatement();
            sql.execute("CREATE SEQUENCE hibernate_sequence START WITH 1000");
            sql.execute("CREATE TABLE permission(id BIGINT PRIMARY KEY,code VARCHAR(128) UNIQUE,name VARCHAR(128),type VARCHAR(32),parent_code VARCHAR(128),sort_order INT)");
            sql.execute("CREATE TABLE role(id BIGINT PRIMARY KEY,code VARCHAR(64))");
            sql.execute("CREATE TABLE role_permission(id BIGINT PRIMARY KEY,role_id BIGINT,permission_id BIGINT)");
            sql.execute("INSERT INTO role VALUES(1,'ADMIN'),(2,'OPERATOR')");
            try (var migration = new Liquibase("db/changelog/0084-form-worklist-permissions.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
                migration.update(new Contexts(), new LabelExpression());
                try (var rows = sql.executeQuery("SELECT code,type,parent_code FROM permission ORDER BY code")) {
                    assertThat(rows.next()).isTrue(); assertThat(rows.getString(1)).isEqualTo("form-management.filling");
                    assertThat(rows.getString(2)).isEqualTo("BUTTON"); assertThat(rows.getString(3)).isEqualTo("production.execution");
                    assertThat(rows.next()).isTrue(); assertThat(rows.getString(1)).isEqualTo("form-management.review");
                    assertThat(rows.next()).isFalse();
                }
                try (var rows = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=1")) { rows.next(); assertThat(rows.getInt(1)).isEqualTo(2); }
                try (var rows = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=2")) { rows.next(); assertThat(rows.getInt(1)).isZero(); }
            }
        }
    }
}
