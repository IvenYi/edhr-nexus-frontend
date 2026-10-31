package com.zencas.edhr.compliance.controller;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@EnabledIfEnvironmentVariable(named = "EDHR_UPLOAD_TX_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_upload_transaction_test")
class FileUploadTransactionPostgresTest extends FileUploadTransactionIntegrationTest {
    @DynamicPropertySource static void postgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("EDHR_UPLOAD_TX_DATABASE_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("EDHR_UPLOAD_TX_DATABASE_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("EDHR_UPLOAD_TX_DATABASE_PASSWORD"));
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        properties.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }
}
