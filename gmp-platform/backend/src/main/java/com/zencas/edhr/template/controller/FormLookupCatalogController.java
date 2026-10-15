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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system.edit')")
    public ApiResponse<Void> delete(@PathVariable String id, @RequestParam long revision) {
        catalog.delete(id, revision); return ApiResponse.success(null);
    }

    @GetMapping("/{id}/bindings")
    @PreAuthorize("hasAuthority('system.edit') and hasAuthority('master-data.form-templates')")
    public ApiResponse<List<FormLookupCatalogService.Binding>> bindings(@PathVariable String id) {
        return ApiResponse.success(catalog.bindings(id));
    }

    @PostMapping("/{id}/unlink")
    @PreAuthorize("hasAuthority('system.edit') and hasAuthority('master-data.form-templates')")
    public ApiResponse<Void> unlink(@PathVariable String id, @RequestBody List<FormLookupCatalogService.BindingSelection> selected) {
        catalog.unlink(id, selected); return ApiResponse.success(null);
    }

    @GetMapping("/{id}/bindings/preview")
    @PreAuthorize("hasAuthority('system.edit') and hasAuthority('master-data.form-templates')")
    public ApiResponse<FormLookupCatalogService.BindingPreview> preview(@PathVariable String id, @RequestParam long versionId,
            @RequestParam String bindingId, @RequestParam String fieldId) {
        return ApiResponse.success(catalog.preview(id, versionId, bindingId, fieldId));
    }
}
