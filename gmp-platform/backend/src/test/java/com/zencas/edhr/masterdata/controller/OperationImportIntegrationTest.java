package com.zencas.edhr.masterdata.controller;

import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.entity.Operation;
import com.zencas.edhr.masterdata.entity.OperationCategory;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = OperationImportIntegrationTest.TestConfig.class, properties = {
        "spring.liquibase.enabled=false", "spring.datasource.url=jdbc:h2:mem:operation-import;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
class OperationImportIntegrationTest {
    private static final String URL = "/api/v1/master-data/process-modeling/operations";
    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;
    @Autowired JdbcTemplate jdbc;
    @SpyBean AuditEventRepository audits;
    @MockBean MaterialImportService materialsImport;
    @MockBean MaterialRepository materials;
    @MockBean MaterialTypeRepository materialTypes;
    @MockBean ProductRepository products;
    @MockBean ProductFamilyRepository families;
    @MockBean RouteRepository routes;
    @MockBean RouteVersionRepository versions;
    @MockBean RouteNodeRepository nodes;
    @MockBean RouteRelationRepository relations;
    @MockBean SopDocumentRepository documents;
    @MockBean ProductFamilyMembershipService memberships;
    @MockBean ProductProcessOwnerService owners;

    @BeforeEach
    void reset() {
        jdbc.update("DELETE FROM operation");
        jdbc.update("DELETE FROM operation_category");
        jdbc.update("DELETE FROM audit_event");
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS test_operation_code ON operation(tenant_id,code)");
        jdbc.update("INSERT INTO operation_category(id,tenant_id,name,sort_order) VALUES(1,'default','装配',0)");
    }

    @Test
    void templateHasGuidanceAndEmbeddedDropdowns() throws Exception {
        try (var workbook = new XSSFWorkbook(new ByteArrayInputStream(template()))) {
            var sheet = workbook.getSheetAt(0);
            assertThat(sheet.getRow(0).getCell(0).getStringCellValue()).isEqualTo("工序名称 *");
            assertThat(sheet.getRow(0).getCell(1).getStringCellValue()).isEqualTo("工序编码 *");
            assertThat(sheet.getDataValidations()).hasSize(3);
            assertThat(workbook.getSheet("填写说明")).isNotNull();
            assertThat(workbook.getSheet("选项2").getRow(0).getCell(0).getStringCellValue()).isEqualTo("装配");
            assertThat(workbook.isSheetHidden(workbook.getSheetIndex("选项2"))).isTrue();
        }
    }

    @Test
    void mixedRowsPersistDefaultsCategoriesAndAuditAndSkipRepeatedCodes() throws Exception {
        var file = file(new String[]{"装配一", "OP-1", "装配", "关键工序", "15", "启用", "描述"},
                new String[]{"重复", "op-1", "", "", "", "", ""},
                new String[]{"", "BAD", "", "", "", "", ""},
                new String[]{"装配二", "OP-2", "新分类", "", "0", "禁用", ""},
                new String[]{"未分类", "OP-3", "", "", "", "", ""});
        mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.successCount").value(3))
                .andExpect(jsonPath("$.data.skippedCount").value(1)).andExpect(jsonPath("$.data.failedCount").value(1))
                .andExpect(jsonPath("$.data.failedRows[0].rowNumber").value(4))
                .andExpect(jsonPath("$.data.importedOperations").doesNotExist());
        assertThat(jdbc.queryForObject("SELECT general_description FROM operation WHERE code='OP-1'", String.class)).isEqualTo("描述");
        assertThat(jdbc.queryForObject("SELECT status FROM operation WHERE code='OP-2'", String.class)).isEqualTo("DISABLED");
        assertThat(jdbc.queryForObject("SELECT default_operation_type FROM operation WHERE code='OP-3'", String.class)).isEqualTo("普通工序");
        assertThat(jdbc.queryForObject("SELECT status FROM operation WHERE code='OP-3'", String.class)).isEqualTo("ACTIVE");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM operation_category", Integer.class)).isEqualTo(2);
        assertThat(audits.findAll()).hasSize(3).allSatisfy(event -> {
            assertThat(event.getOperatorName()).isEqualTo("工序验收员");
            assertThat(event.getAction()).isEqualTo("CREATE");
            assertThat(event.getContentAfter()).contains("defaultOperationType");
        });
        mvc.perform(get(URL).header("Authorization", auth())).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(3));
        mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth()))
                .andExpect(jsonPath("$.data.successCount").value(0)).andExpect(jsonPath("$.data.skippedCount").value(4));
        assertThat(audits.count()).isEqualTo(3);
    }

    @Test
    void invalidRowsDoNotCreateCategoriesAndValidRowsStillImport() throws Exception {
        var file = file(new String[]{"长".repeat(129), "BAD-1", "无效分类", "", "", "", ""},
                new String[]{"名称", "长".repeat(65), "", "", "", "", ""},
                new String[]{"名称", "BAD-3", "长".repeat(129), "", "", "", ""},
                new String[]{"名称", "BAD-4", "", "未知类型", "", "", ""},
                new String[]{"名称", "BAD-5", "", "", "1.5", "", ""},
                new String[]{"名称", "BAD-6", "", "", "-1", "", ""},
                new String[]{"名称", "BAD-7", "", "", "2147483648", "", ""},
                new String[]{"名称", "BAD-8", "", "", "", "未知状态", ""},
                new String[]{"长".repeat(128), "C".repeat(64), "", "普通工序", "2147483647", "ACTIVE", ""});
        mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.successCount").value(1))
                .andExpect(jsonPath("$.data.failedCount").value(8));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM operation_category", Integer.class)).isEqualTo(1);
    }

    @Test
    void auditFailureRollsBackOperationsAndNewCategories() throws Exception {
        var file = file(new String[]{"事务", "ROLLBACK", "事务分类", "", "", "", ""});
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(any(AuditEvent.class));
        mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth())).andExpect(status().is5xxServerError());
        assertRolledBack();
    }

    @Test
    void databaseFailureRollsBackEarlierRowsAndCategories() throws Exception {
        var file = file(new String[]{"首行", "OK", "事务分类", "", "", "", ""},
                new String[]{"失败", "FAIL", "", "", "", "", ""});
        jdbc.execute("ALTER TABLE operation ADD CONSTRAINT test_operation_failure CHECK (code <> 'FAIL')");
        try {
            mvc.perform(multipart(URL + "/import").file(file).header("Authorization", auth())).andExpect(status().isBadRequest());
            assertRolledBack();
        } finally {
            jdbc.execute("ALTER TABLE operation DROP CONSTRAINT test_operation_failure");
        }
    }

    @Test
    void rejectsUnauthenticatedRequests() throws Exception {
        mvc.perform(get(URL + "/import-template")).andExpect(status().isUnauthorized());
        mvc.perform(multipart(URL + "/import").file(new MockMultipartFile("file", "a.xlsx", "", new byte[]{1})))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsAuthenticatedUsersWithoutOperationPermission() throws Exception {
        mvc.perform(get(URL).header("Authorization", auth()))
                .andExpect(status().isOk());
        mvc.perform(get(URL).header("Authorization", auth("production.work-orders")))
                .andExpect(status().isForbidden());
        mvc.perform(get(URL + "/import-template").header("Authorization", auth("production.work-orders")))
                .andExpect(status().isForbidden());
    }

    private void assertRolledBack() {
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM operation", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM operation_category", Integer.class)).isEqualTo(1);
        assertThat(audits.count()).isZero();
    }

    private String auth() {
        return auth("master-data.operations");
    }

    private String auth(String... permissions) {
        return "Bearer " + tokens.generateToken("operation-test", "operation-test", "工序验收员", 5, List.of(permissions));
    }

    private byte[] template() throws Exception {
        return mvc.perform(get(URL + "/import-template").header("Authorization", auth()))
                .andExpect(status().isOk()).andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andReturn().getResponse().getContentAsByteArray();
    }

    private MockMultipartFile file(String[]... rows) throws Exception {
        try (var workbook = new XSSFWorkbook(new ByteArrayInputStream(template())); var output = new ByteArrayOutputStream()) {
            var sheet = workbook.getSheetAt(0);
            sheet.removeRow(sheet.getRow(1));
            for (int i = 0; i < rows.length; i++) {
                var row = sheet.createRow(i + 1);
                for (int j = 0; j < rows[i].length; j++) row.createCell(j).setCellValue(rows[i][j]);
            }
            workbook.write(output);
            return new MockMultipartFile("file", "operations.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", output.toByteArray());
        }
    }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({ProcessModelingController.class, OperationImportService.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class})
    static class TestConfig {
        @Bean EntityManager entityManager(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes managedTypes() { return PersistenceManagedTypes.of(Operation.class.getName(), OperationCategory.class.getName(), AuditEvent.class.getName()); }
        @Bean OperationRepository operations(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(OperationRepository.class); }
        @Bean OperationCategoryRepository categories(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(OperationCategoryRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("operation-import-integration-test-key-at-least-32-characters", 300000); }
    }
}
