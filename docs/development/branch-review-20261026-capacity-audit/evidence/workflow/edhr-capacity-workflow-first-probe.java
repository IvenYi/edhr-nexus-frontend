package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.workflow.entity.WorkflowTask;
import jakarta.persistence.EntityManagerFactory;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Observation only: unchanged product, actual JWT/filter/controller/native PG, no live database. */
@EnabledIfEnvironmentVariable(named="W3_COMMAND_DATABASE_URL", matches="jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_command_test")
@SpringBootTest(classes=WorkflowQueueCapacityObservationTest.Config.class, properties={
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.generate_statistics=true", "spring.jpa.open-in-view=false"})
@AutoConfigureMockMvc
@DirtiesContext(classMode=DirtiesContext.ClassMode.AFTER_CLASS)
class WorkflowQueueCapacityObservationTest {
    private static final List<String> SQL = new CopyOnWriteArrayList<>();
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider tokens;
    @Autowired ObjectMapper mapper;
    @Autowired EntityManagerFactory factory;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        WorkflowInstanceAuthorizationIntegrationTest.database(registry);
    }

    @Configuration(proxyBeanMethods=false)
    @Import(WorkflowInstanceAuthorizationIntegrationTest.Config.class)
    static class Config {
        @Bean HibernatePropertiesCustomizer inspectCapacitySql() {
            return properties -> properties.put("hibernate.session_factory.statement_inspector",
                    (StatementInspector) sql -> { SQL.add(sql); return sql; });
        }
    }

    @ParameterizedTest
    @CsvSource({"todo,100", "todo,1000", "todo,10000", "done,100", "done,1000", "done,10000"})
    void smallHttpPageStillMaterializesAllMatchingTaskEntities(String queue, int count) throws Exception {
        seed(queue, count);
        Map<String, String> before = fingerprints();
        SessionFactory sessions = factory.unwrap(SessionFactory.class);
        sessions.getCache().evictAllRegions();
        Statistics stats = sessions.getStatistics();
        stats.clear(); SQL.clear();
        long started = System.nanoTime();
        var response = mvc.perform(get("/api/v1/workflow/tasks/" + queue)
                .header("Authorization", bearer()).param("page", "1").param("size", "5")
                .param("assigneeId", "2"))
                .andExpect(status().isOk()).andReturn().getResponse();
        long elapsed = System.nanoTime() - started;
        JsonNode data = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data");
        List<Long> actual = new ArrayList<>(); data.forEach(row -> actual.add(row.path("id").asLong()));
        List<Long> expected = List.of(1000L+count, 999L+count, 998L+count, 997L+count, 996L+count);
        long loaded = stats.getEntityStatistics(WorkflowTask.class.getName()).getLoadCount();
        long statements = stats.getPrepareStatementCount();
        long queries = stats.getQueryExecutionCount();
        List<String> observedSql = List.copyOf(SQL);
        assertThat(data.isArray()).isTrue();
        assertThat(actual).containsExactlyElementsOf(expected);
        assertThat(loaded).isEqualTo(count);
        assertThat(statements).isEqualTo(1);
        assertThat(queries).isEqualTo(1);
        assertThat(observedSql).hasSize(1);
        assertThat(observedSql.getFirst().toLowerCase()).doesNotContain(" limit ", " offset ", " fetch first ");
        assertThat(fingerprints()).isEqualTo(before);
        Map<String,Object> observation = new LinkedHashMap<>();
        observation.put("case", "small-page-full-materialization"); observation.put("queue",queue);
        observation.put("matchingRows", count); observation.put("page",1); observation.put("size",5);
        observation.put("returnedRows",data.size()); observation.put("returnedIds",actual);
        observation.put("loadedWorkflowTaskEntities",loaded); observation.put("preparedStatements",statements);
        observation.put("executedOrmQueries",queries); observation.put("collectionFetches",stats.getCollectionFetchCount());
        observation.put("capturedSql",observedSql); observation.put("fingerprintsBefore",before);
        observation.put("databaseRowsUnchanged",true); observation.put("spoofedAssigneeIgnored",true);
        observation.put("dhrAndForeignHigherRankRowsExcluded",true);
        observation.put("observedNanosDiagnosticOnly",elapsed);
        observation.put("qualification","One native query, not N+1; full N entity materialization despite returning5. No OOM/SLA/p95 or production-capacity claim.");
        record(observation);
    }

    @ParameterizedTest @ValueSource(strings={"todo","done"})
    void authenticationAndInvalidPageGuardsIssueNoTaskSelectAndDoNotWrite(String queue) throws Exception {
        seed(queue,100); Map<String,String> before=fingerprints();
        Statistics stats=factory.unwrap(SessionFactory.class).getStatistics(); stats.clear(); SQL.clear();
        mvc.perform(get("/api/v1/workflow/tasks/"+queue).param("page","1").param("size","5"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/workflow/tasks/"+queue).header("Authorization",bearer()).param("page","0").param("size","5"))
                .andExpect(status().isBadRequest());
        assertThat(stats.getEntityStatistics(WorkflowTask.class.getName()).getLoadCount()).isZero();
        assertThat(stats.getPrepareStatementCount()).isZero(); assertThat(SQL).isEmpty();
        assertThat(fingerprints()).isEqualTo(before);
        record(Map.of("case","auth-and-invalid-page-controls","queue",queue,"anonymousStatus",401,
                "nonpositivePageStatus",400,"loadedWorkflowTaskEntities",0,"preparedStatements",0,"databaseRowsUnchanged",true));
    }

    private void seed(String queue,int count) {
        for(String table:List.of("workflow_action_log","workflow_task","workflow_instance","workflow_edge",
                "workflow_node","workflow_definition_version","workflow_definition","audit_event","user_account"))
            jdbc.update("DELETE FROM "+table);
        jdbc.update("INSERT INTO workflow_instance(id,business_type,status) VALUES(10,'SYNTHETIC_CAPACITY','RUNNING'),(20,'DHR_SUMMARY','RUNNING')");
        String status="todo".equals(queue)?"PENDING":"COMPLETED";
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,task_type,status,assignee_id,candidate_snapshot,created_at,completed_at) "
                +"SELECT 1000+i,10,101,'APPROVAL',?,'1','{}'::jsonb,TIMESTAMP '2026-01-01 00:00:00'+i*INTERVAL '1 second',"
                +"TIMESTAMP '2026-01-01 00:00:00'+i*INTERVAL '1 second' FROM generate_series(1,?) i",status,count);
        if("todo".equals(queue)) {
            jdbc.update("UPDATE workflow_task SET assignee_id='2',candidate_snapshot='{\"userIds\":[\"1\"]}'::jsonb WHERE id=1001");
            jdbc.update("UPDATE workflow_task SET assignee_id='2',candidate_snapshot='{\"unrestricted\":true}'::jsonb WHERE id=1002");
        }
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,task_type,status,assignee_id,candidate_snapshot,created_at,completed_at) "
                +"VALUES(900000100,20,101,'APPROVAL',?,'1','{}'::jsonb,TIMESTAMP '2100-01-01',TIMESTAMP '2100-01-01'),"
                +"(900000101,10,101,'APPROVAL',?,'2','{\"userIds\":[\"2\"]}'::jsonb,TIMESTAMP '2100-01-01',TIMESTAMP '2100-01-01')",status,status);
    }

    private String bearer() { return "Bearer "+tokens.generateToken("1","synthetic-capacity","合成容量用户",5,List.of()); }

    private Map<String,String> fingerprints() {
        Map<String,String> result=new LinkedHashMap<>();
        for(String table:List.of("workflow_task","workflow_instance","workflow_action_log","audit_event"))
            result.put(table,jdbc.queryForObject("SELECT md5(coalesce(string_agg(row_to_json(t)::text,'|' ORDER BY id),'')) FROM "+table+" t",String.class));
        return result;
    }

    private void record(Map<String,Object> observation) throws Exception {
        Path path=Path.of(System.getProperty("capacity.observation.out","/tmp/edhr-capacity-workflow-observations.jsonl"));
        Files.writeString(path,mapper.writeValueAsString(observation)+"\n",StandardCharsets.UTF_8,StandardOpenOption.CREATE,StandardOpenOption.APPEND);
    }
}
