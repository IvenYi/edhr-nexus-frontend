package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.TenantTransferTargets;
import com.zencas.edhr.workflow.service.WorkflowResponsibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

/** Central projection and managerial responsibility action over the existing form runtime. */
@Service
@RequiredArgsConstructor
public class FormWorkflowOperations {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final UserAccountRepository users;
    private final ExecutionAccess access;
    private final DhrInstanceService dhrs;
    private final AuditEventRepository audits;
    private final SnowflakeIdGenerator ids;

    private static final String FROM = """
        FROM form_instance_record r JOIN production_execution e ON e.object_id=r.object_id
        JOIN production_object o ON o.id=r.object_id AND o.tenant_id=r.tenant_id
        JOIN work_order w ON w.id=o.work_order_id AND w.tenant_id=o.tenant_id
        CROSS JOIN LATERAL (SELECT CAST(e.state_json AS jsonb) #> ARRAY['operations',r.operation_id,'forms',r.copy_id] AS progress) s
        JOIN LATERAL jsonb_array_elements(CAST(e.snapshot_json AS jsonb)->'operations') op ON op->>'id'=r.operation_id
        JOIN LATERAL jsonb_array_elements(op->'forms') f ON f->>'id'=r.form_id
        WHERE r.tenant_id='default' AND jsonb_typeof(s.progress)='object'
          AND jsonb_array_length(COALESCE(f->'flow'->'nodes','[]'::jsonb))>0
        """;

    public record Source(String sql, List<Object> args) { }

    /** SQL-level scope and state filters precede the shared count/pagination. */
    public Source source(boolean runningOnly) {
        String where = visibility();
        if (runningOnly) where += " AND s.progress->>'status'='ACTIVE' AND o.status IN ('IN_PROGRESS','COMPLETED') AND w.status IN ('CREATED','IN_PROCESS','COMPLETED')"
                + " AND ((f->>'sourceType'='CUSTOM' AND (CAST(e.state_json AS jsonb)#>>ARRAY['operations',r.operation_id,'status']) IN ('IN_PROGRESS','COMPLETED')) OR (COALESCE(f->>'sourceType','')<>'CUSTOM' AND o.status='IN_PROGRESS' AND w.status IN ('CREATED','IN_PROCESS') AND (CAST(e.state_json AS jsonb)#>>ARRAY['operations',r.operation_id,'status'])='IN_PROGRESS'))"
                + " AND NOT EXISTS (SELECT 1 FROM dhr_instance d WHERE d.tenant_id=r.tenant_id AND d.production_object_id=o.id AND (d.status NOT IN ('IN_PROGRESS','COMPLETED') OR d.summary_status NOT IN ('NOT_STARTED','DRAFT')))"
                + " AND EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(f->'flow'->'nodes','[]'::jsonb)) n WHERE n->'data'->>'kind'='APPROVAL' AND (s.progress->'active') ?? (n->>'id'))";
        return new Source("""
            SELECT 'form-'||CAST(r.id AS VARCHAR) AS "id",r.template_name AS "templateName",r.instance_no AS "businessKey",
                'FORM_PROCESS' AS "businessType",CASE WHEN s.progress->>'status'='ACTIVE' THEN 'RUNNING' ELSE 'COMPLETED' END AS status,
                r.created_by AS "startUserName",CAST(r.created_at AS VARCHAR) AS "startTime",CAST(NULL AS VARCHAR) AS "endTime"
            """ + FROM + where, visibilityArgs());
    }

    private String visibility() {
        if (has("workflow.intervene") || has("production.execution") && has("form-instances.view")) return "";
        if (!has("production.execution") || !(has("form-management.review") || has("form-management.filling"))) return " AND false";
        return """
            AND (r.created_by_id=? OR EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(CAST(e.state_json AS jsonb)->'history','[]'::jsonb)) h
                WHERE h->>'operationId'=r.operation_id AND h->>'formId'=r.form_id AND h->>'copyId'=r.copy_id AND (h->>'operator'=? OR h->>'targetUserId'=?))
              OR EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(f->'flow'->'nodes','[]'::jsonb)) n
                WHERE n->'data'->>'kind'='APPROVAL' AND s.progress->>'status'='ACTIVE' AND (s.progress->'active') ?? (n->>'id')
                  AND %s AND (s.progress->'transferAssignees'->>(n->>'id')=? OR (COALESCE(s.progress->'transferAssignees'->>(n->>'id'),'')=''
                    AND (s.progress->'approvers'->(n->>'id') ?? ? OR COALESCE(s.progress->'restrictedApprovers'->>(n->>'id'),'false')='false')))))
            """.formatted(has("form-management.review") ? "true" : "false");
    }

