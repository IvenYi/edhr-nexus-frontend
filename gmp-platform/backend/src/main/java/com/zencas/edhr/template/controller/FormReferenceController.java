package com.zencas.edhr.template.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.template.service.FormReferenceLookup;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/master-data/template-modeling/reference-options")
@PreAuthorize("hasAnyAuthority('master-data.form-templates','master-data.batch-record-templates')")
@RequiredArgsConstructor
public class FormReferenceController {
    private final FormReferenceLookup lookup;
    public record Query(JsonNode config, String keyword, JsonNode values, Integer page, Integer size) {}
    @GetMapping("/dictionaries")
    public ApiResponse<List<Map<String, String>>> dictionaries(@RequestParam(required = false) String keyword, @RequestParam(required = false) String id) {
        return ApiResponse.success(lookup.dictionaries(keyword, id));
    }
    @GetMapping("/material-types")
    public ApiResponse<List<Map<String, String>>> materialTypes() {
        return ApiResponse.success(lookup.materialTypes());
    }
    @PostMapping
    public ApiResponse<List<Map<String, String>>> options(@RequestBody Query query) {
        JsonNode config = query.config() == null ? com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode() : query.config();
        if ("dictionary".equals(config.path("sourceType").asText()) && config.path("referenceDictionaryId").asText().isBlank())
            throw new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "请先为引用字段选择具体业务字典");
        return ApiResponse.success(lookup.search(config, query.keyword(), query.values(), query.page(), query.size()));
    }
}
