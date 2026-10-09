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
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.orm.jpa.persistenceunit.PersistenceManagedTypes;
import org.springframework.orm.jpa.SharedEntityManagerCreator;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = EquipmentControllerIntegrationTest.TestConfig.class, properties = {
        "spring.liquibase.enabled=false",
        "spring.datasource.url=${equipment.test.url:jdbc:h2:mem:equipment-modeling;MODE=PostgreSQL;DB_CLOSE_DELAY=-1}",
        "spring.datasource.driver-class-name=${equipment.test.driver:org.h2.Driver}",
        "spring.datasource.username=${equipment.test.user:sa}",
        "spring.datasource.password=",
        "spring.jpa.database-platform=${equipment.test.dialect:org.hibernate.dialect.H2Dialect}",
        "spring.jpa.properties.hibernate.dialect=${equipment.test.dialect:org.hibernate.dialect.H2Dialect}",
        "spring.jpa.hibernate.ddl-auto=update"
})
@AutoConfigureMockMvc
class EquipmentControllerIntegrationTest {
    private static final String URL = "/api/v1/master-data/equipment";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;
    @Autowired JdbcTemplate jdbc;
    @Autowired DataSource dataSource;
    @SpyBean AuditEventRepository audits;

    @BeforeEach
    void reset() {
        jdbc.update("DELETE FROM equipment");
        jdbc.update("DELETE FROM equipment_type");
        jdbc.update("DELETE FROM equipment_category");
        jdbc.update("DELETE FROM audit_event");
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS test_equipment_code ON equipment(code)");
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS test_equipment_type_code ON equipment_type(tenant_id, code)");
        jdbc.execute("CREATE UNIQUE INDEX IF NOT EXISTS test_equipment_category_name ON equipment_category(tenant_id, name)");
        jdbc.update("INSERT INTO equipment_category(id, tenant_id, name, system_category, sort_order) VALUES (-1,'default','生产设备',true,1),(-2,'default','检验设备',true,2),(-3,'default','计量器具',true,3)");
    }

