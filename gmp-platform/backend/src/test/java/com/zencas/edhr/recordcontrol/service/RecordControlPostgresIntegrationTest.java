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
    @Autowired RecordControlTaskActionService actions;
    private ObjectNode snapshot;
    private ObjectNode state;

    @BeforeEach void fixture() throws Exception {
        jdbc.execute("DROP FUNCTION IF EXISTS reject_record_control_result() CASCADE");
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
            {"context":{"workOrderId":"108","workOrderNo":"RC-WO","objectNo":"RC-BATCH","objectType":"BATCH"},
             "operations":[{"id":"op","name":"工序","forms":[{"id":"form","versionId":"111","fields":[{"id":"value","type":"text","name":"值"},{"id":"rows","type":"subTable","name":"明细","typeConfig":{"columns":[{"id":"note","type":"text"}]}}]}]}]}
            """);
        state = (ObjectNode) mapper.readTree("""
            {"operations":{"op":{"forms":{"form":{"status":"COMPLETED","savedAt":"2026-10-28T10:00:00","values":{"value":"old","rows":[{"__rowId":"11111111-1111-4111-8111-111111111111","note":"original"}]}}}}}}
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

    @AfterEach void clearActor() { AuditContext.clear(); }
    private void actor() { AuditContext.setOperator("41", "申请人"); }
    private long count(String table) { return jdbc.queryForObject("SELECT count(*) FROM " + table, Long.class); }
    private String scalar(String sql) { return jdbc.queryForObject(sql, String.class); }
    private long taskId() { return jdbc.queryForObject("SELECT id FROM workflow_task WHERE status='PENDING'", Long.class); }
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
