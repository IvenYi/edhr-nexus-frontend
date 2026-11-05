package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.workflow.service.WorkflowOperationsQuery;
import com.zencas.edhr.workflow.service.WorkflowResponsibilityService;
import com.zencas.edhr.production.service.FormWorkflowOperations;
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
    private final FormWorkflowOperations forms;

    @GetMapping("/instances")
    @PreAuthorize("hasAnyAuthority('workflow.instances','workflow.logs','workflow.intervene')")
    public ApiResponse<PageResult<Map<String, Object>>> list(@RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="20") int size, @RequestParam(required=false) String keyword,
            @RequestParam(required=false) String status, @RequestParam(defaultValue="false") boolean runningOnly) {
        return ApiResponse.success(query.list(page, size, keyword, status, runningOnly));
    }

    @GetMapping("/instances/{id}")
    @PreAuthorize("hasAnyAuthority('workflow.instances','workflow.logs','workflow.intervene')")
    public ApiResponse<Map<String, Object>> detail(@PathVariable String id) {
        return ApiResponse.success(id.startsWith("form-") ? forms.detail(Long.parseLong(id.substring(5))) : query.detail(Long.valueOf(id)));
    }

    @GetMapping("/tasks/{id}/transfer-context")
    public ApiResponse<Map<String,Object>> context(@PathVariable Long id) { return ApiResponse.success(responsibility.transferContext(id)); }

    @GetMapping("/tasks/{id}/transfer-targets")
    public ApiResponse<com.zencas.edhr.identity.service.TenantTransferTargets.Page> transferTargets(@PathVariable Long id,@RequestParam(required=false) String keyword,
            @RequestParam(defaultValue="1") int page, @RequestParam(defaultValue="50") int size) {
        return ApiResponse.success(responsibility.transferTargets(id,keyword,page,size));
    }

    @GetMapping("/tasks/{id}/reassignment-targets")
    @PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<com.zencas.edhr.identity.service.TenantTransferTargets.Page> targets(@PathVariable String id,@RequestParam(required=false) String keyword,
            @RequestParam(defaultValue="1") int page, @RequestParam(defaultValue="50") int size) {
        return ApiResponse.success(id.startsWith("form-") ? forms.targets(id,keyword,page,size) : responsibility.reassignmentTargets(Long.valueOf(id),keyword,page,size));
    }

    @PostMapping("/tasks/{id}/reassign")
    @PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<Void> reassign(@PathVariable String id,@RequestBody WorkflowResponsibilityService.Command command) {
        if (id.startsWith("form-")) forms.reassign(id,command); else responsibility.reassign(Long.valueOf(id),command);
        return ApiResponse.success(null);
    }
}
