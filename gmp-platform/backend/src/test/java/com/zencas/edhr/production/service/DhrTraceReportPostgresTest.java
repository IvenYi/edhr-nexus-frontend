package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Query SQL uses disposable schemas; verified detail reading is delegated to the existing DHR reader. */
@EnabledIfEnvironmentVariable(named = "PROJECTION_TEST_DATABASE_URL", matches = "jdbc:postgresql://localhost:5432/edhr_(form_projection|projection_integration_test)")
class DhrTraceReportPostgresTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private JdbcTemplate admin, jdbc;
    private String schema;
    private DhrInstanceService reader;
    private DhrTraceReportService reports;
    private ObjectNode terminated;

    @BeforeEach void setup() {
        String url = System.getenv("PROJECTION_TEST_DATABASE_URL");
        String user = System.getenv().getOrDefault("PROJECTION_DATABASE_USER", "edhr");
        String password = System.getenv().getOrDefault("PROJECTION_DATABASE_PASSWORD", "edhr_dev_pwd");
        admin = new JdbcTemplate(new DriverManagerDataSource(url, user, password));
        schema = "dhr_trace_test_" + UUID.randomUUID().toString().replace("-", ""); admin.execute("CREATE SCHEMA " + schema);
        jdbc = new JdbcTemplate(new DriverManagerDataSource(url + "?currentSchema=" + schema, user, password));
        jdbc.execute("CREATE TABLE dhr_instance(id bigint PRIMARY KEY,tenant_id text,production_object_id bigint,dhr_no text,object_no text,object_type text,work_order_no text,product_code text,product_name text,status text,summary_status text,created_by text,created_at timestamp)");
        jdbc.execute("CREATE TABLE form_instance_record(id bigint PRIMARY KEY,tenant_id text,object_id bigint,source_type text,snapshot_json text,values_json text)");
        jdbc.execute("CREATE TABLE form_trace_value(tenant_id text,form_instance_id bigint,item_id text,field_id text,field_name text,table_id text,row_key text,row_index int,value_text text,value_type text NOT NULL DEFAULT 'text')");
        jdbc.update("INSERT INTO dhr_instance VALUES(1,'default',100,'DHR1','OWNER1','BATCH','WO1','P1','产品1','IN_PROGRESS','NOT_STARTED','人员1','2026-10-10'),(2,'default',200,'DHR2','OWNER2','SN','WO1','P1','产品1','COMPLETED','FORMALIZED','人员2','2026-10-11'),(3,'default',300,'DHR3','OWNER3','BATCH','WO2','P2','产品2','EARLY_TERMINATED','NOT_STARTED','人员1','2026-10-12'),(4,'other',400,'PRIVATE','OTHER','SN','WO1','P1','产品1','IN_PROGRESS','NOT_STARTED','人员1','2026-10-10')");
        reader = mock(DhrInstanceService.class);
        when(reader.header(anyLong())).thenAnswer(call -> mapper.createObjectNode().put("id", call.<Long>getArgument(0).toString()));
        when(reader.detail(anyLong())).thenAnswer(call -> {
            long id = call.getArgument(0);
            if (id == 3 && terminated != null) return terminated.deepCopy();
            ObjectNode detail = mapper.createObjectNode().put("id", Long.toString(id)).put("status", "IN_PROGRESS");
            detail.putObject("directorySnapshot").putArray("directories").addObject().put("name", "完整目录");
            ObjectNode origins = detail.putObject("recordsByOrigin");
            ArrayNode records = origins.putArray("directory"); origins.putArray("work"); origins.putArray("custom");
            jdbc.queryForList("SELECT id,snapshot_json,values_json FROM form_instance_record WHERE tenant_id='default' AND source_type='PRODUCTION_EXECUTION' AND object_id=? ORDER BY id", id * 100).forEach(row -> {
                try {
                    ObjectNode record = records.addObject().put("id", row.get("id").toString()).put("instanceNo", "F" + row.get("id")).put("templateName", "来源表单");
                    record.set("snapshot", mapper.readTree(row.get("snapshot_json").toString()));
                    record.set("fieldValues", mapper.readTree(row.get("values_json").toString()));
                } catch (Exception ex) { throw new IllegalStateException(ex); }
            });
            return detail;
        });
        reports = new DhrTraceReportService(jdbc, mapper, reader);
    }
    @AfterEach void cleanup() { if (schema != null) admin.execute("DROP SCHEMA " + schema + " CASCADE"); }

    private ObjectNode form(String item) {
        ObjectNode form = mapper.createObjectNode();
        form.putArray("fields").addObject().put("id", "value").put("name", "登记字段").put("type", "text");
        if (item != null) form.putObject("projection").putArray("bindings").addObject().put("id", "trace").put("modelId", "formTrace").put("enabled", true).putObject("sources").put(item, "value");
        return form;
    }
    private void save(long id, long owner, String item, String value, String tenant) {
        ObjectNode form = form(item), values = mapper.createObjectNode().put("value", value);
        jdbc.update("INSERT INTO form_instance_record VALUES(?,?,?,'PRODUCTION_EXECUTION',?,?)", id, tenant, owner, form.toString(), values.toString());
        new FormTraceIndexService(jdbc, mapper).refresh(id, tenant, form, values);
    }

    @Test void crossFormConditionsMatchOneRealDhrAndDetailKeepsUnmatchedForms() {
        save(11, 100, "materialLotText", "M001", "default");
        save(12, 100, "equipmentText", "E01", "default");
        save(13, 100, null, "普通备注", "default");
        save(21, 200, "equipmentText", "E01", "default");
        save(41, 400, "materialLotText", "M001", "other");
        save(42, 400, "equipmentText", "E01", "other");
        var filters = Map.of("materialLotText", "M001", "equipmentText", "E01");
        var found = reports.query(true, Map.of(), filters, 0, 20);
        assertThat(found.path("total").asInt()).isEqualTo(1);
        assertThat(found.at("/records/0/id").asText()).isEqualTo("1");
        assertThat(found.at("/records/0/hitFormCount").asInt()).isEqualTo(2);
        var detail = reports.detail(1, true, filters);
        assertThat(detail.at("/recordsByOrigin/directory")).hasSize(3);
        assertThat(detail.path("traceHits").findValuesAsText("instanceId")).containsExactly("11", "12");
        assertThat(detail.at("/traceHits/0/hits/0/sources/materialLotText").asText()).isEqualTo("value");
        assertThat(detail.path("traceConditionsSatisfied").asBoolean()).isTrue();
        assertThat(detail.path("traceEvidenceBasis").asText()).isEqualTo("CURRENT_SAVED");
        assertThat(reports.detail(2, true, filters).path("traceConditionsSatisfied").asBoolean()).isFalse();
        assertThat(reports.detail(1, false, Map.of()).path("traceHits")).isEmpty();
    }

    @Test void terminatedQueriesAndDetailUseSameFrozenValuesInsteadOfLiveIndex() {
        save(31, 300, "equipmentText", "E-OLD", "default");
        terminated = reader.detail(3L).deepCopy().put("status", "EARLY_TERMINATED").put("terminationSnapshotAvailable", true);
        jdbc.update("UPDATE form_instance_record SET values_json=? WHERE id=31", "{\"value\":\"E-NEW\"}");
        new FormTraceIndexService(jdbc, mapper).refresh(31, "default", form("equipmentText"), mapper.createObjectNode().put("value", "E-NEW"));
        assertThat(reports.query(true, Map.of(), Map.of("equipmentText", "E-NEW"), 0, 20).path("total").asInt()).isZero();
        assertThat(reports.query(true, Map.of(), Map.of("equipmentText", "E-OLD"), 0, 20).at("/records/0/id").asText()).isEqualTo("3");
        var detail = reports.detail(3, true, Map.of("equipmentText", "E-OLD"));
        assertThat(detail.path("traceEvidenceBasis").asText()).isEqualTo("TERMINATION_SNAPSHOT");
        assertThat(detail.at("/traceHits/0/hits/0/attributes/equipmentText").asText()).isEqualTo("E-OLD");
        assertThat(detail.at("/recordsByOrigin/directory/0/fieldValues/value").asText()).isEqualTo("E-OLD");
    }

    @Test void forwardFiltersDoNotDependOnAnyContentIndexAndPaginationIsDeduplicated() {
        var page = reports.query(false, Map.of("productCode", "P1", "workOrderNo", "WO1"), Map.of(), 0, 1);
        assertThat(page.path("total").asInt()).isEqualTo(2);
        assertThat(page.at("/records/0/id").asText()).isEqualTo("2");
        assertThat(reports.query(false, Map.of("productCode", "P1"), Map.of(), 1, 1).at("/records/0/id").asText()).isEqualTo("1");
        assertThat(reports.query(false, Map.of("createdDateFrom", "2026-10-10", "createdDateTo", "2026-10-10"), Map.of(), 0, 20).path("total").asInt()).isEqualTo(1);
        save(11, 100, "equipmentText", "E01", "default"); save(12, 100, "equipmentText", "E01", "default"); save(21, 200, "equipmentText", "E01", "default");
        var reverse = reports.query(true, Map.of(), Map.of("equipmentText", "E01"), 1, 1);
        assertThat(reverse.path("total").asInt()).isEqualTo(2);
        assertThat(reverse.at("/records/0/id").asText()).isEqualTo("1");
        assertThat(reverse.at("/records/0/hitFormCount").asInt()).isEqualTo(2);
        assertThatThrownBy(() -> reports.query(false, Map.of("materialLotText", "M001"), Map.of(), 0, 20)).hasMessageContaining("不受支持");
    }

    @Test void typedCrossFormAndTerminatedMatchesUseTheSameNumericAndDatePredicates() {
        ObjectNode numeric = form("lookup_reading"), dated = form("lookup_day");
        ((ObjectNode) numeric.at("/fields/0")).put("type", "number");
        numeric.withObject("/projection/lookupItems/lookup_reading").put("type", "number");
        ((ObjectNode) dated.at("/fields/0")).put("type", "datetime").putObject("typeConfig").put("mode", "date");
        dated.withObject("/projection/lookupItems/lookup_day").put("type", "date");
        for (long owner : List.of(100L, 300L)) {
            long id = owner + 1;
            var reading = mapper.createObjectNode().put("value", new java.math.BigDecimal("1.00"));
            var day = mapper.createObjectNode().put("value", "2026-10-14");
            jdbc.update("INSERT INTO form_instance_record VALUES(?,'default',?,'PRODUCTION_EXECUTION',?,?)", id, owner, numeric.toString(), reading.toString());
            jdbc.update("INSERT INTO form_instance_record VALUES(?,'default',?,'PRODUCTION_EXECUTION',?,?)", id + 1, owner, dated.toString(), day.toString());
            new FormTraceIndexService(jdbc, mapper).refresh(id, "default", numeric, reading);
            new FormTraceIndexService(jdbc, mapper).refresh(id + 1, "default", dated, day);
        }
        terminated = reader.detail(3L).deepCopy().put("status", "EARLY_TERMINATED").put("terminationSnapshotAvailable", true);
        new FormTraceIndexService(jdbc, mapper).refresh(302, "default", dated, mapper.createObjectNode().put("value", "2026-10-15"));
        var filters = List.of(new TraceCondition("lookup_reading", "number", "1", null, null), new TraceCondition("lookup_day", "date", null, "2026-10-14", "2026-10-14"));
        var result = reports.query(true, Map.of(), filters, 0, 20);
        assertThat(result.path("total").asInt()).isEqualTo(2);
        assertThat(result.path("records").findValuesAsText("hitFormCount")).containsOnly("2");
        assertThat(reports.detail(3, true, filters).path("traceConditionsSatisfied").asBoolean()).isTrue();
        assertThat(reports.detail(3, true, List.of(new TraceCondition("lookup_day", "date", null, "2026-10-15", null))).path("traceConditionsSatisfied").asBoolean()).isFalse();
    }
}
