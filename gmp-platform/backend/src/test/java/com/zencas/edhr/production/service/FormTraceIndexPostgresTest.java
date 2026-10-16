package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.production.controller.FormProjectionController;
import com.zencas.edhr.production.controller.TraceReportController;
import com.zencas.edhr.template.service.FormLookupCatalogService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Disposable schemas on the isolated projection database; no existing rows are changed. */
@EnabledIfEnvironmentVariable(named = "PROJECTION_TEST_DATABASE_URL", matches = "jdbc:postgresql://localhost:5432/edhr_(form_projection|projection_integration_test)")
class FormTraceIndexPostgresTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private JdbcTemplate admin, jdbc;
    private TransactionTemplate tx;
    private DriverManagerDataSource dataSource;
    private String schema;
    private FormProjectionService projection;
    private FormInstanceRecordService records;
    private FormProjectionController reports;

    @BeforeEach void setup() throws Exception {
        String url = System.getenv("PROJECTION_TEST_DATABASE_URL");
        String user = System.getenv().getOrDefault("PROJECTION_DATABASE_USER", "edhr");
        String password = System.getenv().getOrDefault("PROJECTION_DATABASE_PASSWORD", "edhr_dev_pwd");
        admin = new JdbcTemplate(new DriverManagerDataSource(url, user, password));
        schema = "trace_test_" + UUID.randomUUID().toString().replace("-", "");
        admin.execute("CREATE SCHEMA " + schema);
        dataSource = new DriverManagerDataSource(url + "?currentSchema=" + schema, user, password);
        jdbc = new JdbcTemplate(dataSource); tx = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
        jdbc.execute("CREATE SEQUENCE form_instance_number_seq");
        jdbc.execute("CREATE TABLE form_template_version(id bigint PRIMARY KEY,template_id bigint)");
        jdbc.update("INSERT INTO form_template_version VALUES(20,10)");
        jdbc.execute("""
                CREATE TABLE form_instance_record(id bigint PRIMARY KEY,tenant_id text,source_type text,instance_no text,
                    object_id bigint,operation_id text,form_id text,copy_id text,template_id bigint,version_id bigint,
                    snapshot_json text,values_json text,status text,created_by text,created_at timestamp,updated_by text,
                    updated_at timestamp,numbered_at timestamp,legacy boolean,template_code text,template_name text,
                    template_version text,work_order_id text,work_order_no text,object_no text,object_type text,
                    operation_name text,created_by_id text,updated_by_id text)
                """);
        jdbc.execute("CREATE TABLE dhr_instance(id bigint,dhr_no text,status text,production_object_id bigint,tenant_id text)");
        jdbc.execute("CREATE TABLE work_order(id bigint PRIMARY KEY,tenant_id text,order_no text)");
        jdbc.execute("CREATE TABLE production_object(id bigint PRIMARY KEY,tenant_id text,work_order_id bigint,object_no text,object_type text)");
        try (var connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0107-form-projection-runtime.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0109-saved-form-trace-index.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0111-form-instance-saved-stage.sql"));
        }
        jdbc.execute("ALTER TABLE form_trace_value ADD COLUMN value_type text NOT NULL DEFAULT 'text'");
        projection = mock(FormProjectionService.class);
        records = new FormInstanceRecordService(jdbc, mapper, projection);
        var catalog = mock(FormLookupCatalogService.class);
        when(catalog.contains(anyString())).thenAnswer(invocation -> java.util.Set.of("materialLotText", "teamText", "equipmentText", "lookup_production_batch").contains(invocation.getArgument(0)));
        when(catalog.list()).thenReturn(java.util.stream.Stream.of("materialLotText", "teamText", "equipmentText", "lookup_production_batch")
                .map(id -> new FormLookupCatalogService.Item(id, id, "", "text", true, 1, null, null, null, null)).toList());
        reports = new FormProjectionController(jdbc, mapper, mock(AuditEventRepository.class), mock(SnowflakeIdGenerator.class), catalog);
    }

    @AfterEach void cleanup() { if (schema != null) admin.execute("DROP SCHEMA " + schema + " CASCADE"); }

    private ObjectNode form() throws Exception {
        return (ObjectNode) mapper.readTree("""
                {"id":"form","versionId":"20","version":"V1","code":"F1","name":"上料记录", "model":"{}","canvas":"{}",
                "fields":[{"id":"batch","name":"登记的批次","type":"text"},{"id":"equipment","name":"设备编号","type":"text"},
                {"id":"details","name":"上料明细","type":"subTable","typeConfig":{"columns":[
                {"id":"lot","name":"物料批号","type":"text"},{"id":"team","name":"班组","type":"text"}]}}],
                "projection":{"version":"form-projection-v1","lookupItems":{"lookup_production_batch":{"name":"生产批次/SN","type":"text","revision":1}},"bindings":[
                {"id":"head1","modelId":"formTrace","enabled":true,"sources":{"lookup_production_batch":"batch"}},
                {"id":"head2","modelId":"formTrace","enabled":true,"sources":{"equipmentText":"equipment"}},
                {"id":"detail1","modelId":"formTrace","enabled":true,"tableId":"details","sources":{"materialLotText":"lot"}},
                {"id":"detail2","modelId":"formTrace","enabled":true,"tableId":"details","sources":{"teamText":"team"}}]}}
                """);
    }

    private ObjectNode values() throws Exception {
        return (ObjectNode) mapper.readTree("""
                {"batch":"B-CONTENT","equipment":"E1","details":[
                {"__rowId":"row-one","lot":"L1","team":"A"},{"__rowId":"row-two","lot":"L2","team":"B"}]}
                """);
    }

    private void save(ObjectNode form, ObjectNode values, String status) {
        ObjectNode snapshot = mapper.createObjectNode();
        snapshot.putObject("context").put("objectNo", "B-OWNER").put("objectType", "BATCH").put("workOrderId", "500").put("workOrderNo", "WO1");
        snapshot.putArray("operations").addObject().put("id", "op").put("name", "工序A").putArray("forms").add(form);
        ObjectNode state = mapper.createObjectNode();
        state.putObject("operations").putObject("op").putObject("forms").putObject("form")
                .put("status", status).put("savedAt", "2026-10-10T10:00:00").set("values", values);
        tx.executeWithoutResult(ignored -> records.saved(100L, "default", snapshot, state, "op", "form", null));
    }

    private ObjectNode query(Map<String, String> filters) {
        return reports.query(new FormProjectionController.Query("formTrace", null, null, filters, 0, 20, null, null)).getData();
    }

    @Test void forwardTraceFindsUnboundSavedInstancesAndUsesRealFrozenContext() throws Exception {
        var plain = form(); plain.remove("projection");
        save(plain, values(), "DRAFT");
        jdbc.execute("CREATE TABLE production_execution(object_id bigint PRIMARY KEY,snapshot_json text)");
        jdbc.update("INSERT INTO production_execution VALUES(100,?)", "{\"context\":{\"productCode\":\"P1\",\"productName\":\"产品1\"}}");
        var catalog = mock(FormLookupCatalogService.class);
        var trace = new TraceReportController(jdbc, mapper, catalog, mock(DhrTraceReportService.class));
        var request = new TraceReportController.Query("FORWARD", Map.of("objectNo", "B-OWNER", "workOrderNo", "WO1", "productCode", "P1", "status", "DRAFT"), Map.of(), 0, 20);
        var found = trace.forms(request).getData();
        assertThat(found.path("total").asInt()).isEqualTo(1);
        assertThat(found.at("/records/0/hits")).isEmpty();
        assertThat(found.at("/records/0/context/productCode").asText()).isEqualTo("P1");
        assertThat(trace.forms(new TraceReportController.Query("FORWARD", Map.of("objectNo", "B-CONTENT"), Map.of(), 0, 20)).getData().path("total").asInt()).isZero();
        assertThat(trace.forms(new TraceReportController.Query("REVERSE", Map.of(), Map.of(), 0, 20)).getData().path("total").asInt()).isZero();
        verifyNoInteractions(catalog, projection);
        assertThatThrownBy(() -> trace.forms(new TraceReportController.Query("FORWARD", Map.of("materialLotText", "L1"), Map.of(), 0, 20))).hasMessageContaining("不受支持");
        assertThatThrownBy(() -> trace.forms(new TraceReportController.Query("FORWARD", Map.of("createdDateFrom", "2026-10-15", "createdDateTo", "2026-10-10"), Map.of(), 0, 20))).hasMessageContaining("不能早于");
        assertThatThrownBy(() -> trace.forms(new TraceReportController.Query("FORWARD", Map.of(), Map.of("equipmentText", "E1"), 0, 20))).hasMessageContaining("不使用内容");
    }

    @Test void savedDraftIsImmediatelyTraceableAndReplacementDoesNotGenerateStatistics() throws Exception {
        save(form(), values(), "DRAFT");
        ObjectNode first = query(Map.of("materialLotText", "L1"));
        assertThat(first.path("total").asInt()).isEqualTo(1);
        assertThat(first.path("records").get(0).path("status").asText()).isEqualTo("DRAFT");
        assertThat(first.path("records").get(0).path("hits").get(0).path("rowIndex").asInt()).isZero();
        verifyNoInteractions(projection);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();

        ObjectNode changed = values();
        ((ObjectNode) changed.path("details").get(0)).put("lot", "L3");
        // Editing an in-memory value cannot update the persisted query.
        assertThat(query(Map.of("materialLotText", "L3")).path("total").asInt()).isZero();
        save(form(), changed, "ACTIVE");
        assertThat(query(Map.of("materialLotText", "L1")).path("total").asInt()).isZero();
        assertThat(query(Map.of("materialLotText", "L3")).path("records").get(0).path("status").asText()).isEqualTo("ACTIVE");
        save(form(), changed, "COMPLETED");
        verify(projection).completed(eq(1L), eq("default"), any(), any(), any(), eq("op"));
    }

    @Test void realEngineSubmissionKeepsActiveLifecycleAndSavesApprovalStageForTraceAndSource() throws Exception {
        ObjectNode frozenForm = (ObjectNode) mapper.readTree("""
                {"id":"form","versionId":"20","version":"V1","code":"F1","name":"设备记录",
                 "fields":[{"id":"equipment","name":"设备编号","type":"text"}],
                 "projection":{"bindings":[{"id":"trace","modelId":"formTrace","enabled":true,"sources":{"equipmentText":"equipment"}}]},
                 "flow":{"nodes":[{"id":"entry","data":{"kind":"START"}},
                          {"id":"approval","data":{"kind":"APPROVAL"}},{"id":"end","data":{"kind":"END"}}],
                         "edges":[{"source":"entry","target":"approval"},{"source":"approval","target":"end"}]}}
                """);
        ObjectNode snapshot = (ObjectNode) mapper.readTree("""
                {"context":{"objectId":"100","objectNo":"B-OWNER","objectType":"BATCH","workOrderId":"500","workOrderNo":"WO1"},
                 "operations":[{"id":"op","name":"工序A","type":"OPERATION","forms":[],"works":[]}],
                 "routeNodes":[{"id":"op","type":"OPERATION"}],"routeEdges":[]}
                """);
        ((com.fasterxml.jackson.databind.node.ArrayNode) snapshot.path("operations").get(0).path("forms")).add(frozenForm);
        ExecutionAccess access = mock(ExecutionAccess.class);
        when(access.canAct(any(), any(), any(), any())).thenReturn(true);
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode().put("equipment", "EDIT"));
        ProductionExecutionEngine engine = new ProductionExecutionEngine(mapper, access);
        ObjectNode state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "1");

        tx.executeWithoutResult(ignored -> {
            engine.formAction(snapshot, state, "op", "form", "SAVE", mapper.createObjectNode().put("equipment", "E1"), null, null, null, "1");
            records.saved(100L, "default", snapshot, state, "op", "form", null);
        });
        assertThat(query(Map.of("equipmentText", "E1")).path("records").get(0).path("savedStage").asText()).isEqualTo("FILLING");

        tx.executeWithoutResult(ignored -> {
            engine.formAction(snapshot, state, "op", "form", "SUBMIT", mapper.createObjectNode(), null, null, null, "1");
            records.saved(100L, "default", snapshot, state, "op", "form", null);
        });
        assertThat(state.at("/operations/op/forms/form/status").asText()).isEqualTo("ACTIVE");
        assertThat(state.at("/operations/op/forms/form/active").get(0).asText()).isEqualTo("approval");
        var approvalRecord = query(Map.of("equipmentText", "E1")).path("records").get(0);
        assertThat(approvalRecord.path("status").asText()).isEqualTo("ACTIVE");
        assertThat(approvalRecord.path("savedStage").asText()).isEqualTo("APPROVAL");
        assertThat(approvalRecord.path("sourceMetadata").path("savedStage").asText()).isEqualTo("APPROVAL");
        assertThat(reports.instanceSource(1).getData().path("savedStage").asText()).isEqualTo("APPROVAL");
        assertThat(reports.instanceSource(1).getData().path("form")).isEqualTo(frozenForm);
        verifyNoInteractions(projection);

        tx.executeWithoutResult(ignored -> {
            engine.formAction(snapshot, state, "op", "form", "APPROVE", mapper.createObjectNode(), null, null, null, "1");
            records.saved(100L, "default", snapshot, state, "op", "form", null);
        });
        var completedRecord = query(Map.of("equipmentText", "E1")).path("records").get(0);
        assertThat(completedRecord.path("status").asText()).isEqualTo("COMPLETED");
        assertThat(completedRecord.path("savedStage").asText()).isEqualTo("COMPLETED");
        verify(projection).completed(eq(1L), eq("default"), eq(frozenForm), any(), any(), eq("op"));
    }

    @Test void mainConditionsCombineAcrossBindingsAndDetailConditionsMustShareActualRow() throws Exception {
        save(form(), values(), "ACTIVE");
        assertThat(query(Map.of("lookup_production_batch", "B-CONTENT", "equipmentText", "E1")).path("total").asInt()).isEqualTo(1);
        assertThat(query(Map.of("materialLotText", "L1", "teamText", "A")).path("total").asInt()).isEqualTo(1);
        assertThat(query(Map.of("materialLotText", "L1", "teamText", "B")).path("total").asInt()).isZero();
        ObjectNode matched = query(Map.of("equipmentText", "E1", "materialLotText", "L1", "teamText", "A"));
        assertThat(matched.path("total").asInt()).isEqualTo(1);
        assertThat(matched.path("records").get(0).path("hits")).hasSize(3);
        assertThat(matched.path("records").get(0).path("hits").findValuesAsText("rowKey")).doesNotContain("row-two");
        var reversed = form();
        var bindings = (com.fasterxml.jackson.databind.node.ArrayNode) reversed.path("projection").path("bindings");
        java.util.List<com.fasterxml.jackson.databind.JsonNode> ordered = new java.util.ArrayList<>(); bindings.forEach(ordered::add);
        java.util.Collections.reverse(ordered); bindings.removeAll(); ordered.forEach(bindings::add);
        save(reversed, values(), "ACTIVE");
        var reordered = query(Map.of("equipmentText", "E1", "materialLotText", "L1", "teamText", "A"));
        assertThat(reordered.path("total").asInt()).isEqualTo(1);
        assertThat(reordered.path("records").get(0).path("hits")).isEqualTo(matched.path("records").get(0).path("hits"));
    }

    @Test void savedContentAndDhrUseRealOwnerAndDoNotLeakOtherTenant() throws Exception {
        save(form(), values(), "ACTIVE");
        jdbc.update("INSERT INTO dhr_instance VALUES(1,'DHR-OWNER','ACTIVE',100,'default'),(2,'DHR-CONTENT','ACTIVE',200,'default'),(3,'DHR-OTHER','ACTIVE',100,'other')");
        assertThat(query(Map.of("lookup_production_batch", "B-CONTENT")).path("records").get(0).path("objectNo").asText()).isEqualTo("B-OWNER");
        assertThat(reports.instanceDhr(1).getData()).hasSize(1).first().extracting(row -> row.get("dhrNo")).isEqualTo("DHR-OWNER");
        assertThat(reports.instanceSource(1).getData().path("context").path("objectNo").asText()).isEqualTo("B-OWNER");
        assertThat(reports.instanceSource(1).getData().path("values").path("batch").asText()).isEqualTo("B-CONTENT");
        jdbc.update("INSERT INTO form_instance_record(id,tenant_id,snapshot_json,values_json,status,updated_at) VALUES(2,'other',?,?,'ACTIVE',CURRENT_TIMESTAMP)", form().toString(), values().toString());
        tx.executeWithoutResult(ignored -> new FormTraceIndexService(jdbc, mapper).refresh(2, "other", uncheckedForm(), uncheckedValues()));
        assertThat(query(Map.of("materialLotText", "L1")).path("total").asInt()).isEqualTo(1);
        assertThatThrownBy(() -> reports.instanceSource(2)).hasMessageContaining("不存在");
        assertThat(reports.instanceDhr(2).getData()).isEmpty();
    }

    private ObjectNode uncheckedForm() { try { return form(); } catch (Exception ex) { throw new IllegalStateException(ex); } }
    private ObjectNode uncheckedValues() { try { return values(); } catch (Exception ex) { throw new IllegalStateException(ex); } }

    @Test void failedIndexWriteRollsBackSavedContentAndIndexTogether() throws Exception {
        save(form(), values(), "ACTIVE");
        jdbc.execute("ALTER TABLE form_trace_value ADD CONSTRAINT simulated_failure CHECK(value_text<>'reject')");
        ObjectNode changed = values(); changed.put("equipment", "reject");
        assertThatThrownBy(() -> save(uncheckedForm(), changed, "ACTIVE")).isInstanceOf(RuntimeException.class);
        assertThat(query(Map.of("equipmentText", "E1")).path("total").asInt()).isEqualTo(1);
        assertThat(reports.instanceSource(1).getData().path("values").path("equipment").asText()).isEqualTo("E1");
    }

    @Test void productionObjectCandidatesSupportInputFilterAndKeepTenantAndLiteralWildcardBoundaries() {
        jdbc.update("INSERT INTO work_order VALUES(1,'default','WO-ONE'),(2,'other','WO-OTHER')");
        jdbc.update("INSERT INTO production_object VALUES(1,'default',1,'B001','BATCH'),(2,'default',1,'SN001','SN'),(3,'other',2,'B002','BATCH'),(4,'default',2,'BAD-TENANT-JOIN','BATCH'),(5,'default',1,'B%PERCENT','BATCH')");
        assertThat(reports.productionObjectOptions("001").getData()).hasSize(2);
        assertThat(reports.productionObjectOptions("WO-ONE").getData()).hasSize(3);
        assertThat(reports.productionObjectOptions("%").getData()).hasSize(1).first().extracting(row -> row.get("code")).isEqualTo("B%PERCENT");
        assertThat(reports.productionObjectOptions("").getData()).hasSize(3);
        assertThat(reports.productionObjectOptions("WO-OTHER").getData()).isEmpty();
    }

    @Test void unconfiguredStatisticalSourcesAreExcludedAndMigrationUsesFrozenSavedMappings() throws Exception {
        ObjectNode configured = form();
        ((ObjectNode) configured.path("projection").path("bindings").get(0)).put("modelId", "consumption");
        save(configured, values(), "ACTIVE");
        assertThat(query(Map.of("lookup_production_batch", "B-CONTENT")).path("total").asInt()).isZero();
        jdbc.update("DELETE FROM form_trace_value");
        // Re-run the baseline INSERT only, representing an already saved MVP instance at migration time.
        String migration = new ClassPathResource("db/changelog/0109-saved-form-trace-index.sql").getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        jdbc.execute(migration.substring(migration.indexOf("WITH bindings AS")));
        assertThat(query(Map.of("lookup_production_batch", "B-CONTENT")).path("total").asInt()).isZero();
        assertThat(query(Map.of("materialLotText", "L1", "teamText", "A")).path("total").asInt()).isEqualTo(1);
        assertThat(query(Map.of("materialLotText", "L1", "teamText", "B")).path("total").asInt()).isZero();
    }

    @Test void realEngineRowsKeepTheirIdentityFromSavedTraceThroughCompletionAndFailedProjectionRetry() throws Exception {
        var actualProjection = useRealProjection();
        var engine = projectionEngine(); var snapshot = projectionSnapshot(); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "1");
        projectionAction(engine, snapshot, state, "SAVE", projectionValues());
        var saved = state.at("/operations/op/forms/form/values").deepCopy();
        String first = saved.at("/details/0/__rowId").asText(), second = saved.at("/details/1/__rowId").asText();
        assertThat(UUID.fromString(first).toString()).isEqualTo(first);
        assertThat(second).isNotEqualTo(first);
        String instanceNo = reports.instanceSource(1).getData().path("instanceNo").asText();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();

        // Reopen the serialized engine state, then save the same actual rows in the opposite order.
        state = (ObjectNode) mapper.readTree(state.toString());
        var reordered = (ObjectNode) saved.deepCopy();
        reordered.set("details", mapper.createArrayNode().add(saved.path("details").get(1)).add(saved.path("details").get(0)));
        projectionAction(engine, snapshot, state, "SAVE", reordered);
        var hits = query(Map.of("materialLotText", "L1")).at("/records/0/hits");
        assertThat(hits).hasSize(1);
        assertThat(hits.get(0).path("rowKey").asText()).isEqualTo(first);
        assertThat(hits.get(0).path("rowIndex").asInt()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();

        projectionAction(engine, snapshot, state, "SUBMIT", reordered);
        assertThat(jdbc.queryForObject("SELECT status FROM form_instance_record WHERE id=1", String.class)).isEqualTo("COMPLETED");
        long batchId = jdbc.queryForObject("SELECT id FROM form_projection_batch", Long.class);
        String frozen = jdbc.queryForObject("SELECT source_json::text FROM form_projection_batch", String.class);
        assertThat(mapper.readTree(frozen).at("/values/details/1/__rowId").asText()).isEqualTo(first);
        assertThat(reports.query(new FormProjectionController.Query("production", null, null, Map.of(), 0, 20, null, null))
                .getData().path("total").asInt()).isZero();

        jdbc.execute("ALTER TABLE form_projection_record ADD CONSTRAINT simulated_detail_failure CHECK(binding_id<>'detail-stat')");
        assertThatThrownBy(() -> tx.executeWithoutResult(ignored -> actualProjection.process(batchId))).isInstanceOf(RuntimeException.class);
        actualProjection.failed(batchId);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT status FROM form_projection_batch", String.class)).isEqualTo("FAILED");
        assertThat(jdbc.queryForObject("SELECT status FROM form_instance_record WHERE id=1", String.class)).isEqualTo("COMPLETED");
        jdbc.execute("ALTER TABLE form_projection_record DROP CONSTRAINT simulated_detail_failure");
        tx.executeWithoutResult(ignored -> reports.retry(batchId, Map.of("reason", "模拟故障恢复，保留冻结来源")));
        tx.executeWithoutResult(ignored -> actualProjection.process(batchId));
        tx.executeWithoutResult(ignored -> actualProjection.process(batchId));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_record", Integer.class)).isEqualTo(3);
        assertThat(jdbc.queryForObject("SELECT attempts FROM form_projection_batch", Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT source_json::text FROM form_projection_batch", String.class)).isEqualTo(frozen);
        assertThat(reports.instanceSource(1).getData().path("instanceNo").asText()).isEqualTo(instanceNo);
        var result = reports.query(new FormProjectionController.Query("production", null, null, Map.of(), 0, 20, null, null)).getData();
        assertThat(result.path("records")).hasSize(3);
        // The main 5 is an independent report, not a subtotal of the two detail reports (2 and 3).
        assertThat(result.at("/totals/0/goodQuantity").decimalValue()).isEqualByComparingTo("10");
        for (var record : result.path("records")) {
            assertThat(record.path("instanceId").asText()).isEqualTo("1");
            if ("main-stat".equals(record.path("bindingId").asText())) {
                assertThat(record.path("rowKey").asText()).isEqualTo("form");
                assertThat(record.at("/sources/goodQuantity").asText()).isEqualTo("mainQty");
            } else {
                assertThat(record.path("rowKey").asText()).isIn(first, second);
                assertThat(record.path("rowIndex").asInt()).isEqualTo(record.path("rowKey").asText().equals(first) ? 1 : 0);
                assertThat(record.at("/sources/goodQuantity").asText()).isEqualTo("qty");
            }
        }
    }

    @Test void finalBusinessPrecheckRollsBackTheSavedRecordAndTraceIndexTogether() throws Exception {
        useRealProjection();
        var engine = projectionEngine(); var snapshot = projectionSnapshot(); var state = engine.initialState(snapshot);
        engine.start(snapshot, state, "op", "1");
        projectionAction(engine, snapshot, state, "SAVE", projectionValues());
        String savedJson = jdbc.queryForObject("SELECT values_json FROM form_instance_record WHERE id=1", String.class);
        var attemptedState = (ObjectNode) mapper.readTree(state.toString());
        var invalid = (ObjectNode) state.at("/operations/op/forms/form/values").deepCopy();
        invalid.put("equipment", "REJECTED").put("mainQty", -1);
        assertThatThrownBy(() -> projectionAction(engine, snapshot, attemptedState, "SUBMIT", invalid)).hasMessageContaining("非负数字");
        assertThat(jdbc.queryForObject("SELECT status FROM form_instance_record WHERE id=1", String.class)).isEqualTo("ACTIVE");
        assertThat(jdbc.queryForObject("SELECT values_json FROM form_instance_record WHERE id=1", String.class)).isEqualTo(savedJson);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();
        assertThat(query(Map.of("equipmentText", "E1")).path("total").asInt()).isEqualTo(1);
        assertThat(query(Map.of("equipmentText", "REJECTED")).path("total").asInt()).isZero();
        assertThat(reports.instanceSource(1).getData().path("values")).isEqualTo(mapper.readTree(savedJson));
    }

    private FormProjectionService useRealProjection() throws Exception {
        try (var connection = dataSource.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0108-form-lookup-items.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0110-projection-detail-display.sql"));
        }
        var actualProjection = new FormProjectionService(jdbc, mapper);
        records = new FormInstanceRecordService(jdbc, mapper, actualProjection);
        return actualProjection;
    }

    private ProductionExecutionEngine projectionEngine() {
        var access = mock(ExecutionAccess.class);
        when(access.canAct(any(), any(), any(), any())).thenReturn(true);
        when(access.permissions(any(), any(), any(), any())).thenReturn(mapper.createObjectNode()
                .put("equipment", "EDIT").put("mainQty", "EDIT").put("mainUnit", "EDIT").put("details", "EDIT"));
        return new ProductionExecutionEngine(mapper, access);
    }

    private ObjectNode projectionSnapshot() throws Exception {
        return (ObjectNode) mapper.readTree("""
                {"context":{"objectId":"100","objectNo":"B-OWNER","objectType":"BATCH","workOrderId":"500","workOrderNo":"WO1"},
                 "routeNodes":[{"id":"op","type":"OPERATION"}],"routeEdges":[],
                 "operations":[{"id":"op","name":"工序A","type":"OPERATION","works":[],"forms":[
                   {"id":"form","versionId":"20","version":"V1","code":"F1","name":"主子表贯通验证","fields":[
                     {"id":"equipment","name":"设备编号","type":"text"},{"id":"mainQty","name":"主表报工","type":"number"},{"id":"mainUnit","name":"主表单位","type":"text"},
                     {"id":"details","name":"报工明细","type":"subTable","typeConfig":{"columns":[
                       {"id":"lot","name":"物料批号","type":"text"},{"id":"qty","name":"明细报工","type":"number"},{"id":"detailUnit","name":"明细单位","type":"text"}]}}],
                   "projection":{"version":"form-projection-v1","bindings":[
                     {"id":"head","modelId":"formTrace","enabled":true,"sources":{"equipmentText":"equipment"}},
                     {"id":"detail","modelId":"formTrace","enabled":true,"tableId":"details","sources":{"materialLotText":"lot"}},
                     {"id":"main-stat","modelId":"production","enabled":true,"sources":{"goodQuantity":"mainQty","unit":"mainUnit"}},
                     {"id":"detail-stat","modelId":"production","enabled":true,"tableId":"details","sources":{"goodQuantity":"qty","unit":"detailUnit"}}]}}]}]}
                """);
    }

    private ObjectNode projectionValues() throws Exception {
        return (ObjectNode) mapper.readTree("""
                {"equipment":"E1","mainQty":5,"mainUnit":"件","details":[
                  {"lot":"L1","qty":2,"detailUnit":"件"},{"lot":"L2","qty":3,"detailUnit":"件"}]}
                """);
    }

    private void projectionAction(ProductionExecutionEngine engine, ObjectNode snapshot, ObjectNode state, String action, ObjectNode values) {
        tx.executeWithoutResult(ignored -> {
            engine.formAction(snapshot, state, "op", "form", action, values, null, null, null, "1");
            records.saved(100L, "default", snapshot, state, "op", "form", null);
        });
    }
}
