package com.zencas.edhr.gct.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.gct.dto.GctActionRequest;
import com.zencas.edhr.gct.dto.GctActionResultDto;
import com.zencas.edhr.gct.dto.GctAuditEntryDto;
import com.zencas.edhr.gct.dto.GctRecordDto;
import com.zencas.edhr.gct.dto.GctRecordMutationRequest;
import com.zencas.edhr.gct.dto.GctRecordQueryRequest;
import com.zencas.edhr.gct.dto.GctStatusHistoryDto;
import com.zencas.edhr.gct.service.GctActionService;
import com.zencas.edhr.gct.service.GctAuditService;
import com.zencas.edhr.gct.service.GctRecordService;
import com.zencas.edhr.gct.service.GctStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gct/pages/{pageCode}/records")
@RequiredArgsConstructor
public class GctRecordController {

    private final GctRecordService recordService;
    private final GctActionService actionService;
    private final GctAuditService auditService;
    private final GctStatusService statusService;

    @GetMapping
    public ApiResponse<PageResult<GctRecordDto>> records(
            @PathVariable String pageCode,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q) {
        return ApiResponse.success(recordService.query(pageCode, GctRecordQueryRequest.builder()
                .page(page)
                .size(size)
                .sort(sort)
                .order(order)
                .status(status)
                .q(q)
                .build()));
    }

    @PostMapping
    public ApiResponse<GctRecordDto> create(
            @PathVariable String pageCode,
            @RequestBody(required = false) GctRecordMutationRequest request) {
        return ApiResponse.success(recordService.create(pageCode, request));
    }

    @GetMapping("/{recordId}")
    public ApiResponse<GctRecordDto> get(
            @PathVariable String pageCode,
            @PathVariable String recordId) {
        return ApiResponse.success(recordService.find(pageCode, recordId));
    }

    @PutMapping("/{recordId}")
    public ApiResponse<GctRecordDto> update(
            @PathVariable String pageCode,
            @PathVariable String recordId,
            @RequestBody(required = false) GctRecordMutationRequest request) {
        return ApiResponse.success(recordService.update(pageCode, recordId, request));
    }

    @DeleteMapping("/{recordId}")
    public ApiResponse<GctRecordDto> delete(
            @PathVariable String pageCode,
            @PathVariable String recordId) {
        return ApiResponse.success(recordService.delete(pageCode, recordId));
    }

    @PostMapping("/{recordId}/actions/{actionCode}")
    public ApiResponse<GctActionResultDto> action(
            @PathVariable String pageCode,
            @PathVariable String recordId,
            @PathVariable String actionCode,
            @RequestBody(required = false) GctActionRequest request) {
        return ApiResponse.success(actionService.executeAction(pageCode, recordId, actionCode, request));
    }

    @GetMapping("/{recordId}/audit")
    public ApiResponse<List<GctAuditEntryDto>> audit(
            @PathVariable String pageCode,
            @PathVariable String recordId) {
        return ApiResponse.success(auditService.listAudit(pageCode, recordId));
    }

    @GetMapping("/{recordId}/status-history")
    public ApiResponse<List<GctStatusHistoryDto>> statusHistory(
            @PathVariable String pageCode,
            @PathVariable String recordId) {
        return ApiResponse.success(statusService.listStatusHistory(pageCode, recordId));
    }
}
