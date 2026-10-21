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
import com.zencas.edhr.masterdata.service.QualityReasonUsageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = QualityReasonControllerIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.datasource.url=jdbc:h2:mem:quality-reasons;MODE=PostgreSQL;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password=", "spring.datasource.driver-class-name=org.h2.Driver"
})
@AutoConfigureMockMvc
class QualityReasonControllerIntegrationTest {
    private static final String URL = "/api/v1/master-data/quality-reasons/";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired JwtTokenProvider tokens;
    @MockBean AuditEventRepository audits;

    @BeforeEach void resetDatabase() {
        jdbc.execute("DROP TABLE IF EXISTS quality_reason");
        jdbc.execute("CREATE TABLE quality_reason(id BIGINT PRIMARY KEY, tenant_id VARCHAR(64) NOT NULL, reason_type VARCHAR(16) NOT NULL, code VARCHAR(64) NOT NULL, name VARCHAR(128) NOT NULL, description VARCHAR(512), status VARCHAR(16) NOT NULL, sort_order INT NOT NULL, created_by VARCHAR(192), updated_by VARCHAR(192), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, code_key VARCHAR(64) GENERATED ALWAYS AS (LOWER(code)), UNIQUE(tenant_id, reason_type, code_key))");
        jdbc.execute("CREATE TABLE IF NOT EXISTS form_template_version(tenant_id VARCHAR(64), model_design_json TEXT, canvas_design_json TEXT, structure_snapshot TEXT)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS form_instance_record(tenant_id VARCHAR(64), values_json TEXT)");
        jdbc.execute("CREATE TABLE IF NOT EXISTS production_object(id BIGINT, tenant_id VARCHAR(64))");
        jdbc.execute("CREATE TABLE IF NOT EXISTS production_execution(object_id BIGINT, snapshot_json TEXT, state_json TEXT)");
        jdbc.update("DELETE FROM form_template_version"); jdbc.update("DELETE FROM form_instance_record");
        jdbc.update("DELETE FROM production_execution"); jdbc.update("DELETE FROM production_object");
    }

    @Test void crudPersistsTypeAndEmitsAudits() throws Exception {
        JsonNode created = create("DEFECT", Map.of("code", " QA-01 ", "name", " 虚拟划伤 ", "description", " 虚拟测试 "));
        String id = created.path("id").asText();
        assertThat(created.path("id").isTextual()).isTrue();
        assertThat(created.path("code").asText()).isEqualTo("QA-01");
        assertThat(created.path("status").asText()).isEqualTo("ACTIVE");
        String createdAt = created.path("createdAt").asText();
        mvc.perform(auth(put(URL + "DEFECT/" + id)).contentType("application/json").content("{\"code\":\"QA-01\",\"name\":\"虚拟更新\",\"status\":\"INACTIVE\",\"sortOrder\":4}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.createdAt").value(createdAt)).andExpect(jsonPath("$.data.sortOrder").value(4));
        mvc.perform(auth(get(URL + "DEFECT/" + id))).andExpect(jsonPath("$.data.name").value("虚拟更新"));
        mvc.perform(auth(delete(URL + "DEFECT/" + id))).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM quality_reason", Integer.class)).isZero();
        ArgumentCaptor<AuditEvent> records = ArgumentCaptor.forClass(AuditEvent.class);
        verify(audits, times(3)).save(records.capture());
        assertThat(records.getAllValues()).extracting(AuditEvent::getAction).containsExactly("CREATE", "UPDATE", "DELETE");
        assertThat(records.getAllValues()).allMatch(event -> "DEFECT_REASON".equals(event.getEntityType()));
        assertThat(mapper.readTree(records.getAllValues().get(1).getContentBefore()).path("name").asText()).isEqualTo("虚拟划伤");
    }

