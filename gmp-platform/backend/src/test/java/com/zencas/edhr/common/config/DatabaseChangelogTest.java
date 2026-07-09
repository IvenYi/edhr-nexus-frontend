package com.zencas.edhr.common.config;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseChangelogTest {

    @Test
    void signatureCreatedAtMigrationIsIncludedAndIdempotent() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        assertThat(master).contains("0019-signature-created-at.sql");

        String migration = readResource("db/changelog/0019-signature-created-at.sql");
        String normalizedMigration = migration.replaceAll("\\s+", " ");
        assertThat(migration).contains("ALTER TABLE signature");
        assertThat(migration).contains("ADD COLUMN IF NOT EXISTS created_at TIMESTAMP");
        assertThat(normalizedMigration).contains("UPDATE signature SET created_at = signed_at WHERE created_at IS NULL");
    }

    private String readResource(String path) throws IOException {
        return new String(new ClassPathResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
