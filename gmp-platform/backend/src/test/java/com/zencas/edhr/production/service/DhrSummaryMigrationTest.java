package com.zencas.edhr.production.service;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class DhrSummaryMigrationTest {
    @Test
    void migrationDeclaresIndependentVersionedSummaryWorkspaceAndPermissions() throws Exception {
        String master = resource("/db/changelog/db.changelog-master.yaml");
        String migration = resource("/db/changelog/0092-dhr-summary-workspace.sql");
        String correction = resource("/db/changelog/0093-dhr-summary-version-review-binding.sql");

        assertThat(master).contains("db/changelog/0092-dhr-summary-workspace.sql");
        assertThat(master).contains("db/changelog/0093-dhr-summary-version-review-binding.sql");
        assertThat(migration)
                .contains("business_type IN ('CHANGE', 'OBSOLETE', 'DHR_SUMMARY')")
                .contains("CREATE TABLE dhr_summary_draft")
                .contains("CREATE TABLE dhr_summary_version")
                .contains("CREATE TABLE dhr_summary_evidence")
                .contains("CONSTRAINT uk_dhr_summary_draft_instance UNIQUE (tenant_id, dhr_instance_id)")
                .contains("CONSTRAINT uk_dhr_summary_version_no UNIQUE (tenant_id, dhr_instance_id, version_no)")
                .contains("CONSTRAINT uk_dhr_summary_evidence_source UNIQUE (tenant_id, summary_version_id, source_record_id)")
                .contains("CHECK (summary_status IN ('NOT_STARTED', 'DRAFT', 'PENDING_REVIEW', 'FORMALIZED'))")
                .contains("'records.dhr-summary', 'DHR汇总', 'PAGE', 'records.dhr-management'")
                .contains("'dhr.summaries.edit', 'DHR汇总编辑', 'BUTTON', 'records.dhr-summary'")
                .contains("'dhr.summaries.submit', 'DHR汇总提交', 'BUTTON', 'records.dhr-summary'")
                .contains("WHERE r.code = 'ADMIN'");
        assertThat(correction)
                .contains("CONSTRAINT ck_dhr_summary_version_review_binding")
                .contains("review_mode = 'NONE'")
                .contains("review_mode = 'REQUIRED'");
    }

    private String resource(String path) throws Exception {
        try (var stream = getClass().getResourceAsStream(path)) {
            assertThat(stream).as(path).isNotNull();
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
