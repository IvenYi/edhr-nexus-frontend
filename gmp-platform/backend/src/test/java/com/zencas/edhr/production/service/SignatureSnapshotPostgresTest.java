package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.SubjectResolver;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Real signed-payload/JPA/PostgreSQL/archive-consumer chain; synthetic owned DB only. */
@EnabledIfEnvironmentVariable(named = "SIGNATURE_TEST_DATABASE_URL", matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_signature_test")
@SpringBootTest(classes = SignatureSnapshotPostgresTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
class SignatureSnapshotPostgresTest {
    @Autowired EntityManager em;
    @Autowired SignatureRepository signatures;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired PlatformTransactionManager transactions;
    private final UserAccountRepository users = mock(UserAccountRepository.class);
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder(4);
    private ExecutionAccess access;
    private DhrArchiveService archive;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry p) {
        p.add("spring.datasource.url", () -> System.getenv("SIGNATURE_TEST_DATABASE_URL"));
        p.add("spring.datasource.username", () -> "edhr");
        p.add("spring.datasource.password", () -> "");
        p.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        p.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }

    @BeforeEach void prepare() {
        jdbc.update("DELETE FROM signature");
        jdbc.execute("CREATE TABLE IF NOT EXISTS dhr_summary_review(summary_version_id BIGINT,workflow_instance_id BIGINT)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS workflow_task(id BIGINT,instance_id BIGINT,signature_id BIGINT,action TEXT,opinion TEXT)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS file_object(id BIGINT,mime_type TEXT)");
        jdbc.update("DELETE FROM dhr_summary_review"); jdbc.update("DELETE FROM workflow_task"); jdbc.update("DELETE FROM file_object");
        access = new ExecutionAccess(mock(SubjectResolver.class), users, passwords, signatures, new SnowflakeIdGenerator(3), mapper, jdbc);
        archive = new DhrArchiveService(jdbc, mapper, null, null, null, null, null, null);
        AuditContext.setOperator("1", "合成操作员", "fixture-operator");
    }
    @AfterEach void clearContext() { AuditContext.clear(); }

    @ParameterizedTest @ValueSource(strings = {"PRODUCTION_EXECUTION", "DHR_SUMMARY"})
    void existingSignerServiceSurvivesNativePersistenceAndArchiveVerification(String target) throws Exception {
        AtomicReference<String> original = new AtomicReference<>();
        String id = new TransactionTemplate(transactions).execute(status -> {
            String value = access.signTarget(target, "77", "form/一", "APPROVE", mapper.createObjectNode().put("z", 1).put("a", "含 空格"),
                    new ExecutionAccess.ButtonSigner("2", "合成签署人", "fixture-signer", "SIGNATURE_PASSWORD", "900"));
            original.set(signatures.findById(Long.valueOf(value)).orElseThrow().getSnapshotData());
            em.flush(); em.clear(); return value;
        });
        assertThat(mapper.readTree(payload(id))).isEqualTo(mapper.readTree(original.get()));
        assertThat(jdbc.queryForObject("SELECT snapshot_hash FROM signature WHERE id=?", String.class, Long.valueOf(id))).isEqualTo(hash(original.get()));
        // Invoke the real JDBC consumers after committing, never the managed JPA object.
        ArrayNode exported = archiveSignatures(target, id);
        assertThat(exported).hasSize(1);
        assertThat(exported.get(0).path("snapshotData").asText()).isEqualTo(original.get());
        assertThat(payload(id)).isEqualTo(original.get());
        assertThat(signatures.findById(Long.valueOf(id)).orElseThrow().getSnapshotData()).isEqualTo(original.get());
    }

    @Test void fieldSignatureUsesSameLosslessPersistence() {
        String certificate = "{\"signatureImage\":{\"fileId\":\"501\",\"name\":\"合成图片\"}}";
        new TransactionTemplate(transactions).executeWithoutResult(status -> signatures.save(Signature.builder().id(900L)
                .targetType("USER_PROFILE").targetId("1").snapshotData(certificate).snapshotHash(hash(certificate))
                .signaturePasswordHash(passwords.encode("fixture-signature-password")).expiresAt(LocalDateTime.now().plusDays(1)).build()));
        when(users.findById(1L)).thenReturn(Optional.of(UserAccount.builder().id(1L).status("ACTIVE").displayName("合成操作员").build()));
        jdbc.update("INSERT INTO file_object VALUES(501,'image/png')");
        AtomicReference<String> original = new AtomicReference<>();
        String id = new TransactionTemplate(transactions).execute(status -> {
            var presentation = access.signField(mapper.createObjectNode().put("objectId", "77").put("fieldId", "field/一")
                    .put("raw", "保留 空格"), "fixture-signature-password");
            String value = presentation.path("signatureId").asText();
            original.set(signatures.findById(Long.valueOf(value)).orElseThrow().getSnapshotData());
            em.flush(); em.clear(); return value;
        });
        assertThat(archiveSignatures("PRODUCTION_EXECUTION", id).get(0).path("snapshotData").asText()).isEqualTo(original.get());
        assertThat(payload(id)).isEqualTo(original.get());
    }

    @Test void profileSnapshotKeepsExactWhitespaceOrderAndUnicode() {
        String original = "{ \"z\" : 1.00, \"a\" : [\"中文\", \" 空格 \"], \"signatureImage\" : {\"fileId\":\"501\"} }";
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            signatures.save(Signature.builder().id(900L).targetType("USER_PROFILE").targetId("1")
                    .snapshotData(original).snapshotHash(hash(original)).build()); em.flush(); em.clear();
        });
        assertThat(payload("900")).isEqualTo(original);
        assertThat(signatures.findById(900L).orElseThrow().getSnapshotData()).isEqualTo(original);
    }

    @ParameterizedTest @ValueSource(strings = {"PRODUCTION_EXECUTION", "DHR_SUMMARY"})
    void tamperedDigestStillStopsArchive(String target) {
        String id = new TransactionTemplate(transactions).execute(status -> access.signTarget(target, "77", "f", "APPROVE",
                mapper.createObjectNode().put("value", 1), new ExecutionAccess.ButtonSigner("2", "合成签署人", "fixture", "PASSWORD", null)));
        jdbc.update("UPDATE signature SET snapshot_hash='tampered-digest' WHERE id=?", Long.valueOf(id));
        assertThatThrownBy(() -> archiveSignatures(target, id)).hasMessageContaining("摘要不一致");
    }

    @Test void nativeJsonbControlHasEqualJsonButDifferentSignedBytes() throws Exception {
        String original = "{\"z\":1.00,\"a\":\"中文\"}";
        String normalized = jdbc.queryForObject("SELECT CAST(CAST(? AS JSONB) AS TEXT)", String.class, original);
        assertThat(mapper.readTree(normalized)).isEqualTo(mapper.readTree(original));
        assertThat(normalized).isNotEqualTo(original);
        assertThat(hash(normalized)).isNotEqualTo(hash(original));
    }

    @ParameterizedTest @ValueSource(strings = {"PRODUCTION_EXECUTION", "DHR_SUMMARY"})
    void tamperedPayloadStillStopsArchive(String target) {
        String id = new TransactionTemplate(transactions).execute(status -> access.signTarget(target, "77", "f", "APPROVE",
                mapper.createObjectNode().put("value", 1), new ExecutionAccess.ButtonSigner("2", "合成签署人", "fixture", "PASSWORD", null)));
        jdbc.update("UPDATE signature SET snapshot_data='{\"tampered\":true}' WHERE id=?", Long.valueOf(id));
        assertThatThrownBy(() -> archiveSignatures(target, id)).hasMessageContaining("摘要不一致");
    }

    private String payload(String id) { return jdbc.queryForObject("SELECT snapshot_data FROM signature WHERE id=?", String.class, Long.valueOf(id)); }
    private ArrayNode archiveSignatures(String target, String id) {
        if ("PRODUCTION_EXECUTION".equals(target))
            return ReflectionTestUtils.invokeMethod(archive, "sourceSignatures", "77", Timestamp.valueOf(LocalDateTime.now().plusDays(1)));
        jdbc.update("INSERT INTO dhr_summary_review VALUES(10,60)");
        jdbc.update("INSERT INTO workflow_task VALUES(50,60,?,'APPROVE','合成意见')", Long.valueOf(id));
        return ReflectionTestUtils.invokeMethod(archive, "signaturesFor", 10L);
    }
    private static String hash(String text) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    static class Config {
        @Bean EntityManager em(EntityManagerFactory f) { return SharedEntityManagerCreator.createSharedEntityManager(f); }
        @Bean PersistenceManagedTypes types() { return PersistenceManagedTypes.of(Signature.class.getName()); }
        @Bean SignatureRepository signatures(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(SignatureRepository.class); }
    }
}
