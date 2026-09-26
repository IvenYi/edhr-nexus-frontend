package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.*;
import com.zencas.edhr.compliance.repository.*;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.SubjectResolver;
import com.zencas.edhr.workflow.engine.*;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import jakarta.persistence.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Real summary/workflow/signature/audit transaction chain. Only the DHR metadata projection is stubbed. */
@SpringBootTest(classes=DhrReviewLifecycleIntegrationTest.Config.class, webEnvironment=SpringBootTest.WebEnvironment.NONE, properties={
    "spring.liquibase.enabled=false", "spring.datasource.url=jdbc:h2:mem:dhr-lifecycle;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"})
class DhrReviewLifecycleIntegrationTest {
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired DhrSummaryService summaries;
    @Autowired DhrReviewService reviews;
    @Autowired DhrInstanceService instances;
    @Autowired PasswordEncoder passwords;

    @BeforeEach void seed() throws Exception {
        AuditContext.setOperator("7", "审核人");
        for (String table : new String[]{"dhr_summary_review", "dhr_summary_evidence", "dhr_summary_draft", "dhr_summary_version", "dhr_attachment", "dhr_instance", "production_object", "form_instance_record"}) jdbc.execute("DROP TABLE IF EXISTS " + table);
        for (String table : new String[]{"workflow_action_log", "workflow_task", "workflow_instance", "workflow_edge", "workflow_node", "workflow_definition_version", "workflow_definition", "audit_event", "signature", "user_account"}) jdbc.update("DELETE FROM " + table);
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(7,0,'reviewer','审核人',?,'ACTIVE')", passwords.encode("test-secret"));
        jdbc.update("INSERT INTO workflow_definition(id,type,business_type,name,code,status) VALUES(50,'RECORD_CONTROL','DHR_SUMMARY','审核','DHR-FLOW','ACTIVE')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES(51,50,1,'PUBLISHED',false,'[]','[]'),(52,50,2,'PUBLISHED',true,'[]','[]')");
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(100,51,'START','开始','{}'),(102,51,'END','结束','{}')");
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(101,51,'APPROVAL','质量审核',? FORMAT JSON)", "{\"config\":{\"buttonEvents\":[{\"event\":\"BEFORE\",\"action\":\"APPROVE\",\"enabled\":true,\"signatureMethod\":\"ACCOUNT_PASSWORD\",\"builtin\":\"NONE\"}]}}");
        jdbc.update("INSERT INTO workflow_edge(id,version_id,source_node_id,target_node_id) VALUES(110,51,100,101),(111,51,101,102)");
        jdbc.execute("CREATE TABLE dhr_instance(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32),production_object_id BIGINT,status VARCHAR(32),summary_status VARCHAR(32),dhr_review_mode VARCHAR(32),dhr_review_workflow_definition_id BIGINT,dhr_review_workflow_version_id BIGINT,directory_snapshot TEXT,dhr_no VARCHAR(64),object_no VARCHAR(64),object_type VARCHAR(32),work_order_no VARCHAR(64),product_name VARCHAR(64),updated_by VARCHAR(64),updated_at TIMESTAMP)");
        jdbc.execute("CREATE TABLE production_object(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32))");
        jdbc.execute("INSERT INTO production_object VALUES(10,'default')");
        jdbc.execute("CREATE TABLE form_instance_record(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32),source_type VARCHAR(32),object_id BIGINT,instance_no VARCHAR(64),snapshot_json TEXT,values_json TEXT,status VARCHAR(32),version_id BIGINT)");
        jdbc.execute("CREATE TABLE dhr_attachment(id BIGINT PRIMARY KEY,tenant_id VARCHAR(32),dhr_instance_id BIGINT,active BOOLEAN,sha256 VARCHAR(64),verification_status VARCHAR(32),stored_path VARCHAR(1024))");
        String base = "{\"directories\":[{\"id\":10,\"name\":\"目录\",\"items\":[{\"id\":20,\"required\":true}]}]}";
        jdbc.update("INSERT INTO dhr_instance(id,tenant_id,production_object_id,status,summary_status,dhr_review_mode,dhr_review_workflow_definition_id,dhr_review_workflow_version_id,directory_snapshot,dhr_no,object_no,object_type,work_order_no,product_name) VALUES(1,'default',10,'COMPLETED','NOT_STARTED','REQUIRED',50,51,?,'DHR-1','B1','BATCH','WO1','产品')", base);
        jdbc.update("INSERT INTO form_instance_record VALUES(200,'default','PRODUCTION_EXECUTION',10,'FR-200','{\"dhrItemId\":\"20\"}','{\"temperature\":20}','COMPLETED',5)");
        try (var stream = getClass().getResourceAsStream("/db/changelog/0092-dhr-summary-workspace.sql")) {
            for (String sql : new String(stream.readAllBytes(), StandardCharsets.UTF_8).split(";")) if (sql.contains("CREATE TABLE") || sql.contains("CREATE INDEX")) jdbc.execute(sql);
        }
        for (String migration : new String[]{"0100-dhr-summary-evidence-order.sql", "0101-dhr-summary-evidence-display-name.sql", "0102-dhr-summary-complete-evidence.sql", "0103-dhr-controlled-attachments.sql"}) {
            try (var stream = getClass().getResourceAsStream("/db/changelog/" + migration)) {
                for (String sql : new String(stream.readAllBytes(), StandardCharsets.UTF_8).split(";")) if (sql.contains("ALTER TABLE")) jdbc.execute(sql);
            }
        }
        try (var stream = getClass().getResourceAsStream("/db/changelog/0097-dhr-review-workbench.sql")) {
            jdbc.execute(new String(stream.readAllBytes(), StandardCharsets.UTF_8).split(";")[0]);
        }
        when(instances.detail(1L)).thenAnswer(x -> {
            ObjectNode result = mapper.createObjectNode().put("id", "1");
            ObjectNode directory = (ObjectNode) mapper.readTree(base);
            var row = jdbc.queryForMap("SELECT snapshot_json,values_json,status FROM form_instance_record WHERE id=200");
            ObjectNode record = mapper.createObjectNode().put("id", "200").put("originKind", "DIRECTORY").put("instanceNo", "FR-200").put("templateVersionId", "5").put("status", row.get("status").toString());
            record.set("snapshot", mapper.readTree(row.get("snapshot_json").toString()));
            record.set("fieldValues", mapper.readTree(row.get("values_json").toString()));
            ((ObjectNode) directory.at("/directories/0/items/0")).putArray("records").add(record);
            result.set("directorySnapshot", directory);
            result.putObject("recordsByOrigin").putArray("directory").add(record);
            return result;
        });
    }
    @AfterEach void clear() { AuditContext.clear(); }
    ObjectNode submit() {
        ObjectNode request = mapper.createObjectNode().put("expectedScopeHash", summaries.workspace(1L).path("sourceScopeHash").asText());
        request.putArray("overlayDirectories"); request.putArray("placements");
        var drafts = jdbc.queryForList("SELECT id,revision FROM dhr_summary_draft");
        if (!drafts.isEmpty()) request.put("draftId", drafts.getFirst().get("id").toString()).put("revision", ((Number) drafts.getFirst().get("revision")).intValue());
        ObjectNode draft = summaries.saveDraft(1L, request);
        ObjectNode command = mapper.createObjectNode().put("expectedDraftId", draft.path("id").asText()).put("expectedRevision", draft.path("revision").asInt());
        command.putObject("manualReview").put("qualityAndExceptionsReviewed", true)
                .put("sourceSignaturesReviewed", true).put("completeScopeReviewed", true)
                .put("note", "已核对质量结论、异常处置及源签署");
        return summaries.submit(1L, command);
    }
    @Test void realWorkflowReturnResubmitSignAndApprovedImpactPreserveHistory() {
        ObjectNode first = submit();
        Long taskId = jdbc.queryForObject("SELECT id FROM workflow_task", Long.class);
        assertThat(jdbc.queryForObject("SELECT version_id FROM workflow_instance", Long.class)).isEqualTo(51L);
        assertThat(reviews.list("PENDING", "", 0, 20).getTotalElements()).isEqualTo(1);
        ObjectNode command = mapper.createObjectNode().put("expectedSnapshotHash", first.path("snapshotHash").asText()).put("action", "RETURN").put("opinion", "需补充核对");
        reviews.act(taskId, command);
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("DRAFT");
        assertThat(jdbc.queryForObject("SELECT status FROM dhr_summary_review", String.class)).isEqualTo("RETURNED");
        ObjectNode second = submit();
        Long nextTask = jdbc.queryForObject("SELECT id FROM workflow_task WHERE status='PENDING'", Long.class);
        command.put("expectedSnapshotHash", second.path("snapshotHash").asText()).put("action", "APPROVE").put("account", "reviewer").put("password", "wrong");
        ObjectNode approvalCommand = command;
        assertThatThrownBy(() -> reviews.act(nextTask, approvalCommand)).hasMessageContaining("密码");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature", Integer.class)).isZero();
        command.put("password", "test-secret");
        reviews.act(nextTask, command);
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("FORMALIZED");
        assertThat(jdbc.queryForObject("SELECT status FROM dhr_summary_review WHERE summary_version_id=?", String.class, second.path("id").asLong())).isEqualTo("APPROVED");
        assertThat(jdbc.queryForObject("SELECT snapshot_data FROM signature", String.class)).contains(second.path("snapshotHash").asText());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event WHERE entity_type='DHR_SUMMARY_REVIEW'", Integer.class)).isEqualTo(2);
        assertThat(summaries.audit(1L, 0).path("events").toString()).contains("DHR_SUMMARY_DRAFT", "DHR_SUMMARY_VERSION", "DHR_SUMMARY_REVIEW");
        assertThat(reviews.list("DONE", "", 0, 20).getTotalElements()).isEqualTo(2);
        String original = jdbc.queryForObject("SELECT candidate_snapshot FROM dhr_summary_version WHERE id=?", String.class, second.path("id").asLong());
        jdbc.update("UPDATE form_instance_record SET values_json='{\"temperature\":21}'");
        var historical = summaries.version(1L, second.path("id").asLong());
        assertThat(historical.path("evidenceChanges").size()).isEqualTo(1);
        assertThat(historical.at("/version/reviewOutcome").asText()).isEqualTo("APPROVED");
        assertThat(jdbc.queryForObject("SELECT candidate_snapshot FROM dhr_summary_version WHERE id=?", String.class, second.path("id").asLong())).isEqualTo(original);
    }
    @Test void concurrentApprovalCreatesOnlyOneOutcomeAndSignature() throws Exception {
        var submitted = submit();
        Long taskId = jdbc.queryForObject("SELECT id FROM workflow_task", Long.class);
        ObjectNode command = mapper.createObjectNode().put("expectedSnapshotHash", submitted.path("snapshotHash").asText())
                .put("action", "APPROVE").put("opinion", "已核对").put("account", "reviewer").put("password", "test-secret");
        var start = new java.util.concurrent.CountDownLatch(1);
        try (var executor = java.util.concurrent.Executors.newFixedThreadPool(2)) {
            java.util.concurrent.Callable<Boolean> approve = () -> {
                AuditContext.setOperator("7", "审核人");
                try { start.await(); reviews.act(taskId, command.deepCopy()); return true; }
                catch (com.zencas.edhr.common.exception.BusinessException expected) { assertThat(expected.getMessage()).contains("已处理"); return false; }
                finally { AuditContext.clear(); }
            };
            var first = executor.submit(approve); var second = executor.submit(approve); start.countDown();
            assertThat(java.util.List.of(first.get(10, java.util.concurrent.TimeUnit.SECONDS), second.get(10, java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(true, false);
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event WHERE entity_type='DHR_SUMMARY_REVIEW'", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT status FROM dhr_summary_review", String.class)).isEqualTo("APPROVED");
    }
    @Test void newlyAppearingRecordAndAttachmentBlockApprovalWithoutChangingFrozenVersion() {
        ObjectNode submitted = submit();
        Long taskId = jdbc.queryForObject("SELECT id FROM workflow_task WHERE status='PENDING'", Long.class);
        String frozen = jdbc.queryForObject("SELECT candidate_snapshot FROM dhr_summary_version WHERE id=?", String.class, submitted.path("id").asLong());
        jdbc.update("INSERT INTO form_instance_record VALUES(201,'default','PRODUCTION_EXECUTION',10,'FR-201','{}','{}','COMPLETED',5)");
        jdbc.update("INSERT INTO dhr_attachment VALUES(301,'default',1,TRUE,'digest','VERIFIED','/missing')");
        var changes = reviews.detail(taskId).path("evidenceChanges");
        assertThat(changes.size()).isEqualTo(2);
        assertThat(changes.toString()).contains("FR-201", "301");
        ObjectNode command = mapper.createObjectNode().put("expectedSnapshotHash", submitted.path("snapshotHash").asText())
                .put("action", "APPROVE").put("account", "reviewer").put("password", "test-secret");
        assertThatThrownBy(() -> reviews.act(taskId, command)).hasMessageContaining("不能按过时证据批准");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT candidate_snapshot FROM dhr_summary_version WHERE id=?", String.class, submitted.path("id").asLong())).isEqualTo(frozen);
        command.put("action", "RETURN").put("opinion", "核对新增来源");
        reviews.act(taskId, command);
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("DRAFT");
    }
    @Test void incompleteFrozenManualReviewBlocksApprovalButAllowsReturn() throws Exception {
        ObjectNode submitted = submit();
        Long versionId = submitted.path("id").asLong();
        Long taskId = jdbc.queryForObject("SELECT id FROM workflow_task WHERE status='PENDING'", Long.class);
        String original = jdbc.queryForObject("SELECT check_result_snapshot FROM dhr_summary_version WHERE id=?", String.class, versionId);
        ObjectNode command = mapper.createObjectNode().put("expectedSnapshotHash", submitted.path("snapshotHash").asText())
                .put("action", "APPROVE").put("opinion", "已核对").put("account", "reviewer").put("password", "test-secret");
        for (String missing : new String[]{"confirmedBy", "confirmedAt", "note"}) {
            ObjectNode check = (ObjectNode) mapper.readTree(original);
            ((ObjectNode) check.path("manualReview")).remove(missing);
            jdbc.update("UPDATE dhr_summary_version SET check_result_snapshot=? WHERE id=?", check.toString(), versionId);
            assertThatThrownBy(() -> reviews.act(taskId, command)).hasMessageContaining("核查结果不完整");
        }
        jdbc.update("UPDATE dhr_summary_version SET check_result_snapshot=NULL WHERE id=?", versionId);
        assertThatThrownBy(() -> reviews.act(taskId, command)).hasMessageContaining("核查结果不完整");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("PENDING_REVIEW");
        reviews.act(taskId, command.put("action", "RETURN").put("opinion", "核查信息缺失，退回整理"));
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("DRAFT");
    }
    @Configuration(proxyBeanMethods=false) @EnableAutoConfiguration(exclude=JpaRepositoriesAutoConfiguration.class)
    @Import({WorkflowEngine.class, DhrSummaryService.class, DhrReviewService.class, DhrEvidenceImpactService.class, ExecutionAccess.class})
    static class Config {
        @Bean EntityManager em(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes types() { return PersistenceManagedTypes.of(WorkflowDefinition.class.getName(), WorkflowDefinitionVersion.class.getName(), WorkflowNode.class.getName(), WorkflowEdge.class.getName(), WorkflowInstance.class.getName(), WorkflowTask.class.getName(), WorkflowActionLog.class.getName(), UserAccount.class.getName(), Signature.class.getName(), AuditEvent.class.getName()); }
        @Bean DhrInstanceService instances() { return mock(DhrInstanceService.class); }
        @Bean DhrAttachmentService attachments(ObjectMapper mapper) {
            DhrAttachmentService service = mock(DhrAttachmentService.class);
            when(service.snapshot(anyLong())).thenAnswer(ignored -> mapper.createArrayNode());
            return service;
        }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(4); }
        @Bean PasswordEncoder passwords() { return new BCryptPasswordEncoder(4); }
        @Bean SubjectResolver subjects() { return mock(SubjectResolver.class); }
        @Bean StateMachineService states() { return mock(StateMachineService.class); }
        @Bean WorkflowBindingRuleRepository bindings() { return mock(WorkflowBindingRuleRepository.class); }
        @Bean WorkflowDefinitionRepository definitions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowDefinitionRepository.class); }
        @Bean WorkflowDefinitionVersionRepository versions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowDefinitionVersionRepository.class); }
        @Bean WorkflowNodeRepository nodes(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowNodeRepository.class); }
        @Bean WorkflowEdgeRepository edges(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowEdgeRepository.class); }
        @Bean WorkflowInstanceRepository workflows(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowInstanceRepository.class); }
        @Bean WorkflowTaskRepository tasks(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowTaskRepository.class); }
        @Bean WorkflowActionLogRepository logs(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowActionLogRepository.class); }
        @Bean UserAccountRepository users(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(UserAccountRepository.class); }
        @Bean SignatureRepository signatures(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(SignatureRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
    }
}
