package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.file.*;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

/** Native SQL/JPA, actual JWT/MVC and disk; test-only FK injects refusal, not a new reference policy. */
@SpringBootTest(classes = FileUploadTransactionIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.open-in-view=false",
        "spring.datasource.url=jdbc:h2:mem:delete-transactions;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class FileDeleteTransactionIntegrationTest {
    @Autowired FileController controller;
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider tokens;
    @Autowired PlatformTransactionManager manager;
    @Autowired FileUploadTransactionIntegrationTest.CommitProbe probe;
    @Autowired FileObjectRepository files;
    @TempDir Path directory;
    Path original;

    @BeforeEach void setup() throws Exception {
        probe.mode = null; probe.directory = directory; probe.invoked = false;
        jdbc.execute("DROP TABLE IF EXISTS file_delete_test_reference");
        jdbc.execute("DROP TABLE IF EXISTS file_object CASCADE");
        String schema = Files.readString(Path.of("src/main/resources/db/changelog/baseline/0001-current-schema.sql"));
        var table = Pattern.compile("CREATE TABLE public\\.file_object \\(.*?\\n\\);", Pattern.DOTALL).matcher(schema);
        assertThat(table.find()).isTrue(); jdbc.execute(table.group());
        jdbc.execute("ALTER TABLE file_object ADD PRIMARY KEY(id)");
        original = directory.resolve("original.txt"); Files.writeString(original, "original bytes");
        Files.writeString(directory.resolve("unrelated.txt"), "unrelated bytes");
        jdbc.update("INSERT INTO file_object(id,original_name,stored_path,mime_type,file_size,uploaded_by) VALUES(77,'original.txt',?,'text/plain',14,'transaction-user')", original.toString());
    }
    int httpDelete() throws Exception {
        return mvc.perform(delete("/api/v1/files/77").header("Authorization", "Bearer " + tokens.generateToken("transaction-user", "actor")))
                .andReturn().getResponse().getStatus();
    }
    void retained() throws Exception {
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isEqualTo(1);
        assertThat(original).exists();
        assertThat(Files.readString(original)).isEqualTo("original bytes"); unrelated();
    }
    void unrelated() throws Exception { assertThat(Files.readString(directory.resolve("unrelated.txt"))).isEqualTo("unrelated bytes"); }

    @Test void successfulCommitDeletesRecordAndOnlyItsOriginal() throws Exception {
        assertThat(httpDelete()).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero();
        assertThat(original).doesNotExist(); unrelated();
    }
    @Test void sqlDeleteRefusalPreservesRegisteredOriginal() throws Exception {
        jdbc.execute("CREATE TABLE file_delete_test_reference(file_id BIGINT REFERENCES file_object(id))");
        jdbc.update("INSERT INTO file_delete_test_reference VALUES(77)");
        assertThat(httpDelete()).isEqualTo(400); retained();
    }
    @Test void beforeCommitFailurePreservesRecordAndOriginal() throws Exception {
        probe.mode = "late";
        assertThatThrownBy(() -> new TransactionTemplate(manager).executeWithoutResult(status -> {
            controller.delete(77L); files.flush();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero();
        })).isInstanceOf(IllegalStateException.class).hasMessage("injected late transaction failure");
        assertThat(probe.invoked).isTrue(); retained();
    }
    @Test void outerRollbackPreservesRecordAndOriginal() throws Exception {
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            controller.delete(77L); files.flush();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero();
            assertThat(original).exists(); status.setRollbackOnly();
        });
        retained();
    }
    @Test void outerCommitWaitsBeforeDeletingOriginal() throws Exception {
        new TransactionTemplate(manager).executeWithoutResult(status -> {
            controller.delete(77L); files.flush(); assertThat(original).exists();
        });
        assertThat(original).doesNotExist(); assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero(); unrelated();
    }
    @Test void postCommitCleanupFailureIsNotReportedAsHttpSuccess() throws Exception {
        Files.delete(original); Files.createDirectory(original); Files.writeString(original.resolve("retained-child"), "retained");
        assertThat(httpDelete()).isEqualTo(500);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero();
        assertThat(Files.readString(original.resolve("retained-child"))).isEqualTo("retained"); unrelated();
    }
    @Test void alreadyMissingOriginalStillAllowsMetadataDeletion() throws Exception {
        Files.delete(original); assertThat(httpDelete()).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero(); unrelated();
    }
    @ParameterizedTest @ValueSource(strings = {"PRODUCTION_EXECUTION", "SIGNATURE_EVIDENCE"})
    void protectedOriginalsStillRejectDeletion(String target) throws Exception {
        jdbc.update("UPDATE file_object SET target_type=?", target);
        assertThat(httpDelete()).isEqualTo(400); retained();
    }
}
