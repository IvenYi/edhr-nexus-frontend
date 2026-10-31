package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.workflow.entity.WorkflowActionLog;
import com.zencas.edhr.workflow.repository.WorkflowActionLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workflow/logs")
@RequiredArgsConstructor
public class WorkflowLogController {

    private final WorkflowActionLogRepository workflowActionLogRepository;
    private final com.zencas.edhr.workflow.engine.WorkflowEngine workflowEngine;

    @GetMapping
    public ApiResponse<PageResult<WorkflowActionLog>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<WorkflowActionLog> result = workflowActionLogRepository.findGeneric(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowActionLog> getById(@PathVariable Long id) {
        return workflowActionLogRepository.findById(id)
                .map(entity -> { protect(entity); return ApiResponse.success(entity); })
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<WorkflowActionLog> create(@RequestBody WorkflowActionLog entity) {
        protect(entity);
        if (entity.getId() != null) workflowActionLogRepository.findById(entity.getId()).ifPresent(this::protect);
        throw readOnly();
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<WorkflowActionLog> update(@PathVariable Long id, @RequestBody WorkflowActionLog entity) {
        protect(entity);
        workflowActionLogRepository.findById(id).ifPresent(this::protect);
        throw readOnly();
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        workflowActionLogRepository.findById(id).ifPresent(this::protect);
        throw readOnly();
    }

    private com.zencas.edhr.common.exception.BusinessException readOnly() {
        return new com.zencas.edhr.common.exception.BusinessException(com.zencas.edhr.common.exception.ErrorCode.AUTH_003, "流程运行日志只读，只能由运行时写入");
    }

    private void protect(WorkflowActionLog log) {
        workflowEngine.assertGenericInstanceAccessAllowed(log.getInstanceId());
        workflowEngine.assertGenericTaskIfPresent(log.getTaskId());
    }
}
