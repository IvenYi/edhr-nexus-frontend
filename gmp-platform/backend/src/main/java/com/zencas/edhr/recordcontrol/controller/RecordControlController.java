package com.zencas.edhr.recordcontrol.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.recordcontrol.service.RecordControlService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/** All authenticated users can locate records, submit applications and read tenant history. */
@RestController
@RequestMapping("/api/v1/record-control")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class RecordControlController {
    private final RecordControlService service;

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
                                                     @RequestParam(defaultValue = "20") int size) {
        if (!"all".equals(scope) && !"mine".equals(scope))
            throw new com.zencas.edhr.common.exception.BusinessException(
                    com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "申请列表范围不正确");
        return ApiResponse.success(service.listRequests("mine".equals(scope), page, size));
    }

    @PostMapping("/requests/for-my-workflow-tasks")
    public ApiResponse<List<ObjectNode>> forMyWorkflowTasks(@RequestBody List<String> instanceIds) {
        return ApiResponse.success(service.requestsForMyWorkflowTasks(instanceIds));
    }

    @GetMapping("/requests/{requestId}")
    public ApiResponse<ObjectNode> detail(@PathVariable String requestId) {
        return ApiResponse.success(service.requestDetail(requestId));
    }
}
