package com.zencas.edhr.production.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.*;

class FormInstanceQueryMigrationTest {
    @Test void additiveMigrationPreservesEvidenceAndGrantsOnlyAdminIdempotently() throws Exception {
        String url = System.getProperty("query.migration.url", "jdbc:h2:mem:form-query-migration;MODE=PostgreSQL");
        if (!url.startsWith("jdbc:h2:mem:form-query-migration") && !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_query_[a-z0-9_]+")) {
            throw new IllegalArgumentException("Only isolated form query test databases allowed");
        }
        try (var connection = DriverManager.getConnection(url, System.getProperty("query.migration.user", "sa"), "")) {
            var sql = connection.createStatement();
            sql.execute("CREATE SEQUENCE hibernate_sequence START WITH 1000");
            sql.execute("CREATE TABLE permission(id BIGINT PRIMARY KEY,code VARCHAR(128) UNIQUE,name VARCHAR(128),type VARCHAR(32),parent_code VARCHAR(128),sort_order INT)");
            sql.execute("CREATE TABLE role(id BIGINT PRIMARY KEY,code VARCHAR(64))");
            sql.execute("CREATE TABLE role_permission(id BIGINT PRIMARY KEY,role_id BIGINT,permission_id BIGINT)");
            sql.execute("INSERT INTO role VALUES(1,'ADMIN'),(2,'OPERATOR')");
            sql.execute("CREATE TABLE production_object(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64))");
            sql.execute("CREATE TABLE production_execution(object_id BIGINT PRIMARY KEY,snapshot_json TEXT,state_json TEXT)");
            String schema = new String(getClass().getResourceAsStream("/db/changelog/0082-form-instance-records.sql").readAllBytes(), StandardCharsets.UTF_8);
            for (String part : schema.split("--changeset codex:0082-form-instance-history")[0].split(";")) if (part.contains("CREATE")) sql.execute(part);
            sql.execute("INSERT INTO production_object VALUES(101,'default'),(102,'foreign')");
            String frozen = """
                {"context":{"workOrderId":"100","workOrderNo":"WO01","objectNo":"B01","objectType":"BATCH"},
                 "operations":[{"id":"a","name":"装配"}]}
                """;
            try (var insert = connection.prepareStatement("INSERT INTO production_execution VALUES(?,?,?)")) {
                for (long id : new long[]{101, 102}) {
                    insert.setLong(1, id); insert.setString(2, frozen); insert.setString(3, "{\"unchanged\":true}"); insert.executeUpdate();
                }
            }
            sql.execute("""
                INSERT INTO form_instance_record(id,tenant_id,instance_no,object_id,operation_id,form_id,copy_id,template_id,version_id,snapshot_json,values_json,status,created_by,updated_by,updated_at,legacy)
                VALUES(1,'default','FR-OLD-1',101,'a','form-1','form-1',5,6,'{"name":"旧版名称","code":"F_01%","version":"V2"}','{"value":42}','ACTIVE','同名用户','同名用户',TIMESTAMP '2026-09-15 08:00:00',TRUE),
                (2,'default','FR-OLD-2',999,'missing','form-2','form-2',5,6,'{}','{}','COMPLETED',NULL,NULL,TIMESTAMP '2026-09-15 09:00:00',TRUE),
                (3,'default','FR-OLD-3',102,'a','form-3','form-3',5,6,'{}','{}','ACTIVE',NULL,NULL,TIMESTAMP '2026-09-15 09:00:00',TRUE)
                """);
            try (var queryConnection = DriverManager.getConnection(url, System.getProperty("query.migration.user", "sa"), "");
                 var sourceConnection = DriverManager.getConnection(url, System.getProperty("query.migration.user", "sa"), "");
                 var queryMigration = new Liquibase("db/changelog/0083-form-instance-query.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(queryConnection));
                 var sourceMigration = new Liquibase("db/changelog/0086-form-instance-business-source.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(sourceConnection))) {
                queryMigration.update(new Contexts(), new LabelExpression());
                queryMigration.update(new Contexts(), new LabelExpression());
                sourceMigration.update(new Contexts(), new LabelExpression());
                sourceMigration.update(new Contexts(), new LabelExpression());
                try (var row = sql.executeQuery("SELECT * FROM form_instance_record WHERE id=1")) {
                    assertThat(row.next()).isTrue();
                    assertThat(row.getString("instance_no")).isEqualTo("FR-OLD-1");
                    assertThat(row.getString("values_json")).isEqualTo("{\"value\":42}");
                    assertThat(row.getString("status")).isEqualTo("ACTIVE");
                    assertThat(row.getString("created_by_id")).isNull();
                    assertThat(row.getString("updated_by_id")).isNull();
                    assertThat(row.getString("created_at")).isNull();
                    assertThat(row.getString("created_by")).isEqualTo("同名用户");
                    assertThat(row.getString("source_type")).isEqualTo("PRODUCTION_EXECUTION");
                    if (url.startsWith("jdbc:postgresql:")) {
                        assertThat(row.getString("template_name")).isEqualTo("旧版名称");
                        assertThat(row.getString("template_code")).isEqualTo("F_01%");
                        assertThat(row.getString("template_version")).isEqualTo("V2");
                        assertThat(row.getString("work_order_id")).isEqualTo("100");
                        assertThat(row.getString("object_no")).isEqualTo("B01");
                        assertThat(row.getString("operation_name")).isEqualTo("装配");
                    }
                }
                try (var row = sql.executeQuery("SELECT * FROM form_instance_record WHERE id IN (2,3)")) {
                    while (row.next()) { assertThat(row.getString("work_order_id")).isNull(); assertThat(row.getString("operation_name")).isNull(); }
                }
                try (var row = sql.executeQuery("SELECT snapshot_json,state_json FROM production_execution WHERE object_id=101")) {
                    row.next(); assertThat(row.getString(1)).isEqualTo(frozen); assertThat(row.getString(2)).isEqualTo("{\"unchanged\":true}");
                }
                try (var row = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=1")) { row.next(); assertThat(row.getInt(1)).isEqualTo(1); }
                try (var row = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=2")) { row.next(); assertThat(row.getInt(1)).isZero(); }
                try (var row = sql.executeQuery("SELECT parent_code,type FROM permission WHERE code='form-instances.view'")) {
                    row.next(); assertThat(row.getString(1)).isEqualTo("production.execution"); assertThat(row.getString(2)).isEqualTo("BUTTON");
                }
                try (var row = sql.executeQuery("SELECT count(*) FROM form_instance_record")) { row.next(); assertThat(row.getInt(1)).isEqualTo(3); }
            }
        }
    }
}
