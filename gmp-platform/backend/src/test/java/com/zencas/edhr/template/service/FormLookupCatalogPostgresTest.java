package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.production.controller.FormProjectionController;
import com.zencas.edhr.production.service.FormProjectionService;
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
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@EnabledIfEnvironmentVariable(named = "PROJECTION_TEST_DATABASE_URL", matches = "jdbc:postgresql://localhost:5432/edhr_form_projection")
class FormLookupCatalogPostgresTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private JdbcTemplate admin, jdbc;
    private TransactionTemplate tx;
    private FormLookupCatalogService catalog;
    private FormProjectionService projection;
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
        jdbc.execute("CREATE TABLE form_instance_record(id BIGINT PRIMARY KEY,tenant_id text default 'default',instance_no text,object_id bigint default 1,object_no text default 'B1',operation_id text default 'a',operation_name text default 'A',created_by text,created_at timestamp,updated_by text,updated_at timestamp)");
        jdbc.update("INSERT INTO form_instance_record(id,instance_no) VALUES(1,'NEW'),(2,'OLD')");
        try (var connection = ds.getConnection()) {
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0107-form-projection-runtime.sql"));
            ScriptUtils.executeSqlScript(connection, new ClassPathResource("db/changelog/0108-form-lookup-items.sql"));
        }
        audits = mock(AuditEventRepository.class);
        var ids = mock(SnowflakeIdGenerator.class);
        AtomicLong sequence = new AtomicLong(100);
        when(ids.nextId()).thenAnswer(invocation -> sequence.incrementAndGet());
        catalog = new FormLookupCatalogService(jdbc, mapper, ids, audits);
        projection = new FormProjectionService(jdbc, mapper);
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
    private void complete(long id, ObjectNode form) {
        tx.executeWithoutResult(status -> projection.completed(id, "default", form,
                mapper.createObjectNode().put("number", "P-001"), mapper.createObjectNode(), "a"));
        Long batchId = jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE form_instance_id=?", Long.class, id);
        tx.executeWithoutResult(status -> projection.process(batchId));
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

    @Test void explicitBindingAloneProducesHitsAndOldSameNamedValuesAreNotBackfilled() throws Exception {
        var item = create();
        ObjectNode configured = (ObjectNode) catalog.withLookupSnapshot(form(item.id()));
        ObjectNode old = form("materialLotText");
        complete(1, configured); complete(2, old);
        var result = query(item.id(), "P-001");
        assertThat(result.path("total").asInt()).isEqualTo(1);
        assertThat(result.path("records").get(0).path("instanceNo").asText()).isEqualTo("NEW");
        assertThat(result.path("records").get(0).path("hits").get(0).path("sources").path(item.id()).asText()).isEqualTo("number");
        assertThat(query("materialLotText", "P-001").path("total").asInt()).isEqualTo(1);
        tx.execute(status -> catalog.update(item.id(), new FormLookupCatalogService.WriteRequest("锅次编号", "", item.revision())));
        assertThat(configured.path("projection").path("lookupItems").path(item.id()).path("name").asText()).isEqualTo("灭菌锅次");
        assertThat(query(item.id(), "P-001").path("total").asInt()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT source_json->'model'->'projection'->'lookupItems'->?->>'name' FROM form_projection_batch WHERE form_instance_id=1", String.class, item.id())).isEqualTo("灭菌锅次");
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
        tx.executeWithoutResult(status -> projection.completed(1, "default", prepared, raw, mapper.createObjectNode().put("objectId", 1), "a"));
        complete(2, (ObjectNode) catalog.withLookupSnapshot(form(key)));
        tx.executeWithoutResult(status -> projection.process(jdbc.queryForObject("SELECT id FROM form_projection_batch WHERE form_instance_id=1", Long.class)));
        assertThat(query(key, "P-001").path("total").asInt()).isEqualTo(2);
        assertThat(query(key, "显示工单号").path("total").asInt()).isZero();
        // Duplicate content hits remain evidence, not a second form or a production association.
        jdbc.update("INSERT INTO form_projection_record(batch_id,binding_id,model_id,row_key,table_id,attributes,sources) SELECT r.batch_id,'another','formTrace','form','',r.attributes,r.sources FROM form_projection_record r JOIN form_projection_batch b ON b.id=r.batch_id WHERE b.form_instance_id=1");
        assertThat(query(key, "P-001").path("total").asInt()).isEqualTo(2);
        assertThat(jdbc.queryForObject("SELECT object_id FROM form_instance_record WHERE id=1", Long.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT source_json->'values'->'number'->>'id' FROM form_projection_batch WHERE form_instance_id=1", String.class)).isEqualTo("999");
        assertThat(jdbc.queryForObject("SELECT source_json->'values'->'number'->>'name' FROM form_projection_batch WHERE form_instance_id=1", String.class)).isEqualTo("显示工单号");
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
        complete(1, before);
        // An existing legacy snapshot has no catalog definition and remains untouched.
        complete(2, form(item.id()));
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
              "modelId":"formTrace","tableId":"details","rowKeyFieldId":"key","sources":{"equipmentText":"device"}}]}}
            """);
        ((ObjectNode) model.path("projection").path("bindings").get(0).path("sources")).put(item.id(), "pot");
        ObjectNode prepared = (ObjectNode) catalog.withLookupSnapshot(model);
        ObjectNode values = (ObjectNode) mapper.readTree("""
            {"details":[{"key":"1","pot":"P-001","device":"E1"},{"key":"2","pot":"P-002","device":"E2"}]}
            """);
        tx.executeWithoutResult(status -> projection.completed(1, "default", prepared, values, mapper.createObjectNode(), "a"));
        assertThat(query(item.id(), "P-001").path("total").asInt()).isZero();
        tx.executeWithoutResult(status -> projection.process(jdbc.queryForObject("SELECT id FROM form_projection_batch", Long.class)));
        var crossRow = new FormProjectionController.Query("formTrace", null, null, Map.of(item.id(), "P-001", "equipmentText", "E2"), 0, 20, null, null);
        assertThat(reports.query(crossRow).getData().path("total").asInt()).isZero();
        var sameRow = new FormProjectionController.Query("formTrace", null, null, Map.of(item.id(), "P-001", "equipmentText", "E1"), 0, 20, null, null);
        var hit = reports.query(sameRow).getData().path("records").get(0).path("hits").get(0);
        assertThat(hit.path("rowKey").asText()).isEqualTo("1");
        assertThat(hit.path("tableId").asText()).isEqualTo("details");
        assertThat(hit.path("sources").path(item.id()).asText()).isEqualTo("pot");
    }
}
