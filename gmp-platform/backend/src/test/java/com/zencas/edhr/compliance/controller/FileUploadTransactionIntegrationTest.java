package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.system.repository.IconAssetRepository;
import com.zencas.edhr.system.repository.SystemSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.orm.jpa.JpaTransactionManager;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;

/** Real JPA, SQL, JWT/MVC and files. Only file_object uses verbatim canonical table DDL. */
@SpringBootTest(classes = FileUploadTransactionIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.open-in-view=false",
        "spring.datasource.url=jdbc:h2:mem:upload-transactions;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class FileUploadTransactionIntegrationTest {
    @Autowired FileController controller;
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider tokens;
    @Autowired PlatformTransactionManager manager;
    @Autowired CommitProbe probe;
    @Autowired FileObjectRepository files;
    @TempDir Path directory;

    @BeforeEach void setup() throws Exception {
        probe.mode = null; probe.directory = directory; probe.invoked = false;
        String schema = Files.readString(Path.of("src/main/resources/db/changelog/baseline/0001-current-schema.sql"));
        var table = Pattern.compile("CREATE TABLE public\\.file_object \\(.*?\\n\\);", Pattern.DOTALL).matcher(schema);
        assertThat(table.find()).isTrue();
        jdbc.execute("DROP TABLE IF EXISTS file_object CASCADE");
        jdbc.execute(table.group());
        jdbc.execute("ALTER TABLE file_object ADD PRIMARY KEY(id)");
        jdbc.execute("ALTER TABLE file_object ADD CONSTRAINT upload_test_name CHECK(original_name <> 'reject.txt')");
        ReflectionTestUtils.setField(controller, "storagePath", directory.toString());
        Files.writeString(directory.resolve("unrelated-original"), "preserve");
    }

    @Test void successfulHttpUploadCommitsMetadataAndPreservesExactOriginal() throws Exception {
        var response = upload("valid.txt");
        assertThat(response.getStatus()).isEqualTo(200);
        var row = jdbc.queryForMap("SELECT * FROM file_object");
        assertThat(row.get("uploaded_by")).isEqualTo("transaction-user");
        assertThat(Files.readString(Path.of(String.valueOf(row.get("stored_path"))))).isEqualTo("original");
        assertThat(row.get("md5_hash")).isEqualTo("919c8b643b7133116b02fc0d9bb7df3f");
    }

    @Test void sqlConstraintRollbackDoesNotLeaveAnUnregisteredOriginal() throws Exception {
        assertThat(upload("reject.txt").getStatus()).isEqualTo(400);
        assertEmptyRegistrationAndOnlyUnrelatedFile();
    }

    @Test void failureAfterSaveButBeforeCommitRollsBackAndRemovesNewOriginal() throws Exception {
        beforeCommitFailure(false);
        assertThat(upload("late.txt").getStatus()).isEqualTo(500);
        assertThat(probe.invoked).isTrue();
        assertEmptyRegistrationAndOnlyUnrelatedFile();
    }

    @Test void joiningAnOuterTransactionWaitsForItsFinalRollback() throws Exception {
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            try { controller.upload(new MockMultipartFile("file", "outer.txt", "text/plain", "original".getBytes()), null, null); }
            catch (Exception error) { throw new IllegalStateException(error); }
            files.flush();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isEqualTo(1);
            status.setRollbackOnly();
        });
        assertEmptyRegistrationAndOnlyUnrelatedFile();
    }

    @Test void cleanupFailureKeepsOriginalDatabaseFailureAndDoesNotReportSuccess() throws Exception {
        beforeCommitFailure(true);
        var response = upload("cleanup.txt");
        assertThat(response.getStatus()).isEqualTo(500);
        assertThat(probe.invoked).isTrue();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero();
        try (var paths = Files.list(directory)) {
            assertThat(paths.filter(Files::isDirectory).count()).isEqualTo(1);
        }
        assertThat(Files.readString(directory.resolve("unrelated-original"))).isEqualTo("preserve");
    }

    private void beforeCommitFailure(boolean preventCleanup) {
        probe.mode = preventCleanup ? "cleanup" : "late";
    }

    static class CommitProbe {
        String mode;
        Path directory;
        boolean invoked;
        void failBeforeCommit() {
            invoked = true;
            if (mode.equals("cleanup")) try (var paths = Files.list(directory)) {
                Path path = paths.filter(candidate -> !candidate.getFileName().toString().equals("unrelated-original"))
                        .findFirst().orElseThrow();
                Files.delete(path); Files.createDirectory(path); Files.writeString(path.resolve("child"), "fault");
            } catch (Exception error) { throw new IllegalStateException(error); }
            throw new IllegalStateException("injected late transaction failure");
        }
    }

    private jakarta.servlet.http.HttpServletResponse upload(String name) throws Exception {
        return mvc.perform(multipart("/api/v1/files/upload")
                        .file(new MockMultipartFile("file", name, "text/plain", "original".getBytes()))
                        .header("Authorization", "Bearer " + tokens.generateToken("transaction-user", "actor")))
                .andReturn().getResponse();
    }

    private void assertEmptyRegistrationAndOnlyUnrelatedFile() throws Exception {
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero();
        try (var paths = Files.list(directory)) {
            assertThat(paths.map(path -> path.getFileName().toString()).toList()).containsExactly("unrelated-original");
        }
        assertThat(Files.readString(directory.resolve("unrelated-original"))).isEqualTo("preserve");
    }

    @Configuration
    @EnableAutoConfiguration
    @EntityScan(basePackageClasses = FileObject.class)
    @EnableJpaRepositories(basePackageClasses = FileObjectRepository.class)
    @Import({FileController.class, SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class})
    static class Config {
        @Bean CommitProbe commitProbe() { return new CommitProbe(); }
        @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory, CommitProbe probe) {
            var actual = new JpaTransactionManager(factory);
            actual.afterPropertiesSet();
            return new PlatformTransactionManager() {
                @Override public TransactionStatus getTransaction(TransactionDefinition definition) {
                    var status = actual.getTransaction(definition);
                    if (status.isNewTransaction() && probe.mode != null)
                        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                            @Override public void beforeCommit(boolean readOnly) { probe.failBeforeCommit(); }
                        });
                    return status;
                }
                @Override public void commit(TransactionStatus status) { actual.commit(status); }
                @Override public void rollback(TransactionStatus status) { actual.rollback(status); }
            };
        }
        @Bean IconAssetRepository icons() { return mock(IconAssetRepository.class); }
        @Bean SystemSettingRepository settings() { return mock(SystemSettingRepository.class); }
        @Bean UserAccountRepository users() { return mock(UserAccountRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("upload-transaction-synthetic-secret-at-least-32-characters", 60000); }
    }
}
