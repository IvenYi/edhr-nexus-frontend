package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.UUID;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;

/** Uses a disposable schema, never existing tables. Run against the isolated projection database only. */
@EnabledIfEnvironmentVariable(named = "PROJECTION_TEST_DATABASE_URL", matches = "jdbc:postgresql://localhost:5432/edhr_form_projection")
class FormProjectionPostgresTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private JdbcTemplate admin, jdbc;
    private TransactionTemplate tx;
    private FormProjectionService projection;
    private String schema;
    @BeforeEach void setup() throws Exception {
        String url = System.getenv("PROJECTION_TEST_DATABASE_URL");
        String user = System.getenv().getOrDefault("PROJECTION_DATABASE_USER", "edhr");
        String password = System.getenv().getOrDefault("PROJECTION_DATABASE_PASSWORD", "edhr_dev_pwd");
        admin = new JdbcTemplate(new DriverManagerDataSource(url, user, password));
        schema = "projection_test_" + UUID.randomUUID().toString().replace("-", "");
        admin.execute("CREATE SCHEMA " + schema);
        var ds = new DriverManagerDataSource(url + "?currentSchema=" + schema, user, password);
        jdbc = new JdbcTemplate(ds); tx = new TransactionTemplate(new DataSourceTransactionManager(ds));
        jdbc.execute("CREATE TABLE form_instance_record(id BIGINT PRIMARY KEY,tenant_id text default 'default',instance_no text,object_id bigint default 1,object_no text default 'B1',operation_id text default 'a',operation_name text default 'A',created_by text,created_at timestamp,updated_by text,updated_at timestamp)");
        jdbc.update("INSERT INTO form_instance_record(id) VALUES(1)");
        try (var connection = ds.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0107-form-projection-runtime.sql"));
        }
        projection = new FormProjectionService(jdbc, mapper);
    }
    @AfterEach void cleanup() { if (schema != null) admin.execute("DROP SCHEMA " + schema + " CASCADE"); }
    private ObjectNode form() throws Exception {
        return (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"lot","type":"text"}],"projection":{"version":"form-projection-v1","bindings":[
            {"id":"trace","enabled":true,"modelId":"formTrace","sources":{"materialLotText":"lot"}}]}}
            """);
    }
    private void enqueue(ObjectNode form) {
        tx.executeWithoutResult(status -> projection.completed(1, "default", form, mapper.createObjectNode().put("lot", "L1"), mapper.createObjectNode(), "a"));
    }
    private long batchId() { return jdbc.queryForObject("SELECT id FROM form_projection_batch", Long.class); }

    @Test void completionAndOutboxRollbackTogetherOnFailure() throws Exception {
        var form = form();
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> {
            projection.completed(1, "default", form, mapper.createObjectNode().put("lot", "L1"), mapper.createObjectNode(), "a");
            throw new IllegalStateException("simulated source transaction rollback");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();
    }
    @Test void repeatedCompletionAndConcurrentConsumersPublishOneSet() throws Exception {
        enqueue(form()); enqueue(form());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isEqualTo(1);
        long id = batchId();
        try (var pool = Executors.newFixedThreadPool(2)) {
            var start = new CountDownLatch(1);
            Callable<Void> process = () -> { start.await(); tx.executeWithoutResult(status -> projection.process(id)); return null; };
            var first = pool.submit(process); var second = pool.submit(process); start.countDown();
            first.get(10, TimeUnit.SECONDS); second.get(10, TimeUnit.SECONDS);
        }
        tx.executeWithoutResult(status -> projection.process(id));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT status FROM form_projection_batch", String.class)).isEqualTo("SUCCEEDED");
    }
    @Test void partialInsertFailureRollsBackAndRetryRecovers() throws Exception {
        var form = form();
        var second = ((com.fasterxml.jackson.databind.node.ArrayNode) form.path("projection").path("bindings")).addObject();
        second.put("id", "second").put("enabled", true).put("modelId", "formTrace").putObject("sources").put("materialLotText", "lot");
        enqueue(form); long id = batchId();
        jdbc.execute("ALTER TABLE form_projection_record ADD CONSTRAINT injected_failure CHECK(binding_id <> 'second')");
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> projection.process(id))).isInstanceOf(RuntimeException.class);
        projection.failed(id);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT status FROM form_projection_batch", String.class)).isEqualTo("FAILED");
        jdbc.execute("ALTER TABLE form_projection_record DROP CONSTRAINT injected_failure");
        jdbc.update("UPDATE form_projection_batch SET status='PENDING' WHERE id=?", id);
        tx.executeWithoutResult(status -> projection.process(id));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT attempts FROM form_projection_batch", Integer.class)).isEqualTo(2);
    }
    @Test void restartUsesPersistedSnapshotRatherThanLaterValues() throws Exception {
        var form = form(); enqueue(form());
        ((ObjectNode) form.path("projection").path("bindings").get(0).path("sources")).put("materialLotText", "new-field");
        var restarted = new FormProjectionService(jdbc, new ObjectMapper());
        tx.executeWithoutResult(status -> restarted.process(batchId()));
        assertThat(jdbc.queryForObject("SELECT attributes->>'materialLotText' FROM form_projection_record", String.class)).isEqualTo("L1");
    }
    private com.zencas.edhr.production.controller.FormProjectionController reports() {
        return new com.zencas.edhr.production.controller.FormProjectionController(jdbc, mapper,
                org.mockito.Mockito.mock(com.zencas.edhr.compliance.repository.AuditEventRepository.class),
                org.mockito.Mockito.mock(com.zencas.edhr.common.util.SnowflakeIdGenerator.class));
    }
    @Test void reportFiltersMustMatchSameRecordAndPendingIsNotVisible() throws Exception {
        enqueue(form());
        var query = new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of("materialLotText", "L1"), 0, 20, null, null);
        assertThat(reports().query(query).getData().path("total").asInt()).isZero();
        tx.executeWithoutResult(status -> projection.process(batchId()));
        assertThat(reports().query(query).getData().path("total").asInt()).isEqualTo(1);
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'other','form','formTrace','{\"materialLotText\":\"L2\",\"teamText\":\"B\"}','{}','')", batchId());
        var all = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of(), 0, 1, null, null)).getData();
        assertThat(all.path("total").asInt()).isEqualTo(1);
        assertThat(all.path("records")).hasSize(1);
        assertThat(all.path("records").get(0).path("hits")).hasSize(2);
        var mismatch = new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of("materialLotText", "L1", "teamText", "B"), 0, 20, null, null);
        assertThat(reports().query(mismatch).getData().path("total").asInt()).isZero();
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'scrap','form','scrap','{\"category\":\"外观\",\"quantity\":1,\"unit\":\"件\"}','{}','')", batchId());
        var category = new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of("category", "外观"), 0, 20, null, null);
        assertThat(reports().query(category).getData().path("total").asInt()).isEqualTo(1);
    }
    @Test void aggregatesKeepOperationsAndUnitsSeparate() throws Exception {
        enqueue(form());
        tx.executeWithoutResult(status -> projection.process(batchId()));
        jdbc.update("INSERT INTO form_instance_record(id,operation_id,operation_name) VALUES(2,'b','B')");
        jdbc.update("INSERT INTO form_projection_batch(tenant_id,form_instance_id,final_revision,rule_version,source_json,status) VALUES('default',2,1,'form-projection-v1','{}','SUCCEEDED')");
        long secondId = jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE form_instance_id=2", Long.class);
        for (long id : new long[]{batchIdFor(1), secondId}) {
            jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'production','form','production','{\"goodQuantity\":100,\"unit\":\"件\"}','{}','')", id);
        }
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'weight','form','production','{\"goodQuantity\":0.5,\"unit\":\"kg\"}','{}','')", secondId);
        var result = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of(), 0, 20, null, null)).getData();
        assertThat(result.path("totals")).hasSize(3);
        assertThat(result.path("records")).hasSize(3);
        for (var group : result.path("totals")) assertThat(group.path("goodQuantity").decimalValue()).isLessThanOrEqualTo(new java.math.BigDecimal("100"));
    }
    private long batchIdFor(int instanceId) { return jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE form_instance_id=?", Long.class, instanceId); }
}
