package com.zencas.edhr.production.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessRepository;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/production/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {
    private static final String TENANT_ID = "default";
    private final WorkOrderRepository workOrderRepository;
    private final MaterialRepository materialRepository;
    private final ProductProcessRepository productProcessRepository;
    private final ProductProcessVersionRepository processVersionRepository;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping
    public ApiResponse<PageResult<WorkOrderResponse>> list(@RequestParam(required = false) String keyword,
                                                            @RequestParam(required = false) String status,
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        List<WorkOrderResponse> rows = workOrderRepository.findByTenantIdOrderByCreatedAtDesc(TENANT_ID).stream()
                .map(this::toResponse)
                .filter(row -> !StringUtils.hasText(keyword) || row.orderNo().contains(keyword.trim()) || row.productName().contains(keyword.trim()) || row.productCode().contains(keyword.trim()))
                .filter(row -> !StringUtils.hasText(status) || "ALL".equalsIgnoreCase(status) || status.equalsIgnoreCase(row.status()))
                .toList();
        int safePage = Math.max(page, 1), safeSize = Math.max(size, 1);
        int from = Math.min((safePage - 1) * safeSize, rows.size());
        int to = Math.min(from + safeSize, rows.size());
        return ApiResponse.success(PageResult.of(rows.subList(from, to), safePage, safeSize, rows.size()));
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkOrderResponse> get(@PathVariable Long id) {
        return ApiResponse.success(toResponse(requireOrder(id)));
    }

    @PostMapping
    @Transactional
    public ApiResponse<WorkOrderResponse> create(@RequestBody WorkOrderRequest request) {
        WorkOrder order = new WorkOrder();
        order.setId(idGenerator.nextId());
        order.setTenantId(TENANT_ID);
        apply(order, request, false);
        return ApiResponse.success(toResponse(workOrderRepository.save(order)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ApiResponse<WorkOrderResponse> update(@PathVariable Long id, @RequestBody WorkOrderRequest request) {
        WorkOrder order = requireOrder(id);
        if (!"CREATED".equals(order.getStatus())) throw new BusinessException(ErrorCode.GENERAL_001, "工单已开始生产，不允许编辑");
        apply(order, request, true);
        return ApiResponse.success(toResponse(workOrderRepository.save(order)));
    }

    @PostMapping("/{id}/cancel")
    @Transactional
    public ApiResponse<WorkOrderResponse> cancel(@PathVariable Long id) {
        WorkOrder order = requireOrder(id);
        if (!"CREATED".equals(order.getStatus())) throw new BusinessException(ErrorCode.GENERAL_001, "只有未开始生产的工单可以取消");
        order.setStatus("CANCELLED");
        return ApiResponse.success(toResponse(workOrderRepository.save(order)));
    }

    private void apply(WorkOrder order, WorkOrderRequest request, boolean updating) {
        if (request == null || request.productId() == null) throw new BusinessException(ErrorCode.GENERAL_001, "请选择产品");
        if (request.processVersionId() == null) throw new BusinessException(ErrorCode.GENERAL_001, "请选择制程");
        if (request.plannedQuantity() == null || request.plannedQuantity().signum() <= 0) throw new BusinessException(ErrorCode.GENERAL_001, "计划数量必须大于0");
        Material product = materialRepository.findById(request.productId()).orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "产品不存在"));
        ProductProcessVersion version = processVersionRepository.findById(request.processVersionId()).orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "制程不存在"));
        boolean belongs = productProcessRepository.findByTenantIdAndProductVersionId(TENANT_ID, product.getId())
                .map(process -> process.getId().equals(version.getProductProcessId())).orElse(false);
        if (!belongs) throw new BusinessException(ErrorCode.GENERAL_001, "所选制程不属于该产品");
        if (!updating) order.setOrderNo(resolveOrderNo(order.getId()));
        order.setProductId(product.getId());
        order.setProcessVersionId(version.getId());
        order.setProductionMode(version.getProductionMode());
        order.setProductionForm(version.getProductionForm());
        order.setPlannedQuantity(request.plannedQuantity());
        order.setRemark(StringUtils.hasText(request.remark()) ? request.remark().trim() : null);
    }

    private String resolveOrderNo(Long orderId) {
        return "WO" + LocalDateTime.now().toString().replaceAll("[^0-9]", "").substring(0, 14) + String.format("%04d", orderId % 10000);
    }

    private WorkOrder requireOrder(Long id) { return workOrderRepository.findByTenantIdAndId(TENANT_ID, id).orElseThrow(() -> new BusinessException(ErrorCode.GENERAL_001, "工单不存在")); }

    private WorkOrderResponse toResponse(WorkOrder order) {
        Material product = materialRepository.findById(order.getProductId()).orElse(null);
        ProductProcessVersion version = processVersionRepository.findById(order.getProcessVersionId()).orElse(null);
        return new WorkOrderResponse(String.valueOf(order.getId()), order.getOrderNo(), String.valueOf(order.getProductId()), product == null ? "-" : product.getName(), product == null ? "-" : product.getCode(), String.valueOf(order.getProcessVersionId()), version == null ? "-" : version.getVersionLabel(), order.getProductionMode(), order.getProductionForm(), order.getPlannedQuantity(), order.getStatus(), order.getRemark(), order.getCreatedAt(), order.getUpdatedAt());
    }

    public record WorkOrderRequest(Long productId, Long processVersionId, BigDecimal plannedQuantity, String remark) {}
    public record WorkOrderResponse(String id, String orderNo, String productId, String productName, String productCode, String processVersionId, String processVersion, String productionMode, String productionForm, BigDecimal plannedQuantity, String status, String remark, LocalDateTime createdAt, LocalDateTime updatedAt) {}
}
