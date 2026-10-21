package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.workflow.entity.WorkflowInstance;
import com.zencas.edhr.workflow.entity.WorkflowTask;
import com.zencas.edhr.workflow.repository.WorkflowInstanceRepository;
import com.zencas.edhr.workflow.repository.WorkflowTaskRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Real JWT/filter, HTTP controller and native JSONB queue queries; owned synthetic DB only. */
@EnabledIfEnvironmentVariable(named = "W3_COMMAND_DATABASE_URL", matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_command_test")
@SpringBootTest(classes = WorkflowInstanceAuthorizationIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class WorkflowTaskPaginationPostgresTest {
    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired WorkflowInstanceRepository instances;
    @Autowired WorkflowTaskRepository tasks;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        WorkflowInstanceAuthorizationIntegrationTest.database(registry);
    }

    @BeforeEach
    void seed() {
        for (String table : List.of("workflow_action_log", "workflow_task", "workflow_instance", "workflow_edge",
                "workflow_node", "workflow_definition_version", "workflow_definition", "audit_event", "user_account"))
            jdbc.update("DELETE FROM " + table);
        instances.save(WorkflowInstance.builder().id(10L).businessType("SYNTHETIC_CASE").status("RUNNING").build());
        instances.save(WorkflowInstance.builder().id(20L).businessType("DHR_SUMMARY").status("RUNNING").build());
        task(101, 10, "PENDING", "1", "{\"userIds\":[\"1\"]}", 5, null);
        task(102, 10, "PENDING", null, "{\"userIds\":[\"1\"]}", 4, null);
        task(103, 10, "PROCESSING", "1", "{\"userIds\":[\"1\"]}", 3, null);
        task(104, 10, "PENDING", null, "{\"unrestricted\":true}", 2, null);
        task(105, 10, "PENDING", "1", "{\"userIds\":[]}", 1, null);
        task(201, 10, "COMPLETED", "1", "{}", 1, 5);
        task(202, 10, "REJECTED", "1", "{}", 1, 4);
        task(203, 10, "TRANSFERRED", "1", "{}", 1, 3);
        task(204, 10, "COMPLETED", "1", "{}", 1, 2);
        task(205, 10, "COMPLETED", "1", "{}", 1, null);
        task(301, 10, "PENDING", "2", "{\"userIds\":[\"2\"]}", 20, null);
        task(302, 10, "COMPLETED", "2", "{\"userIds\":[\"1\"]}", 20, 20);
        task(303, 10, "TERMINATED", "1", "{}", 20, 20);
        task(304, 20, "PENDING", "1", "{\"userIds\":[\"1\"]}", 20, null);
        task(305, 20, "COMPLETED", "1", "{}", 20, 20);
    }

    static Stream<Arguments> invalidPages() {
        int[][] values = {{0, 2}, {-1, 2}, {Integer.MIN_VALUE, 2}, {1, 0}, {1, -1}, {1, Integer.MIN_VALUE}};
        return Stream.of("todo", "done").flatMap(queue -> Stream.of(values)
                .map(value -> Arguments.of(queue, value[0], value[1])));
    }

    @ParameterizedTest @MethodSource("invalidPages")
    void nonPositivePageOrSizeReturnsBadRequestWithoutChangingRows(String queue, int page, int size) throws Exception {
        JsonNode before = rows();
        mvc.perform(request(queue, page, size)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
        assertThat(rows()).isEqualTo(before);
    }

    static Stream<Arguments> distantPages() {
        int[][] values = {{Integer.MAX_VALUE, 2}, {65537, 65536}, {Integer.MAX_VALUE, Integer.MAX_VALUE},
                {Integer.MAX_VALUE - 1, Integer.MAX_VALUE}, {2, Integer.MAX_VALUE}};
        return Stream.of("todo", "done").flatMap(queue -> Stream.of(values)
                .map(value -> Arguments.of(queue, value[0], value[1])));
    }

    @ParameterizedTest @MethodSource("distantPages")
    void positiveDistantPagesReturnEmptyWithoutOverflowOrWrappingToFirstPage(String queue, int page, int size) throws Exception {
        JsonNode before = rows();
        assertThat(ids(request(queue, page, size))).isEmpty();
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @ValueSource(strings = {"todo", "done"})
    void normalPagesPreserveOrderOperatorScopeDhrExclusionAndArrayContract(String queue) throws Exception {
        JsonNode before = rows();
        long base = "todo".equals(queue) ? 100 : 200;
        assertThat(ids(request(queue, 1, 2))).containsExactly(base + 1, base + 2);
        assertThat(ids(request(queue, 2, 2))).containsExactly(base + 3, base + 4);
        assertThat(ids(request(queue, 3, 2))).containsExactly(base + 5);
        assertThat(ids(request(queue, 4, 2))).isEmpty();
        assertThat(ids(request(queue, 1, Integer.MAX_VALUE))).containsExactly(base + 1, base + 2, base + 3, base + 4, base + 5);
        assertThat(ids(get("/api/v1/workflow/tasks/" + queue).header("Authorization", bearer())
                .param("assigneeId", "2"))).containsExactly(base + 1, base + 2, base + 3, base + 4, base + 5);
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @ValueSource(strings = {"todo", "done"})
    void emptyQueuesKeepValidEmptyResponsesAndStillRejectInvalidPagination(String queue) throws Exception {
        jdbc.update("DELETE FROM workflow_task");
        JsonNode before = rows();
        assertThat(ids(request(queue, 1, 50))).isEmpty();
        assertThat(ids(request(queue, Integer.MAX_VALUE, 2))).isEmpty();
        mvc.perform(request(queue, 0, 2)).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value(400));
        assertThat(rows()).isEqualTo(before);
    }

    @ParameterizedTest @ValueSource(strings = {"todo", "done"})
    void paginationDoesNotBypassAuthentication(String queue) throws Exception {
        JsonNode before = rows();
        for (int page : List.of(1, 0))
            mvc.perform(get("/api/v1/workflow/tasks/" + queue).param("page", String.valueOf(page)))
                    .andExpect(status().isUnauthorized());
        assertThat(rows()).isEqualTo(before);
    }

    private MockHttpServletRequestBuilder request(String queue, int page, int size) {
        return get("/api/v1/workflow/tasks/" + queue).header("Authorization", bearer())
                .param("assigneeId", "2").param("page", String.valueOf(page)).param("size", String.valueOf(size));
    }

    private String bearer() {
        return "Bearer " + tokens.generateToken("1", "pagination-fixture", "合成分页用户", 5, List.of());
    }

    private List<Long> ids(MockHttpServletRequestBuilder request) throws Exception {
        var response = mvc.perform(request).andExpect(status().isOk()).andExpect(jsonPath("$.code").value(200))
                .andReturn().getResponse();
        JsonNode data = mapper.readTree(response.getContentAsString()).path("data");
        assertThat(data.isArray()).isTrue();
        List<Long> ids = new ArrayList<>();
        data.forEach(task -> ids.add(task.path("id").asLong()));
        return ids;
    }

    private void task(long id, long instance, String status, String assignee, String candidates, int created, Integer completed) {
        LocalDateTime time = LocalDateTime.of(2026, 1, 1, 0, 0);
        tasks.save(WorkflowTask.builder().id(id).instanceId(instance).status(status).assigneeId(assignee)
                .candidateSnapshot(candidates).createdAt(time.plusMinutes(created))
                .completedAt(completed == null ? null : time.plusMinutes(completed)).build());
    }

    private JsonNode rows() {
        Map<String, Object> state = new LinkedHashMap<>();
        for (String table : List.of("workflow_task", "workflow_instance", "workflow_action_log", "audit_event"))
            state.put(table, jdbc.queryForList("SELECT * FROM " + table + " ORDER BY id"));
        return mapper.valueToTree(state);
    }
}
