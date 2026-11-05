package com.zencas.edhr.workflow.service;

import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.workflow.repository.WorkflowTaskRepository;
import com.zencas.edhr.workflow.entity.WorkflowTask;
import com.zencas.edhr.production.service.FormWorkflowOperations;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.SqlArrayValue;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.zencas.edhr.common.audit.AuditContext;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.*;

/** Shared read projection; domain approval and responsibility actions retain their own transactions. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkflowOperationsQuery {
    private final JdbcTemplate jdbc;
    private final WorkflowTaskRepository tasks;
    private final FormWorkflowOperations forms;

    private static final String FROM = """
        FROM workflow_instance i LEFT JOIN workflow_definition d ON d.id=i.definition_id
        LEFT JOIN record_control_request q ON q.workflow_instance_id=CAST(i.id AS VARCHAR) AND q.tenant_id='default'
        LEFT JOIN dhr_summary_review r ON r.workflow_instance_id=i.id AND i.business_type='DHR_SUMMARY'
        LEFT JOIN dhr_summary_version v ON v.id=r.summary_version_id AND v.tenant_id='default'
        LEFT JOIN dhr_instance h ON h.id=v.dhr_instance_id AND h.tenant_id=v.tenant_id
        LEFT JOIN user_account u ON CAST(u.id AS VARCHAR)=i.initiator_id
        """;
    private static final String BUSINESS_KEY = "COALESCE(q.request_no,h.dhr_no||' · V'||v.version_no,i.business_id)";

    public PageResult<Map<String, Object>> list(int page, int size, String keyword, String status, boolean runningOnly) {
        if (page < 1 || size < 1 || size > 100) throw invalid("分页参数不正确");
        String query = keyword == null ? "" : keyword.strip();
        if (query.length() > 128) throw invalid("查询条件不能超过128字");
        if (status != null && !status.isBlank() && !Set.of("RUNNING", "COMPLETED", "TERMINATED", "WITHDRAWN").contains(status)) throw invalid("流程状态不正确");
        List<Object> args = new ArrayList<>();
        String where = " WHERE (i.business_type IS DISTINCT FROM 'DHR_SUMMARY' OR h.id IS NOT NULL)" + visibility(args);
        if (runningOnly) where += " AND i.status='RUNNING'";
        var formSource = forms.source(runningOnly);
        String source = "SELECT CAST(i.id AS VARCHAR) AS \"id\",d.name AS \"templateName\"," + BUSINESS_KEY + " AS \"businessKey\","
                + "i.business_type AS \"businessType\",i.status,COALESCE(u.display_name,i.initiator_id) AS \"startUserName\","
                + "CAST(i.started_at AS VARCHAR) AS \"startTime\",CAST(i.completed_at AS VARCHAR) AS \"endTime\" " + FROM + where
                + " UNION ALL " + formSource.sql();
        args.addAll(formSource.args());
        String filter = " WHERE 1=1";
        if (!runningOnly && status != null && !status.isBlank()) { filter += " AND status=?"; args.add(status); }
        if (!query.isBlank()) {
            filter += " AND (id=? OR COALESCE(\"businessKey\",'') ILIKE ? ESCAPE '!' OR \"templateName\" ILIKE ? ESCAPE '!')";
            String pattern = "%" + query.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
            args.add(query); args.add(pattern); args.add(pattern);
        }
        String from = " FROM (" + source + ") sources" + filter;
        Long total = jdbc.queryForObject("SELECT count(*)" + from, Long.class, args.toArray());
        args.add(size); args.add((long) (page - 1) * size);
        var content = jdbc.queryForList("SELECT *" + from + " ORDER BY \"startTime\" DESC,id DESC LIMIT ? OFFSET ?", args.toArray());
        return PageResult.of(content, page, size, total == null ? 0 : total);
    }

    public Map<String, Object> detail(Long id) {
        List<Object> args = new ArrayList<>(); args.add(id);
        String scope = visibility(args);
        var rows = jdbc.queryForList("""
                SELECT CAST(i.id AS VARCHAR) AS "id",d.name AS "templateName",%s AS "businessKey",
                       CAST(i.version_id AS VARCHAR) AS "versionId",i.business_type AS "businessType",i.status,
                       COALESCE(u.display_name,i.initiator_id) AS "startUserName",CAST(i.started_at AS VARCHAR) AS "startTime",CAST(i.completed_at AS VARCHAR) AS "endTime"
                """.formatted(BUSINESS_KEY) + FROM + " WHERE i.id=? AND (i.business_type IS DISTINCT FROM 'DHR_SUMMARY' OR h.id IS NOT NULL)" + scope, args.toArray());
        if (rows.isEmpty()) throw invalid("流程不存在或无权查看");
        Map<String, Object> result = new LinkedHashMap<>(rows.getFirst());
        result.put("nodes", jdbc.queryForList("""
                SELECT CAST(n.id AS VARCHAR) AS "id",n.name,n.node_type AS "type",n.position_x AS "positionX",n.position_y AS "positionY",
                       CASE WHEN CAST(n.id AS VARCHAR)=ANY(string_to_array(i.current_node_ids,',')) THEN 'CURRENT' ELSE '' END AS "status"
                FROM workflow_node n JOIN workflow_instance i ON i.version_id=n.version_id WHERE i.id=? ORDER BY n.sort_order,n.id
                """, id));
        result.put("edges", jdbc.queryForList("""
                SELECT CAST(e.id AS VARCHAR) AS "id",CAST(e.source_node_id AS VARCHAR) AS "source",CAST(e.target_node_id AS VARCHAR) AS "target",e.label
                FROM workflow_edge e JOIN workflow_instance i ON i.version_id=e.version_id WHERE i.id=?
                """, id));
        var instanceTasks = tasks.findByInstanceId(id);
        var assigneeNames = assigneeNames(instanceTasks);
        result.put("tasks", instanceTasks.stream().map(task -> {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("id", task.getId().toString()); view.put("nodeId", task.getNodeId().toString()); view.put("status", task.getStatus());
            view.put("assigneeId", task.getAssigneeId()); view.put("taskState", WorkflowResponsibilityService.taskState(task));
            view.put("signatureId", task.getSignatureId() == null ? null : task.getSignatureId().toString());
            view.put("opinion", task.getOpinion()); view.put("action", task.getAction());
            view.put("assigneeName", assigneeNames.getOrDefault(task.getAssigneeId(), "待候选人处理"));
            return view;
        }).toList());
        result.put("logs", jdbc.queryForList("""
                SELECT CAST(l.id AS VARCHAR) AS "id",CASE WHEN l.action='TASK_COMPLETE' THEN COALESCE(t.action,l.action) ELSE l.action END AS action,
                       COALESCE(u.display_name,l.operator_name,l.operator_id) AS "operatorName",
                       l.comment,CAST(l.created_at AS VARCHAR) AS "createdAt",n.name AS "nodeName",CAST(l.snapshot AS VARCHAR) AS snapshot
                FROM workflow_action_log l LEFT JOIN workflow_node n ON CAST(n.id AS VARCHAR)=l.node_id
                LEFT JOIN workflow_task t ON t.id=l.task_id
                LEFT JOIN user_account u ON CAST(u.id AS VARCHAR)=l.operator_id WHERE l.instance_id=? ORDER BY l.created_at,l.id
                """, id));
        return result;
    }

    private Map<String, String> assigneeNames(List<WorkflowTask> instanceTasks) {
        Object[] assigneeIds = instanceTasks.stream().map(WorkflowTask::getAssigneeId)
                .filter(Objects::nonNull).distinct().toArray();
        Map<String, String> names = new HashMap<>();
        if (assigneeIds.length == 0) return names;
        for (var row : jdbc.queryForList("SELECT CAST(id AS VARCHAR) AS id,display_name FROM user_account WHERE CAST(id AS VARCHAR)=ANY(?)",
                new SqlArrayValue("varchar", assigneeIds))) {
            names.put((String) row.get("id"), (String) row.get("display_name"));
        }
        return names;
    }

    private String visibility(List<Object> args) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "workflow.intervene".equals(a.getAuthority()))) return "";
        String actor = Objects.toString(AuditContext.getOperatorId(), "");
        String dhrScope = " AND (i.business_type IS DISTINCT FROM 'DHR_SUMMARY' OR (" + (has("records.dhr-review") ? "true" : "false")
                + " AND h.id IS NOT NULL AND (i.initiator_id=? OR EXISTS (SELECT 1 FROM workflow_task dt WHERE dt.instance_id=i.id AND "
                + "((dt.status IN ('PENDING','PROCESSING') AND (dt.candidate_snapshot->'userIds' @> CAST(? AS jsonb) OR dt.candidate_snapshot->>'unrestricted'='true' OR dt.assignee_id=?))"
                + " OR (dt.status IN ('COMPLETED','REJECTED') AND dt.assignee_id=?))))))";
        args.add(actor); args.add("[\"" + actor + "\"]"); args.add(actor); args.add(actor);
        args.add(actor); args.add(actor); args.add("[\"" + actor + "\"]"); args.add(actor);
        return dhrScope + """
                 AND (i.business_type IS NULL OR i.business_type NOT IN ('CHANGE','OBSOLETE') OR q.status<>'IN_REVIEW'
                  OR q.applicant_id=? OR EXISTS (SELECT 1 FROM workflow_task t WHERE t.instance_id=i.id
                  AND ((t.status IN ('PENDING','PROCESSING') AND (t.assignee_id=?
                    OR (t.candidate_snapshot -> 'userIds') @> CAST(? AS jsonb) OR t.candidate_snapshot ->> 'unrestricted'='true'))
                    OR (t.status IN ('COMPLETED','REJECTED','TRANSFERRED') AND t.assignee_id=?))))
                """;
    }
    private boolean has(String code) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream().anyMatch(a -> code.equals(a.getAuthority()));
    }
    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.WF_007, message); }
}
