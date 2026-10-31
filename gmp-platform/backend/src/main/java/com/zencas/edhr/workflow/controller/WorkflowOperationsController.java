package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.workflow.service.WorkflowOperationsQuery;
import com.zencas.edhr.workflow.service.WorkflowResponsibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/workflow/operations")
@RequiredArgsConstructor
public class WorkflowOperationsController {
    private final WorkflowOperationsQuery query;
    private final WorkflowResponsibilityService responsibility;

    @GetMapping("/instances")
    @PreAuthorize("hasAnyAuthority('workflow.instances','workflow.logs','workflow.intervene')")
    public ApiResponse<PageResult<Map<String, Object>>> list(@RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="20") int size, @RequestParam(required=false) String keyword,
            @RequestParam(required=false) String status, @RequestParam(defaultValue="false") boolean runningOnly) {
        return ApiResponse.success(query.list(page, size, keyword, status, runningOnly));
    }

    @GetMapping("/instances/{id}")
    @PreAuthorize("hasAnyAuthority('workflow.instances','workflow.logs','workflow.intervene')")
    public ApiResponse<Map<String, Object>> detail(@PathVariable Long id) { return ApiResponse.success(query.detail(id)); }

    @GetMapping("/tasks/{id}/transfer-context")
    public ApiResponse<Map<String,Object>> context(@PathVariable Long id) { return ApiResponse.success(responsibility.transferContext(id)); }

    @GetMapping("/tasks/{id}/transfer-targets")
    public ApiResponse<List<Map<String,String>>> transferTargets(@PathVariable Long id,@RequestParam(required=false) String keyword) {
        return ApiResponse.success(responsibility.transferTargets(id,keyword));
    }

    @GetMapping("/tasks/{id}/reassignment-targets")
    @PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<List<Map<String,String>>> targets(@PathVariable Long id,@RequestParam(required=false) String keyword) {
        return ApiResponse.success(responsibility.reassignmentTargets(id,keyword));
    }

    @PostMapping("/tasks/{id}/reassign")
    @PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<Void> reassign(@PathVariable Long id,@RequestBody WorkflowResponsibilityService.Command command) {
        responsibility.reassign(id,command); return ApiResponse.success(null);
    }
}
