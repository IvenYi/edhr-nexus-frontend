package com.zencas.edhr.production.service;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.*;

class DhrReviewMigrationTest {
    @Test void additiveDdlAndSeedsPreserveHistoricalVersionsAndEnforceReviewIdentity() throws Exception {
        JdbcTemplate jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:dhr-review-migration;MODE=PostgreSQL;NON_KEYWORDS=ROLE,TYPE;DATABASE_TO_LOWER=TRUE", "sa", ""));
        // Keep a connection for this isolated database's lifetime.
        try (var connection = jdbc.getDataSource().getConnection()) {
            jdbc.execute("CREATE SEQUENCE hibernate_sequence START WITH 100");
            jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT PRIMARY KEY,payload TEXT)");
            jdbc.execute("CREATE TABLE workflow_instance(id BIGINT PRIMARY KEY)");
            jdbc.execute("CREATE TABLE permission(id BIGINT PRIMARY KEY,code VARCHAR(64) UNIQUE,name VARCHAR(64),type VARCHAR(32),parent_code VARCHAR(64),sort_order INT)");
            jdbc.execute("CREATE TABLE role(id BIGINT PRIMARY KEY,code VARCHAR(64))");
            jdbc.execute("CREATE TABLE role_permission(id BIGINT PRIMARY KEY,role_id BIGINT,permission_id BIGINT,UNIQUE(role_id,permission_id))");
            jdbc.update("INSERT INTO role VALUES(1,'ADMIN'),(2,'OPERATOR')");
            jdbc.update("INSERT INTO dhr_summary_version VALUES(1,'frozen-history'),(2,'next-version')");
            jdbc.update("INSERT INTO workflow_instance VALUES(10),(11)");
            String migration;
            try (var stream = getClass().getResourceAsStream("/db/changelog/0097-dhr-review-workbench.sql")) { migration = new String(stream.readAllBytes(), StandardCharsets.UTF_8); }
            for (String sql : migration.split(";")) if (!sql.isBlank()) jdbc.execute(sql);
            assertThat(jdbc.queryForObject("SELECT payload FROM dhr_summary_version WHERE id=1", String.class)).isEqualTo("frozen-history");
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_review", Integer.class)).isZero(); // no invented historical approvals
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM permission", Integer.class)).isEqualTo(6);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM role_permission WHERE role_id=1", Integer.class)).isEqualTo(6);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM role_permission WHERE role_id=2", Integer.class)).isZero();
            for (String sql : migration.split(";")) if (sql.contains("INSERT INTO")) jdbc.execute(sql);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM role_permission", Integer.class)).isEqualTo(6);
            String labelMigration;
            try (var stream = getClass().getResourceAsStream("/db/changelog/0099-dhr-approval-display-name.sql")) { labelMigration = new String(stream.readAllBytes(), StandardCharsets.UTF_8); }
            for (String sql : labelMigration.split(";")) if (!sql.isBlank()) jdbc.execute(sql);
            assertThat(jdbc.queryForObject("SELECT name FROM permission WHERE code='records.dhr-review'", String.class)).isEqualTo("DHR审批");
            assertThat(jdbc.queryForObject("SELECT name FROM permission WHERE code='dhr.reviews.act'", String.class)).isEqualTo("DHR审批处理");
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM role_permission", Integer.class)).isEqualTo(6);
            for (String sql : labelMigration.split(";")) if (!sql.isBlank()) jdbc.execute(sql);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM role_permission", Integer.class)).isEqualTo(6);
            jdbc.update("INSERT INTO dhr_summary_review VALUES(1,10,'PENDING_REVIEW','7',CURRENT_TIMESTAMP)");
            assertThatThrownBy(() -> jdbc.update("INSERT INTO dhr_summary_review VALUES(2,10,'PENDING_REVIEW','7',CURRENT_TIMESTAMP)")).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            assertThatThrownBy(() -> jdbc.update("INSERT INTO dhr_summary_review VALUES(2,11,'INVALID','7',CURRENT_TIMESTAMP)")).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
            assertThatThrownBy(() -> jdbc.update("INSERT INTO dhr_summary_review VALUES(999,11,'PENDING_REVIEW','7',CURRENT_TIMESTAMP)")).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        }
    }
}
