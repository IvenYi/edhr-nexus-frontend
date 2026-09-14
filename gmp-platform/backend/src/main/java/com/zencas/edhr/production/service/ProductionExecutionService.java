package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.production.entity.ProductionExecution;
import com.zencas.edhr.production.entity.ProductionObject;
import com.zencas.edhr.production.entity.WorkOrder;
import com.zencas.edhr.production.repository.ProductionExecutionRepository;
import com.zencas.edhr.production.repository.ProductionObjectRepository;
import com.zencas.edhr.production.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Service
@RequiredArgsConstructor
public class ProductionExecutionService {
    private final ProductionObjectRepository objects;
    private final WorkOrderRepository orders;
    private final ProductionExecutionRepository executions;
    private final ProductionService production;
    private final ExecutionSnapshotBuilder snapshots;
    private final ProductionExecutionEngine engine;
    private final ObjectMapper mapper;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;
    private final ExecutionAccess access;

    @Transactional(readOnly = true)
    public List<java.util.Map<String, String>> references(Long id, String operationId, String formId, String fieldId, String keyword) {
        ObjectNode view = get(id);
        JsonNode op = engine.find(view.path("snapshot").path("operations"), operationId);
        JsonNode form = engine.find(op.path("forms"), formId);
        JsonNode field = findField(form.path("fields"), fieldId);
        if (field == null) throw invalid("执行配置中不存在该字段");
        if (!"reference".equals(field.path("type").asText())) throw invalid("此字段不是引用字段");
        return access.references(field, keyword);
    }

    private JsonNode findField(JsonNode fields, String id) {
        for (JsonNode field : fields) {
            if (id.equals(field.path("id").asText())) return field;
            JsonNode nested = findField(field.path("typeConfig").path("columns"), id);
            if (nested != null) return nested;
        }
        return null;
    }

    @Transactional(readOnly = true)
    public ObjectNode scan(String barcode) {
        String value = barcode == null ? "" : barcode.strip();
        if (value.isEmpty() || value.length() > 64) throw invalid("请输入有效的批次号或 SN 条码");
        ProductionObject object = objects.findByTenantIdAndObjectNo("default", value).orElseThrow(() -> invalid("未找到该批次或 SN，请核对条码"));
        return view(object, production.requireOrder(object.getWorkOrderId()), executions.findById(object.getId()).orElse(null));
    }

    @Transactional(readOnly = true)
    public ObjectNode get(Long id) {
        ProductionObject object = production.requireObject(id);
        return view(object, production.requireOrder(object.getWorkOrderId()), executions.findById(id).orElse(null));
    }

