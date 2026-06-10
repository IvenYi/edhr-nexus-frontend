package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit/logs")
@RequiredArgsConstructor
public class AuditController {

    private final AuditEventRepository auditEventRepository;

    @GetMapping
    public ApiResponse<PageResult<AuditEvent>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String operatorName) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<AuditEvent> result = auditEventRepository.search(
                blankToEmpty(entityType),
                blankToEmpty(entityId),
                blankToEmpty(action),
                blankToEmpty(operatorName),
                pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    private String blankToEmpty(String value) {
        return StringUtils.hasText(value) ? value : "";
    }

    @GetMapping("/{id}")
    public ApiResponse<AuditEvent> getById(@PathVariable Long id) {
        return auditEventRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    public ApiResponse<AuditEvent> create(@RequestBody AuditEvent entity) {
        return ApiResponse.success(auditEventRepository.save(entity));
    }

    @PutMapping("/{id}")
    public ApiResponse<AuditEvent> update(@PathVariable Long id, @RequestBody AuditEvent entity) {
        entity.setId(id);
        return ApiResponse.success(auditEventRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        auditEventRepository.deleteById(id);
        return ApiResponse.success(null);
    }
}
