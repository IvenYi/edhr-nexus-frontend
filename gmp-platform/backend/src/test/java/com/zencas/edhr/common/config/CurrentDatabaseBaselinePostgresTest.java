package com.zencas.edhr.common.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import static org.assertj.core.api.Assertions.*;

/** Destructive only inside an explicitly named disposable database; never edhr_dev. */
@EnabledIfEnvironmentVariable(named = "BASELINE_TEST_DATABASE_URL",
    matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_baseline_test_[a-z0-9_]+")
class CurrentDatabaseBaselinePostgresTest {
    private Connection connection;

    @BeforeEach void resetDisposableDatabase() throws Exception {
        connection = DriverManager.getConnection(System.getenv("BASELINE_TEST_DATABASE_URL"),
            System.getenv("PGUSER"), System.getenv("PGPASSWORD"));
        connection.createStatement().execute("DROP SCHEMA public CASCADE");
        connection.createStatement().execute("CREATE SCHEMA public");
    }
    @AfterEach void close() throws Exception { connection.close(); }

    private void install() throws Exception {
        try (var resource = new ClassLoaderResourceAccessor()) {
            // Liquibase owns neither this connection nor the test database lifecycle.
            var liquibase = new Liquibase("db/changelog/db.changelog-master.yaml", resource, new JdbcConnection(connection));
            liquibase.update(new Contexts(), new LabelExpression());
        }
    }
    private String scalar(String sql) throws SQLException {
        try (var statement = connection.createStatement(); var rows = statement.executeQuery(sql)) {
            rows.next(); return rows.getString(1);
        }
    }

    @Test void freshInstallIsCurrentCompleteAndRepeatableWithoutBusinessBackfills() throws Exception {
        install();
        connection.setAutoCommit(true);
        assertThat(scalar("SELECT count(*) FROM databasechangelog")).isEqualTo("2");
        assertThat(scalar("SELECT count(*) FROM pg_constraint WHERE connamespace='public'::regnamespace AND NOT convalidated")).isEqualTo("0");
        assertThat(scalar("SELECT count(*) FROM form_lookup_item WHERE builtin")).isEqualTo("9");
        assertThat(scalar("SELECT string_agg(id,',' ORDER BY id) FROM form_lookup_item WHERE builtin"))
            .isEqualTo("equipmentText,lookup_material_code,lookup_order_number,lookup_product_code,lookup_production_batch,lookup_supplier_lot,lookup_trace_date,lookup_work_order,materialLotText");
        assertThat(scalar("SELECT count(*) FROM material_type")).isEqualTo("5");
        assertThat(scalar("SELECT count(*) FROM pg_sequences WHERE schemaname='public'")).isEqualTo("6");
        assertThat(scalar("SELECT count(*) FROM form_instance_record")).isEqualTo("0");
        assertThat(scalar("SELECT count(*) FROM dhr_instance")).isEqualTo("0");
        assertThat(scalar("SELECT count(*) FROM audit_event")).isEqualTo("0");
        assertThat(scalar("SELECT count(*) FROM permission p JOIN role_permission rp ON rp.permission_id=p.id JOIN role r ON r.id=rp.role_id WHERE r.code='ADMIN'"))
            .isEqualTo("72");
        assertThat(scalar("SELECT count(*) FROM quality_reason")).isEqualTo("0");
        assertThat(scalar("SELECT count(*) FROM permission p JOIN role_permission rp ON rp.permission_id=p.id JOIN role r ON r.id=rp.role_id WHERE r.code='ADMIN' AND p.code IN ('master-data.reason-modeling','master-data.defect-reasons','master-data.scrap-reasons')"))
            .isEqualTo("3");
        connection.createStatement().execute("INSERT INTO quality_reason(id,reason_type,code,name) VALUES(-1,'DEFECT','D-01','划伤')");
        assertThatThrownBy(() -> connection.createStatement().execute("INSERT INTO quality_reason(id,reason_type,code,name) VALUES(-2,'DEFECT','d-01','重复')"))
            .isInstanceOf(SQLException.class);
        assertThatThrownBy(() -> connection.createStatement().execute("INSERT INTO quality_reason(id,reason_type,code,name) VALUES(-3,'CATEGORY','C-01','分类')"))
            .isInstanceOf(SQLException.class);
        String before = scalar("SELECT md5(string_agg(row_to_json(p)::text,',' ORDER BY id)) FROM permission p");
        install();
        connection.setAutoCommit(true);
        assertThat(scalar("SELECT count(*) FROM databasechangelog")).isEqualTo("2");
        assertThat(scalar("SELECT md5(string_agg(row_to_json(p)::text,',' ORDER BY id)) FROM permission p")).isEqualTo(before);

        // First release stores the original bytes, not the normalized JSONB representation.
        String payload = "{ \"z\" : 1.00, \"a\" : \"签署原文\" }";
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload.getBytes(StandardCharsets.UTF_8)));
        try (var insert = connection.prepareStatement("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,snapshot_data,snapshot_hash) VALUES(-1,'OTHER','99','OTHER','1','测试',?,?)")) {
            insert.setString(1, payload); insert.setString(2, hash); insert.executeUpdate();
        }
        assertThat(scalar("SELECT snapshot_data FROM signature WHERE id=-1")).isEqualTo(payload);
        assertThat(scalar("SELECT snapshot_hash FROM signature WHERE id=-1")).isEqualTo(hash);
        assertThatThrownBy(() -> connection.createStatement().execute("UPDATE signature SET snapshot_data='not-json' WHERE id=-1"))
            .isInstanceOf(SQLException.class);
        assertThatThrownBy(() -> connection.createStatement().execute("INSERT INTO work_order(id,order_no,product_id,planned_quantity,status) VALUES(-1,'NO-PRODUCT',-999,1,'CREATED')"))
            .isInstanceOf(SQLException.class);
    }

    @Test void existingBusinessSchemaIsRejectedWithoutCleaningOrGuessingData() throws Exception {
        connection.createStatement().execute("CREATE TABLE existing_test_data(id bigint PRIMARY KEY, value text)");
        connection.createStatement().execute("INSERT INTO existing_test_data VALUES(1,'keep')");
        assertThatThrownBy(this::install).hasMessageContaining("SQL Precondition failed.  Expected '0' got '1'");
        assertThat(scalar("SELECT value FROM existing_test_data WHERE id=1")).isEqualTo("keep");
        assertThat(scalar("SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='signature'")).isEqualTo("0");
    }
}
