package com.zencas.edhr.production.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DhrInstanceMigrationTest {
    @Test
    void migrationCreatesEmptyRegistryAndGrantsOnlyAdministrator() throws Exception {
        String master = new String(getClass().getResourceAsStream("/db/changelog/db.changelog-master.yaml").readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        assertThat(master).contains("db/changelog/0089-dhr-instance-management.sql");
        assertThat(master).contains("db/changelog/0090-remove-dhr-template-version-snapshot.sql");
        assertThat(master).contains("db/changelog/0091-remove-dhr-template-version-status.sql");
        String url = "jdbc:h2:mem:dhr-instance-migration;MODE=PostgreSQL";
        try (var connection = DriverManager.getConnection(url, "sa", "")) {
            var setup = connection.createStatement();
            setup.execute("CREATE SEQUENCE hibernate_sequence START WITH 1000");
            setup.execute("CREATE TABLE permission(id BIGINT PRIMARY KEY,code VARCHAR(128) UNIQUE,name VARCHAR(128),type VARCHAR(32),parent_code VARCHAR(128),sort_order INT)");
            setup.execute("CREATE TABLE role(id BIGINT PRIMARY KEY,code VARCHAR(64))");
            setup.execute("CREATE TABLE role_permission(id BIGINT PRIMARY KEY,role_id BIGINT,permission_id BIGINT)");
            setup.execute("CREATE TABLE production_object(id BIGINT PRIMARY KEY)");
            setup.execute("CREATE TABLE work_order(id BIGINT PRIMARY KEY)");
            setup.execute("CREATE TABLE material(id BIGINT PRIMARY KEY)");
            setup.execute("CREATE TABLE product_process_version(id BIGINT PRIMARY KEY)");
            setup.execute("CREATE TABLE route_version(id BIGINT PRIMARY KEY)");
            setup.execute("CREATE TABLE dhr_template(id BIGINT PRIMARY KEY)");
            setup.execute("CREATE TABLE dhr_template_version(id BIGINT PRIMARY KEY,directory_snapshot TEXT,status VARCHAR(32))");
            setup.execute("INSERT INTO permission VALUES(1,'records','记录','PAGE',NULL,5)");
            setup.execute("INSERT INTO role VALUES(1,'ADMIN'),(2,'OPERATOR')");
            var migration = new Liquibase("db/changelog/0089-dhr-instance-management.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection));
            migration.update(new Contexts(), new LabelExpression());
            migration.update(new Contexts(), new LabelExpression());
            var removeLegacySnapshot = new Liquibase("db/changelog/0090-remove-dhr-template-version-snapshot.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection));
            removeLegacySnapshot.update(new Contexts(), new LabelExpression());
            removeLegacySnapshot.update(new Contexts(), new LabelExpression());
            var removeLegacyStatus = new Liquibase("db/changelog/0091-remove-dhr-template-version-status.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection));
            removeLegacyStatus.update(new Contexts(), new LabelExpression());
            removeLegacyStatus.update(new Contexts(), new LabelExpression());
            var sql = connection.createStatement();
            try (var columns = sql.executeQuery("SELECT count(*) FROM information_schema.columns WHERE lower(table_name)='dhr_template_version' AND lower(column_name) IN ('directory_snapshot','status')")) {
                columns.next(); assertThat(columns.getInt(1)).isZero();
            }
            try (var rows = sql.executeQuery("SELECT code,type,parent_code FROM permission WHERE code IN ('records.dhr-management','dhr.instances.view') ORDER BY sort_order DESC")) {
                assertThat(rows.next()).isTrue();
                assertThat(rows.getString("code")).isEqualTo("records.dhr-management");
                assertThat(rows.getString("type")).isEqualTo("PAGE");
                assertThat(rows.getString("parent_code")).isEqualTo("records");
                assertThat(rows.next()).isTrue();
                assertThat(rows.getString("code")).isEqualTo("dhr.instances.view");
                assertThat(rows.getString("type")).isEqualTo("BUTTON");
                assertThat(rows.getString("parent_code")).isEqualTo("records.dhr-management");
            }
            try (var rows = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=1")) {
                rows.next(); assertThat(rows.getInt(1)).isEqualTo(3);
            }
            try (var rows = sql.executeQuery("SELECT count(*) FROM role_permission WHERE role_id=2")) {
                rows.next(); assertThat(rows.getInt(1)).isZero();
            }
            try (var rows = sql.executeQuery("SELECT count(*) FROM dhr_instance")) {
                rows.next(); assertThat(rows.getInt(1)).isZero();
            }
            sql.execute("INSERT INTO production_object VALUES(11)");
            sql.execute("INSERT INTO work_order VALUES(21)");
            sql.execute("INSERT INTO material VALUES(31)");
            sql.execute("INSERT INTO product_process_version VALUES(41)");
            sql.execute("INSERT INTO route_version VALUES(51)");
            sql.execute("INSERT INTO dhr_template VALUES(61)");
            sql.execute("INSERT INTO dhr_template_version VALUES(71)");
            sql.execute("INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,status,created_at,updated_at) VALUES(1,'default','DHR-1',11,'B1','BATCH',21,'WO1',31,41,51,61,71,'{}','{\"directories\":[]}','IN_PROGRESS',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
            assertThatThrownBy(() -> sql.execute("INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,status,created_at,updated_at) VALUES(2,'default','DHR-2',11,'B1','BATCH',21,'WO1',31,41,51,61,71,'{}','{\"directories\":[]}','IN_PROGRESS',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)"))
                    .isInstanceOf(java.sql.SQLException.class);
            migration.close();
            removeLegacySnapshot.close();
            removeLegacyStatus.close();
        }
    }
}
