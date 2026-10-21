package com.zencas.edhr.masterdata.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QualityReasonUsageService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public boolean isUsed(String type, Long id) {
        String source = "DEFECT".equals(type) ? "defectReason" : "scrapReason";
        // Check actual selected identities, including defaults, without treating a catalog binding as item usage.
        for (String json : jdbc.queryForList("SELECT model_design_json FROM form_template_version WHERE tenant_id = 'default' AND model_design_json IS NOT NULL UNION ALL SELECT canvas_design_json FROM form_template_version WHERE tenant_id = 'default' AND canvas_design_json IS NOT NULL UNION ALL SELECT CAST(structure_snapshot AS TEXT) FROM form_template_version WHERE tenant_id = 'default' AND structure_snapshot IS NOT NULL UNION ALL SELECT values_json FROM form_instance_record WHERE tenant_id = 'default' UNION ALL SELECT execution.snapshot_json FROM production_execution execution JOIN production_object object ON object.id = execution.object_id WHERE object.tenant_id = 'default' UNION ALL SELECT execution.state_json FROM production_execution execution JOIN production_object object ON object.id = execution.object_id WHERE object.tenant_id = 'default'", String.class)) {
            try {
                if (containsReference(mapper.readTree(json), source, String.valueOf(id), null)) return true;
            } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
                throw new BusinessException(ErrorCode.GENERAL_002, "原因引用配置读取失败，请核对后重试");
            }
        }
        return false;
    }

    static boolean containsReference(JsonNode node, String source, String id, String inheritedSource) {
        if (node == null || node.isNull()) return false;
        String currentSource = inheritedSource;
        if (node.isObject()) {
            currentSource = node.path("sourceType").asText(node.path("referenceSourceType").asText(
                    node.path("referenceSource").asText(node.path("typeConfig").path("sourceType").asText(
                            node.path("widgetConfig").path("referenceSourceType").asText(inheritedSource)))));
            if (source.equals(currentSource) && id.equals(node.path("id").asText())) return true;
            if (source.equals(currentSource) && id.equals(node.path("defaultValue").asText())) return true;
        }
        for (JsonNode child : node) {
            if (containsReference(child, source, id, currentSource)) return true;
        }
        return false;
    }
}
