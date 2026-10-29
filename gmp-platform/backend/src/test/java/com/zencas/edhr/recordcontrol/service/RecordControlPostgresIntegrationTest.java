package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.production.service.FormInstanceRecordService;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.*;

/** Full application services on an explicitly disposable PostgreSQL database. */
@EnabledIfEnvironmentVariable(named = "RECORD_CONTROL_TEST_DATABASE_URL",
        matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_record_control_test_[a-z0-9_]+")
@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.liquibase.enabled=true"})
class RecordControlPostgresIntegrationTest {
    @DynamicPropertySource static void database(DynamicPropertyRegistry properties) {
        String url = System.getenv("RECORD_CONTROL_TEST_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_record_control_test_[a-z0-9_]+"))
            throw new IllegalStateException("A disposable record-control test database is required");
        properties.add("spring.datasource.url", () -> url);
        properties.add("spring.datasource.username", () -> System.getenv("PGUSER"));
        properties.add("spring.datasource.password", () -> "");
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired PasswordEncoder passwords;
    @Autowired FormInstanceRecordService records;
    @Autowired RecordControlService requests;
    @Autowired com.zencas.edhr.workflow.service.WorkflowResponsibilityService responsibility;
    @Autowired com.zencas.edhr.workflow.service.WorkflowOperationsQuery operations;
    @Autowired com.zencas.edhr.workflow.repository.WorkflowTaskRepository taskRepository;
    @Autowired RecordControlTaskActionService actions;
    @Autowired com.zencas.edhr.production.service.DhrSummaryService summaries;
    @Autowired com.zencas.edhr.production.service.DhrReviewService reviews;
    @Autowired com.zencas.edhr.production.service.DhrImpactNotificationService notifications;
    @Autowired com.zencas.edhr.production.service.FormProjectionService projection;
    @Autowired com.zencas.edhr.production.controller.FormProjectionController reports;
    @Autowired com.zencas.edhr.production.service.ProductionOutputService outputs;
    @MockBean com.zencas.edhr.production.service.FormProjectionWorker worker;
    private ObjectNode snapshot;
    private ObjectNode state;

    @BeforeEach void fixture() throws Exception {
        jdbc.execute("DROP FUNCTION IF EXISTS reject_record_control_result() CASCADE");
        jdbc.execute("DROP FUNCTION IF EXISTS reject_dhr_notification() CASCADE");
        jdbc.execute("DROP FUNCTION IF EXISTS reject_workflow_action() CASCADE");
        jdbc.execute("TRUNCATE workflow_intervention,audit_event");
        jdbc.execute("TRUNCATE material,form_template,route,dhr_template,workflow_definition,user_account,signature,workflow_task,workflow_instance,workflow_node,workflow_edge,workflow_action_log,form_instance_record,production_execution,production_object,work_order,product_process_version,product_process CASCADE");
        String password = passwords.encode("test-signature-password");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES (41,0,'rc-applicant','申请人',?,'ACTIVE'),(42,0,'rc-reviewer','审批人',?,'ACTIVE')", password, password);
        jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,signature_password_hash,snapshot_data) VALUES (-41,'USER_PROFILE','41','认证','41','申请人',?,'{}'),(-42,'USER_PROFILE','42','认证','42','审批人',?,'{}')", password, password);
        jdbc.update("INSERT INTO material(id,code,name) VALUES (101,'RC-PRODUCT','集成测试产品')");
        jdbc.update("INSERT INTO route(id,code,name) VALUES (102,'RC-ROUTE','集成测试路线')");
        jdbc.update("INSERT INTO route_version(id,route_id,version,code) VALUES (103,102,'1','RC-RV')");
        jdbc.update("INSERT INTO dhr_template(id,code,name) VALUES (104,'RC-DHR','集成测试目录')");
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES (105,104,'1')");
        jdbc.update("INSERT INTO product_process(id,owner_type,owner_id) VALUES (106,'PRODUCT',101)");
        jdbc.update("INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES (107,106,'1','量产','批次',103,105)");
        jdbc.update("INSERT INTO work_order(id,order_no,product_id,planned_quantity) VALUES (108,'RC-WO',101,1)");
        jdbc.update("INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity) VALUES (109,108,'RC-BATCH','BATCH',107,1)");
        jdbc.update("INSERT INTO form_template(id,code,name) VALUES (110,'RC-FORM','集成测试表单')");
        jdbc.update("INSERT INTO form_template_version(id,template_id) VALUES (111,110)");
        snapshot = (ObjectNode) mapper.readTree("""
            {"outputPolicyVersion":1,"context":{"workOrderId":"108","workOrderNo":"RC-WO","objectNo":"RC-BATCH","objectType":"BATCH","unit":"件","productId":"101"},
             "operations":[{"id":"op","name":"工序","finalOutput":true,"forms":[{"id":"form","versionId":"111","fields":[{"id":"value","type":"text","name":"值"},{"id":"qty","type":"number"},{"id":"unit","type":"text"},{"id":"rows","type":"subTable","name":"明细","typeConfig":{"columns":[{"id":"note","type":"text"}]}}],
             "projection":{"version":"form-projection-v1","bindings":[{"id":"production","enabled":true,"modelId":"production","sources":{"outputQuantity":"qty","unit":"unit"}},{"id":"trace","enabled":true,"modelId":"formTrace","sources":{"materialLotText":"value"}}]}}]}]}
            """);
        state = (ObjectNode) mapper.readTree("""
            {"operations":{"op":{"forms":{"form":{"status":"COMPLETED","savedAt":"2026-10-28T10:00:00","values":{"value":"old","qty":100,"unit":"件","rows":[{"__rowId":"11111111-1111-4111-8111-111111111111","note":"original"}]}}}}}}
            """);
        jdbc.update("INSERT INTO production_execution(object_id,snapshot_json,state_json,started_at,updated_at) VALUES (109,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", snapshot.toString(), state.toString());
        for (String type : List.of("CHANGE", "OBSOLETE")) {
            long definition = "CHANGE".equals(type) ? 201 : 301;
            jdbc.update("INSERT INTO workflow_definition(id,name,type,business_type,status) VALUES (?,'测试审批','RECORD_CONTROL',?,'PUBLISHED')", definition, type);
            jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,status,is_current,nodes_json,edges_json) VALUES (?,?,'PUBLISHED',true,'[]','[]')", definition + 1, definition);
            jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES (?,?,'START','开始','{}'),(?,?,'APPROVAL','审批',?::jsonb),(?,?,'END','结束','{}')",
                    definition + 2, definition + 1, definition + 3, definition + 1,
                    "{\"config\":{\"approverSubjects\":[{\"type\":\"USER\",\"id\":42}]}}", definition + 4, definition + 1);
            jdbc.update("INSERT INTO workflow_edge(id,version_id,source_node_id,target_node_id) VALUES (?,?,?,?),(?,?,?,?)",
                    definition + 5, definition + 1, definition + 2, definition + 3,
                    definition + 6, definition + 1, definition + 3, definition + 4);
        }
        actor();
        records.saved(109L, "default", snapshot, state, "op", "form", "form");
    }

    @AfterEach void clearActor() { AuditContext.clear(); org.springframework.security.core.context.SecurityContextHolder.clearContext(); }
    private void actor() { AuditContext.setOperator("41", "申请人"); }
    private long count(String table) { return jdbc.queryForObject("SELECT count(*) FROM " + table, Long.class); }
    private String scalar(String sql) { return jdbc.queryForObject(sql, String.class); }
    private long taskId() { return jdbc.queryForObject("SELECT t.id FROM workflow_task t JOIN workflow_instance w ON w.id=t.instance_id WHERE t.status='PENDING' AND w.business_type IN ('CHANGE','OBSOLETE')", Long.class); }
    private RecordControlService.SubmitCommand command(BusinessType type) {
        String definition = type == BusinessType.CHANGE ? "201" : "301";
        return new RecordControlService.SubmitCommand(type, scalar("SELECT instance_no FROM form_instance_record"),
                scalar("SELECT current_revision_id FROM form_instance_record"), mapper.createObjectNode().put("value", "new"),
                "实际更正原因", definition, String.valueOf(Long.parseLong(definition) + 1),
                "rc-applicant", "test-signature-password", UUID.randomUUID().toString());
    }
    private void complete(long task, String action) {
        actions.complete(String.valueOf(task), action,
                new RecordControlTaskActionService.TaskActionCommand("复核意见", "rc-reviewer", "test-signature-password"));
    }

    private void dhr(boolean review) {
        jdbc.update("UPDATE production_object SET status='COMPLETED' WHERE id=109");
        jdbc.update("""
            INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,
              product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,
              status,summary_status,created_at,updated_at)
            VALUES(1000,'default','DHR-LINKAGE',109,'RC-BATCH','BATCH',108,'RC-WO',101,107,103,104,105,'{}','{"directories":[]}',
              'COMPLETED','NOT_STARTED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
            """);
        if (review) {
            jdbc.update("INSERT INTO workflow_definition(id,name,type,business_type,status) VALUES(501,'DHR审核','RECORD_CONTROL','DHR_SUMMARY','PUBLISHED')");
            jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,status,is_current,nodes_json,edges_json) VALUES(502,501,'PUBLISHED',true,'[]','[]')");
            jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(503,502,'START','开始','{}'),(504,502,'APPROVAL','审核',?::jsonb),(505,502,'END','结束','{}')",
                    "{\"config\":{\"approverSubjects\":[{\"type\":\"USER\",\"id\":42}]}}");
            jdbc.update("INSERT INTO workflow_edge(id,version_id,source_node_id,target_node_id) VALUES(506,502,503,504),(507,502,504,505)");
            jdbc.update("UPDATE dhr_instance SET dhr_review_mode='REQUIRED',dhr_review_workflow_definition_id=501,dhr_review_workflow_version_id=502 WHERE id=1000");
        }
    }

    private ObjectNode summaryCommand() {
        var workspace = summaries.workspace(1000L);
        var request = mapper.createObjectNode().put("expectedScopeHash", workspace.path("sourceScopeHash").asText());
        request.putArray("overlayDirectories"); request.putArray("placements");
        if (workspace.path("draft").hasNonNull("id")) request.put("draftId", workspace.path("draft").path("id").asText()).put("revision", workspace.path("draft").path("revision").asInt());
        var draft = summaries.saveDraft(1000L, request);
        var command = mapper.createObjectNode().put("expectedDraftId", draft.path("id").asText()).put("expectedRevision", draft.path("revision").asInt());
        command.putObject("manualReview").put("qualityAndExceptionsReviewed", true).put("sourceSignaturesReviewed", true)
                .put("completeScopeReviewed", true).put("note", "核对完整证据、签署和质量处置");
        return command;
    }

    private long dhrTask() { return jdbc.queryForObject("SELECT t.id FROM workflow_task t JOIN dhr_summary_review r ON r.workflow_instance_id=t.instance_id WHERE t.status='PENDING'", Long.class); }
    private void review(long task, String action) {
        AuditContext.setOperator("42", "审批人");
        try { reviews.act(task, mapper.createObjectNode().put("action", action).put("opinion", "核对后处理")
                .put("expectedSnapshotHash", scalar("SELECT snapshot_hash FROM dhr_summary_version ORDER BY version_no DESC LIMIT 1"))); }
        finally { actor(); }
    }

    private ObjectNode report() {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("41", null,
                  org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("form-instances.view", "production.execution")));
        return reports.query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of(), 0, 20, null, null)).getData();
    }

    private void personnel() {
        String hash = passwords.encode("test-signature-password");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES (43,0,'rc-target','新审批人',?,'ACTIVE'),(44,0,'rc-manager','干预人',?,'ACTIVE'),(45,1,'rc-outside','外租户',?,'ACTIVE')", hash, hash, hash);
        jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,signature_password_hash,snapshot_data) VALUES (-44,'USER_PROFILE','44','认证','44','干预人',?,'{}')", hash);
        jdbc.update("INSERT INTO role(id,tenant_id,code,name) VALUES (4444,0,'WORKFLOW_OPERATIONS_TEST','干预测试') ON CONFLICT(id) DO NOTHING");
        jdbc.update("INSERT INTO role_permission(id,role_id,permission_id) SELECT 4444,4444,id FROM permission WHERE code='workflow.intervene' ON CONFLICT(id) DO NOTHING");
        jdbc.update("INSERT INTO user_role(id,user_id,role_id) VALUES (4444,44,4444) ON CONFLICT(id) DO NOTHING");
        jdbc.update("UPDATE workflow_task SET candidate_snapshot='{\"userIds\":[\"42\",\"43\"]}'::jsonb WHERE id=?", taskId());
    }
    private void manager() {
        AuditContext.setOperator("44", "干预人");
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("44", null,
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("workflow.intervene"))));
    }
    private com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command reassignment(long task, String target, String password) {
        return new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command(target, "原处理人无法继续处理",
                com.zencas.edhr.workflow.service.WorkflowResponsibilityService.taskState(taskRepository.findById(task).orElseThrow()), "rc-manager", password);
    }
    @Test void withdrawalCancelsAllPendingTasksAndReleasesOnlyTheApplicationLock() {
        var request = requests.submit(command(BusinessType.CHANGE));
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES (206,202,'APPROVAL','并行审批','{}')");
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,status,candidate_snapshot) SELECT 888,instance_id,206,'PENDING',candidate_snapshot FROM workflow_task WHERE id=?", taskId());
        assertThat(request.path("canWithdraw").asBoolean()).isTrue();
        long revisions = count("form_instance_revision");
        requests.withdraw(request.path("id").asText(), new RecordControlService.WithdrawRequest("申请内容需要重填"));
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("WITHDRAWN");
        assertThat(scalar("SELECT status FROM workflow_instance")).isEqualTo("WITHDRAWN");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_task WHERE status='WITHDRAWN'", Long.class)).isEqualTo(2);
        assertThat(count("form_instance_revision")).isEqualTo(revisions);
        assertThat(scalar("SELECT values_json::jsonb->>'value' FROM form_instance_record")).isEqualTo("old");
        assertThat(scalar("SELECT reason FROM audit_event WHERE entity_type='RECORD_CONTROL_REQUEST' AND action='WITHDRAWN'")).isEqualTo("申请内容需要重填");
        assertThatThrownBy(() -> requests.withdraw(request.path("id").asText(), new RecordControlService.WithdrawRequest("重复"))).hasMessageContaining("已结束");
        assertThat(requests.submit(command(BusinessType.CHANGE)).path("status").asText()).isEqualTo("IN_REVIEW");
    }
    @Test void withdrawalRejectsOtherUsersAndAnyPriorDecisionWithoutSideEffects() {
        var request = requests.submit(command(BusinessType.CHANGE));
        AuditContext.setOperator("42", "审批人");
        assertThatThrownBy(() -> requests.withdraw(request.path("id").asText(), new RecordControlService.WithdrawRequest("撤回"))).hasMessageContaining("仅申请人");
        actor(); jdbc.update("UPDATE workflow_task SET action='APPROVE',status='COMPLETED' WHERE id=?", taskId());
        long audits = count("audit_event");
        assertThat(requests.requestDetail(request.path("id").asText()).path("canWithdraw").asBoolean()).isFalse();
        assertThatThrownBy(() -> requests.withdraw(request.path("id").asText(), new RecordControlService.WithdrawRequest("撤回"))).hasMessageContaining("已有审批决定");
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("IN_REVIEW");
        assertThat(count("audit_event")).isEqualTo(audits);
    }
    @Test void signedReassignmentPreservesFrozenCandidatesAndRejectsMissingSignatureAndStaleReplay() throws Exception {
        var request = requests.submit(command(BusinessType.CHANGE)); personnel(); manager();
        long task = taskId(); var command = reassignment(task, "43", "test-signature-password");
        long signatures = count("signature");
        assertThatThrownBy(() -> responsibility.reassign(task, reassignment(task, "43", ""))).hasMessageContaining("密码");
        assertThat(count("signature")).isEqualTo(signatures);
        responsibility.reassign(task, command);
        assertThat(scalar("SELECT assignee_id FROM workflow_task")).isEqualTo("43");
        assertThat(scalar("SELECT candidate_snapshot->>'originSnapshot' FROM workflow_task")).contains("42", "43");
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("IN_REVIEW");
        assertThat(scalar("SELECT current_node_ids FROM workflow_instance")).isEqualTo("204");
        assertThat(count("workflow_intervention")).isEqualTo(1);
        assertThatThrownBy(() -> responsibility.reassign(task, command)).hasMessageContaining("已变化");
        var signature = mapper.readTree(scalar("SELECT snapshot_data FROM signature WHERE target_type='WORKFLOW_INTERVENTION'"));
        assertThat(signature.path("values").path("targetUserId").asText()).isEqualTo("43");
        assertThat(signature.path("values").path("taskState").asText()).isEqualTo(command.expectedTaskState());
        AuditContext.setOperator("42", "原处理人");
        assertThatThrownBy(() -> responsibility.transferTargets(task, "")).hasMessageContaining("无权");
        assertThat(request.path("workflow_instance_id").asText()).isNotBlank();
    }
    @Test void reassignmentRejectsUnqualifiedTargetsAndSignerWithoutInterventionPermission() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); manager(); long task = taskId();
        for (String target : List.of("41", "44", "45")) {
            assertThatThrownBy(() -> responsibility.reassign(task, reassignment(task, target, "test-signature-password"))).isInstanceOf(RuntimeException.class);
        }
        jdbc.update("UPDATE user_account SET status='DISABLED' WHERE id=43");
        assertThatThrownBy(() -> responsibility.reassign(task, reassignment(task, "43", "test-signature-password"))).hasMessageContaining("停用");
        var command = reassignment(task, "43", "test-signature-password");
        assertThatThrownBy(() -> responsibility.reassign(task, new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command(
                command.targetUserId(), command.reason(), command.expectedTaskState(), "rc-reviewer", "test-signature-password"))).hasMessageContaining("干预权限");
        assertThat(count("workflow_intervention")).isZero();
        assertThat(scalar("SELECT status FROM workflow_task")).isEqualTo("PENDING");
    }
    @Test void recordControlTransferUsesFrozenSignatureConfigurationAndKeepsSameLogicalTask() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); AuditContext.setOperator("42", "审批人"); long task = taskId();
        var context = responsibility.transferContext(task);
        assertThat(context.get("signatureRequired")).isEqualTo(false);
        responsibility.transferRecordControl(task, new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command("43", "委托复核", context.get("taskState").toString(), "", ""));
        assertThat(count("workflow_task")).isEqualTo(1); assertThat(scalar("SELECT assignee_id FROM workflow_task")).isEqualTo("43");
        assertThatThrownBy(() -> complete(task, "APPROVE")).hasMessageContaining("待处理人");
        AuditContext.setOperator("43", "新审批人");
        jdbc.update("UPDATE workflow_node SET properties=jsonb_set(properties,'{config,buttonEvents}','[{\"id\":\"sign\",\"event\":\"BEFORE\",\"action\":\"TRANSFER\",\"signatureMethod\":\"ACCOUNT_PASSWORD\"}]') WHERE id=204");
        assertThat(responsibility.transferContext(task).get("signatureRequired")).isEqualTo(true);
        assertThatThrownBy(() -> responsibility.transferRecordControl(task, new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command("42", "转回", responsibility.transferContext(task).get("taskState").toString(), "", ""))).hasMessageContaining("账户");
    }
    @Test void interventionAuditFailureRollsBackSignatureAndTaskMutation() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); manager(); long task = taskId(); long signatures = count("signature");
        String before = scalar("SELECT candidate_snapshot::text FROM workflow_task");
        jdbc.execute("CREATE FUNCTION reject_workflow_action() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='REASSIGN' THEN RAISE EXCEPTION 'fixture rejection'; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER reject_workflow_action BEFORE INSERT ON audit_event FOR EACH ROW EXECUTE FUNCTION reject_workflow_action()");
        assertThatThrownBy(() -> responsibility.reassign(task, reassignment(task, "43", "test-signature-password"))).isInstanceOf(RuntimeException.class);
        assertThat(count("signature")).isEqualTo(signatures); assertThat(count("workflow_intervention")).isZero();
        assertThat(scalar("SELECT candidate_snapshot::text FROM workflow_task")).isEqualTo(before);
    }
    @Test void logVisibilityKeepsActiveRequestBoundaryAndInterventionReadsDoNotIncludeDhr() {
        var request = requests.submit(command(BusinessType.CHANGE)); personnel();
        AuditContext.setOperator("44", "无关日志查看人");
        assertThat(operations.list(1, 20, "", "", false).getTotalElements()).isZero();
        assertThatThrownBy(() -> operations.detail(Long.valueOf(request.path("workflow_instance_id").asText()))).hasMessageContaining("流程不存在");
        manager();
        jdbc.update("UPDATE workflow_instance SET started_at='2026-10-30 09:10:11'");
        assertThat(operations.list(1, 20, "", "", true).getTotalElements()).isEqualTo(1);
        assertThat(operations.list(1, 20, "", "", true).getContent().getFirst().get("startTime")).isEqualTo("2026-10-30 09:10:11");
        assertThat(operations.detail(Long.valueOf(request.path("workflow_instance_id").asText())).get("tasks")).isNotNull();
        jdbc.update("UPDATE workflow_instance SET business_type='DHR_SUMMARY'");
        assertThat(operations.list(1, 20, "", "", false).getTotalElements()).isZero();
        assertThatThrownBy(() -> responsibility.reassign(taskIdFromAny(), reassignment(taskIdFromAny(), "43", "test-signature-password"))).hasMessageContaining("DHR");
    }
    private long taskIdFromAny() { return jdbc.queryForObject("SELECT id FROM workflow_task LIMIT 1", Long.class); }

    @Test void genericReassignmentStillRequiresSignatureAndOriginalHandlingQualification() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); manager(); long task = taskId();
        jdbc.update("UPDATE workflow_instance SET business_type='SYNTHETIC_CASE'");
        assertThat(responsibility.reassignmentTargets(task, "")).extracting(row -> row.get("id")).containsExactly("43");
        assertThatThrownBy(() -> responsibility.reassign(task, reassignment(task, "44", "test-signature-password"))).hasMessageContaining("候选范围");
        responsibility.reassign(task, reassignment(task, "43", "test-signature-password"));
        assertThat(scalar("SELECT assignee_id FROM workflow_task")).isEqualTo("43");
        assertThat(count("workflow_intervention")).isEqualTo(1);
    }

    @Test void withdrawalAndFinalApprovalHaveExactlyOneWinner() throws Exception {
        var request = requests.submit(command(BusinessType.CHANGE)); long task = taskId();
        var pool = Executors.newFixedThreadPool(2); var start = new CountDownLatch(1);
        try {
            var withdraw = pool.submit(() -> { actor(); try { start.await(); requests.withdraw(request.path("id").asText(), new RecordControlService.WithdrawRequest("撤回重填")); return true; }
                catch (RuntimeException e) { return false; } finally { AuditContext.clear(); } });
            var approve = pool.submit(() -> { AuditContext.setOperator("42", "审批人"); try { start.await(); complete(task, "APPROVE"); return true; }
                catch (RuntimeException e) { return false; } finally { AuditContext.clear(); } });
            start.countDown();
            assertThat(List.of(withdraw.get(15, TimeUnit.SECONDS), approve.get(15, TimeUnit.SECONDS))).containsExactlyInAnyOrder(true, false);
            assertThat(count("record_control_result_event")).isEqualTo(1);
            assertThat(scalar("SELECT status FROM record_control_request")).isIn("WITHDRAWN", "APPROVED");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_task WHERE status='PENDING'", Long.class)).isZero();
        } finally { pool.shutdownNow(); }
    }
    @Test void simultaneousReassignmentsCannotBothSignTheSameTaskState() throws Exception {
        requests.submit(command(BusinessType.CHANGE)); personnel(); long task = taskId(); var command = reassignment(task, "43", "test-signature-password");
        long signatures = count("signature"); var pool = Executors.newFixedThreadPool(2); var start = new CountDownLatch(1);
        Callable<Boolean> action = () -> { manager(); try { start.await(); responsibility.reassign(task, command); return true; }
            catch (RuntimeException e) { return false; } finally { AuditContext.clear(); org.springframework.security.core.context.SecurityContextHolder.clearContext(); } };
        try {
            var first = pool.submit(action); var second = pool.submit(action); start.countDown();
            assertThat(List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS))).containsExactlyInAnyOrder(true, false);
            assertThat(count("signature")).isEqualTo(signatures + 1); assertThat(count("workflow_intervention")).isEqualTo(1);
        } finally { pool.shutdownNow(); }
    }
    @Test void failedWithdrawalResultRestoresAllRuntimeAndBusinessState() {
        var request = requests.submit(command(BusinessType.CHANGE));
        long audits = count("audit_event");
        jdbc.execute("CREATE FUNCTION reject_record_control_result() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture result rejection'; END $$");
        jdbc.execute("CREATE TRIGGER reject_record_control_result BEFORE INSERT ON record_control_result_event FOR EACH ROW EXECUTE FUNCTION reject_record_control_result()");
        assertThatThrownBy(() -> requests.withdraw(request.path("id").asText(), new RecordControlService.WithdrawRequest("撤回"))).isInstanceOf(RuntimeException.class);
        assertThat(scalar("SELECT status FROM workflow_instance")).isEqualTo("RUNNING");
        assertThat(scalar("SELECT status FROM workflow_task")).isEqualTo("PENDING");
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("IN_REVIEW");
        assertThat(count("audit_event")).isEqualTo(audits);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_action_log WHERE action='INSTANCE_WITHDRAW'", Long.class)).isZero();
    }

    @Test void dhrReviewBlocksBothNewApplicationKindsUntilHumanReturn() {
        dhr(true);
        summaries.submit(1000L, summaryCommand());
        for (var type : BusinessType.values()) assertThatThrownBy(() -> requests.submit(command(type))).hasMessageContaining("DHR 正在审批");
        assertThat(requests.findRecord(scalar("SELECT instance_no FROM form_instance_record")).path("fieldValues").path("value").asText()).isEqualTo("old");
        assertThat(count("record_control_request")).isZero();
        review(dhrTask(), "RETURN");
        assertThat(scalar("SELECT summary_status FROM dhr_instance")).isEqualTo("DRAFT");
        requests.submit(command(BusinessType.CHANGE));
        assertThat(count("record_control_request")).isEqualTo(1);
    }

    @Test void activeApplicationBlocksSummaryButReturnRestoresOrdinarySubmissionChecks() {
        dhr(true);
        var command = summaryCommand();
        requests.submit(command(BusinessType.CHANGE));
        assertThatThrownBy(() -> summaries.submit(1000L, command)).hasMessageContaining("审批中的变更或作废申请");
        assertThat(count("dhr_summary_version")).isZero();
        complete(taskId(), "REJECT");
        summaries.submit(1000L, command);
        assertThat(scalar("SELECT summary_status FROM dhr_instance")).isEqualTo("PENDING_REVIEW");
        assertThat(count("dhr_evidence_impact")).isZero();
    }

    @Test void approvedChangePreservesFrozenVersionAndDeliversOnlyTheAffectedSubmitterInbox() {
        dhr(false);
        var submitted = summaries.submit(1000L, summaryCommand());
        String frozen = scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version");
        requests.submit(command(BusinessType.CHANGE));
        complete(taskId(), "APPROVE");
        assertThat(scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version")).isEqualTo(frozen);
        assertThat(summaries.version(1000L, submitted.path("id").asLong()).path("evidenceChanges")).hasSize(1);
        assertThat(count("dhr_evidence_impact")).isEqualTo(1);
        assertThat(notifications.list(0).path("unreadCount").asInt()).isEqualTo(1);
        long impact = jdbc.queryForObject("SELECT id FROM dhr_evidence_impact", Long.class);
        AuditContext.setOperator("42", "非当前审批人");
        assertThat(notifications.list(0).path("total").asInt()).isZero();
        notifications.read(impact);
        actor();
        assertThat(notifications.list(0).path("unreadCount").asInt()).isEqualTo(1);
        notifications.read(impact); notifications.read(impact);
        assertThat(notifications.list(0).path("unreadCount").asInt()).isZero();
        assertThat(scalar("SELECT summary_status FROM dhr_instance")).isEqualTo("FORMALIZED");
        assertThat(scalar("SELECT value_text FROM form_trace_value")).isEqualTo("new");
    }

    @Test void changeAndVoidSwitchCurrentReportsAndOutputWithoutDeletingHistoricalContributions() {
        projection.process(jdbc.queryForObject("SELECT id FROM form_projection_batch", Long.class));
        assertThat(report().path("totals").get(0).path("outputQuantity").asInt()).isEqualTo(100);
        var first = command(BusinessType.CHANGE);
        requests.submit(new RecordControlService.SubmitCommand(first.requestType(), first.instanceNo(), first.sourceRevisionId(),
                mapper.createObjectNode().put("value", "new").put("qty", 90), first.reason(), first.workflowDefinitionId(), first.workflowVersionId(), first.account(), first.password(), first.idempotencyKey()));
        complete(taskId(), "APPROVE");
        assertThat(report().path("total").asInt()).isZero();
        assertThat(outputs.object(109).path("status").asText()).isEqualTo("PENDING");
        projection.process(jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE status='PENDING'", Long.class));
        assertThat(report().path("totals").get(0).path("outputQuantity").asInt()).isEqualTo(90);
        assertThat(outputs.object(109).path("quantity").asText()).isEqualTo("90");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Long.class)).isEqualTo(2);
        requests.submit(command(BusinessType.OBSOLETE)); complete(taskId(), "APPROVE");
        assertThat(report().path("total").asInt()).isZero();
        assertThat(outputs.object(109).path("quantity").isNull()).isTrue();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch WHERE status='INVALIDATED'", Long.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Long.class)).isEqualTo(2);
        assertThat(count("form_instance_revision")).isEqualTo(2);
    }

    @Test void notificationFailureRollsBackSourceProjectionTraceSignatureAndFinalApproval() {
        dhr(false); summaries.submit(1000L, summaryCommand());
        requests.submit(command(BusinessType.CHANGE));
        long task = taskId(), signatures = count("signature");
        jdbc.execute("CREATE FUNCTION reject_dhr_notification() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic inbox failure'; END $$");
        jdbc.execute("CREATE TRIGGER reject_dhr_notification BEFORE INSERT ON dhr_impact_notification FOR EACH ROW EXECUTE FUNCTION reject_dhr_notification()");
        assertThatThrownBy(() -> complete(task, "APPROVE")).isInstanceOf(RuntimeException.class);
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("IN_REVIEW");
        assertThat(scalar("SELECT status FROM workflow_task")).isEqualTo("PENDING");
        assertThat(scalar("SELECT value_text FROM form_trace_value")).isEqualTo("old");
        assertThat(scalar("SELECT status FROM form_projection_batch")).isEqualTo("PENDING");
        assertThat(count("form_instance_revision")).isEqualTo(1);
        assertThat(count("signature")).isEqualTo(signatures);
        assertThat(count("record_control_result_event")).isZero();
        assertThat(count("dhr_evidence_impact")).isZero();
    }

    @Test void concurrentDhrSubmissionAndApplicationHaveOnlyOneWinner() throws Exception {
        dhr(true);
        var summary = summaryCommand(); var request = command(BusinessType.CHANGE);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            var dhr = pool.submit(() -> { actor(); try { start.await(); summaries.submit(1000L, summary); return true; } catch (RuntimeException rejected) { return false; } finally { AuditContext.clear(); } });
            var form = pool.submit(() -> { actor(); try { start.await(); requests.submit(request); return true; } catch (RuntimeException rejected) { return false; } finally { AuditContext.clear(); } });
            start.countDown();
            assertThat(List.of(dhr.get(15, TimeUnit.SECONDS), form.get(15, TimeUnit.SECONDS))).containsExactlyInAnyOrder(true, false);
        }
        assertThat(count("record_control_request") + count("dhr_summary_version")).isEqualTo(1);
    }

    @Test void legacyConcurrentApplicationAndDhrApprovalCannotApproveStaleEvidenceAndNotifyOnlyCurrentPeople() throws Exception {
        dhr(true);
        var request = requests.submit(command(BusinessType.CHANGE));
        // Explicitly model pre-existing inconsistent data; current entry points forbid creating this pair.
        jdbc.update("UPDATE record_control_request SET status='RETURNED'");
        var version = summaries.submit(1000L, summaryCommand());
        jdbc.update("UPDATE record_control_request SET status='IN_REVIEW'");
        long sourceTask = taskId(), reviewTask = dhrTask();
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(43,0,'former-reviewer','历史审批人','unused','ACTIVE')");
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot,created_at) SELECT 999,instance_id,node_id,'COMPLETED','43','{}'::jsonb,CURRENT_TIMESTAMP FROM workflow_task WHERE id=?", reviewTask);
        String frozen = scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version");
        try (var pool = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            var change = pool.submit(() -> { actor(); try { start.await(); complete(sourceTask, "APPROVE"); return true; } finally { AuditContext.clear(); } });
            var approve = pool.submit(() -> { actor(); try { start.await(); review(reviewTask, "APPROVE"); return true; }
                catch (RuntimeException blocked) { assertThat(blocked.getMessage()).containsAnyOf("审批中的变更或作废申请", "过时证据"); return false; }
                finally { AuditContext.clear(); } });
            start.countDown();
            assertThat(change.get(15, TimeUnit.SECONDS)).isTrue();
            assertThat(approve.get(15, TimeUnit.SECONDS)).isFalse();
        }
        assertThat(scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version")).isEqualTo(frozen);
        assertThat(scalar("SELECT status FROM workflow_task WHERE id=" + reviewTask)).isEqualTo("PENDING");
        assertThat(jdbc.queryForList("SELECT recipient_id FROM dhr_impact_notification ORDER BY recipient_id", String.class)).containsExactly("41", "42");
        assertThat(summaries.version(1000L, version.path("id").asLong()).path("evidenceChanges")).hasSize(1);
        var q = jdbc.queryForMap("SELECT * FROM record_control_request WHERE id=?", request.path("id").asLong());
        var event = jdbc.queryForMap("SELECT * FROM record_control_result_event");
        requests.handle(new com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.WorkflowResultEvent(
                event.get("event_id").toString(), q.get("workflow_instance_id").toString(), q.get("workflow_definition_id").toString(), q.get("workflow_version_id").toString(),
                BusinessType.CHANGE, request.path("id").asText(), com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.Result.APPROVED,
                ((java.sql.Timestamp) event.get("occurred_at")).toLocalDateTime(), "42", null, q.get("audit_correlation_id").toString(), q.get("workflow_snapshot_hash").toString()));
        assertThat(count("dhr_evidence_impact")).isEqualTo(1);
        assertThat(count("dhr_impact_notification")).isEqualTo(2);
        assertThat(count("form_instance_revision")).isEqualTo(2);
    }

    @Test void legacySubmitterIdentityComesFromOriginalAuditInsteadOfDisplayName() {
        dhr(false); summaries.submit(1000L, summaryCommand());
        jdbc.update("UPDATE dhr_summary_version SET submitted_by_id=NULL");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(43,0,'same-name','申请人','unused','ACTIVE')");
        requests.submit(command(BusinessType.OBSOLETE)); complete(taskId(), "APPROVE");
        assertThat(jdbc.queryForList("SELECT recipient_id FROM dhr_impact_notification", String.class)).containsExactly("41");
        assertThat(scalar("SELECT submitted_by FROM dhr_summary_version")).isEqualTo("申请人");
        assertThat(scalar("SELECT status FROM dhr_summary_version")).isEqualTo("FORMALIZED");
    }

    @Test void firstCompletionCreatesOneImmutableInitialRevision() {
        assertThat(scalar("SELECT revision_no FROM form_instance_revision")).isEqualTo("1");
        assertThat(scalar("SELECT content_hash FROM form_instance_revision")).hasSize(64);
        records.saved(109L, "default", snapshot, state, "op", "form", "form");
        assertThat(count("form_instance_revision")).isEqualTo(1);
        assertThat(scalar("SELECT r.id=v.current_revision_id FROM form_instance_revision r JOIN form_instance_record v ON v.id=r.record_id")).isEqualTo("t");
    }

    @Test void signedChangeAndDuplicateConfirmationApplyExactlyOneNewRevision() throws Exception {
        var command = command(BusinessType.CHANGE);
        var request = requests.submit(command);
        assertThat(requests.submit(command).path("id")).isEqualTo(request.path("id"));
        assertThat(count("workflow_instance")).isEqualTo(1);
        assertThat(scalar("SELECT values_json FROM form_instance_record")).contains("old");
        long task = taskId();
        complete(task, "APPROVE");
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("APPROVED");
        assertThat(scalar("SELECT revision_no FROM form_instance_revision WHERE status='EFFECTIVE'")).isEqualTo("2");
        assertThat(scalar("SELECT values_json FROM form_instance_record")).contains("new");
        assertThat(mapper.readTree(scalar("SELECT values_json FROM form_instance_record")).path("rows").get(0).path("__rowId").asText())
                .isEqualTo("11111111-1111-4111-8111-111111111111");
        assertThat(scalar("SELECT values_json FROM form_instance_revision WHERE revision_no=1")).contains("old");
        assertThatThrownBy(() -> complete(task, "APPROVE")).isInstanceOf(RuntimeException.class);
        assertThat(count("form_instance_revision")).isEqualTo(2);
        assertThat(count("record_control_result_event")).isEqualTo(1);
    }

    @Test void approvedVoidPreservesValuesAndHistoricalRevision() {
        requests.submit(command(BusinessType.OBSOLETE));
        complete(taskId(), "APPROVE");
        assertThat(scalar("SELECT status FROM form_instance_record")).isEqualTo("OBSOLETE");
        assertThat(scalar("SELECT status FROM form_instance_revision")).isEqualTo("VOIDED");
        assertThat(scalar("SELECT values_json FROM form_instance_record")).contains("old");
        assertThat(count("form_instance_revision")).isEqualTo(1);
        assertThat(scalar("SELECT state_json FROM production_execution")).contains("OBSOLETE");
    }

    @Test void returnedRequestLeavesSourceUnchangedAndAllowsANewApplication() {
        var original = requests.submit(command(BusinessType.CHANGE));
        complete(taskId(), "REJECT");
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("RETURNED");
        assertThat(scalar("SELECT values_json FROM form_instance_record")).contains("old");
        assertThat(count("form_instance_revision")).isEqualTo(1);
        assertThat(requests.submit(command(BusinessType.CHANGE)).path("id")).isNotEqualTo(original.path("id"));
        assertThat(count("workflow_instance")).isEqualTo(2);
    }

    @Test void failedBusinessApplicationRollsBackFinalTaskSignatureAndRevision() {
        requests.submit(command(BusinessType.CHANGE));
        long task = taskId();
        long signatures = count("signature");
        jdbc.execute("CREATE FUNCTION reject_record_control_result() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic result failure'; END $$");
        jdbc.execute("CREATE TRIGGER reject_record_control_result BEFORE UPDATE ON record_control_request FOR EACH ROW WHEN (NEW.status='APPROVED') EXECUTE FUNCTION reject_record_control_result()");
        assertThatThrownBy(() -> complete(task, "APPROVE")).isInstanceOf(RuntimeException.class);
        assertThat(scalar("SELECT status FROM workflow_task")).isEqualTo("PENDING");
        assertThat(scalar("SELECT status FROM workflow_instance")).isEqualTo("RUNNING");
        assertThat(scalar("SELECT status FROM record_control_request")).isEqualTo("IN_REVIEW");
        assertThat(scalar("SELECT values_json FROM form_instance_record")).contains("old");
        assertThat(count("form_instance_revision")).isEqualTo(1);
        assertThat(count("record_control_result_event")).isZero();
        assertThat(count("signature")).isEqualTo(signatures);
    }

    @Test void concurrentApplicationsCreateOneWorkflowAndOneActiveRequest() throws Exception {
        var first = command(BusinessType.CHANGE);
        var second = command(BusinessType.OBSOLETE);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            var futures = List.of(first, second).stream().map(command -> pool.submit(() -> {
                actor();
                try { start.await(); requests.submit(command); return true; }
                catch (RuntimeException rejected) { return false; }
                finally { AuditContext.clear(); }
            })).toList();
            start.countDown();
            assertThat(List.of(futures.get(0).get(15, TimeUnit.SECONDS), futures.get(1).get(15, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(true, false);
        }
        assertThat(count("record_control_request")).isEqualTo(1);
        assertThat(count("workflow_instance")).isEqualTo(1);
    }
}
