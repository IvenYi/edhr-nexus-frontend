package com.zencas.edhr.production.service;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.slf4j.LoggerFactory;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.orm.jpa.EntityManagerFactoryUtils;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.*;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;

/** Actual proxy/JPA audit/JDBC/files. Post-COMMIT acknowledgement failure is synthetic, not a network fault. */
@EnabledIfEnvironmentVariable(named = "EDHR_DHR_ATTACHMENT_TX_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_attachment_transaction_test")
@SpringBootTest(classes = DhrAttachmentTransactionPostgresTest.Config.class, webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = {"spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.open-in-view=false"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DhrAttachmentTransactionPostgresTest {
    @Autowired DhrAttachmentService attachments;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager manager;
    @Autowired EntityManagerFactory factory;
    @Autowired CommitProbe probe;
    @TempDir Path directory;
    private byte[] png;
    private final Logger logger = (Logger) LoggerFactory.getLogger(DhrAttachmentService.class);
    private ListAppender<ILoggingEvent> logs;

    @DynamicPropertySource static void database(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_PASSWORD"));
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @BeforeEach void setup() throws Exception {
        probe.unknownAfterCommit = false; probe.completionStatus = -1;
        assertThat(AopUtils.isAopProxy(attachments)).isTrue();
        String schema = Files.readString(Path.of("src/main/resources/db/changelog/baseline/0001-current-schema.sql"));
        for (String table : new String[]{"audit_event", "dhr_attachment", "dhr_instance"}) {
            jdbc.execute("DROP TABLE IF EXISTS " + table + " CASCADE");
            var ddl = Pattern.compile("CREATE TABLE public\\." + table + " \\(.*?\\n\\);", Pattern.DOTALL).matcher(schema);
            assertThat(ddl.find()).as("canonical %s table", table).isTrue();
            jdbc.execute(ddl.group()); jdbc.execute("ALTER TABLE " + table + " ADD PRIMARY KEY(id)");
        }
        jdbc.execute(Files.readString(Path.of("src/main/resources/db/changelog/0092-audit-event-hash-version.sql")));
        jdbc.update("""
            INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,
              work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,
              context_snapshot,directory_snapshot,status,summary_status,created_at,updated_at)
            VALUES(1,'default','DHR-1',77,'BATCH-1','BATCH',10,'WO-10',20,30,40,50,60,'{}','[]',
              'COMPLETED','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
            """);
        ReflectionTestUtils.setField(attachments, "storagePath", directory.toString());
        Files.writeString(directory.resolve("unrelated-original"), "preserve");
        try (var bytes = new ByteArrayOutputStream()) {
            assertThat(ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes)).isTrue();
            png = bytes.toByteArray();
        }
        AuditContext.setOperator("7", "附件审查", "attachment-reviewer");
        logs = new ListAppender<>(); logs.start(); logger.addAppender(logs);
    }

    @AfterEach void clear() {
        AuditContext.clear();
        if (logs != null) { logger.detachAppender(logs); logs.stop(); }
    }

    @Test void successfulProxyUploadCommitsExactOriginalAndSealedAudit() throws Exception {
        var linked = upload("valid");
        assertRows(1); assertOriginal(path(linked));
        assertThat(jdbc.queryForObject("SELECT snapshot_hash FROM audit_event", String.class)).hasSize(64);
        assertThat(jdbc.queryForObject("SELECT operator_account FROM audit_event", String.class)).isEqualTo("attachment-reviewer");
        assertThat(probe.completionStatus).isEqualTo(TransactionSynchronization.STATUS_COMMITTED);
    }

    @Test void sqlRefusalRollsBackAndCleansOnlyCurrentOriginal() throws Exception {
        jdbc.execute("ALTER TABLE dhr_attachment ADD CONSTRAINT attachment_test_refusal CHECK(purpose <> 'reject')");
        assertThatThrownBy(() -> upload("reject")).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
        assertRows(0); assertNoCurrentOriginal();
        assertThat(probe.completionStatus).isEqualTo(TransactionSynchronization.STATUS_ROLLED_BACK);
    }

    @Test void auditFailureRollsBackAttachmentAndCleansCurrentOriginal() throws Exception {
        jdbc.execute("ALTER TABLE audit_event ADD CONSTRAINT attachment_test_audit_refusal CHECK(action <> 'LINK')");
        assertThatThrownBy(() -> upload("audit failure")).isInstanceOf(RuntimeException.class).hasStackTraceContaining("attachment_test_audit_refusal");
        assertRows(0); assertNoCurrentOriginal();
        assertThat(probe.completionStatus).isEqualTo(TransactionSynchronization.STATUS_ROLLED_BACK);
    }

    @Test void failureBeforeCommitRollsBackAlreadyFlushedAttachmentAndAudit() throws Exception {
        assertThatThrownBy(() -> new TransactionTemplate(manager).executeWithoutResult(status -> {
            uploadUnchecked();
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void beforeCommit(boolean readOnly) {
                    EntityManagerFactoryUtils.getTransactionalEntityManager(factory).flush();
                    assertRows(1);
                    throw new IllegalStateException("injected failure before commit");
                }
            });
        })).isInstanceOf(IllegalStateException.class).hasMessage("injected failure before commit");
        assertRows(0); assertNoCurrentOriginal();
    }

    @Test void outerRollbackDefersCleanupUntilFinalOutcome() throws Exception {
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            var linked = uploadUnchecked();
            EntityManagerFactoryUtils.getTransactionalEntityManager(factory).flush();
            assertRows(1); assertThat(path(linked)).exists(); status.setRollbackOnly();
        });
        assertRows(0); assertNoCurrentOriginal();
    }

    @Test void outerCommitKeepsCurrentOriginal() throws Exception {
        var linked = new TransactionTemplate(manager).execute(status -> uploadUnchecked());
        assertRows(1); assertOriginal(path(linked));
    }

    @Test void unknownAfterActualDatabaseCommitRetainsRegisteredOriginal() throws Exception {
        probe.unknownAfterCommit = true;
        assertThatThrownBy(() -> upload("unknown")).isInstanceOf(TransactionSystemException.class)
                .hasMessage("injected acknowledgement failure after database commit");
        assertThat(probe.completionStatus).isEqualTo(TransactionSynchronization.STATUS_UNKNOWN);
        assertRows(1);
        var row = jdbc.queryForMap("SELECT id,stored_path FROM dhr_attachment");
        Path original = Path.of(String.valueOf(row.get("stored_path")));
        assertOriginal(original);
        assertThat(logs.list).anySatisfy(event -> {
            assertThat(event.getFormattedMessage()).containsIgnoringCase("unknown").contains(row.get("id").toString(), original.toString());
        });
    }

    @Test void rollbackCleanupFailureIsLoggedWithoutReplacingOriginalFailure() throws Exception {
        var retained = new Path[1];
        var id = new String[1];
        assertThatThrownBy(() -> new TransactionTemplate(manager).executeWithoutResult(status -> {
            var linked = uploadUnchecked(); retained[0] = path(linked); id[0] = linked.path("attachmentId").asText();
            try {
                Files.delete(retained[0]); Files.createDirectory(retained[0]);
                Files.writeString(retained[0].resolve("fault-child"), "preserve failure evidence");
            } catch (Exception failure) { throw new IllegalStateException(failure); }
            throw new IllegalStateException("original transaction failure");
        })).isInstanceOf(IllegalStateException.class).hasMessage("original transaction failure");
        assertRows(0);
        assertThat(Files.readString(retained[0].resolve("fault-child"))).isEqualTo("preserve failure evidence");
        assertUnrelated();
        assertThat(logs.list).anySatisfy(event -> {
            assertThat(event.getLevel()).isEqualTo(ch.qos.logback.classic.Level.ERROR);
            assertThat(event.getFormattedMessage()).contains(id[0], retained[0].toString());
            assertThat(event.getThrowableProxy()).isNotNull();
            assertThat(event.getThrowableProxy().getClassName()).isEqualTo(java.nio.file.DirectoryNotEmptyException.class.getName());
        });
    }

    @ParameterizedTest @ValueSource(strings = {"PENDING_REVIEW", "FORMALIZED"})
    void existingSummaryGuardsStillRejectUpload(String summaryStatus) throws Exception {
        jdbc.update("UPDATE dhr_instance SET summary_status=?", summaryStatus);
        assertThatThrownBy(() -> upload("rejected by existing guard")).hasMessageContaining("不能修改附件");
        assertRows(0); assertNoCurrentOriginal();
    }

    @Test void unlinkStillRetainsHistoricalBytes() throws Exception {
        var linked = upload("history"); Long id = Long.valueOf(linked.path("attachmentId").asText());
        attachments.unlink(1L, id, "mislinked");
        assertThat(jdbc.queryForObject("SELECT active FROM dhr_attachment", Boolean.class)).isFalse();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(2);
        assertOriginal(attachments.file(1L, id));
    }

    private ObjectNode upload(String purpose) throws Exception {
        return attachments.upload(1L, new MockMultipartFile("file", "original.png", "image/png", png), "OTHER", purpose, null, null);
    }
    private ObjectNode uploadUnchecked() {
        try { return upload("outer"); } catch (Exception failure) { throw new IllegalStateException(failure); }
    }
    private Path path(ObjectNode linked) {
        return Path.of(jdbc.queryForObject("SELECT stored_path FROM dhr_attachment WHERE id=?", String.class, Long.valueOf(linked.path("attachmentId").asText())));
    }
    private void assertRows(int expected) {
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_attachment", Integer.class)).isEqualTo(expected);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(expected);
    }
    private void assertOriginal(Path path) throws Exception {
        assertThat(path).exists(); assertThat(Files.readAllBytes(path)).isEqualTo(png); assertUnrelated();
    }
    private void assertNoCurrentOriginal() throws Exception {
        if (Files.exists(directory.resolve("dhr"))) try (var files = Files.list(directory.resolve("dhr"))) { assertThat(files.toList()).isEmpty(); }
        assertUnrelated();
    }
    private void assertUnrelated() throws Exception { assertThat(Files.readString(directory.resolve("unrelated-original"))).isEqualTo("preserve"); }

    static class CommitProbe { boolean unknownAfterCommit; int completionStatus; }

    @Configuration
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = AuditEvent.class)
    @EnableJpaRepositories(basePackageClasses = AuditEventRepository.class)
    @Import(DhrAttachmentService.class)
    static class Config {
        @Bean ObjectMapper mapper() { return new ObjectMapper(); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean CommitProbe probe() { return new CommitProbe(); }
        @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory, CommitProbe probe) {
            var actual = new JpaTransactionManager(factory) {
                @Override protected void doCommit(DefaultTransactionStatus status) {
                    super.doCommit(status);
                    if (probe.unknownAfterCommit)
                        throw new TransactionSystemException("injected acknowledgement failure after database commit");
                }
            };
            actual.afterPropertiesSet();
            return new PlatformTransactionManager() {
                @Override public TransactionStatus getTransaction(TransactionDefinition definition) {
                    var status = actual.getTransaction(definition);
                    if (status.isNewTransaction()) TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override public void afterCompletion(int completionStatus) { probe.completionStatus = completionStatus; }
                    });
                    return status;
                }
                @Override public void commit(TransactionStatus status) { actual.commit(status); }
                @Override public void rollback(TransactionStatus status) { actual.rollback(status); }
            };
        }
    }
}
