package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.*;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import javax.sql.DataSource;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringJUnitConfig(DhrFillingServiceTest.Config.class)
class DhrFillingServiceTest {
    @Autowired DhrFillingService service;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired ProductionExecutionEngine engine;
    @Autowired ProductionExecutionService executions;
    @Autowired AuditEventRepository audits;
    @BeforeEach void setup() throws Exception {
        reset(engine, executions, audits);
        AuditContext.setOperator("7", "填报人");
        jdbc.execute("DROP ALL OBJECTS");
        jdbc.execute("CREATE TABLE work_order(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32))");
        jdbc.execute("CREATE TABLE production_object(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32),work_order_id BIGINT,status VARCHAR(32))");
        jdbc.execute("CREATE TABLE dhr_instance(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32),production_object_id BIGINT,summary_status VARCHAR(32),directory_snapshot TEXT)");
        jdbc.execute("CREATE TABLE production_execution(object_id BIGINT PRIMARY KEY,snapshot_json TEXT,state_json TEXT,revision BIGINT,updated_at TIMESTAMP)");
        jdbc.update("INSERT INTO work_order VALUES(1,'default')");
        jdbc.update("INSERT INTO production_object VALUES(2,'default',1,'COMPLETED')");
        jdbc.update("INSERT INTO dhr_instance VALUES(3,'default',2,'FORMALIZED','{\"directories\":[]}')");
        jdbc.update("INSERT INTO production_execution VALUES(2,'{\"operations\":[]}','{\"operations\":{}}',1,CURRENT_TIMESTAMP)");
        when(executions.get(2L)).thenAnswer(x -> mapper.createObjectNode().put("objectStatus", "COMPLETED").set("snapshot", mapper.readTree("{\"operations\":[]}")));
        doAnswer(x -> { ((ObjectNode) x.getArgument(1)).put("testNewCopy", (String) x.getArgument(4)); return null; }).when(engine).createSupplement(any(), any(), anyString(), anyString(), anyString(), anyString(), anyString(), anyString());
    }
    @AfterEach void clear() { AuditContext.clear(); }
    ObjectNode request() { return mapper.createObjectNode().put("revision", 1).put("operationId", "op").put("formId", "f").put("reason", "遗漏的实际记录").put("occurredAt", "2026-01-01T10:00:00"); }
    @Test void supplementChangesExecutionRevisionButNeverProductionOrFormalizedStatus() {
        var result = service.supplement(3L, request());
        assertThat(result.path("createdCopyId").asText()).startsWith("dhr-copy-");
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution", Long.class)).isEqualTo(2L);
        assertThat(jdbc.queryForObject("SELECT status FROM production_object", String.class)).isEqualTo("COMPLETED");
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("FORMALIZED");
        verify(audits).save(argThat(a -> a.getContentBefore().contains("operations") && a.getContentAfter().contains("testNewCopy") && a.getReason().equals("遗漏的实际记录")));
        assertThatThrownBy(() -> service.supplement(3L, request())).hasMessageContaining("已更新");
    }
    @Test void rejectsReviewInProgressMissingReasonFutureTimestampAndUnknownDhr() {
        assertThatThrownBy(() -> service.supplement(999L, request())).hasMessageContaining("不能手工补建");
        assertThatThrownBy(() -> service.supplement(3L, request().put("reason", " "))).hasMessageContaining("补录原因");
        assertThatThrownBy(() -> service.supplement(3L, request().put("occurredAt", "2999-01-01T00:00:00"))).hasMessageContaining("不能晚于");
        jdbc.update("UPDATE dhr_instance SET summary_status='PENDING_REVIEW'");
        assertThatThrownBy(() -> service.supplement(3L, request())).hasMessageContaining("审核中");
        verifyNoInteractions(engine, audits);
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution", Long.class)).isEqualTo(1L);
    }
    @Test void auditFailureRollsBackNewCopyAndRevision() {
        when(audits.save(any())).thenThrow(new IllegalStateException("audit unavailable"));
        assertThatThrownBy(() -> service.supplement(3L, request())).hasMessageContaining("audit unavailable");
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution", Long.class)).isEqualTo(1L);
        assertThat(jdbc.queryForObject("SELECT state_json FROM production_execution", String.class)).doesNotContain("testNewCopy");
    }
    @Configuration @EnableTransactionManagement static class Config {
        @Bean DataSource source() { return new DriverManagerDataSource("jdbc:h2:mem:dhr-filling;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", ""); }
        @Bean JdbcTemplate jdbc(DataSource source) { return new JdbcTemplate(source); }
        @Bean PlatformTransactionManager transactions(DataSource source) { return new DataSourceTransactionManager(source); }
        @Bean ObjectMapper mapper() { return new ObjectMapper(); }
        @Bean ProductionExecutionService executions() { return mock(ProductionExecutionService.class); }
        @Bean ProductionExecutionEngine engine() { return mock(ProductionExecutionEngine.class); }
        @Bean FormInstanceRecordService records() { return mock(FormInstanceRecordService.class); }
        @Bean AuditEventRepository audits() { return mock(AuditEventRepository.class); }
        @Bean DhrFillingService service(JdbcTemplate jdbc, ObjectMapper mapper, ProductionExecutionService executions, ProductionExecutionEngine engine, FormInstanceRecordService records, AuditEventRepository audits) { return new DhrFillingService(jdbc, mapper, executions, engine, records, audits, new SnowflakeIdGenerator(3)); }
    }
}
