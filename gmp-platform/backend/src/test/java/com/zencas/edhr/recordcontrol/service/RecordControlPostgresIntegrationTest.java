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
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
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
@AutoConfigureMockMvc
class RecordControlPostgresIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired com.zencas.edhr.identity.security.JwtTokenProvider tokens;
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
    @Autowired com.zencas.edhr.workflow.contract.RecordControlWorkflowPort workflowCandidates;
    @Autowired com.zencas.edhr.workflow.service.WorkflowResponsibilityService responsibility;
    @Autowired com.zencas.edhr.workflow.service.WorkflowOperationsQuery operations;
    @Autowired com.zencas.edhr.production.service.FormWorkflowOperations formOperations;
    @Autowired com.zencas.edhr.production.service.ExecutionAccess executionAccess;
    @Autowired com.zencas.edhr.production.service.FormWorklistService formWorklists;
    @Autowired com.zencas.edhr.compliance.controller.AuditController auditController;
    @Autowired com.zencas.edhr.common.util.SnowflakeIdGenerator ids;
    @Autowired com.zencas.edhr.workflow.repository.WorkflowTaskRepository taskRepository;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactionManager;
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
        jdbc.execute("TRUNCATE workflow_intervention,audit_event,user_role");
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

    @ParameterizedTest @ValueSource(ints = {0, 1, 10, 100, 1000})
    @org.junit.jupiter.api.condition.EnabledIfSystemProperty(named="edhr.audit.workflowCandidateCapacity",matches="true")
    void publishedCandidateCapacityPreservesCompleteCurrentVersionSelection(int catalogSize) throws Exception {
        jdbc.update("UPDATE workflow_definition SET status='DRAFT'");
        for (BusinessType type : BusinessType.values()) {
            long first = type == BusinessType.CHANGE ? 10000000L : 20000000L;
            jdbc.execute("""
                INSERT INTO workflow_definition(id,name,code,type,business_type,status)
                SELECT %d+i,'容量流程-'||lpad(i::text,6,'0'),'CAP-%s-'||i,'RECORD_CONTROL','%s','PUBLISHED'
                FROM generate_series(1,%d) i
                """.formatted(first, type, type, catalogSize));
            jdbc.execute("""
                INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json)
                SELECT %d+i,%d+i,3,'PUBLISHED',true,'[]'::jsonb,'[]'::jsonb FROM generate_series(1,%d) i
                """.formatted(first + 1000000, first, catalogSize));
            // Catalog metadata only, not newly signed/published executable business flows.
            jdbc.update("INSERT INTO workflow_definition(id,name,type,business_type,status) VALUES (?,?,'RECORD_CONTROL',?,'PUBLISHED'),(?,?,'RECORD_CONTROL',?,'PUBLISHED'),(?,?,'RECORD_CONTROL',?,'DRAFT'),(?,?,'WORK',?,'PUBLISHED')",
                    first+catalogSize+1,"无当前版本",type.name(),first+catalogSize+2,"当前草稿且有旧发布版",type.name(),
                    first+catalogSize+3,"草稿定义",type.name(),first+catalogSize+4,"其他流程类型",type.name());
            for (int offset : List.of(2,3,4)) jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES (?,?,3,?,true,'[]','[]')",
                    first+1000000+catalogSize+offset,first+catalogSize+offset,offset==2?"DRAFT":"PUBLISHED");
            jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES (?,?,2,'PUBLISHED',false,'[]','[]')",
                    first+2000000+catalogSize+2,first+catalogSize+2);
        }
        assertThat(count("workflow_definition")).isEqualTo(2L*catalogSize+10);
        assertThat(count("workflow_definition_version")).isEqualTo(2L*catalogSize+10);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_definition_version v JOIN workflow_definition d ON d.id=v.definition_id WHERE d.code LIKE 'CAP-%' AND v.is_current AND v.status='PUBLISHED'",Long.class)).isEqualTo(2L*catalogSize);
        jdbc.execute("ANALYZE workflow_definition; ANALYZE workflow_definition_version");
        String before = candidateCatalogDigest();
        var observations = mapper.createArrayNode();
        for (BusinessType type : BusinessType.values()) {
            long first = type == BusinessType.CHANGE ? 10000000L : 20000000L;
            assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_definition WHERE type='RECORD_CONTROL' AND business_type=? AND status='PUBLISHED'",Long.class,type.name())).isEqualTo(catalogSize+2L);
            for (int iteration=1; iteration<=2; iteration++) {
                String label="wf-candidates-"+catalogSize+"-"+type.name().toLowerCase(java.util.Locale.ROOT)+"-"+iteration;
                var tx = new org.springframework.transaction.support.TransactionTemplate(transactionManager); tx.setReadOnly(true);
                long[] measurements = new long[2];
                var actual = tx.execute(status -> {
                    jdbc.execute("SET LOCAL application_name='"+label+"'; SET LOCAL auto_explain.log_min_duration=0; SET LOCAL auto_explain.log_analyze=true; SET LOCAL auto_explain.log_buffers=true; SET LOCAL auto_explain.log_format='json'");
                    var memory=(com.sun.management.ThreadMXBean)java.lang.management.ManagementFactory.getThreadMXBean();
                    long started=System.nanoTime(),allocated=memory.getThreadAllocatedBytes(Thread.currentThread().threadId());
                    var result=workflowCandidates.listPublishedCandidates(type);
                    measurements[0]=System.nanoTime()-started; measurements[1]=memory.getThreadAllocatedBytes(Thread.currentThread().threadId())-allocated;
                    return result;
                });
                assertThat(actual).hasSize(catalogSize);
                for (int i=0; i<catalogSize; i++) {
                    var row=actual.get(i); long index=i+1L;
                    assertThat(row.workflowDefinitionId()).isEqualTo(Long.toString(first+index));
                    assertThat(row.workflowVersionId()).isEqualTo(Long.toString(first+1000000+index));
                    assertThat(row.templateName()).isEqualTo("容量流程-"+String.format(java.util.Locale.ROOT,"%06d",index));
                    assertThat(row.templateCode()).isEqualTo("CAP-"+type+"-"+index);
                    assertThat(row.versionNumber()).isEqualTo(3); assertThat(row.businessType()).isEqualTo(type);
                    assertThat(row.status()).isEqualTo("PUBLISHED");
                }
                var observation=mapper.createObjectNode().put("label",label).put("businessType",type.name()).put("iteration",iteration)
                        .put("returned",actual.size()).put("matchedDefinitions",catalogSize+2)
                        .put("elapsedNanos",measurements[0]).put("threadAllocatedBytes",measurements[1]);
                observation.set("rows",mapper.valueToTree(actual)); observations.add(observation);
            }
            String token=tokens.generateToken("41","ordinary-reader","普通认证读取",5,List.of());
            var response=http("candidate-"+catalogSize+"-"+type,"GET","/api/v1/workflow/record-control/candidates?businessType="+type,token,null,200);
            assertThat(response.path("data")).isEqualTo(observations.get(observations.size()-1).path("rows"));
            http("candidate-anonymous-"+catalogSize+"-"+type,"GET","/api/v1/workflow/record-control/candidates?businessType="+type,null,null,401);
        }
        String after=candidateCatalogDigest(); assertThat(after).isEqualTo(before);
        var report=mapper.createObjectNode().put("catalogSizePerType",catalogSize).put("beforeStateDigest",before).put("afterStateDigest",after)
                .put("scope","Synthetic catalog metadata;original service/SQL;calling-thread cumulative allocation,not peak or production SLA;JWT+MockMvc,not socket/signing");
        report.set("observations",observations);
        Path output=Path.of(System.getProperty("edhr.audit.workflowCandidateOutput")); Files.createDirectories(output);
        mapper.writerWithDefaultPrettyPrinter().writeValue(output.resolve("catalog-"+catalogSize+".json").toFile(),report);
    }

    @Test
    @org.junit.jupiter.api.condition.EnabledIfSystemProperty(named="edhr.audit.workflowCandidateCapacity",matches="true")
    void candidateReadKeepsExistingAmbiguousCurrentFailureWithoutChangingEvidence() {
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES(991,201,2,'PUBLISHED',true,'[]','[]')");
        String before=candidateCatalogDigest();
        assertThatThrownBy(() -> workflowCandidates.listPublishedCandidates(BusinessType.CHANGE))
                .isInstanceOf(org.springframework.dao.IncorrectResultSizeDataAccessException.class);
        assertThat(candidateCatalogDigest()).isEqualTo(before);
    }

    private String candidateCatalogDigest() {
        StringBuilder result=new StringBuilder(readCapacityDigest());
        for (String table : List.of("workflow_definition","workflow_definition_version"))
            result.append(table).append(':').append(scalar("SELECT md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) FROM "+table+" r")).append(';');
        return result.toString();
    }

    @ParameterizedTest @ValueSource(ints = {0, 5000, 20000})
    @org.junit.jupiter.api.condition.EnabledIfSystemProperty(named="edhr.audit.recordReadCapacity",matches="true")
    void requestListCapacityKeepsReadPolicyAndEvidence(int backgroundTasks) throws Exception {
        var original = requests.submit(command(BusinessType.CHANGE));
        long originalTask=taskId();
        String originalRecord=scalar("SELECT id FROM form_instance_record");
        personnel();
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(1,0,'admin','系统管理员','unused-readonly-fixture','ACTIVE')");
        // Synthetic metadata copies obey database constraints; they do not assert newly signed business flows.
        jdbc.execute("""
            INSERT INTO form_instance_record SELECT (jsonb_populate_record(NULL::form_instance_record,
                to_jsonb(r)||jsonb_build_object('id',7000000+i,'instance_no','CAP-FR-'||i,
                    'copy_id','capacity-'||i,'current_revision_id',NULL))).*
            FROM form_instance_record r CROSS JOIN generate_series(1,20) i;
            INSERT INTO form_instance_revision SELECT (jsonb_populate_record(NULL::form_instance_revision,
                to_jsonb(v)||jsonb_build_object('id',7100000+i,'record_id',7000000+i))).*
            FROM form_instance_revision v CROSS JOIN generate_series(1,20) i WHERE record_id=%s;
            UPDATE form_instance_record SET current_revision_id=7100000+(id-7000000) WHERE id BETWEEN 7000001 AND 7000020;
            INSERT INTO workflow_instance SELECT (jsonb_populate_record(NULL::workflow_instance,
                to_jsonb(w)||jsonb_build_object('id',7200000+i,'business_id',(7400000+i)::text,'idempotency_key','capacity-instance-'||i))).*
            FROM workflow_instance w CROSS JOIN generate_series(1,20) i;
            INSERT INTO record_control_request SELECT (jsonb_populate_record(NULL::record_control_request,
                to_jsonb(q)||jsonb_build_object('id',7400000+i,'request_no','CAP-RC-'||i,'record_id',7000000+i,
                    'source_revision_id',7100000+i,'workflow_instance_id',(7200000+i)::text,
                    'idempotency_key','capacity-'||i))).*
            FROM record_control_request q CROSS JOIN generate_series(1,20) i;
            """.formatted(originalRecord));
        if (backgroundTasks>0) {
            jdbc.execute("INSERT INTO workflow_instance SELECT (jsonb_populate_record(NULL::workflow_instance,to_jsonb(w)||jsonb_build_object('id',8000000+i,'business_id','BACKGROUND-'||i,'idempotency_key','background-instance-'||i))).* FROM workflow_instance w CROSS JOIN generate_series(1,"+backgroundTasks+") i WHERE id="+original.path("workflow_instance_id").asText());
            jdbc.execute("INSERT INTO workflow_task SELECT (jsonb_populate_record(NULL::workflow_task,to_jsonb(t)||jsonb_build_object('id',9000000+i,'instance_id',8000000+i))).* FROM workflow_task t CROSS JOIN generate_series(1,"+backgroundTasks+") i WHERE id="+originalTask);
        }
        // New request tasks follow accumulated history in the heap; do not rely on early matches.
        jdbc.execute("INSERT INTO workflow_task SELECT (jsonb_populate_record(NULL::workflow_task,to_jsonb(t)||jsonb_build_object('id',7300000+i,'instance_id',7200000+i,'candidate_snapshot',jsonb_build_object('userIds',jsonb_build_array('42'))))).* FROM workflow_task t CROSS JOIN generate_series(1,20) i WHERE id="+originalTask);
        assertThat(count("workflow_task")).isEqualTo(backgroundTasks+21);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM record_control_request q JOIN workflow_instance w ON w.id::text=q.workflow_instance_id WHERE q.request_no LIKE 'CAP-RC-%' AND w.business_id=q.id::text",Long.class)).isEqualTo(20);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_instance WHERE business_id LIKE 'BACKGROUND-%'",Long.class)).isEqualTo(backgroundTasks);
        jdbc.execute("ANALYZE workflow_task; ANALYZE record_control_request; ANALYZE form_instance_record");
        String before=readCapacityDigest();
        var query=new RecordControlService.RequestListQuery("CAP-RC-",null,null,null,null,null,null,null,null);
        for (String actorId:List.of("44","41","42","1")) {
            AuditContext.setOperator(actorId,"容量读取者");
            String label="audit-record-access-"+backgroundTasks+"-"+actorId;
            var tx=new org.springframework.transaction.support.TransactionTemplate(transactionManager);tx.setReadOnly(true);
            var memory=(com.sun.management.ThreadMXBean)java.lang.management.ManagementFactory.getThreadMXBean();
            long[] measurements=new long[2];
            var page=tx.execute(status->{
                jdbc.execute("SET LOCAL application_name='"+label+"'; SET LOCAL auto_explain.log_min_duration=0; SET LOCAL auto_explain.log_analyze=true; SET LOCAL auto_explain.log_buffers=true; SET LOCAL auto_explain.log_format='json'");
                long start=System.nanoTime(),allocated=memory.getThreadAllocatedBytes(Thread.currentThread().threadId());
                var result=requests.listRequests(false,0,20,query);
                measurements[0]=System.nanoTime()-start;measurements[1]=memory.getThreadAllocatedBytes(Thread.currentThread().threadId())-allocated;
                return result;
            });
            boolean allowed=!actorId.equals("44");
            assertThat(page.getTotalElements()).isEqualTo(20);assertThat(page.getContent()).hasSize(20);
            assertThat(page.getContent()).allSatisfy(row->assertThat(row.path("canViewDetail").asBoolean()).isEqualTo(allowed));
            if (allowed) assertThat(requests.requestDetail(original.path("id").asText()).path("id").asText()).isEqualTo(original.path("id").asText());
            else assertThatThrownBy(()->requests.requestDetail(original.path("id").asText())).hasMessageContaining("无权查看");
            Path output=Path.of(System.getProperty("edhr.audit.recordReadOutput"));Files.createDirectories(output);
            var report=mapper.createObjectNode().put("label",label).put("backgroundTasks",backgroundTasks).put("actorId",actorId)
                .put("canViewExpected",allowed).put("taskHeapLayout","background-before-target").put("elapsedNanos",measurements[0]).put("threadAllocatedBytes",measurements[1])
                .put("scope","20 synthetic metadata requests plus real original detail; calling-thread cumulative allocation, not peak/SLA; actual plans in owned PG auto_explain log");
            report.set("rows",mapper.valueToTree(page.getContent()));mapper.writerWithDefaultPrettyPrinter().writeValue(output.resolve(label+".json").toFile(),report);
        }
        assertThat(readCapacityDigest()).isEqualTo(before);
    }

    private String readCapacityDigest() {
        StringBuilder result=new StringBuilder();
        for (String table:List.of("form_instance_record","form_instance_revision","record_control_request","workflow_instance","workflow_task","signature","audit_event","dhr_summary_version"))
            result.append(table).append(':').append(scalar("SELECT md5(coalesce(jsonb_agg(to_jsonb(r) ORDER BY id)::text,'[]')) FROM "+table+" r")).append(';');
        return result.toString();
    }
    private void actor() { AuditContext.setOperator("41", "申请人"); }
    @ParameterizedTest
    @ValueSource(strings = {"applicant", "candidate", "manager", "super-admin", "fake-display-name", "fake-role", "disabled-admin", "history", "reassigned-old", "reassigned-new"})
    void historyDetailAvailabilityMatchesAuthorizedActor(String scenario) {
        var request = requests.submit(command(BusinessType.CHANGE));
        String requestId = request.path("id").asText();
        personnel();
        boolean allowed = !List.of("manager", "fake-display-name", "fake-role", "disabled-admin", "reassigned-old").contains(scenario);
        switch (scenario) {
            case "applicant" -> actor();
            case "candidate" -> AuditContext.setOperator("42", "审批人");
            case "super-admin", "disabled-admin" -> {
                jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES (1,1,'admin','系统管理员','unused',?)",
                        scenario.equals("super-admin") ? "ACTIVE" : "DISABLED");
                AuditContext.setOperator("1", "系统管理员", "admin");
            }
            case "fake-display-name" -> AuditContext.setOperator("44", "admin", "admin");
            case "fake-role" -> {
                jdbc.update("INSERT INTO user_role(id,user_id,role_id) VALUES (4499,44,1)");
                manager();
            }
            case "history" -> {
                actor(); requests.withdraw(requestId, new RecordControlService.WithdrawRequest("结束后查历史")); manager();
            }
            case "reassigned-old", "reassigned-new" -> {
                manager(); long task = taskId();
                responsibility.reassign(task, reassignment(task, "43", "test-signature-password"));
                AuditContext.setOperator(scenario.equals("reassigned-old") ? "42" : "43", "审批人");
            }
            default -> manager();
        }
        var row = requests.listRequests(false, 0, 20).getContent().stream()
                .filter(item -> item.path("id").asText().equals(requestId)).findFirst().orElseThrow();
        assertThat(row.path("canViewDetail").asBoolean()).as(scenario).isEqualTo(allowed);
        var source = requests.findRecord(scalar("SELECT instance_no FROM form_instance_record"));
        if (scenario.equals("history")) assertThat(source.has("canViewActiveRequest")).isFalse();
        else assertThat(source.path("canViewActiveRequest").asBoolean()).as(scenario).isEqualTo(allowed);
        if (allowed) assertThat(requests.requestDetail(requestId).path("id").asText()).isEqualTo(requestId);
        else assertThatThrownBy(() -> requests.requestDetail(requestId)).hasMessageContaining("无权查看");
        if (scenario.equals("super-admin")) {
            assertThat(requests.requestDetail(requestId).path("canWithdraw").asBoolean()).isFalse();
            assertThatThrownBy(() -> requests.withdraw(requestId, new RecordControlService.WithdrawRequest("超管不可代撤回")))
                    .hasMessageContaining("仅申请人");
            assertThat(scalar("SELECT status FROM record_control_request WHERE id=" + requestId)).isEqualTo("IN_REVIEW");
        }
    }
    @Test void submissionViewQualificationBelongsToLoggedInReaderRatherThanButtonSigner() {
        AuditContext.setOperator("42", "审批人");
        var request = requests.submit(command(BusinessType.CHANGE));
        assertThat(request.path("applicant_id").asText()).isEqualTo("41");
        assertThat(requests.findRecord(scalar("SELECT instance_no FROM form_instance_record")).path("canViewActiveRequest").asBoolean()).isTrue();
        actor(); requests.withdraw(request.path("id").asText(), new RecordControlService.WithdrawRequest("结束首轮"));
        personnel(); manager();
        var second = requests.submit(command(BusinessType.CHANGE));
        assertThat(second.path("applicant_id").asText()).isEqualTo("41");
        assertThat(requests.findRecord(scalar("SELECT instance_no FROM form_instance_record")).path("canViewActiveRequest").asBoolean()).isFalse();
        assertThatThrownBy(() -> requests.requestDetail(second.path("id").asText())).hasMessageContaining("无权查看");
        assertThat(AuditContext.getOperatorId()).isEqualTo("44");
    }
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

    @Test void personalDhrListsFollowActualReturnResubmitAndApproval() {
        dhr(true); summaries.submit(1000L, summaryCommand());
        assertThat(reviews.list("PENDING", "", 0, 20).getTotalElements()).isZero();
        AuditContext.setOperator("42", "审批人");
        assertThat(reviews.list("PENDING", "DHR-LINKAGE", 0, 20).getTotalElements()).isEqualTo(1);
        assertThat(reviews.list("DONE", "", 0, 20).getTotalElements()).isZero();
        review(dhrTask(), "RETURN");
        AuditContext.setOperator("42", "审批人");
        assertThat(reviews.list("PENDING", "", 0, 20).getTotalElements()).isZero();
        assertThat(reviews.list("DONE", "", 0, 20).getTotalElements()).isEqualTo(1);
        actor(); summaries.submit(1000L, summaryCommand());
        AuditContext.setOperator("42", "审批人");
        assertThat(reviews.list("PENDING", "", 0, 20).getTotalElements()).isEqualTo(1);
        review(dhrTask(), "APPROVE");
        AuditContext.setOperator("42", "审批人");
        assertThat(reviews.list("PENDING", "", 0, 20).getTotalElements()).isZero();
        var done = reviews.list("DONE", "", 0, 20);
        assertThat(done.getTotalElements()).isEqualTo(2);
        assertThat(done.getContent()).extracting(row -> row.path("status").asText()).containsExactly("COMPLETED", "REJECTED");
    }

    private ObjectNode report() {
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("41", null,
                  org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("form-instances.view", "production.execution")));
        return reports.query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of(), 0, 20, null, null)).getData();
    }

    @ParameterizedTest @ValueSource(strings = {"anonymous", "no-menu", "act-only", "menu-only", "candidate", "unrelated", "submitter"})
    void ordinaryHttpReviewMatrixUsesMenuActionAndTaskIdentitySeparately(String scenario) throws Exception {
        dhr(true);
        var version = summaries.submit(1000L, summaryCommand());
        long task = dhrTask();
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(43,0,'unrelated-reviewer','其他用户','unused','ACTIVE')");
        String user = scenario.equals("unrelated") ? "43" : scenario.equals("submitter") ? "41" : "42";
        List<String> permissions = switch (scenario) {
            case "no-menu" -> List.of();
            case "act-only" -> List.of("dhr.reviews.act");
            case "menu-only" -> List.of("records.dhr-review");
            default -> List.of("records.dhr-review", "dhr.reviews.act");
        };
        String token = scenario.equals("anonymous") ? null : tokens.generateToken(user, "ordinary-account", "普通账号", 5, permissions);
        String before = reviewRows();
        int menuStatus = scenario.equals("anonymous") ? 401 : scenario.equals("no-menu") || scenario.equals("act-only") ? 403 : 200;
        boolean taskOwner = user.equals("42");
        int taskStatus = menuStatus != 200 ? menuStatus : taskOwner ? 200 : 403;
        var list = http("list-" + scenario, "GET", "/api/v1/dhr-reviews", token, null, menuStatus);
        if (menuStatus == 200) assertThat(list.at("/data/totalElements").asLong()).isEqualTo(taskOwner ? 1 : 0);
        var detail = http("detail-" + scenario, "GET", "/api/v1/dhr-reviews/" + task, token, null, taskStatus);
        if (taskStatus == 200) assertThat(detail.at("/data/version/id").asText()).isEqualTo(version.path("id").asText());
        http("audit-" + scenario, "GET", "/api/v1/dhr-reviews/" + task + "/audit", token, null, taskStatus);
        assertThat(reviewRows()).isEqualTo(before);
        int actStatus = scenario.equals("candidate") ? 200 : scenario.equals("anonymous") ? 401 : 403;
        http("approve-" + scenario, "POST", "/api/v1/dhr-reviews/" + task + "/actions", token,
                mapper.createObjectNode().put("action", "APPROVE").put("opinion", "普通账号核对")
                        .put("expectedSnapshotHash", version.path("snapshotHash").asText()), actStatus);
        if (actStatus != 200) assertThat(reviewRows()).isEqualTo(before);
        else assertThat(scalar("SELECT status FROM dhr_summary_review")).isEqualTo("APPROVED");
        assertThat(scalar("SELECT snapshot_hash FROM dhr_summary_version")).isEqualTo(version.path("snapshotHash").asText());
    }

    @Test void ordinaryHttpInboxIsPersonalAndDoesNotGrantDhrPageAccess() throws Exception {
        dhr(false); var version = summaries.submit(1000L, summaryCommand());
        String frozen = scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(43,0,'same-name-inbox','申请人','unused','ACTIVE')");
        requests.submit(command(BusinessType.CHANGE)); complete(taskId(), "APPROVE");
        String owner = tokens.generateToken("41", "rc-applicant"), other = tokens.generateToken("43", "same-name-inbox");
        var inbox = http("owner-inbox", "GET", "/api/v1/dhr-impact-notifications", owner, null, 200);
        assertThat(inbox.at("/data/unreadCount").asInt()).isEqualTo(1);
        String impact = inbox.at("/data/content/0/id").asText();
        assertThat(http("same-name-other-inbox", "GET", "/api/v1/dhr-impact-notifications", other, null, 200).at("/data/total").asInt()).isZero();
        http("other-mark-read", "POST", "/api/v1/dhr-impact-notifications/" + impact + "/read", other, null, 200);
        assertThat(http("owner-still-unread", "GET", "/api/v1/dhr-impact-notifications", owner, null, 200).at("/data/unreadCount").asInt()).isEqualTo(1);
        http("owner-without-summary-menu", "GET", "/api/v1/dhr-instances/1000/summary/versions/" + version.path("id").asText(), owner, null, 403);
        http("owner-mark-read", "POST", "/api/v1/dhr-impact-notifications/" + impact + "/read", owner, null, 200);
        assertThat(http("owner-read", "GET", "/api/v1/dhr-impact-notifications", owner, null, 200).at("/data/unreadCount").asInt()).isZero();
        http("anonymous-inbox", "GET", "/api/v1/dhr-impact-notifications", null, null, 401);
        assertThat(scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version")).isEqualTo(frozen);
    }

    @Test void ordinaryHandledReviewerReadsFrozenValuesAfterEffectiveChangeWithoutReapproving() throws Exception {
        dhr(true); var version = summaries.submit(1000L, summaryCommand());
        long task = dhrTask();
        String reviewer = tokens.generateToken("42", "rc-reviewer", "审批人", 5, List.of("records.dhr-review", "dhr.reviews.act"));
        http("ordinary-initial-approval", "POST", "/api/v1/dhr-reviews/" + task + "/actions", reviewer,
                mapper.createObjectNode().put("action", "APPROVE").put("opinion", "核查完成")
                        .put("expectedSnapshotHash", version.path("snapshotHash").asText()), 200);
        String frozen = scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version");
        actor(); requests.submit(command(BusinessType.CHANGE)); complete(taskId(), "APPROVE");
        var detail = http("ordinary-done-frozen-detail", "GET", "/api/v1/dhr-reviews/" + task, reviewer, null, 200);
        assertThat(detail.at("/data/version/candidates/0/fieldValues/value").asText()).isEqualTo("old");
        assertThat(detail.at("/data/version/reviewOutcome").asText()).isEqualTo("APPROVED");
        assertThat(detail.at("/data/canAct").asBoolean()).isFalse();
        assertThat(detail.at("/data/evidenceChanges").size()).isEqualTo(1);
        assertThat(mapper.readTree(scalar("SELECT values_json FROM form_instance_record")).path("value").asText()).isEqualTo("new");
        String before = reviewRows();
        http("ordinary-cannot-reapprove-done", "POST", "/api/v1/dhr-reviews/" + task + "/actions", reviewer,
                mapper.createObjectNode().put("action", "APPROVE").put("opinion", "不能重复审批")
                        .put("expectedSnapshotHash", version.path("snapshotHash").asText()), 400);
        assertThat(reviewRows()).isEqualTo(before);
        assertThat(scalar("SELECT candidate_snapshot||snapshot_hash FROM dhr_summary_version")).isEqualTo(frozen);
    }

    private String reviewRows() {
        return List.of("dhr_summary_version", "workflow_task", "signature", "audit_event", "form_instance_record")
                .stream().map(table -> scalar("SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.id),'[]'::jsonb)::text FROM " + table + " t")).toList().toString()
                + scalar("SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.object_id),'[]'::jsonb)::text FROM production_execution t")
                + scalar("SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.summary_version_id),'[]'::jsonb)::text FROM dhr_summary_review t");
    }

    private com.fasterxml.jackson.databind.JsonNode http(String label, String method, String path, String token,
            com.fasterxml.jackson.databind.JsonNode body, int expectedStatus) throws Exception {
        var request = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request(org.springframework.http.HttpMethod.valueOf(method), path);
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (body != null) request.contentType(MediaType.APPLICATION_JSON).content(body.toString());
        var response = mvc.perform(request).andReturn().getResponse();
        var result = mapper.readTree(response.getContentAsString(java.nio.charset.StandardCharsets.UTF_8));
        String output = System.getProperty("edhr.audit.dhrHttpOutput");
        if (output != null) Files.writeString(Path.of(output), mapper.createObjectNode().put("case", label).put("method", method)
                .put("path", path).put("expectedStatus", expectedStatus).put("actualStatus", response.getStatus()).set("body", result).toString() + "\n",
                StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        assertThat(response.getStatus()).as(label).isEqualTo(expectedStatus);
        return result;
    }

    private void personnel() {
        String hash = passwords.encode("test-signature-password");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES (43,0,'rc-target','新审批人',?,'ACTIVE'),(44,0,'rc-manager','干预人',?,'ACTIVE'),(45,1,'rc-outside','外租户',?,'ACTIVE')", hash, hash, hash);
        jdbc.update("INSERT INTO signature(id,target_type,target_id,meaning,signer_id,signer_name,signature_password_hash,snapshot_data) VALUES (-44,'USER_PROFILE','44','认证','44','干预人',?,'{}')", hash);
        jdbc.update("INSERT INTO role(id,tenant_id,code,name) VALUES (4444,0,'WORKFLOW_OPERATIONS_TEST','干预测试') ON CONFLICT(id) DO NOTHING");
        jdbc.update("INSERT INTO role_permission(id,role_id,permission_id) SELECT 4444,4444,id FROM permission WHERE code='workflow.intervene' ON CONFLICT(id) DO NOTHING");
        jdbc.update("INSERT INTO user_role(id,user_id,role_id) VALUES (4444,44,4444) ON CONFLICT(id) DO NOTHING");
        jdbc.update("UPDATE workflow_task SET candidate_snapshot='{\"userIds\":[\"42\",\"43\"]}'::jsonb WHERE instance_id IN (SELECT id FROM workflow_instance WHERE business_type IN ('CHANGE','OBSOLETE'))");
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
        assertThatThrownBy(() -> responsibility.transferTargets(task, "", 1, 100).content()).hasMessageContaining("无权");
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

    private void grant(long user, String... codes) {
        long role = 6000 + user;
        jdbc.update("INSERT INTO role(id,tenant_id,code,name) VALUES (?,0,?,?) ON CONFLICT(id) DO NOTHING", role,"CENTRAL_TEST_"+user,"集中流程验收");
        jdbc.update("INSERT INTO user_role(id,user_id,role_id) VALUES (?,?,?) ON CONFLICT(id) DO NOTHING",role,user,role);
        for (String code : codes) jdbc.update("INSERT INTO role_permission(id,role_id,permission_id) SELECT ?,?,id FROM permission WHERE code=? ON CONFLICT(role_id,permission_id) DO NOTHING",ids.nextId(),role,code);
    }
    private void pagedPersonnel() {
        personnel();
        jdbc.update("INSERT INTO role(id,tenant_id,code,name) VALUES(8100000,0,'PAGED_PERSONNEL_TEST','分页人员测试')");
        for (String code : List.of("production.execution","form-management.review","records.dhr-review","dhr.reviews.act"))
            jdbc.update("INSERT INTO role_permission(id,role_id,permission_id) SELECT ?,8100000,id FROM permission WHERE code=?", ids.nextId(), code);
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) SELECT 1000+n,0,'paged-admin-'||n,'paged-admin','not-used','ACTIVE' FROM generate_series(0,150) n");
        var memberships = new java.util.ArrayList<Object[]>();
        for (int i = 0; i < 151; i++) memberships.add(new Object[]{ids.nextId(), 1000L + i, 8100000L});
        jdbc.batchUpdate("INSERT INTO user_role(id,user_id,role_id) VALUES(?,?,?)", memberships);
    }
    @AfterEach void clearPagedPersonnelRole() {
        jdbc.update("DELETE FROM user_role WHERE role_id=8100000");
        jdbc.update("DELETE FROM role_permission WHERE role_id=8100000");
        jdbc.update("DELETE FROM role WHERE id=8100000");
    }
    private void expectLaterPersonnelPage(String endpoint, String token, String... parameters) throws Exception {
        var request = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(endpoint)
                .header("Authorization", "Bearer " + token).param("keyword", "paged-admin").param("page", "3").param("size", "50");
        for (int i = 0; i < parameters.length; i += 2) request.param(parameters[i], parameters[i + 1]);
        mvc.perform(request).andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.data.content.length()").value(50))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.data.content[0].id").value("1100"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.data.hasNext").value(true));
    }
    @Test void centralFormAndProductionTransferApisExposeQualifiedLaterPages() throws Exception {
        pagedPersonnel(); String id = activeForm();
        var form = (ObjectNode) snapshot.path("operations").get(0).path("forms").get(0);
        ((ObjectNode) form.path("flow").path("nodes").get(1).path("data").path("config"))
                .putArray("buttons").addObject().put("action", "TRANSFER").put("visible", true);
        jdbc.update("UPDATE production_execution SET snapshot_json=?", snapshot.toString());
        String managerToken = tokens.generateToken("44", "rc-manager", "干预人", 5, List.of("workflow.intervene"));
        expectLaterPersonnelPage("/api/v1/workflow/operations/tasks/" + id + ":review/reassignment-targets", managerToken);
        String reviewerToken = tokens.generateToken("42", "rc-reviewer", "审批人", 5, List.of("production.execution", "form-management.review"));
        expectLaterPersonnelPage("/api/v1/production/execution/109/transfer-targets", reviewerToken,
                "operationId", "op", "formId", "form", "instanceId", "form");
    }
    @Test void recordControlTargetApiKeepsItsScopeOnLaterPages() throws Exception {
        requests.submit(command(BusinessType.CHANGE)); pagedPersonnel(); long recordTask = taskId();
        jdbc.update("UPDATE workflow_task SET candidate_snapshot=jsonb_build_object('userIds',(SELECT jsonb_agg(id::text) FROM user_account WHERE id IN (42,43) OR id BETWEEN 1000 AND 1150)) WHERE id=?", recordTask);
        String reviewerToken = tokens.generateToken("42", "rc-reviewer", "审批人", 5, List.of("workflow.tasks"));
        expectLaterPersonnelPage("/api/v1/workflow/operations/tasks/" + recordTask + "/transfer-targets", reviewerToken);
    }
    @Test void dhrTargetApiKeepsItsPermissionsOnLaterPages() throws Exception {
        pagedPersonnel();
        dhr(true); summaries.submit(1000L,summaryCommand());
        String managerToken = tokens.generateToken("44", "rc-manager", "干预人", 5, List.of("workflow.intervene"));
        expectLaterPersonnelPage("/api/v1/workflow/operations/tasks/" + dhrTask() + "/reassignment-targets", managerToken);
    }
    private void login(String id, String... permissions) {
        AuditContext.setOperator(id,"用户"+id);
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(id,null,
                        org.springframework.security.core.authority.AuthorityUtils.createAuthorityList(permissions)));
    }
    private String activeForm() throws Exception {
        snapshot = (ObjectNode)mapper.readTree(scalar("SELECT snapshot_json FROM production_execution"));
        ObjectNode form = (ObjectNode)snapshot.path("operations").get(0).path("forms").get(0);
        form.set("flow",mapper.readTree("""
            {"nodes":[{"id":"fill","data":{"kind":"START","label":"填写"}},
             {"id":"review","data":{"kind":"APPROVAL","label":"表单复核","config":{"approverSubjects":[{"type":"USER","id":"42"}]}}},
             {"id":"end","data":{"kind":"END","label":"结束"}}],
             "edges":[{"id":"a","source":"fill","target":"review"},{"id":"b","source":"review","target":"end"}]}
            """));
        state = (ObjectNode)mapper.readTree(scalar("SELECT state_json FROM production_execution"));
        ((ObjectNode)state.path("operations").path("op")).put("status","IN_PROGRESS");
        ObjectNode progress=(ObjectNode)state.path("operations").path("op").path("forms").path("form");
        progress.put("status","ACTIVE").putArray("active").add("review");
        progress.putArray("done").add("fill");
        progress.putObject("approvers").putArray("review").add("42");
        progress.putObject("restrictedApprovers").put("review",true); progress.putObject("transferAssignees");
        state.putArray("history").addObject().put("operationId","op").put("formId","form").put("copyId","form").put("nodeId","fill")
                .put("actionCode","SUBMIT").put("operator","41").put("operatorName","申请人").put("at","2026-11-02T10:00:00");
        jdbc.update("UPDATE production_object SET status='IN_PROGRESS'");
        jdbc.update("UPDATE production_execution SET snapshot_json=?,state_json=?",snapshot.toString(),state.toString());
        return "form-"+scalar("SELECT id FROM form_instance_record");
    }
    private void unqualifiedUsersBeforeReviewTarget() {
        jdbc.update("UPDATE user_account SET display_name='target-scope-Z' WHERE id=43");
        jdbc.update("""
            INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status)
            SELECT id,0,'target-limit-'||id,'target-scope-0-'||id,'not-used','ACTIVE'
            FROM generate_series(1000,1119) id
            """);
        grant(1000,"production.execution");
        grant(1001,"form-management.review");
        grant(1002,"records.dhr-review");
        grant(1003,"dhr.reviews.act");
    }
    @Test void formReassignmentSearchQualifiesBeforeLimitingUsers() throws Exception {
        personnel(); grant(43,"production.execution","form-management.review");
        String id=activeForm(); manager(); unqualifiedUsersBeforeReviewTarget();
        assertThat(formOperations.targets(id+":review","target-scope", 1, 100).content()).extracting(row->row.get("id")).containsExactly("43");
    }
    @Test void dhrReassignmentSearchQualifiesBeforeLimitingUsers() {
        personnel(); grant(43,"records.dhr-review","dhr.reviews.act");
        dhr(true); summaries.submit(1000L,summaryCommand()); manager(); unqualifiedUsersBeforeReviewTarget();
        assertThat(responsibility.reassignmentTargets(dhrTask(),"target-scope", 1, 100).content()).extracting(row->row.get("id")).containsExactly("43");
    }
    @SuppressWarnings("unchecked") private com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command formCommand(String id) {
        var tasks=(List<java.util.Map<String,Object>>)formOperations.detail(Long.parseLong(id.substring(5))).get("tasks");
        return new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command("43","值班审批人调整",tasks.getFirst().get("taskState").toString(),"rc-manager","test-signature-password");
    }

    @Test void centralDhrReassignmentPreservesEvidenceChangesHandlerAndAppearsInBothDomainAudits() throws Exception {
        personnel(); grant(43,"records.dhr-review","dhr.reviews.act"); dhr(true); summaries.submit(1000L,summaryCommand()); manager();
        long task=dhrTask(); long instance=taskRepository.findById(task).orElseThrow().getInstanceId();
        String frozen=scalar("SELECT candidate_snapshot||snapshot_hash||base_directory_snapshot||overlay_directory_snapshot FROM dhr_summary_version");
        String source=scalar("SELECT values_json FROM form_instance_record");
        assertThat(operations.list(1,20,"DHR-LINKAGE","",false).getContent()).hasSize(1);
        assertThat(operations.detail(instance).get("businessKey")).isEqualTo("DHR-LINKAGE · V1");
        assertThat(responsibility.reassignmentTargets(task,"", 1, 100).content()).extracting(r->r.get("id")).containsExactly("43");
        var command=reassignment(task,"43","test-signature-password"); responsibility.reassign(task,command);
        assertThatThrownBy(()->responsibility.reassign(task,command)).hasMessageContaining("已变化");
        assertThat(scalar("SELECT candidate_snapshot->>'originSnapshot' FROM workflow_task WHERE id="+task)).contains("42");
        assertThat(scalar("SELECT candidate_snapshot||snapshot_hash||base_directory_snapshot||overlay_directory_snapshot FROM dhr_summary_version")).isEqualTo(frozen);
        assertThat(scalar("SELECT values_json FROM form_instance_record")).isEqualTo(source);
        assertThat(summaries.audit(1000L,0).path("events").toString()).contains("REASSIGN","新审批人","原处理人无法继续处理");
        long version=jdbc.queryForObject("SELECT id FROM dhr_summary_version",Long.class);
        assertThat(summaries.versionAudit(1000L,version,0).path("events").toString()).contains("REASSIGN","signatureId");
        login("42","records.dhr-review");
        assertThat(reviews.list("PENDING","",0,20).getTotalElements()).isZero();
        assertThatThrownBy(()->reviews.detail(task)).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
        login("43","records.dhr-review");
        assertThat(reviews.list("PENDING","",0,20).getTotalElements()).isEqualTo(1);
        assertThat(operations.list(1,20,"DHR-LINKAGE","",false).getTotalElements()).isEqualTo(1);
        reviews.act(task,mapper.createObjectNode().put("action","RETURN").put("opinion","领域退回")
                .put("expectedSnapshotHash",scalar("SELECT snapshot_hash FROM dhr_summary_version")));
        assertThat(scalar("SELECT summary_status FROM dhr_instance")).isEqualTo("DRAFT");
        manager(); assertThatThrownBy(()->responsibility.reassign(task,reassignment(task,"42","test-signature-password"))).hasMessageContaining("已结束");
    }
    @Test void dhrReassignmentRejectsBadSignatureTargetAndUnrelatedLogReadersAndRollsBackOnAuditFailure() {
        personnel(); grant(43,"records.dhr-review","dhr.reviews.act"); dhr(true); summaries.submit(1000L,summaryCommand()); manager(); long task=dhrTask();
        long signatures=count("signature"); String before=scalar("SELECT candidate_snapshot::text FROM workflow_task WHERE id="+task);
        assertThatThrownBy(()->responsibility.reassign(task,reassignment(task,"43",""))).hasMessageContaining("密码");
        assertThatThrownBy(()->responsibility.reassign(task,reassignment(task,"44","test-signature-password"))).hasMessageContaining("候选范围");
        assertThatThrownBy(()->responsibility.reassign(task,reassignment(task,"45","test-signature-password"))).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(()->responsibility.transferContext(task)).hasMessageContaining("不支持处理人转办");
        login("44","workflow.logs","records.dhr-review");
        assertThat(operations.list(1,20,"DHR-LINKAGE","",false).getTotalElements()).isZero();
        manager();
        jdbc.execute("CREATE FUNCTION reject_workflow_action() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='REASSIGN' THEN RAISE EXCEPTION 'fixture rejection'; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER reject_workflow_action BEFORE INSERT ON audit_event FOR EACH ROW EXECUTE FUNCTION reject_workflow_action()");
        assertThatThrownBy(()->responsibility.reassign(task,reassignment(task,"43","test-signature-password"))).isInstanceOf(RuntimeException.class);
        assertThat(count("signature")).isEqualTo(signatures); assertThat(count("workflow_intervention")).isZero();
        assertThat(scalar("SELECT candidate_snapshot::text FROM workflow_task WHERE id="+task)).isEqualTo(before);
    }
    @Test void centralFormReassignmentIsSignedDoesNotAdvanceFlowAndIsVisibleInFormAudit() throws Exception {
        personnel(); grant(43,"production.execution","form-management.review"); String id=activeForm(); manager(); String key=id+":review";
        assertThat(operations.list(1,20,"","",true).getContent()).extracting(r->r.get("businessType")).containsExactly("FORM_PROCESS");
        String record=scalar("SELECT snapshot_json||values_json FROM form_instance_record");
        var command=formCommand(id); long signatures=count("signature");
        assertThatThrownBy(()->formOperations.reassign(key,new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command("43","原因",command.expectedTaskState(),"rc-manager",""))).hasMessageContaining("密码");
        assertThat(formOperations.targets(key,"", 1, 100).content()).extracting(r->r.get("id")).containsExactly("43");
        formOperations.reassign(key,command);
        assertThat(count("signature")).isEqualTo(signatures+1);
        assertThat(scalar("SELECT snapshot_json||values_json FROM form_instance_record")).isEqualTo(record);
        var progress=mapper.readTree(scalar("SELECT state_json FROM production_execution")).path("operations").path("op").path("forms").path("form");
        assertThat(progress.path("active").toString()).isEqualTo("[\"review\"]");
        assertThat(progress.path("approvers").path("review").toString()).isEqualTo("[\"42\"]");
        var form=snapshot.path("operations").get(0).path("forms").get(0); var node=form.path("flow").path("nodes").get(1);
        assertThat(executionAccess.canAct(form,node,progress,"42")).isFalse(); assertThat(executionAccess.canAct(form,node,progress,"43")).isTrue();
        assertThatThrownBy(()->formOperations.reassign(key,command)).hasMessageContaining("已变化");
        assertThat(formOperations.detail(Long.parseLong(id.substring(5))).get("logs").toString()).contains("TASK_REASSIGN","新审批人");
        var audit=auditController.list(1,20,"createdAt","desc","PRODUCTION_EXECUTION","109", "REASSIGN",null,null,null,null,null).getData().getContent();
        assertThat(audit).hasSize(1); assertThat(audit.getFirst().getActionLabel()).isEqualTo("重新分配");
        assertThat(audit.getFirst().getDataSummary()).isEqualTo("RC-BATCH · op");
        assertThat(audit.getFirst().getContentAfter()).contains("formInstanceNo","previousAssigneeName","signatureId","signerName","值班审批人调整");
        login("42","production.execution","form-management.review");
        assertThat(formWorklists.list("REVIEW_PENDING",new org.springframework.util.LinkedMultiValueMap<>()).totalElements()).isZero();
        login("43","production.execution","form-management.review");
        assertThat(formWorklists.list("REVIEW_PENDING",new org.springframework.util.LinkedMultiValueMap<>()).totalElements()).isEqualTo(1);
    }
    @Test void centralFormScopeQualifiedTargetsAndBusinessLockRemainEnforced() throws Exception {
        personnel(); grant(43,"production.execution","form-management.review"); String id=activeForm(); manager(); var command=formCommand(id); String key=id+":review";
        assertThatThrownBy(()->formOperations.reassign(key,new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command("45","原因",command.expectedTaskState(),"rc-manager","test-signature-password"))).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(()->formOperations.reassign(key,new com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command("44","原因",command.expectedTaskState(),"rc-manager","test-signature-password"))).hasMessageContaining("审批权限");
        assertThatThrownBy(()->formOperations.reassign(id+":fill",command)).hasMessageContaining("已结束或尚未到达");
        login("44","workflow.logs"); assertThat(operations.list(1,20,"","",false).getTotalElements()).isZero();
        assertThatThrownBy(()->formOperations.detail(Long.parseLong(id.substring(5)))).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);
        login("42","production.execution","form-management.filling"); assertThat(operations.list(1,20,"","",false).getTotalElements()).isZero();
        login("42","production.execution","form-management.review"); assertThat(operations.list(1,20,"","",false).getTotalElements()).isEqualTo(1);
        manager(); dhr(false); jdbc.update("UPDATE dhr_instance SET summary_status='FORMALIZED'");
        assertThat(operations.list(1,20,"","",true).getTotalElements()).isZero();
        assertThatThrownBy(()->formOperations.reassign(key,command)).hasMessageContaining("已定稿");
    }
    @Test void centralUnionCountsFiltersAndPaginatesBothSourcesBeforeReturningRows() throws Exception {
        requests.submit(command(BusinessType.CHANGE)); personnel(); String id=activeForm(); manager();
        assertThat(operations.list(1,1,"","",false).getTotalElements()).isEqualTo(2);
        var first=operations.list(1,1,"","",false).getContent().getFirst().get("id");
        var second=operations.list(2,1,"","",false).getContent().getFirst().get("id");
        assertThat(first).isNotEqualTo(second); assertThat(List.of(first,second)).contains(id);
        assertThat(operations.list(1,20,id,"",false).getTotalElements()).isEqualTo(1);
        assertThat(operations.list(1,20,"%","",false).getTotalElements()).isZero();
        assertThat(operations.list(1,20,"","COMPLETED",false).getTotalElements()).isZero();
    }
    @Test void concurrentFormReassignmentsHaveOneWinnerAndAuditFailureRollsBack() throws Exception {
        personnel(); grant(43,"production.execution","form-management.review"); String id=activeForm(); manager(); var command=formCommand(id); String key=id+":review";
        String before=scalar("SELECT state_json FROM production_execution"); long signatures=count("signature");
        jdbc.execute("CREATE FUNCTION reject_workflow_action() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='REASSIGN' THEN RAISE EXCEPTION 'fixture rejection'; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER reject_workflow_action BEFORE INSERT ON audit_event FOR EACH ROW EXECUTE FUNCTION reject_workflow_action()");
        assertThatThrownBy(()->formOperations.reassign(key,command)).isInstanceOf(RuntimeException.class);
        assertThat(count("signature")).isEqualTo(signatures); assertThat(scalar("SELECT state_json FROM production_execution")).isEqualTo(before);
        jdbc.execute("DROP FUNCTION reject_workflow_action() CASCADE");
        var pool=Executors.newFixedThreadPool(2); var start=new CountDownLatch(1);
        Callable<Boolean> action=()->{manager();try{start.await();formOperations.reassign(key,command);return true;}catch(RuntimeException e){return false;}finally{clearActor();}};
        try {var a=pool.submit(action);var b=pool.submit(action);start.countDown();
            assertThat(List.of(a.get(15,TimeUnit.SECONDS),b.get(15,TimeUnit.SECONDS))).containsExactlyInAnyOrder(true,false);
            assertThat(count("signature")).isEqualTo(signatures+1);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE action='REASSIGN'",Long.class)).isEqualTo(1);
        } finally {pool.shutdownNow();}
    }

    @Test void genericReassignmentStillRequiresSignatureAndOriginalHandlingQualification() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); manager(); long task = taskId();
        jdbc.update("UPDATE workflow_instance SET business_type='SYNTHETIC_CASE'");
        assertThat(responsibility.reassignmentTargets(task, "", 1, 100).content()).extracting(row -> row.get("id")).containsExactly("43");
        assertThatThrownBy(() -> responsibility.reassign(task, reassignment(task, "44", "test-signature-password"))).hasMessageContaining("候选范围");
        responsibility.reassign(task, reassignment(task, "43", "test-signature-password"));
        assertThat(scalar("SELECT assignee_id FROM workflow_task")).isEqualTo("43");
        assertThat(count("workflow_intervention")).isEqualTo(1);
    }

    @ParameterizedTest @ValueSource(strings = {"CHANGE", "OBSOLETE", "SYNTHETIC_CASE"})
    void frozenReassignmentSearchQualifiesBeforeLimitingUsers(String businessType) {
        requests.submit(command(businessType.equals("SYNTHETIC_CASE") ? BusinessType.CHANGE : BusinessType.valueOf(businessType)));
        personnel(); manager(); long task = taskId(); unqualifiedUsersBeforeReviewTarget();
        if (businessType.equals("SYNTHETIC_CASE")) jdbc.update("UPDATE workflow_instance SET business_type=?", businessType);
        assertThat(responsibility.reassignmentTargets(task, "target-scope", 1, 100).content()).extracting(row -> row.get("id")).containsExactly("43");
    }

    @ParameterizedTest @ValueSource(strings = {"CHANGE", "OBSOLETE"})
    void recordControlTransferSearchQualifiesBeforeLimitingUsers(String businessType) {
        requests.submit(command(BusinessType.valueOf(businessType))); personnel(); long task = taskId();
        unqualifiedUsersBeforeReviewTarget(); AuditContext.setOperator("42", "审批人");
        assertThat(responsibility.transferTargets(task, "target-scope", 1, 100).content()).extracting(row -> row.get("id")).containsExactly("43");
    }

    @Test void repeatedResponsibilitySearchUsesOriginalCandidatesBeforeLimit() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); manager(); long task = taskId();
        responsibility.reassign(task, reassignment(task, "43", "test-signature-password"));
        unqualifiedUsersBeforeReviewTarget(); jdbc.update("UPDATE user_account SET display_name='target-scope-Z2' WHERE id=42");
        String before = scalar("SELECT candidate_snapshot::text FROM workflow_task");
        AuditContext.setOperator("43", "新审批人");
        assertThat(responsibility.transferTargets(task, "target-scope", 1, 100).content()).extracting(row -> row.get("id")).containsExactly("42");
        assertThat(scalar("SELECT candidate_snapshot::text FROM workflow_task")).isEqualTo(before);
    }

    @Test void unrestrictedRecordControlTargetsExcludeApplicantBeforeLimit() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); manager(); long task = taskId();
        unqualifiedUsersBeforeReviewTarget();
        jdbc.update("UPDATE user_account SET display_name='limit-scope-'||id WHERE id>=1000");
        jdbc.update("UPDATE user_account SET display_name='limit-scope' WHERE id=41");
        jdbc.update("UPDATE workflow_task SET candidate_snapshot='{\"unrestricted\":true}'::jsonb");
        var targets = responsibility.reassignmentTargets(task, "limit-scope", 1, 100).content();
        assertThat(targets).hasSize(100);
        assertThat(targets).extracting(row -> row.get("id")).doesNotContain("41", "42");
    }

    @Test void emptyFrozenCandidatesDoNotBecomeUnrestricted() {
        requests.submit(command(BusinessType.CHANGE)); personnel(); manager(); long task = taskId();
        unqualifiedUsersBeforeReviewTarget(); jdbc.update("UPDATE workflow_task SET candidate_snapshot='{\"userIds\":[]}'::jsonb");
        assertThat(responsibility.reassignmentTargets(task, "target-scope", 1, 100).content()).isEmpty();
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
    @Test void concurrentIdenticalSubmissionsCreateOneApplicationSignatureAndWorkflow() throws Exception {
        var command=command(BusinessType.CHANGE); long signatures=count("signature");
        var pool=Executors.newFixedThreadPool(2); var start=new CountDownLatch(1);
        Callable<String> submit=()->{actor();try{start.await();return requests.submit(command).path("id").asText();}finally{AuditContext.clear();}};
        try {
            var first=pool.submit(submit);var second=pool.submit(submit);start.countDown();
            assertThat(first.get(15,TimeUnit.SECONDS)).isEqualTo(second.get(15,TimeUnit.SECONDS));
            assertThat(count("record_control_request")).isEqualTo(1);
            assertThat(count("workflow_instance")).isEqualTo(1);
            assertThat(count("signature")).isEqualTo(signatures+1);
            assertThat(scalar("SELECT values_json::jsonb->>'value' FROM form_instance_record")).isEqualTo("old");
        } finally {pool.shutdownNow();}
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
