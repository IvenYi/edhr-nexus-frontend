package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
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
    private final ExecutionPresenceRegistry presence;
    private final UserAccountRepository userAccounts;
    private final FormInstanceRecordService formRecords;

    @Transactional(readOnly = true)
    public com.fasterxml.jackson.databind.node.ArrayNode publishedForms(String keyword) { return snapshots.publishedForms(keyword); }

    @Transactional(readOnly = true)
    public ObjectNode editors(Long id, String operationId, PresenceCommand command) {
        ProductionObject object = production.requireObject(id);
        WorkOrder order = production.requireOrder(object.getWorkOrderId());
        String actor = AuditContext.getOperatorId();
        if (actor == null || actor.isBlank()) throw invalid("请先登录");
        if (command != null && (command.sessionId() == null || !command.sessionId().matches("[A-Za-z0-9-]{1,80}"))) throw invalid("填写会话标识无效");
        if (command != null && !command.editing()) presence.leave(id, actor, command.sessionId());
        ProductionExecution execution = executions.findById(id).orElse(null);
        ObjectNode result = mapper.createObjectNode();
        boolean allowed = execution != null && "IN_PROGRESS".equals(object.getStatus()) && List.of("CREATED", "IN_PROCESS").contains(order.getStatus());
        if (!allowed) {
            if (command != null && command.editing()) throw invalid("当前生产对象不可填报");
            return result;
        }
        ObjectNode snapshot = parse(execution.getSnapshotJson());
        JsonNode op = engine.find(snapshot.path("operations"), operationId);
        JsonNode current = parse(execution.getStateJson()).path("operations").path(operationId);
        if (command != null && command.editing()) {
            if (!canEdit(op, current, command.formId(), command.instanceId(), actor)) throw invalid("当前表单份不可编辑");
            presence.heartbeat(id, command.sessionId(), actor, AuditContext.getOperatorName(), operationId, command.formId(), command.instanceId());
        }
        for (var editor : presence.list(id, operationId)) {
            if (!canEdit(op, current, editor.formId(), editor.instanceId(), editor.userId())) continue;
            ObjectNode users = result.withObject("/" + editor.formId());
            ObjectNode user = users.withObject("/" + editor.userId());
            if (!user.has("userId")) {
                Long avatarId = userAccounts.findById(Long.valueOf(editor.userId())).map(com.zencas.edhr.identity.entity.UserAccount::getAvatarFileId).orElse(null);
                if (avatarId != null) user.put("avatarUrl", "/api/v1/files/" + avatarId + "/public-preview");
            }
            user.put("userId", editor.userId()).put("name", editor.name() == null ? editor.userId() : editor.name());
            var sequences = user.has("sequences") ? (com.fasterxml.jackson.databind.node.ArrayNode) user.path("sequences") : user.putArray("sequences");
            int sequence = ExecutionFormCopies.ids(current, editor.formId()).indexOf(editor.instanceId()) + 1;
            if (!java.util.stream.StreamSupport.stream(sequences.spliterator(), false).anyMatch(n -> n.asInt() == sequence)) sequences.add(sequence);
        }
        return result;
    }

    private boolean canEdit(JsonNode op, JsonNode current, String formId, String instanceId, String actor) {
        if (!"IN_PROGRESS".equals(current.path("status").asText()) || formId == null || instanceId == null || !ExecutionFormCopies.ids(current, formId).contains(instanceId)) return false;
        JsonNode form = engine.find(op.path("forms"), formId);
        ObjectNode controls = engine.formControls(form, current.path("forms").path(instanceId), actor);
        return controls.path("canAct").asBoolean() && java.util.stream.StreamSupport.stream(controls.path("permissions").spliterator(), false).anyMatch(n -> "EDIT".equals(n.asText()));
    }

    public record PresenceCommand(String sessionId, String formId, String instanceId, boolean editing) {}

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
        if (List.of("SAVE", "SUBMIT", "APPROVE", "RETURN", "ADD_FORM_COPY", "END_FORM").contains(command.action()) && (command.formId() == null || command.formId().isBlank())) throw invalid("请选择执行表单");
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
        ObjectNode snapshotBefore = "ATTACH_FORM".equals(command.action()) ? snapshot.deepCopy() : null;
        String attachedFormId = null;
        String previousObjectStatus = object.getStatus();
        switch (command.action()) {
            case "ATTACH_FORM" -> {
                if (command.required() == null) throw invalid("请明确选择必填或选填");
                attachedFormId = "custom-" + ids.nextId();
                engine.attachForm(snapshot, state, command.operationId(), snapshots.customForm(command.templateVersionId(), command.required(), attachedFormId, operator), operator);
            }
            case "START" -> engine.start(snapshot, state, command.operationId(), operator);
            case "COMPLETE" -> engine.complete(snapshot, state, command.operationId(), operator, Boolean.TRUE.equals(command.acknowledgeIncomplete()));
            case "ADD_FORM_COPY" -> engine.addFormCopy(snapshot, state, command.operationId(), command.formId(), operator);
            case "END_FORM" -> engine.endForm(snapshot, state, command.operationId(), command.formId(), Boolean.TRUE.equals(command.acknowledgeIncomplete()), operator);
            case "CONFIRM" -> engine.confirm(snapshot, state, command.operationId(), command.workId(), command.nodeId(), operator);
            case "SAVE", "SUBMIT", "APPROVE", "RETURN" -> engine.formAction(snapshot, state, command.operationId(), command.formId(), command.instanceId(), command.action(),
                    command.values(), command.opinion(), command.account(), command.password(), operator);
            default -> throw invalid("不支持的执行动作");
        }
        if (List.of("SAVE", "SUBMIT", "APPROVE", "RETURN").contains(command.action())) {
            formRecords.saved(id, object.getTenantId(), snapshot, state, command.operationId(), command.formId(), command.instanceId());
        }
        if (created) production.startObject(id);
        if (engine.allComplete(snapshot, state)) production.completeObject(id);
        execution.setSnapshotJson(snapshot.toString()); execution.setStateJson(state.toString());
        execution.setRevision(execution.getRevision() + 1); execution.setUpdatedAt(LocalDateTime.now());
        executions.saveAndFlush(execution);
        ObjectNode auditBefore = mapper.createObjectNode().put("objectStatus", previousObjectStatus); auditBefore.set("execution", before);
        ObjectNode auditAfter = mapper.createObjectNode().put("objectStatus", object.getStatus()); auditAfter.set("execution", state);
        if (snapshotBefore != null) { auditBefore.set("snapshot", snapshotBefore); auditAfter.set("snapshot", snapshot); }
        audits.save(AuditEvent.builder().id(ids.nextId()).entityType("PRODUCTION_EXECUTION").entityId(id.toString()).action(created ? "CREATE" : "UPDATE")
                .contentBefore(auditBefore.toString())
                .contentAfter(auditAfter.toString())
                .operatorId(operator).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).moduleName("生产").menuName("生产执行").functionName(command.action())
                .dataSummary(object.getObjectNo() + " · " + command.operationId()).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
        ObjectNode result = view(object, order, execution);
        if (attachedFormId != null) result.put("attachedFormId", attachedFormId);
        return result;
    }

    ObjectNode view(ProductionObject object, WorkOrder order, ProductionExecution execution) {
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
            entry.set("completionWarnings", mapper.valueToTree(engine.completionWarnings(op, current)));
            entry.put("canStart", allowed && "PENDING".equals(current.path("status").asText()) && start.isEmpty());
            entry.put("canComplete", allowed && "IN_PROGRESS".equals(current.path("status").asText()) && completion.isEmpty());
            entry.put("canAttachForm", allowed && "IN_PROGRESS".equals(current.path("status").asText()));
            ObjectNode forms = entry.putObject("forms");
            ObjectNode copyControls = entry.putObject("formCopies");
            for (JsonNode form : op.path("forms")) {
                String formId = form.path("id").asText();
                ObjectNode group = copyControls.putObject(formId);
                List<String> instanceIds = ExecutionFormCopies.ids(current, formId);
                group.set("instanceIds", mapper.valueToTree(instanceIds));
                group.put("status", ExecutionFormCopies.status(current, formId));
                group.put("ended", ExecutionFormCopies.ended(current, formId));
                group.put("required", ExecutionFormCopies.required(op, form));
                List<String> incomplete = ExecutionFormCopies.incomplete(current, form);
                group.set("incomplete", mapper.valueToTree(incomplete));
                boolean manage = allowed && engine.canManageCopies(form, current, AuditContext.getOperatorId());
                group.put("canAdd", manage);
                group.put("canEnd", manage && (!ExecutionFormCopies.required(op, form) || incomplete.isEmpty()));
                ObjectNode instances = group.putObject("instances");
                for (String instanceId : instanceIds) {
                    ObjectNode instance = engine.formControls(form, current.path("forms").path(instanceId), AuditContext.getOperatorId());
                    if (!allowed || !"IN_PROGRESS".equals(current.path("status").asText())) disableForm(form, instance);
                    instances.set(instanceId, instance);
                }
                ObjectNode controls = engine.formControls(form, current.path("forms").path(form.path("id").asText()), AuditContext.getOperatorId());
                if (!allowed || !"IN_PROGRESS".equals(current.path("status").asText())) {
                    disableForm(form, controls);
                }
                forms.set(form.path("id").asText(), controls);
            }
        }
        return response;
    }

    private void disableForm(JsonNode form, ObjectNode controls) {
        controls.put("canAct", false); controls.putArray("buttons");
        for (JsonNode field : form.path("fields")) controls.withObject("/permissions").put(field.path("id").asText(), "READ_ONLY");
    }

    private ObjectNode parse(String source) {
        try { return (ObjectNode) mapper.readTree(source); }
        catch (Exception e) { throw invalid("执行记录无法解析，请联系管理员核查"); }
    }

    public record Command(String action, Long revision, String operationId, String formId, String workId, String nodeId,
                          JsonNode values, String opinion, String account, String password, String instanceId, Boolean acknowledgeIncomplete,
                          String templateVersionId, Boolean required) {
        public Command(String action, Long revision, String operationId, String formId, String workId, String nodeId,
                       JsonNode values, String opinion, String account, String password, String instanceId, Boolean acknowledgeIncomplete) {
            this(action, revision, operationId, formId, workId, nodeId, values, opinion, account, password, instanceId, acknowledgeIncomplete, null, null);
        }
        public Command(String action, Long revision, String operationId, String formId, String workId, String nodeId,
                       JsonNode values, String opinion, String account, String password) {
            this(action, revision, operationId, formId, workId, nodeId, values, opinion, account, password, null, false);
        }
    }
}
