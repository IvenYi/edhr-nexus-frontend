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
    public record Query(JsonNode config, String keyword, JsonNode values) {}
    @PostMapping
    public ApiResponse<List<Map<String, String>>> options(@RequestBody Query query) {
        return ApiResponse.success(lookup.search(query.config() == null ? com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode() : query.config(), query.keyword(), query.values()));
    }
}
