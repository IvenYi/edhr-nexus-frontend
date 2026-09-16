package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Component
@RequiredArgsConstructor
public class ProductionExecutionEngine {
    private final ObjectMapper mapper;
    private final ExecutionAccess access;

    public ObjectNode initialState(JsonNode snapshot) {
        ObjectNode state = mapper.createObjectNode();
        ObjectNode operations = state.putObject("operations");
        for (JsonNode op : snapshot.path("operations")) {
            ObjectNode entry = operations.putObject(op.path("id").asText()).put("status", "PENDING");
            entry.putObject("forms"); entry.putObject("works");
        }
        state.putArray("history");
        return state;
    }

    public List<String> startIssues(JsonNode snapshot, JsonNode state, JsonNode op) {
        List<String> issues = new ArrayList<>();
        try {
            Set<String> checked = new HashSet<>();
            for (JsonNode node : snapshot.path("routeNodes")) validateRoute(snapshot, node.path("id").asText(), new HashSet<>(), checked);
            for (JsonNode work : op.path("works")) {
                initializeGraph(work, mapper.createObjectNode());
                for (JsonNode node : work.path("nodes")) {
                    if ("NOTIFICATION".equals(kind(node))) issues.add("作业「" + work.path("name").asText() + "」配置了尚未接入投递服务的通知，不能跳过执行");
                }
            }
            for (JsonNode form : op.path("forms")) if (form.has("flow")) initializeGraph(form.path("flow"), mapper.createObjectNode());
        } catch (com.zencas.edhr.common.exception.BusinessException e) { issues.add(e.getMessage()); }
        if ("REWORK".equals(op.path("type").asText())) issues.add("返工工序需通过已定义的返工入口执行");
        Set<String> predecessors = new LinkedHashSet<>();
        try { collectPredecessors(snapshot, op.path("id").asText(), predecessors, new HashSet<>()); }
        catch (com.zencas.edhr.common.exception.BusinessException e) { issues.add(e.getMessage()); }
        for (String id : predecessors) {
            JsonNode before = find(snapshot.path("operations"), id);
            if (!"COMPLETED".equals(state.path("operations").path(id).path("status").asText()))
                issues.add("前置工序「" + before.path("name").asText(id) + "」尚未完工");
        }
        for (JsonNode edge : snapshot.path("routeEdges")) {
            if (!edge.path("rule").asText("").isBlank())
                issues.add("路线配置了尚未建立运行契约的连线条件，不能自动放行");
        }
        for (JsonNode form : op.path("forms")) if (!form.path("fields").isArray()) issues.add("表单「" + form.path("name").asText() + "」字段配置不完整");
        return issues;
    }

    private void validateRoute(JsonNode snapshot, String id, Set<String> visiting, Set<String> checked) {
        if (checked.contains(id) || "REWORK".equals(find(snapshot.path("routeNodes"), id).path("type").asText())) return;
        if (!visiting.add(id)) throw invalid("工艺路线存在循环依赖");
        for (JsonNode edge : snapshot.path("routeEdges")) if (id.equals(edge.path("source").asText()))
            validateRoute(snapshot, edge.path("target").asText(), visiting, checked);
        visiting.remove(id); checked.add(id);
    }

    private void collectPredecessors(JsonNode snapshot, String target, Set<String> result, Set<String> visiting) {
        if (!visiting.add(target)) throw invalid("工艺路线存在循环依赖");
        for (JsonNode edge : snapshot.path("routeEdges")) {
            if (!target.equals(edge.path("target").asText())) continue;
            String source = edge.path("source").asText();
            JsonNode node = find(snapshot.path("routeNodes"), source);
            if ("REWORK".equals(node.path("type").asText())) continue;
            if ("OPERATION".equals(node.path("type").asText())) result.add(source);
            else collectPredecessors(snapshot, source, result, visiting);
        }
        visiting.remove(target);
    }

