package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.dao.DataAccessException;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

/** Actual Liquibase forward migration, only disposable schemas in an owned native PG database. */
@EnabledIfEnvironmentVariable(named = "SIGNATURE_TEST_DATABASE_URL", matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_signature_test")
class SignatureSnapshotMigrationPostgresTest {
    private Connection connection;
    private JdbcTemplate jdbc;
    private Liquibase liquibase;
    private String schema;

    @BeforeEach void legacySchema() throws Exception {
        connection = DriverManager.getConnection(System.getenv("SIGNATURE_TEST_DATABASE_URL"), "edhr", "");
        schema = "signature_payload_" + UUID.randomUUID().toString().replace("-", "");
        connection.createStatement().execute("CREATE SCHEMA " + schema);
        connection.setSchema(schema);
        jdbc = new JdbcTemplate(new SingleConnectionDataSource(connection, true));
        String originalDdl = resource("/db/changelog/0001-init-schema.sql");
        String signatureDdl = originalDdl.substring(originalDdl.indexOf("CREATE TABLE IF NOT EXISTS signature ("),
                originalDdl.indexOf("CREATE TABLE IF NOT EXISTS file_object ("));
        ScriptUtils.executeSqlScript(connection, new ByteArrayResource(signatureDdl.getBytes(StandardCharsets.UTF_8)));
        var database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
        database.setDefaultSchemaName(schema);
        liquibase = new Liquibase("db/changelog/0118-signature-payload-text.sql", new ClassLoaderResourceAccessor(), database);
    }

    @AfterEach void removeOwnedSchema() throws Exception {
        if (connection != null && !connection.isClosed()) {
            connection.setSchema("public");
            connection.createStatement().execute("DROP SCHEMA IF EXISTS " + schema + " CASCADE");
            if (liquibase != null) liquibase.close(); else connection.close();
        }
    }

    @Test void forwardMigrationPreservesEveryExistingReadableValueHashAndMetadata() throws Exception {
        seedLegacy();
        var before = rows();
        migrate();
        assertThat(jdbc.queryForObject("SELECT data_type FROM information_schema.columns WHERE table_schema=? AND table_name='signature' AND column_name='snapshot_data'", String.class, schema)).isEqualTo("text");
        assertThat(rows()).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM databasechangelog WHERE id='0118-signature-payload-text'", Integer.class)).isEqualTo(1);
    }

    @Test void fullMasterBuildsFreshDatabaseWithLosslessSignatureStorage() throws Exception {
        // Historical migrations explicitly reference public; isolate the complete chain in its own DB.
        String databaseName = "edhr_signature_master_" + UUID.randomUUID().toString().replace("-", "");
        String url = System.getenv("SIGNATURE_TEST_DATABASE_URL");
        try (Connection admin = DriverManager.getConnection(url, "edhr", "")) {
            admin.createStatement().execute("CREATE DATABASE " + databaseName);
            try {
                try (Connection master = DriverManager.getConnection(url.substring(0, url.lastIndexOf('/') + 1) + databaseName, "edhr", "")) {
                    var db = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(master));
                    db.setDefaultSchemaName("public");
                    try (var full = new Liquibase("db/changelog/db.changelog-master.yaml", new ClassLoaderResourceAccessor(), db)) {
                        full.update(new Contexts(), new LabelExpression());
                        var fresh = new JdbcTemplate(new SingleConnectionDataSource(master, true));
                        assertThat(fresh.queryForObject("SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='signature' AND column_name='snapshot_data'", String.class)).isEqualTo("text");
                        assertThat(fresh.queryForObject("SELECT COUNT(*) FROM databasechangelog WHERE id='0118-signature-payload-text'", Integer.class)).isEqualTo(1);
                    }
                }
            } finally { admin.createStatement().execute("DROP DATABASE " + databaseName); }
        }
    }

    @Test void repeatedLiquibaseAndForwardDdlLeaveRowsAndSingleChangeSetUnchanged() throws Exception {
        seedLegacy(); migrate(); var before = rows();
        migrate();
        jdbc.execute(resource("/db/changelog/0118-signature-payload-text.sql"));
        assertThat(rows()).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM databasechangelog WHERE id='0118-signature-payload-text'", Integer.class)).isEqualTo(1);
    }

    @ParameterizedTest @ValueSource(strings = {"not-json", "{\"broken\":", "{\"number\":1e200000}"})
    void migrationKeepsPreviousJsonbInputRejections(String invalid) throws Exception {
        connection.setAutoCommit(true);
        assertThatThrownBy(() -> jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,snapshot_data) VALUES(9,'OTHER','99','OTHER','1','合成人员',CAST(? AS JSONB))", invalid))
                .isInstanceOf(DataAccessException.class);
        migrate(); connection.setAutoCommit(true);
        assertThatThrownBy(() -> jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,snapshot_data) VALUES(9,'OTHER','99','OTHER','1','合成人员',?)", invalid))
                .isInstanceOf(DataAccessException.class);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature", Integer.class)).isZero();
    }

    @Test void migrationKeepsExistingJsonShapesWithoutNormalizingTheirOriginalText() throws Exception {
        migrate();
        String[] valid = {"null", "true", "1.00", "\"中文\"", "[ 1, 2 ]", "{\"z\":1,\"z\":2,\"a\":3}"};
        for (int i=0; i<valid.length; i++) {
            jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,snapshot_data,snapshot_hash) VALUES(?,'OTHER','99','OTHER','1','合成人员',?,?)", i+10, valid[i], hash(valid[i]));
            assertThat(jdbc.queryForObject("SELECT snapshot_data FROM signature WHERE id=?", String.class, i+10)).isEqualTo(valid[i]);
        }
    }

    @Test void migrationDoesNotInventMissingOriginalBytesOrRelaxLegacyVerification() throws Exception {
        seedLegacy();
        String storedHash = jdbc.queryForObject("SELECT snapshot_hash FROM signature WHERE id=1", String.class);
        assertThat(hash(jdbc.queryForObject("SELECT snapshot_data::TEXT FROM signature WHERE id=1", String.class))).isNotEqualTo(storedHash);
        migrate();
        var archive = new DhrArchiveService(jdbc, new ObjectMapper(), null, null, null, null, null, null);
        assertThatThrownBy(() -> ReflectionTestUtils.invokeMethod(archive, "sourceSignatures", "77", Timestamp.valueOf(LocalDateTime.of(2027,1,1,0,0))))
                .hasMessageContaining("来源签署证据摘要不一致");
        assertThat(jdbc.queryForObject("SELECT snapshot_hash FROM signature WHERE id=1", String.class)).isEqualTo(storedHash);
        com.fasterxml.jackson.databind.node.ArrayNode intact = ReflectionTestUtils.invokeMethod(archive, "sourceSignatures", "88", Timestamp.valueOf(LocalDateTime.of(2027,1,1,0,0)));
        assertThat(intact).hasSize(1);
    }

    @Test void lossyAutomaticRollbackIsRejectedBeforeChangingNewSignedPayload() throws Exception {
        migrate();
        String original = "{ \"z\" : 1, \"a\" : \"签署原文\" }";
        jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,snapshot_data,snapshot_hash) VALUES(9,'PRODUCTION_EXECUTION','99','APPROVE','1','合成签署人',?,?)", original, hash(original));
        connection.commit();
        var before = rows();
        assertThatThrownBy(() -> liquibase.rollback(1, new Contexts(), new LabelExpression())).isInstanceOf(LiquibaseException.class);
        assertThat(rows()).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT snapshot_data FROM signature WHERE id=9", String.class)).isEqualTo(original);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM databasechangelog WHERE id='0118-signature-payload-text'", Integer.class)).isEqualTo(1);
    }

    private void migrate() throws Exception { liquibase.update(new Contexts(), new LabelExpression()); }
    private void seedLegacy() {
        String original = "{\"z\":1.00,\"a\":\"历史原件\"}";
        jdbc.update("INSERT INTO signature(id,tenant_id,target_type,target_id,meaning,signer_id,signer_name,auth_method,auth_event_ref,snapshot_data,snapshot_hash,signed_at) VALUES(1,'default','PRODUCTION_EXECUTION','77','APPROVE','1','合成签署人','SIGNATURE_PASSWORD','900',CAST(? AS JSONB),?,TIMESTAMP '2026-01-02 12:00:00')", original, hash(original));
        jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,snapshot_data,snapshot_hash) VALUES(2,'USER_PROFILE','2','CERTIFY','2','合成人员',NULL,NULL)");
        jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,snapshot_data,snapshot_hash,signed_at) VALUES(3,'PRODUCTION_EXECUTION','88','APPROVE','1','合成签署人','{}',?,TIMESTAMP '2026-01-02 12:00:00')", hash("{}"));
    }
    private List<Map<String,Object>> rows() {
        return jdbc.queryForList("SELECT id,tenant_id,target_type,target_id,meaning,signer_id,signer_name,auth_method,auth_event_ref,snapshot_hash,snapshot_data::TEXT AS snapshot_data,signature_password_hash,signed_at FROM signature ORDER BY id");
    }
    private static String resource(String name) throws Exception {
        try (var in = SignatureSnapshotMigrationPostgresTest.class.getResourceAsStream(name)) {
            if (in == null) throw new IllegalStateException("Missing migration resource: " + name);
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
    private static String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
}
