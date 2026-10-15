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
@EnabledIfEnvironmentVariable(named = "PROJECTION_TEST_DATABASE_URL", matches = "jdbc:postgresql://localhost:5432/edhr_(form_projection|projection_integration_test)")
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
        jdbc.execute("CREATE TABLE form_instance_record(id BIGINT PRIMARY KEY,tenant_id text default 'default',source_type text default 'PRODUCTION_EXECUTION',work_order_no text,instance_no text,object_id bigint default 1,object_no text default 'B1',operation_id text default 'a',operation_name text default 'A',created_by text,created_at timestamp,updated_by text,updated_at timestamp,snapshot_json text default '{}',values_json text default '{}',status text default 'ACTIVE',template_name text,template_version text)");
        jdbc.update("INSERT INTO form_instance_record(id) VALUES(1)");
        try (var connection = ds.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0107-form-projection-runtime.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0108-form-lookup-items.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0109-saved-form-trace-index.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0110-projection-detail-display.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0111-form-instance-saved-stage.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0112-typed-trace-catalog.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0113-trace-date-preset.sql"));
        }
        projection = new FormProjectionService(jdbc, mapper);
    }
    @AfterEach void cleanup() { if (schema != null) admin.execute("DROP SCHEMA " + schema + " CASCADE"); }
    private ObjectNode form() throws Exception {
        return (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"lot","type":"text"},{"id":"qty","type":"number"},{"id":"ng","type":"number"},{"id":"unit","type":"text"}],
            "projection":{"version":"form-projection-v1","bindings":[
            {"id":"production","enabled":true,"modelId":"production","sources":{"goodQuantity":"qty","unit":"unit","documentNumberText":"lot"}}]}}
            """);
    }
    private ObjectNode values() { return mapper.createObjectNode().put("lot", "L1").put("qty", 100).put("ng", 5).put("unit", "件"); }
    private void enqueue(ObjectNode form) {
        tx.executeWithoutResult(status -> projection.completed(1, "default", form, values(), mapper.createObjectNode(), "a"));
    }
    private long batchId() { return jdbc.queryForObject("SELECT id FROM form_projection_batch", Long.class); }

    @Test void reportBusinessFieldsSurviveCompletionAndFiltersApplyToRecordsAndTotals() throws Exception {
        var form = form();
        var fields = (com.fasterxml.jackson.databind.node.ArrayNode) form.path("fields");
        fields.addObject().put("id", "hours").put("type", "number");
        fields.addObject().put("id", "date").put("type", "datetime").putObject("typeConfig").put("mode", "date");
        fields.addObject().put("id", "person").put("type", "reference").putObject("typeConfig").put("sourceType", "user");
        fields.addObject().put("id", "start").put("type", "datetime");
        fields.addObject().put("id", "end").put("type", "datetime");
        ((ObjectNode) form.path("projection").path("bindings").get(0).path("sources"))
                .put("workHours", "hours").put("productionDate", "date").put("reporter", "person").put("reportStartTime", "start").put("reportEndTime", "end");
        var values = values().put("hours", 3.5).put("date", "2026-10-12").put("start", "2026-10-12T23:00").put("end", "2026-10-13T01:00");
        values.putObject("person").put("id", "7").put("sourceType", "user").put("code", "worker7").put("name", "员工七");
        var context = mapper.createObjectNode().put("workOrderNo", "WO-FROZEN").put("productCode", "P-FROZEN").put("productName", "原产品名");
        jdbc.update("UPDATE form_instance_record SET created_at='2026-10-13 12:00',created_by='creator'");
        tx.executeWithoutResult(status -> projection.completed(1, "default", form, values, context, "a"));
        values.put("hours", 999); context.put("productName", "后改名称");
        tx.executeWithoutResult(status -> projection.process(batchId()));
        var filters = java.util.Map.of("workOrderNo", "WO-FROZEN", "productCode", "P-FROZEN", "reporter", "员工七", "productionDateFrom", "2026-10-12", "productionDateTo", "2026-10-12");
        var result = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, filters, 0, 20, null, null)).getData();
        assertThat(result.path("total").asInt()).isEqualTo(1);
        assertThat(result.path("records").get(0).path("attributes").path("workHours").decimalValue()).isEqualByComparingTo("3.5");
        assertThat(result.path("totals").get(0).path("workHours").decimalValue()).isEqualByComparingTo("3.5");
        assertThat(result.path("records").get(0).path("context").path("productName").asText()).isEqualTo("原产品名");
        for (var miss : java.util.List.of(java.util.Map.of("reporter", "creator"), java.util.Map.of("productionDateFrom", "2026-10-13"), java.util.Map.of("createdDateTo", "2026-10-12"))) {
            var empty = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, miss, 0, 20, null, null)).getData();
            assertThat(empty.path("total").asInt()).isZero(); assertThat(empty.path("totals")).isEmpty();
        }
        assertThatThrownBy(() -> reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of("productionDateFrom", "2026-02-30"), 0, 20, null, null))).hasMessageContaining("有效日期");
        assertThatThrownBy(() -> reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of("productionDateFrom", "2026-10-13", "productionDateTo", "2026-10-12"), 0, 20, null, null))).hasMessageContaining("结束日期");
    }

    @Test void signatureReporterIsFrozenAndQueryableWithoutChangingQuantities() throws Exception {
        var form = form();
        ((com.fasterxml.jackson.databind.node.ArrayNode) form.path("fields")).addObject().put("id", "person").put("type", "signature");
        ((ObjectNode) form.path("projection").path("bindings").get(0).path("sources")).put("reporter", "person");
        var values = values();
        values.putObject("person").put("type", "signature").put("signatureId", "123").put("signerId", "7").put("signerName", "员工七");
        tx.executeWithoutResult(status -> projection.completed(1, "default", form, values, mapper.createObjectNode(), "a"));
        ((ObjectNode) values.path("person")).put("signerName", "后来改名");
        tx.executeWithoutResult(status -> projection.process(batchId()));
        var result = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of("reporter", "员工七"), 0, 20, null, null)).getData();
        assertThat(result.path("total").asInt()).isEqualTo(1);
        assertThat(result.path("records").get(0).path("attributes").path("reporterId").asText()).isEqualTo("7");
        assertThat(result.path("totals").get(0).path("goodQuantity").asInt()).isEqualTo(100);
        var empty = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of("reporter", "后来改名"), 0, 20, null, null)).getData();
        assertThat(empty.path("total").asInt()).isZero();
        assertThat(empty.path("totals")).isEmpty();
    }

    @Test void scrapCauseLabelsFilterWholeRecordsWithoutChangingGrouping() throws Exception {
        enqueue(form()); tx.executeWithoutResult(status -> projection.process(batchId()));
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'scrap1','form','scrap','{\"material\":{\"id\":\"1\",\"code\":\"M-1\",\"name\":\"螺丝\"},\"quantity\":2,\"reason\":\"scratch\",\"reasonLabel\":\"划伤\",\"category\":\"appearance\",\"categoryLabel\":\"外观\"}','{}','')", batchId());
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'scrap2','form','scrap','{\"material\":{\"id\":\"1\",\"code\":\"M-1\",\"name\":\"螺丝\"},\"quantity\":3,\"reason\":\"dirty\",\"reasonLabel\":\"污染\",\"category\":\"appearance\",\"categoryLabel\":\"外观\"}','{}','')", batchId());
        var all = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("scrap", null, null, java.util.Map.of("materialCode", "M-1", "category", "外观"), 0, 20, null, null)).getData();
        assertThat(all.path("records")).hasSize(2); assertThat(all.path("totals")).hasSize(1);
        assertThat(all.path("totals").get(0).path("quantity").asInt()).isEqualTo(5);
        assertThat(all.path("totals").get(0).has("reason")).isFalse();
        var filtered = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("scrap", null, null, java.util.Map.of("reason", "划伤"), 0, 20, null, null)).getData();
        assertThat(filtered.path("records")).hasSize(1);
        assertThat(filtered.path("totals").get(0).path("quantity").asInt()).isEqualTo(2);
    }

    @Test void editingTemplateAfterFirstUseDoesNotChangeThatExecutionSnapshot() throws Exception {
        jdbc.execute("CREATE TABLE form_template(id BIGINT PRIMARY KEY,tenant_id text,name text,code text,category_name text,status text)");
        jdbc.execute("CREATE TABLE form_template_version(id BIGINT PRIMARY KEY,template_id bigint,tenant_id text,version_label text,status text,model_design_json text,canvas_design_json text)");
        jdbc.update("INSERT INTO form_template VALUES (10,'default','示例表','FORM-10',null,'ACTIVE')");
        String firstModel = """
            {"fields":[{"id":"lot1","type":"text"},{"id":"lot2","type":"text"}],
             "projection":{"version":"form-projection-v1","bindings":[
               {"id":"trace","enabled":true,"modelId":"formTrace","sources":{"materialLotText":"lot1"}}]}}
            """;
        jdbc.update("INSERT INTO form_template_version VALUES (20,10,'default','V1','PUBLISHED',?,?)", firstModel, "{}");
        var builder = new ExecutionSnapshotBuilder(jdbc, mapper);
        ObjectNode firstUse = builder.customForm("20", true, "first", "tester");
        String persistedExecutionForm = firstUse.toString();
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=20",
                firstModel.replace("\"materialLotText\":\"lot1\"", "\"materialLotText\":\"lot2\""));
        ObjectNode restoredFirstUse = (ObjectNode) mapper.readTree(persistedExecutionForm);
        ObjectNode secondUse = builder.customForm("20", true, "second", "tester");
        assertThat(restoredFirstUse.path("projection").path("bindings").get(0).path("sources").path("materialLotText").asText()).isEqualTo("lot1");
        assertThat(secondUse.path("projection").path("bindings").get(0).path("sources").path("materialLotText").asText()).isEqualTo("lot2");
        var savedValues = mapper.createObjectNode().put("lot1", "L1").put("lot2", "L2");
        tx.executeWithoutResult(status -> new FormTraceIndexService(jdbc, mapper).refresh(1, "default", restoredFirstUse, savedValues));
        assertThat(jdbc.queryForObject("SELECT value_text FROM form_trace_value WHERE form_instance_id=1", String.class)).isEqualTo("L1");
        jdbc.update("INSERT INTO form_instance_record(id) VALUES(2)");
        tx.executeWithoutResult(status -> new FormTraceIndexService(jdbc, mapper).refresh(2, "default", secondUse, savedValues));
        assertThat(jdbc.queryForObject("SELECT value_text FROM form_trace_value WHERE form_instance_id=2", String.class)).isEqualTo("L2");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=20",
                firstModel.replace("\"materialLotText\":\"lot1\"", "\"materialLotText\":\"missing\""));
        assertThatThrownBy(() -> builder.customForm("20", true, "invalid", "tester"))
                .hasMessageContaining("字段");
    }

    @Test void completionAndOutboxRollbackTogetherOnFailure() throws Exception {
        var form = form();
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> {
            jdbc.update("UPDATE form_instance_record SET status='COMPLETED' WHERE id=1");
            projection.completed(1, "default", form, values(), mapper.createObjectNode(), "a");
            throw new IllegalStateException("simulated source transaction rollback");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT status FROM form_instance_record WHERE id=1", String.class)).isEqualTo("ACTIVE");
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
        second.put("id", "second").put("enabled", true).put("modelId", "production").putObject("sources").put("ngQuantity", "ng");
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
        var form = form(); enqueue(form);
        ((ObjectNode) form.path("projection").path("bindings").get(0).path("sources")).put("documentNumberText", "new-field");
        var restarted = new FormProjectionService(jdbc, new ObjectMapper());
        tx.executeWithoutResult(status -> restarted.process(batchId()));
        assertThat(jdbc.queryForObject("SELECT attributes->>'documentNumberText' FROM form_projection_record", String.class)).isEqualTo("L1");
    }
    private com.zencas.edhr.production.controller.FormProjectionController reports() {
        var catalog = new com.zencas.edhr.template.service.FormLookupCatalogService(jdbc, mapper,
                org.mockito.Mockito.mock(com.zencas.edhr.common.util.SnowflakeIdGenerator.class),
                org.mockito.Mockito.mock(com.zencas.edhr.compliance.repository.AuditEventRepository.class));
        return new com.zencas.edhr.production.controller.FormProjectionController(jdbc, mapper,
                org.mockito.Mockito.mock(com.zencas.edhr.compliance.repository.AuditEventRepository.class),
                org.mockito.Mockito.mock(com.zencas.edhr.common.util.SnowflakeIdGenerator.class),
                catalog);
    }
    @Test void savedTraceIsIndependentOfPendingStatisticalProjectionAndDoesNotReuseStatisticalFields() throws Exception {
        var form = form();
        ((com.fasterxml.jackson.databind.node.ArrayNode) form.path("projection").path("bindings")).addObject()
                .put("id", "trace").put("enabled", true).put("modelId", "formTrace").putObject("sources").put("materialLotText", "lot");
        enqueue(form);
        tx.executeWithoutResult(status -> new FormTraceIndexService(jdbc, mapper).refresh(1, "default", form, values()));
        var query = new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of("materialLotText", "L1"), 0, 20, null, null);
        assertThat(reports().query(query).getData().path("total").asInt()).isEqualTo(1);
        tx.executeWithoutResult(status -> projection.process(batchId()));
        assertThat(reports().query(query).getData().path("total").asInt()).isEqualTo(1);
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'other','form','formTrace','{\"materialLotText\":\"L2\",\"equipmentText\":\"E01\"}','{}','')", batchId());
        var all = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of(), 0, 1, null, null)).getData();
        assertThat(all.path("total").asInt()).isEqualTo(1);
        assertThat(all.path("records")).hasSize(1);
        assertThat(all.path("records").get(0).path("hits")).hasSize(1);
        var mismatch = new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of("materialLotText", "L1", "equipmentText", "E01"), 0, 20, null, null);
        assertThat(reports().query(mismatch).getData().path("total").asInt()).isZero();
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'scrap','form','scrap','{\"category\":\"外观\",\"quantity\":1,\"unit\":\"件\"}','{}','')", batchId());
        var category = new com.zencas.edhr.production.controller.FormProjectionController.Query("formTrace", null, null, java.util.Map.of("category", "外观"), 0, 20, null, null);
        assertThatThrownBy(() -> reports().query(category)).hasMessageContaining("追溯项");
    }
    @Test void aggregatesKeepOperationsAndUnitsSeparate() throws Exception {
        enqueue(form());
        tx.executeWithoutResult(status -> projection.process(batchId()));
        jdbc.update("INSERT INTO form_instance_record(id,operation_id,operation_name) VALUES(2,'b','B')");
        jdbc.update("INSERT INTO form_projection_batch(tenant_id,form_instance_id,final_revision,rule_version,source_json,status) VALUES('default',2,1,'form-projection-v1','{}','SUCCEEDED')");
        long secondId = jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE form_instance_id=2", Long.class);
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'production','form','production','{\"goodQuantity\":100,\"unit\":\"件\"}','{}','')", secondId);
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id) VALUES (?,'weight','form','production','{\"goodQuantity\":0.5,\"unit\":\"kg\"}','{}','')", secondId);
        var result = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of(), 0, 20, null, null)).getData();
        assertThat(result.path("totals")).hasSize(3);
        assertThat(result.path("records")).hasSize(3);
        for (var group : result.path("totals")) assertThat(group.path("goodQuantity").decimalValue()).isLessThanOrEqualTo(new java.math.BigDecimal("100"));
    }

    @Test void statisticalRowLocationUsesFrozenSystemIdentityRatherThanLatestOrder() throws Exception {
        var form = (ObjectNode) mapper.readTree("""
                {"fields":[{"id":"items","type":"subTable","typeConfig":{"columns":[{"id":"qty","type":"number"}]}}],
                 "projection":{"version":"form-projection-v1","bindings":[
                 {"id":"output","enabled":true,"modelId":"production","tableId":"items","sources":{"goodQuantity":"qty"}}]}}
                """);
        String firstId = UUID.randomUUID().toString(), secondId = UUID.randomUUID().toString();
        var values = mapper.createObjectNode();
        values.putArray("items").addObject().put("__rowId", firstId).put("qty", 2);
        ((com.fasterxml.jackson.databind.node.ArrayNode) values.path("items")).addObject().put("__rowId", secondId).put("qty", 3);
        tx.executeWithoutResult(status -> projection.completed(1, "default", form, values, mapper.createObjectNode(), "a"));
        tx.executeWithoutResult(status -> projection.process(batchId()));
        jdbc.update("UPDATE form_instance_record SET values_json=? WHERE id=1",
                mapper.createObjectNode().set("items", mapper.createArrayNode().add(values.path("items").get(1)).add(values.path("items").get(0))).toString());
        var result = reports().query(new com.zencas.edhr.production.controller.FormProjectionController.Query("production", null, null, java.util.Map.of(), 0, 20, null, null)).getData();
        assertThat(result.path("records")).hasSize(2);
        for (var row : result.path("records")) {
            assertThat(row.path("tableId").asText()).isEqualTo("items");
            assertThat(row.path("rowIndex").asInt()).isEqualTo(row.path("rowKey").asText().equals(firstId) ? 0 : 1);
        }
    }

    @Test void traceOnlyCompletionDoesNotCreateOutboxOrValidateTraceAsFormalStatisticalData() throws Exception {
        var traceOnly = (ObjectNode) mapper.readTree("""
                {"fields":[{"id":"lot","type":"text"}],"projection":{"version":"form-projection-v1","bindings":[
                {"id":"trace","enabled":true,"modelId":"formTrace","sources":{"materialLotText":"lot"}}]}}
                """);
        assertThatCode(() -> tx.executeWithoutResult(status -> projection.completed(1, "default", traceOnly,
                mapper.createObjectNode().put("lot", "x".repeat(1024)), mapper.createObjectNode(), "a"))).doesNotThrowAnyException();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Integer.class)).isZero();
    }

    @Test void finalProjectionPublishesOnlyStatisticalFactsWhenTraceAndStatisticsAreBothConfigured() throws Exception {
        var mixed = form();
        ((com.fasterxml.jackson.databind.node.ArrayNode) mixed.path("fields")).addObject().put("id", "lookupOnly").put("type", "text");
        ((com.fasterxml.jackson.databind.node.ArrayNode) mixed.path("projection").path("bindings")).addObject()
                .put("id", "trace").put("enabled", true).put("modelId", "formTrace").putObject("sources").put("materialLotText", "lookupOnly");
        var values = values().put("lookupOnly", "x".repeat(1024));
        tx.executeWithoutResult(status -> projection.completed(1, "default", mixed, values, mapper.createObjectNode(), "a"));
        tx.executeWithoutResult(status -> projection.process(batchId()));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT model_id FROM form_projection_record", String.class)).isEqualTo("production");
        assertThat(jdbc.queryForObject("SELECT attributes->>'goodQuantity' FROM form_projection_record", String.class)).isEqualTo("100");
        assertThat(jdbc.queryForObject("SELECT status FROM form_projection_batch", String.class)).isEqualTo("SUCCEEDED");
        assertThat(jdbc.queryForObject("SELECT source_json->'model'->'projection'->'bindings' FROM form_projection_batch", String.class)).doesNotContain("formTrace");
        assertThat(jdbc.queryForObject("SELECT source_json->'form'->'projection'->'bindings' FROM form_projection_batch", String.class)).contains("formTrace");
    }
}
