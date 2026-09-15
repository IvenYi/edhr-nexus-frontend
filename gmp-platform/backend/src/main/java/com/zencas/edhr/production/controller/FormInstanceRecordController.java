package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.production.service.FormInstanceRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/form-instance-records")
@PreAuthorize("hasAuthority('master-data.form-templates') and hasAuthority('production.execution')")
@RequiredArgsConstructor
public class FormInstanceRecordController {
    private final FormInstanceRecordService service;

    @GetMapping
    public ApiResponse<PageResult<ObjectNode>> list(@RequestParam Long templateId,
            @RequestParam(defaultValue = "") String instanceNo, @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String occurredAt, @RequestParam(defaultValue = "") String operator,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.list(templateId, instanceNo, keyword, occurredAt, operator, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<ObjectNode> detail(@PathVariable Long id, @RequestParam Long templateId) {
        return ApiResponse.success(service.detail(templateId, id));
    }
}
