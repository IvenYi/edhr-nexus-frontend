package com.zencas.edhr.masterdata.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.ProductFamily;
import com.zencas.edhr.masterdata.repository.ProductFamilyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/master-data/product-families")
@PreAuthorize("hasAuthority('master-data.product-families')")
@RequiredArgsConstructor
public class ProductController {

    private static final String TENANT_ID = "default";
    private final ProductFamilyRepository productFamilyRepository;
    private final SnowflakeIdGenerator idGenerator;
    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ApiResponse<PageResult<ProductFamily>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String order) {
        Sort.Direction direction = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(direction, sort));
        Page<ProductFamily> result = productFamilyRepository.findAll(pageable);
        return ApiResponse.success(PageResult.of(
                result.getContent(), page, size, result.getTotalElements()));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductFamily> getById(@PathVariable Long id) {
        return productFamilyRepository.findById(id)
                .map(ApiResponse::success)
                .orElseThrow(() -> new com.zencas.edhr.common.exception.BusinessException(
                        com.zencas.edhr.common.exception.ErrorCode.GENERAL_001, "记录不存在"));
    }

    @PostMapping
    @Transactional
    public ApiResponse<ProductFamily> create(@RequestBody ProductFamily entity) {
        if (entity.getId() == null) entity.setId(idGenerator.nextId());
        ProductFamily saved = productFamilyRepository.save(entity);
        writeAudit(saved.getId(), "CREATE", Map.of(), productFamilySnapshot(saved));
        return ApiResponse.success(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<ProductFamily> update(@PathVariable Long id, @RequestBody ProductFamily entity) {
        ProductFamily existing = productFamilyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "记录不存在"));
        Map<String, Object> before = productFamilySnapshot(existing);
        entity.setId(id);
        ProductFamily saved = productFamilyRepository.save(entity);
        writeAudit(saved.getId(), "UPDATE", before, productFamilySnapshot(saved));
        return ApiResponse.success(saved);
    }

    @DeleteMapping("/{id}")
    @com.zencas.edhr.masterdata.deletion.ProtectDeletion(table = "product_family", idArgument = 0)
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ProductFamily existing = productFamilyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "记录不存在"));
        productFamilyRepository.deleteById(id);
        writeAudit(id, "DELETE", productFamilySnapshot(existing), productFamilySnapshot(existing));
        return ApiResponse.success(null);
    }

    private Map<String, Object> productFamilySnapshot(ProductFamily entity) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", entity.getId());
        snapshot.put("code", entity.getCode());
        snapshot.put("name", entity.getName());
        snapshot.put("description", entity.getDescription());
        snapshot.put("createdBy", entity.getCreatedBy());
        snapshot.put("createdAt", entity.getCreatedAt());
        snapshot.put("updatedBy", entity.getUpdatedBy());
        snapshot.put("updatedAt", entity.getUpdatedAt());
        return snapshot;
    }

    private void writeAudit(Long entityId, String action, Map<String, Object> before, Map<String, Object> after) {
        try {
            auditEventRepository.save(AuditEvent.builder()
                    .id(idGenerator.nextId())
                    .tenantId(TENANT_ID)
                    .entityType("PRODUCT_FAMILY")
                    .entityId(String.valueOf(entityId))
                    .action(action)
                    .contentBefore(objectMapper.writeValueAsString(before))
                    .contentAfter(objectMapper.writeValueAsString(after))
                    .operatorId(AuditContext.getOperatorId())
                    .operatorName(AuditContext.getOperatorName())
                    .operatorAccount(AuditContext.getOperatorAccount())
                    .source(AuditContext.getSource())
                    .moduleName("数据")
                    .menuName("工艺建模 · 产品簇")
                    .functionName(switch (action) {
                        case "CREATE" -> "新增产品簇";
                        case "UPDATE" -> "编辑产品簇";
                        default -> "删除产品簇";
                    })
                    .dataSummary("产品簇 #" + entityId)
                    .ipAddress(AuditContext.getIpAddress())
                    .createdAt(LocalDateTime.now())
                    .build());
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.GENERAL_002, "审计内容序列化失败");
        }
    }
}
