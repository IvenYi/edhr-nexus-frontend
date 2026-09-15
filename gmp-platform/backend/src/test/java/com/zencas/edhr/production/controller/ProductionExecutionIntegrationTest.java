package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.compliance.controller.FileController;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.*;
import com.zencas.edhr.identity.service.SubjectResolver;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.masterdata.service.ProductProcessResolutionService;
import com.zencas.edhr.production.entity.*;
import com.zencas.edhr.production.repository.*;
import com.zencas.edhr.production.service.*;
import com.zencas.edhr.workflow.engine.StateMachineService;
import jakarta.persistence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = ProductionExecutionIntegrationTest.Config.class, webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT, properties = {
    "server.port=${execution.test.port:0}",
    "spring.liquibase.enabled=false",
    "spring.datasource.url=${execution.test.url:jdbc:h2:mem:production-execution;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE}",
    "spring.datasource.driver-class-name=${execution.test.driver:org.h2.Driver}",
    "spring.datasource.username=${execution.test.user:sa}", "spring.datasource.password=",
    "spring.jpa.database-platform=${execution.test.dialect:org.hibernate.dialect.H2Dialect}",
    "spring.jpa.properties.hibernate.dialect=${execution.test.dialect:org.hibernate.dialect.H2Dialect}",
    "spring.jpa.hibernate.ddl-auto=update"
})
@AutoConfigureMockMvc
class ProductionExecutionIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider tokens;
    @MockBean MaterialRepository materials;
    @MockBean ProductProcessVersionRepository processVersions;
    @MockBean ProductProcessResolutionService resolution;
    @MockBean StateMachineService stateMachines;
    @Autowired UserAccountRepository users;
    @Autowired PasswordEncoder passwords;
    @Autowired FileObjectRepository files;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactions;
    @Autowired ProductionService production;
    @MockBean DepartmentRepository departments;
    @MockBean RoleRepository roles;
    @MockBean UserDepartmentRepository userDepartments;
    @MockBean UserRoleRepository userRoles;
    @MockBean com.zencas.edhr.system.repository.IconAssetRepository icons;
    @MockBean com.zencas.edhr.system.repository.SystemSettingRepository settings;
    @SpyBean AuditEventRepository audits;

    @BeforeEach void setup() {
        for (String ddl : List.of(
            "material(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),code VARCHAR(64),name VARCHAR(128),specification VARCHAR(128),unit VARCHAR(16))",
            "product_process_version(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),version_label VARCHAR(64),production_mode VARCHAR(64),production_form VARCHAR(64),route_version_id BIGINT,dhr_template_version_id BIGINT)",
            "route(id BIGINT PRIMARY KEY,name VARCHAR(128),code VARCHAR(64))",
            "route_version(id BIGINT PRIMARY KEY,route_id BIGINT,version VARCHAR(64))",
            "dhr_template(id BIGINT PRIMARY KEY,name VARCHAR(128),code VARCHAR(64))",
            "dhr_template_version(id BIGINT PRIMARY KEY,dhr_template_id BIGINT,version_label VARCHAR(64))",
            "route_node(id BIGINT PRIMARY KEY,route_version_id BIGINT,node_key VARCHAR(64),operation_id BIGINT,operation_code VARCHAR(64),operation_name VARCHAR(128),node_type VARCHAR(32),config_json TEXT,sort_order INT)",
            "route_relation(id BIGINT PRIMARY KEY,route_version_id BIGINT,source_node_key VARCHAR(64),target_node_key VARCHAR(64),relation_type VARCHAR(64),rule_expression TEXT,priority INT)",
            "product_process_operation_binding(id BIGINT PRIMARY KEY,product_process_version_id BIGINT,route_node_key VARCHAR(64))",
            "product_process_operation_form_binding(id BIGINT PRIMARY KEY,product_process_operation_binding_id BIGINT,form_template_version_id BIGINT,dhr_template_item_id BIGINT,required BOOLEAN,sort_order INT)",
            "product_process_operation_document_binding(id BIGINT PRIMARY KEY,product_process_operation_binding_id BIGINT,document_version_id BIGINT,page_start INT,page_end INT,sort_order INT)",
            "sop_document(id BIGINT PRIMARY KEY,title VARCHAR(128))",
            "document_version(id BIGINT PRIMARY KEY,document_id BIGINT,code VARCHAR(64),version VARCHAR(64),file_id BIGINT)",
            "form_template(id BIGINT PRIMARY KEY,name VARCHAR(128),code VARCHAR(64),category_name VARCHAR(128),tenant_id VARCHAR(64) DEFAULT 'default',status VARCHAR(32) DEFAULT 'ACTIVE')",
            "form_template_version(id BIGINT PRIMARY KEY,template_id BIGINT,version_label VARCHAR(64),model_design_json TEXT,canvas_design_json TEXT,tenant_id VARCHAR(64) DEFAULT 'default',status VARCHAR(32) DEFAULT 'PUBLISHED')",
            "workflow_definition(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),type VARCHAR(32),name VARCHAR(128))",
            "workflow_definition_version(id BIGINT PRIMARY KEY,definition_id BIGINT,version_number INT,status VARCHAR(32),is_current BOOLEAN,nodes_json TEXT,edges_json TEXT)",
            "workflow_binding_rule(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),definition_id BIGINT,rule_type VARCHAR(32),is_active BOOLEAN,product_id BIGINT,product_family_id BIGINT,operation_id BIGINT)",
            "product_family_member(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),product_id BIGINT,product_family_id BIGINT)")) {
            jdbc.execute("CREATE TABLE IF NOT EXISTS " + ddl);
            jdbc.update("DELETE FROM " + ddl.substring(0, ddl.indexOf('(')));
        }
        jdbc.update("DELETE FROM production_execution"); jdbc.update("DELETE FROM production_object"); jdbc.update("DELETE FROM work_order"); jdbc.update("DELETE FROM audit_event");
        jdbc.update("DELETE FROM signature"); jdbc.update("DELETE FROM user_account");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(1,0,'operator','测试操作员',?,'ACTIVE')", passwords.encode("test-secret"));
        jdbc.update("INSERT INTO material VALUES(1,'default','P01','导管','规格A','件')");
        jdbc.update("INSERT INTO product_process_version VALUES(2,'default','配置V1','量产','批次',3,4)");
        jdbc.update("INSERT INTO route VALUES(3,'导管装配','R01')"); jdbc.update("INSERT INTO route_version VALUES(3,3,'V1')");
        jdbc.update("INSERT INTO dhr_template VALUES(4,'导管生产记录','D01')"); jdbc.update("INSERT INTO dhr_template_version VALUES(4,4,'V1')");
        jdbc.update("INSERT INTO route_node VALUES(11,3,'a',11,'O01','装配','OPERATION','{}',1),(12,3,'b',12,'O02','检验','OPERATION','{}',2)");
        jdbc.update("INSERT INTO route_relation VALUES(1,3,'a','b','SEQUENTIAL',NULL,1)");
        jdbc.update("INSERT INTO product_process_operation_binding VALUES(11,2,'a'),(12,2,'b')");
        jdbc.update("INSERT INTO form_template(id,name,code,category_name) VALUES(5,'装配记录','F01','生产记录')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_label,model_design_json,canvas_design_json) VALUES(5,5,'V1',?,?)",
            "{\"fields\":[{\"id\":\"temperature\",\"name\":\"温度\",\"type\":\"number\",\"status\":\"enabled\"}]}",
            "{\"bindings\":{\"fieldId\":\"temperature\",\"required\":true}}");
        jdbc.update("INSERT INTO product_process_operation_form_binding VALUES(51,11,5,50,true,1)");
        jdbc.update("INSERT INTO work_order(id,tenant_id,order_no,product_id,planned_quantity,status,created_at,updated_at) VALUES(100,'default','WO01',1,2,'CREATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO production_object(id,tenant_id,work_order_id,object_no,object_type,process_version_id,target_quantity,good_quantity,ng_quantity,scrap_quantity,status,created_at,updated_at) VALUES(101,'default',100,'B01','BATCH',2,1,0,0,0,'CREATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),(102,'default',100,'SN01','SN',2,1,0,0,0,'CREATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
    }

    @Test void batchAndSnScanAreReadOnlyAndReturnCorrectConfiguration() throws Exception {
        for (String barcode : List.of("B01", "SN01")) {
            mvc.perform(auth(get("/api/v1/production/execution/scan").param("barcode", barcode))).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.snapshot.context.objectNo").value(barcode))
                .andExpect(jsonPath("$.data.snapshot.context.workOrderNo").value("WO01"))
                .andExpect(jsonPath("$.data.snapshot.context.productName").value("导管"))
                .andExpect(jsonPath("$.data.snapshot.context.processVersion").value("配置V1"))
                .andExpect(jsonPath("$.data.snapshot.context.dhrName").value("导管生产记录"))
                .andExpect(jsonPath("$.data.availability.a.canStart").value(true))
                .andExpect(jsonPath("$.data.availability.b.canStart").value(false));
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM production_execution", Integer.class)).isZero();
    }

    @Test void outputUsesSavedPurposeFieldsAndFrozenMappingWithoutChangingBatchCounters() throws Exception {
        String model = """
            {"fields":[
              {"id":"temperature","name":"良品","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_GOOD"}},
              {"id":"ng","name":"不良","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_NG"}},
              {"id":"scrap","name":"报废","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_SCRAP"}}
            ]}
            """;
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=5", model);
        for (long object : List.of(101L, 102L)) {
            action(object, "START", 0, "a", Map.of()).andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.operationOutputs.a.status").value("PENDING"));
            action(object, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", "0.1", "ng", "0.2", "scrap", 0)))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.data.operationOutputs.a.outputQuantity").value("0.3"))
                    .andExpect(jsonPath("$.data.operationOutputs.b.status").value("NOT_CONFIGURED"));
        }
        jdbc.update("UPDATE form_template_version SET model_design_json='{}' WHERE id=5");
        int auditsBeforeRead = jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class);
        mvc.perform(auth(get("/api/v1/production/execution/101"))).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.operationOutputs.a.outputQuantity").value("0.3"))
                .andExpect(jsonPath("$.data.snapshot.operations[0].forms[0].fields[0].typeConfig.businessPurpose").value("PRODUCTION_GOOD"));
        action(101, "SAVE", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 2, "ng", 1, "scrap", 0)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.operationOutputs.a.outputQuantity").value("3"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isGreaterThan(auditsBeforeRead);
        assertThat(jdbc.queryForObject("SELECT good_quantity FROM production_object WHERE id=101", java.math.BigDecimal.class)).isEqualByComparingTo("0");
        String persisted = jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class);
        assertThat(mapper.readTree(persisted).at("/operations/a/forms/form-51/values/temperature").asInt()).isEqualTo(2);
    }

    @Test void executionPersistsSnapshotDraftAndAuditThenCompletesOnlyAfterAllOperations() throws Exception {
        for (long object : List.of(101L, 102L)) {
            action(object, "START", 0, "a", Map.of()).andExpect(status().isOk());
            if (object == 101) jdbc.update("UPDATE route SET name='新的配置名称'");
            action(object, "COMPLETE", 1, "a", Map.of()).andExpect(status().isBadRequest());
            action(object, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
            mvc.perform(auth(get("/api/v1/production/execution/" + object))).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.state.operations.a.forms.form-51.values.temperature").value(22));
            action(object, "SUBMIT", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
            action(object, "END_FORM", 3, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
            action(object, "COMPLETE", 4, "a", Map.of()).andExpect(status().isOk());
            action(object, "START", 5, "b", Map.of()).andExpect(status().isOk());
            action(object, "COMPLETE", 6, "b", Map.of()).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.objectStatus").value("COMPLETED"));
        }
        assertThat(jdbc.queryForObject("SELECT status FROM work_order WHERE id=100", String.class)).isEqualTo("COMPLETED");
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class)).contains("导管装配").doesNotContain("新的配置名称");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event WHERE entity_type='PRODUCTION_EXECUTION'", Integer.class)).isEqualTo(14);
    }

    @Test void staleRevisionAndTerminatedObjectsCannotAdvance() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 0, "a", Map.of("formId", "form-51", "values", Map.of())).andExpect(status().isBadRequest());
        jdbc.update("UPDATE production_object SET status='EARLY_TERMINATED' WHERE id=101");
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of())).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(1);
    }

    @Test void concurrentStartCreatesOneExecutionAndOneAudit() throws Exception {
        try (var pool = Executors.newFixedThreadPool(2)) {
            Callable<Integer> start = () -> action(101, "START", 0, "a", Map.of()).andReturn().getResponse().getStatus();
            var results = pool.invokeAll(List.of(start, start));
            assertThat(List.of(results.get(0).get(), results.get(1).get())).containsExactlyInAnyOrder(200, 400);
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM production_execution", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(1);
    }

    @Test void failedAuditRollsBackObjectStateAndExecutionTogether() throws Exception {
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any(AuditEvent.class));
        action(101, "START", 0, "a", Map.of()).andExpect(status().is5xxServerError());
        assertThat(jdbc.queryForObject("SELECT status FROM production_object WHERE id=101", String.class)).isEqualTo("CREATED");
        assertThat(jdbc.queryForObject("SELECT status FROM work_order WHERE id=100", String.class)).isEqualTo("CREATED");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM production_execution", Integer.class)).isZero();
    }

    @Test void waitingExecutionSeesConcurrentTerminationAfterAcquiringLocks() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        CountDownLatch locked = new CountDownLatch(1), release = new CountDownLatch(1), submitted = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var termination = pool.submit(() -> new org.springframework.transaction.support.TransactionTemplate(transactions).execute(status -> {
                jdbc.queryForObject("SELECT id FROM work_order WHERE id=100 FOR UPDATE", Long.class);
                production.endObject(101L, "并发终止验收"); locked.countDown();
                try { if (!release.await(5, TimeUnit.SECONDS)) throw new IllegalStateException("test timeout"); }
                catch (InterruptedException e) { throw new RuntimeException(e); }
                return true;
            }));
            assertThat(locked.await(5, TimeUnit.SECONDS)).isTrue();
            var write = pool.submit(() -> { submitted.countDown(); return action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 25))).andReturn().getResponse().getStatus(); });
            assertThat(submitted.await(5, TimeUnit.SECONDS)).isTrue();
            try { assertThatThrownBy(() -> write.get(200, TimeUnit.MILLISECONDS)).isInstanceOf(TimeoutException.class); }
            finally { release.countDown(); }
            assertThat(termination.get(5, TimeUnit.SECONDS)).isTrue();
            assertThat(write.get(5, TimeUnit.SECONDS)).isEqualTo(400);
        }
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT status FROM production_object WHERE id=101", String.class)).isEqualTo("EARLY_TERMINATED");
    }

    @Test void missingPermissionCannotReadOrExecute() throws Exception {
        String token = tokens.generateToken("1", "operator", "操作员", 5, List.of("production.work-orders"));
        mvc.perform(get("/api/v1/production/execution/scan").param("barcode", "B01").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/production/execution/101/actions").contentType("application/json").content("{\"action\":\"START\",\"revision\":0,\"operationId\":\"a\"}").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
    }

    @Test void configuredWorkFormReplacesDuplicateEdhrSubmissionAndRequiresConfirmation() throws Exception {
        jdbc.update("INSERT INTO workflow_definition VALUES(7,'default','WORK','装配作业')");
        jdbc.update("INSERT INTO workflow_definition_version VALUES(7,7,1,'PUBLISHED',true,?,?)", """
            [{"id":"s","data":{"kind":"START"}},
             {"id":"f","data":{"kind":"FORM","config":{"formTemplateVersionId":"5"}}},
             {"id":"c","data":{"kind":"CONFIRMATION","label":"确认外观"}},
             {"id":"e","data":{"kind":"END"}}]
            """, """
            [{"source":"s","target":"f"},{"source":"f","target":"c"},{"source":"c","target":"e"}]
            """);
        jdbc.update("INSERT INTO workflow_binding_rule VALUES(7,'default',7,'SCOPED',true,1,NULL,11)");
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms.work-7-f.status").value("ACTIVE"));
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 25))).andExpect(status().isOk());
        action(101, "COMPLETE", 2, "a", Map.of()).andExpect(status().isBadRequest());
        action(101, "CONFIRM", 2, "a", Map.of("workId", "7", "nodeId", "c")).andExpect(status().isBadRequest());
        action(101, "END_FORM", 2, "a", Map.of("formId", "work-7-f")).andExpect(status().isOk());
        action(101, "CONFIRM", 3, "a", Map.of("workId", "7", "nodeId", "c")).andExpect(status().isOk());
        action(101, "COMPLETE", 4, "a", Map.of()).andExpect(status().isOk());
    }

    @Test void realApprovalIdentityAndPasswordSignaturePersistAtomically() throws Exception {
        seedSignedWork();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 25))).andExpect(status().isOk());
        String other = tokens.generateToken("2", "other", "其他人员", 5, List.of("production.execution"));
        mvc.perform(post("/api/v1/production/execution/101/actions").header("Authorization", "Bearer " + other).contentType("application/json")
            .content("{\"action\":\"APPROVE\",\"revision\":2,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{}}"))
            .andExpect(status().isBadRequest());
        action(101, "APPROVE", 2, "a", Map.of("formId", "work-7-f", "values", Map.of(), "account", "operator", "password", "wrong")).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature", Integer.class)).isZero();
        action(101, "APPROVE", 2, "a", Map.of("formId", "work-7-f", "values", Map.of(), "account", "operator", "password", "test-secret")).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT signer_id FROM signature", String.class)).isEqualTo("1");
        assertThat(jdbc.queryForObject("SELECT snapshot_data FROM signature", String.class)).contains("temperature").doesNotContain("test-secret", "password");
        action(101, "END_FORM", 3, "a", Map.of("formId", "work-7-f")).andExpect(status().isOk());
        action(101, "COMPLETE", 4, "a", Map.of()).andExpect(status().isOk());
    }

    @Test void legacyTextSubtableColumnsUseTheSameStableIdsAsTheUnifiedRenderer() throws Exception {
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=5", """
            {"fields":[{"id":"rows","name":"检测记录","type":"subTable","typeConfig":{"columns":"项目,结果"}}]}
            """);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.snapshot.operations[0].forms[0].fields[0].typeConfig.columns[0].id").value("sub-field-1"));
        action(101, "SUBMIT", 1, "a", Map.of("formId", "form-51", "values", Map.of("rows", List.of(Map.of("sub-field-1", "外观", "sub-field-2", "合格")))))
            .andExpect(status().isOk());
        action(101, "END_FORM", 2, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        action(101, "COMPLETE", 3, "a", Map.of()).andExpect(status().isOk());
    }

    @Test void copiesPersistSeparateValuesSumOutputAndRejectStaleOrForeignWrites() throws Exception {
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=5", """
            {"fields":[{"id":"good","name":"良品","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_GOOD"}},
            {"id":"ng","name":"不良","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_NG"}},
            {"id":"scrap","name":"报废","type":"number","typeConfig":{"businessPurpose":"PRODUCTION_SCRAP"}}]}
            """);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        jdbc.update("UPDATE form_template SET category_name='修改后的分类'");
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("good", 10, "ng", 0, "scrap", 0))).andExpect(status().isOk());
        action(101, "ADD_FORM_COPY", 2, "a", Map.of("formId", "form-51")).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.instanceIds.length()").value(2));
        action(101, "ADD_FORM_COPY", 2, "a", Map.of("formId", "form-51")).andExpect(status().isBadRequest());
        action(101, "SAVE", 3, "a", Map.of("formId", "form-51", "instanceId", "other-copy", "values", Map.of())).andExpect(status().isBadRequest());
        action(101, "SAVE", 3, "a", Map.of("formId", "form-51", "instanceId", "form-51:copy:2", "values", Map.of("good", 12, "ng", 0, "scrap", 0))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.operationOutputs.a.goodQuantity").value("22"));
        action(101, "END_FORM", 4, "a", Map.of("formId", "form-51", "acknowledgeIncomplete", true)).andExpect(status().isBadRequest());
        mvc.perform(auth(get("/api/v1/production/execution/101"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.snapshot.operations[0].forms[0].categoryName").value("生产记录"))
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.good").value(10))
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51:copy:2'].values.good").value(12))
            .andExpect(jsonPath("$.data.operationOutputs.a.goodQuantity").value("22"));
        assertThat(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class)).contains("form-51:copy:2", "新增表单份", "第 2 份");
    }

    @Test void optionalCopyCompletionRequiresAcknowledgementAndPersistsUnfinishedState() throws Exception {
        jdbc.update("UPDATE product_process_operation_form_binding SET required=false WHERE id=51");
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "ADD_FORM_COPY", 1, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        action(101, "COMPLETE", 2, "a", Map.of()).andExpect(status().isBadRequest());
        action(101, "END_FORM", 2, "a", Map.of("formId", "form-51")).andExpect(status().isBadRequest());
        action(101, "END_FORM", 2, "a", Map.of("formId", "form-51", "acknowledgeIncomplete", true)).andExpect(status().isOk());
        action(101, "COMPLETE", 3, "a", Map.of("acknowledgeIncomplete", true)).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.status").value("COMPLETED"))
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.canAdd").value(false))
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.instances['form-51:copy:2'].canAct").value(false));
        action(101, "SUBMIT", 4, "a", Map.of("formId", "form-51", "instanceId", "form-51:copy:2", "values", Map.of("temperature", 30))).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class)).contains("第 2 份未完成", "已告知", "保持进行中");
    }

    @Test void customFormsFreezePublishedVersionAndRequireExplicitRequiredChoice() throws Exception {
        mvc.perform(auth(get("/api/v1/production/execution/form-templates"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].versionId").value("5"));
        action(101, "ATTACH_FORM", 0, "a", Map.of("templateVersionId", "5", "required", true)).andExpect(status().isBadRequest());
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "ATTACH_FORM", 1, "a", Map.of("templateVersionId", "5")).andExpect(status().isBadRequest());
        action(101, "ATTACH_FORM", 1, "b", Map.of("templateVersionId", "5", "required", true)).andExpect(status().isBadRequest());
        String response = action(101, "ATTACH_FORM", 1, "a", Map.of("templateVersionId", "5", "required", true)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String formId = mapper.readTree(response).path("data").path("attachedFormId").asText();
        assertThat(formId).startsWith("custom-");
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class)).contains(formId, "CUSTOM", "attachedBy", "temperature");
        assertThat(jdbc.queryForObject("SELECT content_after FROM audit_event WHERE function_name='ATTACH_FORM'", String.class)).contains("snapshot", formId, "required");
        action(101, "COMPLETE", 2, "a", Map.of()).andExpect(status().isBadRequest());
        jdbc.update("UPDATE form_template_version SET status='DRAFT',model_design_json='{}' WHERE id=5");
        mvc.perform(auth(get("/api/v1/production/execution/form-templates"))).andExpect(jsonPath("$.data.length()").value(0));
        action(101, "ATTACH_FORM", 2, "a", Map.of("templateVersionId", "5", "required", false)).andExpect(status().isBadRequest());
        mvc.perform(auth(get("/api/v1/production/execution/101"))).andExpect(jsonPath("$.data.snapshot.operations[0].forms[1].fields[0].id").value("temperature"));
        action(101, "SUBMIT", 2, "a", Map.of("formId", formId, "values", Map.of("temperature", 30))).andExpect(status().isOk());
        action(101, "END_FORM", 3, "a", Map.of("formId", formId)).andExpect(status().isOk());
    }

    @Test void presenceCountsEditorsAcrossCopiesAndRejectsReadOnlyInstances() throws Exception {
        jdbc.update("UPDATE user_account SET avatar_file_id=123 WHERE id=1");
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "ADD_FORM_COPY", 1, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        for (String session : List.of("window1", "window2")) {
            mvc.perform(auth(post("/api/v1/production/execution/101/presence?operationId=a").contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("sessionId", session, "formId", "form-51", "instanceId", session.equals("window1") ? "form-51" : "form-51:copy:2", "editing", true)))))
                .andExpect(status().isOk());
        }
        mvc.perform(auth(get("/api/v1/production/execution/101/presence?operationId=a")))
            .andExpect(jsonPath("$.data.form-51.length()").value(1)).andExpect(jsonPath("$.data.form-51['1'].sequences.length()").value(2))
            .andExpect(jsonPath("$.data.form-51['1'].avatarUrl").value("/api/v1/files/123/public-preview"));
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(2,0,'editor2','另一操作员',?,'ACTIVE')", passwords.encode("test-secret"));
        String secondUser = tokens.generateToken("2", "editor2", "另一操作员", 5, List.of("production.execution"));
        mvc.perform(post("/api/v1/production/execution/101/presence?operationId=a").header("Authorization", "Bearer " + secondUser).contentType("application/json")
            .content("{\"sessionId\":\"window1\",\"formId\":\"form-51\",\"instanceId\":\"form-51\",\"editing\":true}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.form-51.length()").value(2))
            .andExpect(jsonPath("$.data.form-51['2'].avatarUrl").doesNotExist());
        mvc.perform(auth(post("/api/v1/production/execution/101/presence?operationId=a").contentType("application/json")
            .content("{\"sessionId\":\"window2\",\"editing\":false}"))).andExpect(status().isOk());
        action(101, "SUBMIT", 2, "a", Map.of("formId", "form-51", "instanceId", "form-51", "values", Map.of("temperature", 30))).andExpect(status().isOk());
        mvc.perform(auth(get("/api/v1/production/execution/101/presence?operationId=a"))).andExpect(jsonPath("$.data.length()").value(0));
        mvc.perform(auth(post("/api/v1/production/execution/101/presence?operationId=a").contentType("application/json")
            .content("{\"sessionId\":\"readonly\",\"formId\":\"form-51\",\"instanceId\":\"form-51\",\"editing\":true}"))).andExpect(status().isBadRequest());
        mvc.perform(auth(get("/api/v1/production/execution/101"))).andExpect(jsonPath("$.data.revision").value(3));
    }

    @Test void anOperationWithoutConfiguredFormsCanAttachItsFirstOptionalForm() throws Exception {
        jdbc.update("DELETE FROM product_process_operation_form_binding");
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk()).andExpect(jsonPath("$.data.availability.a.canAttachForm").value(true));
        String response = action(101, "ATTACH_FORM", 1, "a", Map.of("templateVersionId", "5", "required", false)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String formId = mapper.readTree(response).path("data").path("attachedFormId").asText();
        action(101, "COMPLETE", 2, "a", Map.of()).andExpect(status().isBadRequest());
        action(101, "COMPLETE", 2, "a", Map.of("acknowledgeIncomplete", true)).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.availability.a.formCopies['" + formId + "'].status").value("IN_PROGRESS"));
        action(101, "ATTACH_FORM", 3, "a", Map.of("templateVersionId", "5", "required", true)).andExpect(status().isBadRequest());
    }

    private void seedSignedWork() {
        jdbc.update("INSERT INTO workflow_definition VALUES(7,'default','WORK','装配复核'),(8,'default','FORM_PROCESS','填报与复核')");
        jdbc.update("INSERT INTO workflow_definition_version VALUES(8,8,1,'PUBLISHED',true,?,?)", """
            [{"id":"s","data":{"kind":"START"}},{"id":"review","data":{"kind":"APPROVAL","label":"现场复核","config":{
              "approverSubjects":[{"type":"USER","id":"1"}],"defaultPermission":"READ_ONLY",
              "buttonEvents":[{"id":"sign","event":"BEFORE","action":"APPROVE","builtin":"NONE","signatureMethod":"ACCOUNT_PASSWORD"}]}}},
              {"id":"e","data":{"kind":"END"}}]
            """, "[{\"source\":\"s\",\"target\":\"review\"},{\"source\":\"review\",\"target\":\"e\"}]");
        jdbc.update("INSERT INTO workflow_definition_version VALUES(7,7,1,'PUBLISHED',true,?,?)", """
            [{"id":"s","data":{"kind":"START"}},{"id":"f","data":{"kind":"FORM","label":"装配记录","config":{"formTemplateVersionId":"5","formProcessVersionId":"8"}}},{"id":"e","data":{"kind":"END"}}]
            """, "[{\"source\":\"s\",\"target\":\"f\"},{\"source\":\"f\",\"target\":\"e\"}]");
        jdbc.update("INSERT INTO workflow_binding_rule VALUES(7,'default',7,'SCOPED',true,1,NULL,11)");
    }

    @Test
    @org.junit.jupiter.api.condition.EnabledIfSystemProperty(named = "execution.browser", matches = "true")
    void browserEvidenceFixture() throws Exception {
        seedSignedWork();
        if (Boolean.getBoolean("execution.optional")) jdbc.update("UPDATE product_process_operation_form_binding SET required=false");
        if (Boolean.getBoolean("execution.output")) {
            var model = mapper.createObjectNode(); var fields = model.putArray("fields");
            String[][] purposes = {{"temperature", "良品数量", "PRODUCTION_GOOD"}, {"ng", "不良品数量", "PRODUCTION_NG"}, {"scrap", "报废数量", "PRODUCTION_SCRAP"}};
            for (String[] purpose : purposes) fields.addObject().put("id", purpose[0]).put("name", purpose[1]).put("type", "number").put("status", "enabled")
                    .putObject("typeConfig").put("businessPurpose", purpose[2]);
            jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=5", model.toString());
            jdbc.update("UPDATE production_object SET target_quantity=50 WHERE id=101");
        }
        java.nio.file.Path sop = java.nio.file.Files.createTempFile("production-execution-sop-", ".pdf");
        try (var pdf = new org.apache.pdfbox.pdmodel.PDDocument()) {
            var page = new org.apache.pdfbox.pdmodel.PDPage(); pdf.addPage(page);
            try (var content = new org.apache.pdfbox.pdmodel.PDPageContentStream(pdf, page)) {
                content.beginText(); content.setFont(new org.apache.pdfbox.pdmodel.font.PDType1Font(org.apache.pdfbox.pdmodel.font.Standard14Fonts.FontName.HELVETICA), 18);
                content.newLineAtOffset(50, 700); content.showText("Assembly SOP - V1"); content.endText();
            }
            pdf.save(sop.toFile());
        }
        long sopSize = java.nio.file.Files.size(sop);
        new org.springframework.transaction.support.TransactionTemplate(transactions).execute(status -> files.save(FileObject.builder().id(901L).originalName("Assembly-SOP.pdf").storedPath(sop.toString()).mimeType("application/pdf").fileSize(sopSize).targetType("DOCUMENT").build()));
        jdbc.update("INSERT INTO sop_document VALUES(901,'装配操作指导书')");
        jdbc.update("INSERT INTO document_version VALUES(901,901,'SOP01','V1',901)");
        jdbc.update("INSERT INTO product_process_operation_document_binding VALUES(901,11,901,1,1,1)");
        java.nio.file.Path ready = java.nio.file.Path.of("/tmp/production-execution-browser.json");
        java.nio.file.Path done = java.nio.file.Path.of("/tmp/production-execution-browser.done");
        java.nio.file.Files.deleteIfExists(done);
        String token = tokens.generateToken("1", "operator", "测试操作员", 30, List.of("production.execution"));
        java.nio.file.Files.writeString(ready, mapper.writeValueAsString(Map.of("token", token, "port", Integer.getInteger("execution.test.port", 18081))));
        try {
            long until = System.nanoTime() + TimeUnit.MINUTES.toNanos(20);
            while (!java.nio.file.Files.exists(done) && System.nanoTime() < until) Thread.sleep(500);
        } finally { java.nio.file.Files.deleteIfExists(ready); java.nio.file.Files.deleteIfExists(sop); }
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder request) {
        return request.header("Authorization", "Bearer " + tokens.generateToken("1", "operator", "操作员", 5, List.of("production.execution")));
    }
    private org.springframework.test.web.servlet.ResultActions action(long id, String action, long revision, String op, Map<String, Object> extra) throws Exception {
        Map<String, Object> body = new HashMap<>(extra); body.put("action", action); body.put("revision", revision); body.put("operationId", op);
        return mvc.perform(auth(post("/api/v1/production/execution/" + id + "/actions").contentType("application/json").content(mapper.writeValueAsString(body))));
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({ProductionExecutionController.class, ProductionExecutionService.class, ProductionExecutionEngine.class, ExecutionSnapshotBuilder.class, ExecutionPresenceRegistry.class,
        ProductionService.class, ExecutionAccess.class, SubjectResolver.class, FileController.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class})
    static class Config {
        @Bean EntityManager em(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes types() { return PersistenceManagedTypes.of(ProductionObject.class.getName(), WorkOrder.class.getName(), ProductionExecution.class.getName(), AuditEvent.class.getName(), UserAccount.class.getName(), Signature.class.getName(), FileObject.class.getName()); }
        @Bean PasswordEncoder passwords() { return new BCryptPasswordEncoder(4); }
        @Bean UserAccountRepository users(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(UserAccountRepository.class); }
        @Bean SignatureRepository signatures(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(SignatureRepository.class); }
        @Bean FileObjectRepository files(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(FileObjectRepository.class); }
        @Bean ProductionObjectRepository objects(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(ProductionObjectRepository.class); }
        @Bean WorkOrderRepository orders(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkOrderRepository.class); }
        @Bean ProductionExecutionRepository executions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(ProductionExecutionRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("execution-integration-test-key-at-least-32-characters", 300000); }
    }
}
