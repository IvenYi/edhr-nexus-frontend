package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.Arguments;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;

/** Real JWT, method security, transactions and five tables; product-binding deletion guard is not installed. */
@SpringBootTest(classes = DocumentReadBoundaryIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:document-write-audit;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.open-in-view=false", "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF",
        "logging.level.org.hibernate.stat=OFF", "logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener=OFF"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DocumentWriteBoundaryIntegrationTest {
    static final String DOCUMENTS = "/api/v1/master-data/documents";
    private static final List<String> TABLES = List.of("document_version", "sop_document", "document_category", "file_object", "audit_event");
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;
    @Autowired EntityManagerFactory factory;

    record Endpoint(String name, String method, String suffix, String body) {}

    static Stream<Endpoint> endpoints() {
        return Stream.of(
                new Endpoint("list", "GET", "", null),
                new Endpoint("categories", "GET", "/categories", null),
                new Endpoint("create-category", "POST", "/categories", "{\"name\":\"新分类\"}"),
                new Endpoint("update-category", "PUT", "/categories/201", "{\"name\":\"改分类\"}"),
                new Endpoint("delete-category", "DELETE", "/categories/202", null),
                new Endpoint("order-categories", "PUT", "/categories/order", "{\"ids\":[\"202\",\"201\"]}"),
                new Endpoint("detail", "GET", "/101", null),
                new Endpoint("create", "POST", "", "{\"title\":\"新文档\",\"code\":\"NEW-DOC\",\"version\":\"V1\",\"categoryId\":\"201\",\"fileId\":401,\"description\":\"新描述\"}"),
                new Endpoint("update", "PUT", "/101", "{\"title\":\"改文档\",\"description\":\"改描述\"}"),
                new Endpoint("create-version", "POST", "/101/versions", "{\"version\":\"V2\",\"code\":\"NEW-V2\",\"fileId\":401}"),
                new Endpoint("update-version", "PUT", "/101/versions/301", "{\"version\":\"V1改\",\"code\":\"UPDATED-V1\",\"description\":\"改版本\",\"fileId\":401}"),
                new Endpoint("delete-version", "DELETE", "/101/versions/301", null),
                new Endpoint("delete", "DELETE", "/101", null));
    }

    static Stream<Arguments> deniedRequests() {
        return endpoints().flatMap(endpoint -> Stream.of("anonymous", "no-permissions", "other-page")
                .map(actor -> Arguments.of(endpoint, actor)));
    }

    @BeforeEach
    void seed() {
        jdbc.execute("ALTER TABLE audit_event DROP CONSTRAINT IF EXISTS ck_test_audit_failure");
        for (String table : TABLES) jdbc.update("DELETE FROM " + table);
        // Match the canonical schema for the authority comparison on BOTH old and fixed code.
        // The separate fresh-ORM test intentionally applies no nullability repair.
        jdbc.execute("ALTER TABLE sop_document ALTER COLUMN code DROP NOT NULL");
        if (factory.getProperties().get("hibernate.dialect").toString().contains("H2Dialect")) {
            jdbc.execute("CREATE ALIAS IF NOT EXISTS NORMALIZE FOR 'com.zencas.edhr.masterdata.controller.DocumentReadBoundaryIntegrationTest$UnicodeFunctions.nfc'");
        }
        jdbc.update("INSERT INTO document_category(id,tenant_id,name,system_category,sort_order) VALUES(201,'default','原分类',false,10),(202,'default','另一分类',false,20)");
        jdbc.update("INSERT INTO sop_document(id,tenant_id,title,category_id,document_type,status,created_at,updated_at) VALUES(101,'default','原文档',201,'OTHER','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO document_version(id,tenant_id,document_id,version,code,version_status,created_at) VALUES(301,'default',101,'V1','ORIGINAL-V1','ACTIVE',CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO file_object(id,tenant_id,original_name,stored_path,mime_type,file_size,created_at) VALUES(401,'default','原件.pdf','/synthetic/document-write/401','application/pdf',123,CURRENT_TIMESTAMP)");
    }

    @ParameterizedTest @MethodSource("deniedRequests")
    void unauthorizedRequestsDoNotReadOrMutateBusinessRows(Endpoint endpoint, String actor) throws Exception {
        Map<String, String> before = snapshots();
        int expected = actor.equals("anonymous") ? 401 : 403;
        JsonNode result = perform(endpoint, actor, expected);
        assertThat(result.path("code").asInt()).isEqualTo(expected);
        assertThat(snapshots()).isEqualTo(before);
    }

    @ParameterizedTest @MethodSource("endpoints")
    void pageAuthorityAllowsTheExistingOperation(Endpoint endpoint) throws Exception {
        Map<String, String> before = snapshots();
        JsonNode result = perform(endpoint, "allowed", 200).path("data");
        switch (endpoint.name()) {
            case "list" -> {
                assertThat(result.path("totalElements").asInt()).isEqualTo(1);
                assertThat(result.path("content").get(0).path("id").asText()).isEqualTo("101");
            }
            case "categories" -> assertThat(result.size()).isEqualTo(4);
            case "detail" -> {
                assertThat(result.path("id").asText()).isEqualTo("101");
                assertThat(result.path("versions").get(0).path("id").asText()).isEqualTo("301");
            }
            case "create-category" -> {
                assertThat(result.path("name").asText()).isEqualTo("新分类");
                assertThat(count("document_category")).isEqualTo(3);
            }
            case "update-category" -> assertThat(jdbc.queryForObject("SELECT name FROM document_category WHERE id=201", String.class)).isEqualTo("改分类");
            case "delete-category" -> {
                assertThat(count("document_category")).isEqualTo(1);
                assertThat(jdbc.queryForObject("SELECT category_id FROM sop_document WHERE id=101", Long.class)).isEqualTo(201L);
                assertThat(count("document_version")).isEqualTo(1);
            }
            case "order-categories" -> assertThat(jdbc.queryForList("SELECT id FROM document_category ORDER BY sort_order", Long.class)).containsExactly(202L, 201L);
            case "create" -> {
                assertThat(count("sop_document")).isEqualTo(2);
                assertThat(count("document_version")).isEqualTo(2);
                assertThat(result.path("versions").get(0).path("code").asText()).isEqualTo("NEW-DOC");
                assertThat(result.path("versions").get(0).path("documentId").asText()).isEqualTo(result.path("id").asText());
            }
            case "update" -> assertThat(jdbc.queryForObject("SELECT title FROM sop_document WHERE id=101", String.class)).isEqualTo("改文档");
            case "create-version" -> {
                assertThat(count("document_version")).isEqualTo(2);
                assertThat(result.path("documentId").asText()).isEqualTo("101");
                assertThat(result.path("fileName").asText()).isEqualTo("原件.pdf");
            }
            case "update-version" -> {
                assertThat(result.path("id").asText()).isEqualTo("301");
                assertThat(jdbc.queryForObject("SELECT code FROM document_version WHERE id=301", String.class)).isEqualTo("UPDATED-V1");
            }
            case "delete-version" -> {
                assertThat(count("document_version")).isZero();
                assertThat(count("sop_document")).isEqualTo(1);
            }
            case "delete" -> {
                assertThat(count("document_version")).isZero();
                assertThat(count("sop_document")).isZero();
            }
            default -> throw new AssertionError(endpoint.name());
        }
        if (endpoint.method().equals("GET")) assertThat(snapshots()).isEqualTo(before);
        else if (!endpoint.name().equals("order-categories")) {
            List<Map<String, Object>> audits = jdbc.queryForList("SELECT operator_id,operator_account,snapshot_hash FROM audit_event ORDER BY id");
            assertThat(audits).isNotEmpty();
            audits.forEach(audit -> {
                assertThat(audit.get("operator_id")).isEqualTo("document-write-auditor");
                assertThat(audit.get("operator_account")).isEqualTo("allowed");
                assertThat(String.valueOf(audit.get("snapshot_hash"))).matches("[0-9a-f]{64}");
            });
        }
    }

    @ParameterizedTest @ValueSource(strings = {"create", "update", "delete"})
    void rejectedAuditInsertRollsBackAllBusinessChanges(String operation) throws Exception {
        jdbc.execute("ALTER TABLE audit_event ADD CONSTRAINT ck_test_audit_failure CHECK (operator_account <> 'fail-audit')");
        Map<String, String> before = snapshots();
        Endpoint endpoint = endpoints().filter(e -> e.name().equals(operation)).findFirst().orElseThrow();
        perform(endpoint, "fail-audit", 400);
        assertThat(snapshots()).isEqualTo(before);
    }

    private JsonNode perform(Endpoint endpoint, String actor, int expectedStatus) throws Exception {
        var call = request(HttpMethod.valueOf(endpoint.method()), DOCUMENTS + endpoint.suffix());
        if (!actor.equals("anonymous")) {
            List<String> permissions = actor.equals("no-permissions") ? List.of()
                    : actor.equals("other-page") ? List.of("master-data.materials") : List.of("master-data.documents");
            call.header("Authorization", "Bearer " + tokens.generateToken("document-write-auditor", actor, "文档审查", 5, permissions));
        }
        if (endpoint.body() != null) call.contentType("application/json").content(endpoint.body());
        Map<String, String> before = snapshots();
        var stats = factory.unwrap(SessionFactory.class).getStatistics(); stats.clear();
        var response = mvc.perform(call).andReturn().getResponse();
        long sqlCount = stats.getPrepareStatementCount();
        Map<String, String> after = snapshots();
        JsonNode body = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8));
        String output = System.getProperty("edhr.audit.documentWriteOutput");
        if (output != null) {
            Map<String, Object> event = new LinkedHashMap<>();
            event.put("case", endpoint.name()); event.put("actor", actor); event.put("method", endpoint.method());
            event.put("path", DOCUMENTS + endpoint.suffix()); event.put("expectedStatus", expectedStatus);
            event.put("httpStatus", response.getStatus()); event.put("body", body); event.put("businessSql", sqlCount);
            event.put("before", before); event.put("after", after);
            Files.writeString(Path.of(output), mapper.writeValueAsString(event) + "\n", StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        }
        assertThat(response.getStatus()).isEqualTo(expectedStatus);
        if (expectedStatus == 401 || expectedStatus == 403) assertThat(sqlCount).isZero();
        return body;
    }

    private int count(String table) { return jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class); }
    private Map<String, String> snapshots() throws Exception {
        Map<String, String> result = new LinkedHashMap<>();
        for (String table : TABLES) result.put(table, mapper.writeValueAsString(jdbc.queryForList("SELECT * FROM " + table + " ORDER BY id")));
        return result;
    }
}
