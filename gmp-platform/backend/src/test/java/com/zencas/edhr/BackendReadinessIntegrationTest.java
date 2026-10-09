package com.zencas.edhr;

import com.zencas.edhr.identity.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.ApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@EnabledIfSystemProperty(named = "dhr.migration.test.url", matches = "jdbc:postgresql:.*edhr_startup_qa_.*")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = {
        "spring.datasource.url=${dhr.migration.test.url}",
        "spring.datasource.username=edhr", "spring.datasource.password=${PGPASSWORD:}",
        "spring.liquibase.enabled=true", "spring.jpa.hibernate.ddl-auto=validate",
        "logging.level.org.hibernate.SQL=OFF"
})
@AutoConfigureMockMvc
class BackendReadinessIntegrationTest {
    @Autowired ApplicationContext context;
    @Autowired JdbcTemplate jdbc;
    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;

    @Test
    void initializesApplicationAndDatabaseWithoutStartingWebServer() {
        assertThat(context).isNotInstanceOf(WebServerApplicationContext.class);
        assertThat(jdbc.queryForObject("SELECT locked FROM databasechangeloglock WHERE id=1", Boolean.class)).isFalse();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM databasechangelog WHERE id='0094-created-at-schema-compatibility' AND exectype='EXECUTED'", Integer.class)).isEqualTo(1);
    }

    @Test
    void workflowAndDhrListsReadMigratedSchema() throws Exception {
        String token = tokens.generateToken("readiness-test", "readiness-test", "环境校验", 5,
                List.of("workflow.review-templates", "workflow.form-processes", "workflow.work-templates",
                        "workflow.instances", "dhr.instances.view", "records.dhr-summary"));
        for (String path : List.of(
                "/api/v1/workflow/review-templates?businessType=CHANGE",
                "/api/v1/workflow/review-templates?businessType=OBSOLETE",
                "/api/v1/workflow/form-processes",
                "/api/v1/workflow/instances",
                "/api/v1/workflow/work-templates",
                "/api/v1/workflow/work-templates/applicability-rules",
                "/api/v1/dhr-instances",
                "/api/v1/dhr-instances/summary-list")) {
            mvc.perform(get(path).header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200));
        }
    }
}
