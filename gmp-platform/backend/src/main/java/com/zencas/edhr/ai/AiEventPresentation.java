package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;

/** Deterministic display text from committed events, never model reasoning. */
final class AiEventPresentation {
    private AiEventPresentation() { }
    static Map<String, String> describe(String action, JsonNode detail) {
        String summary = switch (action) {
            case "QUEUED" -> "任务已排队";
            case "CLAIMED" -> "执行器已领取任务";
            case "STOPPED" -> "WORKER_YIELDED".equals(detail.path("reason").asText()) ? "本轮执行已结束，已保存成果保留；配置完成情况待检查" : "本轮已停止，已保存的表单保留";
            case "FAILED" -> "本轮执行失败，已保存的表单保留";
            case "REQUEST_RESERVED" -> "已预留一次模型调用预算";
            case "REQUEST_SETTLED" -> "已记录模型调用消耗";
            case "FORM_CREATED" -> "已创建表单并保存设计，修订 " + detail.path("revision").asText();
            case "FORM_DESIGN_SAVED" -> "已保存表单设计，修订 " + detail.path("revision").asText();
            case "TOOL_STARTED" -> "开始" + tool(detail);
            case "TOOL_COMMITTED" -> "已完成" + tool(detail);
            case "TOOL_FAILED" -> tool(detail) + "未完成，需检查后重试";
            case "TOOL_RESULT_UNKNOWN" -> tool(detail) + "结果待确认，将核对操作回执";
            case "TOOL_INTERRUPTED" -> tool(detail) + "已中断，请核对已保存成果";
            case "FORM_OPERATION_CONFIRMED" -> "已核对操作回执，原保存成功；继续前将读取当前表单";
            default -> "任务状态已更新";
        };
        String level = switch (action) {
            case "FAILED", "TOOL_FAILED" -> "error";
            case "STOPPED", "TOOL_RESULT_UNKNOWN", "TOOL_INTERRUPTED" -> "warning";
            default -> "info";
        };
        return Map.of("summary", summary, "level", level);
    }
    private static String tool(JsonNode detail) {
        return switch (detail.path("tool").asText()) {
            case "read_current_form" -> "读取当前表单";
            case "create_form" -> "创建表单";
            case "save_form_design" -> "保存表单设计";
            case "patch_form" -> "局部修改表单设计";
            case "get_applicable_knowledge" -> "查询适用本体知识";
            case "query_business_relations" -> "查询业务关系与配置目录";
            case "check_form" -> "检查表单配置";
            case "preview_form" -> "生成原生预览反馈";
            default -> "受控操作";
        };
    }
}