    @Test
    void categoryTypeAndEquipmentCrudPersistRelationsAndAuditSnapshots() throws Exception {
        mvc.perform(authorized(get(URL + "/categories"))).andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("生产设备"))
                .andExpect(jsonPath("$.data[1].name").value("检验设备"))
                .andExpect(jsonPath("$.data[2].name").value("计量器具"));
        String category = create("/categories", Map.of("name", " 辅助设备 ")).path("id").asText();
        String type = create("/types", typeBody("T001", "模温机", category)).path("id").asText();
        JsonNode equipment = create("", equipmentBody("E001", "模温机001", type));
        String id = equipment.path("id").asText();
        assertThat(equipment.path("id").isTextual()).isTrue();
        assertThat(equipment.path("equipmentTypeName").asText()).isEqualTo("模温机");
        assertThat(equipment.path("categoryName").asText()).isEqualTo("辅助设备");
        assertThat(equipment.path("status").asText()).isEqualTo("ACTIVE");
        jdbc.update("UPDATE equipment SET site_id=731 WHERE id=?", Long.valueOf(id));
        String persistedCreatedAt = mapper.readTree(mvc.perform(authorized(get(URL + "/" + id))).andReturn()
                .getResponse().getContentAsString()).path("data").path("createdAt").asText();
        mvc.perform(authorized(put(URL + "/" + id)).contentType("application/json")
                .content(mapper.writeValueAsString(Map.of("code", "E001", "name", "模温机002", "equipmentTypeId", type, "model", "M200", "serialNumber", "SN200", "status", "INACTIVE"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.siteId").value("731"))
                .andExpect(jsonPath("$.data.createdAt").value(persistedCreatedAt));
        mvc.perform(authorized(put(URL + "/categories/" + category)).contentType("application/json").content("{\"name\":\"温控设备\"}"))
                .andExpect(status().isOk());
        mvc.perform(authorized(put(URL + "/types/" + type)).contentType("application/json")
                .content(mapper.writeValueAsString(typeBody("T001", "高温模温机", category)))).andExpect(status().isOk());
        mvc.perform(authorized(get(URL + "/" + id))).andExpect(jsonPath("$.data.categoryName").value("温控设备"))
                .andExpect(jsonPath("$.data.equipmentTypeName").value("高温模温机"));
        mvc.perform(authorized(delete(URL + "/" + id))).andExpect(status().isOk());
        mvc.perform(authorized(delete(URL + "/types/" + type))).andExpect(status().isOk());
        mvc.perform(authorized(delete(URL + "/categories/" + category))).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM equipment", Integer.class)).isZero();
        var records = audits.findAll();
        assertThat(records).hasSize(9);
        assertThat(records).allSatisfy(event -> assertThat(event.getSnapshotHash()).matches("[0-9a-f]{64}"));
        var update = records.stream().filter(e -> e.getEntityType().equals("EQUIPMENT") && e.getAction().equals("UPDATE")).findFirst().orElseThrow();
        assertThat(mapper.readTree(update.getContentBefore()).path("name").asText()).isEqualTo("模温机001");
        assertThat(mapper.readTree(update.getContentAfter()).path("name").asText()).isEqualTo("模温机002");
    }

    @Test
    void descriptionsPersistForTypesAndEquipmentAndAppearInAudit() throws Exception {
        var typeBody = new java.util.HashMap<String, Object>(typeBody("DESC-T", "描述类型", "-1"));
        typeBody.put("description", "  类型说明  ");
        String typeId = create("/types", typeBody).path("id").asText();
        var equipmentBody = new java.util.HashMap<String, Object>(equipmentBody("DESC-E", "描述设备", typeId));
        equipmentBody.put("description", "  设备说明  ");
        String equipmentId = create("", equipmentBody).path("id").asText();

        mvc.perform(authorized(get(URL + "/types/" + typeId))).andExpect(jsonPath("$.data.description").value("类型说明"));
        mvc.perform(authorized(get(URL + "/" + equipmentId))).andExpect(jsonPath("$.data.description").value("设备说明"));
        assertThat(jdbc.queryForObject("SELECT description FROM equipment_type WHERE id=?", String.class, Long.valueOf(typeId))).isEqualTo("类型说明");
        assertThat(jdbc.queryForObject("SELECT description FROM equipment WHERE id=?", String.class, Long.valueOf(equipmentId))).isEqualTo("设备说明");

        equipmentBody.put("description", "更新后的描述");
        mvc.perform(authorized(put(URL + "/" + equipmentId)).contentType("application/json")
                .content(mapper.writeValueAsString(equipmentBody)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.description").value("更新后的描述"));
        var audit = audits.findAll().stream().filter(event -> "EQUIPMENT".equals(event.getEntityType()) && "UPDATE".equals(event.getAction())).findFirst().orElseThrow();
        assertThat(mapper.readTree(audit.getContentBefore()).path("description").asText()).isEqualTo("设备说明");
        assertThat(mapper.readTree(audit.getContentAfter()).path("description").asText()).isEqualTo("更新后的描述");
    }

    @Test
    void systemFieldsPersistRealOperatorsAndPreserveCreationMetadata() throws Exception {
        JsonNode type = create("/types", typeBody("META-T", "系统字段类型", "-1"));
        JsonNode equipment = create("", equipmentBody("META-E", "系统字段设备", type.path("id").asText()));
        String editorToken = tokens.generateToken("equipment-editor", "editor-account", "设备编辑员", 5, List.of("master-data.equipment"));
        for (var row : List.of(type, equipment)) {
            boolean isType = row == type;
            String path = isType ? "/types" : "";
            assertThat(row.path("createdBy").asText()).isEqualTo("设备管理员");
            assertThat(row.path("updatedBy").asText()).isEqualTo("设备管理员");
            String id = row.path("id").asText();
            var body = new java.util.HashMap<String, Object>(isType
                    ? typeBody("META-T", "类型编辑后", "-1")
                    : equipmentBody("META-E", "设备编辑后", type.path("id").asText()));
            body.put("createdBy", "伪造创建人");
            body.put("updatedBy", "伪造更新人");
            body.put("createdAt", "2000-01-01T00:00:00");
            mvc.perform(put(URL + path + "/" + id).header("Authorization", "Bearer " + editorToken)
                    .contentType("application/json").content(mapper.writeValueAsString(body)))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.data.createdBy").value("设备管理员"))
                    .andExpect(jsonPath("$.data.updatedBy").value("设备编辑员"))
                    .andExpect(jsonPath("$.data.createdAt").value(row.path("createdAt").asText()));
            mvc.perform(authorized(get(URL + path)).param("keyword", isType ? "META-T" : "META-E"))
                    .andExpect(jsonPath("$.data.content[0].createdBy").value("设备管理员"))
                    .andExpect(jsonPath("$.data.content[0].updatedBy").value("设备编辑员"))
                    .andExpect(jsonPath("$.data.content[0].updatedAt").isNotEmpty());
            String table = isType ? "equipment_type" : "equipment";
            assertThat(jdbc.queryForObject("SELECT created_by FROM " + table + " WHERE id=?", String.class, Long.valueOf(id))).isEqualTo("设备管理员");
            assertThat(jdbc.queryForObject("SELECT updated_by FROM " + table + " WHERE id=?", String.class, Long.valueOf(id))).isEqualTo("设备编辑员");
        }
    }

    @Test
    void purchaseDateAllowsTodayPastAndEmptyButRejectsFutureWithoutWrites() throws Exception {
        String type = create("/types", typeBody("DATE-T", "采购日期设备类型", "-1")).path("id").asText();
        var today = java.time.LocalDate.now();
        var body = new java.util.HashMap<String, Object>(equipmentBody("DATE-E", "采购日期设备", type));
        body.put("purchaseDate", today.plusDays(1).toString());
        mvc.perform(authorized(post(URL)).contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("采购时间不能晚于今天"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM equipment", Integer.class)).isZero();
        body.put("purchaseDate", today.toString());
        String id = create("", body).path("id").asText();
        long auditCount = audits.count();
        body.put("purchaseDate", today.plusDays(1).toString());
        mvc.perform(authorized(put(URL + "/" + id)).contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("采购时间不能晚于今天"));
        assertThat(jdbc.queryForObject("SELECT purchase_date FROM equipment WHERE id=?", java.sql.Date.class, Long.valueOf(id)))
                .isEqualTo(java.sql.Date.valueOf(today));
        assertThat(audits.count()).isEqualTo(auditCount);
        for (String date : List.of(today.minusDays(1).toString(), today.toString(), "")) {
            body.put("purchaseDate", date);
            mvc.perform(authorized(put(URL + "/" + id)).contentType("application/json").content(mapper.writeValueAsString(body)))
                    .andExpect(status().isOk());
        }
        assertThat(jdbc.queryForObject("SELECT purchase_date FROM equipment WHERE id=?", java.sql.Date.class, Long.valueOf(id))).isNull();
    }

    @Test
    void brandAndPurchaseDatePersistClearAndAuditWithoutChangingOtherEquipmentFields() throws Exception {
        String type = create("/types", typeBody("BRAND-T", "注塑机", "-1")).path("id").asText();
        var body = new java.util.HashMap<String, Object>(equipmentBody("BRAND-E", "注塑机01", type));
        body.put("brand", " 海天 ");
        body.put("purchaseDate", "2024-02-29");
        body.put("model", "M100");
        JsonNode device = create("", body);
        String id = device.path("id").asText();
        assertThat(device.path("brand").asText()).isEqualTo("海天");
        assertThat(device.path("purchaseDate").asText()).isEqualTo("2024-02-29");
        mvc.perform(authorized(get(URL)).param("keyword", "BRAND-E"))
                .andExpect(jsonPath("$.data.content[0].brand").value("海天"))
                .andExpect(jsonPath("$.data.content[0].purchaseDate").value("2024-02-29"));
        assertThat(jdbc.queryForObject("SELECT purchase_date FROM equipment WHERE id=?", java.sql.Date.class, Long.valueOf(id)))
                .isEqualTo(java.sql.Date.valueOf("2024-02-29"));
        for (String date : List.of("2025-02-29", "2024-13-01", "not-a-date")) {
            body.put("purchaseDate", date);
            mvc.perform(authorized(put(URL + "/" + id)).contentType("application/json").content(mapper.writeValueAsString(body)))
                    .andExpect(status().isBadRequest());
        }
        body.put("purchaseDate", "2025-06-20");
        body.put("brand", "牌".repeat(129));
        mvc.perform(authorized(put(URL + "/" + id)).contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
        body.put("brand", "震雄");
        mvc.perform(authorized(put(URL + "/" + id)).contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.brand").value("震雄"))
                .andExpect(jsonPath("$.data.purchaseDate").value("2025-06-20"));
        body.put("brand", " ");
        body.put("purchaseDate", null);
        mvc.perform(authorized(put(URL + "/" + id)).contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.brand").doesNotExist())
                .andExpect(jsonPath("$.data.purchaseDate").doesNotExist()).andExpect(jsonPath("$.data.model").value("M100"));
        assertThat(jdbc.queryForObject("SELECT brand FROM equipment WHERE id=?", String.class, Long.valueOf(id))).isNull();
        assertThat(jdbc.queryForObject("SELECT purchase_date FROM equipment WHERE id=?", java.sql.Date.class, Long.valueOf(id))).isNull();
        var changes = audits.findAll().stream().filter(e -> e.getEntityType().equals("EQUIPMENT") && e.getAction().equals("UPDATE"))
                .sorted(java.util.Comparator.comparing(AuditEvent::getCreatedAt)).toList();
        assertThat(changes).hasSize(2);
        assertThat(mapper.readTree(changes.getFirst().getContentBefore()).path("brand").asText()).isEqualTo("海天");
        assertThat(mapper.readTree(changes.getFirst().getContentAfter()).path("purchaseDate").asText()).isEqualTo("2025-06-20");
        assertThat(mapper.readTree(changes.getLast().getContentBefore()).path("purchaseDate").asText()).isEqualTo("2025-06-20");
        assertThat(mapper.readTree(changes.getLast().getContentAfter()).path("purchaseDate").isMissingNode()).isTrue();
    }

    @Test
    void builtinsAndReferencedParentsCannotBeDeleted() throws Exception {
        mvc.perform(authorized(delete(URL + "/categories/-1"))).andExpect(status().isBadRequest());
        mvc.perform(authorized(put(URL + "/categories/-1")).contentType("application/json").content("{\"name\":\"覆盖\"}"))
                .andExpect(status().isBadRequest());
        String category = create("/categories", Map.of("name", "辅助设备")).path("id").asText();
        String type = create("/types", typeBody("T001", "模温机", category)).path("id").asText();
        create("", equipmentBody("E001", "模温机001", type));
        mvc.perform(authorized(delete(URL + "/categories/" + category))).andExpect(status().isBadRequest());
        mvc.perform(authorized(delete(URL + "/types/" + type))).andExpect(status().isBadRequest());
        assertThat(audits.count()).isEqualTo(3);
    }

    @Test
    void invalidInputsDuplicatesAndMissingUpdatesDoNotCreateRecords() throws Exception {
        String type = create("/types", typeBody("T001", "注塑机", "-1")).path("id").asText();
        create("", equipmentBody("E001", "注塑机001", type));
        for (Map<String, ?> body : List.of(typeBody("T001", "重复", "-1"), typeBody(" ", "空编码", "-1"),
                typeBody("T002", "缺分类", "999"), typeBody("T002", "缺分类", ""), typeBody("T002", "长".repeat(129), "-1"))) {
            mvc.perform(authorized(post(URL + "/types")).contentType("application/json").content(mapper.writeValueAsString(body)))
                    .andExpect(status().isBadRequest());
        }
        for (Map<String, ?> body : List.of(equipmentBody("E001", "重复", type), equipmentBody("E002", "无类型", "999"),
                Map.of("code", "E002", "name", "缺类型"), Map.of("code", "E002", "name", "非法状态", "equipmentTypeId", type, "status", "BROKEN"))) {
            mvc.perform(authorized(post(URL)).contentType("application/json").content(mapper.writeValueAsString(body)))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(authorized(post(URL + "/categories")).contentType("application/json").content("{\"name\":\" 生产设备 \"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(authorized(put(URL + "/999")).contentType("application/json").content(mapper.writeValueAsString(equipmentBody("E999", "不存在", type))))
                .andExpect(status().isBadRequest());
        mvc.perform(authorized(get(URL)).param("sort", "notAField")).andExpect(status().isBadRequest());
        mvc.perform(authorized(get(URL + "/types")).param("categoryId", "oops")).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM equipment", Integer.class)).isEqualTo(1);
        assertThat(audits.count()).isEqualTo(2);
    }

    @Test
    void filtersPaginationAndLegacyUncategorizedTypesRemainReadable() throws Exception {
        String first = create("/types", typeBody("T001", "注塑机", "-1")).path("id").asText();
        String second = create("/types", typeBody("T002", "温度计", "-3")).path("id").asText();
        jdbc.update("INSERT INTO equipment_type(id,tenant_id,code,name) VALUES (99,'default','LEGACY','历史类型')");
        create("", equipmentBody("E001", "注塑机001", first));
        create("", equipmentBody("E002", "温度计001", second));
        mvc.perform(authorized(get(URL + "/types")).param("categoryId", "-1")).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(authorized(get(URL + "/types")).param("categoryId", "uncategorized")).andExpect(jsonPath("$.data.content[0].name").value("历史类型"));
        mvc.perform(authorized(get(URL + "/types")).param("keyword", "历史")).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(authorized(get(URL)).param("equipmentTypeId", first)).andExpect(jsonPath("$.data.content[0].code").value("E001"));
        mvc.perform(authorized(get(URL)).param("keyword", "温度")).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(authorized(get(URL)).param("keyword", "%")).andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(authorized(get(URL)).param("page", "2").param("size", "1"))
                .andExpect(jsonPath("$.data.content.length()").value(1)).andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    void anonymousAndUsersWithoutEquipmentPermissionCannotAccessAnyLevel() throws Exception {
        for (String suffix : List.of("", "/types", "/categories")) {
            mvc.perform(get(URL + suffix)).andExpect(status().isUnauthorized());
            mvc.perform(get(URL + suffix).header("Authorization", "Bearer " + tokens.generateToken("reader", "reader", "普通用户", 5, List.of())))
                    .andExpect(status().isForbidden());
            mvc.perform(post(URL + suffix).header("Authorization", "Bearer " + tokens.generateToken("reader", "reader", "普通用户", 5, List.of()))
                    .contentType("application/json").content("{}"))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void auditFailureRollsBackEquipmentWrite() throws Exception {
        String type = create("/types", typeBody("T001", "注塑机", "-1")).path("id").asText();
        doThrow(new IllegalStateException("test audit failure")).when(audits).save(any(AuditEvent.class));
        mvc.perform(authorized(post(URL)).contentType("application/json").content(mapper.writeValueAsString(equipmentBody("E001", "注塑机001", type))))
                .andExpect(status().isInternalServerError());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM equipment", Integer.class)).isZero();
    }

    @Test
    void concurrentDuplicateEquipmentCodesHaveExactlyOneWinner() throws Exception {
        String type = create("/types", typeBody("T001", "注塑机", "-1")).path("id").asText();
        String body = mapper.writeValueAsString(equipmentBody("E001", "注塑机001", type));
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> mvc.perform(authorized(post(URL)).contentType("application/json").content(body)).andReturn().getResponse().getStatus());
            var second = executor.submit(() -> mvc.perform(authorized(post(URL)).contentType("application/json").content(body)).andReturn().getResponse().getStatus());
            assertThat(List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS))).containsExactlyInAnyOrder(200, 400);
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM equipment", Integer.class)).isEqualTo(1);
    }

    @Test
    void migrationPreservesLegacyDataAppliesOnceAndRollsBackOnlyNewStructure() throws Exception {
        String schema = "equipment_migration_" + java.util.UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("CREATE SCHEMA " + schema);
        try (var connection = dataSource.getConnection()) {
            String originalSchema = connection.getSchema();
            boolean postgres = connection.getMetaData().getDatabaseProductName().equals("PostgreSQL");
            connection.setSchema(postgres ? schema : schema.toUpperCase(java.util.Locale.ROOT));
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE TABLE equipment_type(id BIGINT PRIMARY KEY, tenant_id VARCHAR(64), code VARCHAR(64), name VARCHAR(128))");
                statement.execute("CREATE TABLE equipment(id BIGINT PRIMARY KEY, equipment_type_id BIGINT NOT NULL, code VARCHAR(64), name VARCHAR(128))");
                statement.execute("INSERT INTO equipment_type VALUES (1,'default','LEGACY','历史类型')");
                statement.execute("INSERT INTO equipment VALUES (2,1,'LEGACY001','历史设备'),(3,999,'ORPHAN','历史孤立引用')");
            }
            var database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
            database.setDefaultSchemaName(schema);
            database.setLiquibaseSchemaName(schema);
            try (var liquibase = new Liquibase("db/changelog/0073-equipment-modeling.sql", new ClassLoaderResourceAccessor(), database)) {
                try {
                liquibase.update(new Contexts(), new LabelExpression());
                liquibase.update(new Contexts(), new LabelExpression());
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".equipment_category", Integer.class)).isEqualTo(3);
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".equipment_type WHERE category_id IS NULL AND code='LEGACY'", Integer.class)).isEqualTo(1);
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".equipment", Integer.class)).isEqualTo(2);
                assertThatThrownBy(() -> jdbc.update("INSERT INTO " + schema + ".equipment_category(id,name) VALUES(10,'生产设备')"))
                        .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
                if (postgres) {
                    assertThatThrownBy(() -> jdbc.update("INSERT INTO " + schema + ".equipment VALUES(4,999,'NEW','无效新引用')"))
                            .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
                }
                liquibase.rollback(postgres ? 2 : 1, new Contexts(), new LabelExpression());
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".equipment", Integer.class)).isEqualTo(2);
                assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".databasechangelog", Integer.class)).isZero();
                } finally {
                    connection.setSchema(originalSchema);
                }
            }
        } finally {
            jdbc.execute("DROP SCHEMA " + schema + " CASCADE");
        }
    }

    @Test
    void systemFieldMigrationUsesOnlyMatchingAuditEvidenceAndPreservesHistoricalTimes() throws Exception {
        String schema = "equipment_metadata_" + java.util.UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("CREATE SCHEMA " + schema);
        try (var connection = dataSource.getConnection()) {
            String originalSchema = connection.getSchema();
            boolean postgres = connection.getMetaData().getDatabaseProductName().equals("PostgreSQL");
            connection.setSchema(postgres ? schema : schema.toUpperCase(java.util.Locale.ROOT));
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE TABLE audit_event(id BIGINT PRIMARY KEY, tenant_id VARCHAR(64), entity_type VARCHAR(64), entity_id VARCHAR(64), action VARCHAR(16), operator_name VARCHAR(128), operator_account VARCHAR(128), created_at TIMESTAMP)");
                for (String table : List.of("equipment_type", "equipment")) {
                    statement.execute("CREATE TABLE " + table + "(id BIGINT PRIMARY KEY, tenant_id VARCHAR(64), created_at TIMESTAMP, updated_at TIMESTAMP)");
                    statement.execute("INSERT INTO " + table + " VALUES(1,'default','2020-01-01 10:00:00','2021-01-01 10:00:00'),(2,'default','2020-01-01 10:00:00',NULL),(3,'default','2020-01-01 10:00:00',NULL)");
                }
                statement.execute("INSERT INTO audit_event VALUES "
                        + "(1,'default','EQUIPMENT_TYPE','1','CREATE','类型创建人','creator','2020-01-01'),"
                        + "(2,'default','EQUIPMENT_TYPE','1','UPDATE','早期更新人','early','2021-01-01'),"
                        + "(3,'default','EQUIPMENT_TYPE','1','UPDATE','  ','type-editor','2021-01-01'),"
                        + "(4,'other','EQUIPMENT_TYPE','1','CREATE','错误租户','other','2019-01-01'),"
                        + "(5,'other','EQUIPMENT_TYPE','1','UPDATE','错误租户','other','2022-01-01'),"
                        + "(6,'default','EQUIPMENT_TYPE','1','DELETE','删除人','deleter','2023-01-01'),"
                        + "(7,'default','EQUIPMENT','1','CREATE','设备创建人','creator','2020-01-01'),"
                        + "(8,'default','EQUIPMENT','1','UPDATE','设备更新人','editor','2021-01-01'),"
                        + "(9,'other','EQUIPMENT','1','UPDATE','错误租户','other','2022-01-01'),"
                        + "(10,'default','EQUIPMENT','3','CREATE',NULL,NULL,'2020-01-01')");
            }
            var database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
            database.setDefaultSchemaName(schema);
            database.setLiquibaseSchemaName(schema);
            try (var liquibase = new Liquibase("db/changelog/0074-equipment-system-fields.sql", new ClassLoaderResourceAccessor(), database)) {
                try {
                    liquibase.update(new Contexts(), new LabelExpression());
                    liquibase.update(new Contexts(), new LabelExpression());
                    assertThat(jdbc.queryForObject("SELECT created_by FROM " + schema + ".equipment_type WHERE id=1", String.class)).isEqualTo("类型创建人");
                    assertThat(jdbc.queryForObject("SELECT updated_by FROM " + schema + ".equipment_type WHERE id=1", String.class)).isEqualTo("type-editor");
                    assertThat(jdbc.queryForObject("SELECT created_by FROM " + schema + ".equipment WHERE id=1", String.class)).isEqualTo("设备创建人");
                    assertThat(jdbc.queryForObject("SELECT updated_by FROM " + schema + ".equipment WHERE id=1", String.class)).isEqualTo("设备更新人");
                    for (String table : List.of("equipment_type", "equipment")) {
                        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + "." + table + " WHERE id IN (2,3) AND created_by IS NULL AND updated_by IS NULL", Integer.class)).isEqualTo(2);
                        assertThat(jdbc.queryForObject("SELECT updated_at FROM " + schema + "." + table + " WHERE id=1", java.sql.Timestamp.class)).isEqualTo(java.sql.Timestamp.valueOf("2021-01-01 10:00:00"));
                    }
                    liquibase.rollback(1, new Contexts(), new LabelExpression());
                    assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".equipment", Integer.class)).isEqualTo(3);
                    assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".audit_event", Integer.class)).isEqualTo(10);
                    assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM information_schema.columns WHERE LOWER(table_schema)=? AND LOWER(column_name) IN ('created_by','updated_by')", Integer.class, schema)).isZero();
                } finally { connection.setSchema(originalSchema); }
            }
        } finally { jdbc.execute("DROP SCHEMA " + schema + " CASCADE"); }
    }

    @Test
    void purchaseFieldMigrationPreservesLegacyRowsAndRollsBackOnlyAddedColumns() throws Exception {
        String schema = "equipment_purchase_" + java.util.UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("CREATE SCHEMA " + schema);
        try (var connection = dataSource.getConnection()) {
            String originalSchema = connection.getSchema();
            boolean postgres = connection.getMetaData().getDatabaseProductName().equals("PostgreSQL");
            connection.setSchema(postgres ? schema : schema.toUpperCase(java.util.Locale.ROOT));
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE TABLE equipment(id BIGINT PRIMARY KEY, name VARCHAR(128), model VARCHAR(128))");
                statement.execute("INSERT INTO equipment VALUES(1,'历史设备','M100')");
            }
            var database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
            database.setDefaultSchemaName(schema);
            database.setLiquibaseSchemaName(schema);
            try (var liquibase = new Liquibase("db/changelog/0075-equipment-brand-purchase-date.sql", new ClassLoaderResourceAccessor(), database)) {
                try {
                    liquibase.update(new Contexts(), new LabelExpression());
                    liquibase.update(new Contexts(), new LabelExpression());
                    assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM " + schema + ".equipment WHERE id=1 AND model='M100' AND brand IS NULL AND purchase_date IS NULL", Integer.class)).isEqualTo(1);
                    jdbc.update("UPDATE " + schema + ".equipment SET brand='海天',purchase_date='2024-02-29' WHERE id=1");
                    assertThat(jdbc.queryForObject("SELECT purchase_date FROM " + schema + ".equipment WHERE id=1", java.sql.Date.class)).isEqualTo(java.sql.Date.valueOf("2024-02-29"));
                    liquibase.rollback(1, new Contexts(), new LabelExpression());
                    assertThat(jdbc.queryForObject("SELECT model FROM " + schema + ".equipment WHERE id=1", String.class)).isEqualTo("M100");
                    assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM information_schema.columns WHERE LOWER(table_schema)=? AND LOWER(column_name) IN ('brand','purchase_date')", Integer.class, schema)).isZero();
                } finally { connection.setSchema(originalSchema); }
            }
        } finally { jdbc.execute("DROP SCHEMA " + schema + " CASCADE"); }
    }

    @Test
    void descriptionMigrationPreservesExistingEquipmentAndRollsBackAddedColumns() throws Exception {
        String schema = "equipment_description_" + java.util.UUID.randomUUID().toString().replace("-", "");
        jdbc.execute("CREATE SCHEMA " + schema);
        try (var connection = dataSource.getConnection()) {
            String originalSchema = connection.getSchema();
            boolean postgres = connection.getMetaData().getDatabaseProductName().equals("PostgreSQL");
            connection.setSchema(postgres ? schema : schema.toUpperCase(java.util.Locale.ROOT));
            try (var statement = connection.createStatement()) {
                statement.execute("CREATE TABLE equipment_type(id BIGINT PRIMARY KEY, name VARCHAR(128))");
                statement.execute("CREATE TABLE equipment(id BIGINT PRIMARY KEY, name VARCHAR(128))");
                statement.execute("INSERT INTO equipment_type VALUES(1,'历史类型')");
                statement.execute("INSERT INTO equipment VALUES(1,'历史设备')");
            }
            var database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(connection));
            database.setDefaultSchemaName(schema);
            database.setLiquibaseSchemaName(schema);
            try (var liquibase = new Liquibase("db/changelog/0094-equipment-description.sql", new ClassLoaderResourceAccessor(), database)) {
                try {
                    liquibase.update(new Contexts(), new LabelExpression());
                    liquibase.update(new Contexts(), new LabelExpression());
                    assertThat(jdbc.queryForObject("SELECT description FROM " + schema + ".equipment_type WHERE id=1", String.class)).isNull();
                    assertThat(jdbc.queryForObject("SELECT description FROM " + schema + ".equipment WHERE id=1", String.class)).isNull();
                    liquibase.rollback(1, new Contexts(), new LabelExpression());
                    assertThat(jdbc.queryForObject("SELECT name FROM " + schema + ".equipment_type WHERE id=1", String.class)).isEqualTo("历史类型");
                    assertThat(jdbc.queryForObject("SELECT name FROM " + schema + ".equipment WHERE id=1", String.class)).isEqualTo("历史设备");
                    assertThat(jdbc.queryForList("SELECT table_name FROM information_schema.columns WHERE LOWER(table_schema)=? AND LOWER(table_name) IN ('equipment_type','equipment') AND LOWER(column_name)='description'", String.class, schema)).isEmpty();
                } finally { connection.setSchema(originalSchema); }
            }
        } finally { jdbc.execute("DROP SCHEMA " + schema + " CASCADE"); }
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder request) {
        return request.header("Authorization", "Bearer " + tokens.generateToken("equipment-admin", "equipment-admin", "设备管理员", 5, List.of("master-data.equipment")));
    }
    private JsonNode create(String suffix, Map<String, ?> body) throws Exception {
        String json = mvc.perform(authorized(post(URL + suffix)).contentType("application/json").content(mapper.writeValueAsString(body)))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        return mapper.readTree(json).path("data");
    }
    private Map<String, String> typeBody(String code, String name, String category) { return Map.of("code", code, "name", name, "categoryId", category); }
    private Map<String, String> equipmentBody(String code, String name, String type) { return Map.of("code", code, "name", name, "equipmentTypeId", type); }

    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = JpaRepositoriesAutoConfiguration.class)
    @Import({EquipmentController.class, GlobalExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class})
    static class TestConfig {
        @Bean EntityManager entityManager(EntityManagerFactory factory) { return SharedEntityManagerCreator.createSharedEntityManager(factory); }
        @Bean PersistenceManagedTypes managedTypes() { return PersistenceManagedTypes.of(Equipment.class.getName(), EquipmentType.class.getName(), EquipmentCategory.class.getName(), AuditEvent.class.getName()); }
        @Bean EquipmentRepository equipment(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(EquipmentRepository.class); }
        @Bean EquipmentTypeRepository types(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(EquipmentTypeRepository.class); }
        @Bean EquipmentCategoryRepository categories(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(EquipmentCategoryRepository.class); }
        @Bean AuditEventRepository audits(EntityManager em) { return new JpaRepositoryFactory(em).getRepository(AuditEventRepository.class); }
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("equipment-integration-test-key-at-least-32-characters", 300000); }
    }
}
