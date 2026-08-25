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

    @Test
    void documentVersionCodeMigrationMovesCodesOffTheDocumentMaster() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0051-document-version-code.sql");

        assertThat(master).contains("0051-document-version-code.sql");
        assertThat(migration).contains("ALTER TABLE document_version ADD COLUMN IF NOT EXISTS code");
        assertThat(migration).contains("ROW_NUMBER() OVER");
        assertThat(migration).contains("version.code || '-' || version.id");
        assertThat(migration).contains("uk_document_version_code");
        assertThat(migration).contains("ALTER TABLE sop_document ALTER COLUMN code DROP NOT NULL");
        assertThat(migration).contains("UPDATE sop_document SET code = NULL");
    }

    @Test
    void productionWorkMigrationRenamesTheCustomerVisibleWorkflowPermission() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0055-rename-transaction-template-to-work.sql");

        assertThat(master).contains("0055-rename-transaction-template-to-work.sql");
        assertThat(migration).contains("workflow.work-templates");
        assertThat(migration).contains("作业模板");
        assertThat(migration).contains("workflow.txn-templates");
    }

    @Test
    void productionWorkTypeMigrationRemovesTheLegacyTransactionType() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0056-workflow-definition-work-type.sql");

        assertThat(master).contains("0056-workflow-definition-work-type.sql");
        assertThat(migration).contains("SET type = 'WORK'");
        assertThat(migration).contains("WHERE type = 'TRANSACTION'");
    }

    @Test
    void workApplicabilityPriorityMigrationNormalizesExistingProductionWorkRules() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0058-work-applicability-priority.sql");

        assertThat(master).contains("0058-work-applicability-priority.sql");
        assertThat(migration).contains("WHEN 'EXCEPTION' THEN 30");
        assertThat(migration).contains("WHEN 'SCOPED' THEN 20");
        assertThat(migration).contains("WHEN 'GLOBAL' THEN 10");
        assertThat(migration).contains("WHERE business_type = 'WORK'");
    }

    @Test
    void workAuditBaselineMigrationPreservesLegacyHistoryWithoutFakingUserCreation() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0059-work-template-audit-baseline.sql");

        assertThat(master).contains("0059-work-template-audit-baseline.sql");
        assertThat(migration).contains("SET is_active = TRUE");
        assertThat(migration).contains("'PRODUCTION_WORK_TEMPLATE'");
        assertThat(migration).contains("'BASELINE'");
        assertThat(migration).contains("'SYSTEM'");
        assertThat(migration).contains("历史审计基线");
        assertThat(migration).contains("NOT EXISTS");
    }

    @Test
    void workTemplateVersionIntegrityMigrationPreventsOrphansAndMultipleDrafts() throws IOException {
        String master = readResource("db/changelog/db.changelog-master.yaml");
        String migration = readResource("db/changelog/0060-work-template-version-integrity.sql");

        assertThat(master).contains("0060-work-template-version-integrity.sql");
        assertThat(migration).contains("uk_workflow_definition_version_one_draft");
        assertThat(migration).contains("WHERE status = 'DRAFT'");
        assertThat(migration).contains("FOREIGN KEY (definition_id)");
        assertThat(migration).contains("ON DELETE RESTRICT");
    }

    private String readResource(String path) throws IOException {
        return new String(new ClassPathResource(path).getInputStream().readAllBytes(), StandardCharsets.UTF_8);
    }
}
