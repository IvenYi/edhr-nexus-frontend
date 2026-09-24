package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class FormFillSnapshotTest {
    final ObjectMapper mapper = new ObjectMapper();
    final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    final ExecutionSnapshotBuilder builder = new ExecutionSnapshotBuilder(jdbc, mapper);

    @Test void directSettingsBecomeSelfContainedEntryAndDoNotReadDormantFlow() throws Exception {
        var settings = (ObjectNode) mapper.readTree("""
            {"fillMode":"DIRECT","formProcessVersionId":"2","directFillConfig":{
             "permissionGroupRules":[{"id":"g","defaultPermission":"READ_ONLY"}],
             "fieldPermissions":{"start:g":{"editableFieldIds":["f"]}}}}
            """);
        ObjectNode form = mapper.createObjectNode();
        ReflectionTestUtils.invokeMethod(builder, "attachFillSettings", form, settings);
        assertThat(form.has("flow")).isFalse();
        assertThat(form.at("/entryNode/id").asText()).isEqualTo("entry");
        assertThat(form.at("/entryNode/data/config")).isEqualTo(settings.path("directFillConfig"));
        assertThat(form.path("binding")).isEqualTo(settings.path("directFillConfig"));
        settings.withObject("/directFillConfig").removeAll();
        assertThat(form.at("/binding/fieldPermissions/start:g/editableFieldIds/0").asText()).isEqualTo("f");
        verifyNoInteractions(jdbc);
    }

    @Test void processSettingsFreezePublishedGraphAndBindingOverrides() throws Exception {
        var database = new JdbcTemplate(new org.springframework.jdbc.datasource.DriverManagerDataSource("jdbc:h2:mem:fill-snapshot;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE", "sa", ""));
        database.execute("CREATE TABLE workflow_definition(id BIGINT PRIMARY KEY, type VARCHAR(30))");
        database.execute("CREATE TABLE workflow_definition_version(id BIGINT PRIMARY KEY, definition_id BIGINT, status VARCHAR(30), nodes_json TEXT, edges_json TEXT)");
        database.update("INSERT INTO workflow_definition VALUES(1,'FORM_PROCESS')");
        database.update("INSERT INTO workflow_definition_version VALUES(2,1,'PUBLISHED',?, '[]')", "[{\"id\":\"s\"}]");
        var settings = mapper.readTree("{\"fillMode\":\"PROCESS\",\"formProcessVersionId\":\"2\",\"directFillConfig\":{\"defaultPermission\":\"READ_ONLY\"}}");
        ObjectNode form = mapper.createObjectNode();
        ReflectionTestUtils.invokeMethod(new ExecutionSnapshotBuilder(database, mapper), "attachFillSettings", form, settings);
        assertThat(form.has("entryNode")).isFalse();
        assertThat(form.at("/flow/versionId").asText()).isEqualTo("2");
        assertThat(form.at("/flow/nodes/0/id").asText()).isEqualTo("s");
        assertThat(form.path("binding")).isEqualTo(settings);
        database.execute("DROP TABLE workflow_definition_version");
        database.execute("DROP TABLE workflow_definition");
    }
}
