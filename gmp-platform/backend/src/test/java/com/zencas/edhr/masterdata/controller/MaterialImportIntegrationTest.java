package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.MaterialType;
import com.zencas.edhr.masterdata.repository.*;
import com.zencas.edhr.masterdata.service.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.test.web.servlet.MockMvc;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = MaterialImportIntegrationTest.TestConfig.class, properties = {
        "spring.liquibase.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:material-import;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class MaterialImportIntegrationTest {
    private static final String URL = "/api/v1/master-data/process-modeling/materials";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;
    @Autowired JdbcTemplate jdbc;
    @SpyBean AuditEventRepository audits;
    @MockBean ProductRepository products;
    @MockBean ProductFamilyRepository families;
    @MockBean OperationCategoryRepository categories;
    @MockBean OperationRepository operations;
    @MockBean RouteRepository routes;
    @MockBean RouteVersionRepository versions;
    @MockBean RouteNodeRepository nodes;
    @MockBean RouteRelationRepository relations;
    @MockBean SopDocumentRepository documents;
    @MockBean ProductFamilyMembershipService memberships;
    @MockBean ProductProcessOwnerService owners;

    @BeforeEach
    void reset() {
        jdbc.update("DELETE FROM material");
        jdbc.update("DELETE FROM material_type");
        jdbc.update("DELETE FROM audit_event");
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS test_material_code_version ON material(tenant_id,code,version)");
        jdbc.execute("ALTER TABLE material ALTER COLUMN specification VARCHAR(128)");
        jdbc.execute("ALTER TABLE material ALTER COLUMN unit VARCHAR(32)");
        jdbc.update("INSERT INTO material_type(id,tenant_id,code,name) VALUES(1,'default','RAW','原材料')");
    }

    @Test
    void templateImportAndReloadPersistBrandCountsAndOperatorAudit() throws Exception {
        var file = file(new String[]{"有效物料", "TEST-1", "品牌甲", "规格", "原材料", "PCS", "生产物料", "V1", "", "", ""},
                new String[]{"有效物料", "test-1", "品牌甲", "规格", "原材料", "PCS", "生产物料", "v1", "", "", ""},
                new String[]{"缺类型", "TEST-2", "", "", "", "PCS", "", "V1", "", "", ""},
                new String[]{"超长规格", "TEST-3", "", "长".repeat(129), "原材料", "PCS", "", "V1", "", "", ""},
                new String[]{"超长单位", "TEST-4", "", "", "原材料", "长".repeat(33), "", "V1", "", "", ""});
        mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.successCount").value(1))
                .andExpect(jsonPath("$.data.skippedCount").value(1)).andExpect(jsonPath("$.data.failedCount").value(3))
                .andExpect(jsonPath("$.data.failedRows[0].rowNumber").value(4))
                .andExpect(jsonPath("$.data.importedMaterials").doesNotExist());
        assertThat(jdbc.queryForObject("SELECT brand_name FROM material WHERE code='TEST-1'", String.class)).isEqualTo("品牌甲");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM material", Integer.class)).isEqualTo(1);
        var events = audits.findAll();
        assertThat(events).singleElement().satisfies(event -> {
            assertThat(event.getOperatorName()).isEqualTo("物料验收员");
            assertThat(event.getAction()).isEqualTo("CREATE");
            assertThat(event.getContentAfter()).contains("brandName", "品牌甲");
        });
        mvc.perform(get(URL).header("Authorization", auth()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].brandName").value("品牌甲"))
                .andExpect(jsonPath("$.data.content[0].brand").doesNotExist());
        mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth()))
                .andExpect(jsonPath("$.data.successCount").value(0)).andExpect(jsonPath("$.data.skippedCount").value(2));
        assertThat(audits.count()).isEqualTo(1);
    }

    @Test
    void auditFailureRollsBackImportedRows() throws Exception {
        var file = file(new String[]{"事务物料", "ROLLBACK", "", "", "原材料", "", "", "V1", "", "", ""});
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any(AuditEvent.class));
        mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth())).andExpect(status().is5xxServerError());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM material", Integer.class)).isZero();
        assertThat(audits.count()).isZero();
    }

    @Test
    void rejectsUnauthenticatedImportAndTemplateRequests() throws Exception {
        mvc.perform(get(URL + "/import-template")).andExpect(status().isUnauthorized());
        mvc.perform(multipart(URL + "/import").file(new MockMultipartFile("file", "a.xlsx", "", new byte[]{1})))
                .andExpect(status().isUnauthorized());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM material", Integer.class)).isZero();
    }

    @Test
    void brandNameAndLegacyRequestAliasSaveOptionalBrand() throws Exception {
        for (String field : List.of("brandName", "brand")) {
            var response = mvc.perform(post(URL).header("Authorization", auth()).contentType("application/json")
                            .content(mapper.writeValueAsString(Map.of("name", "品牌测试", "code", "KEY-" + field, "materialTypeId", 1, field, "甲"))))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.data.brandName").value("甲"))
                    .andExpect(jsonPath("$.data.brand").doesNotExist()).andReturn().getResponse();
            String id = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data").path("id").asText();
            mvc.perform(put(URL + "/" + id).header("Authorization", auth()).contentType("application/json")
                            .content("{\"materialTypeId\":1,\"brandName\":\"\"}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.data.brandName").doesNotExist());
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM material WHERE brand_name IS NOT NULL", Integer.class)).isZero();
    }

    private String auth() {
        return "Bearer " + tokens.generateToken("material-test", "material-test", "物料验收员", 5, List.of("master-data.materials"));
    }

    private MockMultipartFile file(String[]... rows) throws Exception {
        byte[] template = mvc.perform(get(URL + "/import-template").header("Authorization", auth()))
                .andExpect(status().isOk()).andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andReturn().getResponse().getContentAsByteArray();
        try (var workbook = new XSSFWorkbook(new ByteArrayInputStream(template)); var output = new ByteArrayOutputStream()) {
            var sheet = workbook.getSheetAt(0);
            sheet.removeRow(sheet.getRow(1));
            for (int i = 0; i < rows.length; i++) {
                var row = sheet.createRow(i + 1);
                for (int j = 0; j < rows[i].length; j++) row.createCell(j).setCellValue(rows[i][j]);
            }
            workbook.write(output);
            return new MockMultipartFile("file", "materials.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({ProcessModelingController.class, MaterialImportService.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class})
    static class TestConfig {
        @Bean EntityManager entityManager(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes managedTypes() { return PersistenceManagedTypes.of(Material.class.getName(), MaterialType.class.getName(), AuditEvent.class.getName()); }
        @Bean MaterialRepository materials(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(MaterialRepository.class); }
        @Bean MaterialTypeRepository types(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(MaterialTypeRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("material-import-integration-test-key-at-least-32-characters", 300000); }
    }
}
