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

/** Pagination regression:, actual JWT/filter/controller/native PG, no live database. */
@EnabledIfEnvironmentVariable(named="W3_COMMAND_DATABASE_URL", matches="jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_command_test")
@SpringBootTest(classes=WorkflowQueuePaginationPostgresTest.Config.class, properties={
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.generate_statistics=true", "spring.jpa.open-in-view=false"})
@AutoConfigureMockMvc
@DirtiesContext(classMode=DirtiesContext.ClassMode.AFTER_CLASS)
class WorkflowQueuePaginationPostgresTest {
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
    void smallHttpPageOnlyMaterializesRequestedTaskEntities(String queue, int count) throws Exception {
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
        assertThat(loaded).isEqualTo(5);
        assertThat(statements).isEqualTo(1);
        assertThat(queries).isEqualTo(1);
        assertThat(observedSql).hasSize(1);
        assertThat(observedSql.getFirst().toLowerCase()).contains(" limit ", " offset ");
        assertThat(fingerprints()).isEqualTo(before);
        Map<String,Object> observation = new LinkedHashMap<>();
        observation.put("case", "small-page-bounded-materialization"); observation.put("queue",queue);
        observation.put("matchingRows", count); observation.put("page",1); observation.put("size",5);
        observation.put("returnedRows",data.size()); observation.put("returnedIds",actual);
        observation.put("loadedWorkflowTaskEntities",loaded); observation.put("preparedStatements",statements);
        observation.put("executedOrmQueries",queries); observation.put("collectionFetches",stats.getCollectionFetchCount());
        observation.put("capturedSql",observedSql); observation.put("fingerprintsBefore",before);
        observation.put("databaseRowsUnchanged",true); observation.put("spoofedAssigneeIgnored",true);
        observation.put("dhrAndForeignHigherRankRowsExcluded",true);
        observation.put("distinctInstancePerMainTask",true);
        observation.put("duplicateActiveInstanceNodeKeys",0);
        observation.put("missingWorkflowReferences",0);
        observation.put("targetPartialUniqueIndexInstalled",true);
        observation.put("observedNanosDiagnosticOnly",elapsed);
        observation.put("qualification","One native query and five loaded entities for size5. No OOM/SLA/p95 or production-capacity claim.");
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

    @ParameterizedTest @ValueSource(strings={"todo","done"})
    void subsequentFinalEmptyAndLargeOffsetPagesStayBounded(String queue) throws Exception {
        seed(queue, 103);
        for (int page : new int[]{2, 21, 22, Integer.MAX_VALUE}) {
            Statistics stats=factory.unwrap(SessionFactory.class).getStatistics(); stats.clear(); SQL.clear();
            var response=mvc.perform(get("/api/v1/workflow/tasks/"+queue).header("Authorization",bearer())
                    .param("page",String.valueOf(page)).param("size","5"))
                    .andExpect(status().isOk()).andReturn().getResponse();
            JsonNode data=mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data");
            List<Long> ids=new ArrayList<>(); data.forEach(row->ids.add(row.path("id").asLong()));
            List<Long> expected=page==2?List.of(1098L,1097L,1096L,1095L,1094L)
                    :page==21?List.of(1003L,1002L,1001L):List.of();
            assertThat(ids).containsExactlyElementsOf(expected);
            assertThat(stats.getEntityStatistics(WorkflowTask.class.getName()).getLoadCount()).isEqualTo(expected.size());
            assertThat(stats.getPrepareStatementCount()).isEqualTo(1);
        }
    }

    @ParameterizedTest @ValueSource(strings={"todo","done"})
    void equalTimestampsHaveStableDisjointPages(String queue) throws Exception {
        seed(queue, 10);
        jdbc.update("UPDATE workflow_task SET created_at='2026-10-26 00:00:00', completed_at=NULL WHERE id BETWEEN 1001 AND 1010");
        List<Long> all=new ArrayList<>();
        for(int page:new int[]{1,2}) {
            var response=mvc.perform(get("/api/v1/workflow/tasks/"+queue).header("Authorization",bearer())
                    .param("page",String.valueOf(page)).param("size","5"))
                    .andExpect(status().isOk()).andReturn().getResponse();
            mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data")
                    .forEach(row->all.add(row.path("id").asLong()));
        }
        assertThat(all).containsExactly(1010L,1009L,1008L,1007L,1006L,1005L,1004L,1003L,1002L,1001L);
    }

    private void seed(String queue,int count) {
        for(String table:List.of("workflow_action_log","workflow_task","workflow_instance","workflow_edge",
                "workflow_node","workflow_definition_version","workflow_definition","audit_event","user_account"))
            jdbc.update("DELETE FROM "+table);
        jdbc.update("INSERT INTO workflow_definition(id,type,name,code,status,business_type) VALUES(50,'TRANSACTION','合成容量流程','CAPACITY-ONLY','ACTIVE',NULL),(60,'RECORD_CONTROL','合成DHR排除对照','CAPACITY-DHR','ACTIVE','DHR_SUMMARY')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES(51,50,1,'PUBLISHED',true,'[]','[]'),(61,60,1,'PUBLISHED',true,'[]','[]')");
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(101,51,'APPROVAL','合成任务节点','{}'),(201,61,'APPROVAL','合成DHR节点','{}')");
        jdbc.update("INSERT INTO workflow_instance(id,definition_id,version_id,business_type,business_id,status,current_node_ids,context_snapshot) VALUES(10,50,51,'SYNTHETIC_CAPACITY','capacity-10','RUNNING','101','{}'),(20,60,61,'DHR_SUMMARY','capacity-20','RUNNING','201','{}')");
        String status="todo".equals(queue)?"PENDING":"COMPLETED";
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_workflow_task_active_instance_node ON workflow_task(instance_id,node_id) WHERE status IN ('PENDING','PROCESSING')");
        jdbc.update("INSERT INTO workflow_instance(id,definition_id,version_id,business_type,business_id,status,current_node_ids,context_snapshot) SELECT 10000+i,50,51,'SYNTHETIC_CAPACITY','capacity-'||i,'RUNNING','101','{}'::jsonb FROM generate_series(1,?) i",count);
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,task_type,status,assignee_id,candidate_snapshot,created_at,completed_at) "
                +"SELECT 1000+i,10000+i,101,'APPROVAL',?,'1','{}'::jsonb,TIMESTAMP '2026-01-01 00:00:00'+i*INTERVAL '1 second',"
                +"TIMESTAMP '2026-01-01 00:00:00'+i*INTERVAL '1 second' FROM generate_series(1,?) i",status,count);
        if("todo".equals(queue)) {
            jdbc.update("UPDATE workflow_task SET assignee_id='2',candidate_snapshot='{\"userIds\":[\"1\"]}'::jsonb WHERE id=1001");
            jdbc.update("UPDATE workflow_task SET assignee_id='2',candidate_snapshot='{\"unrestricted\":true}'::jsonb WHERE id=1002");
        }
        jdbc.update("INSERT INTO workflow_task(id,instance_id,node_id,task_type,status,assignee_id,candidate_snapshot,created_at,completed_at) "
                +"VALUES(900000100,20,201,'APPROVAL',?,'1','{}'::jsonb,TIMESTAMP '2100-01-01',TIMESTAMP '2100-01-01'),"
                +"(900000101,10,101,'APPROVAL',?,'2','{\"userIds\":[\"2\"]}'::jsonb,TIMESTAMP '2100-01-01',TIMESTAMP '2100-01-01')",status,status);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM (SELECT instance_id,node_id FROM workflow_task WHERE status IN ('PENDING','PROCESSING') GROUP BY instance_id,node_id HAVING count(*)>1) duplicates",Long.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM workflow_task t LEFT JOIN workflow_instance i ON i.id=t.instance_id LEFT JOIN workflow_node n ON n.id=t.node_id LEFT JOIN workflow_definition d ON d.id=i.definition_id LEFT JOIN workflow_definition_version v ON v.id=i.version_id WHERE i.id IS NULL OR n.id IS NULL OR d.id IS NULL OR v.id IS NULL OR v.definition_id<>d.id OR n.version_id<>v.id",Long.class)).isZero();
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