    public List<String> completionIssues(JsonNode op, JsonNode opState) {
        List<String> issues = new ArrayList<>();
        for (JsonNode form : op.path("forms")) {
            if (form.has("fulfilledBy") || !ExecutionFormCopies.required(op, form)) continue;
            String formId = form.path("id").asText();
            if (ExecutionFormCopies.ids(opState, formId).isEmpty()) {
                boolean requiredBinding = !form.has("workId");
                for (JsonNode direct : op.path("forms"))
                    if (formId.equals(direct.path("fulfilledBy").asText()) && direct.path("required").asBoolean(true)) requiredBinding = true;
                if (requiredBinding) issues.add("表单「" + form.path("name").asText() + "」尚未提交完成");
            }
            issues.addAll(ExecutionFormCopies.incomplete(opState, form));
            if (!ExecutionFormCopies.ids(opState, formId).isEmpty() && ExecutionFormCopies.incomplete(opState, form).isEmpty()
                    && !ExecutionFormCopies.ended(opState, formId)) issues.add("表单「" + form.path("name").asText() + "」尚未结束填报");
        }
        for (JsonNode work : op.path("works")) {
            if (!"COMPLETED".equals(opState.path("works").path(work.path("id").asText()).path("status").asText()))
                issues.add("作业「" + work.path("name").asText() + "」尚未完成");
        }
        for (JsonNode form : op.path("forms")) {
            if (form.has("fulfilledBy")) continue;
            for (String instanceId : ExecutionFormCopies.ids(opState, form.path("id").asText())) {
                JsonNode entry = opState.path("forms").path(instanceId);
                if ("COMPLETED".equals(entry.path("status").asText())) issues.addAll(validateValues(form, entry.path("values")));
            }
        }
        return issues;
    }

    public void start(JsonNode snapshot, ObjectNode state, String operationId, String operator) {
        JsonNode op = find(snapshot.path("operations"), operationId);
        ObjectNode current = (ObjectNode) state.path("operations").path(operationId);
        if (!"PENDING".equals(current.path("status").asText())) throw invalid("当前工序已经开工或完工，请刷新");
        requireEmpty(startIssues(snapshot, state, op));
        current.put("status", "IN_PROGRESS").put("startedAt", LocalDateTime.now().toString());
        for (JsonNode form : op.path("forms")) {
            if (form.has("workId") || form.has("fulfilledBy")) continue;
            initializeBindingForm(form, current);
        }
        for (JsonNode work : op.path("works")) {
            ObjectNode workState = current.withObject("/works").putObject(work.path("id").asText());
            initializeGraph(work, workState);
            advanceWork(snapshot, op, current, work, workState);
        }
        history(state, op, "工序开工", operator, "");
    }

    public void complete(JsonNode snapshot, ObjectNode state, String operationId, String operator) {
        complete(snapshot, state, operationId, operator, false);
    }

    public void complete(JsonNode snapshot, ObjectNode state, String operationId, String operator, boolean acknowledged) {
        JsonNode op = find(snapshot.path("operations"), operationId);
        ObjectNode current = requireInProgress(state, operationId);
        requireEmpty(completionIssues(op, current));
        List<String> warnings = completionWarnings(op, current);
        if (!warnings.isEmpty() && !acknowledged) throw invalid("请确认未完成表单告知：" + String.join("；", warnings));
        for (JsonNode form : op.path("forms")) {
            if (form.has("fulfilledBy") || ExecutionFormCopies.required(op, form) || ExecutionFormCopies.ids(current, form.path("id").asText()).isEmpty()) continue;
            if (!ExecutionFormCopies.ended(current, form.path("id").asText()))
                ExecutionFormCopies.ensureGroup(current, form.path("id").asText()).put("ended", true).put("endedBy", operator)
                        .put("endedAt", LocalDateTime.now().toString()).put("endedReason", "OPERATION_COMPLETE");
        }
        current.put("status", "COMPLETED").put("completedAt", LocalDateTime.now().toString());
        history(state, op, "工序完工", operator, warnings.isEmpty() ? "" : "已告知：" + String.join("；", warnings) + "，保持进行中");
    }

    public void confirm(JsonNode snapshot, ObjectNode state, String operationId, String workId, String nodeId, String operator) {
        JsonNode op = find(snapshot.path("operations"), operationId);
        ObjectNode current = requireInProgress(state, operationId);
        JsonNode work = find(op.path("works"), workId);
        ObjectNode workState = (ObjectNode) current.path("works").path(workId);
        JsonNode node = find(work.path("nodes"), nodeId);
        if (!contains(workState.path("active"), nodeId) || !"CONFIRMATION".equals(kind(node))) throw invalid("该作业动作当前不可执行");
        finishNode(work, workState, nodeId, null);
        advanceWork(snapshot, op, current, work, workState);
        history(state, op, "作业确认", operator, work.path("name").asText() + " / " + node.path("data").path("label").asText());
    }

