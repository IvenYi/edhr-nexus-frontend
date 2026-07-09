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
        Page<WorkflowTask> result = workflowTaskRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkflowTask> getById(@PathVariable Long id) {
        return workflowTaskRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new BusinessException(ErrorCode.WF_006));
    }

    @PostMapping
    public ApiResponse<WorkflowTask> create(@RequestBody WorkflowTask entity) {
        return ApiResponse.success(workflowTaskRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkflowTask> update(@PathVariable Long id, @RequestBody WorkflowTask entity) {
        entity.setId(id);
        return ApiResponse.success(workflowTaskRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        workflowTaskRepository.deleteById(id);
        return ApiResponse.success(null);
    }

    // ======================== My Tasks ========================

    /**
     * Get my pending tasks (待办).
     */
    @GetMapping("/todo")
    public ApiResponse<List<WorkflowTask>> todo(
            @RequestParam String assigneeId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<WorkflowTask> tasks = workflowTaskRepository
                .findByAssigneeIdAndStatusIn(assigneeId, List.of("PENDING", "PROCESSING"));

        // Simple in-memory pagination for the filtered result
        int start = (page - 1) * size;
        int end = Math.min(start + size, tasks.size());
        if (start >= tasks.size()) {
            return ApiResponse.success(List.of());
        }
        return ApiResponse.success(tasks.subList(start, end));
    }

    /**
     * Get my completed tasks (已办).
     */
    @GetMapping("/done")
    public ApiResponse<List<WorkflowTask>> done(
            @RequestParam String assigneeId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<WorkflowTask> allTasks = workflowTaskRepository.findByAssigneeId(assigneeId);
        List<WorkflowTask> doneTasks = allTasks.stream()
                .filter(t -> "COMPLETED".equals(t.getStatus())
                        || "REJECTED".equals(t.getStatus())
                        || "TRANSFERRED".equals(t.getStatus()))
                .toList();

        int start = (page - 1) * size;
        int end = Math.min(start + size, doneTasks.size());
        if (start >= doneTasks.size()) {
            return ApiResponse.success(List.of());
        }
        return ApiResponse.success(doneTasks.subList(start, end));
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
                request.getOperatorId(), request.getSignatureId());
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
                request.getOperatorId(), request.getSignatureId());
        return ApiResponse.success(Map.of("taskId", id, "action", "REJECT", "result", "ok"));
    }

    /**
     * Transfer a task to another assignee (转办).
     */
    @PostMapping("/{id}/transfer")
    public ApiResponse<Map<String, Object>> transfer(
            @PathVariable Long id,
            @RequestBody TransferRequest request) {
        if (request.getNewAssigneeId() == null || request.getNewAssigneeId().isBlank()) {
            throw new BusinessException(ErrorCode.GENERAL_001, "转办目标人不能为空");
        }
        workflowEngine.transferTask(id, request.getNewAssigneeId(), request.getOperatorId());
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
                request.getOperatorId(), request.getSignatureId());
        return ApiResponse.success(Map.of("taskId", id, "action", "SUBMIT", "result", "ok"));
    }

    // ======================== Request DTOs ========================

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
    }
}
