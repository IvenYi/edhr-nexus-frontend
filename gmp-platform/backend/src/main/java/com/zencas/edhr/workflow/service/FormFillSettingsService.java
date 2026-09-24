package com.zencas.edhr.workflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FormFillSettingsService {
    private final ObjectMapper mapper;
    private final WorkflowDefinitionVersionRepository versions;
    private final WorkflowDefinitionRepository definitions;
    private final FormTemplateVersionRepository forms;

    public static boolean usesProcess(JsonNode settings) {
        String mode = settings.path("fillMode").asText("");
        if (!mode.isBlank() && !Set.of("DIRECT", "PROCESS").contains(mode)) throw invalid("填报方式不受支持");
        return "PROCESS".equals(mode);
    }

    public JsonNode parse(String value) {
        if (value == null || value.isBlank()) return mapper.createObjectNode();
        try { return mapper.readTree(value); }
        catch (Exception error) { throw invalid("填报设置格式不正确"); }
    }

    public WorkflowDefinitionVersion process(String id) {
        if (id == null || !id.matches("[0-9]+")) throw invalid("请选择已发布的表单流程");
        WorkflowDefinitionVersion version;
        try { version = versions.findById(Long.valueOf(id)).orElseThrow(() -> invalid("表单流程版本不存在")); }
        catch (NumberFormatException error) { throw invalid("表单流程版本不存在"); }
        var definition = definitions.findById(version.getDefinitionId()).orElseThrow(() -> invalid("表单流程不存在"));
        if (!"FORM_PROCESS".equals(definition.getType()) || !"PUBLISHED".equals(version.getStatus()))
            throw invalid("只能绑定已发布的表单流程版本");
        return version;
    }

    public ObjectNode directNode(JsonNode settings) {
        ObjectNode node = mapper.createObjectNode().put("id", "entry");
        ObjectNode data = node.putObject("data").put("kind", "START").put("label", "填报");
        data.set("config", settings.path("directFillConfig").isObject()
                ? settings.path("directFillConfig").deepCopy() : mapper.createObjectNode());
        return node;
    }

    public JsonNode activeBinding(JsonNode settings) {
        return usesProcess(settings) ? settings : settings.path("directFillConfig").isObject()
                ? settings.path("directFillConfig") : mapper.createObjectNode();
    }

    public String serialize(JsonNode settings, Long formVersionId) {
        ObjectNode normalized;
        if (settings == null || settings.isNull()) normalized = mapper.createObjectNode();
        else if (settings.isObject()) normalized = settings.deepCopy();
        else throw invalid("填报设置格式不正确");
        if (!normalized.hasNonNull("fillMode")) normalized.put("fillMode", "DIRECT");
        validate(normalized, formVersionId);
        return normalized.toString();
    }

    public void validate(JsonNode settings, Long formVersionId) {
        if (settings == null || settings.isNull() || settings.isMissingNode()) return;
        if (!settings.isObject()) throw invalid("填报设置格式不正确");
        boolean process = usesProcess(settings);
        JsonNode nodes;
        if (process) nodes = parse(process(settings.path("formProcessVersionId").asText()).getNodesJson());
        else {
            if (settings.hasNonNull("directFillConfig") && !settings.path("directFillConfig").isObject()) throw invalid("直接填报配置格式不正确");
            nodes = mapper.createArrayNode().add(directNode(settings));
        }
        if (!nodes.isArray()) throw invalid("表单流程节点格式不正确");
        JsonNode binding = activeBinding(settings);
        Set<String> subjectKeys = new HashSet<>(), eventKeys = new HashSet<>();
        for (JsonNode node : nodes) {
            String kind = node.path("data").path("kind").asText();
            if (!Set.of("START", "APPROVAL").contains(kind)) continue;
            JsonNode config = node.path("data").path("config");
            if (!process) {
                FormNodeConfiguration.validatePermissionConfiguration(config, true);
                FormNodeConfiguration.validateButtonConfiguration(config, true);
                if (config.hasNonNull("guardMode") && !"BLOCK_ON_INVALID".equals(config.path("guardMode").asText()))
                    throw invalid("直接填报提交前必须通过表单校验");
                validateDirectGroups(config);
            }
            JsonNode groups = config.path("permissionGroupRules");
            if ("START".equals(kind)) {
                if (!groups.isArray() || groups.isEmpty()) subjectKeys.add("start:open");
                for (int i = 0; i < groups.size(); i++) subjectKeys.add("start:" + groups.get(i).path("id").asText("legacy-" + i));
            } else subjectKeys.add("approval:" + node.path("id").asText());
            Set<String> actions = new HashSet<>(), buttonIds = new HashSet<>(), eventIds = new HashSet<>();
            for (JsonNode button : config.path("buttons")) {
                if (!process && (!actions.add(button.path("action").asText()) || !buttonIds.add(button.path("id").asText())))
                    throw invalid("同一填报动作只能配置一个按钮");
            }
            for (JsonNode event : config.path("buttonEvents")) {
                if (!event.path("enabled").asBoolean(true)) continue;
                if (!process && (!eventIds.add(event.path("id").asText())
                        || (!actions.isEmpty() && !actions.contains(event.path("action").asText())))) throw invalid("签署事件引用的按钮不存在或事件标识重复");
                if ("FILL_SIGN_FIELD".equals(event.path("builtin").asText()) || !event.has("builtin"))
                    eventKeys.add(node.path("id").asText() + ":" + event.path("id").asText());
            }
        }
        var form = forms.findById(formVersionId).orElseThrow(() -> invalid("表单模板版本不存在"));
        JsonNode model = parse(form.getModelDesignJson());
        JsonNode fields = model.has("payload") ? model.path("payload").path("fields") : model.path("fields");
        Set<String> fieldIds = new HashSet<>(), signatureIds = new HashSet<>();
        for (JsonNode field : fields) {
            fieldIds.add(field.path("id").asText());
            if ("signature".equals(field.path("type").asText()) && !field.path("readOnly").asBoolean()
                    && !"disabled".equals(field.path("status").asText())) signatureIds.add(field.path("id").asText());
        }
        JsonNode permissions = binding.path("fieldPermissions");
        if (!permissions.isMissingNode() && !permissions.isObject()) throw invalid("字段权限配置格式不正确");
        permissions.fields().forEachRemaining(entry -> {
            if (!subjectKeys.contains(entry.getKey()) || !entry.getValue().isObject()) throw invalid("字段权限引用的权限组不存在");
            JsonNode rule = entry.getValue();
            FormNodeConfiguration.validatePermissionValue(rule.path("defaultPermission"));
            Set<String> editable = fieldSet(rule.path("editableFieldIds"), fieldIds);
            editable.retainAll(fieldSet(rule.path("readOnlyFieldIds"), fieldIds));
            if (!editable.isEmpty()) throw invalid("同一字段不能同时配置为可编辑和只读");
        });
        JsonNode bindings = binding.path("eventBindings");
        if (!bindings.isMissingNode() && !bindings.isObject()) throw invalid("签名字段绑定格式不正确");
        bindings.fieldNames().forEachRemaining(key -> { if (!eventKeys.contains(key)) throw invalid("签名字段引用的按钮事件不存在"); });
        for (String key : eventKeys) if (!signatureIds.contains(bindings.path(key).path("fieldId").asText()))
            throw invalid("填充签名字段的按钮必须绑定当前表单中可用的签名字段");
    }

    private void validateDirectGroups(JsonNode config) {
        Set<String> ids = new HashSet<>();
        for (JsonNode group : config.path("permissionGroupRules")) {
            String id = group.path("id").asText();
            if (id.isBlank() || !ids.add(id)) throw invalid("填报权限组标识缺失或重复");
            JsonNode subjects = group.path("subjects");
            if (!subjects.isArray() || subjects.isEmpty()) throw invalid("填报权限组必须选择主体");
            for (JsonNode subject : subjects) {
                if (!Set.of("USER", "DEPARTMENT", "ROLE").contains(subject.path("type").asText())
                        || !subject.path("id").asText().matches("[0-9]+")) throw invalid("填报主体格式不正确");
                if ("DEPARTMENT".equals(subject.path("type").asText()) && subject.has("departmentScope")
                        && !Set.of("SELF_ONLY", "SELF_AND_CHILDREN").contains(subject.path("departmentScope").asText())) throw invalid("部门范围不正确");
            }
        }
    }

    private Set<String> fieldSet(JsonNode values, Set<String> available) {
        Set<String> result = new HashSet<>();
        if (values.isMissingNode()) return result;
        if (!values.isArray()) throw invalid("字段权限必须引用字段标识列表");
        for (JsonNode value : values) {
            if (!value.isTextual() || !available.contains(value.asText())) throw invalid("字段权限引用的字段不存在");
            result.add(value.asText());
        }
        return result;
    }

    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.WF_002, message); }
}
