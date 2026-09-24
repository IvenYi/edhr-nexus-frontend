package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.WorkflowInstance;
import com.zencas.edhr.workflow.repository.WorkflowInstanceRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.*;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import javax.sql.DataSource;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Domain actions with actual SQL and rollback, without mutating the development database. */
@SpringJUnitConfig(DhrReviewServiceTest.Config.class)
class DhrReviewServiceTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired DhrReviewService service;
    @Autowired DhrSummaryService summaries;
    @Autowired WorkflowEngine engine;
    @Autowired WorkflowInstanceRepository workflows;
    @Autowired ExecutionAccess access;
    @Autowired AuditEventRepository audits;
    @Autowired ObjectMapper mapper;
    WorkflowInstance workflow;

    @BeforeEach void setup() {
        reset(summaries, engine, workflows, access, audits);
        AuditContext.setOperator("7", "审核人");
        jdbc.execute("DROP ALL OBJECTS");
        jdbc.execute("CREATE TABLE dhr_instance(id BIGINT PRIMARY KEY,summary_status VARCHAR(32),tenant_id VARCHAR(32),dhr_no VARCHAR(64),object_no VARCHAR(64),object_type VARCHAR(32),work_order_no VARCHAR(64),product_name VARCHAR(64),updated_by VARCHAR(64),updated_at TIMESTAMP)");
        jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32),version_no INT,snapshot_hash VARCHAR(64),dhr_instance_id BIGINT,submitted_by VARCHAR(64),submitted_at TIMESTAMP)");
        jdbc.execute("CREATE TABLE dhr_summary_review(summary_version_id BIGINT PRIMARY KEY,workflow_instance_id BIGINT,status VARCHAR(32),updated_at TIMESTAMP)");
        jdbc.execute("CREATE TABLE workflow_node(id BIGINT PRIMARY KEY,name VARCHAR(64),properties TEXT)");
        jdbc.execute("CREATE TABLE workflow_task(id BIGINT PRIMARY KEY,instance_id BIGINT,node_id BIGINT,status VARCHAR(32),assignee_id VARCHAR(64),candidate_snapshot TEXT,opinion TEXT,action VARCHAR(32),created_at TIMESTAMP,completed_at TIMESTAMP)");
        jdbc.execute("CREATE TABLE dhr_summary_evidence(tenant_id VARCHAR(32),summary_version_id BIGINT,source_record_id BIGINT,source_snapshot TEXT)");
        jdbc.execute("CREATE TABLE form_instance_record(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32),snapshot_json TEXT,values_json TEXT,status VARCHAR(32),version_id BIGINT)");
        jdbc.update("INSERT INTO dhr_instance(id,tenant_id,summary_status,dhr_no,object_no,object_type,work_order_no,product_name) VALUES(1,'default','PENDING_REVIEW','DHR-1','B1','BATCH','W1','产品')");
        jdbc.update("INSERT INTO dhr_summary_version VALUES(2,'default',1,'hash',1,'提交人',CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO dhr_summary_review VALUES(2,3,'PENDING_REVIEW',CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO workflow_node VALUES(4,'质量审核','{}')");
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot,created_at) VALUES(5,3,4,'PENDING',NULL,'{\"userIds\":[\"7\"]}',CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO form_instance_record VALUES(10,'default','{\"name\":\"表单\"}','{\"temperature\":20}','COMPLETED',100)");
        jdbc.update("INSERT INTO dhr_summary_evidence VALUES('default',2,10,?)", "{\"id\":\"10\",\"instanceNo\":\"FR-10\",\"templateVersionId\":\"100\",\"status\":\"COMPLETED\",\"snapshot\":{\"name\":\"表单\"},\"fieldValues\":{\"temperature\":20}}");
        workflow = WorkflowInstance.builder().id(3L).businessType("DHR_SUMMARY").status("RUNNING").build();
        when(workflows.findByIdForUpdate(3L)).thenReturn(Optional.of(workflow));
        when(workflows.findById(3L)).thenReturn(Optional.of(workflow));
        when(summaries.version(1L, 2L)).thenAnswer(x -> mapper.createObjectNode());
    }
    @AfterEach void clear() { AuditContext.clear(); }
    ObjectNode command(String action) { return mapper.createObjectNode().put("action", action).put("expectedSnapshotHash", "hash").put("opinion", "已核对"); }

    @Test void personalListAndDetailCannotLeakAnotherUsersTask() {
        assertThat(service.list("PENDING", "B1", 0, 20).getTotalElements()).isEqualTo(1);
        AuditContext.setOperator("8", "其他人");
        assertThat(service.list("PENDING", "", 0, 20).getTotalElements()).isZero();
        assertThatThrownBy(() -> service.detail(5L)).isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> service.act(5L, command("APPROVE"))).isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(engine);
    }
    @Test void approvalRequiresUnchangedEvidenceAndCurrentHashButDoesNotAutoReturn() {
        assertThat(service.detail(5L).path("evidenceChanges").size()).isZero();
        assertThatThrownBy(() -> service.act(5L, command("APPROVE").put("expectedSnapshotHash", "old"))).hasMessageContaining("版本已变化");
        jdbc.update("UPDATE form_instance_record SET values_json='{\"temperature\":21}'");
        assertThat(service.detail(5L).path("evidenceChanges").size()).isEqualTo(1);
        assertThatThrownBy(() -> service.act(5L, command("APPROVE"))).hasMessageContaining("过时证据");
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("PENDING_REVIEW");
        verifyNoInteractions(engine);
        verify(summaries, never()).prepareNextDraft(anyLong(), anyLong(), anyString());
    }
    @Test void humanReturnAllowsChangedEvidenceAndCreatesNextDraftOnlyExplicitly() {
        jdbc.update("UPDATE form_instance_record SET status='VOIDED'");
        assertThatThrownBy(() -> service.act(5L, command("RETURN").put("opinion", " "))).hasMessageContaining("审批意见");
        ObjectNode response = service.act(5L, command("RETURN"));
        assertThat(response.path("outcome").asText()).isEqualTo("RETURNED");
        assertThat(response.path("evidenceChanges").size()).isEqualTo(1);
        verify(summaries).prepareNextDraft(1L, 2L, "已核对");
        verify(engine).completeDhrTask(5L, "REJECT", "已核对", "7", null);
        assertThat(jdbc.queryForObject("SELECT source_snapshot FROM dhr_summary_evidence", String.class)).contains("COMPLETED");
    }
    @Test void approvalSeparatesRuntimeOutcomeFromFrozenEvidenceAndRejectsSecondAction() {
        doAnswer(x -> { workflow.setStatus("COMPLETED"); return null; }).when(engine).completeDhrTask(anyLong(), eq("APPROVE"), anyString(), anyString(), isNull());
        assertThat(service.act(5L, command("APPROVE")).path("outcome").asText()).isEqualTo("APPROVED");
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("FORMALIZED");
        assertThat(jdbc.queryForObject("SELECT snapshot_hash FROM dhr_summary_version", String.class)).isEqualTo("hash");
        assertThatThrownBy(() -> service.act(5L, command("APPROVE"))).hasMessageContaining("已处理");
        verify(summaries, never()).prepareNextDraft(anyLong(), anyLong(), anyString());
    }
    @Test void intermediateApprovalKeepsPendingAndAuditFailureRollsBackOutcome() {
        assertThat(service.act(5L, command("APPROVE")).path("outcome").asText()).isEqualTo("PENDING_REVIEW");
        doAnswer(x -> { workflow.setStatus("COMPLETED"); return null; }).when(engine).completeDhrTask(anyLong(), anyString(), anyString(), anyString(), isNull());
        when(audits.save(any())).thenThrow(new IllegalStateException("audit unavailable"));
        assertThatThrownBy(() -> service.act(5L, command("APPROVE"))).hasMessageContaining("audit unavailable");
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("PENDING_REVIEW");
        assertThat(jdbc.queryForObject("SELECT status FROM dhr_summary_review", String.class)).isEqualTo("PENDING_REVIEW");
    }
    @Test void frozenButtonVisibilityOpinionAndSignatureAreEnforcedOnServer() {
        jdbc.update("UPDATE workflow_node SET properties=?", "{\"config\":{\"buttons\":[{\"action\":\"RETURN\",\"visible\":false},{\"action\":\"APPROVE\",\"requireOpinion\":true}],\"buttonEvents\":[{\"action\":\"APPROVE\",\"event\":\"BEFORE\",\"enabled\":true,\"signatureMethod\":\"ACCOUNT_PASSWORD\",\"builtin\":\"NONE\"}]}}");
        assertThat(service.detail(5L).path("buttons").size()).isEqualTo(1);
        assertThat(service.detail(5L).at("/buttons/0/requiresSignature").asBoolean()).isTrue();
        assertThatThrownBy(() -> service.act(5L, command("RETURN"))).hasMessageContaining("不支持");
        assertThatThrownBy(() -> service.act(5L, command("APPROVE").put("opinion", ""))).hasMessageContaining("审批意见");
        when(access.signTarget(eq("DHR_SUMMARY"), eq("2"), eq("5"), eq("APPROVE"), any(), eq("reviewer"), eq("password"))).thenReturn("77");
        service.act(5L, command("APPROVE").put("account", "reviewer").put("password", "password"));
        verify(engine).completeDhrTask(5L, "APPROVE", "已核对", "7", 77L);
    }
    @Test void missingRecordIsAffectedButNewUnselectedRecordsAreNot() {
        jdbc.update("INSERT INTO form_instance_record VALUES(11,'default','{}','{}','DRAFT',100)");
        assertThat(service.evidenceChanges(2L, false)).isEmpty();
        jdbc.update("DELETE FROM form_instance_record WHERE id=10");
        assertThat(service.evidenceChanges(2L, false).size()).isEqualTo(1);
    }
    @Configuration @EnableTransactionManagement static class Config {
        @Bean DataSource source() { return new DriverManagerDataSource("jdbc:h2:mem:dhr-review;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", ""); }
        @Bean JdbcTemplate jdbc(DataSource source) { return new JdbcTemplate(source); }
        @Bean PlatformTransactionManager transactions(DataSource source) { return new DataSourceTransactionManager(source); }
        @Bean ObjectMapper mapper() { return new ObjectMapper(); }
        @Bean DhrSummaryService summaries() { return mock(DhrSummaryService.class); }
        @Bean WorkflowEngine engine() { return mock(WorkflowEngine.class); }
        @Bean WorkflowInstanceRepository workflows() { return mock(WorkflowInstanceRepository.class); }
        @Bean ExecutionAccess access() { return mock(ExecutionAccess.class); }
        @Bean AuditEventRepository audits() { return mock(AuditEventRepository.class); }
        @Bean DhrReviewService service(JdbcTemplate jdbc, ObjectMapper mapper, DhrSummaryService summaries, WorkflowEngine engine, WorkflowInstanceRepository workflows, ExecutionAccess access, AuditEventRepository audits) { return new DhrReviewService(jdbc, mapper, summaries, engine, workflows, access, audits, new SnowflakeIdGenerator(2), new DhrEvidenceImpactService(jdbc, mapper)); }
    }
}
