package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.production.controller.FormProjectionController;
import com.zencas.edhr.production.service.FormTraceIndexService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.mockito.ArgumentCaptor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.ExecutionException;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named = "PROJECTION_TEST_DATABASE_URL", matches = "jdbc:postgresql://localhost:5432/edhr_(form_projection|projection_integration_test)")
class FormLookupCatalogPostgresTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private JdbcTemplate admin, jdbc;
    private TransactionTemplate tx;
    private FormLookupCatalogService catalog;
    private FormTraceIndexService trace;
    private FormProjectionController reports;
    private AuditEventRepository audits;
    private String schema;

    @BeforeEach void setup() throws Exception {
        String url = System.getenv("PROJECTION_TEST_DATABASE_URL");
        String user = System.getenv().getOrDefault("PROJECTION_DATABASE_USER", "edhr");
        String password = System.getenv().getOrDefault("PROJECTION_DATABASE_PASSWORD", "edhr_dev_pwd");
        admin = new JdbcTemplate(new DriverManagerDataSource(url, user, password));
        schema = "lookup_test_" + UUID.randomUUID().toString().replace("-", "");
        admin.execute("CREATE SCHEMA " + schema);
        var ds = new DriverManagerDataSource(url + "?currentSchema=" + schema, user, password);
        jdbc = new JdbcTemplate(ds); tx = new TransactionTemplate(new DataSourceTransactionManager(ds));
        jdbc.execute("CREATE TABLE form_instance_record(id BIGINT PRIMARY KEY,tenant_id text default 'default',instance_no text,object_id bigint default 1,object_no text default 'B1',operation_id text default 'a',operation_name text default 'A',created_by text,created_at timestamp,updated_by text,updated_at timestamp,snapshot_json text default '{}',values_json text default '{}',status text default 'ACTIVE',template_name text,template_version text)");
        jdbc.execute("CREATE TABLE form_template(id BIGINT PRIMARY KEY,tenant_id text default 'default',name text)");
        jdbc.execute("CREATE TABLE form_template_version(id BIGINT PRIMARY KEY,template_id bigint,tenant_id text default 'default',version_label text,model_design_json text,canvas_design_json text default '{}',workflow_design_json text default '{}',lock_version bigint default 0,updated_by text,updated_at timestamp)");
        jdbc.update("INSERT INTO form_template(id,name) VALUES(10,'虚构检测表')");
        jdbc.update("INSERT INTO form_instance_record(id,instance_no) VALUES(1,'NEW'),(2,'OLD')");
        try (var connection = ds.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0107-form-projection-runtime.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0108-form-lookup-items.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0109-saved-form-trace-index.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0110-projection-detail-display.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0111-form-instance-saved-stage.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0112-typed-trace-catalog.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0113-trace-date-preset.sql"));
        }
        jdbc.execute("ALTER TABLE form_instance_record ADD COLUMN source_type text NOT NULL DEFAULT 'PRODUCTION_EXECUTION'");
        jdbc.execute("ALTER TABLE form_instance_record ADD COLUMN work_order_no text");
        audits = mock(AuditEventRepository.class);
        var ids = mock(SnowflakeIdGenerator.class);
        AtomicLong sequence = new AtomicLong(100);
        when(ids.nextId()).thenAnswer(invocation -> sequence.incrementAndGet());
        catalog = new FormLookupCatalogService(jdbc, mapper, ids, audits);
        trace = new FormTraceIndexService(jdbc, mapper);
        reports = new FormProjectionController(jdbc, mapper, audits, ids, catalog);
    }
    @AfterEach void cleanup() { if (schema != null) admin.execute("DROP SCHEMA " + schema + " CASCADE"); }
    private FormLookupCatalogService.Item create() {
        return tx.execute(status -> catalog.create(new FormLookupCatalogService.WriteRequest("灭菌锅次", "填写实际锅次编号", null)));
    }
    private ObjectNode form(String key) {
        ObjectNode form = mapper.createObjectNode();
        form.putArray("fields").addObject().put("id", "number").put("type", "text").put("name", "灭菌锅次");
        form.putObject("projection").put("version", FormProjectionInterpreter.VERSION).putArray("bindings")
                .addObject().put("id", "trace").put("enabled", true).put("modelId", "formTrace").putObject("sources").put(key, "number");
        return form;
    }
    private ObjectNode query(String key, String value) {
        return reports.query(new FormProjectionController.Query("formTrace", null, null, Map.of(key, value), 0, 20, null, null)).getData();
    }
    private void save(long id, ObjectNode form) {
        save(id, form, mapper.createObjectNode().put("number", "P-001"));
    }
    private void save(long id, ObjectNode form, ObjectNode values) {
        tx.executeWithoutResult(status -> {
            jdbc.update("UPDATE form_instance_record SET snapshot_json=?,values_json=?,status='ACTIVE',updated_at=CURRENT_TIMESTAMP WHERE id=?",
                    form.toString(), values.toString(), id);
            trace.refresh(id, "default", form, values);
        });
    }

    @Test void newItemIsAvailableWithoutAnyBindingOrHitAndWritesAudit() {
        var item = create();
        assertThat(catalog.projectionCatalog().path("models").get(0).path("attributes").toString()).contains(item.id(), "灭菌锅次");
        assertThat(query(item.id(), "P-001").path("total").asInt()).isZero();
        ArgumentCaptor<AuditEvent> audit = ArgumentCaptor.forClass(AuditEvent.class);
        verify(audits).save(audit.capture());
        assertThat(audit.getValue().getEntityType()).isEqualTo("FORM_LOOKUP_ITEM");
        assertThat(audit.getValue().getContentAfter()).contains(item.id(), "灭菌锅次");
    }

    @Test void migrationKeepsNineDistinctPresetsAndRetiresAmbiguousMvpDefinitions() {
        assertThat(catalog.list()).filteredOn(FormLookupCatalogService.Item::builtin).extracting(FormLookupCatalogService.Item::id)
                .containsExactlyInAnyOrder("materialLotText", "equipmentText", "lookup_production_batch", "lookup_work_order",
                        "lookup_material_code", "lookup_product_code", "lookup_supplier_lot", "lookup_order_number", "lookup_trace_date");
        assertThat(catalog.list()).noneMatch(item -> item.id().equals("serialNumberText") || item.id().equals("lookup_related_batch"));
        assertThatThrownBy(() -> catalog.prepareDesign(form("serialNumberText").toString())).hasMessageContaining("已退出目录");
    }

    @Test void businessSourcesDoNotDependOnRetiredTraceCatalogItems() throws Exception {
        ObjectNode model = mapper.createObjectNode();
        var fields = model.putArray("fields");
        fields.addObject().put("id", "quantity").put("type", "number");
        fields.addObject().put("id", "document").put("type", "text");
        fields.addObject().put("id", "team").put("type", "text");
        model.putObject("projection").put("version", FormProjectionInterpreter.VERSION).putArray("bindings")
                .addObject().put("id", "production").put("enabled", true).put("modelId", "production")
                .putObject("sources").put("goodQuantity", "quantity").put("documentNumberText", "document").put("teamText", "team");
        var prepared = mapper.readTree(catalog.prepareDesign(model.toString()));
        assertThat(prepared.path("projection").path("bindings").get(0).path("sources")).isEqualTo(model.path("projection").path("bindings").get(0).path("sources"));
        assertThat(prepared.path("projection").has("lookupItems")).isFalse();
    }

    @Test void traceDatePresetIsProtectedTypedAndOnlyQueriesExplicitlyBoundDates() throws Exception {
        var preset = catalog.list().stream().filter(item -> item.id().equals("lookup_trace_date")).findFirst().orElseThrow();
        assertThat(preset.type()).isEqualTo("date");
        assertThat(preset.builtin()).isTrue();
        assertThatThrownBy(() -> tx.execute(status -> { catalog.delete(preset.id(), preset.revision()); return null; })).hasMessageContaining("预置追溯项不可删除");
        assertThatThrownBy(() -> catalog.prepareDesign(form(preset.id()).toString())).hasMessageContaining("日期字段");

        ObjectNode model = form(preset.id());
        ((ObjectNode) model.path("fields").get(0)).put("type", "datetime").putObject("typeConfig").put("mode", "date");
        model = (ObjectNode) mapper.readTree(catalog.prepareDesign(model.toString()));
        save(1, model, mapper.createObjectNode().put("number", "2026-10-14"));
        save(2, model, mapper.createObjectNode());
        jdbc.update("UPDATE form_instance_record SET created_at='2026-10-14 12:00:00' WHERE id=2");
        var exact = com.zencas.edhr.production.service.TraceCondition.parse(Map.of(),
                Map.of(preset.id(), new com.zencas.edhr.production.service.TraceCondition.DateRange("2026-10-14", "2026-10-14")), catalog.list());
        var found = trace.query(null, null, null, null, exact, 0, 20);
        assertThat(found.path("total").asInt()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_trace_value WHERE form_instance_id=2 AND item_id='lookup_trace_date'", Integer.class)).isZero();
        var after = com.zencas.edhr.production.service.TraceCondition.parse(Map.of(),
                Map.of(preset.id(), new com.zencas.edhr.production.service.TraceCondition.DateRange("2026-10-15", null)), catalog.list());
        assertThat(trace.query(null, null, null, null, after, 0, 20).path("total").asInt()).isZero();
    }

    @Test void traceDateUpgradeAndReplayPreserveExistingCustomDatesAndSavedEvidence() throws Exception {
        jdbc.update("DELETE FROM form_lookup_item WHERE id='lookup_trace_date'");
        var custom = tx.execute(status -> catalog.create(new FormLookupCatalogService.WriteRequest("原有生产日期", "原有自定义项", null, "date")));
        ObjectNode model = form(custom.id());
        ((ObjectNode) model.path("fields").get(0)).put("type", "datetime").putObject("typeConfig").put("mode", "date");
        model = (ObjectNode) mapper.readTree(catalog.prepareDesign(model.toString()));
        save(1, model, mapper.createObjectNode().put("number", "2026-10-14"));
        var records = jdbc.queryForList("SELECT * FROM form_instance_record ORDER BY id");
        var evidence = jdbc.queryForList("SELECT * FROM form_trace_value");
        var existing = catalog.list();
        try (var connection = jdbc.getDataSource().getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0113-trace-date-preset.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0113-trace-date-preset.sql"));
        }
        assertThat(catalog.list()).containsAll(existing).hasSize(existing.size() + 1);
        assertThat(jdbc.queryForList("SELECT * FROM form_instance_record ORDER BY id")).isEqualTo(records);
        assertThat(jdbc.queryForList("SELECT * FROM form_trace_value")).isEqualTo(evidence);
    }

    private void design(long versionId, ObjectNode root) {
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_label,model_design_json) VALUES(?,10,?,?)", versionId, "V" + versionId, root.toString());
    }
    private java.util.List<FormLookupCatalogService.BindingSelection> selections(java.util.List<FormLookupCatalogService.Binding> rows) {
        return rows.stream().map(row -> new FormLookupCatalogService.BindingSelection(Long.parseLong(row.versionId()), row.revision(), row.bindingId(), row.fieldId())).toList();
    }

    @Test void customDeletionProtectsPresetsRevisionsAndHistoricalEvidence() {
        var item = create();
        var preset = catalog.list().stream().filter(FormLookupCatalogService.Item::builtin).findFirst().orElseThrow();
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.delete(preset.id(), preset.revision()))).hasMessageContaining("预置");
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.delete(item.id(), item.revision() + 1))).hasMessageContaining("已被修改");
        ObjectNode frozen = (ObjectNode) catalog.withLookupSnapshot(form(item.id()));
        save(1, frozen);
        tx.executeWithoutResult(status -> catalog.delete(item.id(), item.revision()));
        assertThat(catalog.contains(item.id())).isFalse();
        assertThat(jdbc.queryForObject("SELECT snapshot_json FROM form_instance_record WHERE id=1", String.class)).isEqualTo(frozen.toString());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_trace_value WHERE item_id=?", Integer.class, item.id())).isEqualTo(1);
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.delete(item.id(), item.revision()))).hasMessageContaining("不存在");
        ArgumentCaptor<AuditEvent> audit = ArgumentCaptor.forClass(AuditEvent.class);
        verify(audits, times(2)).save(audit.capture());
        assertThat(audit.getValue().getAction()).isEqualTo("DELETE");
        assertThat(audit.getValue().getContentBefore()).contains(item.id());
        assertThat(audit.getValue().getContentAfter()).isNull();
    }

    @Test void mainSubtableAndAllVersionsCanBeSelectivelyUnlinkedWithoutChangingOtherBusiness() {
        var item = create();
        ObjectNode main = form(item.id());
        ((ObjectNode) main.at("/projection/bindings/0/sources")).put("materialLotText", "other");
        main.withArray("fields").addObject().put("id", "other").put("type", "text").put("name", "其他编号");
        main.withArray("fields").addObject().put("id", "qty").put("type", "number").put("name", "用量");
        ((com.fasterxml.jackson.databind.node.ArrayNode) main.at("/projection/bindings")).addObject().put("id", "stats").put("modelId", "production").put("enabled", true).putObject("sources").put("goodQuantity", "qty");
        design(20, main);
        ObjectNode tableModel = form(item.id());
        ((ObjectNode) tableModel.at("/projection/bindings/0")).put("tableId", "details").put("enabled", false);
        var tableFields = mapper.createArrayNode();
        var columns = mapper.createArrayNode(); columns.addObject().put("id", "number").put("name", "锅次列").put("type", "text");
        tableFields.addObject().put("id", "details").put("name", "检验明细").put("type", "subTable").putObject("typeConfig").set("columns", columns);
        tableModel.set("fields", tableFields);
        ObjectNode wrapper = mapper.createObjectNode().put("format", "kept"); wrapper.set("payload", tableModel);
        design(21, wrapper);
        var rows = catalog.bindings(item.id());
        assertThat(rows).hasSize(2).extracting(FormLookupCatalogService.Binding::location).containsExactly("主表", "子表 · 检验明细");
        assertThat(catalog.preview(item.id(), 20, "trace", "number").modelDesignJson()).contains(item.id(), "goodQuantity");
        assertThat(catalog.preview(item.id(), 21, "trace", "number").modelDesignJson()).contains("锅次列");
        assertThatThrownBy(() -> catalog.preview(item.id(), 21, "trace", "other")).hasMessageContaining("配置已变化");
        assertThatThrownBy(() -> catalog.preview(item.id(), 21, "trace", "")).hasMessageContaining("选择无效");
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.delete(item.id(), item.revision()))).hasMessageContaining("关联配置");
        tx.executeWithoutResult(status -> catalog.unlink(item.id(), selections(rows.subList(0, 1))));
        assertThat(catalog.bindings(item.id())).hasSize(1);
        assertThatThrownBy(() -> catalog.preview(item.id(), 20, "trace", "number")).hasMessageContaining("配置已变化");
        var saved = jdbc.queryForObject("SELECT model_design_json FROM form_template_version WHERE id=20", String.class);
        assertThat(saved).contains("materialLotText", "stats", "goodQuantity").doesNotContain(item.id());
        assertThat(jdbc.queryForObject("SELECT canvas_design_json FROM form_template_version WHERE id=20", String.class)).isEqualTo("{}");
        tx.executeWithoutResult(status -> catalog.unlink(item.id(), selections(catalog.bindings(item.id()))));
        assertThat(catalog.bindings(item.id())).isEmpty();
        assertThat(jdbc.queryForObject("SELECT model_design_json FROM form_template_version WHERE id=21", String.class)).contains("kept", "锅次列").doesNotContain(item.id());
        tx.executeWithoutResult(status -> catalog.delete(item.id(), item.revision()));
        assertThat(catalog.contains(item.id())).isFalse();
        ArgumentCaptor<AuditEvent> audit = ArgumentCaptor.forClass(AuditEvent.class);
        verify(audits, times(4)).save(audit.capture());
        assertThat(audit.getAllValues()).filteredOn(event -> "FORM_TEMPLATE_VERSION".equals(event.getEntityType())).hasSize(2)
                .allSatisfy(event -> assertThat(event.getContentBefore()).contains("modelDesignJson", item.id()));
    }

    @Test void staleBatchSelectionRollsBackEveryVersionAndMetadataAloneDoesNotBlockDeletion() {
        var item = create(); design(20, form(item.id())); design(21, form(item.id()));
        var rows = catalog.bindings(item.id());
        jdbc.update("UPDATE form_template_version SET lock_version=1 WHERE id=21");
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.unlink(item.id(), selections(rows)))).hasMessageContaining("配置已变化");
        assertThat(catalog.bindings(item.id())).hasSize(2);
        assertThat(jdbc.queryForObject("SELECT lock_version FROM form_template_version WHERE id=20", Long.class)).isZero();
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.unlink(item.id(), java.util.List.of()))).hasMessageContaining("请勾选");
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.unlink(item.id(), java.util.List.of(new FormLookupCatalogService.BindingSelection(20, 0, "trace", ""))))).hasMessageContaining("选择无效");
        var repeated = selections(catalog.bindings(item.id()).subList(0, 1));
        assertThatThrownBy(() -> tx.executeWithoutResult(status -> catalog.unlink(item.id(), java.util.List.of(repeated.getFirst(), repeated.getFirst())))).hasMessageContaining("重复");
        tx.executeWithoutResult(status -> catalog.unlink(item.id(), selections(catalog.bindings(item.id()))));
        jdbc.update("UPDATE form_template_version SET model_design_json=? WHERE id=20", "{\"projection\":{\"lookupItems\":{\"" + item.id() + "\":{\"name\":\"旧元数据\"}}}}");
        assertThat(catalog.bindings(item.id())).isEmpty();
        tx.executeWithoutResult(status -> catalog.delete(item.id(), item.revision()));
    }

    private static void await(CountDownLatch latch) {
        try { if (!latch.await(5, TimeUnit.SECONDS)) throw new IllegalStateException("Transaction coordination timed out"); }
        catch (InterruptedException ex) { Thread.currentThread().interrupt(); throw new IllegalStateException(ex); }
    }

    @Test void committedNewBindingBlocksConcurrentDeletion() throws Exception {
        var item = create();
        var pool = Executors.newFixedThreadPool(2);
        var prepared = new CountDownLatch(1); var release = new CountDownLatch(1); var deleting = new CountDownLatch(1);
        try {
            var save = pool.submit(() -> tx.executeWithoutResult(status -> {
                String json = catalog.prepareDesign(form(item.id()).toString());
                prepared.countDown(); await(release);
                jdbc.update("INSERT INTO form_template_version(id,template_id,version_label,model_design_json) VALUES(20,10,'V1',?)", json);
            }));
            await(prepared);
            var delete = pool.submit(() -> { deleting.countDown(); tx.executeWithoutResult(status -> catalog.delete(item.id(), item.revision())); });
            await(deleting);
            assertThatThrownBy(() -> delete.get(150, TimeUnit.MILLISECONDS)).isInstanceOf(TimeoutException.class);
            release.countDown(); save.get(5, TimeUnit.SECONDS);
            assertThatThrownBy(() -> delete.get(5, TimeUnit.SECONDS)).isInstanceOf(ExecutionException.class).hasCauseInstanceOf(com.zencas.edhr.common.exception.BusinessException.class)
                    .cause().hasMessageContaining("关联配置");
            assertThat(catalog.contains(item.id())).isTrue();
            assertThat(catalog.bindings(item.id())).hasSize(1);
        } finally { release.countDown(); pool.shutdownNow(); }
    }

    @Test void committedDeletionRejectsConcurrentNewBinding() throws Exception {
        var item = create();
        var pool = Executors.newFixedThreadPool(2);
        var deleted = new CountDownLatch(1); var release = new CountDownLatch(1); var saving = new CountDownLatch(1);
        try {
            var delete = pool.submit(() -> tx.executeWithoutResult(status -> {
                catalog.delete(item.id(), item.revision()); deleted.countDown(); await(release);
            }));
            await(deleted);
            var save = pool.submit(() -> { saving.countDown(); return tx.execute(status -> catalog.prepareDesign(form(item.id()).toString())); });
            await(saving);
            assertThatThrownBy(() -> save.get(150, TimeUnit.MILLISECONDS)).isInstanceOf(TimeoutException.class);
            release.countDown(); delete.get(5, TimeUnit.SECONDS);
            assertThatThrownBy(() -> save.get(5, TimeUnit.SECONDS)).isInstanceOf(ExecutionException.class).hasCauseInstanceOf(com.zencas.edhr.common.exception.BusinessException.class)
                    .cause().hasMessageContaining("不存在");
            assertThat(catalog.contains(item.id())).isFalse();
        } finally { release.countDown(); pool.shutdownNow(); }
    }

    @Test void typedItemsFreezeTypesAndOnlyAcceptMatchingFieldSources() throws Exception {
        var number = tx.execute(status -> catalog.create(new FormLookupCatalogService.WriteRequest("实测温度", "", null, "number")));
        var date = tx.execute(status -> catalog.create(new FormLookupCatalogService.WriteRequest("检验日期", "", null, "date")));
        ObjectNode model = form(number.id());
        ((ObjectNode) model.path("fields").get(0)).put("type", "number");
        var fields = (com.fasterxml.jackson.databind.node.ArrayNode) model.path("fields");
        fields.addObject().put("id", "day").put("name", "检验日期").put("type", "datetime").putObject("typeConfig").put("mode", "date");
        ((ObjectNode) model.at("/projection/bindings/0/sources")).put(date.id(), "day");
        var prepared = mapper.readTree(catalog.prepareDesign(model.toString()));
        assertThat(prepared.at("/projection/lookupItems/" + number.id() + "/type").asText()).isEqualTo("number");
        assertThat(prepared.at("/projection/lookupItems/" + date.id() + "/type").asText()).isEqualTo("date");
        assertThat(FormProjectionInterpreter.preview(prepared, mapper.readTree("{\"number\":-2.50,\"day\":\"2026-10-14\"}")).get(0).path("attributes").path(number.id()).asText()).isEqualTo("-2.5");
        assertThatThrownBy(() -> catalog.update(number.id(), new FormLookupCatalogService.WriteRequest(number.name(), "", number.revision(), "text"))).hasMessageContaining("不可修改");
        assertThatThrownBy(() -> catalog.prepareDesign(form(number.id()).toString())).hasMessageContaining("数字字段");
        ((ObjectNode) model.path("fields").get(1).path("typeConfig")).put("mode", "datetime");
        assertThatThrownBy(() -> catalog.prepareDesign(model.toString())).hasMessageContaining("日期字段");
        assertThatThrownBy(() -> catalog.create(new FormLookupCatalogService.WriteRequest("错误类型", "", null, "reference"))).hasMessageContaining("文本、数字或日期");
        ArgumentCaptor<AuditEvent> audit = ArgumentCaptor.forClass(AuditEvent.class);
        verify(audits, times(2)).save(audit.capture());
        assertThat(audit.getAllValues().get(0).getContentAfter()).contains("\"type\":\"number\"");
    }

    @Test void typedSavedValuesQuerySameActualRowWithNumericNormalizationAndDateBounds() throws Exception {
        var number = tx.execute(status -> catalog.create(new FormLookupCatalogService.WriteRequest("检测值", "", null, "number")));
        var date = tx.execute(status -> catalog.create(new FormLookupCatalogService.WriteRequest("检测日期", "", null, "date")));
        ObjectNode model = (ObjectNode) mapper.readTree("""
                {"fields":[{"id":"details","type":"subTable","typeConfig":{"columns":[
                 {"id":"reading","type":"number"},{"id":"day","type":"datetime","typeConfig":{"mode":"date"}}]}}],
                 "projection":{"version":"form-projection-v1","bindings":[{"id":"trace","modelId":"formTrace","enabled":true,"tableId":"details","sources":{}}]}}
                """);
        ((ObjectNode) model.at("/projection/bindings/0/sources")).put(number.id(), "reading").put(date.id(), "day");
        model = (ObjectNode) mapper.readTree(catalog.prepareDesign(model.toString()));
        save(1, model, (ObjectNode) mapper.readTree("""
                {"details":[{"__rowId":"first","reading":5.00,"day":"2026-10-10"},
                {"__rowId":"second","reading":7,"day":"2026-10-11"},
                {"__rowId":"draft","reading":"bad","day":"2026-02-30"}]}
                """));
        var conditions = com.zencas.edhr.production.service.TraceCondition.parse(Map.of(number.id(), "5.0"),
                Map.of(date.id(), new com.zencas.edhr.production.service.TraceCondition.DateRange("2026-10-10", "2026-10-10")), catalog.list());
        var found = trace.query(null, null, null, null, conditions, 0, 20);
        assertThat(found.path("total").asInt()).isEqualTo(1);
        assertThat(found.at("/records/0/hits").findValuesAsText("rowKey")).containsOnly("first");
        assertThat(found.at("/records/0/hits").findValuesAsText("rowIndex")).containsOnly("0");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_trace_value WHERE row_key='draft'", Integer.class)).isZero();
        assertThat(query(number.id(), "5.00").path("total").asInt()).isEqualTo(1);
        var cross = com.zencas.edhr.production.service.TraceCondition.parse(Map.of(number.id(), "5"),
                Map.of(date.id(), new com.zencas.edhr.production.service.TraceCondition.DateRange("2026-10-11", null)), catalog.list());
        assertThat(trace.query(null, null, null, null, cross, 0, 20).path("total").asInt()).isZero();
    }

    @Test void duplicateNamesConcurrencyAndAuditFailureDoNotOverwriteDefinitions() {
        var item = create();
        assertThatThrownBy(this::create).hasMessageContaining("已存在");
        var renamed = tx.execute(status -> catalog.update(item.id(), new FormLookupCatalogService.WriteRequest("锅次编号", "显示名称调整", item.revision())));
        assertThat(renamed.revision()).isEqualTo(2);
        assertThatThrownBy(() -> tx.execute(status -> catalog.update(item.id(), new FormLookupCatalogService.WriteRequest("旧操作覆盖", "", item.revision()))))
                .hasMessageContaining("已被修改");
        assertThat(catalog.list()).anyMatch(row -> row.id().equals(item.id()) && row.name().equals("锅次编号"));
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any());
        assertThatThrownBy(() -> tx.execute(status -> catalog.create(new FormLookupCatalogService.WriteRequest("供应商凭证", "", null))))
                .hasMessageContaining("audit unavailable");
        assertThat(catalog.list()).noneMatch(row -> row.name().equals("供应商凭证"));
    }

    @Test void explicitBindingProducesSavedHitsAndDirectoryRenamePreservesInstanceLookupSnapshot() throws Exception {
        var item = create();
        ObjectNode configured = (ObjectNode) catalog.withLookupSnapshot(form(item.id()));
        ObjectNode old = form("materialLotText");
        save(1, configured); save(2, old);
        var result = query(item.id(), "P-001");
        assertThat(result.path("total").asInt()).isEqualTo(1);
        assertThat(result.path("records").get(0).path("instanceNo").asText()).isEqualTo("NEW");
        assertThat(result.path("records").get(0).path("hits").get(0).path("sources").path(item.id()).asText()).isEqualTo("number");
        assertThat(query("materialLotText", "P-001").path("total").asInt()).isEqualTo(1);
        tx.execute(status -> catalog.update(item.id(), new FormLookupCatalogService.WriteRequest("锅次编号", "", item.revision())));
        assertThat(configured.path("projection").path("lookupItems").path(item.id()).path("name").asText()).isEqualTo("灭菌锅次");
        assertThat(query(item.id(), "P-001").path("total").asInt()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT snapshot_json::jsonb->'projection'->'lookupItems'->?->>'name' FROM form_instance_record WHERE id=1", String.class, item.id())).isEqualTo("灭菌锅次");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM form_projection_batch", Integer.class)).isZero();
    }

    @Test void snapshotCannotBeForgedAndCustomMeaningDoesNotBecomeStatisticalAttribute() throws Exception {
        var item = create();
        ObjectNode draft = form(item.id());
        ((ObjectNode) draft.path("projection")).putObject("lookupItems").putObject(item.id()).put("name", "伪造对象").put("type", "reference");
        ObjectNode prepared = (ObjectNode) mapper.readTree(catalog.prepareDesign(draft.toString()));
        assertThat(prepared.path("projection").path("lookupItems").path(item.id()).path("type").asText()).isEqualTo("text");
        assertThat(prepared.path("projection").path("lookupItems").path(item.id()).path("name").asText()).isEqualTo("灭菌锅次");
        assertThatCode(() -> FormProjectionInterpreter.validate(prepared)).doesNotThrowAnyException();
        assertThatThrownBy(() -> catalog.withLookupSnapshot(form("lookup_missing"))).hasMessageContaining("不存在");
        assertThatThrownBy(() -> query("lookup_missing", "x")).hasMessageContaining("不受支持");
        assertThatThrownBy(() -> FormProjectionInterpreter.preview(prepared, mapper.readTree("{\"number\":{\"id\":\"1\",\"name\":\"物料\"}}")))
                .hasMessageContaining("类型不正确");
        ((ObjectNode) prepared.path("projection").path("bindings").get(0)).put("modelId", "production");
        ((com.fasterxml.jackson.databind.node.ArrayNode) prepared.path("fields")).addObject().put("id", "unit").put("type", "text");
        ((com.fasterxml.jackson.databind.node.ArrayNode) prepared.path("fields")).addObject().put("id", "qty").put("type", "number");
        ((ObjectNode) prepared.path("projection").path("bindings").get(0).path("sources")).put("unit", "unit").put("goodQuantity", "qty");
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(prepared)).hasMessageContaining("不支持的查询属性");
        String ordinary = "{\"fields\":[{\"id\":\"number\",\"type\":\"text\"}]}";
        assertThat(catalog.prepareDesign(ordinary)).isEqualTo(ordinary);
    }

    @Test void catalogNeverLeaksOtherTenantDefinitions() {
        jdbc.update("INSERT INTO form_lookup_item(tenant_id,id,name) VALUES('other','lookup_other','其他租户')");
        assertThat(catalog.contains("lookup_other")).isFalse();
        assertThat(catalog.list()).noneMatch(item -> item.id().equals("lookup_other"));
        assertThatThrownBy(() -> catalog.withLookupSnapshot(form("lookup_other"))).hasMessageContaining("不存在");
    }

    @Test void textAndNativeBatchNumbersShareLookupWithoutChangingContextOrDuplicatingForms() throws Exception {
        String key = "lookup_production_batch";
        var nativeModel = form(key);
        ((ObjectNode) nativeModel.path("fields").get(0)).put("type", "reference").putObject("typeConfig").put("sourceType", "productionBatch");
        ObjectNode prepared = (ObjectNode) catalog.withLookupSnapshot(nativeModel);
        assertThat(prepared.path("projection").path("lookupItems").path(key).path("referenceSources").get(0).asText()).isEqualTo("productionBatch");
        ObjectNode raw = (ObjectNode) mapper.readTree("{\"number\":{\"id\":\"999\",\"sourceType\":\"productionBatch\",\"code\":\"P-001\",\"name\":\"显示工单号\"}}");
        save(1, prepared, raw);
        save(2, (ObjectNode) catalog.withLookupSnapshot(form(key)));
        assertThat(query(key, "P-001").path("total").asInt()).isEqualTo(2);
        assertThat(query(key, "显示工单号").path("total").asInt()).isZero();
        // Duplicate content hits remain evidence, not a second form or a production association.
        ObjectNode repeated = prepared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) repeated.path("fields")).addObject().put("id", "otherNumber").put("type", "reference")
                .putObject("typeConfig").put("sourceType", "productionBatch");
        ((com.fasterxml.jackson.databind.node.ArrayNode) repeated.path("projection").path("bindings")).addObject()
                .put("id", "another").put("enabled", true).put("modelId", "formTrace").putObject("sources").put(key, "otherNumber");
        ObjectNode repeatedValues = raw.deepCopy(); repeatedValues.set("otherNumber", raw.path("number").deepCopy());
        save(1, repeated, repeatedValues);
        assertThat(query(key, "P-001").path("total").asInt()).isEqualTo(2);
        for (var record : query(key, "P-001").path("records"))
            if (record.path("instanceNo").asText().equals("NEW")) assertThat(record.path("hits")).hasSize(2);
        assertThat(jdbc.queryForObject("SELECT object_id FROM form_instance_record WHERE id=1", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT values_json::jsonb->'number'->>'id' FROM form_instance_record WHERE id=1", String.class)).isEqualTo("999");
        assertThat(jdbc.queryForObject("SELECT values_json::jsonb->'number'->>'name' FROM form_instance_record WHERE id=1", String.class)).isEqualTo("显示工单号");
        assertThat(FormProjectionInterpreter.preview(prepared, raw).get(0).path("attributes").path(key).asText()).isEqualTo("P-001");
    }

    @Test void serverSnapshotRejectsForgedCustomReferenceCompatibility() {
        var item = create();
        ObjectNode draft = form(item.id());
        ((ObjectNode) draft.path("fields").get(0)).put("type", "reference").putObject("typeConfig").put("sourceType", "productionBatch");
        ((ObjectNode) draft.path("projection")).putObject("lookupItems").putObject(item.id()).put("type", "text").put("name", "伪造含义").putArray("referenceSources").add("productionBatch");
        ObjectNode prepared = (ObjectNode) catalog.withLookupSnapshot(draft);
        assertThat(prepared.path("projection").path("lookupItems").path(item.id()).path("referenceSources").isEmpty()).isTrue();
        assertThatThrownBy(() -> FormProjectionInterpreter.validate(prepared)).hasMessageContaining("不匹配");
    }

    @Test void legacyLookupNamesFreezeOnNewSaveAndReportsNeverReadCurrentAliases() throws Exception {
        var item = catalog.list().stream().filter(row -> row.id().equals("materialLotText")).findFirst().orElseThrow();
        ObjectNode before = (ObjectNode) mapper.readTree(catalog.prepareDesign(form(item.id()).toString()));
        save(1, before);
        // An existing legacy snapshot has no catalog definition and remains untouched.
        save(2, form(item.id()));
        tx.execute(status -> catalog.update(item.id(), new FormLookupCatalogService.WriteRequest("物料批号（记录别名）", "", item.revision())));
        var records = query(item.id(), "P-001").path("records");
        for (var record : records) {
            if (record.path("instanceNo").asText().equals("NEW")) {
                assertThat(record.path("lookupItems").path(item.id()).path("name").asText()).isEqualTo(item.name());
            } else assertThat(record.path("lookupItems").isEmpty()).isTrue();
        }
        ObjectNode after = (ObjectNode) mapper.readTree(catalog.prepareDesign(form(item.id()).toString()));
        assertThat(after.path("projection").path("lookupItems").path(item.id()).path("name").asText()).isEqualTo("物料批号（记录别名）");
        assertThat(before.path("projection").path("lookupItems").path(item.id()).path("name").asText()).isEqualTo(item.name());
    }

    @Test void customSubtableFiltersMatchOneRowAndPreserveItsLocation() throws Exception {
        var item = create();
        ObjectNode model = (ObjectNode) mapper.readTree("""
            {"fields":[{"id":"details","type":"subTable","typeConfig":{"columns":[
              {"id":"key","type":"text"},{"id":"pot","type":"text"},{"id":"device","type":"singleSelect"}]}}],
             "projection":{"version":"form-projection-v1","bindings":[{"id":"trace","enabled":true,
              "modelId":"formTrace","tableId":"details","sources":{"equipmentText":"device"}}]}}
            """);
        ((ObjectNode) model.path("projection").path("bindings").get(0).path("sources")).put(item.id(), "pot");
        ObjectNode prepared = (ObjectNode) catalog.withLookupSnapshot(model);
        ObjectNode values = (ObjectNode) mapper.readTree("""
            {"details":[{"__rowId":"00000000-0000-4000-8000-000000000001","key":"1","pot":"P-001","device":"E1"},{"__rowId":"00000000-0000-4000-8000-000000000002","key":"2","pot":"P-002","device":"E2"}]}
            """);
        assertThat(query(item.id(), "P-001").path("total").asInt()).isZero();
        save(1, prepared, values);
        assertThat(query(item.id(), "P-001").path("total").asInt()).isEqualTo(1);
        var crossRow = new FormProjectionController.Query("formTrace", null, null, Map.of(item.id(), "P-001", "equipmentText", "E2"), 0, 20, null, null);
        assertThat(reports.query(crossRow).getData().path("total").asInt()).isZero();
        var sameRow = new FormProjectionController.Query("formTrace", null, null, Map.of(item.id(), "P-001", "equipmentText", "E1"), 0, 20, null, null);
        var hits = reports.query(sameRow).getData().path("records").get(0).path("hits");
        var hit = java.util.stream.StreamSupport.stream(hits.spliterator(), false)
                .filter(candidate -> candidate.path("sources").has(item.id())).findFirst().orElseThrow();
        assertThat(hit.path("rowKey").asText()).isEqualTo("00000000-0000-4000-8000-000000000001");
        assertThat(hit.path("rowIndex").asInt()).isZero();
        assertThat(hit.path("tableId").asText()).isEqualTo("details");
        assertThat(hit.path("sources").path(item.id()).asText()).isEqualTo("pot");
    }

    @Test void prepareDesignRejectsIncompleteStatisticsEvenWhenLegacyEnabledFlagIsFalse() throws Exception {
        var incomplete = mapper.readTree("""
                {"fields":[{"id":"qty","type":"number"}],"projection":{"version":"form-projection-v1","bindings":[
                {"id":"business","modelId":"consumption","enabled":false,"sources":{"quantity":"qty"}}]}}
                """);
        assertThatThrownBy(() -> catalog.prepareDesign(incomplete.toString())).hasMessageContaining("物料及数量来源");
    }

    @Test void prepareDesignMakesCompleteStatisticsActiveWithoutAnotherEnableAction() throws Exception {
        ObjectNode complete = (ObjectNode) mapper.readTree("""
                {"fields":[{"id":"qty","type":"number"}],"projection":{"version":"form-projection-v1","bindings":[
                {"id":"business","modelId":"production","enabled":false,"rowKeyFieldId":"old-customer-key","sources":{"goodQuantity":"qty"}}]}}
                """);
        var prepared = mapper.readTree(catalog.prepareDesign(complete.toString()));
        assertThat(prepared.path("projection").path("bindings").get(0).path("enabled").asBoolean()).isTrue();
        assertThat(prepared.path("projection").path("bindings").get(0).has("rowKeyFieldId")).isFalse();
        assertThat(prepared.path("projection").path("bindings").get(0).path("sources").path("goodQuantity").asText()).isEqualTo("qty");
        assertThatCode(() -> FormProjectionInterpreter.validate(prepared)).doesNotThrowAnyException();
        ObjectNode wrapper = mapper.createObjectNode().put("version", 1); wrapper.set("payload", complete);
        var wrappedPrepared = mapper.readTree(catalog.prepareDesign(wrapper.toString())).path("payload");
        assertThat(wrappedPrepared).isEqualTo(prepared);
    }
}
