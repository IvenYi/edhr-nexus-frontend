package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.production.service.FormInstanceQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

/** Global read entry. Old template-scoped controller retains its original permissions and contract. */
@RestController
@RequestMapping("/api/v1/form-instances")
@PreAuthorize("hasAuthority('form-instances.view') and hasAuthority('production.execution')")
@RequiredArgsConstructor
public class FormInstanceQueryController {
    private final FormInstanceQueryService service;

    @GetMapping
    public ApiResponse<PageResult<ObjectNode>> list(@RequestParam MultiValueMap<String, String> query) {
        return ApiResponse.success(service.list(query));
    }

    @GetMapping("/by-number/{instanceNo}")
    public ApiResponse<ObjectNode> byNumber(@PathVariable String instanceNo) { return ApiResponse.success(service.byNumber(instanceNo)); }

    @GetMapping("/{id}")
    public ApiResponse<ObjectNode> detail(@PathVariable String id) { return ApiResponse.success(service.detail(id)); }

    @GetMapping("/{id}/operation-context")
    public ApiResponse<ObjectNode> operationContext(@PathVariable String id, @RequestParam(defaultValue = "FILL") String intent) {
        return ApiResponse.success(service.operationContext(id, intent));
    }
}
