package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Fresh Hibernate DDL, deliberately without ALTER TABLE repairs; production uses Liquibase and ddl-auto=none. */
@SpringBootTest(classes = DocumentReadBoundaryIntegrationTest.Config.class, properties = {
        "spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:document-orm-audit;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DocumentOrmSchemaIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;

    @Test
    void freshMappingSupportsTheExistingVersionOwnedCodeContract() throws Exception {
        String bearer = "Bearer " + tokens.generateToken("orm-auditor", "orm-auditor", "映射审查", 5, List.of("master-data.documents"));
        var response = mvc.perform(post("/api/v1/master-data/documents").header("Authorization", bearer)
                .contentType("application/json").content("{\"title\":\"无父编码文档\",\"version\":\"V1\",\"code\":\"VERSION-ONLY\"}"))
                .andExpect(status().isOk()).andReturn().getResponse();
        var doc = mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8)).path("data");
        assertThat(jdbc.queryForObject("SELECT code FROM sop_document WHERE id=?", String.class, Long.parseLong(doc.path("id").asText()))).isNull();
        assertThat(jdbc.queryForObject("SELECT code FROM document_version", String.class)).isEqualTo("VERSION-ONLY");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(2);
        mvc.perform(post("/api/v1/master-data/documents/" + doc.path("id").asText() + "/versions")
                .header("Authorization", bearer).contentType("application/json").content("{\"version\":\"V2\"}"))
                .andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM document_version", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM audit_event", Integer.class)).isEqualTo(2);
    }
}