    public ObjectNode formControls(JsonNode form, JsonNode formState, String operator) {
        ObjectNode result = mapper.createObjectNode();
        result.putArray("buttons"); result.putObject("permissions");
        for (JsonNode field : form.path("fields")) result.withObject("/permissions").put(field.path("id").asText(), "READ_ONLY");
        if (!"ACTIVE".equals(formState.path("status").asText())) return result;
        String active = formState.path("active").path(0).asText();
        if (form.has("flow")) for (JsonNode id : formState.path("active")) {
            if (access.canAct(form, find(form.path("flow").path("nodes"), id.asText()), formState, operator)) { active = id.asText(); break; }
        }
        JsonNode node = form.has("flow") ? find(form.path("flow").path("nodes"), active) : defaultFormNode();
        result.put("nodeId", active).put("nodeName", node.path("data").path("label").asText("现场填报"));
        result.put("canAct", access.canAct(form, node, formState, operator));
        result.set("permissions", access.permissions(form, node, formState, operator));
        ArrayNode buttons = (ArrayNode) result.get("buttons");
        JsonNode configured = node.path("data").path("config").path("buttons");
        if (!configured.isArray() || configured.isEmpty()) configured = defaultButtons(kind(node));
        for (JsonNode button : configured) {
            if (!button.path("visible").asBoolean(true)) continue;
            ObjectNode copy = button.deepCopy();
            boolean sign = false;
            for (JsonNode event : node.path("data").path("config").path("buttonEvents"))
                if (event.path("action").asText().equals(button.path("action").asText())) {
                    if (!"BEFORE".equals(event.path("event").asText()) || !"ACCOUNT_PASSWORD".equals(event.path("signatureMethod").asText()))
                        throw invalid("表单动作配置了不支持的签署事件");
                    sign = true;
                }
            copy.put("requiresSignature", sign); buttons.add(copy);
        }
        return result;
    }

    public void formAction(JsonNode snapshot, ObjectNode state, String operationId, String formId, String action,
                           JsonNode values, String opinion, String account, String password, String operator) {
        formAction(snapshot, state, operationId, formId, null, action, values, opinion, account, password, operator);
    }

    public void formAction(JsonNode snapshot, ObjectNode state, String operationId, String formId, String instanceId, String action,
                           JsonNode values, String opinion, String account, String password, String operator) {
        JsonNode op = find(snapshot.path("operations"), operationId);
        ObjectNode current = requireInProgress(state, operationId);
        JsonNode form = find(op.path("forms"), formId);
        if ((instanceId == null || instanceId.isBlank()) && ExecutionFormCopies.ids(current, formId).size() > 1) throw invalid("请选择具体表单份");
        String target = instanceId == null || instanceId.isBlank() ? formId : instanceId;
        if (!ExecutionFormCopies.ids(current, formId).contains(target)) throw invalid("表单份不属于当前表单或尚未到达");
        JsonNode existing = current.path("forms").path(target);
        if (!existing.isObject()) throw invalid("表单尚未到达可执行节点");
        ObjectNode formState = (ObjectNode) existing;
        ObjectNode controls = formControls(form, formState, operator);
        if (!controls.path("canAct").asBoolean()) throw invalid("当前用户无权处理此表单节点");
        JsonNode button = null;
        for (JsonNode item : controls.path("buttons")) if (action.equals(item.path("action").asText())) button = item;
        if (button == null) throw invalid("当前表单节点不允许该动作");
        if (button.path("requireOpinion").asBoolean() && (opinion == null || opinion.isBlank())) throw invalid("请填写操作意见");
        if (values == null || !values.isObject()) throw invalid("表单数据格式不正确");
        ObjectNode previous = formState.withObject("/values");
        Iterator<String> keys = values.fieldNames();
        while (keys.hasNext()) {
            String id = keys.next();
            JsonNode field = find(form.path("fields"), id);
            if (!"EDIT".equals(controls.path("permissions").path(id).asText()) && !Objects.equals(values.get(id), previous.get(id)))
                throw invalid("字段「" + field.path("name").asText(id) + "」为只读");
            if ("disabled".equals(field.path("status").asText())) throw invalid("不能修改停用字段");
            access.validateEvidence(field, values.get(id), snapshot.path("context").path("objectId").asText());
            validateNestedEdits(field, values.get(id), previous.path(id));
        }
        ObjectNode merged = previous.deepCopy(); merged.setAll((ObjectNode) values);
        String nodeId = controls.path("nodeId").asText();
        JsonNode node = form.has("flow") ? find(form.path("flow").path("nodes"), nodeId) : defaultFormNode();
        JsonNode activeBefore = formState.path("active").deepCopy();
        if (button.path("requiresSignature").asBoolean()) {
            String signature = access.sign(snapshot.path("context").path("objectId").asText(), operationId + "/" + target, action, merged, account, password);
            formState.put("lastSignatureId", signature);
            for (JsonNode event : node.path("data").path("config").path("buttonEvents")) {
                if (!action.equals(event.path("action").asText()) || !"FILL_SIGN_FIELD".equals(event.path("builtin").asText())) continue;
                String key = nodeId + ":" + event.path("id").asText();
                String fieldId = form.path("binding").path("eventBindings").path(key).path("fieldId").asText();
                if (fieldId.isBlank()) throw invalid("签署动作尚未绑定签名字段");
                {
                    JsonNode field = find(form.path("fields"), fieldId);
                    if (!"signature".equals(field.path("type").asText())) throw invalid("签名绑定不是签名字段");
                    merged.put(fieldId, operator + " · " + LocalDateTime.now() + " · " + signature);
                }
            }
        }
        if (!Set.of("SAVE", "RETURN").contains(action)) {
            ObjectNode nodeForm = form.deepCopy();
            for (JsonNode field : nodeForm.path("fields")) {
                if (!"EDIT".equals(controls.path("permissions").path(field.path("id").asText()).asText())) {
                    ((ObjectNode) field).put("required", false);
                    ((ObjectNode) field).withObject("/typeConfig").put("required", false);
                }
            }
            requireEmpty(validateValues(nodeForm, merged));
        }
        ExecutionFormCopies.ensureGroup(current, formId);
        formState.set("values", merged); formState.put("savedAt", LocalDateTime.now().toString());
        if ("RETURN".equals(action)) initializeFormGraph(form, formState);
        else if (!"SAVE".equals(action)) {
            if (form.has("flow")) {
                finishNode(form.path("flow"), formState, nodeId, null);
                settleForm(form, formState);
            } else formState.put("status", "COMPLETED");
            if ("COMPLETED".equals(formState.path("status").asText())) requireEmpty(validateValues(form, merged));
        }
        for (JsonNode activeId : formState.path("active")) if (!contains(activeBefore, activeId.asText()))
            formState.withObject("/nodeArrivedAt").put(activeId.asText(), LocalDateTime.now().toString());
        history(state, op, switch (action) { case "SAVE" -> "保存表单"; case "SUBMIT" -> "提交表单"; case "APPROVE" -> "审批表单"; case "RETURN" -> "退回表单"; default -> action; }, operator, form.path("name").asText() + " · 第 " + (ExecutionFormCopies.ids(current, formId).indexOf(target) + 1) + " 份 · " + target + (opinion == null || opinion.isBlank() ? "" : " · " + opinion))
            .put("actionCode", action).put("formId", formId).put("copyId", target).put("nodeId", nodeId)
            .put("nodeKind", kind(node)).put("nodeName", node.path("data").path("label").asText("现场填报"));
    }

