package com.zencas.edhr.production.service;

import liquibase.Liquibase;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;
import java.sql.DriverManager;
import static org.assertj.core.api.Assertions.*;

class ProductionExecutionMigrationTest {
    @Test void migrationCreatesExecutionForeignKeyAndGrantsAdminExactlyOnce() throws Exception {
        String url = System.getProperty("execution.migration.url", "jdbc:h2:mem:execution-migration;MODE=PostgreSQL");
        if (!url.contains("execution-migration") && !url.contains("edhr_execution_qa_")) throw new IllegalArgumentException("Only disposable execution databases are allowed");
        try (var connection = DriverManager.getConnection(url, System.getProperty("execution.migration.user", "sa"), "")) {
            var statement = connection.createStatement();
            statement.execute("CREATE SEQUENCE hibernate_sequence START WITH 1000");
            statement.execute("CREATE TABLE production_object(id BIGINT PRIMARY KEY)");
            statement.execute("CREATE TABLE permission(id BIGINT PRIMARY KEY,code VARCHAR(128) UNIQUE,name VARCHAR(128),type VARCHAR(32),parent_code VARCHAR(128),sort_order INT)");
            statement.execute("CREATE TABLE role(id BIGINT PRIMARY KEY,code VARCHAR(64))");
            statement.execute("CREATE TABLE role_permission(id BIGINT PRIMARY KEY,role_id BIGINT,permission_id BIGINT)");
            statement.execute("INSERT INTO role VALUES(1,'ADMIN'),(2,'OPERATOR')");
            try (var migration = new Liquibase("db/changelog/0076-production-execution.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
                migration.update(new Contexts(), new LabelExpression());
                connection.commit();
                connection.setAutoCommit(true);
                var grants = statement.executeQuery("SELECT COUNT(*) FROM role_permission WHERE role_id=1"); grants.next();
                assertThat(grants.getInt(1)).isEqualTo(1);
                var other = statement.executeQuery("SELECT COUNT(*) FROM role_permission WHERE role_id=2"); other.next();
                assertThat(other.getInt(1)).isZero();
                assertThatThrownBy(() -> statement.execute("INSERT INTO production_execution VALUES(999,'{}','{}',0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")).isInstanceOf(java.sql.SQLException.class);
                statement.execute("INSERT INTO production_object VALUES(1)");
                statement.execute("INSERT INTO production_execution VALUES(1,'{}','{}',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
                assertThatThrownBy(() -> statement.execute("INSERT INTO production_execution VALUES(1,'{}','{}',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")).isInstanceOf(java.sql.SQLException.class);
            }
        }
    }
}
