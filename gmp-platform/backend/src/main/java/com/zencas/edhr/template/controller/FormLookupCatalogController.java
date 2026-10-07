package com.zencas.edhr.template.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.template.service.FormLookupCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/form-lookup-items")
@RequiredArgsConstructor
public class FormLookupCatalogController {
    private final FormLookupCatalogService catalog;

    @GetMapping
    @PreAuthorize("hasAuthority('system.edit') or hasAuthority('master-data.form-templates') or (hasAuthority('form-instances.view') and hasAuthority('production.execution'))")
    public ApiResponse<List<FormLookupCatalogService.Item>> list() { return ApiResponse.success(catalog.list()); }

    @PostMapping
    @PreAuthorize("hasAuthority('system.edit')")
    public ApiResponse<FormLookupCatalogService.Item> create(@RequestBody FormLookupCatalogService.WriteRequest request) {
        return ApiResponse.success(catalog.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system.edit')")
    public ApiResponse<FormLookupCatalogService.Item> update(@PathVariable String id, @RequestBody FormLookupCatalogService.WriteRequest request) {
        return ApiResponse.success(catalog.update(id, request));
    }
}
