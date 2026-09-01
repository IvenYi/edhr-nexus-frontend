package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.entity.RouteVersion;
import com.zencas.edhr.masterdata.repository.RouteVersionRepository;
import com.zencas.edhr.template.entity.DhrTemplateVersion;
import com.zencas.edhr.template.repository.DhrTemplateVersionRepository;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/production")
@RequiredArgsConstructor
public class ProductionObjectController {
    private static final String TENANT_ID = "default";
    private final ProductionService productionService;
    private final RouteVersionRepository routeVersionRepository;
    private final DhrTemplateVersionRepository dhrTemplateVersionRepository;
    private final AuditEventRepository auditEventRepository;
    private final ObjectMapper objectMapper;
    private final SnowflakeIdGenerator idGenerator;

    @GetMapping("/work-orders/{workOrderId}/objects")
    @PreAuthorize("hasAuthority('production.work-orders')")
    public ApiResponse<List<ProductionObjectResponse>> list(@PathVariable Long workOrderId) {
        WorkOrder order = productionService.requireOrder(workOrderId);
        return ApiResponse.success(productionService.objects(order.getId()).stream().map(item -> toResponse(item, order)).toList());
    }

    @GetMapping("/work-orders/{workOrderId}/process-options")
    @PreAuthorize("hasAuthority('production.work-orders')")
    public ApiResponse<List<ProcessOption>> processOptions(@PathVariable Long workOrderId) {
        WorkOrder order = productionService.requireOrder(workOrderId);
        return ApiResponse.success(productionService.processOptions(order).stream().map(this::toOption).toList());
    }

    @PostMapping("/work-orders/{workOrderId}/objects")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<ProductionObjectResponse> split(@PathVariable Long workOrderId, @RequestBody SplitRequest request) {
        ProductionObject object = productionService.split(workOrderId, request == null ? null : request.processVersionId(), request == null ? null : request.targetQuantity(), request == null ? null : request.objectNo(), request == null ? null : request.remark(), request == null ? null : request.plannedStartAt(), request == null ? null : request.plannedEndAt());
        WorkOrder order = productionService.requireOrder(workOrderId);
        ProductionObjectResponse response = toResponse(object, order);
        writeAudit(object.getId(), "CREATE", "生产准备 · 工单管理", "拆分生产对象", Map.of(), productionObjectSnapshot(response, order));
        return ApiResponse.success(response);
    }

    @PostMapping("/work-orders/{workOrderId}/objects/batch")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<List<ProductionObjectResponse>> splitBatch(@PathVariable Long workOrderId, @RequestBody BatchSplitRequest request) {
        List<ProductionObject> created = productionService.splitBatch(workOrderId, request == null ? List.of() : request.items());
        WorkOrder order = productionService.requireOrder(workOrderId);
        List<ProductionObjectResponse> responses = created.stream().map(item -> toResponse(item, order)).toList();
        responses.forEach(response -> writeAudit(Long.valueOf(response.id()), "CREATE", "生产准备 · 工单管理", "批量添加生产对象", Map.of(), productionObjectSnapshot(response, order)));
        return ApiResponse.success(responses);
    }

    @PostMapping("/objects/{id}/start")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<ProductionObjectResponse> start(@PathVariable Long id) {
        Map<String, Object> before = productionObjectSnapshot(id);
        ProductionObjectResponse response = responseFor(id, productionService.startObject(id));
        writeChangedAudit(id, "生产准备 · 工单管理", "生产对象开工", before, productionObjectSnapshot(response, productionService.requireOrder(Long.valueOf(response.workOrderId()))));
        return ApiResponse.success(response);
    }

    @PostMapping("/objects/{id}/complete")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    public ApiResponse<ProductionObjectResponse> complete(@PathVariable Long id) {
        Map<String, Object> before = productionObjectSnapshot(id);
        ProductionObjectResponse response = responseFor(id, productionService.completeObject(id));
        writeChangedAudit(id, "生产准备 · 工单管理", "生产对象完成", before, productionObjectSnapshot(response, productionService.requireOrder(Long.valueOf(response.workOrderId()))));
        return ApiResponse.success(response);
    }

    @PostMapping("/objects/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('production.work-orders', 'production.batches')")
    @Transactional
    public ApiResponse<ProductionObjectResponse> cancel(@PathVariable Long id) {
        Map<String, Object> before = productionObjectSnapshot(id);
        ProductionObjectResponse response = responseFor(id, productionService.cancelObject(id));
        writeChangedAudit(id, "生产准备 · 工单管理", "取消生产对象", before, productionObjectSnapshot(response, productionService.requireOrder(Long.valueOf(response.workOrderId()))));
        return ApiResponse.success(response);
    }

    @PostMapping("/objects/{id}/end")
    @PreAuthorize("hasAuthority('production.batches')")
    @Transactional
    public ApiResponse<ProductionObjectResponse> end(@PathVariable Long id, @RequestBody EndRequest request) {
        Map<String, Object> before = productionObjectSnapshot(id);
        ProductionObjectResponse response = responseFor(id, productionService.endObject(id, request == null ? null : request.reason()));
        writeChangedAudit(id, "生产准备 · 批次管理", "提前结束批次", before, productionObjectSnapshot(response, productionService.requireOrder(Long.valueOf(response.workOrderId()))));
        return ApiResponse.success(response);
    }