    public List<String> completionWarnings(JsonNode op, JsonNode current) {
        List<String> warnings = new ArrayList<>();
        for (JsonNode form : op.path("forms")) if (!form.has("fulfilledBy") && !ExecutionFormCopies.required(op, form))
            warnings.addAll(ExecutionFormCopies.incomplete(current, form));
        return warnings;
    }

    public boolean canManageCopies(JsonNode form, JsonNode current, String operator) {
        String id = form.path("id").asText();
        if (!"IN_PROGRESS".equals(current.path("status").asText()) || form.has("fulfilledBy")
                || ExecutionFormCopies.ids(current, id).isEmpty() || ExecutionFormCopies.ended(current, id)) return false;
        if (form.has("workId") && !contains(current.path("works").path(form.path("workId").asText()).path("active"), form.path("workNodeId").asText())) return false;
        JsonNode node = defaultFormNode();
        if (form.has("flow")) {
            node = null;
            for (JsonNode candidate : form.path("flow").path("nodes")) if ("START".equals(kind(candidate))) node = candidate;
            if (node == null) return false;
        }
        return access.canAct(form, node, current.path("forms").path(id), operator);
    }

    public void attachForm(ObjectNode snapshot, ObjectNode state, String operationId, ObjectNode form, String operator) {
        JsonNode op = find(snapshot.path("operations"), operationId);
        ObjectNode current = requireInProgress(state, operationId);
        ((ArrayNode) op.path("forms")).add(form);
        initializeBindingForm(form, current);
        ((ObjectNode) current.path("forms").path(form.path("id").asText())).put("explicitCreatorId", operator).put("explicitCreatedAt", LocalDateTime.now().toString());
        history(state, op, "挂载自定义表单", operator, form.path("name").asText() + " · " + form.path("versionId").asText()
                + " · " + (form.path("required").asBoolean() ? "必填" : "选填") + " · " + form.path("id").asText());
    }

