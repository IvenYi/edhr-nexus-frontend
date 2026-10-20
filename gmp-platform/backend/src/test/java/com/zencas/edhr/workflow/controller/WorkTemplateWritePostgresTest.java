package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import com.zencas.edhr.workflow.service.FormFillSettingsService;
import com.zencas.edhr.workflow.service.FormProcessReferenceService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Only run against an owned disposable PostgreSQL database: Hibernate creates/drops these synthetic tables. */
@EnabledIfEnvironmentVariable(named = "W3_TEST_DATABASE_URL", matches = "jdbc:postgresql:.*")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest(classes = WorkTemplateWritePostgresTest.Config.class,
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = {"spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.datasource.driver-class-name=org.postgresql.Driver",
                "spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect"})
class WorkTemplateWritePostgresTest {
    @Autowired WorkTemplateController controller;
    @Autowired FormProcessReferenceService references;
    @Autowired WorkflowDefinitionVersionRepository versions;
    @Autowired AuditEventRepository audits;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        String url = System.getenv("W3_TEST_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_write_test")) {
            throw new IllegalArgumentException("Use the owned loopback edhr_w3_write_test database only");
        }
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> "edhr");
        registry.add("spring.datasource.password", () -> "");
    }

    @BeforeAll
    void applyActualVersionIntegrityConstraints() throws Exception {
        jdbc.execute(Files.readString(Path.of("src/main/resources/db/changelog/0060-work-template-version-integrity.sql")));
    }

    @BeforeEach
    void seed() throws Exception {
        AuditContext.setOperator("7", "审查测试人");
        for (String table : List.of("audit_event", "work_form_process_reference", "workflow_definition_version",
                "workflow_binding_rule", "workflow_definition", "form_template_version")) {
            jdbc.update("DELETE FROM " + table);
        }
        jdbc.update("INSERT INTO workflow_definition(id,type,name,code,status) VALUES (101,'WORK','合成审查作业','W3-TEST','ACTIVE'),(902,'FORM_PROCESS','合成表单流程','W3-FORM','ACTIVE')");
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_number,status,model_design_json) VALUES (702,701,1,'DRAFT','{\"fields\":[]}')");
        insertVersion(901, 902, 1, "PUBLISHED", true,
                "[{\"id\":\"start\",\"data\":{\"kind\":\"START\"}},{\"id\":\"end\",\"data\":{\"kind\":\"END\"}}]", "[]");
        ArrayNode graph = graph("FORM");
        insertVersion(202, 101, 1, "PUBLISHED", true, graph.toString(), formEdges());
        insertVersion(201, 101, 2, "DRAFT", false, graph.toString(), formEdges());
        references.rebuildForWorkVersion(versions.findById(201L).orElseThrow());
    }

    @AfterEach
    void clearOperator() { AuditContext.clear(); }

    @ParameterizedTest(name = "{0} rejects {1} without persistent changes")
    @CsvSource({"SAVE,completionCondition", "CREATE_DRAFT,completionCondition", "OVERWRITE_DRAFT,completionCondition",
            "COPY_NEW_DRAFT,completionCondition", "PUBLISH,completionCondition", "SAVE,conditionExpression",
            "CREATE_DRAFT,conditionExpression", "OVERWRITE_DRAFT,conditionExpression",
            "COPY_NEW_DRAFT,conditionExpression", "PUBLISH,conditionExpression"})
    void rejectedCommandsLeaveActualRowsReferencesAndAuditUnchanged(String command, String key) throws Exception {
        String kind = "completionCondition".equals(key) ? "FORM" : "CONDITION";
        ArrayNode graph = graph(kind);
        ((com.fasterxml.jackson.databind.node.ObjectNode) graph.get(1).path("data").path("config")).putNull(key);
        jdbc.update("UPDATE workflow_definition_version SET nodes_json=?::jsonb, edges_json=?::jsonb WHERE id=202",
                graph.toString(), "FORM".equals(kind) ? formEdges() : conditionEdges());
        if ("PUBLISH".equals(command)) {
            jdbc.update("UPDATE workflow_definition_version SET nodes_json=?::jsonb, edges_json=?::jsonb WHERE id=201",
                    graph.toString(), "FORM".equals(kind) ? formEdges() : conditionEdges());
        } else if ("CREATE_DRAFT".equals(command) || "COPY_NEW_DRAFT".equals(command)) {
            jdbc.update("DELETE FROM work_form_process_reference WHERE work_version_id=201");
            jdbc.update("DELETE FROM workflow_definition_version WHERE id=201");
        }
        Map<String, String> before = persistedState();
        String message = "FORM".equals(kind) ? "不支持完成条件配置" : "条件节点包含不支持的旧配置字段";

        assertThatThrownBy(() -> {
            switch (command) {
                case "SAVE" -> controller.saveGraph(101L, 201L, Map.of("nodes", graph, "edges", List.of()));
                case "CREATE_DRAFT" -> controller.createDraftVersion(101L);
                case "OVERWRITE_DRAFT" -> controller.copyPublishedVersionToDraft(101L, 202L, false);
                case "COPY_NEW_DRAFT" -> controller.copyPublishedVersionToDraft(101L, 202L, true);
                case "PUBLISH" -> controller.publishVersion(101L, 201L);
                default -> throw new AssertionError(command);
            }
        }).hasMessageContaining(message);

        assertThat(persistedState()).isEqualTo(before);
        assertThat(controller.getVersion(101L, 202L).getData().getNodesJson())
                .isEqualTo(jdbc.queryForObject("SELECT nodes_json::text FROM workflow_definition_version WHERE id=202", String.class));
    }

    @Test
    void incompleteDraftsPersistAndReadBackWithRealReferenceRefreshAndAudit() throws Exception {
        ArrayNode incompleteForm = graph("FORM");
        ((com.fasterxml.jackson.databind.node.ObjectNode) incompleteForm.get(1).path("data").path("config")).removeAll();
        controller.saveGraph(101L, 201L, Map.of("nodes", incompleteForm, "edges", List.of()));
        assertThat(mapper.readTree(controller.getVersion(101L, 201L).getData().getNodesJson())).isEqualTo(incompleteForm);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM work_form_process_reference", Long.class)).isZero();

        ArrayNode condition = graph("CONDITION");
        controller.saveGraph(101L, 201L, Map.of("nodes", condition, "edges", List.of()));
        assertThat(mapper.readTree(controller.getVersion(101L, 201L).getData().getNodesJson())).isEqualTo(condition);
        assertThat(audits.findAll()).hasSize(2).allSatisfy(event -> {
            assertThat(event.getAction()).isEqualTo("UPDATE");
            assertThat(event.getSnapshotHash()).matches("[0-9a-f]{64}");
            assertThat(mapper.readTree(event.getContentAfter()).path("id").asLong()).isEqualTo(201L);
        });
        Map<String, String> beforePublish = persistedState();
        // Supply legal dynamic edges to isolate unfinished AST from connectivity checks.
        jdbc.update("UPDATE workflow_definition_version SET edges_json=?::jsonb WHERE id=201", conditionEdges());
        Map<String, String> beforeRejectedPublish = persistedState();
        assertThatThrownBy(() -> controller.publishVersion(101L, 201L)).hasMessageContaining("尚未配置结构化条件规则");
        assertThat(persistedState()).isEqualTo(beforeRejectedPublish);
        assertThat(beforePublish.get("audit_event")).isEqualTo(beforeRejectedPublish.get("audit_event"));
    }

    @Test
    void legalPublishCreatesOneInheritedDraftAndReferencesInTheRealTransaction() throws Exception {
        String graphBefore = jdbc.queryForObject("SELECT nodes_json::text FROM workflow_definition_version WHERE id=201", String.class);
        var published = controller.publishVersion(101L, 201L).getData();
        assertThat(published.getStatus()).isEqualTo("PUBLISHED");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_definition_version WHERE definition_id=101 AND status='DRAFT'", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_definition_version WHERE definition_id=101 AND is_current=true", Long.class)).isEqualTo(1);
        String inherited = jdbc.queryForObject("SELECT nodes_json::text FROM workflow_definition_version WHERE definition_id=101 AND status='DRAFT'", String.class);
        assertThat(inherited).isEqualTo(graphBefore);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM work_form_process_reference", Long.class)).isEqualTo(2);
        assertThat(audits.findAll()).hasSize(3).allSatisfy(event -> assertThat(event.getSnapshotHash()).matches("[0-9a-f]{64}"));
    }

    private Map<String, String> persistedState() {
        Map<String, String> state = new LinkedHashMap<>();
        for (String table : List.of("workflow_definition", "workflow_definition_version", "work_form_process_reference", "audit_event")) {
            state.put(table, jdbc.queryForObject("SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,'[]') FROM " + table + " t", String.class));
        }
        return state;
    }

    private void insertVersion(long id, long definition, int number, String status, boolean current, String nodes, String edges) {
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json,created_at) VALUES(?,?,?,?,?,?::jsonb,?::jsonb,current_timestamp)",
                id, definition, number, status, current, nodes, edges);
    }

    private ArrayNode graph(String kind) {
        ArrayNode nodes = mapper.createArrayNode();
        nodes.addObject().put("id", "start").putObject("data").put("kind", "START");
        var config = nodes.addObject().put("id", "step").putObject("data").put("kind", kind).putObject("config");
        if ("FORM".equals(kind)) config.put("fillMode", "PROCESS").put("formTemplateVersionId", "702").put("formProcessVersionId", "901");
        else {
            config.putArray("conditionBranches").addObject().put("id", "condition-1").put("name", "条件 1").putNull("conditionRule");
            config.putObject("conditionDefaultBranch").put("id", "condition-default").put("name", "否则");
        }
        nodes.addObject().put("id", "end").putObject("data").put("kind", "END");
        return nodes;
    }

    private String formEdges() { return "[{\"source\":\"start\",\"target\":\"step\"},{\"source\":\"step\",\"target\":\"end\"}]"; }
    private String conditionEdges() { return "[{\"source\":\"start\",\"target\":\"step\",\"targetHandle\":\"condition-input\"},{\"source\":\"step\",\"sourceHandle\":\"condition-1\",\"target\":\"end\"},{\"source\":\"step\",\"sourceHandle\":\"condition-default\",\"target\":\"end\"}]"; }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({WorkTemplateController.class, FormFillSettingsService.class, FormProcessReferenceService.class})
    static class Config {
        @Bean EntityManager em(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes types() { return PersistenceManagedTypes.of(WorkflowDefinition.class.getName(), WorkflowDefinitionVersion.class.getName(), WorkflowBindingRule.class.getName(), WorkFormProcessReference.class.getName(), FormTemplateVersion.class.getName(), AuditEvent.class.getName()); }
        @Bean WorkflowDefinitionRepository definitions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowDefinitionRepository.class); }
        @Bean WorkflowDefinitionVersionRepository versions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowDefinitionVersionRepository.class); }
        @Bean WorkflowBindingRuleRepository bindings(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkflowBindingRuleRepository.class); }
        @Bean WorkFormProcessReferenceRepository references(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(WorkFormProcessReferenceRepository.class); }
        @Bean FormTemplateVersionRepository forms(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(FormTemplateVersionRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
    }
}
