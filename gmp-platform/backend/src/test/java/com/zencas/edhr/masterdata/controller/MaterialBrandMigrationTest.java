package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.masterdata.entity.Material;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.Test;

import java.sql.DriverManager;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class MaterialBrandMigrationTest {
    @Test
    void migrationPreservesLegacyNullTypesAndJpaPersistsOptionalBrand() throws Exception {
        String url = "jdbc:h2:mem:material_brand_" + UUID.randomUUID() + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1";
        try (var sessions = new Configuration()
                .addAnnotatedClass(Material.class)
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.connection.url", url)
                .setProperty("hibernate.connection.username", "sa")
                .setProperty("hibernate.connection.password", "")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .buildSessionFactory()) {
            try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
                sql.execute("ALTER TABLE material DROP COLUMN brand_name");
                sql.execute("INSERT INTO material(id, code, name, material_type_id) VALUES(1, 'LEGACY', '历史物料', NULL)");
            }
            for (int i = 0; i < 2; i++) {
                try (var connection = DriverManager.getConnection(url, "sa", "");
                     var migration = new Liquibase("db/changelog/0078-material-brand.sql",
                             new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                    migration.update(new Contexts(), new LabelExpression());
                }
            }
            try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
                sql.execute("INSERT INTO material(id, code, name, brand) VALUES(4, 'RENAMED', '原有品牌物料', '保留原品牌')");
            }
            for (int i = 0; i < 2; i++) {
                try (var connection = DriverManager.getConnection(url, "sa", "");
                     var migration = new Liquibase("db/changelog/0081-material-brand-name.sql",
                             new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                    migration.update(new Contexts(), new LabelExpression());
                }
            }
            try (var session = sessions.openSession()) {
                assertThat(session.find(Material.class, 4L).getBrandName()).isEqualTo("保留原品牌");
                Material legacy = session.find(Material.class, 1L);
                assertThat(legacy.getCode()).isEqualTo("LEGACY");
                assertThat(legacy.getMaterialTypeId()).isNull();
                assertThat(legacy.getBrandName()).isNull();
                var transaction = session.beginTransaction();
                session.persist(Material.builder().id(2L).code("BRAND").name("带品牌物料").materialTypeId(3L).brandName("示例品牌").build());
                session.persist(Material.builder().id(3L).code("NO-BRAND").name("无品牌物料").materialTypeId(3L).build());
                transaction.commit();
            }
            try (var session = sessions.openSession()) {
                Material branded = session.find(Material.class, 2L);
                assertThat(branded.getBrandName()).isEqualTo("示例品牌");
                assertThat(session.find(Material.class, 3L).getBrandName()).isNull();
                var transaction = session.beginTransaction();
                branded.setBrandName(null);
                transaction.commit();
            }
            try (var session = sessions.openSession()) {
                assertThat(session.find(Material.class, 2L).getBrandName()).isNull();
            }
            try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
                var rows = sql.executeQuery("SELECT COUNT(*) FROM databasechangelog WHERE id = '0078-material-brand'");
                assertThat(rows.next()).isTrue();
                assertThat(rows.getInt(1)).isEqualTo(1);
            }
        }
    }
}
