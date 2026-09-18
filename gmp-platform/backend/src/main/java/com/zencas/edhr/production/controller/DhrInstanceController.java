package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.production.service.DhrInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dhr-instances")
@PreAuthorize("hasAuthority('dhr.instances.view')")
@RequiredArgsConstructor
public class DhrInstanceController {
    private final DhrInstanceService service;

    @GetMapping
    public ApiResponse<PageResult<ObjectNode>> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String objectType,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.list(keyword, objectType, status, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<ObjectNode> detail(@PathVariable Long id) {
        return ApiResponse.success(service.detail(id));
    }
}
