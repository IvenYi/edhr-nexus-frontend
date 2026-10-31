package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.sql.Connection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;

/** Isolated native PostgreSQL schema; no application or historical database. */
@EnabledIfEnvironmentVariable(named="W3_COMMAND_DATABASE_URL", matches="jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_w3_command_test(?:_[a-z0-9_]+)?")
class DhrEvidenceBatchPostgresTest {
    DriverManagerDataSource source;
    CountingJdbc jdbc;
    DhrEvidenceImpactService service;
    static class CountingJdbc extends JdbcTemplate {
        int reads;
        CountingJdbc(DriverManagerDataSource source) { super(source); }
        @Override public List<Map<String,Object>> queryForList(String sql, Object... args) {
            reads++; return super.queryForList(sql,args);
        }
        @Override public <T> List<T> queryForList(String sql, Class<T> type, Object... args) {
            reads++; return super.queryForList(sql,type,args);
        }
    }
    @BeforeEach void setup() {
        String url=System.getenv("W3_COMMAND_DATABASE_URL");
        String user=System.getenv().getOrDefault("W3_COMMAND_DATABASE_USER","edhr");
        var admin=new JdbcTemplate(new DriverManagerDataSource(url,user,""));
        admin.execute("DROP SCHEMA IF EXISTS capacity_dhr_test CASCADE");
        admin.execute("CREATE SCHEMA capacity_dhr_test");
        source=new DriverManagerDataSource(url+"?currentSchema=capacity_dhr_test",user,"");
        jdbc=new CountingJdbc(source); service=new DhrEvidenceImpactService(jdbc,new ObjectMapper());
        jdbc.execute("CREATE TABLE dhr_summary_evidence(tenant_id text,summary_version_id bigint,source_record_id bigint,source_snapshot jsonb)");
        jdbc.execute("CREATE TABLE form_instance_record(id bigint primary key,tenant_id text,snapshot_json jsonb,values_json jsonb,status text,version_id bigint,source_type text,object_id bigint,instance_no text)");
        jdbc.execute("CREATE TABLE dhr_summary_version(id bigint,tenant_id text,dhr_instance_id bigint,attachment_snapshot jsonb)");
        jdbc.execute("CREATE TABLE dhr_instance(id bigint,tenant_id text,production_object_id bigint)");
        jdbc.execute("CREATE TABLE dhr_attachment(id bigint,tenant_id text,dhr_instance_id bigint,active boolean,sha256 text,verification_status text,stored_path text)");
        jdbc.execute("ALTER TABLE form_instance_record ADD COLUMN current_revision_id bigint");
        jdbc.execute("CREATE TABLE dhr_evidence_impact(tenant_id text,summary_version_id bigint,record_id bigint)");
        jdbc.update("INSERT INTO dhr_instance VALUES(1,'default',100)");
        jdbc.update("INSERT INTO dhr_summary_version VALUES(2,'default',1,'[]')");
    }
    @AfterEach void cleanup() { jdbc.execute("DROP SCHEMA capacity_dhr_test CASCADE"); }
    void seed(int count) {
        jdbc.update("INSERT INTO form_instance_record SELECT n,'default','{}'::jsonb,'{\"x\":1}'::jsonb,'COMPLETED',10,'PRODUCTION_EXECUTION',100,'FR-'||n,NULL FROM generate_series(1,?) n",count);
        jdbc.update("INSERT INTO dhr_summary_evidence SELECT 'default',2,id,jsonb_build_object('snapshot',snapshot_json,'fieldValues',values_json,'status',status,'templateVersionId',version_id::text,'instanceNo',instance_no) FROM form_instance_record");
    }
    @ParameterizedTest @ValueSource(ints={1,100,1000,10000})
    void comparisonQueryCountIsConstantForGrowingEvidence(int count) {
        seed(count);
        for(boolean lock:new boolean[]{false,true}) {
            jdbc.reads=0;
            assertThat(service.changes(2L,lock)).isEmpty();
            assertThat(jdbc.reads).isEqualTo(6);
        }
    }
    @Test void missingForeignChangedAndNewMembersRemainVisibleInOriginalOrder() {
        seed(8);
        jdbc.update("DELETE FROM form_instance_record WHERE id=1");
        jdbc.update("UPDATE form_instance_record SET tenant_id='other' WHERE id=2");
        jdbc.update("UPDATE form_instance_record SET snapshot_json='{\"changed\":true}' WHERE id=3");
        jdbc.update("UPDATE form_instance_record SET values_json='{\"x\":2}' WHERE id=4");
        jdbc.update("UPDATE form_instance_record SET status='VOIDED' WHERE id=5");
        jdbc.update("UPDATE form_instance_record SET version_id=11 WHERE id=6");
        jdbc.update("UPDATE form_instance_record SET values_json=NULL WHERE id=7");
        jdbc.update("INSERT INTO form_instance_record VALUES(9,'default','{}','{}','COMPLETED',10,'PRODUCTION_EXECUTION',100,'FR-9',NULL)");
        var unlocked=service.changes(2L,false);
        assertThat(unlocked).hasSize(8);
        for(int i=0;i<7;i++) assertThat(unlocked.get(i).path("recordId").asText()).isEqualTo(String.valueOf(i+1));
        assertThat(unlocked.get(7).path("recordId").asText()).isEqualTo("9");
        assertThat(service.changes(2L,true)).isEqualTo(unlocked);
    }
    @Test void emptyFrozenSetStillReportsNewMembersAndInvalidVersionKeepsExistingBehavior() {
        assertThat(service.changes(2L,false)).isEmpty();
        seed(1); jdbc.update("DELETE FROM dhr_summary_evidence");
        assertThat(service.changes(2L,false).get(0).path("recordId").asText()).isEqualTo("1");
        assertThat(service.changes(999L,false)).isEmpty();
    }
    @Test void lockedComparisonWaitsForWriterAndUsesCommittedValues() throws Exception {
        seed(2);
        ExecutorService executor=Executors.newSingleThreadExecutor();
        try(Connection writer=source.getConnection()) {
            writer.setAutoCommit(false);
            writer.createStatement().executeUpdate("UPDATE form_instance_record SET values_json='{\"x\":2}' WHERE id=1");
            Future<com.fasterxml.jackson.databind.node.ArrayNode> read=executor.submit(()->service.changes(2L,true));
            // Observe a real database lock wait before committing the concurrent writer.
            long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(10);
            boolean waiting=false;
            while(System.nanoTime()<deadline) {
                waiting=Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'SELECT id,snapshot_json%')",Boolean.class));
                if(waiting) break;
                Thread.sleep(20);
            }
            assertThat(waiting).isTrue();
            writer.commit();
            var result=read.get(10,TimeUnit.SECONDS);
            assertThat(result).hasSize(1);
            assertThat(result.get(0).path("recordId").asText()).isEqualTo("1");
        } finally { executor.shutdownNow(); }
    }
}