    private List<Object> visibilityArgs() {
        return visibility().contains("?") ? new ArrayList<>(Collections.nCopies(5, actor())) : new ArrayList<>();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> detail(long id) {
        var args = visibilityArgs(); args.add(id);
        var rows = jdbc.queryForList("SELECT r.*,e.state_json,e.snapshot_json AS execution_snapshot,e.revision" + " " + FROM + visibility() + " AND r.id=?", args.toArray());
        if (rows.isEmpty()) throw new AccessDeniedException("表单流程不存在或无权查看");
        Context c = context(rows.getFirst());
        var result = new LinkedHashMap<String, Object>();
        result.put("id", "form-" + id); result.put("templateName", c.row().get("template_name")); result.put("businessKey", c.row().get("instance_no"));
        result.put("businessType", "FORM_PROCESS"); result.put("status", active(c) ? "RUNNING" : "COMPLETED");
        result.put("startUserName", c.row().get("created_by")); result.put("startTime", Objects.toString(c.row().get("created_at"), null));
        result.put("endTime", null); result.put("versionId", c.row().get("version_id").toString());
        List<Map<String,Object>> nodes = new ArrayList<>(), edges = new ArrayList<>(), tasks = new ArrayList<>(), logs = new ArrayList<>();
        for (JsonNode n : c.form().path("flow").path("nodes")) {
            String nodeId = n.path("id").asText(); boolean current = contains(c.progress().path("active"), nodeId) && active(c);
            nodes.add(Map.of("id", nodeId, "name", n.path("data").path("label").asText("表单节点"), "type", n.path("data").path("kind").asText(),
                    "positionX", n.path("position").path("x").asDouble(), "positionY", n.path("position").path("y").asDouble(), "status", current ? "CURRENT" : ""));
            if (current && "APPROVAL".equals(n.path("data").path("kind").asText())) {
                String assignee = c.progress().path("transferAssignees").path(nodeId).asText("");
                var task = new LinkedHashMap<String,Object>(); task.put("id", taskKey(id, nodeId)); task.put("nodeId", nodeId); task.put("status", "PENDING");
                task.put("assigneeId", assignee.isBlank() ? null : assignee); task.put("assigneeName", name(assignee)); task.put("taskState", state(c, nodeId)); tasks.add(task);
            }
        }
        for (JsonNode e : c.form().path("flow").path("edges")) {
            var edge = new LinkedHashMap<String,Object>(); edge.put("id",e.path("id").asText()); edge.put("source",e.path("source").asText()); edge.put("target",e.path("target").asText()); edge.put("label",null); edges.add(edge);
        }
        int index = 0;
        for (JsonNode h : c.state().path("history")) if (matches(c,h)) {
            var log = new LinkedHashMap<String,Object>(); log.put("id","form-"+id+"-"+index++); log.put("nodeName",h.path("nodeName").asText(null));
            String action = h.path("actionCode").asText(h.path("action").asText());
            log.put("action",Set.of("TRANSFER","REASSIGN").contains(action) ? "TASK_"+action : action); log.put("operatorName",h.path("operatorName").asText(h.path("operator").asText("系统")));
            log.put("comment",h.path("reason").asText(h.path("detail").asText(null))); log.put("createdAt",h.path("at").asText(null)); log.put("snapshot",h.toString()); logs.add(log);
            if (Set.of("APPROVE","RETURN").contains(action)) {
                var task = new LinkedHashMap<String,Object>(); task.put("id",log.get("id")); task.put("nodeId",h.path("nodeId").asText()); task.put("status",action.equals("RETURN") ? "REJECTED":"COMPLETED");
                task.put("assigneeName",log.get("operatorName")); task.put("opinion",h.path("opinion").asText(null)); task.put("signatureId",h.path("signatureId").asText(null)); tasks.add(task);
            }
        }
        result.put("nodes",nodes); result.put("edges",edges); result.put("tasks",tasks); result.put("logs",logs); return result;
    }

    @PreAuthorize("hasAuthority('workflow.intervene')")
    @Transactional(readOnly = true)
    public List<Map<String,String>> targets(String key, String keyword) {
        TaskKey task = parseTask(key); Context c = load(task.recordId()); requireActive(c, task.nodeId());
        String previous = c.progress().path("transferAssignees").path(task.nodeId()).asText("");
        return new TenantTransferTargets(users).search(tenant(), previous, keyword).stream().filter(u -> qualified(u.get("id"))).toList();
    }

    @PreAuthorize("hasAuthority('workflow.intervene')")
    @Transactional
    public void reassign(String key, WorkflowResponsibilityService.Command command) {
        if (command == null || command.reason() == null || command.reason().isBlank() || command.reason().strip().length()>500) throw invalid("请填写不超过500字的原因");
        TaskKey task = parseTask(key); Context reference = load(task.recordId());
        jdbc.queryForMap("SELECT id FROM work_order WHERE tenant_id='default' AND id=? FOR UPDATE", reference.row().get("source_work_order_id"));
        jdbc.queryForMap("SELECT id FROM production_object WHERE tenant_id='default' AND id=? FOR UPDATE", reference.row().get("object_id"));
        Context c = load(task.recordId()); requireActive(c, task.nodeId());
        if (!state(c,task.nodeId()).equals(command.expectedTaskState())) throw invalid("任务处理人或状态已变化，请刷新后重新操作");
        var signer = access.authenticateButtonSigner(command.account(), command.password());
        if (!permission(signer.id(),"workflow.intervene") || !Objects.equals(users.findById(Long.valueOf(signer.id())).orElseThrow().getTenantId(),tenant())) throw new AccessDeniedException("签署人没有当前租户流程干预权限");
        String previous = c.progress().path("transferAssignees").path(task.nodeId()).asText("");
        com.zencas.edhr.identity.entity.UserAccount target;
        try { target = new TenantTransferTargets(users).require(tenant(), previous, command.targetUserId()); }
        catch (IllegalArgumentException e) { throw invalid(e.getMessage()); }
        if (!qualified(target.getId().toString())) throw invalid("目标没有普通表单审批权限");
        ObjectNode before = mapper.createObjectNode().put("formInstanceId",task.recordId()+"").put("formInstanceNo",Objects.toString(c.row().get("instance_no"),""))
                .put("operationId",Objects.toString(c.row().get("operation_id"))).put("formId",Objects.toString(c.row().get("form_id"))).put("copyId",Objects.toString(c.row().get("copy_id")))
                .put("nodeId",task.nodeId()).put("assigneeId",previous).put("assigneeName",name(previous));
        ObjectNode evidence = before.deepCopy().put("targetUserId",target.getId().toString()).put("targetUserName",target.getDisplayName()).put("reason",command.reason().strip())
                .put("taskState",command.expectedTaskState()).put("sessionOperatorId",actor()).put("signerId",signer.id()).put("signerName",signer.name());
        String signature = access.signTarget("WORKFLOW_INTERVENTION",key,key,"REASSIGN",evidence,signer);
        c.progress().withObject("/transferAssignees").put(task.nodeId(),target.getId().toString());
        ObjectNode after = evidence.deepCopy().put("previousAssigneeId",previous).put("previousAssigneeName",name(previous)).put("assigneeId",target.getId().toString()).put("assigneeName",target.getDisplayName()).put("signatureId",signature);
        c.state().withArray("/history").add(after.deepCopy().put("actionCode","REASSIGN").put("action","重新分配表单审批").put("operator",signer.id()).put("operatorName",signer.name()).put("at",LocalDateTime.now().toString())
                .put("nodeKind","APPROVAL").put("nodeName",node(c,task.nodeId()).path("data").path("label").asText("表单审批")));
        int changed = jdbc.update("UPDATE production_execution SET state_json=?,revision=revision+1,updated_at=? WHERE object_id=? AND revision=?",c.state().toString(),LocalDateTime.now(),c.row().get("object_id"),c.row().get("revision"));
        if (changed!=1) throw invalid("执行记录已变化，请刷新后重新操作");
        audits.save(AuditEvent.builder().id(ids.nextId()).tenantId("default").entityType("PRODUCTION_EXECUTION").entityId(c.row().get("object_id").toString()).action("REASSIGN")
                .contentBefore(before.toString()).contentAfter(after.toString()).operatorId(signer.id()).operatorName(signer.name()).operatorAccount(signer.account())
                .source("WORKFLOW").moduleName("生产").menuName("流程干预").functionName("重新分配表单审批").reason(command.reason().strip())
                .dataSummary(c.row().get("object_no")+" · "+c.row().get("operation_id")).createdAt(LocalDateTime.now()).build());
    }

    private Context load(long id) {
        var rows = jdbc.queryForList("SELECT r.*,e.state_json,e.snapshot_json AS execution_snapshot,e.revision,o.object_no,o.work_order_id AS source_work_order_id,o.status AS object_status,w.status AS order_status "+FROM+" AND r.id=?",id);
        if (rows.isEmpty()) throw invalid("表单流程不存在"); return context(rows.getFirst());
    }
    private Context context(Map<String,Object> row) {
        ObjectNode state = json(row.get("state_json")); JsonNode snapshot = json(row.get("execution_snapshot"));
        JsonNode operation = find(snapshot.path("operations"),Objects.toString(row.get("operation_id")));
        JsonNode form = find(operation.path("forms"),Objects.toString(row.get("form_id")));
        JsonNode progress = state.path("operations").path(Objects.toString(row.get("operation_id"))).path("forms").path(Objects.toString(row.get("copy_id")));
        if (!progress.isObject()) throw invalid("表单尚无运行记录"); return new Context(row,state,form,(ObjectNode)progress);
    }
    private void requireActive(Context c,String nodeId) {
        if (!active(c) || !contains(c.progress().path("active"),nodeId) || !"APPROVAL".equals(node(c,nodeId).path("data").path("kind").asText())) throw invalid("该表单审批任务已结束或尚未到达");
        if (!Set.of("IN_PROGRESS","COMPLETED").contains(Objects.toString(c.row().get("object_status"))) || !Set.of("CREATED","IN_PROCESS","COMPLETED").contains(Objects.toString(c.row().get("order_status")))) throw invalid("当前生产对象不可重新分配表单审批");
        if (!dhrs.customFormsMutable(Long.valueOf(c.row().get("object_id").toString()),false)) throw invalid("批记录审核中或已定稿，不能重新分配表单审批");
        JsonNode operation = c.state().path("operations").path(Objects.toString(c.row().get("operation_id")));
        if (!CustomFormPolicy.editable(c.form(),operation) || !CustomFormPolicy.custom(c.form())
                && (!"IN_PROGRESS".equals(c.row().get("object_status")) || !Set.of("CREATED","IN_PROCESS").contains(c.row().get("order_status"))))
            throw invalid("当前工序或表单不可重新分配审批");
    }
    private boolean qualified(String id) { return permission(id,"production.execution") && permission(id,"form-management.review"); }
    private boolean permission(String id,String code) { Integer n=jdbc.queryForObject("SELECT count(*) FROM user_role ur JOIN role_permission rp ON rp.role_id=ur.role_id JOIN permission p ON p.id=rp.permission_id WHERE ur.user_id=? AND p.code=?",Integer.class,Long.valueOf(id),code);return n!=null&&n>0; }
    private Long tenant() { return users.findById(Long.valueOf(actor())).orElseThrow(() -> invalid("当前用户不存在")).getTenantId(); }
    private String name(String id) { return id==null||id.isBlank()?"候选人待处理":users.findById(Long.valueOf(id)).map(u->u.getDisplayName()).orElse(id); }
    private static boolean has(String code) { var a=SecurityContextHolder.getContext().getAuthentication();return a!=null&&a.getAuthorities().stream().anyMatch(v->code.equals(v.getAuthority())); }
    private static String actor() { if (AuditContext.getOperatorId()==null) throw new AccessDeniedException("未登录");return AuditContext.getOperatorId(); }
    private boolean active(Context c) { return "ACTIVE".equals(c.progress().path("status").asText()); }
    private boolean matches(Context c,JsonNode h) { return Objects.toString(c.row().get("operation_id")).equals(h.path("operationId").asText())&&Objects.toString(c.row().get("form_id")).equals(h.path("formId").asText())&&Objects.toString(c.row().get("copy_id")).equals(h.path("copyId").asText()); }
    private JsonNode node(Context c,String id) { return find(c.form().path("flow").path("nodes"),id); }
    private JsonNode find(JsonNode rows,String id) { for(JsonNode n:rows)if(id.equals(n.path("id").asText()))return n;throw invalid("运行节点不存在"); }
    private boolean contains(JsonNode rows,String id) { for(JsonNode n:rows)if(id.equals(n.asText()))return true;return false; }
    private ObjectNode json(Object value) { try{return (ObjectNode)mapper.readTree(Objects.toString(value,"{}"));}catch(Exception e){throw invalid("表单流程快照无法读取");} }
    private String state(Context c,String nodeId) { try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest((c.row().get("id")+"|"+nodeId+"|"+c.row().get("revision")+"|"+c.progress()).getBytes(StandardCharsets.UTF_8))); }catch(Exception e){throw new IllegalStateException(e);} }
    private static String taskKey(long id,String nodeId) { return "form-"+id+":"+nodeId; }
    private record Context(Map<String,Object> row,ObjectNode state,JsonNode form,ObjectNode progress) { }
    private record TaskKey(long recordId,String nodeId) { }
    private TaskKey parseTask(String key) { try {int separator=key.indexOf(':');if(!key.startsWith("form-")||separator<=5||separator==key.length()-1)throw invalid("表单任务身份无效");return new TaskKey(Long.parseLong(key.substring(5,separator)),key.substring(separator+1));}catch(RuntimeException e){throw invalid("表单任务身份无效");} }
}
