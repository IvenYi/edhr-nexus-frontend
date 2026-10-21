package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Native PG and actual JWT/filter/controller reads; no password login or browser/backend E2E claim. */
@EnabledIfEnvironmentVariable(named = "W3_COMMAND_DATABASE_URL", matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_command_test")
@SpringBootTest(classes = WorkflowReadBoundaryPostgresTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class WorkflowReadBoundaryPostgresTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider tokens;
    @Autowired ObjectMapper mapper;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        WorkflowInstanceAuthorizationIntegrationTest.database(registry);
    }

    @BeforeEach
    void seed() {
        for (String table : List.of("workflow_action_log", "workflow_task", "workflow_instance", "workflow_edge",
                "workflow_node", "workflow_definition_version", "workflow_definition", "audit_event", "user_account"))
            jdbc.update("DELETE FROM " + table);
        jdbc.update("INSERT INTO workflow_definition(id,type,name,code,status) VALUES(50,'TRANSACTION','合成读取流程','READ-ONLY','ACTIVE')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES(51,50,1,'PUBLISHED',false,'[]','[]'),(52,50,2,'PUBLISHED',true,'[]','[]')");
        for (long id : List.of(1L, 10L, 101L, 1101L, 2L, 22L))
            jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(?,51,'APPROVAL',?,'{}')", id, "历史节点" + id);
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(999,52,'APPROVAL','新版本节点','{}')");
        jdbc.update("INSERT INTO workflow_edge(id,version_id,source_node_id,target_node_id) VALUES(5001,51,10,101),(5002,51,101,22)");
        jdbc.update("INSERT INTO workflow_instance(id,definition_id,version_id,business_type,business_id,status,current_node_ids,context_snapshot) VALUES(10,50,51,'SYNTHETIC_CASE','fixture-10','RUNNING','101','{}'),(20,50,51,'DHR_SUMMARY','fixture-20','RUNNING','101','{}'),(30,50,51,'SYNTHETIC_OTHER','fixture-30','RUNNING','22','{}')");
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot) VALUES(10,10,101,'PENDING','1','{\"userIds\":[\"1\"]}'),(20,20,101,'PENDING','1','{\"userIds\":[\"1\"]}'),(30,30,22,'PENDING','2','{\"userIds\":[\"2\"]}')");
        jdbc.update("INSERT INTO workflow_action_log(id,instance_id,task_id,node_id,action,operator_id,operator_name,comment,created_at) VALUES(100,10,10,'101','INSTANCE_START','1','合成人员','合成开始',TIMESTAMP '2026-01-01 00:00:00'),(101,10,10,'101','TASK_COMPLETE','1','合成人员','合成处理',TIMESTAMP '2026-01-01 00:01:00'),(200,20,20,'101','INSTANCE_START','1','合成人员','DHR合成记录',TIMESTAMP '2026-01-01 00:00:00'),(300,30,30,'22','INSTANCE_START','2','其他人员','其他实例记录',TIMESTAMP '2026-01-01 00:00:00')");
    }

    static Stream<Arguments> activeNodes() {
        return Stream.of(Arguments.of("101", List.of(101L)), Arguments.of("1101", List.of(1101L)),
                Arguments.of("101,22", List.of(101L, 22L)), Arguments.of("1101,22", List.of(1101L, 22L)),
                Arguments.of("22", List.of(22L)), Arguments.of("10", List.of(10L)),
                Arguments.of("1", List.of(1L)), Arguments.of(null, List.of()), Arguments.of("", List.of()),
                Arguments.of("   ", List.of()), Arguments.of(" 101, 22 ", List.of(101L, 22L)), Arguments.of("999", List.of()));
    }

    @ParameterizedTest @MethodSource("activeNodes")
    void graphMarksOnlyWholeCurrentIdsInTheInstanceVersion(String active, List<Long> expected) throws Exception {
        jdbc.update("UPDATE workflow_instance SET current_node_ids=? WHERE id=10", active);
        JsonNode before = rows();
        JsonNode data = read("/instances/10/graph");
        assertThat(data.path("versionNumber").asInt()).isEqualTo(1);
        assertThat(data.path("instanceStatus").asText()).isEqualTo("RUNNING");
        assertThat(ids(data.path("nodes"))).containsExactlyInAnyOrder(1L, 10L, 101L, 1101L, 2L, 22L);
        List<Long> highlighted = new ArrayList<>();
        for (JsonNode node : data.path("nodes")) {
            assertThat(node.has("current")).isTrue();
            if (node.path("current").asBoolean()) highlighted.add(node.path("id").asLong());
        }
        assertThat(highlighted).containsExactlyInAnyOrderElementsOf(expected);
        assertThat(data.path("edges")).hasSize(2);
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @ValueSource(strings = {"/instances/20", "/instances/20/graph", "/instances/20/logs", "/tasks/20", "/logs/200"})
    void dhrEvidenceCannotBeReadThroughGenericObjectEndpoints(String path) throws Exception {
        JsonNode before = rows();
        mvc.perform(get("/api/v1/workflow" + path).header("Authorization", bearer()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("DHR")));
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @CsvSource(value = {"instances|10;30", "tasks|10;30", "logs|100;101;300"}, delimiter = '|')
    void genericListCountsAndContentExcludeDhrBeforePagination(String resource, String expectedIds) throws Exception {
        JsonNode before = rows();
        JsonNode data = read("/" + resource);
        List<Long> expected = Stream.of(expectedIds.split(";")).map(Long::valueOf).toList();
        assertThat(ids(data.path("content"))).containsExactlyInAnyOrderElementsOf(expected);
        assertThat(data.path("totalElements").asLong()).isEqualTo(expected.size());
        assertThat(rows()).isEqualTo(before);
    }

    @Test
    void instanceLogsUseAnArrayAndOnlyTheRequestedInstanceInChronologicalOrder() throws Exception {
        JsonNode before = rows();
        JsonNode data = read("/instances/10/logs");
        assertThat(data.isArray()).isTrue();
        assertThat(ids(data)).containsExactly(100L, 101L);
        assertThat(data.get(0).path("comment").asText()).isEqualTo("合成开始");
        assertThat(data.get(1).path("comment").asText()).isEqualTo("合成处理");
        assertThat(rows()).isEqualTo(before);
    }

    @Test
    void everyReadStillRequiresAuthentication() throws Exception {
        JsonNode before = rows();
        for (String path : List.of("/instances", "/instances/10", "/instances/10/graph", "/instances/10/logs",
                "/tasks", "/tasks/10", "/logs", "/logs/100"))
            mvc.perform(get("/api/v1/workflow" + path)).andExpect(status().isUnauthorized());
        assertThat(rows()).isEqualTo(before);
    }

    @Test
    void longInstanceIdsRemainDistinctAcrossReadEndpoints() throws Exception {
        for (String id : List.of("700000000000000001", "700000000000000002")) {
            jdbc.update("INSERT INTO workflow_instance(id,definition_id,version_id,business_type,status) VALUES(?,50,51,'SYNTHETIC_CASE','RUNNING')", Long.valueOf(id));
            jdbc.update("INSERT INTO workflow_action_log(id,instance_id,action,comment) VALUES(?,?,'INSTANCE_START',?)", Long.valueOf(id), Long.valueOf(id), "长编号记录" + id);
        }
        JsonNode before = rows();
        for (String id : List.of("700000000000000001", "700000000000000002")) {
            assertThat(read("/instances/" + id).path("id").asText()).isEqualTo(id);
            JsonNode logs = read("/instances/" + id + "/logs");
            assertThat(logs).hasSize(1);
            assertThat(logs.get(0).path("comment").asText()).isEqualTo("长编号记录" + id);
        }
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @CsvSource(value = {"/instances/404|404", "/instances/404/graph|404", "/instances/404/logs|404", "/tasks/404|404", "/logs/404|400"}, delimiter = '|')
    void missingObjectsKeepExistingErrorContracts(String path, int expectedStatus) throws Exception {
        JsonNode before = rows();
        mvc.perform(get("/api/v1/workflow" + path).header("Authorization", bearer()))
                .andExpect(status().is(expectedStatus));
        assertThat(rows()).isEqualTo(before);
    }

    private JsonNode read(String path) throws Exception {
        var result = mvc.perform(get("/api/v1/workflow" + path).header("Authorization", bearer()))
                .andExpect(status().isOk()).andReturn();
        return mapper.readTree(result.getResponse().getContentAsString(StandardCharsets.UTF_8)).path("data");
    }
    private String bearer() { return "Bearer " + tokens.generateToken("33", "fixture-reader", "合成读取人", 5, List.of()); }
    private List<Long> ids(JsonNode array) { List<Long> result = new ArrayList<>(); array.forEach(row -> result.add(row.path("id").asLong())); return result; }
    private JsonNode rows() {
        Map<String, Object> result = new LinkedHashMap<>();
        for (String table : List.of("workflow_instance", "workflow_task", "workflow_action_log", "workflow_definition_version", "workflow_node", "workflow_edge", "audit_event"))
            result.put(table, jdbc.queryForList("SELECT * FROM " + table + " ORDER BY id"));
        return mapper.valueToTree(result);
    }
    @Configuration(proxyBeanMethods = false)
    @Import({WorkflowInstanceAuthorizationIntegrationTest.Config.class, WorkflowLogController.class})
    static class Config { }
}
