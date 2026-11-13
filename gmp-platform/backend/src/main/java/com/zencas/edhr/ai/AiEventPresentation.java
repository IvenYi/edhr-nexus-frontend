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
            case "STOPPED" -> "本轮已停止，已保存的表单保留";
            case "FAILED" -> "本轮执行失败，已保存的表单保留";
            case "REQUEST_RESERVED" -> "已预留一次模型调用预算";
            case "REQUEST_SETTLED" -> "已记录模型调用消耗";
            case "FORM_CREATED" -> "已创建表单并保存设计，修订 " + detail.path("revision").asText();
            case "FORM_DESIGN_SAVED" -> "已保存表单设计，修订 " + detail.path("revision").asText();
            default -> "任务状态已更新";
        };
        return Map.of("summary", summary, "level", "FAILED".equals(action) ? "error" : "STOPPED".equals(action) ? "warning" : "info");
    }
}
