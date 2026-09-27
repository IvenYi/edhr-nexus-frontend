package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class DhrAuditReadTest {
    JdbcTemplate jdbc;
    DhrSummaryService service;
    DhrInstanceService instances;
    @BeforeEach void setup() {
        jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:dhr-audit;MODE=PostgreSQL;DB_CLOSE_DELAY=-1", "sa", ""));
        jdbc.execute("DROP ALL OBJECTS");
        jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT PRIMARY KEY,tenant_id VARCHAR,dhr_instance_id BIGINT)");
        jdbc.execute("CREATE TABLE audit_event(id BIGINT PRIMARY KEY,tenant_id VARCHAR,entity_type VARCHAR,entity_id VARCHAR,data_summary VARCHAR,action VARCHAR,function_name VARCHAR,operator_name VARCHAR,operator_account VARCHAR,created_at TIMESTAMP,reason VARCHAR,content_before TEXT,content_after TEXT)");
        jdbc.update("INSERT INTO dhr_summary_version VALUES (10,'default',1),(11,'default',1),(20,'default',2),(30,'other',1)");
        instances = mock(DhrInstanceService.class);
        service = new DhrSummaryService(jdbc, new ObjectMapper(), instances, mock(AuditEventRepository.class), new SnowflakeIdGenerator(1), mock(WorkflowEngine.class), mock(DhrEvidenceImpactService.class), mock(DhrAttachmentService.class));
    }
    void event(long id, String tenant, String type, String entity, String summary) {
        jdbc.update("INSERT INTO audit_event VALUES (?,?,?,?,?,'UPDATE','测试操作',NULL,'operator',TIMESTAMP '2026-09-27 10:00:00','原因',NULL,'{\"status\":\"FORMALIZED\"}')", id, tenant, type, entity, summary);
    }
    @Test void dhrAuditIncludesOnlyItsLifecycleDraftAttachmentsAndVersions() {
        event(1,"default","DHR_INSTANCE","1",null);
        event(2,"default","DHR_SUMMARY_DRAFT","100","1");
        event(3,"default","DHR_ATTACHMENT","200","1");
        event(4,"default","DHR_SUMMARY_VERSION","10",null);
        event(5,"default","DHR_SUMMARY_REVIEW","10",null);
        event(6,"default","DHR_SUMMARY_EXPORT","11",null);
        event(7,"default","DHR_SUMMARY_VERSION","20","1");
        event(8,"other","DHR_INSTANCE","1",null);
        event(9,"default","PRODUCTION_EXECUTION","1",null);
        var result = service.audit(1L, -1);
        assertThat(result.path("total").asInt()).isEqualTo(6);
        assertThat(result.path("page").asInt()).isZero();
        assertThat(result.path("events").get(0).path("id").asText()).isEqualTo("6");
        assertThat(result.path("events").get(0).path("operator").asText()).isEqualTo("operator");
        assertThat(result.path("events").get(0).path("after").asText()).isEqualTo("{\"status\":\"FORMALIZED\"}");
        verify(instances).detail(1L);
    }
    @Test void removedDevelopmentSummaryAuditRemainsVisibleWithoutCrossDhrLeak() {
        event(1,"default","DHR_SUMMARY_VERSION","999","1");
        event(2,"default","DHR_SUMMARY_VERSION","998","2");
        event(3,"other","DHR_SUMMARY_VERSION","997","1");
        event(4,"default","DHR_SUMMARY_VERSION","20","1");
        assertThat(service.audit(1L,0).path("events").size()).isEqualTo(1);
        assertThat(service.audit(1L,0).at("/events/0/id").asText()).isEqualTo("1");
    }
    @Test void versionAuditDoesNotLeakOtherVersionsOrDraftsAndRejectsMismatchedDhr() {
        event(1,"default","DHR_SUMMARY_VERSION","10",null);
        event(2,"default","DHR_SUMMARY_REVIEW","10",null);
        event(3,"default","DHR_SUMMARY_EXPORT","10",null);
        event(4,"default","DHR_SUMMARY_VERSION","11",null);
        event(5,"default","DHR_SUMMARY_DRAFT","10","1");
        event(6,"other","DHR_SUMMARY_REVIEW","10",null);
        assertThat(service.versionAudit(1L,10L,0).path("total").asInt()).isEqualTo(3);
        assertThatThrownBy(() -> service.versionAudit(2L,10L,0)).hasMessageContaining("版本不存在");
        assertThatThrownBy(() -> service.versionAudit(1L,30L,0)).hasMessageContaining("版本不存在");
        assertThat(service.versionAudit(1L,11L,0).path("events").size()).isEqualTo(1);
    }
    @Test void paginationIsStableAndDoesNotRewriteAuditEvidence() {
        for (int i=1;i<=51;i++) event(i,"default","DHR_SUMMARY_REVIEW","10",null);
        var first=service.versionAudit(1L,10L,0); var second=service.versionAudit(1L,10L,1);
        assertThat(first.path("events").size()).isEqualTo(50);
        assertThat(first.path("events").get(49).path("id").asText()).isEqualTo("2");
        assertThat(second.path("total").asInt()).isEqualTo(51);
        assertThat(second.path("events").get(0).path("id").asText()).isEqualTo("1");
        assertThat(service.versionAudit(1L,10L,2).path("events").isEmpty()).isTrue();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event",Integer.class)).isEqualTo(51);
    }
}
