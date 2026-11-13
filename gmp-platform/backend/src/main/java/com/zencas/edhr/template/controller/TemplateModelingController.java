package com.zencas.edhr.template.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.dto.TemplateImportGridResponse;
import com.zencas.edhr.template.entity.DhrTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import com.zencas.edhr.template.service.TemplateModelingService;
import com.zencas.edhr.template.service.TemplateModelingService.*;

@RestController
@RequestMapping("/api/v1/master-data/template-modeling")
@RequiredArgsConstructor
public class TemplateModelingController {
    private final TemplateModelingService templates;

    @GetMapping("/form-templates")
    public ApiResponse<PageResult<FormTemplateResponse>> listFormTemplates(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        return templates.listFormTemplates(keyword, name, code, categoryName, status, page, size, sort, order);
    }

    @PostMapping(value = "/form-templates/import/legacy-word", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<TemplateImportGridResponse> importLegacyWordTemplate(
            @RequestParam("file") MultipartFile file) throws IOException {
        return templates.importLegacyWordTemplate(file);
    }

    @PostMapping("/form-templates")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<FormTemplateResponse> createFormTemplate(@RequestBody TemplateModelingRequest request) {
        return templates.createFormTemplate(request);
    }

    @PutMapping("/form-templates/{id}")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<FormTemplateResponse> updateFormTemplate(@PathVariable Long id, @RequestBody TemplateModelingRequest request) {
        return templates.updateFormTemplate(id, request);
    }

    @DeleteMapping("/form-templates/{id}")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<Void> deleteFormTemplate(@PathVariable Long id, @RequestParam(required = false) Long expectedRevision) {
        return templates.deleteFormTemplate(id, expectedRevision);
    }

    @PostMapping("/form-templates/{id}/versions")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<TemplateVersionResponse> createFormTemplateVersion(@PathVariable Long id, @RequestBody TemplateModelingRequest request) {
        return templates.createFormTemplateVersion(id, request);
    }

    @GetMapping("/form-templates/{id}/versions/{versionId}")
    public ApiResponse<TemplateVersionResponse> getFormTemplateVersion(@PathVariable Long id, @PathVariable Long versionId) {
        return templates.getFormTemplateVersion(id, versionId);
    }

    @PutMapping("/form-templates/{id}/versions/{versionId}")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<TemplateVersionResponse> updateFormTemplateVersion(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestBody TemplateModelingRequest request) {
        return templates.updateFormTemplateVersion(id, versionId, request);
    }

    @PutMapping("/form-templates/{id}/versions/{versionId}/design")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<TemplateVersionResponse> saveFormTemplateVersionDesign(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @RequestBody TemplateModelingRequest request) {
        return templates.saveFormTemplateVersionDesign(id, versionId, request);
    }

    @GetMapping("/projection-catalog")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<com.fasterxml.jackson.databind.node.ObjectNode> projectionCatalog() {
        return templates.projectionCatalog();
    }

    @PostMapping("/projection-preview")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<com.fasterxml.jackson.databind.node.ArrayNode> projectionPreview(
            @RequestBody com.fasterxml.jackson.databind.JsonNode request) {
        return templates.projectionPreview(request);
    }

    @DeleteMapping("/form-templates/{id}/versions/{versionId}")
    @PreAuthorize("hasAuthority('master-data.form-templates')")
    public ApiResponse<Void> deleteFormTemplateVersion(@PathVariable Long id, @PathVariable Long versionId, @RequestParam(required = false) Long expectedRevision) {
        return templates.deleteFormTemplateVersion(id, versionId, expectedRevision);
    }

    @GetMapping("/batch-record-templates")
    @PreAuthorize("hasAuthority('master-data.batch-record-templates')")
    public ApiResponse<PageResult<DhrTemplateResponse>> listBatchRecordTemplates(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        return templates.listBatchRecordTemplates(keyword, name, code, categoryName, status, page, size, sort, order);
    }

    @PostMapping("/batch-record-templates")
    @PreAuthorize("hasAuthority('master-data.batch-record-templates')")
    public ApiResponse<DhrTemplateResponse> createBatchRecordTemplate(@RequestBody TemplateModelingRequest request) {
        return templates.createBatchRecordTemplate(request);
    }

    @PutMapping("/batch-record-templates/{id}")
    @PreAuthorize("hasAuthority('master-data.batch-record-templates')")
    public ApiResponse<DhrTemplate> updateBatchRecordTemplate(@PathVariable Long id, @RequestBody TemplateModelingRequest request) {
        return templates.updateBatchRecordTemplate(id, request);
    }

    @DeleteMapping("/batch-record-templates/{id}")
    @PreAuthorize("hasAuthority('master-data.batch-record-templates')")
    public ApiResponse<Void> deleteBatchRecordTemplate(@PathVariable Long id) {
        return templates.deleteBatchRecordTemplate(id);
    }

    @GetMapping("/{templateType}/categories")
    @PreAuthorize("hasAuthority(#templateType == 'form-templates' || #templateType == 'FORM' ? 'master-data.form-templates' : 'master-data.batch-record-templates')")
    public ApiResponse<List<TemplateCategoryResponse>> listCategories(@PathVariable String templateType) {
        return templates.listCategories(templateType);
    }

    @PostMapping("/{templateType}/categories")
    @PreAuthorize("hasAuthority(#templateType == 'form-templates' || #templateType == 'FORM' ? 'master-data.form-templates' : 'master-data.batch-record-templates')")
    public ApiResponse<TemplateCategoryResponse> createCategory(@PathVariable String templateType, @RequestBody TemplateCategoryRequest request) {
        return templates.createCategory(templateType, request);
    }

    @PutMapping("/{templateType}/categories/{id}")
    @PreAuthorize("hasAuthority(#templateType == 'form-templates' || #templateType == 'FORM' ? 'master-data.form-templates' : 'master-data.batch-record-templates')")
    public ApiResponse<TemplateCategoryResponse> updateCategory(@PathVariable String templateType, @PathVariable Long id, @RequestBody TemplateCategoryRequest request) {
        return templates.updateCategory(templateType, id, request);
    }

    @DeleteMapping("/{templateType}/categories/{id}")
    @PreAuthorize("hasAuthority(#templateType == 'form-templates' || #templateType == 'FORM' ? 'master-data.form-templates' : 'master-data.batch-record-templates')")
    public ApiResponse<Void> deleteCategory(@PathVariable String templateType, @PathVariable Long id) {
        return templates.deleteCategory(templateType, id);
    }

    @PutMapping("/{templateType}/categories/order")
    @PreAuthorize("hasAuthority(#templateType == 'form-templates' || #templateType == 'FORM' ? 'master-data.form-templates' : 'master-data.batch-record-templates')")
    public ApiResponse<List<TemplateCategoryResponse>> reorderCategories(@PathVariable String templateType, @RequestBody TemplateCategoryOrderRequest request) {
        return templates.reorderCategories(templateType, request);
    }
}
