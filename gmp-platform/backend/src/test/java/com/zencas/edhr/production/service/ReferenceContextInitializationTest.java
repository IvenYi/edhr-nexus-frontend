package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import com.zencas.edhr.template.service.FormReferenceLookup;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ReferenceContextInitializationTest {
    final ObjectMapper mapper = new ObjectMapper();
    final ExecutionAccess access = mock(ExecutionAccess.class);
    final ProductionExecutionEngine engine = new ProductionExecutionEngine(mapper, access);

    @Test void createsReferencesFromActualContextAndKeepsDefaultsForNewRowsAndCopies() throws Exception {
        ObjectNode snapshot = snapshot(false);
        when(access.contextReference(any(), anyString(), any())).thenAnswer(call -> mapper.createObjectNode()
                .put("id", call.<String>getArgument(1)).put("name", "真实对象").put("code", "C-1")
                .put("sourceType", call.<JsonNode>getArgument(0).path("sourceType").asText()));
        when(access.canAct(any(), any(), any(), any())).thenReturn(true);
        ObjectNode state = engine.initialState(snapshot);
        engine.start(snapshot, state, "route-node", "1");
        JsonNode form = state.at("/operations/route-node/forms/form");
        assertThat(form.at("/values/batch/id").asText()).isEqualTo("101");
        assertThat(form.at("/values/wo/id").asText()).isEqualTo("10");
        assertThat(form.at("/values/product/id").asText()).isEqualTo("20");
        assertThat(form.at("/values/op/id").asText()).isEqualTo("30");
        assertThat(form.at("/referenceDefaults/rowProduct/id").asText()).isEqualTo("20");
        assertThat(form.path("values").has("table")).isFalse();
        assertThat(form.at("/values/sn").isMissingNode()).isTrue();
        assertThat(form.at("/referenceContextWarnings/sn").asText()).contains("没有适配");
        assertThat(form.at("/referenceContextWarnings/equipment").asText()).contains("没有适配");
        verify(access).contextReference(argThat(c -> "operation".equals(c.path("sourceType").asText())), eq("30"), any());
        engine.addFormCopy(snapshot, state, "route-node", "form", "1", "第二份");
        assertThat(state.at("/operations/route-node/forms/form:copy:2/values/product/id").asText()).isEqualTo("20");
    }

    @Test void sharedBatchFormsNeverAcquireViewedOperationAndMissingCandidatesStayEmpty() throws Exception {
        ObjectNode snapshot = snapshot(true);
        ObjectNode state = engine.initialState(snapshot);
        engine.start(snapshot, state, "route-node", "1");
        JsonNode form = state.at("/operations/route-node/forms/form");
        assertThat(form.at("/values/op").isMissingNode()).isTrue();
        assertThat(form.at("/referenceContextWarnings/op").asText()).contains("没有适配");
        assertThat(form.at("/referenceContextWarnings/product").asText()).contains("不符合引用候选");
        verify(access, never()).contextReference(argThat(c -> "operation".equals(c.path("sourceType").asText())), anyString(), any());
    }

    @Test void initializationLeavesManualValuesAndDoesNotRefreshExistingCopy() throws Exception {
        ObjectNode snapshot = snapshot(false);
        JsonNode op = snapshot.path("operations").get(0), form = op.path("forms").get(0);
        ObjectNode state = mapper.createObjectNode();
        state.putObject("values").putObject("product").put("id", "999").put("name", "人工选择");
        when(access.contextReference(any(), anyString(), any())).thenReturn(mapper.createObjectNode().put("id", "20").put("name", "上下文产品"));
        ReflectionTestUtils.invokeMethod(engine, "initializeForm", snapshot, op, form, state);
        assertThat(state.at("/values/product/id").asText()).isEqualTo("999");
        JsonNode defaults = state.path("referenceDefaults").deepCopy();
        clearInvocations(access);
        ((ObjectNode) snapshot.path("context")).put("productId", "88");
        ReflectionTestUtils.invokeMethod(engine, "initializeForm", snapshot, op, form, state);
        assertThat(state.at("/values/product/id").asText()).isEqualTo("999");
        assertThat(state.path("referenceDefaults")).isEqualTo(defaults);
        verifyNoInteractions(access);
    }

    @Test void dependentContextReferencesResolveInEitherFieldOrderWithoutRefreshingExistingCopies() throws Exception {
        JdbcTemplate jdbc = referenceDatabase();
        try {
            FormReferenceLookup lookup = new FormReferenceLookup(jdbc);
            when(access.contextReference(any(), anyString(), any())).thenAnswer(call -> {
                var selected = lookup.find(call.getArgument(0), call.getArgument(1), call.getArgument(2));
                return selected == null ? null : mapper.valueToTree(selected);
            });
            when(access.canAct(any(), any(), any(), any())).thenReturn(true);
            for (boolean batchFirst : new boolean[]{true, false}) {
                ObjectNode snapshot = dependentSnapshot(batchFirst);
                ObjectNode state = engine.initialState(snapshot);
                engine.start(snapshot, state, "route-node", "1");
                ObjectNode current = (ObjectNode) state.at("/operations/route-node/forms/form");
                assertThat(current.at("/values/batch/code").asText()).as("batchFirst=%s", batchFirst).isEqualTo("B101");
                assertThat(current.at("/values/wo/code").asText()).isEqualTo("WO10");
                assertThat(current.path("referenceContextWarnings").isEmpty()).isTrue();
                assertThat(current.at("/referenceDefaults/batch/code").asText()).isEqualTo("B101");
                ((ObjectNode) current.path("values")).putNull("batch");
                JsonNode defaults = current.path("referenceDefaults").deepCopy();
                clearInvocations(access);
                JsonNode operation = snapshot.path("operations").get(0), form = operation.path("forms").get(0);
                ReflectionTestUtils.invokeMethod(engine, "initializeForm", snapshot, operation, form, current);
                assertThat(current.at("/values/batch").isNull()).isTrue();
                assertThat(current.path("referenceDefaults")).isEqualTo(defaults);
                verifyNoInteractions(access);
                engine.addFormCopy(snapshot, state, "route-node", "form", "1", "第二份");
                assertThat(state.at("/operations/route-node/forms/form:copy:2/values/batch/code").asText()).isEqualTo("B101");
                assertThat(current.at("/values/batch").isNull()).isTrue();
            }
        } finally { jdbc.execute("DROP ALL OBJECTS"); }
    }

    @Test void cyclicContextDependenciesRemainEmptyWithoutGuessingOrUnboundedRetries() throws Exception {
        JdbcTemplate jdbc = referenceDatabase();
        try {
            FormReferenceLookup lookup = new FormReferenceLookup(jdbc);
            when(access.contextReference(any(), anyString(), any())).thenAnswer(call -> {
                var selected = lookup.find(call.getArgument(0), call.getArgument(1), call.getArgument(2));
                return selected == null ? null : mapper.valueToTree(selected);
            });
            ObjectNode snapshot = dependentSnapshot(true);
            JsonNode fields = snapshot.at("/operations/0/forms/0/fields");
            ((ObjectNode) fields.get(1).path("typeConfig")).putArray("referenceQueryConditions").addObject()
                    .put("sourceField", "productCode").put("operator", "eq").put("targetFieldId", "batch");
            ObjectNode state = engine.initialState(snapshot);
            engine.start(snapshot, state, "route-node", "1");
            JsonNode form = state.at("/operations/route-node/forms/form");
            assertThat(form.path("values").isEmpty()).isTrue();
            assertThat(form.path("referenceDefaults").isEmpty()).isTrue();
            assertThat(form.path("referenceContextWarnings").size()).isEqualTo(2);
            verify(access, times(2)).contextReference(any(), anyString(), any());
        } finally { jdbc.execute("DROP ALL OBJECTS"); }
    }

    @Test void rowDefaultsResolveTheirOwnDependenciesWhileActualRowsKeepTheirOwnValuesAndConditions() throws Exception {
        JdbcTemplate jdbc = referenceDatabase();
        try {
            FormReferenceLookup lookup = new FormReferenceLookup(jdbc);
            when(access.contextReference(any(), anyString(), any())).thenAnswer(call -> {
                var selected = lookup.find(call.getArgument(0), call.getArgument(1), call.getArgument(2));
                return selected == null ? null : mapper.valueToTree(selected);
            });
            ObjectNode snapshot = snapshot(false);
            ((ObjectNode) snapshot.at("/operations/0/forms/0")).set("fields", mapper.readTree("""
                [{"id":"table","type":"subTable","typeConfig":{"columns":[
                 {"id":"rowBatch","type":"reference","typeConfig":{"sourceType":"productionBatch","referenceContextAutofill":true,"referenceQueryConditions":[{"sourceField":"workOrderNo","targetFieldId":"rowWo","operator":"eq"}]}},
                 {"id":"rowWo","type":"reference","typeConfig":{"sourceType":"workOrder","referenceContextAutofill":true}},
                 {"id":"rowOnly","type":"reference","typeConfig":{"sourceType":"productionBatch","referenceContextAutofill":true,"referenceQueryConditions":[{"sourceField":"workOrderNo","targetFieldId":"rowUserOrder","operator":"eq"}]}},
                 {"id":"rowUserOrder","type":"reference","typeConfig":{"sourceType":"workOrder"}}
                ]}}]
                """));
            ObjectNode state = mapper.createObjectNode();
            var rows = state.putObject("values").putArray("table");
            JsonNode sameOrder = mapper.valueToTree(lookup.find(mapper.readTree("{\"sourceType\":\"workOrder\"}"), "10", mapper.createObjectNode()));
            JsonNode otherOrder = mapper.valueToTree(lookup.find(mapper.readTree("{\"sourceType\":\"workOrder\"}"), "11", mapper.createObjectNode()));
            rows.addObject().set("rowUserOrder", sameOrder);
            ObjectNode second = rows.addObject(); second.set("rowWo", otherOrder); second.set("rowUserOrder", otherOrder);
            JsonNode op = snapshot.path("operations").get(0);
            ReflectionTestUtils.invokeMethod(engine, "initializeForm", snapshot, op, op.path("forms").get(0), state);
            assertThat(state.at("/referenceDefaults/rowBatch/code").asText()).isEqualTo("B101");
            assertThat(state.at("/referenceDefaults/rowWo/code").asText()).isEqualTo("WO10");
            assertThat(state.path("referenceDefaults").has("rowOnly")).isFalse();
            assertThat(state.at("/values/table/0/rowBatch/code").asText()).isEqualTo("B101");
            assertThat(state.at("/values/table/0/rowOnly/code").asText()).isEqualTo("B101");
            assertThat(state.at("/values/table/1/rowWo")).isEqualTo(otherOrder);
            assertThat(state.at("/values/table/1/rowBatch").isMissingNode()).isTrue();
            assertThat(state.at("/values/table/1/rowOnly").isMissingNode()).isTrue();
            assertThat(state.at("/values/table/0/rowUserOrder")).isEqualTo(sameOrder);
        } finally { jdbc.execute("DROP ALL OBJECTS"); }
    }

    @Test void unifiedReferencesUseActualObjectScopeAndOnlyExplicitProductScopeCanAutofill() throws Exception {
        JdbcTemplate jdbc = referenceDatabase();
        try {
            FormReferenceLookup lookup = new FormReferenceLookup(jdbc);
            when(access.contextReference(any(), anyString(), any())).thenAnswer(call -> {
                var selected = lookup.find(call.getArgument(0), call.getArgument(1), call.getArgument(2));
                return selected == null ? null : mapper.valueToTree(selected);
            });
            for (String objectType : new String[]{"BATCH", "SN"}) {
                ObjectNode snapshot = snapshot(false);
                ((ObjectNode) snapshot.path("context")).put("objectType", objectType).put("objectId", "BATCH".equals(objectType) ? "101" : "102");
                ObjectNode form = (ObjectNode) snapshot.at("/operations/0/forms/0");
                form.set("fields", mapper.readTree("""
                    [{"id":"object","type":"reference","typeConfig":{"sourceType":"productionObject","referenceProductionScope":"all","referenceContextAutofill":true}},
                     {"id":"batch","type":"reference","typeConfig":{"sourceType":"productionObject","referenceProductionScope":"batch","referenceContextAutofill":true}},
                     {"id":"sn","type":"reference","typeConfig":{"sourceType":"productionObject","referenceProductionScope":"sn","referenceContextAutofill":true}},
                     {"id":"product","type":"reference","typeConfig":{"sourceType":"material","referenceMaterialScope":"product","referenceContextAutofill":true}},
                     {"id":"manualProduct","type":"reference","typeConfig":{"sourceType":"material","referenceMaterialScope":"product","referenceContextAutofill":true}},
                     {"id":"legacyProduct","type":"reference","typeConfig":{"sourceType":"product","referenceContextAutofill":true}},
                     {"id":"material","type":"reference","typeConfig":{"sourceType":"material","referenceMaterialScope":"all","referenceContextAutofill":true}},
                     {"id":"typedMaterial","type":"reference","typeConfig":{"sourceType":"material","referenceMaterialScope":"types","referenceMaterialTypeIds":["1"],"referenceContextAutofill":true}}]
                    """));
                ObjectNode state = mapper.createObjectNode();
                JsonNode manual = mapper.valueToTree(lookup.find(mapper.readTree("{\"sourceType\":\"material\",\"referenceMaterialScope\":\"product\"}"), "23", mapper.createObjectNode()));
                state.putObject("values").set("manualProduct", manual);
                JsonNode operation = snapshot.path("operations").get(0);
                clearInvocations(access);
                ReflectionTestUtils.invokeMethod(engine, "initializeForm", snapshot, operation, form, state);
                assertThat(state.at("/values/object/objectType").asText()).isEqualTo(objectType);
                assertThat(state.at("/values/object/sourceType").asText()).isEqualTo("productionObject");
                String fitting = "BATCH".equals(objectType) ? "batch" : "sn";
                String excluded = "BATCH".equals(objectType) ? "sn" : "batch";
                assertThat(state.at("/values/" + fitting + "/objectType").asText()).isEqualTo(objectType);
                assertThat(state.path("values").has(excluded)).isFalse();
                assertThat(state.path("referenceContextWarnings").path(excluded).asText()).contains("不符合引用候选");
                assertThat(state.at("/values/product/id").asText()).isEqualTo("20");
                assertThat(state.at("/values/product/sourceType").asText()).isEqualTo("material");
                assertThat(state.at("/values/legacyProduct/sourceType").asText()).isEqualTo("product");
                assertThat(state.at("/values/manualProduct")).isEqualTo(manual);
                assertThat(state.at("/referenceDefaults/manualProduct/id").asText()).isEqualTo("20");
                for (String field : new String[]{"material", "typedMaterial"}) {
                    assertThat(state.path("values").has(field)).isFalse();
                    assertThat(state.path("referenceContextWarnings").path(field).asText()).contains("没有适配");
                }
                verify(access, never()).contextReference(argThat(c -> "material".equals(c.path("sourceType").asText())
                        && !"product".equals(c.path("referenceMaterialScope").asText())), anyString(), any());
                state.withObject("/values").putNull("object");
                JsonNode defaults = state.path("referenceDefaults").deepCopy();
                clearInvocations(access);
                ReflectionTestUtils.invokeMethod(engine, "initializeForm", snapshot, operation, form, state);
                assertThat(state.at("/values/object").isNull()).isTrue();
                assertThat(state.path("referenceDefaults")).isEqualTo(defaults);
                verifyNoInteractions(access);
            }
        } finally { jdbc.execute("DROP ALL OBJECTS"); }
    }

    private JdbcTemplate referenceDatabase() {
        JdbcTemplate jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:context-" + java.util.UUID.randomUUID() + ";DB_CLOSE_DELAY=-1", "sa", ""));
        jdbc.execute("CREATE TABLE material_type(id BIGINT,tenant_id VARCHAR,code VARCHAR,name VARCHAR,status VARCHAR)");
        jdbc.execute("CREATE TABLE material(id BIGINT,code VARCHAR,name VARCHAR,specification VARCHAR,material_type_id BIGINT,unit VARCHAR,status VARCHAR)");
        jdbc.execute("CREATE TABLE work_order(id BIGINT,tenant_id VARCHAR,order_no VARCHAR,product_id BIGINT,status VARCHAR)");
        jdbc.execute("CREATE TABLE production_object(id BIGINT,tenant_id VARCHAR,work_order_id BIGINT,object_type VARCHAR,object_no VARCHAR,status VARCHAR)");
        jdbc.update("INSERT INTO material_type VALUES(1,'default','PRODUCT','产成品','ACTIVE'),(2,'default','RAW','原材料','ACTIVE'),(3,'default','SEMI','半成品','ACTIVE')");
        jdbc.update("INSERT INTO material VALUES(20,'P20','导管','A',1,'件','ACTIVE'),(21,'R21','原料','A',2,'根','ACTIVE'),(23,'P23','半成品','A',3,'件','ACTIVE')");
        jdbc.update("INSERT INTO work_order VALUES(10,'default','WO10',20,'CREATED'),(11,'default','WO11',20,'CREATED')");
        jdbc.update("INSERT INTO production_object VALUES(101,'default',10,'BATCH','B101','CREATED'),(102,'default',10,'SN','S102','CREATED')");
        return jdbc;
    }

    private ObjectNode dependentSnapshot(boolean batchFirst) throws Exception {
        ObjectNode snapshot = snapshot(false);
        var fields = ((ObjectNode) snapshot.at("/operations/0/forms/0")).putArray("fields");
        JsonNode batch = mapper.readTree("""
            {"id":"batch","type":"reference","typeConfig":{"sourceType":"productionBatch","referenceContextAutofill":true,
             "referenceQueryConditions":[{"sourceField":"workOrderNo","operator":"eq","targetFieldId":"wo"}]}}
            """);
        JsonNode order = mapper.readTree("{\"id\":\"wo\",\"type\":\"reference\",\"typeConfig\":{\"sourceType\":\"workOrder\",\"referenceContextAutofill\":true}}");
        fields.add(batchFirst ? batch : order).add(batchFirst ? order : batch);
        return snapshot;
    }

    private ObjectNode snapshot(boolean sharedBatch) throws Exception {
        ObjectNode snapshot = (ObjectNode) mapper.readTree("""
            {"context":{"objectId":"101","objectType":"BATCH","workOrderId":"10","productId":"20"},
             "operations":[{"id":"route-node","operationId":"30","name":"清洁","forms":[{"id":"form","name":"记录","fields":[
               {"id":"batch","type":"reference","typeConfig":{"sourceType":"productionBatch","referenceContextAutofill":true}},
               {"id":"sn","type":"reference","typeConfig":{"sourceType":"serialNumber","referenceContextAutofill":true}},
               {"id":"wo","type":"reference","typeConfig":{"sourceType":"workOrder","referenceContextAutofill":true}},
               {"id":"product","type":"reference","typeConfig":{"sourceType":"product","referenceContextAutofill":true}},
               {"id":"op","type":"reference","typeConfig":{"sourceType":"operation","referenceContextAutofill":true}},
               {"id":"equipment","type":"reference","typeConfig":{"sourceType":"equipment","referenceContextAutofill":true}},
               {"id":"manual","type":"reference","typeConfig":{"sourceType":"product"}},
               {"id":"table","type":"subTable","typeConfig":{"columns":[{"id":"rowProduct","type":"reference","typeConfig":{"sourceType":"product","referenceContextAutofill":true}}]}}
             ]}]}]}
            """);
        if (sharedBatch) ((ObjectNode) snapshot.at("/operations/0/forms/0")).put("sourceType", "CUSTOM").put("scope", "BATCH");
        return snapshot;
    }
}