    @Test void duplicateCodesAreCaseInsensitiveWithinTypeButIndependentAcrossDirectories() throws Exception {
        create("DEFECT", Map.of("code", "SAME", "name", "虚拟不良"));
        mvc.perform(auth(post(URL + "DEFECT")).contentType("application/json").content("{\"code\":\"same\",\"name\":\"重复\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("原因编码已存在"));
        create("SCRAP", Map.of("code", "SAME", "name", "虚拟报废"));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM quality_reason", Integer.class)).isEqualTo(2);
    }

    @Test void filtersPaginationAndCrossTypeIdsAreIsolated() throws Exception {
        String defect = create("DEFECT", Map.of("code", "QA-01", "name", "虚拟划伤")).path("id").asText();
        create("DEFECT", Map.of("code", "QA-02", "name", "虚拟变形", "status", "INACTIVE"));
        create("SCRAP", Map.of("code", "QA-01", "name", "虚拟报废"));
        mvc.perform(auth(get(URL + "DEFECT")).param("page", "2").param("size", "1")).andExpect(jsonPath("$.data.totalElements").value(2)).andExpect(jsonPath("$.data.content[0].code").value("QA-02"));
        mvc.perform(auth(get(URL + "DEFECT")).param("keyword", "划伤").param("status", "ACTIVE")).andExpect(jsonPath("$.data.totalElements").value(1));
        mvc.perform(auth(get(URL + "DEFECT")).param("keyword", "%")).andExpect(jsonPath("$.data.totalElements").value(0));
        mvc.perform(auth(get(URL + "SCRAP/" + defect))).andExpect(status().isBadRequest());
        mvc.perform(auth(delete(URL + "SCRAP/" + defect))).andExpect(status().isBadRequest());
    }

    @Test void usedReasonsCannotBeDeletedOrRekeyedButCanBeDisabled() throws Exception {
        String id = create("SCRAP", Map.of("code", "USE-01", "name", "虚拟已用原因")).path("id").asText();
        jdbc.update("INSERT INTO form_instance_record VALUES ('default', ?)", "{\"scrap\":{\"id\":\"" + id + "\",\"sourceType\":\"scrapReason\",\"name\":\"虚拟已用原因\"}}");
        mvc.perform(auth(delete(URL + "SCRAP/" + id))).andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("原因已被表单配置或填报使用，不能删除，请停用该原因"));
        mvc.perform(auth(put(URL + "SCRAP/" + id)).contentType("application/json").content("{\"code\":\"NEW\",\"name\":\"虚拟已用原因\"}")).andExpect(status().isBadRequest());
        mvc.perform(auth(put(URL + "SCRAP/" + id)).contentType("application/json").content("{\"code\":\"USE-01\",\"name\":\"虚拟已用原因\",\"status\":\"INACTIVE\"}")).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM form_instance_record", Integer.class)).isEqualTo(1);
    }

    @Test void templateDefaultProtectsOnlyTheSelectedReason() throws Exception {
        String selected = create("DEFECT", Map.of("code", "D-01", "name", "虚拟默认原因")).path("id").asText();
        String unused = create("DEFECT", Map.of("code", "D-02", "name", "虚拟未用原因")).path("id").asText();
        jdbc.update("INSERT INTO form_template_version VALUES ('default', ?, null, null)", "{\"fields\":[{\"typeConfig\":{\"sourceType\":\"defectReason\"},\"defaultValue\":{\"id\":\"" + selected + "\"}}]}");
        mvc.perform(auth(delete(URL + "DEFECT/" + selected))).andExpect(status().isBadRequest());
        mvc.perform(auth(delete(URL + "DEFECT/" + unused))).andExpect(status().isOk());
    }

    @Test void frozenCanvasDefaultProtectsHistoricalIdentityAfterDesignChanges() throws Exception {
        String id = create("DEFECT", Map.of("code", "FROZEN", "name", "虚拟冻结原因")).path("id").asText();
        jdbc.update("INSERT INTO production_object VALUES (1, 'default')");
        jdbc.update("INSERT INTO production_execution VALUES (1, ?, '{}')", "{\"bindings\":{\"widgetConfig\":{\"referenceSourceType\":\"defectReason\"},\"defaultValue\":{\"id\":\"" + id + "\"}}}");
        mvc.perform(auth(delete(URL + "DEFECT/" + id))).andExpect(status().isBadRequest());
    }

    @Test void auditFailureRollsBackDataWrite() throws Exception {
        doThrow(new IllegalStateException("simulated audit failure")).when(audits).save(any(AuditEvent.class));
        mvc.perform(auth(post(URL + "DEFECT")).contentType("application/json").content("{\"code\":\"FAIL\",\"name\":\"虚拟回滚\"}")).andExpect(status().isInternalServerError());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM quality_reason", Integer.class)).isZero();
    }

    @Test void invalidInputsAndMissingUpdatesAreRejected() throws Exception {
        for (String json : List.of("{}", "{\"code\":\" \",\"name\":\"空\"}", "{\"code\":\"T\",\"name\":\"虚拟\",\"status\":\"UNKNOWN\"}")) {
            mvc.perform(auth(post(URL + "DEFECT")).contentType("application/json").content(json)).andExpect(status().isBadRequest());
        }
        mvc.perform(auth(put(URL + "DEFECT/999")).contentType("application/json").content("{\"code\":\"QA\",\"name\":\"不存在\"}")).andExpect(status().isBadRequest());
        verify(audits, never()).save(any(AuditEvent.class));
    }

    @Test void permissionsAreCheckedIndependentlyForBothDirectoriesAndAllActions() throws Exception {
        String limitedToken = tokens.generateToken("reader", "reader", "虚拟用户", 5, List.of("master-data.defect-reasons"));
        mvc.perform(get(URL + "DEFECT")).andExpect(status().isUnauthorized());
        mvc.perform(get(URL + "DEFECT").header("Authorization", "Bearer " + limitedToken)).andExpect(status().isOk());
        for (var request : List.of(get(URL + "SCRAP"), post(URL + "SCRAP").contentType("application/json").content("{}"), put(URL + "SCRAP/1").contentType("application/json").content("{}"), delete(URL + "SCRAP/1"))) {
            mvc.perform(request.header("Authorization", "Bearer " + limitedToken)).andExpect(status().isForbidden());
        }
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder request) { return request.header("Authorization", "Bearer " + tokens.generateToken("qa", "qa", "虚拟测试账号", 5, List.of("master-data.defect-reasons", "master-data.scrap-reasons"))); }
    private JsonNode create(String type, Map<String, ?> body) throws Exception {
        return mapper.readTree(mvc.perform(auth(post(URL + type)).contentType("application/json").content(mapper.writeValueAsString(body))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8)).path("data");
    }
    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = {JpaRepositoriesAutoConfiguration.class, HibernateJpaAutoConfiguration.class})
    @Import({QualityReasonController.class, QualityReasonUsageService.class, SecurityConfig.class, JwtAuthenticationFilter.class, GlobalExceptionHandler.class})
    static class Config {
        @Bean SnowflakeIdGenerator ids() { return new SnowflakeIdGenerator(1); }
        @Bean JwtTokenProvider tokens() { return new JwtTokenProvider("quality-reason-test-at-least-32-characters", 300000); }
    }
}
