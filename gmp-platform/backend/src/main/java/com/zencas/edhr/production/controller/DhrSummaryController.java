package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.production.service.DhrInstanceService;
import com.zencas.edhr.production.service.DhrSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dhr-instances")
@PreAuthorize("hasAuthority('records.dhr-summary')")
@RequiredArgsConstructor
public class DhrSummaryController {
    private final DhrSummaryService service;
    private final DhrInstanceService instances;

    @GetMapping("/summary-list")
    public ApiResponse<PageResult<ObjectNode>> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String summaryStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(instances.list(keyword, "", "COMPLETED", summaryStatus, page, size));
    }

    @GetMapping("/{id}/summary")
    public ApiResponse<ObjectNode> workspace(@PathVariable Long id) {
        return ApiResponse.success(service.workspace(id));
    }

    @GetMapping("/{id}/summary/versions/{versionId}")
    public ApiResponse<ObjectNode> version(@PathVariable Long id, @PathVariable Long versionId) {
        return ApiResponse.success(service.version(id, versionId));
    }

    @PutMapping("/{id}/summary/draft")
    @PreAuthorize("hasAuthority('records.dhr-summary') and hasAuthority('dhr.summaries.edit')")
    public ApiResponse<ObjectNode> saveDraft(@PathVariable Long id, @RequestBody JsonNode command) {
        return ApiResponse.success(service.saveDraft(id, command));
    }

    @PostMapping("/{id}/summary/submit")
    @PreAuthorize("hasAuthority('records.dhr-summary') and hasAuthority('dhr.summaries.submit')")
    public ApiResponse<ObjectNode> submit(@PathVariable Long id, @RequestBody JsonNode command) {
        return ApiResponse.success(service.submit(id, command));
    }
}
