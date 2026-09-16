package com.zencas.edhr.masterdata.deletion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.sql.DriverManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@EnabledIfSystemProperty(named = "deletion.test.url", matches = "jdbc:postgresql:.*edhr_deletion_qa_.*")
@SpringBootTest(properties = {
    "spring.datasource.url=${deletion.test.url}", "spring.datasource.username=edhr", "spring.datasource.password=",
    "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=none", "logging.level.org.hibernate.SQL=OFF"
})
@AutoConfigureMockMvc
@Transactional
class DeletionProtectionIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider tokens;
    @Autowired ObjectMapper mapper;
    @Autowired jakarta.persistence.EntityManager entityManager;

    @BeforeAll static void migrate() throws Exception {
        for (int pass = 0; pass < 2; pass++) {
            try (var connection = DriverManager.getConnection(System.getProperty("deletion.test.url"), "edhr", "");
                 var migration = new Liquibase("db/changelog/0086-master-data-deletion-protection.sql", new ClassLoaderResourceAccessor(), new JdbcConnection(connection))) {
                migration.update(new Contexts(), new LabelExpression());
            }
        }
    }

    private String auth(String... permissions) {
        return "Bearer " + tokens.generateToken("deletion-test", "deletion-test", "删除保护验证", 5, List.of(permissions));
    }

    private void material(long id) {
        jdbc.update("INSERT INTO material(id,tenant_id,code,name,status) VALUES (?,'default',?,'测试物料','ACTIVE')", id, "DELETE-QA-" + id);
    }

    private void order(long id, long productId) {
        jdbc.update("INSERT INTO work_order(id,tenant_id,order_no,product_id,quantity,planned_quantity,status) VALUES (?,'default',?,?,1,1,'CREATED')", id, "DELETE-QA-ORDER-" + id, productId);
    }

    @Test void precheckReturnsReferencesWithoutDeletingOrWritingAudit() throws Exception {
        material(-87101); order(-87102, -87101);
        long audits = jdbc.queryForObject("SELECT count(*) FROM audit_event", Long.class);
        mvc.perform(get("/api/v1/master-data/deletion-check/material/-87101")
            .header("Authorization", auth("master-data.materials", "production.work-orders")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.allowed").value(false))
            .andExpect(jsonPath("$.data.impact.kind").value("DELETION_BLOCKED"))
            .andExpect(jsonPath("$.data.impact.targetType").value("material"))
            .andExpect(jsonPath("$.data.impact.targetId").value("-87101"))
            .andExpect(jsonPath("$.data.impact.targetModule").value("数据 / 工艺建模 / 物料管理"))
            .andExpect(jsonPath("$.data.impact.groups[0].module").value("生产 / 生产准备 / 工单管理"))
            .andExpect(jsonPath("$.data.impact.groups[0].dataType").value("BUSINESS"))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].code").value("DELETE-QA-ORDER--87102"))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].name").value("DELETE-QA-ORDER--87102"))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].path").value("/production/work-orders?locateId=-87102&locateKeyword=DELETE-QA-ORDER--87102"))
            .andExpect(jsonPath("$.data.impact.groups[0].records.length()").value(1));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM material WHERE id=-87101", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Long.class)).isEqualTo(audits);
        jdbc.update("DELETE FROM work_order WHERE id=-87102");
        mvc.perform(get("/api/v1/master-data/deletion-check/material/-87101")
            .header("Authorization", auth("master-data.materials", "production.work-orders")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.allowed").value(true));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM material WHERE id=-87101", Integer.class)).isEqualTo(1);
    }

    @Test void allowedPrecheckDoesNotDeleteAndFinalDeleteRechecksNewReferences() throws Exception {
        material(-87103);
        mvc.perform(get("/api/v1/master-data/deletion-check/material/-87103")
            .header("Authorization", auth("master-data.materials")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.allowed").value(true));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM material WHERE id=-87103", Integer.class)).isEqualTo(1);
        order(-87104, -87103);
        mvc.perform(delete("/api/v1/master-data/process-modeling/materials/-87103")
            .header("Authorization", auth("master-data.materials", "production.work-orders")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.kind").value("DELETION_BLOCKED"));
    }

    @Test void templateReferenceLocationUsesTemplateNameInsteadOfVersionCodeFilter() throws Exception {
        jdbc.update("INSERT INTO form_template(id,tenant_id,code,name) VALUES (-87201,'default','QA-FORM-LOCATION','被引用表单')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_number,status) VALUES (87202,-87201,1,'DRAFT')");
        jdbc.update("INSERT INTO dhr_template(id,tenant_id,name) VALUES (-87203,'default','无编码模板')");
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_number,version_label) VALUES (-87204,-87203,1,'V1.0')");
        jdbc.update("INSERT INTO dhr_directory(id,version_id,name) VALUES (-87205,-87204,'生产记录')");
        jdbc.update("INSERT INTO dhr_template_item(id,directory_id,form_template_id,form_template_version_id) VALUES (-87206,-87205,-87201,87202)");
        mvc.perform(get("/api/v1/master-data/deletion-check/form_template/-87201")
            .header("Authorization", auth("master-data.form-templates", "master-data.batch-record-templates")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].path").value(org.hamcrest.Matchers.containsString("&locateName=" + java.net.URLEncoder.encode("无编码模板", java.nio.charset.StandardCharsets.UTF_8))))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].path").value(org.hamcrest.Matchers.containsString("&locateVersion=-87204&locateChild=-87206&locateType=dhr_template_item")))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].name").value(org.hamcrest.Matchers.containsString("被引用表单")));
    }

    @Test void precheckEnforcesPermissionsAndRejectsUnknownTargets() throws Exception {
        material(-87105); order(-87106, -87105);
        mvc.perform(get("/api/v1/master-data/deletion-check/material/-87105").header("Authorization", auth()))
            .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/master-data/deletion-check/material/-87105").header("Authorization", auth("master-data.materials")))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.impact.groups[0].restricted").value(true))
            .andExpect(jsonPath("$.data.impact.groups[0].records").isEmpty());
        mvc.perform(get("/api/v1/master-data/deletion-check/audit_event/1").header("Authorization", auth("master-data.materials")))
            .andExpect(status().isBadRequest());
    }

    @Test void referencedMaterialReturnsAllOrdersWithoutDeletingOrWritingAudit() throws Exception {
        material(-86001);
        for (int i = 0; i < 7; i++) order(-86100 - i, -86001);
        long audits = jdbc.queryForObject("SELECT count(*) FROM audit_event", Long.class);
        mvc.perform(delete("/api/v1/master-data/process-modeling/materials/-86001")
            .header("Authorization", auth("master-data.materials", "production.work-orders")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.kind").value("DELETION_BLOCKED"))
            .andExpect(jsonPath("$.data.groups[0].count").value(7))
            .andExpect(jsonPath("$.data.groups[0].records.length()").value(7))
            .andExpect(jsonPath("$.data.groups[0].path").value("/production/work-orders"));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM material WHERE id=-86001", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Long.class)).isEqualTo(audits);
    }

    @Test void noReferencesDeletesAndWritesOriginalAudit() throws Exception {
        material(-86002);
        mvc.perform(delete("/api/v1/master-data/process-modeling/materials/-86002").header("Authorization", auth("master-data.materials")))
            .andExpect(status().isOk());
        entityManager.flush();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM material WHERE id=-86002", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE entity_type='MATERIAL' AND entity_id='-86002' AND action='DELETE'", Integer.class)).isEqualTo(1);
    }

    @Test void associationDetailsAreRedactedWithoutRelatedModulePermission() throws Exception {
        material(-86003); order(-86103, -86003);
        mvc.perform(delete("/api/v1/master-data/process-modeling/materials/-86003").header("Authorization", auth("master-data.materials")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].restricted").value(true))
            .andExpect(jsonPath("$.data.groups[0].count").value(1)).andExpect(jsonPath("$.data.groups[0].records").isEmpty())
            .andExpect(jsonPath("$.data.groups[0].path").doesNotExist());
        mvc.perform(delete("/api/v1/master-data/process-modeling/materials/-86003").header("Authorization", auth()))
            .andExpect(status().isForbidden());
    }

    @Test void parentFormTemplateIncludesChildVersionWorkGraphReferences() throws Exception {
        jdbc.update("INSERT INTO form_template(id,tenant_id,code,name) VALUES (-86201,'default','DELETE-QA-FORM','测试表单')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_number,status) VALUES (86202,-86201,1,'DRAFT')");
        jdbc.update("INSERT INTO workflow_definition(id,tenant_id,name,type,status) VALUES (-86203,'default','关联作业模板','WORK','DRAFT')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,nodes_json) VALUES (-86204,-86203,1,'DRAFT','[{\"data\":{\"kind\":\"FORM\",\"config\":{\"formTemplateVersionId\":\"86202\"}}}]'::jsonb)");
        mvc.perform(delete("/api/v1/master-data/template-modeling/form-templates/-86201")
            .header("Authorization", auth("master-data.form-templates", "production.work-templates")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].records[0].context").value(org.hamcrest.Matchers.containsString("关联作业模板")));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_template_version WHERE id=86202", Integer.class)).isEqualTo(1);
    }

    @Test void equipmentHierarchyAndLegacyDeleteAliasUseSameProtection() throws Exception {
        jdbc.update("INSERT INTO equipment_type(id,tenant_id,code,name) VALUES (-86301,'default','DELETE-QA-TYPE','关联设备类型')");
        jdbc.update("INSERT INTO equipment(id,equipment_type_id,code,name) VALUES (-86302,-86301,'DELETE-QA-EQ','关联设备')");
        mvc.perform(delete("/api/v1/master-data/equipment/types/-86301").header("Authorization", auth("master-data.equipment")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].records[0].name").value("关联设备"));
        jdbc.update("INSERT INTO operation(id,tenant_id,code,name) VALUES (-86303,'default','DELETE-QA-OP','关联工序')");
        jdbc.update("INSERT INTO route(id,tenant_id,code,name) VALUES (-86304,'default','DELETE-QA-ROUTE','关联路线')");
        jdbc.update("INSERT INTO route_operation(id,route_id,operation_id,sequence_order) VALUES (-86305,-86304,-86303,1)");
        mvc.perform(delete("/api/v1/master-data/operations/-86303").header("Authorization", auth("master-data.operations", "master-data.routes")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].label").value("路线工序"));
    }

    @Test void unreferencedRouteDeletesOwnedGraphWithoutOrphans() throws Exception {
        jdbc.update("INSERT INTO route(id,tenant_id,code,name) VALUES (-86401,'default','DELETE-QA-ROUTE-OWNED','空闲路线')");
        jdbc.update("INSERT INTO route_version(id,tenant_id,route_id,version,version_status,code) VALUES (-86402,'default',-86401,'V1.0','DRAFT','DELETE-QA-ROUTE-VERSION')");
        jdbc.update("INSERT INTO route_node(id,tenant_id,route_version_id,node_key,node_type) VALUES (-86403,'default',-86402,'start','START')");
        mvc.perform(delete("/api/v1/master-data/process-modeling/routes/-86401").header("Authorization", auth("master-data.routes")))
            .andExpect(status().isOk());
        entityManager.flush();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM route_version WHERE id=-86402", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM route_node WHERE id=-86403", Integer.class)).isZero();
    }

    @Test void namedCategoryIsBlockedAndCanStillBeRenamedTransactionally() throws Exception {
        jdbc.update("INSERT INTO operation_category(id,tenant_id,name) VALUES (-86501,'default','删除测试分类')");
        jdbc.update("INSERT INTO operation(id,tenant_id,code,name,operation_category) VALUES (-86502,'default','DELETE-QA-CATEGORY-OP','分类下工序','删除测试分类')");
        mvc.perform(delete("/api/v1/master-data/process-modeling/operations/categories/-86501").header("Authorization", auth("master-data.operations")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].records[0].name").value("分类下工序"));
        jdbc.update("UPDATE operation_category SET name='删除测试分类改名' WHERE id=-86501");
        jdbc.update("UPDATE operation SET operation_category='删除测试分类改名' WHERE id=-86502");
        jdbc.execute("SET CONSTRAINTS fk_deletion_operation_category IMMEDIATE");
    }

    @Test void everyDeclaredRelationMatchesTheActualDatabaseSchema() {
        for (var reference : DeletionRelations.REFERENCES) {
            jdbc.queryForList("SELECT " + reference.column() + " FROM " + reference.child() + " WHERE FALSE");
            jdbc.queryForList("SELECT " + reference.parentField() + " FROM " + reference.parent() + " WHERE FALSE");
        }
    }

    @Test void orphanedRouteNodesAreSeparateFromBusinessRelationsWithoutChangingProtection() throws Exception {
        jdbc.update("INSERT INTO operation(id,tenant_id,code,name) VALUES (-87301,'default','QA-TYPE-OP','装配')");
        jdbc.update("INSERT INTO route(id,tenant_id,code,name) VALUES (-87302,'default','QA-TYPE-ROUTE','现存路线')");
        jdbc.update("INSERT INTO route_version(id,tenant_id,route_id,version,version_status,code) VALUES (-87303,'default',-87302,'V1.0','DRAFT','QA-TYPE-VERSION')");
        jdbc.update("INSERT INTO route_node(id,tenant_id,route_version_id,node_key,node_type,operation_id) VALUES (-87304,'default',-87303,'active-node','OPERATION',-87301)");
        // Reproduce pre-migration orphan data; transaction rollback restores the isolated database.
        jdbc.execute("ALTER TABLE route_version DROP CONSTRAINT fk_delete_guard_025");
        jdbc.update("INSERT INTO route_version(id,tenant_id,route_id,version,version_status,code) VALUES (-87305,'default',-87399,'V2.0','DRAFT','QA-ORPHAN-VERSION')");
        jdbc.execute("ALTER TABLE route_version ADD CONSTRAINT fk_delete_guard_025 FOREIGN KEY(route_id) REFERENCES route(id) ON DELETE CASCADE NOT VALID");
        jdbc.update("INSERT INTO route_node(id,tenant_id,route_version_id,node_key,node_type,operation_id) VALUES (-87306,'default',-87305,'orphan-node','OPERATION',-87301)");
        String permissions = auth("master-data.operations", "master-data.routes");
        String response = mvc.perform(get("/api/v1/master-data/deletion-check/operation/-87301").header("Authorization", permissions))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.allowed").value(false)).andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        var groups = mapper.readTree(response).at("/data/impact/groups");
        assertThat(groups).hasSize(2);
        var orphan = java.util.stream.StreamSupport.stream(groups.spliterator(), false).filter(group -> group.path("dataType").asText().equals("ORPHAN")).findFirst().orElseThrow();
        var business = java.util.stream.StreamSupport.stream(groups.spliterator(), false).filter(group -> group.path("dataType").asText().equals("BUSINESS")).findFirst().orElseThrow();
        assertThat(orphan.path("count").asInt()).isEqualTo(1);
        assertThat(orphan.path("path").isNull()).isTrue();
        assertThat(orphan.at("/records/0/location").asText()).isEqualTo("工艺路线版本 · V2.0 / 路线工序节点");
        assertThat(orphan.at("/records/0/navigationHint").asText()).contains("异常关联").doesNotContain("追溯");
        assertThat(business.at("/records/0/location").asText()).contains("现存路线", "V1.0").doesNotContain("QA-TYPE");
        assertThat(business.at("/records/0/path").asText()).contains("locateNode=active-node");
        jdbc.update("DELETE FROM route_node WHERE id=-87304");
        mvc.perform(delete("/api/v1/master-data/operations/-87301").header("Authorization", permissions))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].dataType").value("ORPHAN"));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM operation WHERE id=-87301", Integer.class)).isEqualTo(1);
    }

    @Test
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    void databaseForeignKeyPreventsConcurrentReferenceAfterDelete() throws Exception {
        material(-86901);
        try (var deleting = DriverManager.getConnection(System.getProperty("deletion.test.url"), "edhr", "");
             var writer = DriverManager.getConnection(System.getProperty("deletion.test.url"), "edhr", "");
             var executor = java.util.concurrent.Executors.newSingleThreadExecutor()) {
            deleting.setAutoCommit(false);
            deleting.createStatement().execute("DELETE FROM material WHERE id=-86901");
            var started = new java.util.concurrent.CountDownLatch(1);
            var future = executor.submit(() -> {
                started.countDown();
                try (var sql = writer.createStatement()) {
                    sql.execute("INSERT INTO work_order(id,tenant_id,code,order_no,product_id,quantity,planned_quantity,status) VALUES (-86902,'default','DELETE-QA-RACE','DELETE-QA-RACE',-86901,1,1,'CREATED')");
                    return "inserted";
                } catch (java.sql.SQLException ex) { return ex.getSQLState(); }
            });
            assertThat(started.await(3, java.util.concurrent.TimeUnit.SECONDS)).isTrue();
            deleting.commit();
            assertThat(future.get(10, java.util.concurrent.TimeUnit.SECONDS)).isEqualTo("23503");
            assertThat(jdbc.queryForObject("SELECT count(*) FROM work_order WHERE id=-86902", Integer.class)).isZero();
        } finally {
            jdbc.update("DELETE FROM work_order WHERE id=-86902");
            jdbc.update("DELETE FROM material WHERE id=-86901");
        }
    }

    @Test void removingDraftJsonReferenceReleasesTemplateProtection() throws Exception {
        jdbc.update("INSERT INTO form_template(id,tenant_id,code,name) VALUES (-86701,'default','DELETE-QA-FORM-REMOVE','可解除引用表单')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_number,status) VALUES (86702,-86701,1,'DRAFT')");
        jdbc.update("INSERT INTO workflow_definition(id,tenant_id,name,type,status) VALUES (-86703,'default','可修改作业','WORK','DRAFT')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,nodes_json) VALUES (-86704,-86703,1,'DRAFT','[{\"data\":{\"config\":{\"formTemplateVersionId\":86702}}}]'::jsonb)");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM deletion_form_reference WHERE form_template_version_id=86702", Integer.class)).isEqualTo(1);
        jdbc.update("UPDATE workflow_definition_version SET nodes_json='[]'::jsonb WHERE id=-86704");
        mvc.perform(delete("/api/v1/master-data/template-modeling/form-templates/-86701").header("Authorization", auth("master-data.form-templates")))
            .andExpect(status().isOk());
        entityManager.flush();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_template_version WHERE id=86702", Integer.class)).isZero();
    }

    @Test void processConfigurationProtectsProductRouteDhrAndDocumentsThroughBothVersionApis() throws Exception {
        material(-86801);
        jdbc.update("INSERT INTO route(id,tenant_id,code,name) VALUES (-86802,'default','DELETE-QA-CHAIN-ROUTE','链路路线')");
        jdbc.update("INSERT INTO route_version(id,tenant_id,route_id,version,version_status,code) VALUES (-86803,'default',-86802,'V1.0','DRAFT','DELETE-QA-CHAIN-RV')");
        jdbc.update("INSERT INTO dhr_template(id,tenant_id,code,name) VALUES (-86804,'default','DELETE-QA-DHR','链路批记录模板')");
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_number,version_label) VALUES (-86805,-86804,1,'V1.0')");
        jdbc.update("INSERT INTO product_process(id,tenant_id,owner_type,owner_id) VALUES (-86806,'default','PRODUCT',-86801)");
        jdbc.update("INSERT INTO product_process_version(id,tenant_id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES (-86807,'default',-86806,'V1.0','量产','BATCH',-86803,-86805)");
        order(-86808, -86801);
        jdbc.update("UPDATE work_order SET process_version_id=-86807 WHERE id=-86808");
        jdbc.update("INSERT INTO product_process_operation_binding(id,product_process_version_id,route_node_key,operation_name) VALUES (-86809,-86807,'operation-1','链路工序')");
        jdbc.update("INSERT INTO sop_document(id,tenant_id,code,title) VALUES (-86810,'default','DELETE-QA-DOC','链路文档')");
        jdbc.update("INSERT INTO document_version(id,document_id,version,code) VALUES (-86811,-86810,'V1.0','DELETE-QA-DOC-V')");
        jdbc.update("INSERT INTO product_process_operation_document_binding(id,product_process_operation_binding_id,document_version_id) VALUES (-86812,-86809,-86811)");
        String permissions = auth("master-data.materials", "master-data.products", "master-data.routes", "master-data.batch-record-templates", "master-data.documents", "production.work-orders");
        mvc.perform(get("/api/v1/master-data/deletion-check/route/-86802").header("Authorization", permissions))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].name").value(org.hamcrest.Matchers.containsString("测试物料")))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].code").value("DELETE-QA--86801"))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].path").value(org.hamcrest.Matchers.containsString("/master-data/products?locateId=-86801&locateKeyword=DELETE-QA--86801&locateVersion=-86807")));
        mvc.perform(get("/api/v1/master-data/deletion-check/sop_document/-86810").header("Authorization", permissions))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].location").value(org.hamcrest.Matchers.containsString("链路工序")))
            .andExpect(jsonPath("$.data.impact.groups[0].records[0].path").value(org.hamcrest.Matchers.containsString("&locateNode=operation-1&locateReference=-86811")));
        for (String path : List.of(
            "process-modeling/materials/-86801", "process-modeling/routes/-86802", "process-modeling/routes/-86802/versions/-86803",
            "template-modeling/batch-record-templates/-86804", "template-modeling/batch-record-templates/-86804/versions/-86805",
            "documents/-86810", "documents/-86810/versions/-86811",
            "product-modeling/process-owners/PRODUCT/-86801/versions/-86807", "product-modeling/products/-86801/versions/-86807")) {
            mvc.perform(delete("/api/v1/master-data/" + path).header("Authorization", permissions))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups").isNotEmpty());
        }
        jdbc.update("INSERT INTO form_template(id,tenant_id,code,name) VALUES (-86813,'default','DELETE-QA-SNAPSHOT-FORM','生产快照表单')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_number,status) VALUES (86814,-86813,1,'DRAFT')");
        jdbc.update("INSERT INTO production_object(id,tenant_id,work_order_id,object_no,object_type,process_version_id,target_quantity) VALUES (-86815,'default',-86808,'DELETE-QA-SNAPSHOT-BATCH','BATCH',-86807,1)");
        jdbc.update("INSERT INTO production_execution(object_id,snapshot_json,state_json,started_at,updated_at) VALUES (-86815,'{\"operations\":[{\"forms\":[{\"versionId\":86814}]}]}','{}',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO production_object(id,tenant_id,work_order_id,object_no,object_type,process_version_id,target_quantity) VALUES (-86816,'default',-86808,'DELETE-QA-SN','SN',-86807,1)");
        String snImpact = mvc.perform(get("/api/v1/master-data/deletion-check/material/-86801")
            .header("Authorization", auth("master-data.materials", "master-data.products", "production.work-orders", "production.batches")))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        assertThat(mapper.readTree(snImpact).findValuesAsText("path")).contains(
            "/production/work-orders?locateId=-86808&locateKeyword=DELETE-QA-ORDER--86808&locateChild=-86816&locateType=production_object");
        mvc.perform(delete("/api/v1/master-data/template-modeling/form-templates/-86813")
            .header("Authorization", auth("master-data.form-templates", "production.batches")))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.data.groups[0].module").value("生产 / 生产准备 / 批次管理"))
            .andExpect(jsonPath("$.data.groups[0].dataType").value("RETAINED"))
            .andExpect(jsonPath("$.data.groups[0].path").value("/production/batches"))
            .andExpect(jsonPath("$.data.groups[0].records[0].context").value(org.hamcrest.Matchers.containsString("DELETE-QA-SNAPSHOT-BATCH")));
    }

    @Test void familyMembersAndWorkshopChildrenAppearWithTheirNames() throws Exception {
        material(-87001);
        jdbc.update("INSERT INTO product_family(id,tenant_id,code,name) VALUES (-87002,'default','DELETE-QA-FAMILY','关联产品簇')");
        jdbc.update("INSERT INTO product_family_member(id,tenant_id,product_family_id,product_id) VALUES (-87003,'default',-87002,-87001)");
        mvc.perform(delete("/api/v1/master-data/process-modeling/materials/-87001").header("Authorization", auth("master-data.materials", "master-data.product-families")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].records[0].context").value("关联产品簇"));
        mvc.perform(delete("/api/v1/master-data/process-modeling/product-families/-87002").header("Authorization", auth("master-data.product-families")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].records[0].name").value("测试物料"));
        jdbc.update("INSERT INTO workshop(id,tenant_id,code,name) VALUES (-87004,1,'DELETE-QA-WORKSHOP','关联车间')");
        jdbc.update("INSERT INTO production_line(id,workshop_id,code,name) VALUES (-87005,-87004,'DELETE-QA-LINE','关联产线')");
        mvc.perform(delete("/api/v1/master-data/workshops/-87004").header("Authorization", auth("master-data.workshops")))
            .andExpect(status().isConflict()).andExpect(jsonPath("$.data.groups[0].records[0].name").value("关联产线"));
    }
}