    public void addFormCopy(JsonNode snapshot, ObjectNode state, String operationId, String formId, String operator) {
        JsonNode op = find(snapshot.path("operations"), operationId);
        ObjectNode current = requireInProgress(state, operationId);
        JsonNode form = find(op.path("forms"), formId);
        if (!canManageCopies(form, current, operator)) throw invalid("当前用户或表单阶段不允许新增份");
        ObjectNode group = ExecutionFormCopies.ensureGroup(current, formId);
        int sequence = group.path("instanceIds").size() + 1;
        String instanceId = formId + ":copy:" + sequence;
        initializeForm(form, current.withObject("/forms").putObject(instanceId));
        ((ObjectNode) current.path("forms").path(instanceId)).put("explicitCreatorId", operator).put("explicitCreatedAt", LocalDateTime.now().toString());
        ((ArrayNode) group.path("instanceIds")).add(instanceId);
        history(state, op, "新增表单份", operator, form.path("name").asText() + " · 第 " + sequence + " 份 · " + instanceId);
    }

    public void endForm(JsonNode snapshot, ObjectNode state, String operationId, String formId, boolean acknowledged, String operator) {
        JsonNode op = find(snapshot.path("operations"), operationId);
        ObjectNode current = requireInProgress(state, operationId);
        JsonNode form = find(op.path("forms"), formId);
        if (!canManageCopies(form, current, operator)) throw invalid("当前用户或表单阶段不允许结束填报");
        List<String> incomplete = ExecutionFormCopies.incomplete(current, form);
        if (ExecutionFormCopies.required(op, form)) requireEmpty(incomplete);
        else if (!incomplete.isEmpty() && !acknowledged) throw invalid("请确认未完成表单告知：" + String.join("；", incomplete));
        ExecutionFormCopies.ensureGroup(current, formId).put("ended", true).put("endedAt", LocalDateTime.now().toString()).put("endedBy", operator);
        if (form.has("workId")) {
            JsonNode work = find(op.path("works"), form.path("workId").asText());
            ObjectNode workState = (ObjectNode) current.path("works").path(form.path("workId").asText());
            finishNode(work, workState, form.path("workNodeId").asText(), null);
            advanceWork(snapshot, op, current, work, workState);
        }
        history(state, op, "结束表单填报", operator, form.path("name").asText() + (incomplete.isEmpty() ? "" : " · 已告知：" + String.join("；", incomplete) + "，保持进行中"));
    }

    public List<String> validateValues(JsonNode form, JsonNode values) {
        List<String> issues = new ArrayList<>();
        for (JsonNode field : form.path("fields")) {
            if ("disabled".equals(field.path("status").asText())) continue;
            JsonNode value = values.path(field.path("id").asText());
            String name = field.path("name").asText();
            boolean empty = value.isMissingNode() || value.isNull() || (value.isTextual() && value.asText().isBlank()) || (value.isArray() && value.isEmpty());
            JsonNode config = field.path("typeConfig");
            if (empty) {
                if (field.path("required").asBoolean() || config.path("required").asBoolean()) issues.add("请填写「" + name + "」");
                continue;
            }
            if (Set.of("text", "datetime", "signature").contains(field.path("type").asText()) && !value.isTextual())
                issues.add(name + "必须为文本值");
            if ("text".equals(field.path("type").asText()) && config.path("maxLength").asInt(0) > 0 && value.asText().length() > config.path("maxLength").asInt())
                issues.add(name + "超过最大长度");
            if ("datetime".equals(field.path("type").asText()) && value.isTextual()) {
                try {
                    switch (config.path("mode").asText()) {
                        case "date" -> java.time.LocalDate.parse(value.asText());
                        case "time" -> java.time.LocalTime.parse(value.asText());
                        default -> LocalDateTime.parse(value.asText());
                    }
                } catch (java.time.format.DateTimeParseException e) { issues.add(name + "日期或时间格式不正确"); }
            }
            if ("number".equals(field.path("type").asText())) {
                try {
                    var number = new java.math.BigDecimal(value.asText());
                    int scale = Math.max(0, number.stripTrailingZeros().scale());
                    if ("integer".equals(config.path("numberMode").asText()) && scale > 0) issues.add(name + "必须为整数");
                    else if (config.hasNonNull("precision") && scale > config.path("precision").asInt()) issues.add(name + "超过允许的小数位数");
                    if (config.hasNonNull("min") && number.compareTo(new java.math.BigDecimal(config.path("min").asText())) < 0) issues.add(name + "低于最小值");
                    if (config.hasNonNull("max") && number.compareTo(new java.math.BigDecimal(config.path("max").asText())) > 0) issues.add(name + "高于最大值");
                } catch (NumberFormatException e) { issues.add(name + "必须为有效数值"); }
            }
            if ("subTable".equals(field.path("type").asText())) {
                if (!value.isArray()) { issues.add(name + "必须为子表记录"); continue; }
                JsonNode columns = config.path("columns");
                if (!columns.isArray() || columns.isEmpty()) { issues.add(name + "子字段配置不完整"); continue; }
                ObjectNode rowForm = mapper.createObjectNode(); rowForm.set("fields", columns);
                for (JsonNode row : value) {
                    if (!row.isObject()) { issues.add(name + "子表行格式不正确"); continue; }
                    for (Iterator<String> keys = row.fieldNames(); keys.hasNext();) find(columns, keys.next());
                    issues.addAll(validateValues(rowForm, row));
                }
            }
            if (Set.of("singleSelect", "multiSelect").contains(field.path("type").asText())) {
                Set<String> options = new HashSet<>();
                JsonNode configured = config.path("options");
                if (configured.isArray()) for (JsonNode option : configured) { if (!"disabled".equals(option.path("status").asText())) options.add(option.path("value").asText()); }
                else for (String line : configured.asText().split("\\n")) { String[] pair = line.split(":", 2); options.add(pair.length > 1 ? pair[1] : pair[0]); }
                if ("multiSelect".equals(field.path("type").asText())) {
                    if (!value.isArray()) issues.add(name + "必须为多选值");
                    else for (JsonNode selected : value) if (!options.contains(selected.asText())) issues.add(name + "包含无效选项");
                } else if (!value.isTextual() || !options.contains(value.asText())) issues.add(name + "不是有效选项");
            }
        }
        return issues;
    }

