package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.template.service.FormLookupCatalogService;
import com.zencas.edhr.template.service.FormReferenceConfig;
import com.zencas.edhr.template.service.FormReferenceLookup;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

/** All queries run behind the same current-task authorization as native writes. */
@Service
@RequiredArgsConstructor
@Transactional(noRollbackFor=AiExecutionTerminatedException.class)
public class AiWorkbenchService {
    private final AiTaskService tasks;
    private final AiFormService forms;
    private final AiProperties config;
    private final AiKnowledgePackage knowledge;
    private final FormLookupCatalogService catalog;
    private final FormReferenceLookup references;
    private final ObjectMapper mapper;

    private void authorize(UUID task,UUID run,long epoch) {
        tasks.authorizeExecution(task,run,epoch);
        if (!config.isInternalValidation()) throw new AiException(403,"INTERNAL_VALIDATION_DISABLED");
        if (!config.getKnowledgePackage().equals(knowledge.id())) throw new AiException(409,"KNOWLEDGE_PACKAGE_MISMATCH");
    }
    public Map<String,Object> query(UUID task,UUID run,long epoch,String callId,String tool,String query,String id,int offset) {
        authorize(task,run,epoch);
        Map<String,Object> result;
        if (tool.equals("get_applicable_knowledge")) result=knowledge.search(query,offset);
        else if (tool.equals("query_business_relations")) {
            if (id.equals("catalog.reference-dictionaries")) result=Map.of("scope","live-reference-directory","items",references.dictionaries(query,null),"limit",20,"refineQueryIfFull",true);
            else if (id.equals("catalog.material-types")) result=Map.of("scope","live-reference-directory","items",references.materialTypes());
            else result=new LinkedHashMap<>(id.isBlank() ? Map.of("scope","configuration-catalog","catalog",catalog.projectionCatalog()) : knowledge.relations(id,offset));
        } else throw new AiException(400,"INVALID_QUERY_TOOL");
        tasks.recordToolResult(task,run,callId,tool,Map.of("knowledgePackage",knowledge.id(),"packageHash",knowledge.hash(),
                "requestHash",hash(Map.of("query",query,"id",id,"offset",offset)),"resultHash",hash(result)));
        return result;
    }
    public Map<String,Object> inspect(UUID task,UUID run,long epoch,String callId,String tool,long expectedRevision) {
        authorize(task,run,epoch);
        JsonNode saved=mapper.valueToTree(forms.read(task,run,epoch));
        JsonNode version=saved.path("version");
        long revision=version.path("revision").asLong();
        if (revision!=expectedRevision) throw new AiException(409,"STALE_FORM_REVISION");
        if (!Set.of("check_form","preview_form").contains(tool)) throw new AiException(400,"INVALID_INSPECTION_TOOL");
        JsonNode model=design(version,"modelDesignJson"), canvas=design(version,"canvasDesignJson");
        if (tool.equals("preview_form")) {
            // Only the host renderer receives this snapshot. It must submit feedback separately.
            tasks.requireToolStart(run,callId,tool);
            return Map.of("snapshot",saved,"revision",revision);
        }
        List<Map<String,Object>> issues;
        try { issues=AiFormAnalysis.inspect(catalog.withLookupSnapshot(model),canvas,mapper); }
        catch (com.zencas.edhr.common.exception.BusinessException e) {
            issues=new ArrayList<>(List.of(Map.of("code","LOOKUP_CATALOG","severity","error","target","projection","message",e.getMessage())));
        }
        try {
            var combined=mapper.createObjectNode();combined.set("fields",model.path("fields"));combined.set("canvas",canvas);
            checkReferences(FormReferenceConfig.fields(combined,mapper),issues);
        } catch (com.zencas.edhr.common.exception.BusinessException e) {
            issues.add(Map.of("code","REFERENCE_CONFIG","severity","error","target","","message",e.getMessage()));
        }
        long errors=issues.stream().filter(i->i.get("severity").equals("error")).count();
        tasks.recordToolResult(task,run,callId,tool,Map.of("revision",revision,"errors",errors,"issueCount",issues.size()));
        return Map.of("revision",revision,"issues",issues,"passed",errors==0,"knowledgePackage",knowledge.id(),
                "limitations",List.of("配置结构与既有规则检查，不证明原表完整、业务含义或客户正式来源职责","引用空候选不等于错误；未验证实际选值、电子签名与正式提交"));
    }
    public Map<String,Object> previewFeedback(UUID task,UUID run,long epoch,String callId,long revision,String artifactHash,int pages,int issueCount) {
        authorize(task,run,epoch);
        JsonNode current=mapper.valueToTree(forms.read(task,run,epoch)).path("version");
        if (current.path("revision").asLong()!=revision) throw new AiException(409,"STALE_FORM_REVISION");
        Map<String,Object> evidence=Map.of("revision",revision,"artifactHash",artifactHash,"pages",pages,"issueCount",issueCount,"source","worker-native-renderer");
        tasks.recordToolResult(task,run,callId,"preview_form",evidence);
        return evidence;
    }
    private JsonNode design(JsonNode version,String key) {
        try { JsonNode value=mapper.readTree(version.path(key).asText("{}"));return value.has("payload")?value.path("payload"):value; }
        catch (Exception e) { throw new AiException(400,"INVALID_DESIGN_JSON"); }
    }
    private String hash(Object value) {
        try {
            byte[] encoded=mapper.writer().with(com.fasterxml.jackson.databind.SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS).writeValueAsBytes(value);
            return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(encoded));
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
    private void checkReferences(JsonNode fields,List<Map<String,Object>> issues) {
        for (JsonNode field:fields) {
            if ("disabled".equals(field.path("status").asText())) continue;
            if ("reference".equals(field.path("type").asText())) {
                JsonNode ref=field.path("typeConfig");
                try {
                    if ("dictionary".equals(ref.path("sourceType").asText())) {
                        String id=ref.path("referenceDictionaryId").asText();
                        if (id.isBlank() || references.dictionaries(null,id).stream().noneMatch(row->"ACTIVE".equals(row.get("status"))))
                            throw new AiException(400,"业务字典不存在、停用或未指定");
                    }
                    references.search(ref,"",mapper.createObjectNode(),1,1);
                } catch (com.zencas.edhr.common.exception.BusinessException | AiException e) {
                    issues.add(Map.of("code","REFERENCE_QUERY","severity","error","target",field.path("id").asText(),"message",e.getMessage()));
                }
            }
            if ("subTable".equals(field.path("type").asText())) checkReferences(field.path("typeConfig").path("columns"),issues);
        }
    }
}
