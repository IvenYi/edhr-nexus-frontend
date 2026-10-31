package com.zencas.edhr.masterdata.controller;

import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/** Repeat the same authorization and atomicity assertions on an explicitly owned local database only. */
@EnabledIfEnvironmentVariable(named = "EDHR_DOCUMENT_DATABASE_URL", matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_document_read_test")
class DocumentWriteBoundaryPostgresTest extends DocumentWriteBoundaryIntegrationTest {
    @DynamicPropertySource
    static void postgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("EDHR_DOCUMENT_DATABASE_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("EDHR_DOCUMENT_DATABASE_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("EDHR_DOCUMENT_DATABASE_PASSWORD"));
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        properties.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        properties.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }
}
