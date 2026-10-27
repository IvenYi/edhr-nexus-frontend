package com.zencas.edhr.production.service;

import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.masterdata.entity.Material;
import com.zencas.edhr.masterdata.entity.ProductProcessVersion;
import com.zencas.edhr.masterdata.repository.ProductProcessVersionRepository;
import com.zencas.edhr.masterdata.service.ProductProcessResolutionService;
import com.zencas.edhr.common.util.RdoVersionStatusResolver;
import com.zencas.edhr.production.repository.ProductionExecutionRepository;
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
    private final DhrInstanceService dhrInstances;
    private final ProductionExecutionRepository executions;

    @Transactional
    public ProductionObject split(Long workOrderId, Long requestedProcessVersionId, BigDecimal targetQuantity,
                                  String objectNo, String remark) {
        return split(workOrderId, requestedProcessVersionId, targetQuantity, objectNo, remark, null, null);
    }

    @Transactional
    public ProductionObject split(Long workOrderId, Long requestedProcessVersionId, BigDecimal targetQuantity,
                                   String objectNo, String remark, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt) {
        WorkOrder order = requireOrderForUpdate(workOrderId);
        if (!List.of("CREATED", "IN_PROCESS").contains(order.getStatus())) {
            throw error("只有已创建或生产中的工单可以拆分生产对象");
        }
        if (targetQuantity == null || targetQuantity.signum() <= 0) {
            throw error("生产对象目标数量必须大于0");
        }
        if (targetQuantity.stripTrailingZeros().scale() > 4) throw error("生产对象目标数量最多4位小数");
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
                .filter(item -> !"CANCELLED".equals(item.getStatus()))
                .map(ProductionObject::getTargetQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (allocated.add(targetQuantity).compareTo(order.getPlannedQuantity()) > 0) {
            throw error("生产对象目标数量合计不能超过工单计划数量");
        }

        if (existing.isEmpty()) {
            order.setProductionMode(version.getProductionMode());
            order.setProductionForm(productionForm);
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
        List<ProductionObject> created = requests.stream().map(request -> split(workOrderId, request.processVersionId(), request.targetQuantity(), request.objectNo(), request.remark(), request.plannedStartAt(), request.plannedEndAt())).toList();
        // Response summaries use JDBC; expose every new object within the current transaction.
        productionObjectRepository.flush();
        return created;
    }

    @Transactional
    public ProductionObject startObject(Long id) {
        WorkOrder order = requireOrderForObjectForUpdate(id);
        ProductionObject object = requireObjectForUpdate(id);
        if (!"CREATED".equals(object.getStatus())) throw error("只有已创建的生产对象可以开工");
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
        WorkOrder order = requireOrderForObjectForUpdate(id);
        ProductionObject object = requireObjectForUpdate(id);
        if (!"IN_PROGRESS".equals(object.getStatus())) throw error("只有生产中的对象可以完成");
        stateMachineService.transit("PRODUCTION_OBJECT", object.getId(), object.getStatus(), "COMPLETED");
        object.setStatus("COMPLETED");
        ProductionObject saved = productionObjectRepository.save(object);
        updateOrderWhenObjectsTerminal(order);
        return saved;
    }

    @Transactional
    public ProductionObject cancelObject(Long id) {
        WorkOrder order = requireOrderForObjectForUpdate(id);
        ProductionObject object = requireObjectForUpdate(id);
        if (!"CREATED".equals(object.getStatus())) throw error("只有未开工的生产对象可以取消");
        stateMachineService.transit("PRODUCTION_OBJECT", object.getId(), object.getStatus(), "CANCELLED");
        object.setStatus("CANCELLED");
        ProductionObject saved = productionObjectRepository.save(object);
        updateOrderWhenObjectsTerminal(order);
        return saved;
    }

    @Transactional
    public ProductionObject endObject(Long id, String reason) {
        WorkOrder order = requireOrderForObjectForUpdate(id);
        ProductionObject object = requireObjectForUpdate(id);
        if (!"IN_PROGRESS".equals(object.getStatus())) throw error("只有生产中的对象可以提前结束");
        if (!StringUtils.hasText(reason)) throw error("提前结束必须填写结束原因");
        LocalDateTime terminatedAt = LocalDateTime.now();
        dhrInstances.terminateWithProductionObject(id, reason.trim(), terminatedAt);
        stateMachineService.transit("PRODUCTION_OBJECT", object.getId(), object.getStatus(), "EARLY_TERMINATED");
        object.setStatus("EARLY_TERMINATED");
        object.setTerminationReason(reason.trim());
        object.setTerminationAt(terminatedAt);
        ProductionObject saved = productionObjectRepository.save(object);
        updateOrderWhenObjectsTerminal(order);
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

    @Transactional
    public WorkOrder endOrder(Long id, String reason) {
        WorkOrder order = requireOrderForUpdate(id);
        if (!List.of("CREATED", "IN_PROCESS").contains(order.getStatus())) throw error("只有未结束的工单可以提前结束");
        if (!StringUtils.hasText(reason) || reason.strip().length() > 500) throw error("请填写500字以内的结束原因");
        if (objects(id).stream().anyMatch(item -> List.of("CREATED", "IN_PROGRESS").contains(item.getStatus()))) {
            throw error("请先取消未开工批次，并完成或提前结束生产中的批次");
        }
        stateMachineService.transit("WORK_ORDER", id, order.getStatus(), "EARLY_TERMINATED");
        order.setStatus("EARLY_TERMINATED");
        order.setTerminationReason(reason.strip());
        order.setTerminationAt(LocalDateTime.now());
        return workOrderRepository.save(order);
    }

    @Transactional
    public ProductionObject updateObject(Long id, Long versionId, BigDecimal quantity,
                                         String remark, LocalDateTime plannedStartAt, LocalDateTime plannedEndAt) {
        WorkOrder order = requireOrderForObjectForUpdate(id);
        ProductionObject object = requireObjectForUpdate(id);
        if (!"CREATED".equals(object.getStatus()) || executions.existsById(id)) throw error("只有未开工且未取消的生产对象可以编辑");
        if (!List.of("CREATED", "IN_PROCESS").contains(order.getStatus())) throw error("工单已结束，不允许修改生产对象");
        ProductProcessVersion version = Objects.equals(versionId, object.getProcessVersionId())
                ? requireApplicableProcess(object, order) : requireProcessVersion(order, versionId);
        if (!object.getObjectType().equals(normalizeProductionForm(version.getProductionForm()))) throw error("更换制程不能改变生产形态");
        if (quantity == null || quantity.signum() <= 0 || quantity.stripTrailingZeros().scale() > 4) throw error("目标数量必须大于0，最多4位小数");
        if ("SN".equals(object.getObjectType()) && quantity.compareTo(BigDecimal.ONE) != 0) throw error("SN目标数量必须为1");
        if (allocatedQuantity(order.getId()).subtract(object.getTargetQuantity()).add(quantity).compareTo(order.getPlannedQuantity()) > 0) {
            throw error("增加的数量不能超过工单剩余可分配数量");
        }
        if (plannedStartAt != null && plannedEndAt != null && plannedEndAt.isBefore(plannedStartAt)) throw error("计划结束时间不能早于计划开始时间");
        object.setProcessVersionId(versionId);
        object.setTargetQuantity(quantity);
        object.setRemark(StringUtils.hasText(remark) ? remark.strip() : null);
        object.setPlannedStartAt(plannedStartAt);
        object.setPlannedEndAt(plannedEndAt);
        object.setUpdatedBy(currentOperator());
        return productionObjectRepository.save(object);
    }

    public BigDecimal allocatedQuantity(Long orderId) {
        return objects(orderId).stream().filter(item -> !"CANCELLED".equals(item.getStatus()))
                .map(ProductionObject::getTargetQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void lockObjectForEdit(Long id) {
        requireOrderForObjectForUpdate(id);
        requireObjectForUpdate(id);
    }

    private void updateOrderWhenObjectsTerminal(WorkOrder order) {
        List<ProductionObject> current = objects(order.getId());
        List<ProductionObject> allocated = current.stream().filter(item -> !"CANCELLED".equals(item.getStatus())).toList();
        boolean allCompleted = !allocated.isEmpty() && allocated.stream().allMatch(item -> "COMPLETED".equals(item.getStatus()));
        BigDecimal total = allocated.stream().map(ProductionObject::getTargetQuantity).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (allCompleted && total.compareTo(order.getPlannedQuantity()) == 0 && "IN_PROCESS".equals(order.getStatus())) {
            stateMachineService.transit("WORK_ORDER", order.getId(), order.getStatus(), "COMPLETED");
            order.setStatus("COMPLETED");
            workOrderRepository.save(order);
        }
    }

    public WorkOrder requireOrder(Long id) {
        return workOrderRepository.findByTenantIdAndId(TENANT_ID, id)
                .orElseThrow(() -> error("工单不存在"));
    }

    private WorkOrder requireOrderForObjectForUpdate(Long id) {
        Long orderId = productionObjectRepository.findWorkOrderId(TENANT_ID, id).orElseThrow(() -> error("生产对象不存在"));
        return requireOrderForUpdate(orderId);
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
        if (requestedId == null) throw error("拆分生产对象前必须选择制程");
        ProductProcessVersion selected = processOptions(order).stream()
                .filter(item -> requestedId.equals(item.getId()))
                .findFirst().orElseThrow(() -> error("所选制程不属于该产品或当前不可用"));
        return selected;
    }

    public List<ProductProcessVersion> processOptions(WorkOrder order) {
        String form = objects(order.getId()).stream().findFirst().map(ProductionObject::getObjectType).orElse(null);
        return processOptions(order.getProductId()).stream()
                .filter(version -> form == null || form.equals(normalizeProductionForm(version.getProductionForm()))).toList();
    }

    public ProductProcessVersion requireApplicableProcess(ProductionObject object, WorkOrder order) {
        ProductProcessVersion version = processResolutionService.findVersionForProduct(order.getProductId(), object.getProcessVersionId())
                .orElseThrow(() -> error("批次制程已不适用于当前产品或产品簇，请在生产准备中重新选择制程"));
        if (!MASS_PRODUCTION.equals(version.getProductionMode()) || !RdoVersionStatusResolver.ACTIVE.equals(
                RdoVersionStatusResolver.resolve(version.getEffectiveFrom(), version.getEffectiveTo(), LocalDateTime.now()))) {
            throw error("批次制程未生效或已失效，请在生产准备中重新选择制程");
        }
        if (!object.getObjectType().equals(normalizeProductionForm(version.getProductionForm()))) throw error("批次制程的生产形态已改变，请重新选择相同生产形态的制程");
        return version;
    }

    public List<ProductProcessVersion> processOptions(Long productId) {
        return processResolutionService.resolve(productId, LocalDateTime.now()).versions().stream()
                .filter(version -> MASS_PRODUCTION.equals(version.getProductionMode()))
                .toList();
    }

    public Material requireProduct(Long id) {
        return materialRepository.findByTenantIdAndId(TENANT_ID, id).orElseThrow(() -> error("产品不存在"));
    }

    public Material findProduct(Long id) {
        return materialRepository.findByTenantIdAndId(TENANT_ID, id).orElse(null);
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
