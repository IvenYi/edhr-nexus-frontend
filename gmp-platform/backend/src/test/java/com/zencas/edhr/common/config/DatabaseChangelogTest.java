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

    @Test
    void dhrVersionMetadataMigrationMovesTheBusinessCodeFromParentToVersion() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0043-dhr-template-version-metadata.sql");
        String normalizedMigration = migration.replaceAll("\\s+", " ");

        assertThat(master).contains("0043-dhr-template-version-metadata.sql");
        assertThat(normalizedMigration).contains("ADD COLUMN IF NOT EXISTS version_label VARCHAR(64)");
        assertThat(normalizedMigration).contains("ADD COLUMN IF NOT EXISTS code VARCHAR(64)");
        assertThat(normalizedMigration).contains("ALTER TABLE dhr_template ALTER COLUMN code DROP NOT NULL");
        assertThat(migration).contains("DROP INDEX IF EXISTS uk_dhr_code");
        assertThat(migration).contains("uk_dhr_template_version_code");
    }

    @Test
    void productModelingMigrationIsIncludedAndKeepsProductDataAsTheSourceOfTruth() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0044-product-process-modeling.sql");

        assertThat(master).contains("0044-product-process-modeling.sql");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS product_process");
        assertThat(migration).contains("product_version_id BIGINT NOT NULL");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS product_process_version");
        assertThat(migration).contains("product_process_operation_form_binding");
        assertThat(migration).contains("product_process_operation_sop_binding");
    }

    @Test
    void documentVersionMigrationPreservesExistingSopRecordsAndUsesVersionLevelBindings() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0045-document-management-versions.sql");

        assertThat(master).contains("0045-document-management-versions.sql");
        assertThat(migration).contains("ADD COLUMN IF NOT EXISTS document_type");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS document_version");
        assertThat(migration).contains("INSERT INTO document_version");
        assertThat(migration).contains("product_process_operation_document_binding");
        assertThat(migration).contains("document_version_id BIGINT NOT NULL");
    }

    @Test
    void productModelingDoesNotPersistUnsupportedReleaseForms() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0046-remove-product-process-release-form.sql");

        assertThat(master).contains("0046-remove-product-process-release-form.sql");
        assertThat(migration).contains("DROP COLUMN IF EXISTS release_form_template_id");
    }

    @Test
    void documentCategoryMigrationSeedsProtectedCategoriesAndKeepsUncategorizedVirtual() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0048-document-categories.sql");

        assertThat(master).contains("0048-document-categories.sql");
        assertThat(migration).contains("CREATE TABLE IF NOT EXISTS document_category");
        assertThat(migration).contains("LOWER(name)");
        assertThat(migration).contains("'SOP', TRUE");
        assertThat(migration).contains("'SIP', TRUE");
        assertThat(migration).contains("SET category_id = NULL");
    }

    private String readResource(String path) throws IOException {
        return new String(new ClassPathResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