    private void validateNestedEdits(JsonNode field, JsonNode value, JsonNode previous) {
        if (!"subTable".equals(field.path("type").asText()) || !value.isArray()) return;
        JsonNode columns = field.path("typeConfig").path("columns");
        for (int i = 0; i < value.size(); i++) {
            JsonNode row = value.get(i);
            for (Iterator<String> keys = row.fieldNames(); keys.hasNext();) {
                String key = keys.next(); JsonNode column = find(columns, key);
                if ((column.path("readOnly").asBoolean() || "signature".equals(column.path("type").asText()) || "disabled".equals(column.path("status").asText()))
                        && !Objects.equals(row.path(key), previous.path(i).path(key))) throw invalid("子表字段「" + column.path("name").asText() + "」为只读");
                validateNestedEdits(column, row.path(key), previous.path(i).path(key));
            }
        }
    }

    private void initializeForm(JsonNode form, ObjectNode state) { state.putObject("values"); initializeFormGraph(form, state); }
    private void initializeBindingForm(JsonNode form, ObjectNode state) {
        String id = form.path("id").asText();
        initializeForm(form, state.withObject("/forms").putObject(id));
        ExecutionFormCopies.ensureGroup(state, id).put("ended", false);
    }
    private void initializeFormGraph(JsonNode form, ObjectNode state) {
        state.putObject("approvers"); state.putObject("restrictedApprovers");
        state.put("status", "ACTIVE");
        if (form.has("flow")) { initializeGraph(form.path("flow"), state); state.put("status", "ACTIVE"); settleForm(form, state); }
        else { state.putArray("active").add("entry"); state.putArray("done"); }
        ObjectNode arrivals = state.putObject("nodeArrivedAt");
        for (JsonNode id : state.path("active")) arrivals.put(id.asText(), LocalDateTime.now().toString());
    }
    private void settleForm(JsonNode form, ObjectNode state) {
        for (JsonNode id : state.path("active").deepCopy()) {
            JsonNode node = find(form.path("flow").path("nodes"), id.asText());
            if ("END".equals(kind(node))) finishNode(form.path("flow"), state, id.asText(), null);
            else access.captureApprovers(node, state);
        }
        state.put("status", state.path("active").isEmpty() ? "COMPLETED" : "ACTIVE");
    }

