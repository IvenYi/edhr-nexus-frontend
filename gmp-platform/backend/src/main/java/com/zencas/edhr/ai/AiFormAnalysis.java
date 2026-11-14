package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.template.service.FormProjectionInterpreter;
import com.zencas.edhr.template.service.FormReferenceConfig;
import com.zencas.edhr.template.service.FormReferenceLookup;
import java.util.*;

/** Configuration diagnostics only; cannot establish customer policy or task completion. */
final class AiFormAnalysis {
    private AiFormAnalysis() {}
    static List<Map<String,Object>> inspect(JsonNode model, JsonNode canvas, ObjectMapper mapper) {
        List<Map<String,Object>> issues = new ArrayList<>();
        Map<String,JsonNode> fields = new LinkedHashMap<>();
        collectFields(model.path("fields"), "", fields, issues);
        Set<String> placed = new HashSet<>();
        collectBindings(canvas, fields, placed, issues);
        fields.forEach((id, field) -> {
            if (!"disabled".equals(field.path("status").asText()) && !placed.contains(id))
                issue(issues,"FIELD_NOT_PLACED","warning",id,"字段尚未放入画布");
        });
        try { FormReferenceConfig.validateDesignConditions(model.toString(),canvas.toString(),mapper); }
        catch (BusinessException e) { issue(issues,"REFERENCE_CONDITION","error","",e.getMessage()); }
        try { FormProjectionInterpreter.validateConfiguration(model); }
        catch (BusinessException e) { issue(issues,"BUSINESS_BINDING","error","",e.getMessage()); }
        for (JsonNode binding : model.path("projection").path("bindings")) {
            if (!"formTrace".equals(binding.path("modelId").asText()))
                issue(issues,"CUSTOMER_SOURCE_POLICY","warning",binding.path("id").asText(),"正式统计来源职责须有客户实施依据，结构检查不能确认此职责");
        }
        if (!canvas.path("pages").isArray() || canvas.path("pages").isEmpty()) issue(issues,"CANVAS_EMPTY","error","","尚无可预览的画布页面");
        return issues;
    }
    private static void collectFields(JsonNode nodes,String table,Map<String,JsonNode> fields,List<Map<String,Object>> issues) {
        if (!nodes.isArray()) { issue(issues,"FIELD_LIST","error",table,"字段列表格式不正确"); return; }
        for (JsonNode field:nodes) {
            String id=field.path("id").asText(), key=table+"/"+id;
            if (!field.isObject() || id.isBlank() || fields.putIfAbsent(key,field)!=null) { issue(issues,"FIELD_ID","error",key,"字段身份缺失或重复");continue; }
            String type=field.path("type").asText();
            if (!Set.of("text","number","datetime","singleSelect","multiSelect","reference","signature","attachment","image","subTable").contains(type))
                issue(issues,"FIELD_TYPE","error",key,"不支持的字段类型");
            if ("subTable".equals(type)) collectFields(field.path("typeConfig").path("columns"),id,fields,issues);
            if ("reference".equals(type)) {
                JsonNode config=field.path("typeConfig");
                try { FormReferenceLookup.sourceFields(config); }
                catch (BusinessException e) { issue(issues,"REFERENCE_SOURCE","error",key,e.getMessage()); }
                if ("dictionary".equals(config.path("sourceType").asText()) && config.path("referenceDictionaryId").asText().isBlank())
                    issue(issues,"DICTIONARY_SCOPE","error",key,"必须指定具体业务字典");
            }
        }
    }
    private static void collectBindings(JsonNode node,Map<String,JsonNode> fields,Set<String> placed,List<Map<String,Object>> issues) {
        if (node.isObject() && node.path("bindings").isObject()) {
            JsonNode binding=node.path("bindings");
            String id=binding.path("subTableFieldId").asText(binding.path("fieldId").asText());
            if (!id.isBlank()) {
                String key=binding.path("subTableId").asText()+"/"+id;
                if (!fields.containsKey(key)) issue(issues,"DANGLING_CANVAS_FIELD","error",node.path("id").asText(),"画布引用不存在的字段："+key);
                else placed.add(key);
            }
        }
        if (node.isContainerNode()) node.forEach(child->collectBindings(child,fields,placed,issues));
    }
    private static void issue(List<Map<String,Object>> issues,String code,String severity,String target,String message) {
        issues.add(Map.of("code",code,"severity",severity,"target",target,"message",message));
    }
}
