package com.zencas.edhr.recordcontrol.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.recordcontrol.service.RecordControlService;
import com.zencas.edhr.recordcontrol.service.RecordControlTaskActionService;
import com.zencas.edhr.workflow.entity.WorkflowTask;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** All authenticated users can locate records, submit applications and read tenant history. */
@RestController
@RequestMapping("/api/v1/record-control")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class RecordControlController {
    private final RecordControlService service;
    private final RecordControlTaskActionService taskActions;
    private final com.zencas.edhr.workflow.service.WorkflowResponsibilityService responsibility;

    @PostMapping("/requests/{requestId}/withdraw")
    public ApiResponse<ObjectNode> withdraw(@PathVariable String requestId, @RequestBody RecordControlService.WithdrawRequest command) {
        return ApiResponse.success(service.withdraw(requestId, command));
    }

    @PostMapping("/workflow-tasks/{taskId}/transfer")
    public ApiResponse<Void> transfer(@PathVariable Long taskId,
            @RequestBody com.zencas.edhr.workflow.service.WorkflowResponsibilityService.Command command) {
        responsibility.transferRecordControl(taskId, command);
        return ApiResponse.success(null);
    }

    @GetMapping("/records/by-number")
    public ApiResponse<ObjectNode> findRecord(@RequestParam String instanceNo) {
        return ApiResponse.success(service.findRecord(instanceNo));
    }

    @GetMapping("/records/{recordId}/references")
    public ApiResponse<List<Map<String, String>>> references(@PathVariable String recordId,
            @RequestParam String fieldId, @RequestParam(defaultValue = "") String keyword) {
        return ApiResponse.success(service.references(recordId, fieldId, keyword));
    }

    @GetMapping("/records/{recordId}/revisions")
    public ApiResponse<List<ObjectNode>> revisions(@PathVariable String recordId) {
        return ApiResponse.success(service.revisions(recordId));
    }

    @PostMapping("/requests")
    public ApiResponse<ObjectNode> submit(@RequestBody RecordControlService.SubmitCommand command) {
        return ApiResponse.success(service.submit(command));
    }

    @GetMapping("/requests")
    public ApiResponse<PageResult<ObjectNode>> list(@RequestParam(defaultValue = "all") String scope,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size,
                                                     @RequestParam(required = false) String requestNo,
                                                     @RequestParam(required = false) String requestType,
                                                     @RequestParam(required = false) String instanceNo,
                                                     @RequestParam(required = false) String templateName,
                                                     @RequestParam(required = false) String templateCode,
                                                     @RequestParam(required = false) String applicant,
                                                     @RequestParam(required = false) String status,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime submittedFrom,
                                                     @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime submittedTo) {
        if (!"all".equals(scope) && !"mine".equals(scope))
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "申请列表范围不正确");
        return ApiResponse.success(service.listRequests("mine".equals(scope), page, size,
                new RecordControlService.RequestListQuery(requestNo, requestType, instanceNo, templateName,
                        templateCode, applicant, status, submittedFrom, submittedTo)));
    }

    @PostMapping("/requests/for-my-workflow-tasks")
    public ApiResponse<List<ObjectNode>> forMyWorkflowTasks(@RequestBody List<String> instanceIds) {
        return ApiResponse.success(service.requestsForMyWorkflowTasks(instanceIds));
    }

    @GetMapping("/workflow-tasks")
    public ApiResponse<PageResult<WorkflowTask>> workflowTasks(
            @RequestParam(defaultValue = "todo") String scope,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.success(service.listMyWorkflowTasks(scope, page, size));
    }

    @GetMapping("/requests/{requestId}")
    public ApiResponse<ObjectNode> detail(@PathVariable String requestId) {
        return ApiResponse.success(service.requestDetail(requestId));
    }

    @PostMapping("/workflow-tasks/{taskId}/{action}")
    public ApiResponse<Map<String, Object>> completeTask(@PathVariable String taskId, @PathVariable String action,
            @RequestBody RecordControlTaskActionService.TaskActionCommand command) {
        return ApiResponse.success(taskActions.complete(taskId, action, command));
    }
}
