package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import static org.assertj.core.api.Assertions.assertThat;

class DhrArchiveLayoutReaderTest {
    private final JdbcTemplate jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:dhr-layout;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", ""));
    private final ObjectMapper mapper = new ObjectMapper();
    @BeforeEach void setup() {
        jdbc.execute("DROP ALL OBJECTS");
        jdbc.execute("CREATE TABLE dhr_instance(id BIGINT,tenant_id VARCHAR,production_object_id BIGINT)");
        jdbc.execute("CREATE TABLE dhr_summary_draft(tenant_id VARCHAR,dhr_instance_id BIGINT,overlay_directory_json TEXT,evidence_placement_json TEXT)");
        jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT,tenant_id VARCHAR,dhr_instance_id BIGINT,version_no INT,overlay_directory_snapshot TEXT)");
        jdbc.execute("CREATE TABLE dhr_summary_evidence(id BIGINT,tenant_id VARCHAR,summary_version_id BIGINT,source_record_id BIGINT,target_node_key VARCHAR,before_node_key VARCHAR,display_order INT,display_name VARCHAR)");
        jdbc.execute("CREATE TABLE form_instance_record(id BIGINT,tenant_id VARCHAR,object_id BIGINT,source_type VARCHAR,operation_id VARCHAR,form_id VARCHAR,copy_id VARCHAR)");
        jdbc.update("INSERT INTO dhr_instance VALUES(1,'default',2)");
        jdbc.update("INSERT INTO dhr_summary_draft VALUES('default',1,'[]','[{\"recordId\":\"100\",\"targetNodeKey\":\"base-dir-10\"}]')");
        jdbc.update("INSERT INTO form_instance_record VALUES(100,'default',2,'PRODUCTION_EXECUTION','op','form','copy'),(101,'other',2,'PRODUCTION_EXECUTION','op','form','copy'),(102,'default',3,'PRODUCTION_EXECUTION','op','form','copy')");
    }
    @Test void draftReturnsSavedLayoutAndScopedExecutionIdentityWithoutWrites() {
        var result = DhrArchiveLayoutReader.read(jdbc, mapper, 1L, "DRAFT");
        assertThat(result.at("/placements/0/targetNodeKey").asText()).isEqualTo("base-dir-10");
        assertThat(result.path("recordRefs").size()).isEqualTo(1);
        assertThat(result.at("/recordRefs/0/id").asText()).isEqualTo("100");
        assertThat(result.at("/recordRefs/0/copyId").asText()).isEqualTo("copy");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM form_instance_record", Integer.class)).isEqualTo(3);
    }
    @Test void submittedLayoutUsesLatestVersionNotDraftOrOtherTenant() {
        jdbc.update("INSERT INTO dhr_summary_version VALUES(20,'default',1,1,'[]'),(21,'default',1,2,'[]'),(22,'other',1,3,'[]')");
        jdbc.update("INSERT INTO dhr_summary_evidence VALUES(1,'default',20,100,'old',NULL,NULL,NULL),(2,'default',21,100,'frozen','base-item-3',4,'别名'),(3,'other',21,101,'wrong',NULL,NULL,NULL)");
        for (String status : new String[]{"PENDING_REVIEW", "FORMALIZED"}) {
            var result = DhrArchiveLayoutReader.read(jdbc, mapper, 1L, status);
            assertThat(result.path("placements").size()).isEqualTo(1);
            assertThat(result.at("/placements/0/targetNodeKey").asText()).isEqualTo("frozen");
            assertThat(result.at("/placements/0/displayName").asText()).isEqualTo("别名");
            assertThat(result.at("/placements/0/displayOrder").asInt()).isEqualTo(4);
        }
    }
    @Test void unstartedLayoutDoesNotReadStaleDraft() {
        var result = DhrArchiveLayoutReader.read(jdbc, mapper, 1L, "NOT_STARTED");
        assertThat(result.path("placements").isEmpty()).isTrue();
        assertThat(result.path("recordRefs").isEmpty()).isTrue();
    }
}