    private void advanceWork(JsonNode snapshot, JsonNode op, ObjectNode opState, JsonNode work, ObjectNode state) {
        int budget = work.path("nodes").size() + 1;
        boolean changed = true;
        while (changed && budget-- > 0) {
            changed = false;
            for (JsonNode id : state.path("active").deepCopy()) {
                JsonNode node = find(work.path("nodes"), id.asText());
                String kind = kind(node);
                if (Set.of("START", "END", "CONDITION").contains(kind)) {
                    String outlet = "CONDITION".equals(kind) ? conditionOutlet(snapshot, node, state) : null;
                    finishNode(work, state, id.asText(), outlet); changed = true;
                } else if ("FORM".equals(kind)) {
                    for (JsonNode form : op.path("forms")) {
                        if (work.path("id").asText().equals(form.path("workId").asText()) && id.asText().equals(form.path("workNodeId").asText())
                                && !opState.path("forms").has(form.path("id").asText()))
                            initializeBindingForm(form, opState);
                    }
                } else if (!"CONFIRMATION".equals(kind)) throw invalid("无法执行的作业节点类型：" + kind);
            }
        }
        if (budget < 0) throw invalid("作业流程存在循环推进");
        state.put("status", state.path("active").isEmpty() ? "COMPLETED" : "RUNNING");
    }

    private String conditionOutlet(JsonNode snapshot, JsonNode node, ObjectNode state) {
        JsonNode config = node.path("data").path("config");
        ObjectNode facts = mapper.createObjectNode().put("workType", "WORK").put("triggerType", "OPERATION_START")
                .put("sourceType", snapshot.path("context").path("objectType").asText())
                .put("sourceNumber", snapshot.path("context").path("objectNo").asText()).put("executionStatus", "RUNNING");
        state.withObject("/conditionFacts").set(node.path("id").asText(), facts.deepCopy());
        for (JsonNode branch : config.path("conditionBranches")) {
            if (!"work-runtime-fields-v1".equals(branch.path("fieldCatalogVersion").asText())) throw invalid("条件字段目录版本不受支持");
            if (evaluate(branch.path("conditionRule"), facts)) {
                String id = branch.path("id").asText();
                return id.startsWith("condition-") ? id : "condition-" + id;
            }
        }
        String otherwise = config.path("conditionDefaultBranch").path("id").asText();
        if (otherwise.isBlank()) throw invalid("条件节点缺少否则分支");
        return otherwise;
    }

    public boolean evaluate(JsonNode rule, JsonNode facts) {
        if (rule.has("all") || rule.has("any")) {
            boolean all = rule.has("all"); JsonNode children = rule.path(all ? "all" : "any");
            if (!children.isArray() || children.isEmpty()) throw invalid("条件表达式为空");
            boolean result = all;
            for (JsonNode child : children) { boolean value = evaluate(child, facts); result = all ? result && value : result || value; }
            return result;
        }
        if (rule.has("not")) return !evaluate(rule.path("not"), facts);
        String fact = rule.path("fact").asText();
        if (!facts.has(fact)) throw invalid("条件字段没有可靠来源：" + fact);
        String actual = facts.path(fact).asText(""); String expected = rule.path("value").asText();
        return switch (rule.path("operator").asText()) {
            case "equals" -> actual.equals(expected);
            case "not-equals" -> !actual.equals(expected);
            case "contains" -> actual.contains(expected);
            case "starts-with" -> actual.startsWith(expected);
            case "in" -> contains(rule.path("value"), actual);
            case "is-present" -> !actual.isBlank();
            case "is-null" -> actual.isBlank();
            default -> throw invalid("不支持的条件操作符");
        };
    }

    private void initializeGraph(JsonNode graph, ObjectNode state) {
        Set<String> checked = new HashSet<>();
        for (JsonNode node : graph.path("nodes")) validateAcyclic(graph, node.path("id").asText(), new HashSet<>(), checked);
        state.putObject("decisions");
        state.putArray("done"); ArrayNode active = state.putArray("active");
        for (JsonNode node : graph.path("nodes")) if ("START".equals(kind(node))) active.add(node.path("id").asText());
        if (active.size() != 1) throw invalid("流程必须有且仅有一个开始节点");
        Set<String> reachable = new HashSet<>();
        reachable(graph, state, active.get(0).asText(), reachable);
        for (JsonNode node : graph.path("nodes")) {
            String id = node.path("id").asText();
            if (!reachable.contains(id)) throw invalid("流程包含无法到达的节点");
            boolean outgoing = false;
            for (JsonNode edge : graph.path("edges")) if (id.equals(edge.path("source").asText())) outgoing = true;
            if ("END".equals(kind(node)) == outgoing) throw invalid("流程结束节点或后续连线配置不完整");
        }
    }
    private void finishNode(JsonNode graph, ObjectNode state, String id, String outlet) {
        ArrayNode done = (ArrayNode) state.get("done"); if (!contains(done, id)) done.add(id);
        if (outlet != null) state.withObject("/decisions").put(id, outlet);
        int targets = 0;
        for (JsonNode edge : graph.path("edges")) {
            if (!id.equals(edge.path("source").asText())) continue;
            if (outlet != null && !edge.path("sourceHandle").asText().equals(outlet)) continue;
            find(graph.path("nodes"), edge.path("target").asText());
            targets++;
        }
        if (targets == 0 && !"END".equals(kind(find(graph.path("nodes"), id)))) throw invalid("流程节点没有有效后续连线");
        Set<String> reachable = new HashSet<>();
        for (JsonNode node : graph.path("nodes")) if ("START".equals(kind(node))) reachable(graph, state, node.path("id").asText(), reachable);
        ArrayNode active = mapper.createArrayNode();
        for (JsonNode node : graph.path("nodes")) {
            String target = node.path("id").asText();
            if (!reachable.contains(target) || contains(done, target)) continue;
            boolean ready = true; int incoming = 0;
            for (JsonNode edge : graph.path("edges")) {
                String source = edge.path("source").asText();
                if (!target.equals(edge.path("target").asText()) || !reachable.contains(source) || !selectedEdge(state, edge)) continue;
                incoming++; ready &= contains(done, source);
            }
            if (ready && incoming > 0) active.add(target);
        }
        state.set("active", active);
    }

