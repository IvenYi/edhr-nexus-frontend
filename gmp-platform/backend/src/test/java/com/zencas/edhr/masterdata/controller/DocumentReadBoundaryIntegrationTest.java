package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.FileObject;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.entity.DocumentCategory;
import com.zencas.edhr.masterdata.entity.DocumentVersion;
import com.zencas.edhr.masterdata.entity.SopDocument;
import com.zencas.edhr.masterdata.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Real JWT/HTTP and five entity repositories; volume probes measure costs without freezing inefficient counts. */
@SpringBootTest(classes = DocumentReadBoundaryIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:document-read-audit;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.open-in-view=false", "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF",
        "logging.level.org.hibernate.stat=OFF", "logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener=OFF"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DocumentReadBoundaryIntegrationTest {
    private static final String DOCUMENTS = "/api/v1/master-data/documents";
    private static final List<String> TABLES = List.of("document_version", "sop_document", "document_category", "file_object", "audit_event");
    private static final List<String> SQL = new CopyOnWriteArrayList<>();
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;
    @Autowired EntityManagerFactory factory;

    @BeforeEach
    void reset() {
        for (String table : TABLES) jdbc.update("DELETE FROM " + table);
        // Canonical baseline/0001-current-schema.sql permits null master code; version.code owns the required code.
        // Hibernate's legacy SopDocument mapping still generates NOT NULL, so align this fixture explicitly.
        jdbc.execute("ALTER TABLE sop_document ALTER COLUMN code DROP NOT NULL");
    }

    static Stream<Arguments> pages() {
        return Stream.of(new int[]{1, 1}, new int[]{2, 1}, new int[]{3, 1}, new int[]{Integer.MAX_VALUE, 1},
                new int[]{Integer.MAX_VALUE, 20}, new int[]{2, Integer.MAX_VALUE},
                new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE}, new int[]{0, 0}, new int[]{-1, -5})
                .map(pair -> Arguments.of(pair[0], pair[1]));
    }

    @ParameterizedTest @MethodSource("pages")
    void acceptedPageBoundsKeepMetadataAndWholeVersions(int page, int size) throws Exception {
        String first = create("甲文档", "DOC-A", null), second = create("乙文档", "DOC-B", null);
        JsonNode data = read("page-bounds", DOCUMENTS, Map.of("page", String.valueOf(page), "size", String.valueOf(size)), 200);
        int safePage = Math.max(1, page), safeSize = Math.max(1, size);
        int rows = safePage == 1 ? Math.min(2, safeSize) : safePage == 2 && safeSize == 1 ? 1 : 0;
        assertThat(data.path("page").asInt()).isEqualTo(safePage);
        assertThat(data.path("size").asInt()).isEqualTo(safeSize);
        assertThat(data.path("totalElements").asInt()).isEqualTo(2);
        assertThat(data.path("totalPages").asInt()).isEqualTo(safeSize == 1 ? 2 : 1);
        assertThat(data.path("content").size()).isEqualTo(rows);
        List<String> ids = new ArrayList<>();
        data.path("content").forEach(row -> {
            ids.add(row.path("id").asText());
            assertThat(row.path("versions").size()).isEqualTo(1);
            assertThat(row.path("versions").get(0).path("documentId").asText()).isEqualTo(row.path("id").asText());
        });
        assertThat(ids).isEqualTo(rows == 2 ? List.of(second, first) : rows == 0 ? List.of()
                : safePage == 1 ? List.of(second) : List.of(first));
    }

    @Test
    void olderVersionKeywordStillReturnsTheCompleteDocument() throws Exception {
        String id = create("甲文档", "DOC-NEW", null);
        mvc.perform(post(DOCUMENTS + "/" + id + "/versions").header("Authorization", bearer()).contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("version", "V0", "code", "FIND-OLD")))).andExpect(status().isOk());
        create("乙文档", "DOC-B", null);
        JsonNode data = read("older-version-keyword", DOCUMENTS, Map.of("keyword", "FIND-OLD", "size", "1"), 200);
        assertThat(data.path("totalElements").asInt()).isEqualTo(1);
        JsonNode doc = data.path("content").get(0);
        assertThat(doc.path("id").asText()).isEqualTo(id);
        List<String> codes = new ArrayList<>(); doc.path("versions").forEach(v -> codes.add(v.path("code").asText()));
        assertThat(codes).containsExactly("FIND-OLD", "DOC-NEW");
    }

    @Test
    void categoriesAndUncategorizedCountsPreserveTheirScope() throws Exception {
        var response = mvc.perform(post(DOCUMENTS + "/categories").header("Authorization", bearer()).contentType("application/json")
                .content("{\"name\":\"自定义分类\"}")).andExpect(status().isOk()).andReturn().getResponse();
        String category = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data").path("id").asText();
        String categorized = create("分类文档", "DOC-A", category), uncategorized = create("未分类文档", "DOC-B", null);
        assertThat(read("category-filter", DOCUMENTS, Map.of("categoryId", category), 200).path("content").get(0).path("id").asText()).isEqualTo(categorized);
        assertThat(read("uncategorized-filter", DOCUMENTS, Map.of("categoryId", "UNCATEGORIZED"), 200).path("content").get(0).path("id").asText()).isEqualTo(uncategorized);
        JsonNode categories = read("category-counts", DOCUMENTS + "/categories", Map.of(), 200);
        assertThat(categories.get(0).path("id").asText()).isEqualTo("ALL");
        assertThat(categories.get(0).path("count").asInt()).isEqualTo(2);
        assertThat(categories.get(1).path("count").asInt()).isEqualTo(1);
        assertThat(categories.get(2).path("count").asInt()).isEqualTo(1);
    }

    @ParameterizedTest @ValueSource(strings = {"not-number", "9223372036854775808", "999999"})
    void invalidOrMissingCategoriesAreNotSilentlyTreatedAsAll(String category) throws Exception {
        create("甲文档", "DOC-A", null);
        read("invalid-category", DOCUMENTS, Map.of("categoryId", category), 400);
    }

    @Test
    void emptyListAcceptsOutOfRangePages() throws Exception {
        JsonNode data = read("empty-large-page", DOCUMENTS,
                Map.of("page", String.valueOf(Integer.MAX_VALUE), "size", String.valueOf(Integer.MAX_VALUE)), 200);
        assertThat(data.path("content").size()).isZero(); assertThat(data.path("totalElements").asInt()).isZero();
    }

    @Test
    void anonymousReadIsRejectedWithoutChangingRows() throws Exception {
        create("甲文档", "DOC-A", null); Map<String, String> before = snapshots();
        mvc.perform(get(DOCUMENTS)).andExpect(status().isUnauthorized());
        mvc.perform(get(DOCUMENTS + "/categories")).andExpect(status().isUnauthorized());
        assertThat(snapshots()).isEqualTo(before);
    }

    @EnabledIfSystemProperty(named = "edhr.audit.documentReads", matches = "true")
    @ParameterizedTest @CsvSource({"2,none", "5,none", "2,shared", "5,shared", "2,distinct", "5,distinct"})
    void observePageFileLookups(int size, String files) throws Exception {
        seed(8, 4, 1, files);
        JsonNode data = read("volume-file-" + files, DOCUMENTS, Map.of("size", String.valueOf(size)), 200);
        assertThat(data.path("content").size()).isEqualTo(size);
        data.path("content").forEach(doc -> {
            assertThat(doc.path("versions").size()).isEqualTo(4);
            doc.path("versions").forEach(v -> {
                if (files.equals("none")) assertThat(v.hasNonNull("fileId")).isFalse();
                else assertThat(v.path("fileName").asText()).startsWith("文件");
            });
        });
    }

    @EnabledIfSystemProperty(named = "edhr.audit.documentReads", matches = "true")
    @ParameterizedTest @ValueSource(ints = {20, 100})
    void observeSmallPageMaterialization(int documents) throws Exception {
        seed(documents, 3, 1, "none");
        JsonNode data = read("volume-materialization", DOCUMENTS, Map.of("size", "5"), 200);
        assertThat(data.path("totalElements").asInt()).isEqualTo(documents);
        assertThat(data.path("content").size()).isEqualTo(5);
        data.path("content").forEach(doc -> assertThat(doc.path("versions").size()).isEqualTo(3));
    }

    @EnabledIfSystemProperty(named = "edhr.audit.documentReads", matches = "true")
    @ParameterizedTest @ValueSource(ints = {20, 100})
    void observeCategoryCountsWithoutVersionLoading(int documents) throws Exception {
        seed(documents, 3, 4, "none");
        jdbc.update("INSERT INTO document_category(id,tenant_id,name,system_category) VALUES(99,'default','空分类',false)");
        JsonNode data = read("volume-categories", DOCUMENTS + "/categories", Map.of(), 200);
        assertThat(data.get(0).path("count").asInt()).isEqualTo(documents);
        assertThat(data.size()).isEqualTo(7);
        assertThat(data.findValues("name")).contains(mapper.getNodeFactory().textNode("空分类"));
        long sum = 0; for (int i = 2; i < data.size(); i++) sum += data.get(i).path("count").asLong();
        assertThat(sum).isEqualTo(documents);
    }

    private String create(String title, String code, String category) throws Exception {
        Map<String, Object> body = new LinkedHashMap<>(Map.of("title", title, "code", code, "version", "V1"));
        if (category != null) body.put("categoryId", category);
        var response = mvc.perform(post(DOCUMENTS).header("Authorization", bearer()).contentType("application/json")
                .content(mapper.writeValueAsString(body))).andExpect(status().isOk()).andReturn().getResponse();
        JsonNode doc = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data");
        assertThat(doc.path("versions").get(0).path("code").asText()).isEqualTo(code);
        return doc.path("id").asText();
    }

    private JsonNode read(String label, String url, Map<String, String> params, int expectedStatus) throws Exception {
        Map<String, String> before = snapshots();
        SessionFactory sessions = factory.unwrap(SessionFactory.class);
        sessions.getCache().evictAllRegions(); sessions.getStatistics().clear(); SQL.clear();
        var request = get(url).header("Authorization", bearer()); params.forEach(request::param);
        var response = mvc.perform(request).andReturn().getResponse();
        JsonNode body = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8));
        Map<String, Object> event = new LinkedHashMap<>(); event.put("case", label); event.put("path", url); event.put("params", params);
        event.put("httpStatus", response.getStatus()); event.put("body", body); event.put("sqlCount", SQL.size()); event.put("sql", List.copyOf(SQL));
        Map<String, Long> loads = new LinkedHashMap<>();
        for (Class<?> entity : List.of(SopDocument.class, DocumentVersion.class, DocumentCategory.class, FileObject.class, AuditEvent.class)) {
            loads.put(entity.getSimpleName(), sessions.getStatistics().getEntityStatistics(entity.getName()).getLoadCount());
        }
        event.put("entityLoads", loads);
        String output = System.getProperty("edhr.audit.documentOutput");
        if (output != null) Files.writeString(Path.of(output), mapper.writeValueAsString(event) + "\n", StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        assertThat(snapshots()).isEqualTo(before);
        assertThat(response.getStatus()).isEqualTo(expectedStatus);
        return body.path("data");
    }

    private Map<String, String> snapshots() throws Exception {
        Map<String, String> result = new LinkedHashMap<>();
        for (String table : TABLES) result.put(table, mapper.writeValueAsString(jdbc.queryForList("SELECT * FROM " + table + " ORDER BY id")));
        return result;
    }

    private String bearer() {
        return "Bearer " + tokens.generateToken("document-auditor", "document-auditor", "文档审查", 5, List.of("master-data.documents"));
    }

    private void seed(int documents, int versions, int categories, String files) {
        for (int c = 1; c <= categories; c++) jdbc.update("INSERT INTO document_category(id,tenant_id,name,system_category,sort_order) VALUES(?,'default',?,false,?)", c, "分类" + c, c);
        if (files.equals("shared")) seedFile(50000);
        for (int d = 0; d < documents; d++) {
            jdbc.update("INSERT INTO sop_document(id,tenant_id,title,document_type,category_id,status,created_at,updated_at) VALUES(?,'default',?,'OTHER',?,'DRAFT',CURRENT_TIMESTAMP,?)", 1000 + d, "文档" + d, 1 + d % categories, LocalDateTime.of(2026, 1, 1, 0, 0).plusSeconds(d));
            for (int v = 0; v < versions; v++) {
                long id = 10000L + d * versions + v;
                Long file = files.equals("none") ? null : files.equals("shared") ? 50000L : 50000L + d * versions + v;
                if (files.equals("distinct")) seedFile(file);
                jdbc.update("INSERT INTO document_version(id,tenant_id,document_id,version,code,file_id,version_status,created_at) VALUES(?,'default',?,?,?,?,'ACTIVE',CURRENT_TIMESTAMP)", id, 1000 + d, "V" + v, "CODE-" + id, file);
            }
        }
    }

    private void seedFile(long id) {
        jdbc.update("INSERT INTO file_object(id,tenant_id,original_name,stored_path,mime_type,file_size,created_at) VALUES(?,'default',?,?,'application/pdf',123,CURRENT_TIMESTAMP)", id, "文件" + id + ".pdf", "/synthetic/document-audit/" + id);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({DocumentManagementController.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class})
    static class Config {
        @Bean EntityManager entityManager(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes managedTypes() { return PersistenceManagedTypes.of(SopDocument.class.getName(), DocumentVersion.class.getName(), DocumentCategory.class.getName(), FileObject.class.getName(), AuditEvent.class.getName()); }
        @Bean SopDocumentRepository documents(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(SopDocumentRepository.class); }
        @Bean DocumentVersionRepository versions(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(DocumentVersionRepository.class); }
        @Bean DocumentCategoryRepository categories(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(DocumentCategoryRepository.class); }
        @Bean FileObjectRepository files(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(FileObjectRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean ProductProcessOperationDocumentBindingRepository bindings() { return mock(ProductProcessOperationDocumentBindingRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("document-read-audit-key-at-least-32-characters", 300000); }
        @Bean HibernatePropertiesCustomizer inspectSql() { return properties -> properties.put("hibernate.session_factory.statement_inspector", (StatementInspector) sql -> { SQL.add(sql); return sql; }); }
    }
}
