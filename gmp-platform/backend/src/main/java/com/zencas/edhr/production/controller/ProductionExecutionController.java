package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.production.service.ProductionExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/production/execution")
@PreAuthorize("hasAuthority('production.execution')")
@RequiredArgsConstructor
public class ProductionExecutionController {
    private final ProductionExecutionService service;

    @GetMapping("/form-templates")
    public ApiResponse<com.fasterxml.jackson.databind.node.ArrayNode> templates(@RequestParam(defaultValue = "") String keyword) {
        return ApiResponse.success(service.selectableForms(keyword));
    }

    @GetMapping("/{id}/presence")
    public ApiResponse<ObjectNode> editors(@PathVariable Long id, @RequestParam String operationId) {
        return ApiResponse.success(service.editors(id, operationId, null));
    }

    @PostMapping("/{id}/presence")
    public ApiResponse<ObjectNode> heartbeat(@PathVariable Long id, @RequestParam String operationId, @RequestBody ProductionExecutionService.PresenceCommand command) {
        return ApiResponse.success(service.editors(id, operationId, command));
    }

    @GetMapping("/scan")
    public ApiResponse<ObjectNode> scan(@RequestParam String barcode) { return ApiResponse.success(service.scan(barcode)); }

    @GetMapping("/{id}")
    public ApiResponse<ObjectNode> get(@PathVariable Long id) { return ApiResponse.success(service.get(id)); }

    @GetMapping("/{id}/references")
    public ApiResponse<java.util.List<java.util.Map<String, String>>> references(@PathVariable Long id, @RequestParam String operationId,
            @RequestParam String formId, @RequestParam String fieldId, @RequestParam(defaultValue = "") String keyword) {
        return ApiResponse.success(service.references(id, operationId, formId, fieldId, keyword));
    }

    @GetMapping("/{id}/transfer-targets")
    public ApiResponse<java.util.List<java.util.Map<String, String>>> transferTargets(@PathVariable Long id,
            @RequestParam String operationId, @RequestParam String formId, @RequestParam(required = false) String instanceId,
            @RequestParam(defaultValue = "") String keyword) {
        return ApiResponse.success(service.transferTargets(id, operationId, formId, instanceId, keyword));
    }

    @PostMapping("/{id}/actions")
    public ApiResponse<ObjectNode> act(@PathVariable Long id, @RequestBody ProductionExecutionService.Command command) {
        try {
            return ApiResponse.success(service.act(id, command));
        } catch (RuntimeException failure) {
            // The service transaction has rolled back before translating PostgreSQL's snapshot conflict.
            for (Throwable cause = failure; cause != null; cause = cause.getCause()) {
                if (cause instanceof java.sql.SQLException sql && "40001".equals(sql.getSQLState())) {
                    throw new BusinessException(ErrorCode.GENERAL_001, "执行记录已被更新，请刷新后重试，未保存内容仍保留在页面");
                }
            }
            throw failure;
        }
    }

    public record ReferenceQuery(String operationId, String formId, String fieldId, String keyword, com.fasterxml.jackson.databind.JsonNode values) {}
    @PostMapping("/{id}/references")
    public ApiResponse<java.util.List<java.util.Map<String, String>>> references(@PathVariable Long id, @RequestBody ReferenceQuery query) {
        return ApiResponse.success(service.references(id, query.operationId(), query.formId(), query.fieldId(), query.keyword(), query.values()));
    }
}
