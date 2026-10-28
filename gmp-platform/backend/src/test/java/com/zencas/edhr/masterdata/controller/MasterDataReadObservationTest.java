package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.entity.*;
import com.zencas.edhr.masterdata.repository.*;
import com.zencas.edhr.masterdata.service.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Opt-in read-only audit probe. Records cost; never asserts inefficient SQL counts as a contract. */
@EnabledIfSystemProperty(named = "edhr.audit.masterDataReads", matches = "true")
@SpringBootTest(classes = MasterDataReadObservationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:master-read-audit;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.open-in-view=false", "spring.jpa.properties.hibernate.generate_statistics=true",
        "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF",
        "logging.level.org.hibernate.stat=OFF", "logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener=OFF"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MasterDataReadObservationTest {
    private static final String EQUIPMENT = "/api/v1/master-data/equipment";
    private static final String MODELING = "/api/v1/master-data/process-modeling";
    private static final List<String> SQL = new CopyOnWriteArrayList<>();
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;
    @Autowired EntityManagerFactory factory;

    @BeforeEach
    void reset() {
        for (String table : List.of("equipment", "equipment_type", "equipment_category", "material", "material_type", "audit_event")) {
            jdbc.update("DELETE FROM " + table);
        }
    }

    @ParameterizedTest
    @CsvSource({"5,false", "20,false", "5,true", "20,true"})
    void equipmentPageMeasuresSameAndDistinctAssociationQueries(int size, boolean distinct) throws Exception {
        seedEquipment(100, distinct ? 100 : 1, 1);
        JsonNode data = observe("equipment-page", EQUIPMENT, Map.of("size", String.valueOf(size), "sort", "id", "order", "asc"),
                Map.of("equipmentRows", 100, "distinctTypes", distinct ? 100 : 1, "requestedSize", size));
        assertThat(data.path("content").size()).isEqualTo(size);
        assertThat(data.path("totalElements").asInt()).isEqualTo(100);
        for (int i = 0; i < size; i++) {
            JsonNode item = data.path("content").get(i);
            assertThat(item.path("id").asText()).isEqualTo(String.valueOf(1001 + i));
            assertThat(item.path("equipmentTypeName").asText()).isEqualTo("类型" + (distinct ? i : 0));
            assertThat(item.path("categoryName").asText()).isEqualTo("分类0");
        }
    }

    @ParameterizedTest @ValueSource(ints = {5, 20})
    void categoryCountsIncludeEmptyCategoriesWithoutLoadingEquipment(int count) throws Exception {
        seedEquipment(100, 100, count);
        jdbc.update("INSERT INTO equipment_category(id,tenant_id,name,system_category,sort_order) VALUES(999,'default','空分类',false,999)");
        JsonNode data = observe("category-counts", EQUIPMENT + "/categories", Map.of(), Map.of("categories", count + 1, "types", 100));
        assertThat(data.size()).isEqualTo(count + 1);
        assertThat(data.get(0).path("count").asLong()).isEqualTo(100 / count);
        assertThat(data.get(count).path("name").asText()).isEqualTo("空分类");
        assertThat(data.get(count).path("count").asLong()).isZero();
    }

    @ParameterizedTest @ValueSource(ints = {5, 20})
    void typePageMeasuresCategoryNameLookups(int size) throws Exception {
        seedEquipment(0, 100, 1);
        JsonNode data = observe("type-page", EQUIPMENT + "/types", Map.of("size", String.valueOf(size)), Map.of("types", 100, "requestedSize", size));
        assertThat(data.path("content").size()).isEqualTo(size);
        assertThat(data.path("totalElements").asInt()).isEqualTo(100);
        data.path("content").forEach(item -> assertThat(item.path("categoryName").asText()).isEqualTo("分类0"));
    }

    @ParameterizedTest
    @CsvSource({"100,false", "500,false", "100,true", "500,true"})
    void materialSmallPageMeasuresWholeVersionAndTypeDirectoryLoads(int rows, boolean filterType) throws Exception {
        seedMaterials(rows);
        Map<String, String> params = new LinkedHashMap<>(Map.of("size", "5", "sort", "code", "order", "asc"));
        if (filterType) params.put("materialTypeName", "原材料");
        JsonNode data = observe("material-small-page", MODELING + "/materials", params,
                Map.of("materialVersions", rows, "groups", rows, "typeFilter", filterType, "requestedSize", 5));
        assertThat(data.path("content").size()).isEqualTo(5);
        assertThat(data.path("totalElements").asInt()).isEqualTo(filterType ? rows / 2 : rows);
        data.path("content").forEach(group -> {
            assertThat(group.path("versionCount").asInt()).isEqualTo(1);
            assertThat(group.path("versions").size()).isEqualTo(1);
            if (filterType) assertThat(group.path("materialTypeName").asText()).isEqualTo("原材料");
        });
    }

    @ParameterizedTest @ValueSource(strings = {"物料", "原材料"})
    void materialKeywordShortCircuitIsCounterevidenceToUnconditionalDirectoryNPlusOne(String keyword) throws Exception {
        seedMaterials(100);
        JsonNode data = observe("material-keyword", MODELING + "/materials", Map.of("keyword", keyword, "size", "5"), Map.of("materialVersions", 100, "keyword", keyword));
        assertThat(data.path("totalElements").asInt()).isEqualTo("物料".equals(keyword) ? 100 : 50);
    }

    @Test
    void groupedPageContainsEveryVersionAndDerivedProductUsesMaterialIdentity() throws Exception {
        seedMaterials(6);
        jdbc.update("UPDATE material SET code='GROUP-A',name='同一物料',version=CASE id WHEN 1000 THEN 'V1' WHEN 1001 THEN 'V2' ELSE 'V10' END WHERE id BETWEEN 1000 AND 1002");
        JsonNode data = observe("material-group-versions", MODELING + "/materials", Map.of("size", "1", "sort", "code", "order", "asc"), Map.of("materialVersions", 6, "groups", 4));
        assertThat(data.path("totalElements").asInt()).isEqualTo(4);
        JsonNode group = data.path("content").get(0);
        assertThat(group.path("code").asText()).isEqualTo("GROUP-A");
        assertThat(group.path("versionCount").asInt()).isEqualTo(3);
        List<String> versions = new ArrayList<>();
        group.path("versions").forEach(item -> versions.add(item.path("version").asText()));
        assertThat(versions).containsExactly("V10", "V2", "V1");
        JsonNode products = observe("derived-product-identity", MODELING + "/products", Map.of("size", "1", "sort", "code", "order", "asc"), Map.of("materialVersions", 6, "productVersions", 3));
        assertThat(products.path("totalElements").asInt()).isEqualTo(3);
        assertThat(products.path("content").get(0).path("id").asText()).isEqualTo("1001");
        assertThat(products.path("content").get(0).path("materialTypeName").asText()).isEqualTo("产成品");
    }

    @Test
    void anonymousAndMissingAuthorityDoNotReadMasterData() throws Exception {
        seedMaterials(100);
        clearStatistics();
        mvc.perform(get(MODELING + "/materials")).andExpect(status().isUnauthorized());
        mvc.perform(get(EQUIPMENT).header("Authorization", bearer(List.of("unrelated")))).andExpect(status().isForbidden());
        assertThat(SQL).isEmpty();
        assertThat(factory.unwrap(SessionFactory.class).getStatistics().getEntityLoadCount()).isZero();
        record(Map.of("case", "authorization-controls", "anonymous", 401, "missingAuthority", 403, "preparedStatements", 0));
    }

    private JsonNode observe(String name, String url, Map<String, String> params, Map<String, ?> fixture) throws Exception {
        Map<String, Long> before = rowCounts();
        clearStatistics();
        var request = get(url).header("Authorization", bearer(List.of("master-data.equipment", "master-data.materials", "master-data.products")));
        params.forEach(request::param);
        var response = mvc.perform(request).andExpect(status().isOk()).andReturn().getResponse();
        JsonNode data = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data");
        var stats = factory.unwrap(SessionFactory.class).getStatistics();
        List<String> statements = List.copyOf(SQL);
        assertThat(statements).allSatisfy(sql -> assertThat(sql.stripLeading().toLowerCase(java.util.Locale.ROOT)).startsWith("select "));
        assertThat(rowCounts()).isEqualTo(before);
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("case", name); event.put("path", url); event.put("params", params); event.put("fixture", fixture);
        event.put("database", "H2 PostgreSQL mode; not native PostgreSQL"); event.put("openInView", false);
        event.put("preparedStatements", stats.getPrepareStatementCount());
        Map<String, Long> loaded = new LinkedHashMap<>();
        for (Class<?> type : List.of(Equipment.class, EquipmentType.class, EquipmentCategory.class, Material.class, MaterialType.class)) {
            loaded.put(type.getSimpleName(), stats.getEntityStatistics(type.getName()).getLoadCount());
        }
        event.put("loadedEntities", loaded); event.put("responseData", data);
        event.put("sqlCounts", statements.stream().collect(java.util.stream.Collectors.groupingBy(sql -> sql, LinkedHashMap::new, java.util.stream.Collectors.counting())));
        event.put("rowCountsBeforeAndAfter", before); event.put("readOnlySql", true);
        event.put("qualification", "Observed ORM work only; no elapsed-time, PG plan, heap or production-capacity claim. SQL counts are measurements, not required inefficient behavior.");
        record(event);
        return data;
    }

    private void clearStatistics() {
        var sessions = factory.unwrap(SessionFactory.class);
        sessions.getCache().evictAllRegions(); sessions.getStatistics().clear(); SQL.clear();
    }

    private Map<String, Long> rowCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String table : List.of("equipment", "equipment_type", "equipment_category", "material", "material_type", "audit_event")) {
            counts.put(table, jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Long.class));
        }
        return counts;
    }

    private String bearer(List<String> permissions) {
        return "Bearer " + tokens.generateToken("read-auditor", "read-auditor", "读取审查", 5, permissions);
    }

    private void seedEquipment(int equipmentCount, int typeCount, int categoryCount) {
        for (int i = 0; i < categoryCount; i++) {
            jdbc.update("INSERT INTO equipment_category(id,tenant_id,name,system_category,sort_order,created_at) VALUES(?,'default',?,false,?,CURRENT_TIMESTAMP)", i + 1, "分类" + i, i);
        }
        for (int i = 0; i < typeCount; i++) {
            jdbc.update("INSERT INTO equipment_type(id,tenant_id,code,name,category_id,created_at) VALUES(?,'default',?,?,?,CURRENT_TIMESTAMP)", 101 + i, "T" + i, "类型" + i, 1 + i % categoryCount);
        }
        for (int i = 0; i < equipmentCount; i++) {
            jdbc.update("INSERT INTO equipment(id,code,name,equipment_type_id,status,created_at) VALUES(?,?,?,?, 'ACTIVE',CURRENT_TIMESTAMP)", 1001 + i, "E" + i, "设备" + i, 101 + i % typeCount);
        }
    }

    private void seedMaterials(int count) {
        jdbc.update("INSERT INTO material_type(id,tenant_id,code,name) VALUES(1,'default','RAW','原材料'),(2,'default','PRODUCT','产成品')");
        for (int i = 0; i < count; i++) {
            jdbc.update("INSERT INTO material(id,tenant_id,code,name,version,material_type_id,status,created_at) VALUES(?,'default',?,?,'V1',?,'ACTIVE',CURRENT_TIMESTAMP)", 1000 + i, String.format(java.util.Locale.ROOT, "MAT-%05d", i), "物料" + i, i % 2 + 1);
        }
    }

    private void record(Map<String, ?> event) throws Exception {
        Path output = Path.of(System.getProperty("edhr.audit.masterDataOutput"));
        Files.createDirectories(output.toAbsolutePath().getParent());
        Files.writeString(output, mapper.writeValueAsString(event) + "\n", StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({EquipmentController.class, ProcessModelingController.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class})
    static class Config {
        @Bean EntityManager entityManager(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes managedTypes() { return PersistenceManagedTypes.of(Equipment.class.getName(), EquipmentType.class.getName(), EquipmentCategory.class.getName(), Material.class.getName(), MaterialType.class.getName(), AuditEvent.class.getName()); }
        @Bean EquipmentRepository equipment(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(EquipmentRepository.class); }
        @Bean EquipmentTypeRepository equipmentTypes(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(EquipmentTypeRepository.class); }
        @Bean EquipmentCategoryRepository equipmentCategories(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(EquipmentCategoryRepository.class); }
        @Bean MaterialRepository materials(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(MaterialRepository.class); }
        @Bean MaterialTypeRepository materialTypes(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(MaterialTypeRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("master-data-read-audit-key-at-least-32-characters", 300000); }
        @Bean HibernatePropertiesCustomizer inspectSql() { return properties -> properties.put("hibernate.session_factory.statement_inspector", (StatementInspector) sql -> { SQL.add(sql); return sql; }); }
        @Bean MaterialImportService materialImport() { return mock(MaterialImportService.class); }
        @Bean OperationImportService operationImport() { return mock(OperationImportService.class); }
        @Bean ProductRepository products() { return mock(ProductRepository.class); }
        @Bean ProductFamilyRepository families() { return mock(ProductFamilyRepository.class); }
        @Bean OperationCategoryRepository categories() { return mock(OperationCategoryRepository.class); }
        @Bean OperationRepository operations() { return mock(OperationRepository.class); }
        @Bean RouteRepository routes() { return mock(RouteRepository.class); }
        @Bean RouteVersionRepository versions() { return mock(RouteVersionRepository.class); }
        @Bean RouteNodeRepository nodes() { return mock(RouteNodeRepository.class); }
        @Bean RouteRelationRepository relations() { return mock(RouteRelationRepository.class); }
        @Bean SopDocumentRepository documents() { return mock(SopDocumentRepository.class); }
        @Bean ProductFamilyMembershipService memberships() { return mock(ProductFamilyMembershipService.class); }
        @Bean ProductProcessOwnerService owners() { return mock(ProductProcessOwnerService.class); }
    }
}
