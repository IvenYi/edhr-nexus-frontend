package com.zencas.edhr.compliance.controller;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.support.TransactionTemplate;

import static org.assertj.core.api.Assertions.*;

@EnabledIfEnvironmentVariable(named = "EDHR_UPLOAD_TX_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_upload_transaction_test")
class FileDeleteTransactionPostgresTest extends FileDeleteTransactionIntegrationTest {
    @DynamicPropertySource static void postgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("EDHR_UPLOAD_TX_DATABASE_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("EDHR_UPLOAD_TX_DATABASE_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("EDHR_UPLOAD_TX_DATABASE_PASSWORD"));
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        properties.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }
    @Test void deferredForeignKeyFailureAtActualCommitPreservesOriginal() throws Exception {
        jdbc.execute("CREATE TABLE file_delete_test_reference(file_id BIGINT REFERENCES file_object(id) DEFERRABLE INITIALLY DEFERRED)");
        jdbc.update("INSERT INTO file_delete_test_reference VALUES(77)");
        assertThatThrownBy(() -> new TransactionTemplate(manager).executeWithoutResult(status -> {
            controller.delete(77L); files.flush();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM file_object", Integer.class)).isZero();
        })).isInstanceOf(RuntimeException.class).hasStackTraceContaining("file_delete_test_reference");
        retained();
    }
}
