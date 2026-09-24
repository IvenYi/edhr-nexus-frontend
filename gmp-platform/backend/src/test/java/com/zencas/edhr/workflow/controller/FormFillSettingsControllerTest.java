package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.service.FormFillSettingsService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FormFillSettingsControllerTest {
    @Mock private JdbcTemplate jdbc;
    @Mock private FormFillSettingsService settings;
    @InjectMocks private FormFillSettingsController controller;

    @Test
    void previewReturnsTheRequestedVersionsNodesAndEdges() {
        var version = WorkflowDefinitionVersion.builder().id(12L).definitionId(9L)
                .versionNumber(2).nodesJson("[{\"id\":\"start\"}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"end\"}]").build();
        when(settings.process("12")).thenReturn(version);
        when(jdbc.queryForObject("SELECT name FROM workflow_definition WHERE id=?", String.class, 9L)).thenReturn("Flow");
        var result = controller.process("12").getData();
        assertThat(result).containsEntry("versionId", "12").containsEntry("versionNumber", 2)
                .containsEntry("nodesJson", version.getNodesJson()).containsEntry("edgesJson", version.getEdgesJson());
    }

    @Test
    void missingEdgesAreAnEmptyArray() {
        var version = WorkflowDefinitionVersion.builder().id(12L).definitionId(9L)
                .versionNumber(2).nodesJson("[]").build();
        when(settings.process("12")).thenReturn(version);
        when(jdbc.queryForObject("SELECT name FROM workflow_definition WHERE id=?", String.class, 9L)).thenReturn("Flow");
        assertThat(controller.process("12").getData()).containsEntry("edgesJson", "[]");
    }
}
