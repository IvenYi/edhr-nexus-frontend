package com.zencas.edhr.workflow.service;

import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.workflow.repository.WorkflowTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.zencas.edhr.common.audit.AuditContext;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.*;

/** Read projection shared by the log and intervention screens. DHR keeps its dedicated evidence surface. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkflowOperationsQuery {
    private final JdbcTemplate jdbc;
    private final WorkflowTaskRepository tasks;

    public PageResult<Map<String, Object>> list(int page, int size, String keyword, String status, boolean runningOnly) {
        if (page < 1 || size < 1 || size > 100) throw invalid("分页参数不正确");
        String query = keyword == null ? "" : keyword.strip();
        if (query.length() > 128) throw invalid("查询条件不能超过128字");
        if (status != null && !status.isBlank() && !Set.of("RUNNING", "COMPLETED", "TERMINATED", "WITHDRAWN").contains(status)) throw invalid("流程状态不正确");
        String where = " WHERE (i.business_type IS NULL OR i.business_type<>'DHR_SUMMARY')";
        List<Object> args = new ArrayList<>();
        where += visibility(args);
        if (runningOnly) where += " AND i.status='RUNNING'";
        else if (status != null && !status.isBlank()) { where += " AND i.status=?"; args.add(status); }
        if (!query.isBlank()) {
            where += " AND (CAST(i.id AS VARCHAR)=? OR COALESCE(q.request_no,i.business_id,'') ILIKE ? OR d.name ILIKE ?)";
            String pattern = "%" + query.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%";
            args.add(query); args.add(pattern); args.add(pattern);
            where = where.replace(" ILIKE ?", " ILIKE ? ESCAPE '!'");
        }
        String from = " FROM workflow_instance i LEFT JOIN workflow_definition d ON d.id=i.definition_id"
                + " LEFT JOIN record_control_request q ON q.workflow_instance_id=CAST(i.id AS VARCHAR) AND q.tenant_id='default'"
                + " LEFT JOIN user_account u ON CAST(u.id AS VARCHAR)=i.initiator_id";
        Long total = jdbc.queryForObject("SELECT count(*)" + from + where, Long.class, args.toArray());
        args.add(size); args.add((long) (page - 1) * size);
        var content = jdbc.queryForList("""
                SELECT CAST(i.id AS VARCHAR) AS "id",d.name AS "templateName",COALESCE(q.request_no,i.business_id) AS "businessKey",
                       i.business_type AS "businessType",i.status,COALESCE(u.display_name,i.initiator_id) AS "startUserName",
                       CAST(i.started_at AS VARCHAR) AS "startTime",CAST(i.completed_at AS VARCHAR) AS "endTime"
                """ + from + where + " ORDER BY i.started_at DESC,i.id DESC LIMIT ? OFFSET ?", args.toArray());
        return PageResult.of(content, page, size, total == null ? 0 : total);
    }

    public Map<String, Object> detail(Long id) {
        List<Object> args = new ArrayList<>(); args.add(id);
        String scope = visibility(args);
        var rows = jdbc.queryForList("""
                SELECT CAST(i.id AS VARCHAR) AS "id",d.name AS "templateName",COALESCE(q.request_no,i.business_id) AS "businessKey",
                       CAST(i.version_id AS VARCHAR) AS "versionId",i.business_type AS "businessType",i.status,
                       COALESCE(u.display_name,i.initiator_id) AS "startUserName",CAST(i.started_at AS VARCHAR) AS "startTime",CAST(i.completed_at AS VARCHAR) AS "endTime"
                FROM workflow_instance i LEFT JOIN workflow_definition d ON d.id=i.definition_id
                LEFT JOIN record_control_request q ON q.workflow_instance_id=CAST(i.id AS VARCHAR) AND q.tenant_id='default'
                LEFT JOIN user_account u ON CAST(u.id AS VARCHAR)=i.initiator_id
                WHERE i.id=? AND (i.business_type IS NULL OR i.business_type<>'DHR_SUMMARY')
                """ + scope, args.toArray());
        if (rows.isEmpty()) throw invalid("流程不存在或请通过DHR专属入口查看");
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
        result.put("tasks", tasks.findByInstanceId(id).stream().map(task -> {
            Map<String, Object> view = new LinkedHashMap<>();
            view.put("id", task.getId().toString()); view.put("nodeId", task.getNodeId().toString()); view.put("status", task.getStatus());
            view.put("assigneeId", task.getAssigneeId()); view.put("taskState", WorkflowResponsibilityService.taskState(task));
            view.put("signatureId", task.getSignatureId() == null ? null : task.getSignatureId().toString());
            view.put("opinion", task.getOpinion()); view.put("action", task.getAction());
            var names = jdbc.queryForList("SELECT display_name FROM user_account WHERE CAST(id AS VARCHAR)=?", task.getAssigneeId());
            view.put("assigneeName", names.isEmpty() ? "待候选人处理" : names.getFirst().get("display_name"));
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
    private String visibility(List<Object> args) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> "workflow.intervene".equals(a.getAuthority()))) return "";
        String actor = Objects.toString(AuditContext.getOperatorId(), "");
        args.add(actor); args.add(actor); args.add("[\"" + actor + "\"]"); args.add(actor);
        return """
                 AND (i.business_type IS NULL OR i.business_type NOT IN ('CHANGE','OBSOLETE') OR q.status<>'IN_REVIEW'
                  OR q.applicant_id=? OR EXISTS (SELECT 1 FROM workflow_task t WHERE t.instance_id=i.id
                  AND ((t.status IN ('PENDING','PROCESSING') AND (t.assignee_id=?
                    OR (t.candidate_snapshot -> 'userIds') @> CAST(? AS jsonb) OR t.candidate_snapshot ->> 'unrestricted'='true'))
                    OR (t.status IN ('COMPLETED','REJECTED','TRANSFERRED') AND t.assignee_id=?))))
                """;
    }
    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.WF_007, message); }
}
