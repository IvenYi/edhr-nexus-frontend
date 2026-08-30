package com.zencas.edhr.production.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.ProductionObjectRepository;
import com.zencas.edhr.production.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/production/batches")
@RequiredArgsConstructor
public class ProductionBatchController {
    private static final String TENANT_ID = "default";
    private final ProductionObjectRepository productionObjectRepository;
    private final ProductionService productionService;

    @GetMapping
    @PreAuthorize("hasAuthority('production.batches')")
    public ApiResponse<PageResult<BatchResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase();
        String normalizedStatus = status == null ? "" : status.trim();
        List<BatchResponse> rows = productionObjectRepository
                .findByTenantIdAndObjectTypeOrderByCreatedAtDesc(TENANT_ID, "BATCH")
                .stream()
                .map(this::toResponse)
                .filter(row -> normalizedKeyword.isEmpty()
                        || row.objectNo().toLowerCase().contains(normalizedKeyword)
                        || row.workOrderNo().toLowerCase().contains(normalizedKeyword)
                        || row.productName().toLowerCase().contains(normalizedKeyword)
                        || row.productCode().toLowerCase().contains(normalizedKeyword))
                .filter(row -> normalizedStatus.isEmpty() || "ALL".equalsIgnoreCase(normalizedStatus)
                        || normalizedStatus.equalsIgnoreCase(row.status()))
                .toList();
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        int from = Math.min((safePage - 1) * safeSize, rows.size());
        int to = Math.min(from + safeSize, rows.size());
        return ApiResponse.success(PageResult.of(rows.subList(from, to), safePage, safeSize, rows.size()));
    }

    private BatchResponse toResponse(ProductionObject object) {
        WorkOrder order = productionService.requireOrder(object.getWorkOrderId());
        Material product = productionService.requireProduct(order.getProductId());
        ProductProcessVersion process = productionService.findProcessVersion(object.getProcessVersionId());
        return new BatchResponse(
                String.valueOf(object.getId()),
                object.getObjectNo(),
                String.valueOf(object.getWorkOrderId()),
                order.getOrderNo(),
                order.getOrderNumber(),
                String.valueOf(order.getProductId()),
                product.getName(),
                product.getCode(),
                String.valueOf(object.getProcessVersionId()),
                process == null ? "-" : process.getVersionLabel(),
                object.getTargetQuantity(),
                object.getGoodQuantity(),
                object.getNgQuantity(),
                object.getScrapQuantity(),
                object.getStatus(),
                object.getTerminationReason(),
                object.getTerminationAt(),
                object.getPlannedStartAt(),
                object.getPlannedEndAt(),
                object.getRemark(),
                object.getCreatedAt(),
                object.getUpdatedAt());
    }

    public record BatchResponse(
            String id,
            String objectNo,
            String workOrderId,
            String workOrderNo,
            String orderNumber,
            String productId,
            String productName,
            String productCode,
            String processVersionId,
            String processVersion,
            java.math.BigDecimal targetQuantity,
            java.math.BigDecimal goodQuantity,
            java.math.BigDecimal ngQuantity,
            java.math.BigDecimal scrapQuantity,
            String status,
            String terminationReason,
            java.time.LocalDateTime terminationAt,
            java.time.LocalDateTime plannedStartAt,
            java.time.LocalDateTime plannedEndAt,
            String remark,
            java.time.LocalDateTime createdAt,
            java.time.LocalDateTime updatedAt) {}
}
