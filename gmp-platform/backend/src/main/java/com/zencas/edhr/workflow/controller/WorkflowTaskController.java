package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.WorkflowTask;
import com.zencas.edhr.workflow.repository.WorkflowTaskRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

/**
 * Workflow task controller with full task lifecycle operations.
 */
@RestController
@RequestMapping("/api/v1/workflow/tasks")
@RequiredArgsConstructor
public class WorkflowTaskController {

    private final WorkflowTaskRepository workflowTaskRepository;
    private final WorkflowEngine workflowEngine;

    // ======================== Task CRUD ========================

    @GetMapping
    public ApiResponse<PageResult<WorkflowTask>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<WorkflowTask> result = workflowTaskRepository.findNonDhr(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowTask> getById(@PathVariable Long id) {
        workflowEngine.assertNotDhrTask(id);
        return workflowTaskRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<WorkflowTask> create(@RequestBody WorkflowTask entity) {
        workflowEngine.assertNotDhrTask(entity.getId());
        workflowEngine.assertNotDhrInstance(entity.getInstanceId());
        return ApiResponse.success(workflowTaskRepository.save(entity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<WorkflowTask> update(@PathVariable Long id, @RequestBody WorkflowTask entity) {
        workflowEngine.assertNotDhrTask(id);
        workflowEngine.assertNotDhrInstance(entity.getInstanceId());
        entity.setId(id);
        return ApiResponse.success(workflowTaskRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('workflow.intervene')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        workflowEngine.assertNotDhrTask(id);
        workflowTaskRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    // ======================== My Tasks ========================

    /**
     * Get my pending tasks (待办).
     */
    @GetMapping("/todo")
    public ApiResponse<List<WorkflowTask>> todo(
            @RequestParam(required = false) String assigneeId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        // The queue belongs to the authenticated operator.  Keep the legacy
        // parameter optional for client compatibility, but never trust it.
        assigneeId = currentOperatorId();
        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.GENERAL_001, "页码和每页条数必须大于0");
        }
        return ApiResponse.success(workflowTaskRepository.findTodoForUser(
                assigneeId, "[\"" + assigneeId + "\"]", size, (long) (page - 1) * size));
    }

    /**
     * Get my completed tasks (已办).
     */
    @GetMapping("/done")
    public ApiResponse<List<WorkflowTask>> done(
            @RequestParam(required = false) String assigneeId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        assigneeId = currentOperatorId();
        if (page < 1 || size < 1) {
            throw new BusinessException(ErrorCode.GENERAL_001, "页码和每页条数必须大于0");
        }
        return ApiResponse.success(workflowTaskRepository.findDoneForUser(
                assigneeId, size, (long) (page - 1) * size));
    }

    // ======================== Task Actions ========================

    /**
     * Approve a task (通过).
     */
    @PostMapping("/{id}/approve")
    public ApiResponse<Map<String, Object>> approve(
            @PathVariable Long id,
            @RequestBody TaskActionRequest request) {
        workflowEngine.completeTask(id, "APPROVE", request.getOpinion(),
                currentOperatorId(), request.getSignatureId());
        return ApiResponse.success(Map.of("taskId", id, "action", "APPROVE", "result", "ok"));
    }

    /**
     * Reject a task (退回).
     */
    @PostMapping("/{id}/reject")
    public ApiResponse<Map<String, Object>> reject(
            @PathVariable Long id,
            @RequestBody TaskActionRequest request) {
        workflowEngine.completeTask(id, "REJECT", request.getOpinion(),
                currentOperatorId(), request.getSignatureId());
        return ApiResponse.success(Map.of("taskId", id, "action", "REJECT", "result", "ok"));
    }

    /**
     * Transfer a task to another assignee (转办).
     */
    @GetMapping("/{id}/transfer-targets")
    public ApiResponse<List<Map<String, String>>> transferTargets(
            @PathVariable Long id, @RequestParam(required = false) String keyword) {
        return ApiResponse.success(workflowEngine.transferTargets(id, currentOperatorId(), keyword));
    }

    @PostMapping("/{id}/transfer")
    public ApiResponse<Map<String, Object>> transfer(
            @PathVariable Long id,
            @RequestBody TransferRequest request) {
        if (request.getNewAssigneeId() == null || request.getNewAssigneeId().isBlank()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "转办目标人不能为空");
        }
        workflowEngine.transferTask(id, request.getNewAssigneeId(), currentOperatorId(), request.getReason());
        return ApiResponse.success(Map.of(
                "taskId", id, "action", "TRANSFER",
                "newAssigneeId", request.getNewAssigneeId(), "result", "ok"));
    }

    /**
     * Submit a task (提交), typically used for form-fill tasks.
     */
    @PostMapping("/{id}/submit")
    public ApiResponse<Map<String, Object>> submit(
            @PathVariable Long id,
            @RequestBody TaskActionRequest request) {
        workflowEngine.completeTask(id, "SUBMIT", request.getOpinion(),
                currentOperatorId(), request.getSignatureId());
        return ApiResponse.success(Map.of("taskId", id, "action", "SUBMIT", "result", "ok"));
    }

    // ======================== Request DTOs ========================

    private String currentOperatorId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BusinessException(ErrorCode.AUTH_004);
        }
        return String.valueOf(authentication.getPrincipal());
    }

    /**
     * Request body for approve / reject / submit actions.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskActionRequest {
        private String opinion;
        private String operatorId;
        private Long signatureId;
    }

    /**
     * Request body for transfer action.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferRequest {
        private String newAssigneeId;
        private String operatorId;
        private String reason;
    }
}
