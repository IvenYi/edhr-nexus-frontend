package com.zencas.edhr.common.config;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class CurrentDatabaseBaselineTest {
    @Test void productionResourcesContainOnlyCurrentSchemaAndRequiredSeed() throws Exception {
        Path root = Path.of("src/main/resources/db/changelog");
        try (var paths = Files.walk(root)) {
            assertThat(paths.filter(Files::isRegularFile).map(root::relativize).map(Path::toString).toList())
                .containsExactlyInAnyOrder("db.changelog-master.yaml",
                    "baseline/0001-current-schema.sql", "baseline/0002-current-seed.sql",
                    "0087-record-control.sql", "0088-record-change-menu-permissions.sql", "0089-record-control-dhr-linkage.sql");
        }
        String master = Files.readString(root.resolve("db.changelog-master.yaml"));
        assertThat(master).contains("0087-record-control.sql", "0088-record-change-menu-permissions.sql", "0089-record-control-dhr-linkage.sql");
        String schema = Files.readString(root.resolve("baseline/0001-current-schema.sql"));
        assertThat(schema).contains("CREATE TABLE public.signature", "snapshot_data text",
                "ck_signature_snapshot_data_json", "CREATE FUNCTION public.sync_deletion_form_references")
            .doesNotContain("NOT VALID", "validCheckSum", "work_form_process_reference_backfill_seq",
                "CREATE TABLE public.numbering_rule");
        String seed = Files.readString(root.resolve("baseline/0002-current-seed.sql"));
        assertThat(seed).doesNotContain("DELETE FROM", "UPDATE ", "INSERT INTO public.audit_event",
                "INSERT INTO public.form_template", "INSERT INTO public.production_object",
                "serialNumberText", "lookup_related_batch", "documentNumberText", "teamText");
    }
}
