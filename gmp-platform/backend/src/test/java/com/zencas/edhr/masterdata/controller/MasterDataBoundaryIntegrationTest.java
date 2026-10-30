package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.compliance.repository.FileObjectRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.repository.*;
import com.zencas.edhr.template.repository.*;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.service.FormFillSettingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Real JWT/filter/controller/material repositories; all materials are created through the normal API. */
@SpringBootTest(classes = {MasterDataReadObservationTest.Config.class, MasterDataBoundaryIntegrationTest.Config.class}, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:master-boundary-audit;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MasterDataBoundaryIntegrationTest {
    private static final String MATERIALS = "/api/v1/master-data/process-modeling/materials";
    private static final List<String> LISTS = List.of(MATERIALS,
            "/api/v1/master-data/process-modeling/products", "/api/v1/master-data/product-modeling/products");
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;
    @MockBean ProductProcessRepository processes;
    @MockBean ProductProcessVersionRepository processVersions;
    @MockBean ProductProcessOperationBindingRepository operationBindings;
    @MockBean ProductProcessOperationFormBindingRepository formBindings;
    @MockBean ProductProcessOperationDocumentBindingRepository documentBindings;
    @MockBean FormFillSettingsService fillSettings;
    @MockBean DocumentCategoryRepository documentCategories;
    @MockBean DocumentVersionRepository documentVersions;
    @MockBean DhrTemplateRepository dhrTemplates;
    @MockBean DhrTemplateVersionRepository dhrVersions;
    @MockBean FormTemplateRepository formTemplates;
    @MockBean FormTemplateVersionRepository formVersions;
    @MockBean DhrDirectoryRepository directories;
    @MockBean DhrTemplateItemRepository items;
    @MockBean WorkflowDefinitionRepository definitions;
    @MockBean WorkflowDefinitionVersionRepository definitionVersions;
    @MockBean FileObjectRepository files;

    @BeforeEach
    void reset() {
        jdbc.update("DELETE FROM material");
        jdbc.update("DELETE FROM material_type");
        jdbc.update("DELETE FROM audit_event");
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS boundary_material_code_version ON material(tenant_id,code,version)");
        jdbc.update("INSERT INTO material_type(id,tenant_id,code,name) VALUES(1,'default','RAW','原材料'),(2,'default','PRODUCT','产成品')");
    }

    static Stream<Arguments> pages() {
        return LISTS.stream().flatMap(url -> Stream.of(new int[]{1, 1}, new int[]{2, 1}, new int[]{3, 1},
                new int[]{Integer.MAX_VALUE, 1}, new int[]{Integer.MAX_VALUE, 20}, new int[]{2, Integer.MAX_VALUE},
                new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE}, new int[]{0, 0}, new int[]{-1, -5})
                .map(pair -> Arguments.of(url, pair[0], pair[1])));
    }

    @ParameterizedTest @MethodSource("pages")
    void legalPageBoundsAndExistingNormalizationDoNotOverflow(String url, int page, int size) throws Exception {
        String first = create("MAT-A", "物料甲", "V1");
        String second = create("MAT-B", "物料乙", "V1");
        Map<String, String> before = snapshots();
        var response = mvc.perform(get(url).header("Authorization", bearer()).param("page", String.valueOf(page))
                        .param("size", String.valueOf(size)).param("sort", "code").param("order", "asc"))
                .andReturn().getResponse();
        JsonNode body = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8));
        record(Map.of("case", "page-bounds", "path", url, "page", page, "size", size,
                "httpStatus", response.getStatus(), "body", body));
        assertThat(response.getStatus()).isEqualTo(200);
        JsonNode data = body.path("data");
        int normalizedPage = Math.max(page, 1), normalizedSize = Math.max(size, 1);
        int expectedRows = normalizedPage == 1 ? Math.min(2, normalizedSize)
                : normalizedPage == 2 && normalizedSize == 1 ? 1 : 0;
        assertThat(data.path("page").asInt()).isEqualTo(normalizedPage);
        assertThat(data.path("size").asInt()).isEqualTo(normalizedSize);
        assertThat(data.path("totalElements").asInt()).isEqualTo(2);
        assertThat(data.path("totalPages").asInt()).isEqualTo(normalizedSize == 1 ? 2 : 1);
        assertThat(data.path("content").size()).isEqualTo(expectedRows);
        data.path("content").forEach(row -> {
            if (url.equals(MATERIALS)) {
                assertThat(row.path("versionCount").asInt()).isEqualTo(1);
                assertThat(row.path("versions").get(0).path("id").asText()).isIn(first, second);
            } else assertThat(row.path("id").asText()).isIn(first, second);
        });
        assertThat(snapshots()).isEqualTo(before);
    }

    static Stream<Arguments> versions() {
        return Stream.of(Arguments.of("V10", "V2"),
                Arguments.of("V9223372036854775808", "V9223372036854775807"),
                Arguments.of("V" + "9".repeat(60), "V1" + "0".repeat(59)),
                Arguments.of("V1.9223372036854775808", "V1.9223372036854775807"),
                Arguments.of("V" + "0".repeat(30) + "10", "V" + "0".repeat(30) + "2"),
                Arguments.of("V1", "V01"), Arguments.of("V1.10", "V1.2"),
                Arguments.of("V2026.10.28", "V2026.9.30"));
    }

    @ParameterizedTest @MethodSource("versions")
    void acceptedVersionNumbersSortAndKeepTheWholeGroup(String higher, String lower) throws Exception {
        List<String> ids = List.of(create("MAT-GROUP", "同组物料", lower),
                create("MAT-GROUP", "同组物料", higher), create("MAT-GROUP", "同组物料", "V0"));
        Map<String, String> before = snapshots();
        var response = mvc.perform(get(MATERIALS).header("Authorization", bearer()).param("size", "1"))
                .andReturn().getResponse();
        JsonNode body = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8));
        record(Map.of("case", "version-order", "higher", higher, "lower", lower,
                "httpStatus", response.getStatus(), "body", body));
        assertThat(response.getStatus()).isEqualTo(200);
        JsonNode data = body.path("data");
        assertThat(data.path("totalElements").asInt()).isEqualTo(1);
        assertThat(data.path("content").size()).isEqualTo(1);
        JsonNode group = data.path("content").get(0);
        assertThat(group.path("version").asText()).isEqualTo(higher);
        assertThat(group.path("versionCount").asInt()).isEqualTo(3);
        assertThat(group.path("effectiveVersionCount").asInt()).isEqualTo(3);
        assertThat(group.path("status").asText()).isEqualTo("ACTIVE");
        List<String> labels = new ArrayList<>(), actualIds = new ArrayList<>();
        group.path("versions").forEach(row -> { labels.add(row.path("version").asText()); actualIds.add(row.path("id").asText()); });
        assertThat(labels).containsExactly(higher, lower, "V0");
        assertThat(actualIds).containsExactly(ids.get(1), ids.get(0), ids.get(2));
        assertThat(snapshots()).isEqualTo(before);
    }

    @Test
    void anonymousListsDoNotExposeAcceptedMaterialVersions() throws Exception {
        create("MAT-A", "物料甲", "V1");
        Map<String, String> before = snapshots();
        for (String url : LISTS) mvc.perform(get(url)).andExpect(status().isUnauthorized());
        assertThat(snapshots()).isEqualTo(before);
    }

    static Stream<Arguments> mixedVersions() {
        return Stream.of(new String[]{"V2a3", "V2b"}, new String[]{"V1.2a3", "V1.2z"},
                        new String[]{"A1", "Z"}, new String[]{"V2a9223372036854775808", "V2z"},
                        new String[]{"V2z", "V02a"}, new String[]{"V2a3.0", "V2b"})
                .flatMap(pair -> Stream.of(false, true).flatMap(reverse -> Stream.of("asc", "desc")
                        .map(order -> Arguments.of(pair[0], pair[1], reverse, order))));
    }

    @ParameterizedTest @MethodSource("mixedVersions")
    void acceptedMixedLabelsKeepTheirOrderRegardlessOfInputOrder(
            String higher, String lower, boolean reverseCreation, String inputOrder) throws Exception {
        Map<String, String> ids = new LinkedHashMap<>();
        for (String label : reverseCreation ? List.of(higher, lower) : List.of(lower, higher)) {
            ids.put(label, create("MAT-MIXED", "混合版本物料", label));
        }
        Map<String, String> before = snapshots();
        var response = mvc.perform(get(MATERIALS).header("Authorization", bearer()).param("size", "1")
                        .param("sort", "createdAt").param("order", inputOrder))
                .andReturn().getResponse();
        JsonNode body = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8));
        record(Map.of("case", "mixed-version-order", "higher", higher, "lower", lower,
                "reverseCreation", reverseCreation, "inputOrder", inputOrder,
                "httpStatus", response.getStatus(), "body", body));
        assertThat(response.getStatus()).isEqualTo(200);
        JsonNode data = body.path("data");
        assertThat(data.path("totalElements").asInt()).isEqualTo(1);
        assertThat(data.path("content").size()).isEqualTo(1);
        JsonNode group = data.path("content").get(0);
        assertThat(group.path("version").asText()).isEqualTo(higher);
        assertThat(group.path("versionCount").asInt()).isEqualTo(2);
        assertThat(group.path("effectiveVersionCount").asInt()).isEqualTo(2);
        assertThat(group.path("status").asText()).isEqualTo("ACTIVE");
        List<String> labels = new ArrayList<>(), actualIds = new ArrayList<>();
        group.path("versions").forEach(row -> {
            labels.add(row.path("version").asText()); actualIds.add(row.path("id").asText());
        });
        assertThat(labels).containsExactly(higher, lower);
        assertThat(actualIds).containsExactly(ids.get(higher), ids.get(lower));
        assertThat(snapshots()).isEqualTo(before);
    }

    private String create(String code, String name, String version) throws Exception {
        assertThat(version.length()).isLessThanOrEqualTo(64);
        var response = mvc.perform(post(MATERIALS).header("Authorization", bearer()).contentType("application/json")
                        .content(mapper.writeValueAsString(Map.of("code", code, "name", name, "version", version, "materialTypeId", 2))))
                .andExpect(status().isOk()).andReturn().getResponse();
        JsonNode created = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data");
        assertThat(created.path("version").asText()).isEqualTo(version);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM material WHERE id=? AND version=?", Integer.class,
                Long.valueOf(created.path("id").asText()), version)).isEqualTo(1);
        return created.path("id").asText();
    }

    private String bearer() {
        return "Bearer " + tokens.generateToken("boundary-auditor", "boundary-auditor", "边界审查", 5,
                List.of("master-data.materials", "master-data.products"));
    }

    private Map<String, String> snapshots() throws Exception {
        Map<String, String> result = new LinkedHashMap<>();
        for (String table : List.of("material", "material_type", "audit_event")) {
            result.put(table, mapper.writeValueAsString(jdbc.queryForList("SELECT * FROM " + table + " ORDER BY id")));
        }
        return result;
    }

    private void record(Map<String, ?> event) throws Exception {
        String output = System.getProperty("edhr.audit.boundaryOutput");
        if (output == null) return;
        Path path = Path.of(output);
        Files.createDirectories(path.toAbsolutePath().getParent());
        Files.writeString(path, mapper.writeValueAsString(event) + "\n", StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    @Configuration(proxyBeanMethods = false)
    @Import(ProductProcessController.class)
    static class Config {}
}
