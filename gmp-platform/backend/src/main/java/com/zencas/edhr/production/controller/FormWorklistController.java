package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.production.service.FormWorklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/form-worklists")
@PreAuthorize("hasAuthority('production.execution')")
@RequiredArgsConstructor
public class FormWorklistController {
    private final FormWorklistService service;
    @GetMapping("/{view}")
    public ApiResponse<FormWorklistService.WorklistPage> list(@PathVariable String view, @RequestParam MultiValueMap<String, String> query) {
        return ApiResponse.success(service.list(view, query));
    }
    @GetMapping("/{view}/detail")
    public ApiResponse<ObjectNode> detail(@PathVariable String view, @RequestParam MultiValueMap<String, String> query) {
        return ApiResponse.success(service.detail(view, query));
    }
}
