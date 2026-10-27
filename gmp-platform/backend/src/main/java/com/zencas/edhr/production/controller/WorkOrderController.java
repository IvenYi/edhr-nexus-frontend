package com.zencas.edhr.production.controller;

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
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.repository.MaterialRepository;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import com.zencas.edhr.production.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/production/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {
    private static final String TENANT_ID = "default";
    private final WorkOrderRepository workOrderRepository;
    private final MaterialRepository materialRepository;
    private final ProductionService productionService;
    private final com.zencas.edhr.production.service.ProductionOutputService outputs;
    private final SnowflakeIdGenerator idGenerator;
    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    @PreAuthorize("hasAuthority('production.work-orders')")
    public ApiResponse<PageResult<WorkOrderResponse>> list(@RequestParam(required = false) String keyword,
                                                            @RequestParam(required = false) String status,
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int size) {
        List<WorkOrderResponse> rows = workOrderRepository.findByTenantIdOrderByCreatedAtDesc(TENANT_ID).stream()
                .map(this::toResponse)
                .filter(row -> !StringUtils.hasText(keyword) || row.orderNo().contains(keyword.trim())
                        || row.productName().contains(keyword.trim()) || row.productCode().contains(keyword.trim()))
                .filter(row -> !StringUtils.hasText(status) || "ALL".equalsIgnoreCase(status)
                        || status.equalsIgnoreCase(row.status()))
                .toList();
        int safePage = Math.max(page, 1), safeSize = Math.max(size, 1);
        int from = Math.min((safePage - 1) * safeSize, rows.size());
        int to = Math.min(from + safeSize, rows.size());
        return ApiResponse.success(PageResult.of(rows.subList(from, to), safePage, safeSize, rows.size()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('production.work-orders', 'production.batches')")
    public ApiResponse<WorkOrderResponse> get(@PathVariable Long id) { return ApiResponse.success(toResponse(requireOrder(id))); }

    @PostMapping
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<WorkOrderResponse> create(@RequestBody WorkOrderRequest request) {
        WorkOrder order = new WorkOrder();
        order.setId(idGenerator.nextId());
        order.setTenantId(TENANT_ID);
        apply(order, request, false);
        WorkOrder saved = workOrderRepository.save(order);
        WorkOrderResponse response = toResponse(saved);
        writeAudit(saved.getId(), "CREATE", "新建工单", Map.of(), workOrderSnapshot(response));
        return ApiResponse.success(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<WorkOrderResponse> update(@PathVariable Long id, @RequestBody WorkOrderRequest request) {
        WorkOrder order = workOrderRepository.findByTenantIdAndIdForUpdate(TENANT_ID, id).orElseThrow(() -> error("工单不存在"));
        if (!"CREATED".equals(order.getStatus())) {
            throw error("只有已创建的工单可以编辑");
        }
        if (!productionService.objects(id).isEmpty() && (request == null || !Objects.equals(order.getProductId(), request.productId())
                || !Objects.equals(order.getOrderNo(), request.orderNo() == null ? null : request.orderNo().trim()))) {
            throw error("已拆分生产对象，不能修改产品或工单编号");
        }
        if (request != null && request.plannedQuantity() != null
                && request.plannedQuantity().compareTo(productionService.allocatedQuantity(id)) < 0) {
            throw error("工单计划数量不能小于已分配数量");
        }
        Map<String, Object> before = workOrderSnapshot(toResponse(order));
        apply(order, request, true);
        WorkOrderResponse response = toResponse(workOrderRepository.save(order));
        writeChangedAudit(id, "编辑工单", before, workOrderSnapshot(response));
        return ApiResponse.success(response);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<WorkOrderResponse> cancel(@PathVariable Long id) {
        WorkOrder beforeOrder = requireOrder(id);
        Map<String, Object> before = workOrderSnapshot(toResponse(beforeOrder));
        WorkOrderResponse response = toResponse(productionService.cancelOrder(id));
        writeChangedAudit(id, "取消工单", before, workOrderSnapshot(response));
        return ApiResponse.success(response);
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<WorkOrderResponse> close(@PathVariable Long id) {
        WorkOrder beforeOrder = workOrderRepository.findByTenantIdAndIdForUpdate(TENANT_ID, id)
                .orElseThrow(() -> error("工单不存在"));
        Map<String, Object> before = workOrderSnapshot(toResponse(beforeOrder));
        WorkOrderResponse response = toResponse(productionService.closeOrder(id));
        writeChangedAudit(id, "关闭工单", before, workOrderSnapshot(response));
        return ApiResponse.success(response);
    }

    private void apply(WorkOrder order, WorkOrderRequest request, boolean updating) {
        if (request == null || !StringUtils.hasText(request.orderNo())) throw error("工单编号不能为空");
        if (request == null || request.productId() == null) throw error("请选择产品");
        if (request.plannedQuantity() == null || request.plannedQuantity().signum() <= 0) throw error("计划数量必须大于0");
        if (request.plannedQuantity().stripTrailingZeros().scale() > 4 || request.plannedQuantity().compareTo(new BigDecimal("100000000000")) >= 0) throw error("计划数量最多11位整数和4位小数");
        String orderNo = request.orderNo().trim();
        if (orderNo.length() > 64) throw error("工单编号不能超过64个字符");
        workOrderRepository.findByTenantIdAndOrderNo(TENANT_ID, orderNo)
                .filter(existing -> !existing.getId().equals(order.getId()))
                .ifPresent(existing -> { throw error("工单编号已存在"); });
        materialRepository.findByTenantIdAndId(TENANT_ID, request.productId())
                .orElseThrow(() -> error("产品不存在"));
        order.setOrderNo(orderNo);
        order.setOrderNumber(StringUtils.hasText(request.orderNumber()) ? request.orderNumber().trim() : null);
        order.setProductId(request.productId());
        order.setPlannedQuantity(request.plannedQuantity());
        if (request.plannedStartAt() != null && request.plannedEndAt() != null
                && request.plannedEndAt().isBefore(request.plannedStartAt())) {
            throw error("计划结束时间不能早于计划开始时间");
        }
        order.setPlannedStartAt(request.plannedStartAt());
        order.setPlannedEndAt(request.plannedEndAt());
        order.setRemark(StringUtils.hasText(request.remark()) ? request.remark().trim() : null);
    }

    private WorkOrder requireOrder(Long id) { return productionService.requireOrder(id); }

    private WorkOrderResponse toResponse(WorkOrder order) {
        Material product = materialRepository.findByTenantIdAndId(TENANT_ID, order.getProductId()).orElse(null);
        return new WorkOrderResponse(String.valueOf(order.getId()), order.getOrderNo(), String.valueOf(order.getProductId()),
                product == null ? "-" : product.getName(), product == null ? "-" : product.getCode(),
                order.getProductionMode(), order.getProductionForm(),
                order.getPlannedQuantity(), order.getPlannedStartAt(), order.getPlannedEndAt(), order.getOrderNumber(),
                order.getStatus(), order.getRemark(), order.getCreatedAt(), order.getUpdatedAt(), outputs.order(order.getId()),
                !productionService.objects(order.getId()).isEmpty(), productionService.allocatedQuantity(order.getId()), order.getTerminationReason(), order.getTerminationAt());
    }

    private Map<String, Object> workOrderSnapshot(WorkOrderResponse response) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("orderNo", response.orderNo());
        snapshot.put("orderNumber", response.orderNumber());
        snapshot.put("productId", response.productId());
        snapshot.put("productName", response.productName());
        snapshot.put("productCode", response.productCode());
        snapshot.put("productionMode", response.productionMode());
        snapshot.put("productionForm", response.productionForm());
        snapshot.put("plannedQuantity", response.plannedQuantity());
        snapshot.put("plannedStartAt", response.plannedStartAt());
        snapshot.put("plannedEndAt", response.plannedEndAt());
        snapshot.put("status", response.status());
        snapshot.put("remark", response.remark());
        snapshot.put("terminationReason", response.terminationReason());
        snapshot.put("terminationAt", response.terminationAt());
        return snapshot;
    }

    private void writeChangedAudit(Long entityId, String functionName, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((key, value) -> {
            if (!Objects.equals(value, after.get(key))) {
                changedBefore.put(key, value);
                changedAfter.put(key, after.get(key));
            }
        });
        if (!changedBefore.isEmpty()) writeAudit(entityId, "UPDATE", functionName, changedBefore, changedAfter);
    }

    private void writeAudit(Long entityId, String action, String functionName, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId()).tenantId(TENANT_ID).entityType("WORK_ORDER").entityId(String.valueOf(entityId)).action(action)
                .contentBefore(toAuditJson(before)).contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("生产").menuName("生产准备 · 工单管理").functionName(functionName)
                .dataSummary("工单 #" + entityId).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    private String toAuditJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "工单审计快照格式化失败");
        }
    }

    private BusinessException error(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }

    @PostMapping("/{id}/end")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<WorkOrderResponse> end(@PathVariable Long id, @RequestBody ProductionObjectController.EndRequest request) {
        WorkOrder order = workOrderRepository.findByTenantIdAndIdForUpdate(TENANT_ID, id).orElseThrow(() -> error("工单不存在"));
        Map<String, Object> before = workOrderSnapshot(toResponse(order));
        WorkOrderResponse response = toResponse(productionService.endOrder(id, request == null ? null : request.reason()));
        writeChangedAudit(id, "提前结束工单", before, workOrderSnapshot(response));
        return ApiResponse.success(response);
    }

    public record WorkOrderRequest(String orderNo, String orderNumber, Long productId,
                                   BigDecimal plannedQuantity, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt,
                                   String remark) {}
    public record WorkOrderResponse(String id, String orderNo, String productId, String productName, String productCode,
                                    String productionMode, String productionForm,
                                    BigDecimal plannedQuantity, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt,
                                    String orderNumber, String status, String remark, LocalDateTime createdAt, LocalDateTime updatedAt, com.fasterxml.jackson.databind.JsonNode output,
                                    boolean hasObjects, BigDecimal allocatedQuantity, String terminationReason, LocalDateTime terminationAt) {}
}
