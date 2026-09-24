package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.production.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dhr-filling")
@PreAuthorize("hasAuthority('records.dhr-filling')")
@RequiredArgsConstructor
public class DhrFillingController {
    private final DhrFillingService service;
    private final DhrInstanceService instances;
    private final ProductionExecutionService executions;
    @GetMapping
    public ApiResponse<PageResult<ObjectNode>> list(@RequestParam(defaultValue="") String keyword,
            @RequestParam(defaultValue="") String displayStatus,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) {
        return ApiResponse.success(instances.listFilling(keyword,displayStatus,page,size));
    }
    @GetMapping("/{id}")
    public ApiResponse<ObjectNode> workspace(@PathVariable Long id) { return ApiResponse.success(service.workspace(id)); }
    @PostMapping("/{id}/actions")
    @PreAuthorize("hasAuthority('records.dhr-filling') and hasAuthority('dhr.filling.act')")
    public ApiResponse<ObjectNode> act(@PathVariable Long id,@RequestBody ProductionExecutionService.Command command) { return ApiResponse.success(service.act(id,command)); }
    @PostMapping("/{id}/supplements")
    @PreAuthorize("hasAuthority('records.dhr-filling') and hasAuthority('dhr.filling.supplement')")
    public ApiResponse<ObjectNode> supplement(@PathVariable Long id,@RequestBody JsonNode command) { return ApiResponse.success(service.supplement(id,command)); }
    @PostMapping("/{id}/references")
    public ApiResponse<java.util.List<java.util.Map<String,String>>> references(@PathVariable Long id,@RequestBody ProductionExecutionController.ReferenceQuery query) {
        return ApiResponse.success(executions.references(service.objectId(id),query.operationId(),query.formId(),query.fieldId(),query.keyword(),query.values()));
    }
}
