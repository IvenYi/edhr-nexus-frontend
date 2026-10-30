package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.deletion.DeletionCheckController;
import com.zencas.edhr.masterdata.deletion.DeletionProtectionAspect;
import com.zencas.edhr.masterdata.deletion.DeletionProtectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;

/** Owned native PostgreSQL initialized from the unchanged canonical schema; real deletion service, aspect and FK. */
@EnabledIfEnvironmentVariable(named = "EDHR_DOCUMENT_CATEGORY_DATABASE_URL", matches = "jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_document_category_test")
@SpringBootTest(classes = DocumentCategoryAuditPostgresTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.open-in-view=false",
        "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DocumentCategoryAuditPostgresTest {
    private static final String DOCUMENTS = "/api/v1/master-data/documents";
    private static final String CHECK = "/api/v1/master-data/deletion-check/document_category/";
    private static final List<String> TABLES = List.of("document_version", "sop_document", "document_category", "file_object", "audit_event");
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;

    @Configuration(proxyBeanMethods = false)
    @Import({DocumentReadBoundaryIntegrationTest.Config.class, DeletionProtectionService.class,
            DeletionProtectionAspect.class, DeletionCheckController.class})
    static class Config {}

    @DynamicPropertySource
    static void postgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("EDHR_DOCUMENT_CATEGORY_DATABASE_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("EDHR_DOCUMENT_CATEGORY_DATABASE_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("EDHR_DOCUMENT_CATEGORY_DATABASE_PASSWORD"));
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        properties.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        properties.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }

    @BeforeEach
    void seed() {
        jdbc.execute("ALTER TABLE audit_event DROP CONSTRAINT IF EXISTS ck_category_audit_failure");
        for (String table : TABLES) jdbc.update("DELETE FROM " + table);
        jdbc.update("INSERT INTO document_category(id,tenant_id,name,system_category,sort_order) VALUES(201,'default','甲分类',false,30),(202,'default','乙分类',false,40),(203,'default','SOP',true,10),(204,'other','其他租户',false,30)");
        document(101, 201);
    }

    @Test
    void referencedCategoryIsBlockedWithoutMovingDocumentsOrWritingAudit() throws Exception {
        Map<String, String> before = snapshots();
        JsonNode precheck = perform("referenced-precheck", "GET", CHECK + "201", null, "allowed", 200).path("data");
        assertThat(precheck.path("allowed").asBoolean()).isFalse();
        assertThat(precheck.path("impact").path("groups").get(0).path("records").get(0).path("id").asText()).isEqualTo("101");
        assertThat(snapshots()).isEqualTo(before);
        assertThat(perform("referenced-delete", "DELETE", DOCUMENTS + "/categories/201", null, "allowed", 409)
                .path("data").path("kind").asText()).isEqualTo("DELETION_BLOCKED");
        assertThat(snapshots()).isEqualTo(before);
    }

    @Test
    void emptyCategoryDeletesWithAnImmutableAuditAndKeepsOtherDocuments() throws Exception {
        Map<String, String> before = snapshots();
        assertThat(perform("empty-precheck", "GET", CHECK + "202", null, "allowed", 200).path("data").path("allowed").asBoolean()).isTrue();
        assertThat(snapshots()).isEqualTo(before);
        perform("empty-delete", "DELETE", DOCUMENTS + "/categories/202", null, "allowed", 200);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM document_category WHERE id=202", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT category_id FROM sop_document WHERE id=101", Long.class)).isEqualTo(201L);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM document_version", Integer.class)).isEqualTo(1);
        var audits = jdbc.queryForList("SELECT entity_type,entity_id,action,snapshot_hash FROM audit_event");
        assertThat(audits).hasSize(1);
        assertThat(audits.get(0).get("entity_type")).isEqualTo("DOCUMENT_CATEGORY");
        assertThat(audits.get(0).get("entity_id")).isEqualTo("202");
        assertThat(audits.get(0).get("action")).isEqualTo("DELETE");
        assertThat(String.valueOf(audits.get(0).get("snapshot_hash"))).matches("[0-9a-f]{64}");
    }

    @Test
    void deleteRechecksAReferenceAddedAfterAnAllowedPrecheck() throws Exception {
        assertThat(perform("before-new-reference", "GET", CHECK + "202", null, "allowed", 200).path("data").path("allowed").asBoolean()).isTrue();
        document(102, 202);
        Map<String, String> before = snapshots();
        perform("new-reference-delete", "DELETE", DOCUMENTS + "/categories/202", null, "allowed", 409);
        assertThat(snapshots()).isEqualTo(before);
    }

    @Test
    void systemCategoryRemainsProtectedWithoutReferences() throws Exception {
        Map<String, String> before = snapshots();
        perform("system-delete", "DELETE", DOCUMENTS + "/categories/203", null, "allowed", 400);
        assertThat(snapshots()).isEqualTo(before);
    }

    @ParameterizedTest @ValueSource(strings = {"anonymous", "other-page"})
    void unauthorizedCategoryActionsPreserveRows(String actor) throws Exception {
        Map<String, String> before = snapshots();
        int status = actor.equals("anonymous") ? 401 : 403;
        perform("denied-precheck", "GET", CHECK + "201", null, actor, status);
        perform("denied-delete", "DELETE", DOCUMENTS + "/categories/201", null, actor, status);
        perform("denied-reorder", "PUT", DOCUMENTS + "/categories/order", "{\"ids\":[\"202\",\"201\"]}", actor, status);
        assertThat(snapshots()).isEqualTo(before);
    }

    @Test
    void actualOrderChangesHaveExactPerCategoryDeltaAndActor() throws Exception {
        reorder("changed-order", "{\"ids\":[\"202\",\"201\"]}", "allowed", 200);
        assertThat(sort(201)).isEqualTo(40); assertThat(sort(202)).isEqualTo(30);
        assertThat(sort(203)).isEqualTo(10); assertThat(sort(204)).isEqualTo(30);
        assertDelta(201, mapper.readTree("{\"排序\":30}"), mapper.readTree("{\"排序\":40}"));
        assertDelta(202, mapper.readTree("{\"排序\":40}"), mapper.readTree("{\"排序\":30}"));
        assertThat(auditCount()).isEqualTo(2);
    }

    @Test
    void repeatingTheSameOrderDoesNotInventAnotherBusinessChange() throws Exception {
        String body = "{\"ids\":[\"202\",\"201\"]}";
        reorder("first-order", body, "allowed", 200);
        assertThat(auditCount()).isEqualTo(2);
        reorder("same-order", body, "allowed", 200);
        assertThat(auditCount()).isEqualTo(2);
        assertThat(sort(201)).isEqualTo(40); assertThat(sort(202)).isEqualTo(30);
    }

    @ParameterizedTest @ValueSource(strings = {"{}", "{\"ids\":[]}"})
    void emptyOrderPayloadKeepsTheExistingNoOpContract(String body) throws Exception {
        Map<String, String> before = snapshots();
        reorder("empty-order", body, "allowed", 200);
        assertThat(snapshots()).isEqualTo(before);
    }

    @Test
    void partialOrderAuditsOnlyItsActualChange() throws Exception {
        reorder("partial-order", "{\"ids\":[\"202\"]}", "allowed", 200);
        assertThat(sort(201)).isEqualTo(30); assertThat(sort(202)).isEqualTo(30);
        assertThat(auditCount()).isEqualTo(1);
        assertDelta(202, mapper.readTree("{\"排序\":40}"), mapper.readTree("{\"排序\":30}"));
    }

    @Test
    void unknownSystemTenantAndRepeatedIdsKeepTheirExistingFinalValueSemantics() throws Exception {
        reorder("compatible-order", "{\"ids\":[\"999\",\"202\",\"202\",\"203\",\"204\",\"201\"]}", "allowed", 200);
        assertThat(sort(201)).isEqualTo(50); assertThat(sort(202)).isEqualTo(40);
        assertThat(sort(203)).isEqualTo(10); assertThat(sort(204)).isEqualTo(30);
        assertThat(auditCount()).isEqualTo(1);
        assertDelta(201, mapper.readTree("{\"排序\":30}"), mapper.readTree("{\"排序\":50}"));
    }

    @Test
    void aNullableStoredOrderIsPreservedAsNullInTheBeforeSnapshot() throws Exception {
        jdbc.update("UPDATE document_category SET sort_order=NULL WHERE id=201");
        reorder("null-order", "{\"ids\":[\"201\",\"202\"]}", "allowed", 200);
        assertThat(auditCount()).isEqualTo(1);
        assertDelta(201, mapper.readTree("{\"排序\":null}"), mapper.readTree("{\"排序\":30}"));
    }

    @Test
    void failureOnTheSecondCategoryAuditRollsBackBothOrdersAndAllAuditRows() throws Exception {
        jdbc.execute("ALTER TABLE audit_event ADD CONSTRAINT ck_category_audit_failure CHECK (operator_account <> 'fail-audit' OR entity_id <> '202')");
        Map<String, String> before = snapshots();
        // A forced audit-storage failure is an internal fault, not invalid user input.
        JsonNode failure = perform("audit-failure-order", "PUT", DOCUMENTS + "/categories/order",
                "{\"ids\":[\"202\",\"201\"]}", "fail-audit", 500);
        assertThat(failure.path("code").asInt()).isEqualTo(500);
        assertThat(snapshots()).isEqualTo(before);
    }

    private void document(long id, long category) {
        jdbc.update("INSERT INTO sop_document(id,tenant_id,title,category_id,document_type,status,created_at,updated_at) VALUES(?,'default',?,?,'OTHER','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", id, "文档" + id, category);
        jdbc.update("INSERT INTO document_version(id,tenant_id,document_id,version,code,version_status,created_at) VALUES(?,'default',?,'V1',?,'ACTIVE',CURRENT_TIMESTAMP)", id + 200, id, "DOC-" + id);
    }

    private Integer sort(long id) { return jdbc.queryForObject("SELECT sort_order FROM document_category WHERE id=?", Integer.class, id); }
    private int auditCount() { return jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class); }
    private void reorder(String label, String body, String actor, int status) throws Exception {
        perform(label, "PUT", DOCUMENTS + "/categories/order", body, actor, status);
    }

    private void assertDelta(long id, JsonNode before, JsonNode after) throws Exception {
        var rows = jdbc.queryForList("SELECT * FROM audit_event WHERE entity_type='DOCUMENT_CATEGORY' AND entity_id=?", String.valueOf(id));
        assertThat(rows).hasSize(1);
        var row = rows.get(0);
        assertThat(mapper.readTree(String.valueOf(row.get("content_before")))).isEqualTo(before);
        assertThat(mapper.readTree(String.valueOf(row.get("content_after")))).isEqualTo(after);
        assertThat(row.get("action")).isEqualTo("UPDATE");
        assertThat(row.get("operator_id")).isEqualTo("category-auditor");
        assertThat(row.get("operator_account")).isEqualTo("allowed");
        assertThat(String.valueOf(row.get("snapshot_hash"))).matches("[0-9a-f]{64}");
    }

    private JsonNode perform(String label, String method, String url, String body, String actor, int expected) throws Exception {
        Map<String, String> before = snapshots();
        var call = request(HttpMethod.valueOf(method), url);
        if (!actor.equals("anonymous")) call.header("Authorization", "Bearer " + tokens.generateToken("category-auditor", actor, "分类审查", 5,
                actor.equals("other-page") ? List.of("master-data.materials") : List.of("master-data.documents")));
        if (body != null) call.contentType("application/json").content(body);
        var response = mvc.perform(call).andReturn().getResponse();
        JsonNode result = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8));
        String output = System.getProperty("edhr.audit.categoryOutput");
        if (output != null) {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("case", label); event.put("actor", actor); event.put("method", method); event.put("path", url);
            event.put("expectedStatus", expected); event.put("httpStatus", response.getStatus()); event.put("body", result);
            event.put("before", before); event.put("after", snapshots());
            Files.writeString(Path.of(output), mapper.writeValueAsString(event) + "\n", StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        }
        assertThat(response.getStatus()).isEqualTo(expected);
        return result;
    }

    private Map<String, String> snapshots() throws Exception {
        Map<String, String> result = new LinkedHashMap<>();
        for (String table : TABLES) result.put(table, mapper.writeValueAsString(jdbc.queryForList("SELECT * FROM " + table + " ORDER BY id")));
        return result;
    }
}
