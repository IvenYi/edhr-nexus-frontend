package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.workflow.service.FormFillSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/workflow/form-fill-settings")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class FormFillSettingsController {
    private final JdbcTemplate jdbc;
    private final FormFillSettingsService settings;

    @GetMapping("/processes")
    public ApiResponse<List<Map<String, Object>>> processes() {
        return ApiResponse.success(jdbc.queryForList("""
            SELECT CAST(d.id AS varchar) AS id, d.name, CAST(v.id AS varchar) AS "versionId",
                   v.version_number AS "versionNumber"
            FROM workflow_definition d JOIN workflow_definition_version v ON v.definition_id=d.id
            WHERE d.type='FORM_PROCESS' AND v.status='PUBLISHED' AND v.is_current=true AND d.tenant_id='default'
            ORDER BY d.name, d.id
            """));
    }

    @GetMapping("/processes/{versionId}")
    public ApiResponse<Map<String, Object>> process(@PathVariable String versionId) {
        var version = settings.process(versionId);
        return ApiResponse.success(Map.of("versionId", versionId, "versionNumber", version.getVersionNumber(),
                "id", version.getDefinitionId().toString(), "nodesJson", version.getNodesJson(),
                "edgesJson", version.getEdgesJson() == null ? "[]" : version.getEdgesJson(),
                "name", jdbc.queryForObject("SELECT name FROM workflow_definition WHERE id=?", String.class, version.getDefinitionId())));
    }
}