    private ProductionObjectResponse responseFor(Long id, ProductionObject object) {
        WorkOrder order = productionService.requireOrder(object.getWorkOrderId());
        return toResponse(object, order);
    }

    private ProductionObjectResponse toResponse(ProductionObject object, WorkOrder order) {
        Material product = productionService.requireProduct(order.getProductId());
        ProductProcessVersion version = productionService.findProcessVersion(object.getProcessVersionId());
        return new ProductionObjectResponse(String.valueOf(object.getId()), object.getObjectNo(), object.getObjectType(), String.valueOf(object.getWorkOrderId()), product.getName(), product.getCode(), String.valueOf(object.getProcessVersionId()), version == null ? "-" : version.getVersionLabel(), object.getTargetQuantity(), object.getGoodQuantity(), object.getNgQuantity(), object.getScrapQuantity(), object.getStatus(), object.getRemark(), object.getTerminationReason(), object.getTerminationAt(), object.getPlannedStartAt(), object.getPlannedEndAt(), object.getCreatedAt(), object.getUpdatedAt());
    }

    private Map<String, Object> productionObjectSnapshot(Long id) {
        ProductionObject object = productionService.requireObject(id);
        WorkOrder order = productionService.requireOrder(object.getWorkOrderId());
        return productionObjectSnapshot(toResponse(object, order), order);
    }

    private Map<String, Object> productionObjectSnapshot(ProductionObjectResponse response, WorkOrder order) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("objectNo", response.objectNo());
        snapshot.put("objectType", response.objectType());
        snapshot.put("workOrderId", response.workOrderId());
        snapshot.put("workOrderNo", order.getOrderNo());
        snapshot.put("orderNumber", order.getOrderNumber());
        snapshot.put("productId", String.valueOf(order.getProductId()));
        snapshot.put("productName", response.productName());
        snapshot.put("productCode", response.productCode());
        snapshot.put("processVersionId", response.processVersionId());
        snapshot.put("processVersion", response.processVersion());
        snapshot.put("targetQuantity", response.targetQuantity());
        snapshot.put("goodQuantity", response.goodQuantity());
        snapshot.put("ngQuantity", response.ngQuantity());
        snapshot.put("scrapQuantity", response.scrapQuantity());
        snapshot.put("status", response.status());
        snapshot.put("plannedStartAt", response.plannedStartAt());
        snapshot.put("plannedEndAt", response.plannedEndAt());
        snapshot.put("terminationReason", response.terminationReason());
        snapshot.put("terminationAt", response.terminationAt());
        snapshot.put("remark", response.remark());
        return snapshot;
    }

    private void writeChangedAudit(Long entityId, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> changedBefore = new LinkedHashMap<>();
        Map<String, Object> changedAfter = new LinkedHashMap<>();
        before.forEach((key, value) -> {
            if (!Objects.equals(value, after.get(key))) {
                changedBefore.put(key, value);
                changedAfter.put(key, after.get(key));
            }
        });
        if (!changedBefore.isEmpty()) writeAudit(entityId, "UPDATE", menuName, functionName, changedBefore, changedAfter);
    }

    private void writeAudit(Long entityId, String action, String menuName, String functionName, Map<String, Object> before, Map<String, Object> after) {
        auditEventRepository.save(AuditEvent.builder()
                .id(idGenerator.nextId()).tenantId(TENANT_ID).entityType("PRODUCTION_OBJECT").entityId(String.valueOf(entityId)).action(action)
                .contentBefore(toAuditJson(before)).contentAfter(toAuditJson(after))
                .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("生产").menuName(menuName).functionName(functionName)
                .dataSummary("生产对象 #" + entityId).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    private String toAuditJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new BusinessException(ErrorCode.GENERAL_001, "生产对象审计快照格式化失败");
        }
    }

    private ProcessOption toOption(ProductProcessVersion version) {
        RouteVersion routeVersion = routeVersionRepository.findById(version.getRouteVersionId()).orElse(null);
        DhrTemplateVersion dhrTemplateVersion = dhrTemplateVersionRepository.findById(version.getDhrTemplateVersionId()).orElse(null);
        return new ProcessOption(String.valueOf(version.getId()), version.getVersionLabel(), version.getProductionMode(), version.getProductionForm(),
                routeVersion == null ? null : routeVersion.getVersion(), dhrTemplateVersion == null ? null : dhrTemplateVersion.getVersionLabel());
    }

    public record SplitRequest(Long processVersionId, BigDecimal targetQuantity, String objectNo, String remark, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt) {}
    public record BatchSplitRequest(List<SplitRequest> items) {}
    public record EndRequest(String reason) {}
    public record ProcessOption(String id, String version, String productionMode, String productionForm, String routeVersion, String dhrTemplateVersion) {}
    public record ProductionObjectResponse(String id, String objectNo, String objectType, String workOrderId, String productName, String productCode, String processVersionId, String processVersion, BigDecimal targetQuantity, BigDecimal goodQuantity, BigDecimal ngQuantity, BigDecimal scrapQuantity, String status, String remark, String terminationReason, LocalDateTime terminationAt, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt, LocalDateTime createdAt, LocalDateTime updatedAt) {}
}
