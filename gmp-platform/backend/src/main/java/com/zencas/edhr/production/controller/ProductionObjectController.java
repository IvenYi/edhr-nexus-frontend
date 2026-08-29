package com.zencas.edhr.production.controller;

import com.zencas.edhr.common.audit.Auditable;
import com.zencas.edhr.common.dto.ApiResponse;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/production")
@RequiredArgsConstructor
public class ProductionObjectController {
    private final ProductionService productionService;
    private final RouteVersionRepository routeVersionRepository;
    private final DhrTemplateVersionRepository dhrTemplateVersionRepository;

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
    @Auditable(entityType = "PRODUCTION_OBJECT", action = "CREATE", entityIdExpr = "#result.data.id", moduleName = "生产", menuName = "生产准备 · 工单管理", functionName = "拆分生产对象")
    public ApiResponse<ProductionObjectResponse> split(@PathVariable Long workOrderId, @RequestBody SplitRequest request) {
        WorkOrder order = productionService.requireOrder(workOrderId);
        ProductionObject object = productionService.split(workOrderId, request == null ? null : request.processVersionId(), request == null ? null : request.targetQuantity(), request == null ? null : request.objectNo(), request == null ? null : request.remark(), request == null ? null : request.plannedStartAt(), request == null ? null : request.plannedEndAt());
        return ApiResponse.success(toResponse(object, order));
    }

    @PostMapping("/work-orders/{workOrderId}/objects/batch")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Transactional
    @Auditable(entityType = "PRODUCTION_OBJECT", action = "CREATE", entityIdExpr = "#result.data[0].id", moduleName = "生产", menuName = "生产准备 · 工单管理", functionName = "批量添加生产对象")
    public ApiResponse<List<ProductionObjectResponse>> splitBatch(@PathVariable Long workOrderId, @RequestBody BatchSplitRequest request) {
        WorkOrder order = productionService.requireOrder(workOrderId);
        List<ProductionObject> created = productionService.splitBatch(workOrderId, request == null ? List.of() : request.items());
        return ApiResponse.success(created.stream().map(item -> toResponse(item, order)).toList());
    }

    @PostMapping("/objects/{id}/start")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Auditable(entityType = "PRODUCTION_OBJECT", action = "UPDATE", entityIdExpr = "#id", moduleName = "生产", menuName = "生产准备 · 工单管理", functionName = "生产对象开工")
    public ApiResponse<ProductionObjectResponse> start(@PathVariable Long id) { return ApiResponse.success(responseFor(id, productionService.startObject(id))); }

    @PostMapping("/objects/{id}/complete")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Auditable(entityType = "PRODUCTION_OBJECT", action = "UPDATE", entityIdExpr = "#id", moduleName = "生产", menuName = "生产准备 · 工单管理", functionName = "生产对象完成")
    public ApiResponse<ProductionObjectResponse> complete(@PathVariable Long id) { return ApiResponse.success(responseFor(id, productionService.completeObject(id))); }

    @PostMapping("/objects/{id}/cancel")
    @PreAuthorize("hasAuthority('production.work-orders')")
    @Auditable(entityType = "PRODUCTION_OBJECT", action = "UPDATE", entityIdExpr = "#id", moduleName = "生产", menuName = "生产准备 · 工单管理", functionName = "取消生产对象")
    public ApiResponse<ProductionObjectResponse> cancel(@PathVariable Long id) { return ApiResponse.success(responseFor(id, productionService.cancelObject(id))); }

    private ProductionObjectResponse responseFor(Long id, ProductionObject object) {
        WorkOrder order = productionService.requireOrder(object.getWorkOrderId());
        return toResponse(object, order);
    }

    private ProductionObjectResponse toResponse(ProductionObject object, WorkOrder order) {
        Material product = productionService.requireProduct(order.getProductId());
        ProductProcessVersion version = productionService.findProcessVersion(object.getProcessVersionId());
        return new ProductionObjectResponse(String.valueOf(object.getId()), object.getObjectNo(), object.getObjectType(), String.valueOf(object.getWorkOrderId()), product.getName(), product.getCode(), String.valueOf(object.getProcessVersionId()), version == null ? "-" : version.getVersionLabel(), object.getTargetQuantity(), object.getGoodQuantity(), object.getNgQuantity(), object.getScrapQuantity(), object.getStatus(), object.getRemark(), object.getPlannedStartAt(), object.getPlannedEndAt(), object.getCreatedAt(), object.getUpdatedAt());
    }
    private ProcessOption toOption(ProductProcessVersion version) {
        RouteVersion routeVersion = routeVersionRepository.findById(version.getRouteVersionId()).orElse(null);
        DhrTemplateVersion dhrTemplateVersion = dhrTemplateVersionRepository.findById(version.getDhrTemplateVersionId()).orElse(null);
        return new ProcessOption(String.valueOf(version.getId()), version.getVersionLabel(), version.getProductionMode(), version.getProductionForm(),
                routeVersion == null ? null : routeVersion.getVersion(), dhrTemplateVersion == null ? null : dhrTemplateVersion.getVersionLabel());
    }

    public record SplitRequest(Long processVersionId, BigDecimal targetQuantity, String objectNo, String remark, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt) {}
    public record BatchSplitRequest(List<SplitRequest> items) {}
    public record ProcessOption(String id, String version, String productionMode, String productionForm, String routeVersion, String dhrTemplateVersion) {}
    public record ProductionObjectResponse(String id, String objectNo, String objectType, String workOrderId, String productName, String productCode, String processVersionId, String processVersion, BigDecimal targetQuantity, BigDecimal goodQuantity, BigDecimal ngQuantity, BigDecimal scrapQuantity, String status, String remark, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt, LocalDateTime createdAt, LocalDateTime updatedAt) {}
}
