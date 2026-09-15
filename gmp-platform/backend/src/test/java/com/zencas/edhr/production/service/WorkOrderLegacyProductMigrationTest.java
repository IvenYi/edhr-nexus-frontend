package com.zencas.edhr.production.service;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

import java.sql.Connection;
import java.sql.DriverManager;

import static org.assertj.core.api.Assertions.*;

@EnabledIfSystemProperty(named = "workOrder.migration.url", matches = "jdbc:postgresql:.*edhr_work_order_fk_qa_.*")
class WorkOrderLegacyProductMigrationTest {
    private Connection connect() throws Exception {
        return DriverManager.getConnection(System.getProperty("workOrder.migration.url"),
                System.getProperty("workOrder.migration.user", "edhr"), "");
    }

    @BeforeEach void setup() throws Exception {
        try (var connection = connect(); var sql = connection.createStatement()) {
            sql.execute("DROP TABLE IF EXISTS work_order, product, material, unit_of_measure, databasechangelog, databasechangeloglock CASCADE");
            sql.execute("CREATE TABLE product(id BIGINT PRIMARY KEY)");
            sql.execute("CREATE TABLE material(id BIGINT PRIMARY KEY)");
            sql.execute("CREATE TABLE unit_of_measure(id BIGINT PRIMARY KEY)");
            sql.execute("CREATE TABLE work_order(id BIGINT PRIMARY KEY, product_id BIGINT NOT NULL, unit_id BIGINT REFERENCES unit_of_measure(id))");
            sql.execute("INSERT INTO product VALUES(1)");
            sql.execute("INSERT INTO material VALUES(2)");
            sql.execute("INSERT INTO unit_of_measure VALUES(1)");
        }
    }

    private void migrate() throws Exception {
        try (var connection = connect(); var migration = new Liquibase(
                "db/changelog/0077-work-order-legacy-product-reference.sql",
                new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
            migration.update(new Contexts(), new LabelExpression());
        }
    }

    @Test void legacyForeignKeyIsRemovedWithoutChangingHistoricalRowsOrOtherConstraints() throws Exception {
        try (var connection = connect(); var sql = connection.createStatement()) {
            sql.execute("ALTER TABLE work_order ADD CONSTRAINT work_order_product_id_fkey FOREIGN KEY(product_id) REFERENCES product(id)");
            sql.execute("INSERT INTO work_order VALUES(100,1,1)");
            assertThatThrownBy(() -> sql.execute("INSERT INTO work_order VALUES(101,2,1)"))
                    .isInstanceOf(java.sql.SQLException.class).hasMessageContaining("work_order_product_id_fkey");
        }
        migrate();
        migrate();
        try (var connection = connect(); var sql = connection.createStatement()) {
            sql.execute("INSERT INTO work_order VALUES(101,2,1)");
            var rows = sql.executeQuery("SELECT product_id FROM work_order WHERE id=100");
            rows.next();
            assertThat(rows.getLong(1)).isEqualTo(1);
            assertThatThrownBy(() -> sql.execute("INSERT INTO work_order VALUES(102,2,999)"))
                    .isInstanceOf(java.sql.SQLException.class).hasMessageContaining("work_order_unit_id_fkey");
            var changes = sql.executeQuery("SELECT count(*) FROM databasechangelog WHERE id='0077-work-order-legacy-product-reference'");
            changes.next();
            assertThat(changes.getInt(1)).isEqualTo(1);
        }
    }

    @Test void freshSchemaWithoutLegacyProductTableRemainsUsable() throws Exception {
        try (var connection = connect(); var sql = connection.createStatement()) { sql.execute("DROP TABLE product"); }
        migrate();
        try (var connection = connect(); var sql = connection.createStatement()) {
            sql.execute("INSERT INTO work_order VALUES(101,2,1)");
        }
    }

    @Test void renamedLegacyForeignKeyIsAlsoRemoved() throws Exception {
        try (var connection = connect(); var sql = connection.createStatement()) {
            sql.execute("ALTER TABLE work_order ADD CONSTRAINT renamed_legacy_reference FOREIGN KEY(product_id) REFERENCES product(id)");
        }
        migrate();
        try (var connection = connect(); var sql = connection.createStatement()) { sql.execute("INSERT INTO work_order VALUES(101,2,1)"); }
    }

    @Test void materialForeignKeyWithLegacyNameIsPreserved() throws Exception {
        try (var connection = connect(); var sql = connection.createStatement()) {
            sql.execute("ALTER TABLE work_order ADD CONSTRAINT work_order_product_id_fkey FOREIGN KEY(product_id) REFERENCES material(id)");
        }
        migrate();
        try (var connection = connect(); var sql = connection.createStatement()) {
            sql.execute("INSERT INTO work_order VALUES(101,2,1)");
            assertThatThrownBy(() -> sql.execute("INSERT INTO work_order VALUES(102,1,1)"))
                    .isInstanceOf(java.sql.SQLException.class).hasMessageContaining("work_order_product_id_fkey");
        }
    }
}
