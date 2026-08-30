package com.zencas.edhr.production.service;

import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.masterdata.service.ProductProcessResolutionService;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.ProductionObjectRepository;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import com.zencas.edhr.workflow.engine.StateMachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProductionService {
    public static final String TENANT_ID = "default";
    private static final String MASS_PRODUCTION = "量产";
    private final WorkOrderRepository workOrderRepository;
    private final ProductionObjectRepository productionObjectRepository;
    private final com.zencas.edhr.masterdata.repository.MaterialRepository materialRepository;
    private final ProductProcessVersionRepository processVersionRepository;
    private final ProductProcessResolutionService processResolutionService;
    private final StateMachineService stateMachineService;
    private final SnowflakeIdGenerator idGenerator;

    @Transactional
    public ProductionObject split(Long workOrderId, Long requestedProcessVersionId, BigDecimal targetQuantity,
                                  String objectNo, String remark) {
        return split(workOrderId, requestedProcessVersionId, targetQuantity, objectNo, remark, null, null);
    }

    @Transactional
    public ProductionObject split(Long workOrderId, Long requestedProcessVersionId, BigDecimal targetQuantity,
                                   String objectNo, String remark, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt) {
        WorkOrder order = requireOrderForUpdate(workOrderId);
        if (!"CREATED".equals(order.getStatus())) throw error("只有已创建的工单可以拆分生产对象");
        if (targetQuantity == null || targetQuantity.signum() <= 0) {
            throw error("生产对象目标数量必须大于0");
        }
        if (plannedStartAt != null && plannedEndAt != null && plannedEndAt.isBefore(plannedStartAt)) {
            throw error("计划结束时间不能早于计划开始时间");
        }

        List<ProductionObject> existing = objects(workOrderId);
        ProductProcessVersion version = requireProcessVersion(order, requestedProcessVersionId);
        String productionForm = normalizeProductionForm(version.getProductionForm());
        if ("SN".equals(productionForm) && targetQuantity.compareTo(BigDecimal.ONE) != 0) {
            throw error("SN生产形态的生产对象目标数量必须为1");
        }
        if (existing.stream().anyMatch(item -> !productionForm.equals(item.getObjectType()))) {
            throw error("同一工单不能混用批次和SN生产形态");
        }
        BigDecimal allocated = existing.stream()
                .map(ProductionObject::getTargetQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (allocated.add(targetQuantity).compareTo(order.getPlannedQuantity()) > 0) {
            throw error("生产对象目标数量合计不能超过工单计划数量");
        }

        if (existing.isEmpty()) {
            order.setProcessVersionId(version.getId());
            order.setProductionMode(version.getProductionMode());
            order.setProductionForm(productionForm);
        } else if (!version.getId().equals(order.getProcessVersionId())) {
            throw error("工单已有生产对象，只能继续使用已锁定的制程");
        }

        Long objectId = idGenerator.nextId();
        String resolvedObjectNo = StringUtils.hasText(objectNo) ? objectNo.trim() : resolveObjectNo(productionForm, objectId);
        if (productionObjectRepository.existsByTenantIdAndObjectNo(TENANT_ID, resolvedObjectNo)) {
            throw error("生产对象编号已存在");
        }
        ProductionObject object = ProductionObject.builder()
                .id(objectId)
                .tenantId(TENANT_ID)
                .workOrderId(order.getId())
                .objectNo(resolvedObjectNo)
                .objectType(productionForm)
                .processVersionId(version.getId())
                .targetQuantity(targetQuantity)
                .plannedStartAt(plannedStartAt)
                .plannedEndAt(plannedEndAt)
                .remark(StringUtils.hasText(remark) ? remark.trim() : null)
                .createdBy(currentOperator())
                .updatedBy(currentOperator())
                .build();
        workOrderRepository.save(order);
        return productionObjectRepository.save(object);
    }

    @Transactional
    public List<ProductionObject> splitBatch(Long workOrderId, List<com.zencas.edhr.production.controller.ProductionObjectController.SplitRequest> requests) {
        if (requests == null || requests.isEmpty()) throw error("至少添加一个生产对象");
        if (requests.stream().anyMatch(java.util.Objects::isNull)) throw error("生产对象记录不能为空");
        return requests.stream().map(request -> split(workOrderId, request.processVersionId(), request.targetQuantity(), request.objectNo(), request.remark(), request.plannedStartAt(), request.plannedEndAt())).toList();
    }

    @Transactional
    public ProductionObject startObject(Long id) {
        ProductionObject object = requireObjectForUpdate(id);
        if (!"CREATED".equals(object.getStatus())) throw error("只有已创建的生产对象可以开工");
        WorkOrder order = requireOrderForUpdate(object.getWorkOrderId());
        if (!List.of("CREATED", "IN_PROCESS").contains(order.getStatus())) {
            throw error("当前工单不允许生产对象开工");
        }
        stateMachineService.transit("PRODUCTION_OBJECT", object.getId(), object.getStatus(), "IN_PROGRESS");
        object.setStatus("IN_PROGRESS");
        if ("CREATED".equals(order.getStatus())) {
            stateMachineService.transit("WORK_ORDER", order.getId(), order.getStatus(), "IN_PROCESS");
            order.setStatus("IN_PROCESS");
            workOrderRepository.save(order);
        }
        return productionObjectRepository.save(object);
    }

    @Transactional
    public ProductionObject completeObject(Long id) {
        ProductionObject object = requireObjectForUpdate(id);
        if (!"IN_PROGRESS".equals(object.getStatus())) throw error("只有生产中的对象可以完成");
        stateMachineService.transit("PRODUCTION_OBJECT", object.getId(), object.getStatus(), "COMPLETED");
        object.setStatus("COMPLETED");
        ProductionObject saved = productionObjectRepository.save(object);
        updateOrderWhenObjectsTerminal(requireOrderForUpdate(object.getWorkOrderId()));
        return saved;
    }

    @Transactional
    public ProductionObject cancelObject(Long id) {
        ProductionObject object = requireObjectForUpdate(id);
        if (!"CREATED".equals(object.getStatus())) throw error("只有未开工的生产对象可以取消");
        stateMachineService.transit("PRODUCTION_OBJECT", object.getId(), object.getStatus(), "CANCELLED");
        object.setStatus("CANCELLED");
        ProductionObject saved = productionObjectRepository.save(object);
        updateOrderWhenObjectsTerminal(requireOrderForUpdate(object.getWorkOrderId()));
        return saved;
    }

    @Transactional
    public ProductionObject endObject(Long id, String reason) {
        ProductionObject object = requireObjectForUpdate(id);
        if (!"IN_PROGRESS".equals(object.getStatus())) throw error("只有生产中的对象可以提前结束");
        if (!StringUtils.hasText(reason)) throw error("提前结束必须填写结束原因");
        stateMachineService.transit("PRODUCTION_OBJECT", object.getId(), object.getStatus(), "EARLY_TERMINATED");
        object.setStatus("EARLY_TERMINATED");
        object.setTerminationReason(reason.trim());
        object.setTerminationAt(LocalDateTime.now());
        ProductionObject saved = productionObjectRepository.save(object);
        updateOrderWhenObjectsTerminal(requireOrderForUpdate(object.getWorkOrderId()));
        return saved;
    }

    @Transactional
    public WorkOrder closeOrder(Long id) {
        WorkOrder order = requireOrderForUpdate(id);
        if (!"COMPLETED".equals(order.getStatus())) throw error("只有已完成的工单可以关闭");
        stateMachineService.transit("WORK_ORDER", order.getId(), order.getStatus(), "CLOSED");
        order.setStatus("CLOSED");
        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder cancelOrder(Long id) {
        WorkOrder order = requireOrderForUpdate(id);
        if (!"CREATED".equals(order.getStatus()) || !objects(id).isEmpty()) {
            throw error("只有未拆分且未开工的工单可以取消");
        }
        stateMachineService.transit("WORK_ORDER", order.getId(), order.getStatus(), "CANCELLED");
        order.setStatus("CANCELLED");
        return workOrderRepository.save(order);
    }

    private void updateOrderWhenObjectsTerminal(WorkOrder order) {
        List<ProductionObject> current = objects(order.getId());
        boolean terminal = !current.isEmpty() && current.stream()
                .allMatch(item -> List.of("COMPLETED", "EARLY_TERMINATED", "CANCELLED").contains(item.getStatus()));
        boolean hasEarlyTermination = current.stream().anyMatch(item -> "EARLY_TERMINATED".equals(item.getStatus()));
        boolean allCompleted = current.stream().allMatch(item -> "COMPLETED".equals(item.getStatus()));
        if (terminal && ("CREATED".equals(order.getStatus()) || "IN_PROCESS".equals(order.getStatus()))) {
            if (hasEarlyTermination && "IN_PROCESS".equals(order.getStatus())) {
                stateMachineService.transit("WORK_ORDER", order.getId(), order.getStatus(), "EARLY_TERMINATED");
                order.setStatus("EARLY_TERMINATED");
            } else if (allCompleted) {
                stateMachineService.transit("WORK_ORDER", order.getId(), order.getStatus(), "COMPLETED");
                order.setStatus("COMPLETED");
            } else {
                return;
            }
            workOrderRepository.save(order);
        }
    }

    public WorkOrder requireOrder(Long id) {
        return workOrderRepository.findByTenantIdAndId(TENANT_ID, id)
                .orElseThrow(() -> error("工单不存在"));
    }

    private WorkOrder requireOrderForUpdate(Long id) {
        return workOrderRepository.findByTenantIdAndIdForUpdate(TENANT_ID, id)
                .orElseThrow(() -> error("工单不存在"));
    }

    public ProductionObject requireObject(Long id) {
        return productionObjectRepository.findByTenantIdAndId(TENANT_ID, id)
                .orElseThrow(() -> error("生产对象不存在"));
    }

    private ProductionObject requireObjectForUpdate(Long id) {
        return productionObjectRepository.findByTenantIdAndIdForUpdate(TENANT_ID, id)
                .orElseThrow(() -> error("生产对象不存在"));
    }

    public List<ProductionObject> objects(Long workOrderId) {
        return productionObjectRepository.findByTenantIdAndWorkOrderIdOrderByCreatedAtAsc(TENANT_ID, workOrderId);
    }

    public ProductProcessVersion requireProcessVersion(WorkOrder order, Long requestedId) {
        if (order.getProcessVersionId() != null) {
            if (requestedId != null && !order.getProcessVersionId().equals(requestedId)) {
                throw error("工单制程已锁定，不允许更换");
            }
            ProductProcessVersion locked = processResolutionService
                    .findVersionForProduct(order.getProductId(), order.getProcessVersionId())
                    .filter(item -> MASS_PRODUCTION.equals(item.getProductionMode()))
                    .orElse(null);
            if (locked == null) throw error("工单已绑定的制程版本当前不可用");
            return locked;
        }
        if (requestedId == null) throw error("拆分生产对象前必须选择制程");
        ProductProcessVersion selected = processOptions(order.getProductId()).stream()
                .filter(item -> requestedId.equals(item.getId()))
                .findFirst().orElseThrow(() -> error("所选制程不属于该产品或当前不可用"));
        return selected;
    }

    public List<ProductProcessVersion> processOptions(WorkOrder order) {
        if (order.getProcessVersionId() != null) {
            ProductProcessVersion locked = processResolutionService
                    .findVersionForProduct(order.getProductId(), order.getProcessVersionId())
                    .filter(item -> MASS_PRODUCTION.equals(item.getProductionMode()))
                    .orElse(null);
            if (locked != null) return List.of(locked);
        }
        return processOptions(order.getProductId());
    }

    public List<ProductProcessVersion> processOptions(Long productId) {
        return processResolutionService.resolve(productId, LocalDateTime.now()).versions().stream()
                .filter(version -> MASS_PRODUCTION.equals(version.getProductionMode()))
                .toList();
    }

    public Material requireProduct(Long id) {
        return materialRepository.findByTenantIdAndId(TENANT_ID, id).orElseThrow(() -> error("产品不存在"));
    }

    public ProductProcessVersion findProcessVersion(Long id) {
        if (id == null) return null;
        return processVersionRepository.findByTenantIdAndId(TENANT_ID, id).orElse(null);
    }

    public static String normalizeProductionForm(String value) {
        if ("批次".equalsIgnoreCase(value) || "BATCH".equalsIgnoreCase(value)) return "BATCH";
        if ("SN".equalsIgnoreCase(value)) return "SN";
        throw new BusinessException(ErrorCode.GENERAL_001, "制程未配置有效的生产形态");
    }

    public static String currentOperator() {
        return StringUtils.hasText(AuditContext.getOperatorName()) ? AuditContext.getOperatorName() : "系统管理员";
    }

    private String resolveObjectNo(String form, Long seed) {
        return form + "-" + LocalDateTime.now().toString().replaceAll("[^0-9]", "") + "-" + seed % 10000;
    }

    private BusinessException error(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