    @Transactional
    public ObjectNode act(Long id, Command command) {
        if (command == null || command.action() == null || command.revision() == null) throw invalid("执行动作和修订号不能为空");
        if (command.operationId() == null || command.operationId().isBlank()) throw invalid("请选择执行工序");
        if (List.of("SAVE", "SUBMIT", "APPROVE", "RETURN").contains(command.action()) && (command.formId() == null || command.formId().isBlank())) throw invalid("请选择执行表单");
        if ("CONFIRM".equals(command.action()) && (command.workId() == null || command.nodeId() == null)) throw invalid("请选择执行作业");
        // Keep the order/object lock order consistent with order termination and allocation.
        Long orderId = objects.findWorkOrderId("default", id).orElseThrow(() -> invalid("生产对象不存在"));
        WorkOrder order = orders.findByTenantIdAndIdForUpdate("default", orderId).orElseThrow(() -> invalid("工单不存在"));
        ProductionObject object = objects.findByTenantIdAndIdForUpdate("default", id).orElseThrow(() -> invalid("生产对象不存在"));
        if (!List.of("CREATED", "IN_PROCESS").contains(order.getStatus()) || !List.of("CREATED", "IN_PROGRESS").contains(object.getStatus()))
            throw invalid("工单或生产对象已结束，不能继续执行");
        ProductionExecution execution = executions.findById(id).orElse(null);
        if (command.revision() != (execution == null ? 0L : execution.getRevision())) throw invalid("执行记录已被更新，请刷新后重试，未保存内容仍保留在页面");
        String operator = AuditContext.getOperatorId();
        if (operator == null || operator.isBlank()) throw invalid("请先登录");
        ObjectNode snapshot;
        ObjectNode state;
        boolean created = execution == null;
        if (created) {
            if (!"START".equals(command.action()) || !"CREATED".equals(object.getStatus())) throw invalid("此对象尚无可用执行记录，不能补造历史执行状态");
            snapshot = snapshots.build(object, order); state = engine.initialState(snapshot);
            if (snapshot.path("operations").isEmpty()) throw invalid("产品配置没有可执行工序");
            execution = ProductionExecution.builder().objectId(id).revision(0L).startedAt(LocalDateTime.now()).build();
        } else { snapshot = parse(execution.getSnapshotJson()); state = parse(execution.getStateJson()); }
        ObjectNode before = state.deepCopy();
        String previousObjectStatus = object.getStatus();
        switch (command.action()) {
            case "START" -> engine.start(snapshot, state, command.operationId(), operator);
            case "COMPLETE" -> engine.complete(snapshot, state, command.operationId(), operator);
            case "CONFIRM" -> engine.confirm(snapshot, state, command.operationId(), command.workId(), command.nodeId(), operator);
            case "SAVE", "SUBMIT", "APPROVE", "RETURN" -> engine.formAction(snapshot, state, command.operationId(), command.formId(), command.action(),
                    command.values(), command.opinion(), command.account(), command.password(), operator);
            default -> throw invalid("不支持的执行动作");
        }
        if (created) production.startObject(id);
        if (engine.allComplete(snapshot, state)) production.completeObject(id);
        execution.setSnapshotJson(snapshot.toString()); execution.setStateJson(state.toString());
        execution.setRevision(execution.getRevision() + 1); execution.setUpdatedAt(LocalDateTime.now());
        executions.saveAndFlush(execution);
        audits.save(AuditEvent.builder().id(ids.nextId()).entityType("PRODUCTION_EXECUTION").entityId(id.toString()).action(created ? "CREATE" : "UPDATE")
                .contentBefore(mapper.createObjectNode().put("objectStatus", previousObjectStatus).set("execution", before).toString())
                .contentAfter(mapper.createObjectNode().put("objectStatus", object.getStatus()).set("execution", state).toString())
                .operatorId(operator).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("生产").menuName("生产执行").functionName(command.action())
                .dataSummary(object.getObjectNo() + " · " + command.operationId()).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
        return view(object, order, execution);
    }

    private ObjectNode view(ProductionObject object, WorkOrder order, ProductionExecution execution) {
        ObjectNode response = mapper.createObjectNode();
        ObjectNode snapshot;
        try { snapshot = execution == null ? snapshots.build(object, order) : parse(execution.getSnapshotJson()); }
        catch (com.zencas.edhr.common.exception.BusinessException error) {
            snapshot = mapper.createObjectNode();
            var product = production.requireProduct(order.getProductId());
            snapshot.putObject("context").put("objectId", object.getId().toString()).put("objectNo", object.getObjectNo())
                    .put("objectType", object.getObjectType()).put("workOrderNo", order.getOrderNo()).put("productName", product.getName()).put("productCode", product.getCode());
            snapshot.putArray("operations"); response.put("configurationError", error.getMessage());
        }
        ObjectNode state = execution == null ? engine.initialState(snapshot) : parse(execution.getStateJson());
        response.set("snapshot", snapshot); response.set("state", state);
        response.put("revision", execution == null ? 0L : execution.getRevision()).put("objectStatus", object.getStatus()).put("orderStatus", order.getStatus());
        response.put("startedAt", execution == null ? null : execution.getStartedAt().toString());
        boolean historical = execution == null && !List.of("CREATED", "CANCELLED").contains(object.getStatus());
        response.put("historicalWithoutExecution", historical);
        boolean allowed = !historical && List.of("CREATED", "IN_PROGRESS").contains(object.getStatus()) && List.of("CREATED", "IN_PROCESS").contains(order.getStatus());
        ObjectNode availability = response.putObject("availability");
        ObjectNode operationOutputs = response.putObject("operationOutputs");
        for (JsonNode op : snapshot.path("operations")) {
            String id = op.path("id").asText(); JsonNode current = state.path("operations").path(id);
            operationOutputs.set(id, ExecutionOutputSummary.project(mapper, op, current));
            ObjectNode entry = availability.putObject(id);
            List<String> start = engine.startIssues(snapshot, state, op);
            List<String> completion = engine.completionIssues(op, current);
            entry.set("startIssues", mapper.valueToTree(start)); entry.set("completionIssues", mapper.valueToTree(completion));
            entry.put("canStart", allowed && "PENDING".equals(current.path("status").asText()) && start.isEmpty());
            entry.put("canComplete", allowed && "IN_PROGRESS".equals(current.path("status").asText()) && completion.isEmpty());
            ObjectNode forms = entry.putObject("forms");
            for (JsonNode form : op.path("forms")) {
                ObjectNode controls = engine.formControls(form, current.path("forms").path(form.path("id").asText()), AuditContext.getOperatorId());
                if (!allowed || !"IN_PROGRESS".equals(current.path("status").asText())) {
                    controls.put("canAct", false); controls.putArray("buttons");
                    for (JsonNode field : form.path("fields")) controls.withObject("/permissions").put(field.path("id").asText(), "READ_ONLY");
                }
                forms.set(form.path("id").asText(), controls);
            }
        }
        return response;
    }

    private ObjectNode parse(String source) {
        try { return (ObjectNode) mapper.readTree(source); }
        catch (Exception e) { throw invalid("执行记录无法解析，请联系管理员核查"); }
    }

    public record Command(String action, Long revision, String operationId, String formId, String workId, String nodeId,
                          JsonNode values, String opinion, String account, String password) {}
}