    private boolean selectedEdge(JsonNode state, JsonNode edge) {
        String selected = state.path("decisions").path(edge.path("source").asText()).asText();
        return selected.isBlank() || selected.equals(edge.path("sourceHandle").asText());
    }
    private void reachable(JsonNode graph, JsonNode state, String id, Set<String> visited) {
        if (!visited.add(id)) return;
        for (JsonNode edge : graph.path("edges")) if (id.equals(edge.path("source").asText()) && selectedEdge(state, edge)) reachable(graph, state, edge.path("target").asText(), visited);
    }
    private void validateAcyclic(JsonNode graph, String id, Set<String> visiting, Set<String> checked) {
        if (checked.contains(id)) return;
        if (!visiting.add(id)) throw invalid("流程回路需要明确的返工执行契约");
        find(graph.path("nodes"), id);
        for (JsonNode edge : graph.path("edges")) if (id.equals(edge.path("source").asText())) validateAcyclic(graph, edge.path("target").asText(), visiting, checked);
        visiting.remove(id); checked.add(id);
    }

    public boolean allComplete(JsonNode snapshot, JsonNode state) {
        int count = 0;
        for (JsonNode op : snapshot.path("operations")) {
            if ("REWORK".equals(op.path("type").asText())) continue;
            count++;
            if (!"COMPLETED".equals(state.path("operations").path(op.path("id").asText()).path("status").asText())) return false;
        }
        return count > 0;
    }
    private ObjectNode requireInProgress(ObjectNode state, String id) {
        JsonNode current = state.path("operations").path(id);
        if (!"IN_PROGRESS".equals(current.path("status").asText())) throw invalid("当前工序不在执行中");
        return (ObjectNode) current;
    }
    public JsonNode find(JsonNode entries, String id) {
        for (JsonNode entry : entries) if (id.equals(entry.path("id").asText())) return entry;
        throw invalid("执行配置中不存在该记录：" + id);
    }
    private String kind(JsonNode node) { return node.path("data").path("kind").asText(); }
    private boolean contains(JsonNode entries, String value) { for (JsonNode entry : entries) if (value.equals(entry.asText())) return true; return false; }
    private void requireEmpty(List<String> issues) { if (!issues.isEmpty()) throw invalid(String.join("；", issues)); }
    private ObjectNode history(ObjectNode state, JsonNode op, String action, String operator, String detail) {
        return ((ArrayNode) state.get("history")).addObject().put("operationId", op.path("id").asText()).put("operationName", op.path("name").asText())
                .put("action", action).put("operator", operator).put("at", LocalDateTime.now().toString()).put("detail", detail);
    }
    private JsonNode defaultFormNode() {
        ObjectNode node = mapper.createObjectNode().put("id", "entry");
        node.putObject("data").put("kind", "START").put("label", "现场填报"); return node;
    }
    private JsonNode defaultButtons(String kind) {
        ArrayNode buttons = mapper.createArrayNode();
        if ("APPROVAL".equals(kind)) {
            buttons.addObject().put("action", "APPROVE").put("label", "审批"); buttons.addObject().put("action", "RETURN").put("label", "退回");
        } else {
            buttons.addObject().put("action", "SAVE").put("label", "保存"); buttons.addObject().put("action", "SUBMIT").put("label", "提交");
        }
        return buttons;
    }
}
