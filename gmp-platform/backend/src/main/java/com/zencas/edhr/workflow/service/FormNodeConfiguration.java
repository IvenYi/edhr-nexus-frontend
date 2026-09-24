package com.zencas.edhr.workflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import java.util.Set;

public final class FormNodeConfiguration {
    private FormNodeConfiguration() {}
    public static void validatePermissionConfiguration(JsonNode config, boolean entryNode) {
        if (config == null || config.isMissingNode() || config.isNull()) return;
        if (!config.isObject()) throw new BusinessException(ErrorCode.WF_002, "权限配置格式不正确");
        validatePermissionValue(config.path("defaultPermission"));
        if (!entryNode) {
            // An empty approval subject list intentionally means unrestricted approval.
            // Only validate the shape when a caller actually supplies the optional list.
            JsonNode subjects = config.get("approverSubjects");
            if (subjects != null && !subjects.isNull() && !subjects.isArray()) {
                throw new BusinessException(ErrorCode.WF_002, "审批主体配置格式不正确");
            }
            return;
        }
        JsonNode rules = config.get("permissionGroupRules");
        if (rules == null || rules.isNull()) return;
        if (!rules.isArray()) throw new BusinessException(ErrorCode.WF_002, "填报权限组配置格式不正确");
        for (JsonNode rule : rules) {
            if (rule == null || !rule.isObject() || rule.path("group").asText("").trim().isBlank()) {
                throw new BusinessException(ErrorCode.WF_002, "填报权限组必须配置权限主体");
            }
            validatePermissionValue(rule.path("defaultPermission"));
        }
    }

    public static void validatePermissionValue(JsonNode value) {
        if (value == null || value.isMissingNode() || value.isNull() || value.asText("").isBlank()) return;
        String permission = value.asText("").trim();
        if (!"EDIT".equals(permission) && !"READ_ONLY".equals(permission)) {
            throw new BusinessException(ErrorCode.WF_002, "默认权限只能是全部可编辑或全部只读");
        }
    }

    public static void validateButtonConfiguration(JsonNode config, boolean startNode) {
        if (config == null || config.isMissingNode() || config.isNull()) return;
        JsonNode buttons = config.get("buttons");
        if (buttons != null && !buttons.isNull()) {
            if (!buttons.isArray()) throw new BusinessException(ErrorCode.WF_002, "流程按钮配置格式不正确");
            for (JsonNode button : buttons) {
                if (!button.isObject() || !button.path("id").isTextual() || button.path("id").asText().isBlank()
                        || !button.path("label").isTextual() || button.path("label").asText().isBlank()
                        || button.has("enabled")
                        || (button.has("visible") && !button.path("visible").isBoolean())) {
                    throw new BusinessException(ErrorCode.WF_002, "流程按钮字段格式不正确");
                }
                String action = button.path("action").asText("").trim();
                boolean allowed = startNode
                        ? ("SAVE".equals(action) || "SUBMIT".equals(action))
                        : ("APPROVE".equals(action) || "RETURN".equals(action) || "TRANSFER".equals(action));
                if (action.isBlank() || !allowed) {
                    throw new BusinessException(ErrorCode.WF_002, "流程按钮动作不受支持");
                }
                if (button.has("requireOpinion") && !button.path("requireOpinion").isBoolean()) {
                    throw new BusinessException(ErrorCode.WF_002, "审批意见必填配置格式不正确");
                }
                if ("TRANSFER".equals(action) && button.path("requireOpinion").asBoolean()) {
                    throw new BusinessException(ErrorCode.WF_002, "转办原因由系统固定要求，不能配置审批意见必填");
                }
                validateButtonEnum(button, "style", Set.of("PRIMARY", "DEFAULT", "DANGER"), "按钮样式");
                validateButtonEnum(button, "size", Set.of("SMALL", "MEDIUM", "LARGE"), "按钮尺寸");
            }
        }
        JsonNode events = config.get("buttonEvents");
        if (events != null && !events.isNull()) {
            if (!events.isArray()) throw new BusinessException(ErrorCode.WF_002, "按钮事件配置格式不正确");
            for (JsonNode event : events) {
                if (!event.isObject() || !event.path("id").isTextual() || event.path("id").asText().isBlank()
                        || !event.path("event").isTextual() || !event.path("action").isTextual()
                        || (event.has("enabled") && !event.path("enabled").isBoolean())
                        || (event.has("builtin") && !event.path("builtin").isTextual())
                        || (event.has("handlerId"))) {
                    throw new BusinessException(ErrorCode.WF_002, "按钮事件字段格式不正确");
                }
                String phase = event.path("event").asText("").trim();
                String action = event.path("action").asText("").trim();
                String builtin = event.path("builtin").asText("").trim();
                String signatureMethod = event.path("signatureMethod").asText("").trim();
                boolean allowedAction = startNode
                        ? ("SAVE".equals(action) || "SUBMIT".equals(action))
                        : ("APPROVE".equals(action) || "RETURN".equals(action));
                if (!allowedAction || (!builtin.isBlank() && !Set.of("NONE", "FILL_SIGN_FIELD").contains(builtin))) {
                    throw new BusinessException(ErrorCode.WF_002, "按钮事件仅支持执行前/执行后、当前节点动作及填充签名字段");
                }
                if ((!builtin.isBlank() || !signatureMethod.isBlank()) && !"BEFORE".equals(phase)) {
                    throw new BusinessException(ErrorCode.WF_002, "电子签名事件仅支持执行前处理");
                }
                if (event.has("signatureMethod")) {
                    if (!"BEFORE".equals(phase) || !("NONE".equals(builtin) || "FILL_SIGN_FIELD".equals(builtin))
                            || !"ACCOUNT_PASSWORD".equals(signatureMethod)
                            || !allowedAction) {
                        throw new BusinessException(ErrorCode.WF_002, "电子签名事件配置不受支持");
                    }
                }
            }
        }
        validateButtonEnum(config, "guardMode", Set.of("NONE", "BLOCK_ON_INVALID", "WARN_ON_INVALID"), "表单卡控");
    }

    public static void validateButtonEnum(JsonNode object, String field, Set<String> allowed, String label) {
        if (object == null || object.isMissingNode() || object.isNull() || !object.has(field)) return;
        JsonNode value = object.get(field);
        if (!value.isTextual() || !allowed.contains(value.asText().trim())) {
            throw new BusinessException(ErrorCode.WF_002, label + "配置不受支持");
        }
    }

}
