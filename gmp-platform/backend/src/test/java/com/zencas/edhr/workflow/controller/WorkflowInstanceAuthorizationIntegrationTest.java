package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.identity.service.SubjectResolver;
import com.zencas.edhr.workflow.engine.StateMachineService;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real JWT/filter/method-security, controller, engine and repository chain on synthetic tables. */
@SpringBootTest(classes = WorkflowInstanceAuthorizationIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class WorkflowInstanceAuthorizationIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired WorkflowInstanceRepository instances;
    @Autowired WorkflowTaskRepository tasks;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        String url = System.getenv("W3_COMMAND_DATABASE_URL");
        if (url == null) {
            registry.add("spring.datasource.url", () -> "jdbc:h2:mem:workflow-command-auth;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
            registry.add("spring.datasource.driver-class-name", () -> "org.h2.Driver");
            registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.H2Dialect");
        } else {
            if (!url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_command_test"))
                throw new IllegalArgumentException("Use only the owned loopback edhr_w3_command_test database");
            registry.add("spring.datasource.url", () -> url);
            registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
            registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        }
        registry.add("spring.datasource.username", () -> url == null ? "sa" : "edhr");
        registry.add("spring.datasource.password", () -> "");
    }

    @BeforeEach
    void seed() {
        for (String table : List.of("workflow_action_log", "workflow_task", "workflow_instance", "workflow_edge",
                "workflow_node", "workflow_definition_version", "workflow_definition", "audit_event", "user_account"))
            jdbc.update("DELETE FROM " + table);
        jdbc.update("INSERT INTO workflow_definition(id,type,name,code,status) VALUES(50,'TRANSACTION','合成流程','AUTH-ONLY','ACTIVE')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES(51,50,1,'PUBLISHED',true,'[]','[]')");
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(101,51,'APPROVAL','审批','{}'),(102,51,'END','结束','{}')");
        jdbc.update("INSERT INTO workflow_edge(id,version_id,source_node_id,target_node_id) VALUES(111,51,101,102)");
        for (long id : List.of(10L, 20L)) {
            instances.save(WorkflowInstance.builder().id(id).definitionId(50L).versionId(51L)
                    .businessType(id == 20 ? "DHR_SUMMARY" : "SYNTHETIC_CASE").businessId("fixture-" + id)
                    .status("RUNNING").currentNodeIds("101").contextSnapshot("{\"frozen\":true}")
                    .workflowSnapshotHash("fixture-stored-hash").initiatorId("1").startedAt(LocalDateTime.of(2026, 1, 1, 0, 0)).build());
            tasks.save(WorkflowTask.builder().id(id).instanceId(id).nodeId(101L).taskType("APPROVAL")
                    .status("PENDING").assigneeId("1")
                    .candidateSnapshot("{\"userIds\":[\"1\",\"2\"],\"sources\":{},\"unresolvedSubjects\":[]}").build());
            jdbc.update("INSERT INTO workflow_action_log(id,instance_id,action,operator_id,comment) VALUES(?,?,'INSTANCE_START','1','original fixture log')", id, id);
        }
    }

    static Stream<Arguments> ordinaryWrites() {
        return Stream.of("CREATE", "UPDATE", "DELETE").flatMap(command ->
                Stream.of(List.<String>of(), List.of("workflow.instances"), List.of("workflow.task.approve"))
                        .map(authorities -> Arguments.of(command, authorities)));
    }

    @ParameterizedTest @MethodSource("ordinaryWrites")
    void ordinarySignedAccountsCannotReplaceControlledCommands(String command, List<String> authorities) throws Exception {
        JsonNode before = rows();
        mvc.perform(write(command, 10).header("Authorization", bearer("33", authorities)))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value(403));
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @ValueSource(strings = {"CREATE", "UPDATE", "DELETE"})
    void anonymousAdministrativeWritesRemainUnauthorized(String command) throws Exception {
        JsonNode before = rows();
        mvc.perform(write(command, 10)).andExpect(status().isUnauthorized());
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @ValueSource(strings = {"CREATE", "UPDATE", "DELETE"})
    void existingAuthorizedAdministrativeWritesRemainAvailable(String command) throws Exception {
        if ("DELETE".equals(command)) instances.save(WorkflowInstance.builder().id(30L).businessType("SYNTHETIC_CASE").status("RUNNING").build());
        mvc.perform(write(command, "DELETE".equals(command) ? 30 : 10)
                        .header("Authorization", bearer("9", List.of("workflow.intervene"))))
                .andExpect(status().isOk());
        if ("DELETE".equals(command)) assertThat(instances.findById(30L)).isEmpty();
        else {
            WorkflowInstance saved = instances.findById("CREATE".equals(command) ? 30L : 10L).orElseThrow();
            assertThat(saved.getStatus()).isEqualTo("TERMINATED");
            assertThat(saved.getCurrentNodeIds()).isEqualTo("999");
        }
        assertThat(instances.findById(20L).orElseThrow().getStatus()).isEqualTo("RUNNING");
    }

    @ParameterizedTest @ValueSource(strings = {"CREATE", "UPDATE", "DELETE"})
    void interventionAuthorityDoesNotBypassExistingDhrProtection(String command) throws Exception {
        JsonNode before = rows();
        MockHttpServletRequestBuilder request = write(command, 20);
        if ("CREATE".equals(command)) request = post("/api/v1/workflow/instances").contentType("application/json")
                .content("{\"id\":30,\"businessType\":\"DHR_SUMMARY\",\"status\":\"RUNNING\"}");
        mvc.perform(request.header("Authorization", bearer("9", List.of("workflow.intervene"))))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("DHR")));
        assertThat(rows()).isEqualTo(before);
    }

    @Test
    void ordinaryReaderKeepsExistingReadEndpoints() throws Exception {
        String token = bearer("33", List.of("workflow.instances"));
        JsonNode before = rows();
        for (String path : List.of("", "/10", "/10/graph", "/10/logs"))
            mvc.perform(get("/api/v1/workflow/instances" + path).header("Authorization", token)).andExpect(status().isOk());
        assertThat(rows()).isEqualTo(before);
    }

    @Test
    void candidateCanCompleteThroughEngineWithoutAdministrativeWritePermission() throws Exception {
        mvc.perform(post("/api/v1/workflow/tasks/10/approve").header("Authorization", bearer("1", List.of()))
                        .contentType("application/json").content("{\"opinion\":\"fixture approval\",\"operatorId\":\"9\"}"))
                .andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT status FROM workflow_task WHERE id=10", String.class)).isEqualTo("COMPLETED");
        assertThat(instances.findById(10L).orElseThrow().getStatus()).isEqualTo("COMPLETED");
        assertThat(jdbc.queryForObject("SELECT operator_id FROM workflow_action_log WHERE action='TASK_COMPLETE'", String.class)).isEqualTo("1");
    }

    @Test
    void taskAdministrativeWritesAndTerminationAlreadyRequireInterventionAuthority() throws Exception {
        JsonNode before = rows();
        String token = bearer("33", List.of("workflow.instances"));
        for (MockHttpServletRequestBuilder request : List.of(post("/api/v1/workflow/tasks").contentType("application/json").content("{\"id\":30,\"instanceId\":10}"),
                put("/api/v1/workflow/tasks/10").contentType("application/json").content("{\"instanceId\":10,\"status\":\"COMPLETED\"}"),
                delete("/api/v1/workflow/tasks/10"), post("/api/v1/workflow/instances/10/terminate").contentType("application/json").content("{\"reason\":\"fixture\"}")))
            mvc.perform(request.header("Authorization", token)).andExpect(status().isForbidden());
        assertThat(rows()).isEqualTo(before);
    }

    @Test
    void authorizedDedicatedTerminationKeepsTaskAndLogChangesTogether() throws Exception {
        mvc.perform(post("/api/v1/workflow/instances/10/terminate").header("Authorization", bearer("9", List.of("workflow.intervene")))
                        .contentType("application/json").content("{\"reason\":\"controlled fixture stop\",\"operatorId\":\"33\"}"))
                .andExpect(status().isOk());
        assertThat(instances.findById(10L).orElseThrow().getStatus()).isEqualTo("TERMINATED");
        assertThat(jdbc.queryForObject("SELECT status FROM workflow_task WHERE id=10", String.class)).isEqualTo("TERMINATED");
        assertThat(jdbc.queryForObject("SELECT operator_id FROM workflow_action_log WHERE action='INTERVENE'", String.class)).isEqualTo("9");
    }

    private MockHttpServletRequestBuilder write(String command, long id) {
        if ("DELETE".equals(command)) return delete("/api/v1/workflow/instances/" + id);
        return ("CREATE".equals(command) ? post("/api/v1/workflow/instances") : put("/api/v1/workflow/instances/" + id))
                .contentType("application/json").content("{\"id\":" + ("CREATE".equals(command) ? 30 : id)
                        + ",\"definitionId\":50,\"versionId\":51,\"businessType\":\"SYNTHETIC_CASE\",\"businessId\":\"fixture\","
                        + "\"status\":\"TERMINATED\",\"currentNodeIds\":\"999\",\"contextSnapshot\":\"{}\",\"initiatorId\":\"9\"}");
    }

    private String bearer(String user, List<String> permissions) {
        return "Bearer " + tokens.generateToken(user, "fixture-" + user, "Synthetic user", 5, permissions);
    }

    private JsonNode rows() {
        Map<String, Object> state = new LinkedHashMap<>();
        for (String table : List.of("workflow_instance", "workflow_task", "workflow_action_log", "audit_event"))
            state.put(table, jdbc.queryForList("SELECT * FROM " + table + " ORDER BY id"));
        return mapper.valueToTree(state);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @EnableJpaRepositories(basePackageClasses = {WorkflowInstanceRepository.class, UserAccountRepository.class, AuditEventRepository.class},
            includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                    WorkflowDefinitionRepository.class, WorkflowDefinitionVersionRepository.class, WorkflowBindingRuleRepository.class,
                    WorkflowInstanceRepository.class, WorkflowTaskRepository.class, WorkflowActionLogRepository.class,
                    WorkflowNodeRepository.class, WorkflowEdgeRepository.class, UserAccountRepository.class, AuditEventRepository.class}))
    @Import({SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class,
            WorkflowInstanceController.class, WorkflowTaskController.class, WorkflowEngine.class})
    static class Config {
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("synthetic-workflow-command-authorization-fixture-only-long-secret", 300_000L); }
        @Bean EntityManager em(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes types() { return PersistenceManagedTypes.of(WorkflowDefinition.class.getName(), WorkflowDefinitionVersion.class.getName(), WorkflowBindingRule.class.getName(), WorkflowInstance.class.getName(), WorkflowTask.class.getName(), WorkflowActionLog.class.getName(), WorkflowNode.class.getName(), WorkflowEdge.class.getName(), UserAccount.class.getName(), AuditEvent.class.getName()); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(2); }
        @Bean StateMachineService states() { return mock(StateMachineService.class); }
        @Bean SubjectResolver subjects() { return mock(SubjectResolver.class); }
    }
}
