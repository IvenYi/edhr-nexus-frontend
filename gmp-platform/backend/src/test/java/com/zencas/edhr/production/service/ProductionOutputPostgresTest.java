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

@EnabledIfEnvironmentVariable(named="PROJECTION_TEST_DATABASE_URL", matches="jdbc:postgresql://localhost:5432/edhr_projection_integration_test")
class ProductionOutputPostgresTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private JdbcTemplate admin, jdbc;
    private TransactionTemplate tx;
    private ProductionOutputService outputs;
    private FormProjectionService projections;
    private String schema;

    @BeforeEach void setup() throws Exception {
        String url = System.getenv("PROJECTION_TEST_DATABASE_URL");
        String user = System.getenv().getOrDefault("PROJECTION_DATABASE_USER", "edhr");
        String password = System.getenv().getOrDefault("PROJECTION_DATABASE_PASSWORD", "edhr_dev_pwd");
        admin = new JdbcTemplate(new DriverManagerDataSource(url, user, password));
        schema = "output_test_" + UUID.randomUUID().toString().replace("-", "");
        admin.execute("CREATE SCHEMA " + schema);
        var ds = new DriverManagerDataSource(url + "?currentSchema=" + schema, user, password);
        jdbc = new JdbcTemplate(ds); tx = new TransactionTemplate(new DataSourceTransactionManager(ds));
        jdbc.execute("CREATE TABLE production_object(id bigint PRIMARY KEY, tenant_id text, object_no text, object_type text, status text, work_order_id bigint)");
        jdbc.execute("CREATE TABLE production_execution(object_id bigint PRIMARY KEY, snapshot_json text)");
        jdbc.execute("CREATE TABLE form_instance_record(id bigint PRIMARY KEY, tenant_id text, source_type text, object_id bigint, instance_no text, operation_name text, copy_id text, status text)");
        jdbc.execute("CREATE TABLE material(id bigint PRIMARY KEY, material_type_id bigint)");
        jdbc.execute("CREATE TABLE material_type(id bigint PRIMARY KEY, name text)");
        jdbc.execute("CREATE TABLE product_process_operation_binding(id bigint PRIMARY KEY, product_process_version_id bigint)");
        try (var connection = ds.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0107-form-projection-runtime.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0108-form-lookup-items.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0110-projection-detail-display.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0114-final-output-operation.sql"));
        }
        outputs = new ProductionOutputService(jdbc, mapper); projections = new FormProjectionService(jdbc, mapper);
        object(1, "件"); object(2, "件");
    }

    @AfterEach void cleanup() { if (schema != null) admin.execute("DROP SCHEMA " + schema + " CASCADE"); }

    private ObjectNode form() throws Exception {
        return (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"qty","type":"number"},{"id":"unit","type":"text"}],
             "projection":{"version":"form-projection-v1","bindings":[{"id":"report","enabled":true,
               "modelId":"production","sources":{"outputQuantity":"qty","goodQuantity":"qty","unit":"unit"}}]}}
            """);
    }

    private void object(long id, String unit) throws Exception {
        jdbc.update("INSERT INTO production_object VALUES (?,'default',?,'BATCH','IN_PROGRESS',10)", id, "B" + id);
        var snapshot = mapper.createObjectNode().put("outputPolicyVersion", 1);
        snapshot.putObject("context").put("unit", unit).put("productId", "100");
        var ops = snapshot.putArray("operations");
        for (String key : new String[]{"first", "last"}) {
            var op = ops.addObject().put("id", key).put("name", key).put("finalOutput", key.equals("last"));
            op.putArray("forms").add(form());
        }
        jdbc.update("INSERT INTO production_execution VALUES (?,?)", id, snapshot.toString());
    }

    private long report(long instance, long object, String op, int quantity, String unit) throws Exception {
        jdbc.update("INSERT INTO form_instance_record(id,tenant_id,source_type,object_id,instance_no,copy_id,status) VALUES (?,'default','PRODUCTION_EXECUTION',?,?,?,'COMPLETED')", instance, object, "FR-" + instance, "copy-" + instance);
        tx.executeWithoutResult(status -> projections.completed(instance, "default", uncheckedForm(), mapper.createObjectNode().put("qty", quantity).put("unit", unit), mapper.createObjectNode(), op));
        return jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE form_instance_id=?", Long.class, instance);
    }
    private ObjectNode uncheckedForm() { try { return form(); } catch (Exception ex) { throw new RuntimeException(ex); } }
    private void process(long id) { tx.executeWithoutResult(status -> projections.process(id)); }

    @Test void repeatedReportingUsesCompleteFactsNotOtherOperationsOrCallbackCounts() throws Exception {
        process(report(1,1,"first",100,"根"));
        long first = report(2,1,"last",10,"件"); process(first); process(first);
        assertThat(outputs.object(1).path("quantity").asText()).isEqualTo("10");
        assertThat(outputs.order(10).path("status").asText()).isEqualTo("PARTIAL");
        process(report(3,1,"last",12,"件"));
        process(report(4,2,"last",13,"件"));
        assertThat(outputs.object(1).path("quantity").asText()).isEqualTo("22");
        assertThat(outputs.object(1).path("operations").path("first").path("groups").get(0).path("unit").asText()).isEqualTo("根");
        assertThat(outputs.order(10).path("quantity").asText()).isEqualTo("35");
        assertThat(outputs.order(10).path("status").asText()).isEqualTo("READY");
    }

    @Test void zeroIsKnownButEmptyAndDifferentUnitsAreExcludedWithVisibleEvidence() throws Exception {
        process(report(1,1,"last",0,"件")); process(report(2,1,"last",10,"")); process(report(3,1,"last",2,"kg"));
        var output = outputs.object(1);
        assertThat(output.path("quantity").asText()).isEqualTo("0");
        assertThat(output.path("status").asText()).isEqualTo("UNIT_REVIEW");
        assertThat(output.path("rejected").asInt()).isEqualTo(2);
        assertThat(output.path("sources")).hasSize(3);
        assertThat(output.path("sources").findValues("included")).extracting(node -> node.asBoolean()).containsExactly(true,false,false);
        assertThat(outputs.object(2).path("quantity").isNull()).isTrue();
    }

    @Test void pendingFailedAndRetryNeverEraseOrDoubleKnownOutput() throws Exception {
        process(report(1,1,"last",10,"件")); long id = report(2,1,"last",12,"件");
        assertThat(outputs.object(1).path("status").asText()).isEqualTo("PENDING");
        projections.failed(id);
        assertThat(outputs.object(1).path("quantity").asText()).isEqualTo("10");
        assertThat(outputs.object(1).path("status").asText()).isEqualTo("FAILED");
        jdbc.update("UPDATE form_projection_batch SET status='PENDING' WHERE id=?", id);
        process(id); process(id);
        assertThat(outputs.object(1).path("quantity").asText()).isEqualTo("22");
    }

    @Test void ordinaryOperationKeepsDifferentUnitsSeparateAndNoFinalNodeDoesNotInventZero() throws Exception {
        process(report(1,1,"first",10,"根")); process(report(2,1,"first",12,"件"));
        var operation = outputs.object(1).path("operations").path("first");
        assertThat(operation.path("quantity").isNull()).isTrue(); assertThat(operation.path("groups")).hasSize(2);
        jdbc.update("UPDATE production_execution SET snapshot_json=replace(snapshot_json,'\"finalOutput\":true','\"finalOutput\":false') WHERE object_id=1");
        assertThat(outputs.object(1).path("status").asText()).isEqualTo("NOT_CONFIGURED");
        assertThat(outputs.object(1).path("quantity").isNull()).isTrue();
    }

    @Test void ordinaryOutputWithoutUnitKeepsEvidenceButDoesNotEnterEitherCumulative() throws Exception {
        process(report(1, 1, "first", 30, ""));
        var operation = outputs.object(1).path("operations").path("first");
        assertThat(operation.path("quantity").isNull()).isTrue();
        assertThat(operation.path("status").asText()).isEqualTo("UNIT_REVIEW");
        assertThat(operation.path("sources").get(0).path("quantity").asText()).isEqualTo("30");
        assertThat(operation.path("sources").get(0).path("included").asBoolean()).isFalse();
        assertThat(operation.path("sources").get(0).path("copyId").asText()).isEqualTo("copy-1");
        assertThat(operation.path("quality").path("goodQuantity").path("quantity").isNull()).isTrue();
        process(report(2, 1, "first", 0, "根"));
        assertThat(outputs.object(1).path("operations").path("first").path("quantity").asText()).isEqualTo("0");
        assertThat(outputs.object(1).path("quantity").isNull()).isTrue();
    }

    @Test void oldSnapshotsAreNotReinterpretedAndMixedFrozenBatchUnitsAreNotAdded() throws Exception {
        process(report(1,1,"last",10,"件"));
        jdbc.update("UPDATE production_execution SET snapshot_json=replace(snapshot_json,'\"outputPolicyVersion\":1,','') WHERE object_id=1");
        assertThat(outputs.object(1).path("status").asText()).isEqualTo("LEGACY");
        jdbc.update("DELETE FROM production_execution WHERE object_id=2"); jdbc.update("DELETE FROM production_object WHERE id=2"); object(2,"kg");
        process(report(2,2,"last",2,"kg"));
        assertThat(outputs.order(10).path("quantity").asText()).isEqualTo("2");
        jdbc.update("UPDATE production_execution SET snapshot_json=replace(snapshot_json,'\"context\"','\"outputPolicyVersion\":1,\"context\"') WHERE object_id=1");
        assertThat(outputs.order(10).path("status").asText()).isEqualTo("UNIT_REVIEW");
        assertThat(outputs.order(10).path("quantity").isNull()).isTrue();
    }

    @Test void uniqueFinalNodeIsEnforcedByDatabaseAndExistingRowsStayUnconfigured() {
        jdbc.update("INSERT INTO product_process_operation_binding(id,product_process_version_id) VALUES(1,10),(2,10)");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM product_process_operation_binding WHERE final_output", Integer.class)).isZero();
        jdbc.update("UPDATE product_process_operation_binding SET final_output=true WHERE id=1");
        assertThatThrownBy(() -> jdbc.update("UPDATE product_process_operation_binding SET final_output=true WHERE id=2")).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    @Test void concurrentConsumersExposeOneCommittedSourceSet() throws Exception {
        long id = report(1,1,"last",10,"件");
        try (var pool = Executors.newFixedThreadPool(2)) {
            var latch = new CountDownLatch(1);
            Callable<Void> action = () -> { latch.await(); process(id); return null; };
            var a = pool.submit(action); var b = pool.submit(action); latch.countDown(); a.get(10,TimeUnit.SECONDS); b.get(10,TimeUnit.SECONDS);
        }
        assertThat(outputs.object(1).path("quantity").asText()).isEqualTo("10");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record",Integer.class)).isEqualTo(1);
    }

    @Test void subtableActualRowsAndIndependentMainBindingsEachContributeOnce() throws Exception {
        var form = (ObjectNode) mapper.readTree("""
          {"fields":[{"id":"lines","type":"subTable","typeConfig":{"columns":[{"id":"q","type":"number"},{"id":"u","type":"text"}]}},
             {"id":"q1","type":"number"},{"id":"q2","type":"number"},{"id":"unit","type":"text"}],
           "projection":{"version":"form-projection-v1","bindings":[
             {"id":"rows","enabled":true,"modelId":"production","tableId":"lines","sources":{"outputQuantity":"q","unit":"u"}},
             {"id":"main1","enabled":true,"modelId":"production","sources":{"outputQuantity":"q1","unit":"unit"}},
             {"id":"main2","enabled":true,"modelId":"production","sources":{"outputQuantity":"q2","unit":"unit"}}]}}
          """);
        var values = mapper.readTree("""
          {"lines":[{"__rowId":"r1","q":10,"u":"件"},{"__rowId":"r2","q":12,"u":"件"}],"q1":3,"q2":5,"unit":"件"}
          """);
        jdbc.update("INSERT INTO form_instance_record(id,tenant_id,source_type,object_id,instance_no) VALUES (1,'default','PRODUCTION_EXECUTION',1,'FR-1')");
        tx.executeWithoutResult(status -> projections.completed(1,"default",form,values,mapper.createObjectNode(),"last"));
        long id = jdbc.queryForObject("SELECT id FROM form_projection_batch", Long.class); process(id); process(id);
        assertThat(outputs.object(1).path("quantity").asText()).isEqualTo("30");
        assertThat(outputs.object(1).path("sources")).hasSize(4);
        assertThat(outputs.object(1).path("sources").findValuesAsText("rowKey")).contains("r1","r2");
    }

    @Test void batchSharedCustomFormCannotBeClaimedByItsDisplayOperation() throws Exception {
        var form = form().put("sourceType","CUSTOM").put("scope","BATCH");
        jdbc.update("INSERT INTO form_instance_record(id,tenant_id,source_type,object_id,instance_no) VALUES (1,'default','PRODUCTION_EXECUTION',1,'FR-1')");
        tx.executeWithoutResult(status -> projections.completed(1,"default",form,mapper.createObjectNode().put("qty",100).put("unit","件"),mapper.createObjectNode(),"last"));
        process(jdbc.queryForObject("SELECT id FROM form_projection_batch",Long.class));
        assertThat(outputs.object(1).path("quantity").isNull()).isTrue();
        assertThat(outputs.object(1).path("sources")).isEmpty();
    }

    private long qualityReport(long instance, String operation, String model, String role, int quantity, String unit, String materialId) throws Exception {
        var form = mapper.createObjectNode();
        var fields = form.putArray("fields"); fields.addObject().put("id", "q").put("type", "number"); fields.addObject().put("id", "u").put("type", "text");
        if (materialId != null) fields.addObject().put("id", "m").put("type", "reference").putObject("typeConfig").put("sourceType", "material");
        var binding = form.putObject("projection").put("version", "form-projection-v1").putArray("bindings").addObject().put("id", "quality").put("enabled", true).put("modelId", model);
        var sources = binding.putObject("sources").put(role, "q").put("unit", "u");
        var values = mapper.createObjectNode().put("q", quantity).put("u", unit);
        if (materialId != null) { sources.put("material", "m"); values.putObject("m").put("id", materialId).put("name", "物料" + materialId); }
        jdbc.update("INSERT INTO form_instance_record(id,tenant_id,source_type,object_id,instance_no,operation_name) VALUES (?,'default','PRODUCTION_EXECUTION',1,?,?)", instance, "FR-" + instance, operation);
        tx.executeWithoutResult(status -> projections.completed(instance, "default", form, values, mapper.createObjectNode(), operation));
        return jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE form_instance_id=?", Long.class, instance);
    }

    @Test void qualityUsesFinalRolesAndProductScrapWithoutUpdatingAnyProductionRows() throws Exception {
        process(qualityReport(1, "first", "production", "goodQuantity", 100, "根", null));
        process(qualityReport(2, "last", "production", "goodQuantity", 30, "件", null));
        process(qualityReport(3, "last", "production", "goodQuantity", 28, "件", null));
        process(qualityReport(4, "last", "production", "ngQuantity", 2, "件", null));
        process(qualityReport(5, "first", "scrap", "quantity", 2, "件", "100"));
        process(qualityReport(6, "last", "scrap", "quantity", 90, "件", "200"));
        process(qualityReport(7, "last", "scrap", "quantity", 1, "", "100"));
        var quality = outputs.object(1).path("quality");
        assertThat(quality.path("goodQuantity").path("quantity").asText()).isEqualTo("58");
        assertThat(quality.path("ngQuantity").path("quantity").asText()).isEqualTo("2");
        assertThat(quality.path("scrapQuantity").path("quantity").asText()).isEqualTo("2");
        assertThat(quality.path("scrapQuantity").path("status").asText()).isEqualTo("UNIT_REVIEW");
        assertThat(quality.path("scrapQuantity").path("sources")).hasSize(3);
        assertThat(outputs.object(1).path("operations").path("first").path("quality").path("goodQuantity").path("unit").asText()).isEqualTo("根");
        assertThat(outputs.object(1).path("operations").path("last").path("quality").path("scrapQuantity").path("groups").get(0).path("quantity").asText()).isEqualTo("90");
    }

    @Test void pendingQualityKeepsItsRecordedEvidenceAndRetryDoesNotAddTwice() throws Exception {
        long id = qualityReport(1, "last", "production", "ngQuantity", 0, "件", null);
        var metric = outputs.object(1).path("quality").path("ngQuantity");
        assertThat(metric.path("status").asText()).isEqualTo("PENDING");
        assertThat(metric.path("quantity").isNull()).isTrue();
        assertThat(metric.path("sources").get(0).path("quantity").asText()).isEqualTo("0");
        process(id); process(id);
        metric = outputs.object(1).path("quality").path("ngQuantity");
        assertThat(metric.path("quantity").asText()).isEqualTo("0");
        assertThat(metric.path("sources")).hasSize(1);
    }
}
