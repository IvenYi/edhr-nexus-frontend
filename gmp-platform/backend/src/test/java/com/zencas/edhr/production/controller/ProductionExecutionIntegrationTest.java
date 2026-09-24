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
    @Autowired SignatureRepository signatures;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactions;
    @Autowired ProductionService production;
    @MockBean DepartmentRepository departments;
    @MockBean RoleRepository roles;
    @MockBean UserDepartmentRepository userDepartments;
    @MockBean UserRoleRepository userRoles;
    @MockBean com.zencas.edhr.system.repository.IconAssetRepository icons;
    @MockBean com.zencas.edhr.system.repository.SystemSettingRepository settings;
    @SpyBean AuditEventRepository audits;

    @BeforeEach void setup() throws Exception {
        jdbc.execute("DROP TABLE IF EXISTS dhr_termination");
        jdbc.execute("DROP TABLE IF EXISTS dhr_summary_draft");
        jdbc.execute("DROP TABLE IF EXISTS dhr_summary_version");
        jdbc.execute("DROP TABLE IF EXISTS dhr_instance");
        jdbc.execute("DROP SEQUENCE IF EXISTS dhr_instance_number_seq");
        jdbc.execute("DROP TABLE IF EXISTS form_instance_record");
        jdbc.execute("DROP SEQUENCE IF EXISTS form_instance_number_seq");
        var migration = new String(getClass().getResourceAsStream("/db/changelog/0082-form-instance-records.sql").readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        for (String sql : migration.split("--changeset codex:0082-form-instance-history")[0].split(";")) {
            if (sql.contains("CREATE")) jdbc.execute(sql);
        }
        var queryMigration = new String(getClass().getResourceAsStream("/db/changelog/0083-form-instance-query.sql").readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        for (String sql : queryMigration.split("--changeset codex:0083-form-instance-query-history")[0].split(";")) {
            if (sql.contains("ALTER") || sql.contains("CREATE")) jdbc.execute(sql);
        }
        var sourceMigration = new String(getClass().getResourceAsStream("/db/changelog/0086-form-instance-business-source.sql").readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        for (String sql : sourceMigration.split(";")) {
            if (sql.contains("ALTER") || sql.contains("CREATE")) jdbc.execute(sql);
        }
        for (String ddl : List.of(
            "material(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),code VARCHAR(64),name VARCHAR(128),specification VARCHAR(128),unit VARCHAR(16))",
            "product_process_version(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),version_label VARCHAR(64),production_mode VARCHAR(64),production_form VARCHAR(64),route_version_id BIGINT,dhr_template_version_id BIGINT,dhr_review_mode VARCHAR(16) DEFAULT 'NONE',dhr_review_workflow_definition_id BIGINT,dhr_review_workflow_version_id BIGINT)",
            "route(id BIGINT PRIMARY KEY,name VARCHAR(128),code VARCHAR(64))",
            "route_version(id BIGINT PRIMARY KEY,route_id BIGINT,version VARCHAR(64))",
            "dhr_template(id BIGINT PRIMARY KEY,name VARCHAR(128),code VARCHAR(64))",
            "dhr_template_version(id BIGINT PRIMARY KEY,dhr_template_id BIGINT,version_label VARCHAR(64))",
            "dhr_directory(id BIGINT PRIMARY KEY,version_id BIGINT,name VARCHAR(128),parent_id BIGINT,sort_order INT)",
            "dhr_template_item(id BIGINT PRIMARY KEY,directory_id BIGINT,form_template_id BIGINT,form_template_version_id BIGINT,display_name VARCHAR(128),sort_order INT,is_required BOOLEAN)",
            "route_node(id BIGINT PRIMARY KEY,route_version_id BIGINT,node_key VARCHAR(64),operation_id BIGINT,operation_code VARCHAR(64),operation_name VARCHAR(128),node_type VARCHAR(32),config_json TEXT,sort_order INT)",
            "route_relation(id BIGINT PRIMARY KEY,route_version_id BIGINT,source_node_key VARCHAR(64),target_node_key VARCHAR(64),relation_type VARCHAR(64),rule_expression TEXT,priority INT)",
            "product_process_operation_binding(id BIGINT PRIMARY KEY,product_process_version_id BIGINT,route_node_key VARCHAR(64))",
            "product_process_operation_form_binding(id BIGINT PRIMARY KEY,product_process_operation_binding_id BIGINT,form_template_version_id BIGINT,dhr_template_item_id BIGINT,required BOOLEAN,sort_order INT,fill_settings_json TEXT)",
            "product_process_operation_document_binding(id BIGINT PRIMARY KEY,product_process_operation_binding_id BIGINT,document_version_id BIGINT,page_start INT,page_end INT,sort_order INT)",
            "sop_document(id BIGINT PRIMARY KEY,title VARCHAR(128))",
            "document_version(id BIGINT PRIMARY KEY,document_id BIGINT,code VARCHAR(64),version VARCHAR(64),file_id BIGINT)",
            "form_template(id BIGINT PRIMARY KEY,name VARCHAR(128),code VARCHAR(64),category_name VARCHAR(128),tenant_id VARCHAR(64) DEFAULT 'default',status VARCHAR(32) DEFAULT 'ACTIVE')",
            "form_template_version(id BIGINT PRIMARY KEY,template_id BIGINT,version_label VARCHAR(64),model_design_json TEXT,canvas_design_json TEXT,tenant_id VARCHAR(64) DEFAULT 'default',status VARCHAR(32) DEFAULT 'PUBLISHED')",
            "workflow_definition(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),type VARCHAR(32),name VARCHAR(128),code VARCHAR(64),business_type VARCHAR(32))",
            "workflow_definition_version(id BIGINT PRIMARY KEY,definition_id BIGINT,version_number INT,status VARCHAR(32),is_current BOOLEAN,nodes_json TEXT,edges_json TEXT)",
            "workflow_binding_rule(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),definition_id BIGINT,rule_type VARCHAR(32),is_active BOOLEAN,product_id BIGINT,product_family_id BIGINT,operation_id BIGINT)",
            "product_family_member(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),product_id BIGINT,product_family_id BIGINT)")) {
            jdbc.execute("CREATE TABLE IF NOT EXISTS " + ddl);
            jdbc.update("DELETE FROM " + ddl.substring(0, ddl.indexOf('(')));
        }
        var dhrMigration = new String(getClass().getResourceAsStream("/db/changelog/0089-dhr-instance-management.sql").readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        for (String sql : dhrMigration.split("INSERT INTO permission")[0].split(";")) {
            if (sql.contains("CREATE")) jdbc.execute(sql);
        }
        jdbc.execute("ALTER TABLE dhr_instance ADD COLUMN summary_status VARCHAR(32) DEFAULT 'NOT_STARTED' NOT NULL");
        jdbc.execute("ALTER TABLE dhr_instance ADD COLUMN dhr_review_mode VARCHAR(16) DEFAULT 'NONE' NOT NULL");
        jdbc.execute("ALTER TABLE dhr_instance ADD COLUMN dhr_review_workflow_definition_id BIGINT");
        jdbc.execute("ALTER TABLE dhr_instance ADD COLUMN dhr_review_workflow_version_id BIGINT");
        jdbc.execute("ALTER TABLE dhr_instance DROP CONSTRAINT ck_dhr_instance_status");
        jdbc.execute("ALTER TABLE dhr_instance ADD CONSTRAINT ck_dhr_instance_status CHECK (status IN ('IN_PROGRESS','COMPLETED','EARLY_TERMINATED'))");
        jdbc.execute("CREATE TABLE dhr_termination(dhr_instance_id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),reason TEXT,terminated_at TIMESTAMP,terminated_by VARCHAR(192),recorded_at TIMESTAMP NOT NULL,snapshot_json TEXT,snapshot_hash VARCHAR(64),historical BOOLEAN NOT NULL)");
        jdbc.execute("CREATE TABLE dhr_summary_draft(id BIGINT PRIMARY KEY,dhr_instance_id BIGINT)");
        jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT PRIMARY KEY,dhr_instance_id BIGINT)");
        jdbc.update("DELETE FROM production_execution"); jdbc.update("DELETE FROM production_object"); jdbc.update("DELETE FROM work_order"); jdbc.update("DELETE FROM audit_event");
        jdbc.update("DELETE FROM signature"); jdbc.update("DELETE FROM user_account");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(1,0,'operator','测试操作员',?,'ACTIVE')", passwords.encode("test-secret"));
        jdbc.update("INSERT INTO material VALUES(1,'default','P01','导管','规格A','件')");
        jdbc.update("INSERT INTO product_process_version(id,tenant_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id,dhr_review_mode) VALUES(2,'default','配置V1','量产','批次',3,4,'NONE')");
        jdbc.update("INSERT INTO route VALUES(3,'导管装配','R01')"); jdbc.update("INSERT INTO route_version VALUES(3,3,'V1')");
        jdbc.update("INSERT INTO dhr_template VALUES(4,'导管生产记录','D01')");
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES(4,4,'V1')");
        jdbc.update("INSERT INTO dhr_directory VALUES(40,4,'生产记录',NULL,1)");
        jdbc.update("INSERT INTO dhr_template_item VALUES(50,40,5,5,'装配记录',1,true)");
        jdbc.update("INSERT INTO route_node VALUES(11,3,'a',11,'O01','装配','OPERATION','{}',1),(12,3,'b',12,'O02','检验','OPERATION','{}',2)");
        jdbc.update("INSERT INTO route_relation VALUES(1,3,'a','b','SEQUENTIAL',NULL,1)");
        jdbc.update("INSERT INTO product_process_operation_binding VALUES(11,2,'a'),(12,2,'b')");
        jdbc.update("INSERT INTO form_template(id,name,code,category_name) VALUES(5,'装配记录','F01','生产记录')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_label,model_design_json,canvas_design_json) VALUES(5,5,'V1',?,?)",
            "{\"fields\":[{\"id\":\"temperature\",\"name\":\"温度\",\"type\":\"number\",\"status\":\"enabled\"}]}",
            "{\"bindings\":{\"fieldId\":\"temperature\",\"required\":true}}");
        jdbc.update("INSERT INTO product_process_operation_form_binding VALUES(51,11,5,50,true,1,'{\"fillMode\":\"DIRECT\"}')");
        jdbc.update("INSERT INTO work_order(id,tenant_id,order_no,product_id,planned_quantity,status,created_at,updated_at) VALUES(100,'default','WO01',1,2,'CREATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO production_object(id,tenant_id,work_order_id,object_no,object_type,process_version_id,target_quantity,good_quantity,ng_quantity,scrap_quantity,status,created_at,updated_at) VALUES(101,'default',100,'B01','BATCH',2,1,0,0,0,'CREATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),(102,'default',100,'SN01','SN',2,1,0,0,0,'CREATED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
    }

    @Test void referenceLookupUsesFrozenCanvasAndValidatesCurrentRowAtSave() throws Exception {
        String model = """
            {"fields":[{"id":"lookup","name":"账号","type":"text","status":"enabled"},
              {"id":"ref","name":"人员","type":"reference","status":"enabled","typeConfig":{"sourceType":"dictionary"}},
              {"id":"rows","name":"明细","type":"subTable","status":"enabled","typeConfig":{"columns":[
                {"id":"account","type":"text","status":"enabled","typeConfig":{}},
                {"id":"person","type":"reference","status":"enabled","typeConfig":{"sourceType":"user","referenceField":"username","referenceQueryConditions":[{"sourceField":"username","operator":"eq","targetFieldId":"account"}]}}
              ]}}]}
            """;
        String canvas = """
            {"pages":[{"nodes":[{"bindings":{"fieldId":"ref","widgetConfig":{"referenceSourceType":"user","referenceField":"username","referenceQueryConditions":[{"sourceField":"username","operator":"eq","targetFieldId":"lookup"}]}}}]}]}
            """;
        jdbc.update("UPDATE form_template_version SET model_design_json=?,canvas_design_json=? WHERE id=5", model, canvas);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        String before = jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class);
        Long revision = jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class);
        Integer auditsBefore = jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class);
        jdbc.update("UPDATE form_template_version SET canvas_design_json='{}' WHERE id=5");
        mvc.perform(auth(post("/api/v1/production/execution/101/references").contentType("application/json").content("""
            {"operationId":"a","formId":"form-51","fieldId":"ref","keyword":"operator","values":{"lookup":"operator"}}
            """))).andExpect(status().isOk()).andExpect(jsonPath("$.data[0].name").value("operator"));
        mvc.perform(auth(post("/api/v1/production/execution/101/references").contentType("application/json").content("""
            {"operationId":"a","formId":"form-51","fieldId":"ref","values":{}}
            """))).andExpect(status().isOk()).andExpect(jsonPath("$.data.length()").value(0));
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class)).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(auditsBefore);
        Map<String, Object> values = new HashMap<>(Map.of("lookup", "operator", "ref", Map.of("id", "1", "name", "operator"), "rows", List.of(
            Map.of("account", "operator", "person", Map.of("id", "1", "name", "operator")),
            Map.of("account", "other", "person", Map.of("id", "1", "name", "operator")))));
        action(101, "SAVE", revision, "a", Map.of("formId", "form-51", "values", values)).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(revision);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(auditsBefore);
        values.put("rows", List.of(Map.of("account", "operator", "person", Map.of("id", "1", "name", "operator"))));
        action(101, "SAVE", revision, "a", Map.of("formId", "form-51", "values", values)).andExpect(status().isOk());
        action(101, "SAVE", revision + 1, "a", Map.of("formId", "form-51", "values", Map.of("lookup", "other"))).andExpect(status().isBadRequest());
    }

    @Test void previewReferencesRequireDesignPermissionAndDoNotWriteData() throws Exception {
        String query = "{\"config\":{\"sourceType\":\"user\",\"referenceField\":\"username\"},\"keyword\":\"operator\"}";
        String endpoint = "/api/v1/master-data/template-modeling/reference-options";
        mvc.perform(auth(post(endpoint).contentType("application/json").content(query))).andExpect(status().isForbidden());
        mvc.perform(post(endpoint).contentType("application/json").content(query).header("Authorization", "Bearer " + tokens.generateToken("1", "operator", "测试", 5, List.of("master-data.form-templates"))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].name").value("operator"));
        mvc.perform(post("/api/v1/production/execution/101/references").contentType("application/json").content("{\"operationId\":\"a\",\"formId\":\"5\",\"fieldId\":\"ref\"}")
            .header("Authorization", "Bearer " + tokens.generateToken("1", "operator", "测试", 5, List.of("master-data.form-templates")))).andExpect(status().isForbidden());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM production_execution", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isZero();
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

    @Test void dhrFillingProjectsAndFiltersProductionStatusWithoutChangingDhrOrWriteRules() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(102, "START", 0, "a", Map.of()).andExpect(status().isOk());
        jdbc.update("UPDATE production_object SET status='EARLY_TERMINATED' WHERE id=101");
        Long dhrId = jdbc.queryForObject("SELECT id FROM dhr_instance WHERE production_object_id=101", Long.class);
        String dhrBearer = "Bearer " + tokens.generateToken("1", "operator", "操作员", 5, List.of("dhr.instances.view"));
        mvc.perform(get("/api/v1/dhr-instances").header("Authorization", dhrBearer).param("status", "IN_PROGRESS").param("productionStatus", "EARLY_TERMINATED"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].productionObjectId").value("101"))
                .andExpect(jsonPath("$.data.content[0].status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.content[0].productionStatus").value("EARLY_TERMINATED"));
        mvc.perform(get("/api/v1/dhr-instances").header("Authorization", dhrBearer).param("status", "IN_PROGRESS").param("productionStatus", "IN_PROGRESS"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].productionObjectId").value("102"));
        mvc.perform(get("/api/v1/dhr-instances/" + dhrId).header("Authorization", dhrBearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.productionStatus").value("EARLY_TERMINATED"));
        mvc.perform(get("/api/v1/dhr-instances").header("Authorization", dhrBearer).param("productionStatus", "INVALID"))
                .andExpect(status().isBadRequest());
        String token = tokens.generateToken("1", "operator", "操作员", 5, List.of("records.dhr-filling", "dhr.filling.act", "dhr.filling.supplement"));
        String bearer = "Bearer " + token;
        mvc.perform(get("/api/v1/dhr-filling").header("Authorization", bearer).param("displayStatus", "STATUS_ERROR").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].productionObjectId").value("101"))
                .andExpect(jsonPath("$.data.content[0].productionStatus").value("EARLY_TERMINATED"))
                .andExpect(jsonPath("$.data.content[0].status").value("IN_PROGRESS"));
        mvc.perform(get("/api/v1/dhr-filling").header("Authorization", bearer).param("displayStatus", "FILLING"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].productionObjectId").value("102"));
        mvc.perform(get("/api/v1/dhr-filling").header("Authorization", bearer).param("displayStatus", "STATUS_ERROR").param("page", "1").param("size", "1"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1)).andExpect(jsonPath("$.data.content").isEmpty());
        mvc.perform(get("/api/v1/dhr-filling").header("Authorization", bearer).param("displayStatus", "INVALID"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/dhr-filling/" + dhrId).header("Authorization", bearer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.objectStatus").value("EARLY_TERMINATED"))
                .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.instances.form-51.canAct").value(false));
        mvc.perform(post("/api/v1/dhr-filling/" + dhrId + "/actions").header("Authorization", bearer).contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("revision", 1, "action", "SAVE", "operationId", "a", "formId", "form-51", "values", Map.of("temperature", 99)))))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/dhr-filling/" + dhrId + "/supplements").header("Authorization", bearer).contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("revision", 1, "operationId", "a", "formId", "form-51", "reason", "实际记录", "occurredAt", "2026-01-01T10:00:00"))))
                .andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT status FROM dhr_instance WHERE id=?", String.class, dhrId)).isEqualTo("IN_PROGRESS");
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(1L);
    }

    @Test void dhrSupplementUsesRealExecutionAndRecordServicesWithoutReopeningProduction() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        action(101, "END_FORM", 2, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        action(101, "COMPLETE", 3, "a", Map.of()).andExpect(status().isOk());
        action(101, "START", 4, "b", Map.of()).andExpect(status().isOk());
        action(101, "COMPLETE", 5, "b", Map.of()).andExpect(status().isOk());
        Long dhrId = jdbc.queryForObject("SELECT id FROM dhr_instance", Long.class);
        String original = jdbc.queryForObject("SELECT values_json FROM form_instance_record", String.class);
        String frozen = jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class);
        String token = tokens.generateToken("1", "operator", "操作员", 5, List.of("records.dhr-filling", "dhr.filling.act", "dhr.filling.supplement"));
        String root = "/api/v1/dhr-filling/" + dhrId;
        var response = mvc.perform(post(root + "/supplements").header("Authorization", "Bearer " + token).contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("revision", 6, "operationId", "a", "formId", "form-51", "reason", "补充实际记录", "occurredAt", "2026-01-01T10:00:00"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.objectStatus").value("COMPLETED")).andReturn();
        String copyId = mapper.readTree(response.getResponse().getContentAsString()).at("/data/createdCopyId").asText();
        assertThat(copyId).startsWith("dhr-copy-");
        var command = Map.of("revision", 7, "action", "SUBMIT", "operationId", "a", "formId", "form-51", "instanceId", copyId, "values", Map.of("temperature", 23));
        mvc.perform(post(root + "/actions").header("Authorization", "Bearer " + token).contentType("application/json").content(mapper.writeValueAsString(command)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.objectStatus").value("COMPLETED"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM form_instance_record", Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT values_json FROM form_instance_record WHERE copy_id='form-51'", String.class)).isEqualTo(original);
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM form_instance_record WHERE copy_id=?", String.class, copyId)).contains("补充实际记录", "supplement");
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class)).isEqualTo(frozen);
        assertThat(jdbc.queryForObject("SELECT status FROM dhr_instance", String.class)).isEqualTo("COMPLETED");
        // Even a DHR operator cannot edit a completed original through the supplementary endpoint.
        mvc.perform(post(root + "/actions").header("Authorization", "Bearer " + token).contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("revision", 8, "action", "SAVE", "operationId", "a", "formId", "form-51", "instanceId", "form-51", "values", Map.of("temperature", 99)))))
                .andExpect(status().isBadRequest());
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
        assertThat(jdbc.queryForList("SELECT status FROM dhr_instance ORDER BY object_no", String.class)).containsExactly("COMPLETED", "COMPLETED");
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class)).contains("导管装配").doesNotContain("新的配置名称");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event WHERE entity_type='PRODUCTION_EXECUTION'", Integer.class)).isEqualTo(14);
    }

    @Test void formInstanceNumbersAreStableSearchableAndUseFrozenSnapshots() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        String number = jdbc.queryForObject("SELECT instance_no FROM form_instance_record", String.class);
        assertThat(number).matches("FR-\\d{8}-\\d{6,}");
        assertThat(jdbc.queryForObject("SELECT source_type FROM form_instance_record", String.class)).isEqualTo("PRODUCTION_EXECUTION");
        action(101, "SAVE", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 23))).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT instance_no FROM form_instance_record", String.class)).isEqualTo(number);
        jdbc.update("UPDATE form_template SET name='修改后的模板'");
        String readToken = tokens.generateToken("1", "operator", "操作员", 5, List.of("production.execution", "master-data.form-templates"));
        var list = mvc.perform(get("/api/v1/form-instance-records").header("Authorization", "Bearer " + readToken).param("templateId", "5").param("instanceNo", number))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].fieldValues.temperature").value(23)).andReturn();
        String id = mapper.readTree(list.getResponse().getContentAsString()).path("data").path("content").get(0).path("id").asText();
        mvc.perform(get("/api/v1/form-instance-records/" + id).param("templateId", "5").header("Authorization", "Bearer " + readToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.snapshot.name").value("装配记录"));
        mvc.perform(get("/api/v1/form-instance-records/" + id).param("templateId", "999").header("Authorization", "Bearer " + readToken)).andExpect(status().isBadRequest());
        mvc.perform(auth(get("/api/v1/form-instance-records").param("templateId", "5"))).andExpect(status().isForbidden());
        action(101, "SUBMIT", 3, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 23))).andExpect(status().isOk());
        action(101, "ADD_FORM_COPY", 4, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        action(101, "SAVE", 5, "a", Map.of("formId", "form-51", "instanceId", "form-51:copy:2", "values", Map.of("temperature", 24))).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT count(DISTINCT instance_no) FROM form_instance_record", Integer.class)).isEqualTo(2);
        String dhrToken = tokens.generateToken("1", "operator", "操作员", 5, List.of("dhr.instances.view"));
        var dhrList = mvc.perform(get("/api/v1/dhr-instances").header("Authorization", "Bearer " + dhrToken).param("objectType", "BATCH"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].objectNo").value("B01"))
                .andExpect(jsonPath("$.data.content[0].status").value("IN_PROGRESS")).andReturn();
        String dhrId = mapper.readTree(dhrList.getResponse().getContentAsString()).path("data").path("content").get(0).path("id").asText();
        mvc.perform(get("/api/v1/dhr-instances/" + dhrId).header("Authorization", "Bearer " + dhrToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.directorySnapshot.directories[0].items[0].id").value("50"))
                .andExpect(jsonPath("$.data.directorySnapshot.directories[0].items[0].records.length()").value(2))
                .andExpect(jsonPath("$.data.evidenceSummary.recordCount").value(2));
        mvc.perform(auth(get("/api/v1/dhr-instances"))).andExpect(status().isForbidden());
    }

    @Test void firstStartAndDetailKeepSnowflakeDirectoryIdsAsStrings() throws Exception {
        long rootId = 377634999500804097L;
        long childId = 377634999500804098L;
        jdbc.update("UPDATE dhr_directory SET id=? WHERE id=40", rootId);
        jdbc.update("UPDATE dhr_template_item SET directory_id=? WHERE directory_id=40", rootId);
        jdbc.update("INSERT INTO dhr_directory VALUES(?,4,'子目录',?,2)", childId, rootId);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        String frozen = jdbc.queryForObject("SELECT directory_snapshot FROM dhr_instance", String.class);
        JsonNode snapshot = mapper.readTree(frozen);
        assertThat(snapshot.at("/directories/0/id").isTextual()).isTrue();
        assertThat(snapshot.at("/directories/0/id").asText()).isEqualTo(Long.toString(rootId));
        assertThat(snapshot.at("/directories/1/parentId").asText()).isEqualTo(Long.toString(rootId));
        String token = tokens.generateToken("1", "operator", "操作员", 5, List.of("dhr.instances.view"));
        Long dhrId = jdbc.queryForObject("SELECT id FROM dhr_instance", Long.class);
        mvc.perform(get("/api/v1/dhr-instances/" + dhrId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.directorySnapshot.directories[0].id").value(Long.toString(rootId)))
                .andExpect(jsonPath("$.data.directorySnapshot.directories[1].id").value(Long.toString(childId)))
                .andExpect(jsonPath("$.data.directorySnapshot.directories[1].parentId").value(Long.toString(rootId)));
        assertThat(jdbc.queryForObject("SELECT directory_snapshot FROM dhr_instance", String.class)).isEqualTo(frozen);
    }

    @Test void concurrentFirstSavesAllocateDifferentNumbers() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(102, "START", 0, "a", Map.of()).andExpect(status().isOk());
        try (var pool = Executors.newFixedThreadPool(2)) {
            var saves = List.of(101L, 102L).stream().map(id -> pool.submit(() -> {
                action(id, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
                return true;
            })).toList();
            for (var save : saves) assertThat(save.get(10, TimeUnit.SECONDS)).isTrue();
        }
        assertThat(jdbc.queryForObject("SELECT count(DISTINCT instance_no) FROM form_instance_record", Integer.class)).isEqualTo(2);
    }

    @Test void returnAndApprovalKeepTheOriginalFormNumber() throws Exception {
        seedSignedWork();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 25))).andExpect(status().isOk());
        String number = jdbc.queryForObject("SELECT instance_no FROM form_instance_record", String.class);
        action(101, "RETURN", 2, "a", Map.of("formId", "work-7-f", "values", Map.of(), "opinion", "请复核温度")).andExpect(status().isOk());
        action(101, "SUBMIT", 3, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 26))).andExpect(status().isOk());
        action(101, "APPROVE", 4, "a", Map.of("formId", "work-7-f", "values", Map.of(), "account", "operator", "password", "test-secret")).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT instance_no FROM form_instance_record", String.class)).isEqualTo(number);
        assertThat(jdbc.queryForObject("SELECT status FROM form_instance_record", String.class)).isEqualTo("COMPLETED");
    }

    @Test void failedAuditRollsBackFormInstanceAllocation() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any(AuditEvent.class));
        try {
            action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().is5xxServerError());
            assertThat(jdbc.queryForObject("SELECT count(*) FROM form_instance_record", Integer.class)).isZero();
        } finally { reset(audits); }
    }

    @Test void staleRevisionAndTerminatedObjectsCannotAdvance() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 0, "a", Map.of("formId", "form-51", "values", Map.of())).andExpect(status().isBadRequest());
        jdbc.update("UPDATE production_object SET status='EARLY_TERMINATED' WHERE id=101");
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of())).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(1);
    }

    @Test void executionMissingDhrCannotComplete() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        action(101, "SUBMIT", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        action(101, "END_FORM", 3, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        action(101, "COMPLETE", 4, "a", Map.of()).andExpect(status().isOk());
        action(101, "START", 5, "b", Map.of()).andExpect(status().isOk());
        jdbc.update("DELETE FROM dhr_instance WHERE production_object_id=101");

        action(101, "COMPLETE", 6, "b", Map.of()).andExpect(status().isBadRequest());

        assertThat(jdbc.queryForObject("SELECT status FROM production_object WHERE id=101", String.class)).isEqualTo("IN_PROGRESS");
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(6);
    }

    @Test void concurrentStartCreatesOneExecutionAndOneDhr() throws Exception {
        try (var pool = Executors.newFixedThreadPool(2)) {
            Callable<Integer> start = () -> action(101, "START", 0, "a", Map.of()).andReturn().getResponse().getStatus();
            var results = pool.invokeAll(List.of(start, start));
            assertThat(List.of(results.get(0).get(), results.get(1).get())).containsExactlyInAnyOrder(200, 400);
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM production_execution", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_instance", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event WHERE entity_type='PRODUCTION_EXECUTION'", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event WHERE entity_type='DHR_INSTANCE'", Integer.class)).isEqualTo(1);
    }

    @Test void failedAuditRollsBackObjectStateAndExecutionTogether() throws Exception {
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any(AuditEvent.class));
        action(101, "START", 0, "a", Map.of()).andExpect(status().is5xxServerError());
        assertThat(jdbc.queryForObject("SELECT status FROM production_object WHERE id=101", String.class)).isEqualTo("CREATED");
        assertThat(jdbc.queryForObject("SELECT status FROM work_order WHERE id=100", String.class)).isEqualTo("CREATED");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM production_execution", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_instance", Integer.class)).isZero();
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
        assertThat(jdbc.queryForObject("SELECT status FROM dhr_instance WHERE production_object_id=101", String.class)).isEqualTo("EARLY_TERMINATED");
    }

    @Test void earlyTerminationFreezesSavedEvidenceAndLeavesOtherObjectRunning() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(102, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        Long dhrId = jdbc.queryForObject("SELECT id FROM dhr_instance WHERE production_object_id=101", Long.class);

        production.endObject(101L, "设备故障");

        assertThat(jdbc.queryForObject("SELECT status FROM dhr_instance WHERE id=?", String.class, dhrId)).isEqualTo("EARLY_TERMINATED");
        assertThat(jdbc.queryForObject("SELECT status FROM production_object WHERE id=101", String.class)).isEqualTo("EARLY_TERMINATED");
        assertThat(jdbc.queryForObject("SELECT status FROM production_object WHERE id=102", String.class)).isEqualTo("IN_PROGRESS");
        assertThat(jdbc.queryForObject("SELECT snapshot_hash FROM dhr_termination WHERE dhr_instance_id=?", String.class, dhrId)).hasSize(64);
        String token = "Bearer " + tokens.generateToken("1", "operator", "操作员", 5, List.of("dhr.instances.view"));
        mvc.perform(get("/api/v1/dhr-instances/" + dhrId).header("Authorization", token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.displayStatus").value("TERMINATED"))
                .andExpect(jsonPath("$.data.terminationReason").value("设备故障"))
                .andExpect(jsonPath("$.data.directorySnapshot.directories[0].items[0].records[0].fieldValues.temperature").value(22));
        jdbc.update("UPDATE form_instance_record SET values_json='{\"temperature\":99}' WHERE object_id=101");
        mvc.perform(get("/api/v1/dhr-instances/" + dhrId).header("Authorization", token)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.directorySnapshot.directories[0].items[0].records[0].fieldValues.temperature").value(22));
        assertThatThrownBy(() -> production.endObject(101L, "第二次结束")).hasMessageContaining("只有生产中的对象");
    }

    @Test void missingDhrBlocksEarlyTerminationWithoutChangingProduction() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        jdbc.update("DELETE FROM dhr_instance WHERE production_object_id=101");
        assertThatThrownBy(() -> production.endObject(101L, "设备故障")).hasMessageContaining("DHR 实例缺失");
        assertThat(jdbc.queryForObject("SELECT status FROM production_object WHERE id=101", String.class)).isEqualTo("IN_PROGRESS");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_termination", Long.class)).isZero();
    }

    @Test void missingPermissionCannotReadOrExecute() throws Exception {
        String token = tokens.generateToken("1", "operator", "操作员", 5, List.of("production.work-orders"));
        mvc.perform(get("/api/v1/production/execution/scan").param("barcode", "B01").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/production/execution/101/actions").contentType("application/json").content("{\"action\":\"START\",\"revision\":0,\"operationId\":\"a\"}").header("Authorization", "Bearer " + token)).andExpect(status().isForbidden());
    }

    @Test void configuredAndWorkFormsUsingTheSameTemplateRemainIndependent() throws Exception {
        seedConfirmationWork();
        mvc.perform(auth(get("/api/v1/production/execution/101"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.status").value("WAITING_OPERATION_START"))
            .andExpect(jsonPath("$.data.availability.a.formCopies.work-7-f.status").value("WAITING_OPERATION_START"));
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms.form-51.status").value("ACTIVE"))
            .andExpect(jsonPath("$.data.state.operations.a.forms.work-7-f.status").value("ACTIVE"))
            .andExpect(jsonPath("$.data.snapshot.operations[0].forms[0].fulfilledBy").doesNotExist())
            .andExpect(jsonPath("$.data.snapshot.operations[0].forms[1].dhrItemId").doesNotExist());
        action(101, "ADD_FORM_COPY", 1, "a", Map.of("formId", "work-7-f")).andExpect(status().isOk());
        action(101, "SUBMIT", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 24))).andExpect(status().isOk());
        action(101, "SUBMIT", 3, "a", Map.of("formId", "work-7-f", "instanceId", "work-7-f", "values", Map.of("temperature", 25))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.works['7'].active[0]").value("f"));
        action(101, "SUBMIT", 4, "a", Map.of("formId", "work-7-f", "instanceId", "work-7-f:copy:2", "values", Map.of("temperature", 26))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.works['7'].active[0]").value("c"))
            .andExpect(jsonPath("$.data.availability.a.formCopies.work-7-f.canAdd").value(false));
        action(101, "COMPLETE", 5, "a", Map.of()).andExpect(status().isBadRequest());
        action(101, "CONFIRM", 5, "a", Map.of("workId", "7", "nodeId", "c")).andExpect(status().isOk());
        action(101, "COMPLETE", 6, "a", Map.of()).andExpect(status().isOk());
        var persisted = mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class));
        assertThat(persisted.path("history").findValuesAsText("actionCode")).filteredOn("AUTO_END_FORM"::equals).hasSize(1);
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM form_instance_record WHERE form_id='form-51'", String.class)).contains("dhrItemId");
        assertThat(jdbc.queryForList("SELECT snapshot_json FROM form_instance_record WHERE form_id='work-7-f'", String.class))
            .allSatisfy(snapshot -> assertThat(snapshot).doesNotContain("dhrItemId"));
        assertThat(jdbc.queryForObject("SELECT content_after FROM audit_event WHERE function_name='SUBMIT' AND entity_id='101' ORDER BY created_at DESC LIMIT 1", String.class))
            .contains("ALL_COPIES_COMPLETED", "AUTO_END_FORM", "work-7-f:copy:2");
    }

    private void seedConfirmationWork() {
        jdbc.update("INSERT INTO workflow_definition(id,tenant_id,type,name) VALUES(7,'default','WORK','装配作业')");
        jdbc.update("INSERT INTO workflow_definition_version VALUES(7,7,1,'PUBLISHED',true,?,?)", """
            [{"id":"s","data":{"kind":"START"}},
             {"id":"f","data":{"kind":"FORM","config":{"formTemplateVersionId":"5"}}},
             {"id":"c","data":{"kind":"CONFIRMATION","label":"确认外观"}},
             {"id":"e","data":{"kind":"END"}}]
            """, """
            [{"source":"s","target":"f"},{"source":"f","target":"c"},{"source":"c","target":"e"}]
            """);
        jdbc.update("INSERT INTO workflow_binding_rule VALUES(7,'default',7,'SCOPED',true,1,NULL,11)");
    }

    @Test void legacyCompletedWorkProjectsNextNodeWithoutWritingAndSettlesOnTheNextAuditedAction() throws Exception {
        seedConfirmationWork();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        var legacy = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class));
        var form = legacy.withObject("/operations/a/forms/work-7-f");
        form.put("status", "COMPLETED").put("lastSignatureId", "legacy-evidence");
        form.withObject("/values").put("temperature", 25);
        jdbc.update("UPDATE production_execution SET state_json=? WHERE object_id=101", legacy.toString());
        int beforeAudit = jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class);
        mvc.perform(auth(get("/api/v1/production/execution/101"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.works['7'].active[0]").value("c"));
        assertThat(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class)).isEqualTo(legacy.toString());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(beforeAudit);
        action(101, "CONFIRM", 1, "a", Map.of("workId", "7", "nodeId", "c")).andExpect(status().isOk());
        var persisted = mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class));
        assertThat(persisted.at("/operations/a/forms/work-7-f")).isEqualTo(form);
        assertThat(persisted.path("history").findValuesAsText("actionCode")).filteredOn("AUTO_END_FORM"::equals).hasSize(1);
        assertThat(jdbc.queryForObject("SELECT content_before FROM audit_event WHERE function_name='CONFIRM'", String.class)).doesNotContain("AUTO_END_FORM");
        assertThat(jdbc.queryForObject("SELECT content_after FROM audit_event WHERE function_name='CONFIRM'", String.class)).contains("AUTO_END_FORM", "legacy-evidence");
    }

    @Test void automaticWorkAdvanceRollsBackWithItsSubmissionWhenAuditFails() throws Exception {
        seedConfirmationWork();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        String before = jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class);
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any(AuditEvent.class));
        try {
            action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 25))).andExpect(status().is5xxServerError());
        } finally { reset(audits); }
        assertThat(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class)).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM form_instance_record", Integer.class)).isZero();
    }

    @Test void inlineSignatureSavesWithoutSubmittingAndContentChangesInvalidateIt() throws Exception {
        seedInlineSignature();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SIGN_FIELD", 1, "a", inlineSign("wrong", Map.of("temperature", 25))).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isZero();
        action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of("temperature", 25))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].status").value("ACTIVE"))
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.sign.signerName").value("测试操作员"))
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.sign.signatureImageFileId").value("901"))
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].instanceNo").isNotEmpty());
        String signatureSnapshot = jdbc.queryForObject("SELECT snapshot_data FROM signature WHERE target_type='PRODUCTION_EXECUTION'", String.class);
        assertThat(signatureSnapshot).contains("temperature", "fieldId", "form-51", "versionId").doesNotContain("sign-secret", "password");
        action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of())).andExpect(status().isBadRequest());
        action(101, "SAVE", 2, "a", Map.of("formId", "form-51", "values", Map.of("sign", Map.of("signerName", "伪造")))).andExpect(status().isBadRequest());
        action(101, "SAVE", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 26))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.sign").doesNotExist());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT content_before FROM audit_event WHERE function_name='SAVE'", String.class)).contains("signatureImageFileId");
        action(101, "SUBMIT", 3, "a", Map.of("formId", "form-51", "values", Map.of())).andExpect(status().isBadRequest());
    }

    @Test void inlineSignatureRollsBackWhenAuditFails() throws Exception {
        seedInlineSignature();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        String before = jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class);
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any());
        try { action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of("temperature", 25))).andExpect(status().is5xxServerError()); }
        finally { reset(audits); }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM form_instance_record", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class)).isEqualTo(before);
    }

    @Test void inlineSignatureRejectsUnavailableCertificationAndInvalidTargets() throws Exception {
        seedInlineSignature();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        var command = new HashMap<>(inlineSign("sign-secret", Map.of("temperature", 25)));
        command.put("signatureTarget", Map.of("fieldId", "temperature"));
        action(101, "SIGN_FIELD", 1, "a", command).andExpect(status().isBadRequest());
        command.put("signatureTarget", Map.of("fieldId", "sign")); command.put("instanceId", "foreign-copy");
        action(101, "SIGN_FIELD", 1, "a", command).andExpect(status().isBadRequest());
        jdbc.update("UPDATE signature SET expires_at=? WHERE id=900", java.time.LocalDateTime.now().minusDays(1));
        action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of())).andExpect(status().isBadRequest());
        jdbc.update("UPDATE signature SET expires_at=? WHERE id=900", java.time.LocalDateTime.now().plusDays(1));
        jdbc.update("UPDATE user_account SET status='DISABLED' WHERE id=1");
        action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of())).andExpect(status().isBadRequest());
        jdbc.update("UPDATE user_account SET status='ACTIVE' WHERE id=1");
        jdbc.update("DELETE FROM signature WHERE id=900");
        action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of())).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT revision FROM production_execution WHERE object_id=101", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isZero();
    }

    @Test void inlineSignaturesCoexistAndSubtableContentInvalidatesAllWithoutDeletingEvidence() throws Exception {
        seedInlineSignature();
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=5", """
            {"fields":[{"id":"temperature","name":"温度","type":"number"},{"id":"sign","name":"领料人","type":"signature"},
            {"id":"rows","name":"明细","type":"subTable","typeConfig":{"columns":[{"id":"amount","name":"数量","type":"number"},{"id":"rowSign","name":"确认","type":"signature"}]}}]}
            """);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of("temperature", 25, "rows", List.of(Map.of("amount", 1))))).andExpect(status().isOk());
        var command = new HashMap<>(inlineSign("sign-secret", Map.of()));
        command.put("signatureTarget", Map.of("fieldId", "rowSign", "tableId", "rows", "rowIndex", 0));
        action(101, "SIGN_FIELD", 2, "a", command).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.sign.signatureId").isNotEmpty())
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.rows[0].rowSign.signatureId").isNotEmpty());
        action(101, "SIGN_FIELD", 3, "a", command).andExpect(status().isBadRequest());
        command.put("signatureTarget", Map.of("fieldId", "rowSign", "tableId", "rows", "rowIndex", 9));
        action(101, "SIGN_FIELD", 3, "a", command).andExpect(status().isBadRequest());
        var state = mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class));
        var rows = state.path("operations").path("a").path("forms").path("form-51").path("values").path("rows").deepCopy();
        ((com.fasterxml.jackson.databind.node.ObjectNode) rows.get(0)).put("amount", 2);
        action(101, "SAVE", 3, "a", Map.of("formId", "form-51", "values", Map.of("rows", rows))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.sign").doesNotExist())
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.rows[0].rowSign").doesNotExist());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isEqualTo(2);
    }

    @Test void inlineSignatureHonorsFrozenReadonlyAndNodePermissions() throws Exception {
        seedInlineSignature();
        jdbc.update("UPDATE form_template_version SET canvas_design_json=? WHERE id=5", "{\"bindings\":{\"fieldId\":\"sign\",\"readonly\":true}}");
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.availability.a.forms['form-51'].signaturePermissions.sign").value("READ_ONLY"));
        action(101, "SIGN_FIELD", 1, "a", inlineSign("sign-secret", Map.of())).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isZero();
    }

    @Test void deletingSignedRowsInvalidatesRemainingSignaturesAndRejectsForgery() throws Exception {
        seedInlineSignature();
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=5", """
            {"fields":[{"id":"rows","name":"明细","type":"subTable","typeConfig":{"columns":[{"id":"amount","type":"number"},{"id":"rowSign","type":"signature"}]}}]}
            """);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        var command = new HashMap<String, Object>(inlineSign("sign-secret", Map.of("rows", List.of(Map.of("amount", 1), Map.of("amount", 2)))));
        command.put("signatureTarget", Map.of("fieldId", "rowSign", "tableId", "rows", "rowIndex", 0));
        action(101, "SIGN_FIELD", 1, "a", command).andExpect(status().isOk());
        command.put("values", Map.of());
        command.put("signatureTarget", Map.of("fieldId", "rowSign", "tableId", "rows", "rowIndex", 1));
        action(101, "SIGN_FIELD", 2, "a", command).andExpect(status().isOk());
        var rows = (com.fasterxml.jackson.databind.node.ArrayNode) mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class))
            .path("operations").path("a").path("forms").path("form-51").path("values").path("rows").deepCopy();
        rows.remove(0);
        var forged = rows.deepCopy();
        ((com.fasterxml.jackson.databind.node.ObjectNode) forged.get(0).path("rowSign")).put("signerName", "伪造");
        action(101, "SAVE", 3, "a", Map.of("formId", "form-51", "values", Map.of("rows", forged))).andExpect(status().isBadRequest());
        action(101, "SAVE", 3, "a", Map.of("formId", "form-51", "values", Map.of("rows", rows))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.rows[0].amount").value(2))
            .andExpect(jsonPath("$.data.state.operations.a.forms['form-51'].values.rows[0].rowSign").doesNotExist());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isEqualTo(2);
    }

    @Test void subtableCanvasReadonlyIsEnforcedForNewAndLegacySnapshots() throws Exception {
        seedInlineSignature();
        jdbc.update("UPDATE form_template_version SET model_design_json=?, canvas_design_json=? WHERE id=5", """
            {"fields":[{"id":"rows","name":"明细","type":"subTable","typeConfig":{"columns":[{"id":"rowSign","type":"signature"}]}}]}
            """, "{\"bindings\":{\"subTableId\":\"rows\",\"subTableFieldId\":\"rowSign\",\"readonly\":true}}");
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.snapshot.operations[0].forms[0].fields[0].typeConfig.columns[0].readOnly").value(true));
        var command = new HashMap<String, Object>(inlineSign("sign-secret", Map.of("rows", List.of(Map.of()))));
        command.put("signatureTarget", Map.of("fieldId", "rowSign", "tableId", "rows", "rowIndex", 0));
        action(101, "SIGN_FIELD", 1, "a", command).andExpect(status().isBadRequest());
        var snapshot = mapper.readTree(jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=101", String.class));
        ((com.fasterxml.jackson.databind.node.ObjectNode) snapshot.path("operations").get(0).path("forms").get(0).path("fields").get(0).path("typeConfig").path("columns").get(0)).remove("readOnly");
        jdbc.update("UPDATE production_execution SET snapshot_json=? WHERE object_id=101", mapper.writeValueAsString(snapshot));
        action(101, "SIGN_FIELD", 1, "a", command).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature WHERE target_type='PRODUCTION_EXECUTION'", Integer.class)).isZero();
    }

    private void seedInlineSignature() {
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=5", """
            {"fields":[{"id":"temperature","name":"温度","type":"number","status":"enabled"},
              {"id":"sign","name":"领料人","type":"signature","required":true,"status":"enabled","typeConfig":{}}]}
            """);
        new org.springframework.transaction.support.TransactionTemplate(transactions).executeWithoutResult(status -> signatures.save(Signature.builder()
            .id(900L).targetType("USER_PROFILE").targetId("1").signerId("1").signerName("测试操作员")
            .signaturePasswordHash(passwords.encode("sign-secret")).snapshotData("{\"signatureImage\":{\"fileId\":\"901\"}}")
            .signedAt(java.time.LocalDateTime.now()).expiresAt(java.time.LocalDateTime.now().plusDays(1)).build()));
        jdbc.update("DELETE FROM file_object WHERE id=901");
        jdbc.update("INSERT INTO file_object(id,tenant_id,original_name,mime_type,stored_path,file_size) VALUES(901,'default','signature.png','image/png','test-signature.png',1)");
    }

    private Map<String, Object> inlineSign(String password, Map<String, Object> values) {
        return Map.of("formId", "form-51", "instanceId", "form-51", "values", values, "password", password, "signatureTarget", Map.of("fieldId", "sign"));
    }

    @Test void realApprovalIdentityAndPasswordSignaturePersistAtomically() throws Exception {
        seedSignedWork();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 25))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.works['7'].active[0]").value("f"))
            .andExpect(jsonPath("$.data.state.operations.a.formGroups.work-7-f.ended").value(false));
        String other = tokens.generateToken("2", "other", "其他人员", 5, List.of("production.execution"));
        mvc.perform(post("/api/v1/production/execution/101/actions").header("Authorization", "Bearer " + other).contentType("application/json")
            .content("{\"action\":\"APPROVE\",\"revision\":2,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{}}"))
            .andExpect(status().isBadRequest());
        action(101, "APPROVE", 2, "a", Map.of("formId", "work-7-f", "values", Map.of(), "account", "operator", "password", "wrong")).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM signature", Integer.class)).isZero();
        action(101, "APPROVE", 2, "a", Map.of("formId", "work-7-f", "values", Map.of(), "account", "operator", "password", "test-secret")).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.works['7'].status").value("COMPLETED"))
            .andExpect(jsonPath("$.data.state.operations.a.formGroups.work-7-f.endedReason").value("ALL_COPIES_COMPLETED"));
        assertThat(jdbc.queryForObject("SELECT signer_id FROM signature", String.class)).isEqualTo("1");
        assertThat(jdbc.queryForObject("SELECT snapshot_data FROM signature", String.class)).contains("temperature").doesNotContain("test-secret", "password");
        action(101, "SUBMIT", 3, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 25))).andExpect(status().isOk());
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
        action(101, "COMPLETE", 2, "a", Map.of()).andExpect(status().isOk());
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
        action(101, "SUBMIT", 4, "a", Map.of("formId", "form-51", "instanceId", "form-51", "values", Map.of())).andExpect(status().isOk());
        action(101, "COMPLETE", 5, "a", Map.of()).andExpect(status().isBadRequest());
        action(101, "SUBMIT", 5, "a", Map.of("formId", "form-51", "instanceId", "form-51:copy:2", "values", Map.of())).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.availability.a.canComplete").value(true))
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.canAdd").value(true));
        action(101, "COMPLETE", 6, "a", Map.of()).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.formGroups.form-51.endedReason").value("OPERATION_COMPLETE"));
        assertThat(jdbc.queryForObject("SELECT content_after FROM audit_event WHERE function_name='COMPLETE' AND entity_id='101'", String.class))
            .contains("OPERATION_COMPLETE", "form-51:copy:2");
    }

    @Test void optionalCopyCompletionRequiresAcknowledgementAndPersistsUnfinishedState() throws Exception {
        jdbc.update("UPDATE product_process_operation_form_binding SET required=false WHERE id=51");
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "ADD_FORM_COPY", 1, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        action(101, "COMPLETE", 2, "a", Map.of()).andExpect(status().isBadRequest());
        action(101, "COMPLETE", 2, "a", Map.of("acknowledgeIncomplete", true)).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.status").value("COMPLETED"))
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.status").value("IN_PROGRESS"))
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.canAdd").value(false))
            .andExpect(jsonPath("$.data.availability.a.formCopies.form-51.instances['form-51:copy:2'].canAct").value(false));
        action(101, "SUBMIT", 3, "a", Map.of("formId", "form-51", "instanceId", "form-51:copy:2", "values", Map.of("temperature", 30))).andExpect(status().isBadRequest());
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
        jdbc.update("INSERT INTO workflow_definition(id,tenant_id,type,name) VALUES(7,'default','WORK','装配复核'),(8,'default','FORM_PROCESS','填报与复核')");
        jdbc.update("INSERT INTO workflow_definition_version VALUES(8,8,1,'PUBLISHED',true,?,?)", """
            [{"id":"s","data":{"kind":"START"}},{"id":"review","data":{"kind":"APPROVAL","label":"现场复核","config":{
              "approverSubjects":[{"type":"USER","id":"1"}],"defaultPermission":"READ_ONLY",
              "buttonEvents":[{"id":"sign","event":"BEFORE","action":"APPROVE","builtin":"NONE","signatureMethod":"ACCOUNT_PASSWORD"}]}}},
              {"id":"e","data":{"kind":"END"}}]
            """, "[{\"source\":\"s\",\"target\":\"review\"},{\"source\":\"review\",\"target\":\"e\"}]");
        jdbc.update("INSERT INTO workflow_definition_version VALUES(7,7,1,'PUBLISHED',true,?,?)", """
            [{"id":"s","data":{"kind":"START"}},{"id":"f","data":{"kind":"FORM","label":"装配记录","config":{"formTemplateVersionId":"5","formProcessVersionId":"8","fillMode":"PROCESS"}}},{"id":"e","data":{"kind":"END"}}]
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

    @Test
    @org.junit.jupiter.api.condition.EnabledIfSystemProperty(named = "form.records.browser", matches = "true")
    void formRecordsBrowserFixture() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        var ready = java.nio.file.Path.of("/tmp/form-records-browser.json");
        var done = java.nio.file.Path.of("/tmp/form-records-browser.done");
        java.nio.file.Files.deleteIfExists(done);
        String token = tokens.generateToken("1", "operator", "测试操作员", 30, List.of("production.execution", "master-data.form-templates"));
        java.nio.file.Files.writeString(ready, mapper.writeValueAsString(Map.of("token", token)));
        try {
            long until = System.nanoTime() + TimeUnit.MINUTES.toNanos(15);
            while (!java.nio.file.Files.exists(done) && System.nanoTime() < until) Thread.sleep(500);
        } finally { java.nio.file.Files.deleteIfExists(ready); }
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder request) {
        return request.header("Authorization", "Bearer " + tokens.generateToken("1", "operator", "操作员", 5, List.of("production.execution")));
    }
    private org.springframework.test.web.servlet.ResultActions action(long id, String action, long revision, String op, Map<String, Object> extra) throws Exception {
        Map<String, Object> body = new HashMap<>(extra); body.put("action", action); body.put("revision", revision); body.put("operationId", op);
        return mvc.perform(auth(post("/api/v1/production/execution/" + id + "/actions").contentType("application/json").content(mapper.writeValueAsString(body))));
    }

    @Test void globalQueryRequiresBothPermissionsAndPreservesOldEntry() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        for (String path : List.of("/api/v1/form-instances", "/api/v1/form-instances/1", "/api/v1/form-instances/by-number/missing", "/api/v1/form-instances/1/operation-context")) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
            for (List<String> permissions : List.of(List.of("production.execution"), List.of("form-instances.view"), List.of("master-data.form-templates", "production.execution"))) {
                mvc.perform(get(path).header("Authorization", "Bearer " + tokens.generateToken("2", "reader", "读者", 5, permissions))).andExpect(status().isForbidden());
            }
        }
        mvc.perform(queryAuth(get("/api/v1/form-instances"))).andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].createdById").value("1"))
            .andExpect(jsonPath("$.data.content[0].source.sourceType").value("PRODUCTION_EXECUTION")); // Reader 2 sees author 1 without own/dept scope.
        mvc.perform(queryAuth(get("/api/v1/form-instance-records").param("templateId", "5"))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/form-instance-records").param("templateId", "5").header("Authorization", "Bearer " +
            tokens.generateToken("2", "reader", "读者", 5, List.of("master-data.form-templates", "production.execution"))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.content[0].fieldValues.temperature").value(22));
    }

    @Test void globalQueryUsesFrozenMetadataCrossTemplateFiltersAndStablePages() throws Exception {
        seedQueryRecords();
        jdbc.update("UPDATE form_template SET name='新的模板名',code='NEW'");
        int auditsBefore = jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class);
        mvc.perform(queryAuth(get("/api/v1/form-instances"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalElements").value(2)).andExpect(jsonPath("$.data.content[0].fieldValues").doesNotExist())
            .andExpect(jsonPath("$.data.content[0].snapshot").doesNotExist());
        var query = get("/api/v1/form-instances").param("templateId", "6").param("templateVersionId", "6")
            .param("templateCode", "F02").param("templateName", "补充").param("workOrderId", "100")
            .param("productionObjectId", "102").param("productionObjectType", "SN").param("operationId", "a")
            .param("sourceType", "PRODUCTION_EXECUTION").param("sourceId", "102").param("recordStatus", "COMPLETED", "ACTIVE")
            .param("createdById", "1").param("updatedById", "1").param("keyword", "SN01");
        mvc.perform(queryAuth(query)).andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].templateName").value("补充记录"))
            .andExpect(jsonPath("$.data.content[0].source.workOrderNo").value("WO01"));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("templateId", "5").param("templateVersionId", "6")))
            .andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("productionObjectId", "101").param("productionObjectType", "SN")))
            .andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("productionObjectId", "101").param("workOrderId", "999")))
            .andExpect(jsonPath("$.data.totalElements").value(0));
        jdbc.update("UPDATE form_instance_record SET created_at=TIMESTAMP '2026-09-15 10:00:00'");
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("size", "1"))).andExpect(jsonPath("$.data.content[0].formInstanceId").value("2"));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("size", "1").param("page", "1"))).andExpect(jsonPath("$.data.content[0].formInstanceId").value("1"));
        jdbc.update("UPDATE form_instance_record SET created_at=NULL WHERE id=2");
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("size", "1"))).andExpect(jsonPath("$.data.content[0].formInstanceId").value("1"));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("createdFrom", "2026-09-15T10:00:00").param("createdTo", "2026-09-15T10:00:01")))
            .andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("createdTo", "2026-09-15T10:00:00")))
            .andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("updatedTo", "2020-01-01T00:00:00")))
            .andExpect(jsonPath("$.data.totalElements").value(0));
        for (String special : List.of("%", "_", "!", "' OR 1=1 --", "temperature")) {
            mvc.perform(queryAuth(get("/api/v1/form-instances").param("keyword", special))).andExpect(jsonPath("$.data.totalElements").value(0));
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class)).isEqualTo(auditsBefore);
    }

    @Test void globalQueryExactDetailsTenantBoundaryAndSourceControls() throws Exception {
        seedQueryRecords();
        String number = jdbc.queryForObject("SELECT instance_no FROM form_instance_record WHERE id=1", String.class);
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("instanceNo", number))).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("instanceNo", number.substring(0, 5)))).andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("instanceNoContains", "FR-"))).andExpect(jsonPath("$.data.totalElements").value(2));
        for (String path : List.of("/api/v1/form-instances/1", "/api/v1/form-instances/by-number/" + number)) {
            mvc.perform(queryAuth(get(path))).andExpect(status().isOk()).andExpect(jsonPath("$.data.formInstanceId").value("1"))
                .andExpect(jsonPath("$.data.snapshot.name").value("装配记录")).andExpect(jsonPath("$.data.fieldValues.temperature").value(22))
                .andExpect(jsonPath("$.data.source.sourceType").value("PRODUCTION_EXECUTION"));
        }
        mvc.perform(queryAuth(get("/api/v1/form-instances/1/operation-context"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.source.copyId").value("form-51")).andExpect(jsonPath("$.data.revision").value(2))
            .andExpect(jsonPath("$.data.controls.canAct").value(true));
        action(101, "SUBMIT", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 23))).andExpect(status().isOk());
        mvc.perform(queryAuth(get("/api/v1/form-instances/1/operation-context"))).andExpect(jsonPath("$.data.controls.canAct").value(false));
        mvc.perform(queryAuth(post("/api/v1/production/execution/101/actions").contentType("application/json")
            .content("{\"action\":\"SAVE\",\"revision\":3,\"operationId\":\"a\",\"formId\":\"form-51\",\"values\":{}}")))
            .andExpect(status().isBadRequest());
        jdbc.update("UPDATE form_instance_record SET source_type='UNSUPPORTED' WHERE id=2");
        mvc.perform(queryAuth(get("/api/v1/form-instances"))).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(queryAuth(get("/api/v1/form-instances/2"))).andExpect(status().isNotFound());
        jdbc.update("UPDATE form_instance_record SET source_type='PRODUCTION_EXECUTION' WHERE id=2");
        jdbc.update("UPDATE form_instance_record SET tenant_id='other' WHERE id=1");
        mvc.perform(queryAuth(get("/api/v1/form-instances"))).andExpect(jsonPath("$.data.totalElements").value(1));
        for (String path : List.of("/api/v1/form-instances/1", "/api/v1/form-instances/1/operation-context", "/api/v1/form-instances/by-number/" + number)) {
            mvc.perform(queryAuth(get(path))).andExpect(status().isNotFound());
        }
    }

    @Test void globalQueryDoesNotGrantAnActiveApprovalNodeAndKeepsPrincipalHistory() throws Exception {
        seedSignedWork();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        mvc.perform(queryAuth(post("/api/v1/production/execution/101/actions").contentType("application/json")
            .content("{\"action\":\"SUBMIT\",\"revision\":2,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{\"temperature\":23}}")))
            .andExpect(status().isOk());
        mvc.perform(queryAuth(get("/api/v1/form-instances/1"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.createdById").value("1")).andExpect(jsonPath("$.data.updatedById").value("2"));
        mvc.perform(queryAuth(get("/api/v1/form-instances/1/operation-context"))).andExpect(status().isOk())
            .andExpect(jsonPath("$.data.controls.canAct").value(false));
        mvc.perform(queryAuth(post("/api/v1/production/execution/101/actions").contentType("application/json")
            .content("{\"action\":\"APPROVE\",\"revision\":3,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{}}")))
            .andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT status FROM form_instance_record WHERE id=1", String.class)).isEqualTo("ACTIVE");
    }

    @Test void globalQueryRejectsUnsupportedAndMalformedConditions() throws Exception {
        for (var entry : Map.ofEntries(Map.entry("size", "201"), Map.entry("page", "-1"), Map.entry("templateId", "NaN"),
            Map.entry("productionObjectType", "OTHER"), Map.entry("sourceType", "STANDALONE"), Map.entry("sourceId", "101"),
            Map.entry("sort", "values_json,desc"), Map.entry("tenantId", "other"), Map.entry("activeRequestType", "NONE"),
            Map.entry("recordStatus", "VOIDED"), Map.entry("createdFrom", "2026-09-16T00:00:00Z"), Map.entry("keyword", " ")).entrySet()) {
            mvc.perform(queryAuth(get("/api/v1/form-instances").param(entry.getKey(), entry.getValue()))).andExpect(status().isBadRequest());
        }
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("templateId", "5", "6"))).andExpect(status().isBadRequest());
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("instanceNo", "FR-1").param("instanceNoContains", "FR-"))).andExpect(status().isBadRequest());
        mvc.perform(queryAuth(get("/api/v1/form-instances").param("updatedFrom", "2026-09-16T01:00:00").param("updatedTo", "2026-09-16T00:00:00")))
            .andExpect(status().isBadRequest());
        mvc.perform(queryAuth(get("/api/v1/form-instances/no-number"))).andExpect(status().isBadRequest());
        mvc.perform(queryAuth(get("/api/v1/form-instances/999"))).andExpect(status().isNotFound());
        mvc.perform(queryAuth(get("/api/v1/form-instances/1/operation-context").param("intent", "CHANGE"))).andExpect(status().isBadRequest());
    }

    private void seedQueryRecords() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        jdbc.update("INSERT INTO form_template(id,name,code,category_name) VALUES(6,'补充记录','F02','生产记录')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_label,model_design_json,canvas_design_json) SELECT 6,6,'V1',model_design_json,canvas_design_json FROM form_template_version WHERE id=5");
        jdbc.update("UPDATE product_process_operation_form_binding SET form_template_version_id=6 WHERE id=51");
        action(102, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(102, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 24))).andExpect(status().isOk());
    }

    private MockHttpServletRequestBuilder queryAuth(MockHttpServletRequestBuilder request) {
        return request.header("Authorization", "Bearer " + tokens.generateToken("2", "reader", "读者", 5, List.of("production.execution", "form-instances.view")));
    }

    @Test void worklistIncludesUnsavedAndSavedButFilledRequiresActualSubmit() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE"), "1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
            .andExpect(jsonPath("$.data.content[0].saved").value(false)).andExpect(jsonPath("$.data.content[0].instanceNo").isEmpty());
        mvc.perform(personal(worklistDetail("FILLABLE", "form-51", "form-51"), "1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.controls.canAct").value(true));
        action(101, "SAVE", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE").param("saved", "true"), "1")).andExpect(jsonPath("$.data.totalElements").value(1));
        for (String view : List.of("FILLED", "CREATED", "REVIEW_DONE")) {
            mvc.perform(personal(get("/api/v1/form-worklists/" + view), "1")).andExpect(jsonPath("$.data.totalElements").value(0));
        }
        action(101, "SUBMIT", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 23))).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/FILLED"), "1")).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(personal(get("/api/v1/form-worklists/FILLED"), "2")).andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(personal(worklistDetail("FILLED", "form-51", "form-51"), "1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.controls.canAct").value(false)).andExpect(jsonPath("$.data.myEvents.length()").value(1));
        mvc.perform(personal(worklistDetail("FILLED", "form-51", "form-51"), "2")).andExpect(status().isNotFound());
        mvc.perform(personal(get("/api/v1/form-instances"), "1")).andExpect(status().isForbidden());
    }

    @Test void worklistExplicitCreationIsIndependentFromFirstSaverAndSystemFirstCopy() throws Exception {
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "ADD_FORM_COPY", 1, "a", Map.of("formId", "form-51")).andExpect(status().isOk());
        String response = action(101, "ATTACH_FORM", 2, "a", Map.of("templateVersionId", "5", "required", false))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String custom = mapper.readTree(response).path("data").path("attachedFormId").asText();
        mvc.perform(personal(get("/api/v1/form-worklists/CREATED"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(2))
            .andExpect(jsonPath("$.data.content[?(@.copyId == 'form-51:copy:2')].creationType").value("ADDED_COPY"))
            .andExpect(jsonPath("$.data.content[?(@.copyId == '" + custom + "')].creationType").value("CUSTOM_FORM"));
        mvc.perform(personal(worklistDetail("CREATED", custom, custom), "1"))
            .andExpect(jsonPath("$.data.controls.canAct").value(false)).andExpect(jsonPath("$.data.creationType").value("CUSTOM_FORM"));
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
            .content(mapper.writeValueAsString(Map.of("action", "SAVE", "revision", 3, "operationId", "a",
                "formId", "form-51", "instanceId", "form-51:copy:2", "values", Map.of("temperature", 22)))), "2")).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/CREATED").param("saved", "true"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(1)).andExpect(jsonPath("$.data.content[0].creatorId").value("1"));
        mvc.perform(personal(get("/api/v1/form-worklists/CREATED"), "2")).andExpect(jsonPath("$.data.totalElements").value(0));
        assertThat(jdbc.queryForObject("SELECT created_by_id FROM form_instance_record", String.class)).isEqualTo("2");
    }

    @Test void worklistReturnAndResubmitKeepPersonalHistoryAndUseActualApprovalQualification() throws Exception {
        seedSignedWork();
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_PENDING"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(1)).andExpect(jsonPath("$.data.content[0].nodeId").value("review"));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_PENDING"), "2")).andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(personal(worklistDetail("REVIEW_PENDING", "work-7-f", "work-7-f"), "2")).andExpect(status().isNotFound());
        action(101, "RETURN", 2, "a", Map.of("formId", "work-7-f", "values", Map.of())).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE"), "1")).andExpect(jsonPath("$.data.totalElements").value(2));
        for (String view : List.of("FILLED", "REVIEW_DONE")) {
            mvc.perform(personal(get("/api/v1/form-worklists/" + view), "1")).andExpect(jsonPath("$.data.totalElements").value(1));
        }
        action(101, "SUBMIT", 3, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 23))).andExpect(status().isOk());
        mvc.perform(personal(worklistDetail("FILLED", "work-7-f", "work-7-f"), "1")).andExpect(jsonPath("$.data.myEvents.length()").value(2));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_PENDING"), "1")).andExpect(jsonPath("$.data.totalElements").value(1));
        action(101, "APPROVE", 4, "a", Map.of("formId", "work-7-f", "values", Map.of(), "account", "operator", "password", "test-secret")).andExpect(status().isOk());
        mvc.perform(personal(worklistDetail("REVIEW_DONE", "work-7-f", "work-7-f"), "1"))
            .andExpect(jsonPath("$.data.myEvents.length()").value(2)).andExpect(jsonPath("$.data.controls.canAct").value(false));
        JsonNode state = mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class));
        for (JsonNode event : state.path("history")) {
            if ("RETURN".equals(event.path("actionCode").asText())) ((com.fasterxml.jackson.databind.node.ObjectNode) event).put("at", "2026-09-01T10:00:00");
            if ("APPROVE".equals(event.path("actionCode").asText())) ((com.fasterxml.jackson.databind.node.ObjectNode) event).put("at", "2026-09-02T10:00:00");
        }
        jdbc.update("UPDATE production_execution SET state_json=? WHERE object_id=101", state.toString());
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_DONE").param("reviewResult", "RETURN").param("reviewedFrom", "2026-09-02T00:00:00"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_DONE").param("reviewResult", "APPROVE").param("reviewedFrom", "2026-09-02T00:00:00"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test void formApprovalTransferMovesPendingTaskWithoutAdvancingTheFlow() throws Exception {
        seedSignedWork();
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(2,0,'reviewer2','复核员2',?,'ACTIVE')", passwords.encode("test-secret"));
        jdbc.update("UPDATE workflow_definition_version SET nodes_json=? WHERE id=8", """
            [{"id":"s","data":{"kind":"START"}},
             {"id":"review","data":{"kind":"APPROVAL","label":"现场复核","config":{"approverSubjects":[],"defaultPermission":"READ_ONLY","buttons":[
               {"id":"approve","label":"通过","action":"APPROVE"},{"id":"return","label":"退回","action":"RETURN"},{"id":"transfer","label":"转办","action":"TRANSFER"}]}}},
             {"id":"e","data":{"kind":"END"}}]
            """);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_PENDING"), "1"))
            .andExpect(jsonPath("$.data.content[0].canTransfer").value(true))
            .andExpect(jsonPath("$.data.content[0].transferLabel").value("转办"))
            .andExpect(jsonPath("$.data.content[0].transferStyle").value("DEFAULT"));
        mvc.perform(personal(get("/api/v1/production/execution/101/transfer-targets")
                .param("operationId", "a").param("formId", "work-7-f").param("instanceId", "work-7-f"), "1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].id").value("2")).andExpect(jsonPath("$.data[0].name").value("复核员2"));
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"TRANSFER\",\"revision\":2,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"instanceId\":\"work-7-f\",\"targetUserId\":\"2\",\"reason\":\"交由当班复核员\"}"), "1"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.revision").value(3))
            .andExpect(jsonPath("$.data.state.operations.a.forms['work-7-f'].active[0]").value("review"))
            .andExpect(jsonPath("$.data.state.operations.a.forms['work-7-f'].values.temperature").value(22));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_PENDING"), "1")).andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_PENDING"), "2")).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(personal(worklistDetail("REVIEW_PENDING", "work-7-f", "work-7-f"), "2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.transferFrom").value("测试用户"))
            .andExpect(jsonPath("$.data.transferReason").value("交由当班复核员"))
            .andExpect(jsonPath("$.data.transferredAt").isNotEmpty());
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"APPROVE\",\"revision\":3,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{}}"), "1"))
            .andExpect(status().isBadRequest());
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"APPROVE\",\"revision\":3,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{}}"), "2"))
            .andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT reason FROM audit_event WHERE function_name='TRANSFER'", String.class)).isEqualTo("交由当班复核员");
    }

    @Test void transferProjectionIsNodeScopedAndReassignmentIsClearedByReturn() throws Exception {
        seedSignedWork();
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(2,0,'reviewer2','复核员2',?,'ACTIVE')", passwords.encode("test-secret"));
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(3,0,'reviewer3','复核员3',?,'ACTIVE')", passwords.encode("test-secret"));
        jdbc.update("UPDATE workflow_definition_version SET nodes_json=?,edges_json=? WHERE id=8", """
            [{"id":"s","data":{"kind":"START"}},
             {"id":"review","data":{"kind":"APPROVAL","label":"初审","config":{"approverSubjects":[]}}},
             {"id":"review2","data":{"kind":"APPROVAL","label":"复审","config":{"approverSubjects":[]}}},
             {"id":"e","data":{"kind":"END"}}]
            """, """
            [{"source":"s","target":"review"},{"source":"review","target":"review2"},{"source":"review2","target":"e"}]
            """);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"TRANSFER\",\"revision\":2,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"targetUserId\":\"2\",\"reason\":\"初审转办\"}"), "1"))
            .andExpect(status().isOk());
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"APPROVE\",\"revision\":3,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{}}"), "2"))
            .andExpect(status().isOk());
        mvc.perform(personal(worklistDetail("REVIEW_PENDING", "work-7-f", "work-7-f"), "2"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.nodeId").value("review2"))
            .andExpect(jsonPath("$.data.transferReason").isEmpty());
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"TRANSFER\",\"revision\":4,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"targetUserId\":\"3\",\"reason\":\"复审第一次转办\"}"), "2"))
            .andExpect(status().isOk());
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"TRANSFER\",\"revision\":5,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"targetUserId\":\"1\",\"reason\":\"复审再次转办\"}"), "3"))
            .andExpect(status().isOk());
        mvc.perform(personal(post("/api/v1/production/execution/101/actions").contentType("application/json")
                .content("{\"action\":\"RETURN\",\"revision\":6,\"operationId\":\"a\",\"formId\":\"work-7-f\",\"values\":{}}"), "1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.state.operations.a.forms['work-7-f'].transferAssignees").isEmpty());
    }

    @Test void worklistHistoricalNodeFiltersMatchTheSameEventBeforeSelectingTheLatest() throws Exception {
        seedSignedWork();
        jdbc.update("UPDATE workflow_definition_version SET nodes_json=?,edges_json=? WHERE id=8", """
            [{"id":"s","data":{"kind":"START"}},
             {"id":"review","data":{"kind":"APPROVAL","label":"初审","config":{"approverSubjects":[{"type":"USER","id":"1"}],"defaultPermission":"READ_ONLY"}}},
             {"id":"review2","data":{"kind":"APPROVAL","label":"复审","config":{"approverSubjects":[{"type":"USER","id":"1"}],"defaultPermission":"READ_ONLY"}}},
             {"id":"e","data":{"kind":"END"}}]
            """, """
            [{"source":"s","target":"review"},{"source":"review","target":"review2"},{"source":"review2","target":"e"}]
            """);
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        action(101, "SUBMIT", 1, "a", Map.of("formId", "work-7-f", "values", Map.of("temperature", 22))).andExpect(status().isOk());
        action(101, "APPROVE", 2, "a", Map.of("formId", "work-7-f", "values", Map.of())).andExpect(status().isOk());
        action(101, "APPROVE", 3, "a", Map.of("formId", "work-7-f", "values", Map.of())).andExpect(status().isOk());
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_DONE"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(1)).andExpect(jsonPath("$.data.content[0].nodeId").value("review2"));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_DONE").param("nodeId", "review"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(1)).andExpect(jsonPath("$.data.content[0].nodeId").value("review"));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_DONE").param("nodeName", "初审"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(1)).andExpect(jsonPath("$.data.content[0].nodeId").value("review"));
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_DONE").param("nodeId", "review").param("nodeName", "复审"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(0));
        JsonNode state = mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class));
        for (JsonNode event : state.path("history")) if ("APPROVE".equals(event.path("actionCode").asText())) {
            ((com.fasterxml.jackson.databind.node.ObjectNode) event).put("at", event.path("nodeId").asText().equals("review") ? "2026-09-01T10:00:00" : "2026-09-02T10:00:00");
        }
        jdbc.update("UPDATE production_execution SET state_json=? WHERE object_id=101", state.toString());
        mvc.perform(personal(get("/api/v1/form-worklists/REVIEW_DONE").param("nodeId", "review").param("reviewedFrom", "2026-09-02T00:00:00"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test void worklistFilteringPaginationAndLegacyHistoryDoNotInventParticipation() throws Exception {
        seedQueryRecords();
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE").param("size", "1"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(2)).andExpect(jsonPath("$.data.content[0].productionObjectId").value("102"));
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE").param("size", "1").param("page", "1"), "1"))
            .andExpect(jsonPath("$.data.content[0].productionObjectId").value("101"));
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE").param("productionObjectType", "SN").param("templateName", "补充").param("saved", "true"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE").param("keyword", "temperature"), "1")).andExpect(jsonPath("$.data.totalElements").value(0));
        action(101, "SUBMIT", 2, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 23))).andExpect(status().isOk());
        JsonNode state = mapper.readTree(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class));
        for (JsonNode event : state.path("history")) ((com.fasterxml.jackson.databind.node.ObjectNode) event).remove(List.of("actionCode", "formId", "copyId", "nodeKind"));
        jdbc.update("UPDATE production_execution SET state_json=? WHERE object_id=101", state.toString());
        mvc.perform(personal(get("/api/v1/form-worklists/FILLED"), "1"))
            .andExpect(jsonPath("$.data.totalElements").value(0)).andExpect(jsonPath("$.data.historyCoverage").value("STRUCTURED_EVENTS_ONLY"));
        jdbc.update("UPDATE production_object SET tenant_id='foreign' WHERE id=102");
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE"), "1")).andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test void worklistRejectsWrongPermissionsParamsAndFailedActionsCreateNoHistory() throws Exception {
        for (String view : List.of("FILLABLE", "CREATED", "FILLED", "REVIEW_PENDING", "REVIEW_DONE")) {
            String path = "/api/v1/form-worklists/" + view;
            mvc.perform(get(path)).andExpect(status().isUnauthorized());
            mvc.perform(get(path).header("Authorization", "Bearer " + tokens.generateToken("1", "operator", "测试", 5, List.of("production.execution")))).andExpect(status().isForbidden());
            mvc.perform(get(path).header("Authorization", "Bearer " + tokens.generateToken("1", "operator", "测试", 5, List.of("form-management.filling", "form-management.review")))).andExpect(status().isForbidden());
        }
        for (var entry : Map.of("actorId", "2", "size", "201", "saved", "yes", "sort", "id,desc", "reviewResult", "RETURN", "createdFrom", "2026-09-01T00:00:00Z").entrySet()) {
            mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE").param(entry.getKey(), entry.getValue()), "1")).andExpect(status().isBadRequest());
        }
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE/detail"), "1")).andExpect(status().isBadRequest());
        action(101, "START", 0, "a", Map.of()).andExpect(status().isOk());
        String before = jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class);
        doThrow(new IllegalStateException("test audit failure")).when(audits).save(any());
        try {
            action(101, "SUBMIT", 1, "a", Map.of("formId", "form-51", "values", Map.of("temperature", 23))).andExpect(status().isInternalServerError());
        } finally { reset(audits); }
        assertThat(jdbc.queryForObject("SELECT state_json FROM production_execution WHERE object_id=101", String.class)).isEqualTo(before);
        mvc.perform(personal(get("/api/v1/form-worklists/FILLED"), "1")).andExpect(jsonPath("$.data.totalElements").value(0));
        jdbc.update("UPDATE production_object SET status='COMPLETED' WHERE id=101");
        mvc.perform(personal(get("/api/v1/form-worklists/FILLABLE"), "1")).andExpect(jsonPath("$.data.totalElements").value(0));
    }

    private MockHttpServletRequestBuilder personal(MockHttpServletRequestBuilder request, String actor) {
        return request.header("Authorization", "Bearer " + tokens.generateToken(actor, actor.equals("1") ? "operator" : "reader", "测试用户", 5,
            List.of("production.execution", "form-management.filling", "form-management.review")));
    }

    private MockHttpServletRequestBuilder worklistDetail(String view, String form, String copy) {
        return get("/api/v1/form-worklists/" + view + "/detail").param("productionObjectId", "101").param("operationId", "a").param("formId", form).param("copyId", copy);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({DhrFillingController.class, DhrFillingService.class, FormWorklistController.class, FormWorklistService.class, FormInstanceQueryController.class, FormInstanceQueryService.class, FormInstanceRecordController.class, FormInstanceRecordService.class, DhrInstanceController.class, DhrInstanceService.class, ProductionExecutionController.class, ProductionExecutionService.class, ProductionExecutionEngine.class, ExecutionSnapshotBuilder.class, ExecutionPresenceRegistry.class,
        ProductionService.class, ExecutionAccess.class, SubjectResolver.class, FileController.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class,
        com.zencas.edhr.template.controller.FormReferenceController.class, com.zencas.edhr.template.service.FormReferenceLookup.class})
    static class Config {
        @Bean
        @org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "form.records.browser", havingValue = "true")
        org.springframework.boot.web.servlet.FilterRegistrationBean<org.springframework.web.filter.CorsFilter> browserCors() {
            var config = new org.springframework.web.cors.CorsConfiguration();
            config.setAllowedOrigins(List.of("http://localhost:3000"));
            config.setAllowedMethods(List.of("GET", "OPTIONS"));
            config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
            var source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/api/v1/form-instance-records/**", config);
            var bean = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(new org.springframework.web.filter.CorsFilter(source));
            bean.setOrder(org.springframework.core.Ordered.HIGHEST_PRECEDENCE);
            return bean;
        }
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
