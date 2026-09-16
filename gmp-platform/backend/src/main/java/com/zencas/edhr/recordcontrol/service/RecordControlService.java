package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.workflow.contract.RecordControlBusinessProjectionPort;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.*;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowPort;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowResultHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/** Record-control business state. Workflow definitions, tasks and routing remain owned by workflow. */
@Service
@RequiredArgsConstructor
public class RecordControlService implements RecordControlWorkflowResultHandler, RecordControlBusinessProjectionPort {
    private static final String TENANT = "default";
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final SnowflakeIdGenerator ids;
    private final RecordControlWorkflowPort workflows;
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final SignatureRepository signatures;
    private final AuditEventRepository audits;
    private final RecordControlDiff differences;
    private final ExecutionAccess references;

    public record SubmitCommand(BusinessType requestType, String instanceNo, String sourceRevisionId,
                                JsonNode proposedValues, String reason, String workflowDefinitionId,
                                String workflowVersionId, String account, String password, String idempotencyKey) {}

    @Transactional(readOnly = true)
    public ObjectNode findRecord(String instanceNo) {
        if (instanceNo == null || instanceNo.isBlank()) throw invalid("请输入表单流水号");
        var rows = jdbc.queryForList("""
            SELECT r.*, t.code AS template_code, t.name AS template_name, v.version_number,
                   rev.revision_no, rev.values_json AS revision_values,
                   q.id AS active_request_id, q.request_no AS active_request_no, q.request_type AS active_request_type
            FROM form_instance_record r JOIN form_template t ON t.id=r.template_id
            JOIN form_template_version v ON v.id=r.version_id
            LEFT JOIN form_instance_revision rev ON rev.id=r.current_revision_id
            LEFT JOIN record_control_request q ON q.record_id=r.id AND q.tenant_id=r.tenant_id AND q.status='IN_REVIEW'
            WHERE r.tenant_id=? AND r.instance_no=?
            """, TENANT, instanceNo.trim());
        if (rows.isEmpty()) throw invalid("未找到该表单流水号");
        Map<String, Object> row = rows.getFirst();
        ObjectNode result = mapper.createObjectNode();
        for (String key : List.of("id", "instance_no", "object_id", "status", "template_code", "template_name", "version_number",
                "current_revision_id", "revision_no", "created_by", "created_at", "updated_by", "updated_at",
                "active_request_id", "active_request_no", "active_request_type")) put(result, key, row.get(key));
        JsonNode snapshot = json(row.get("snapshot_json"));
        result.set("snapshot", snapshot);
        result.set("fieldValues", differences.identifyRows(json(row.get("revision_values") == null
                ? row.get("values_json") : row.get("revision_values")), snapshot, str(row.get("current_revision_id"))));
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> references(String recordId, String fieldId, String keyword) {
        var records = jdbc.queryForList("SELECT snapshot_json FROM form_instance_record WHERE tenant_id=? AND id=?", TENANT, id(recordId));
        if (records.isEmpty()) throw invalid("表单记录不存在");
        JsonNode field = findField(json(records.getFirst().get("snapshot_json")).path("fields"), fieldId);
        if (field == null || !"reference".equals(field.path("type").asText())) throw invalid("引用字段不存在");
        return references.references(field, keyword);
    }

    @Transactional(readOnly = true)
    public List<ObjectNode> revisions(String recordId) {
        var records = jdbc.queryForList("SELECT id,snapshot_json FROM form_instance_record WHERE tenant_id=? AND id=?", TENANT, id(recordId));
        if (records.isEmpty()) throw invalid("表单记录不存在");
        JsonNode snapshot = json(records.getFirst().get("snapshot_json"));
        var rows = jdbc.queryForList("""
            SELECT id,revision_no,status,values_json,content_hash,request_id,created_by,created_at
            FROM form_instance_revision WHERE tenant_id=? AND record_id=? ORDER BY revision_no DESC
            """, TENANT, id(recordId));
        return rows.stream().map(row -> {
            ObjectNode result = mapper.createObjectNode();
            for (String key : List.of("id", "revision_no", "status", "content_hash", "request_id", "created_by", "created_at"))
                put(result, key, row.get(key));
            result.set("fieldValues", differences.identifyRows(json(row.get("values_json")), snapshot, str(row.get("id"))));
            return result;
        }).toList();
    }

    private JsonNode findField(JsonNode fields, String fieldId) {
        for (JsonNode field : fields) {
            if (fieldId.equals(field.path("id").asText())) return field;
            JsonNode nested = findField(field.path("typeConfig").path("columns"), fieldId);
            if (nested != null) return nested;
        }
        return null;
    }

    @Transactional(readOnly = true)
    public PageResult<ObjectNode> listRequests(boolean mine, int page, int size) {
        String currentUser = actor();
        page = Math.max(0, page); size = Math.max(1, Math.min(200, size));
        String where = " WHERE q.tenant_id=?" + (mine ? " AND q.applicant_id=?" : "");
        List<Object> args = new ArrayList<>(List.of(TENANT));
        if (mine) args.add(currentUser);
        Long count = jdbc.queryForObject("SELECT count(*) FROM record_control_request q" + where, Long.class, args.toArray());
        args.add(size); args.add((long) page * size);
        var rows = jdbc.queryForList("""
            SELECT q.id,q.request_no,q.request_type,q.status,q.reason_text,q.applicant_id,q.applicant_name,
                   q.submitted_at,q.resolved_at,q.workflow_instance_id,r.instance_no,r.status AS record_status
            FROM record_control_request q JOIN form_instance_record r ON r.id=q.record_id
            """ + where + " ORDER BY q.submitted_at DESC,q.id DESC LIMIT ? OFFSET ?", args.toArray());
        return PageResult.of(rows.stream().map(this::requestSummary).toList(), page, size, count == null ? 0 : count);
    }

    @Transactional(readOnly = true)
    public List<ObjectNode> requestsForMyWorkflowTasks(List<String> instanceIds) {
        String currentUser = actor();
        if (instanceIds == null || instanceIds.isEmpty()) return List.of();
        if (instanceIds.size() > 200) throw invalid("一次最多查询 200 个审批任务");
        String placeholders = String.join(",", Collections.nCopies(instanceIds.size(), "?"));
        List<Object> args = new ArrayList<>(List.of(TENANT));
        args.addAll(instanceIds);
        args.add(currentUser);
        args.add("[\"" + currentUser + "\"]");
        args.add(currentUser);
        var rows = jdbc.queryForList("""
            SELECT q.id,q.request_no,q.request_type,q.status,q.reason_text,q.applicant_id,q.applicant_name,
                   q.submitted_at,q.resolved_at,q.workflow_instance_id,r.instance_no,r.status AS record_status
            FROM record_control_request q JOIN form_instance_record r ON r.id=q.record_id
            WHERE q.tenant_id=? AND q.workflow_instance_id IN (
            """ + placeholders + ") AND EXISTS (SELECT 1 FROM workflow_task task WHERE CAST(task.instance_id AS VARCHAR)=q.workflow_instance_id "
                + "AND ((task.status IN ('PENDING','PROCESSING') AND (task.assignee_id=? "
                + "OR (task.candidate_snapshot -> 'userIds') @> CAST(? AS jsonb) "
                + "OR task.candidate_snapshot ->> 'unrestricted'='true')) "
                + "OR (task.assignee_id=? AND task.status IN ('COMPLETED','REJECTED','TRANSFERRED'))))", args.toArray());
        return rows.stream().map(this::requestSummary).toList();
    }

    @Transactional(readOnly = true)
    public ObjectNode requestDetail(String requestId) {
        var rows = jdbc.queryForList("""
            SELECT q.*,r.instance_no,r.status AS record_status,r.snapshot_json,rev.revision_no AS source_revision_no
            FROM record_control_request q JOIN form_instance_record r ON r.id=q.record_id
            JOIN form_instance_revision rev ON rev.id=q.source_revision_id
            WHERE q.tenant_id=? AND q.id=?
            """, TENANT, id(requestId));
        if (rows.isEmpty()) throw invalid("申请不存在");
        Map<String, Object> row = rows.getFirst();
        ObjectNode result = requestSummary(row);
        for (String key : List.of("record_id", "source_revision_id", "source_revision_no", "applicant_signature_id",
                "workflow_definition_id", "workflow_version_id", "audit_correlation_id")) put(result, key, row.get(key));
        result.set("snapshot", json(row.get("snapshot_json")));
        result.set("sourceValues", json(row.get("source_values_json")));
        if (row.get("proposed_values_json") != null) result.set("proposedValues", json(row.get("proposed_values_json")));
        if (row.get("diff_json") != null) result.set("diff", json(row.get("diff_json")));
        var history = mapper.createArrayNode();
        history.addObject().put("status", "IN_REVIEW").put("action", "SUBMIT")
                .put("operatorId", str(row.get("applicant_id"))).put("occurredAt", str(row.get("submitted_at")));
        for (var event : jdbc.queryForList("""
                SELECT event_id,result,occurred_at FROM record_control_result_event
                WHERE tenant_id=? AND request_id=? ORDER BY occurred_at,event_id
                """, TENANT, id(requestId)))
            history.addObject().put("status", str(event.get("result"))).put("action", str(event.get("result")))
                    .put("eventId", str(event.get("event_id"))).put("occurredAt", str(event.get("occurred_at")));
        result.set("statusHistory", history);
        return result;
    }

    @Transactional
    public ObjectNode submit(SubmitCommand command) {
        String applicant = actor();
        if (command == null || command.requestType() == null || command.instanceNo() == null
                || command.sourceRevisionId() == null || command.reason() == null || command.reason().isBlank()
                || command.workflowDefinitionId() == null || command.workflowVersionId() == null
                || command.idempotencyKey() == null || command.idempotencyKey().isBlank()) throw invalid("申请信息不完整");
        if (command.reason().trim().length() > 2000 || command.idempotencyKey().length() > 128) throw invalid("申请原因或幂等键过长");
        var prior = jdbc.queryForList("SELECT id FROM record_control_request WHERE tenant_id=? AND applicant_id=? AND idempotency_key=?",
                TENANT, applicant, command.idempotencyKey());
        if (!prior.isEmpty()) return requestDetail(str(prior.getFirst().get("id")));
        Map<String, Object> record = recordByNumber(command.instanceNo());
        lockSource(((Number) record.get("object_id")).longValue());
        record = lockedRecord(((Number) record.get("id")).longValue());
        prior = jdbc.queryForList("SELECT id FROM record_control_request WHERE tenant_id=? AND applicant_id=? AND idempotency_key=?",
                TENANT, applicant, command.idempotencyKey());
        if (!prior.isEmpty()) return requestDetail(str(prior.getFirst().get("id")));
        if (!"COMPLETED".equals(record.get("status")) || record.get("current_revision_id") == null)
            throw invalid("只有已有有效修订的已完成表单可申请变更或作废");
        if (!command.sourceRevisionId().equals(str(record.get("current_revision_id")))) throw invalid("表单修订已变化，请刷新后重试");
        Long active = jdbc.queryForObject("SELECT count(*) FROM record_control_request WHERE tenant_id=? AND record_id=? AND status='IN_REVIEW'",
                Long.class, TENANT, record.get("id"));
        if (active != null && active > 0) throw invalid("该表单已有审批中的申请");
        JsonNode snapshot = json(record.get("snapshot_json"));
        var sourceRows = jdbc.queryForList("SELECT values_json FROM form_instance_revision WHERE tenant_id=? AND id=? AND record_id=? AND status='EFFECTIVE'",
                TENANT, id(command.sourceRevisionId()), record.get("id"));
        if (sourceRows.isEmpty()) throw invalid("当前有效修订不存在");
        String sourceJson = str(sourceRows.getFirst().get("values_json"));
        JsonNode source = differences.identifyRows(json(sourceJson), snapshot, command.sourceRevisionId());
        JsonNode proposal = null;
        JsonNode diff = mapper.createArrayNode();
        if (command.requestType() == BusinessType.CHANGE) {
            if (command.proposedValues() == null) throw invalid("请填写拟变更内容");
            var prepared = differences.prepare(snapshot, source, command.proposedValues(), str(record.get("object_id")));
            proposal = prepared.values(); diff = prepared.differences();
            if (diff.isEmpty()) throw invalid("表单内容没有实际变化");
        }
        long requestId = ids.nextId();
        Long sequence = jdbc.queryForObject("SELECT nextval('record_control_request_number_seq')", Long.class);
        String requestNo = "RC-" + LocalDateTime.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + String.format(Locale.ROOT, "%06d", sequence);
        String correlationId = UUID.randomUUID().toString();
        ObjectNode signed = mapper.createObjectNode().put("requestId", str(requestId)).put("recordId", str(record.get("id")))
                .put("sourceRevisionId", command.sourceRevisionId()).put("type", command.requestType().name())
                .put("reason", command.reason().trim()).put("workflowDefinitionId", command.workflowDefinitionId())
                .put("workflowVersionId", command.workflowVersionId());
        signed.set("sourceValues", source); if (proposal != null) signed.set("proposedValues", proposal);
        long signatureId = sign(requestId, signed, command.account(), command.password());
        jdbc.update("""
            INSERT INTO record_control_request(id,tenant_id,request_no,request_type,status,record_id,source_revision_id,
                source_values_json,proposed_values_json,diff_json,reason_text,applicant_id,applicant_name,applicant_signature_id,
                workflow_definition_id,workflow_version_id,idempotency_key,audit_correlation_id,submitted_at)
            VALUES(?,?,?,?,'IN_REVIEW',?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, requestId, TENANT, requestNo, command.requestType().name(), record.get("id"),
                id(command.sourceRevisionId()), source.toString(), proposal == null ? null : proposal.toString(), diff.toString(),
                command.reason().trim(), applicant, AuditContext.getOperatorName(), signatureId,
                command.workflowDefinitionId(), command.workflowVersionId(), command.idempotencyKey(), correlationId, LocalDateTime.now());
        var started = workflows.start(new StartCommand(str(requestId), command.requestType(), command.workflowDefinitionId(),
                command.workflowVersionId(), applicant, str(signatureId), command.idempotencyKey(), correlationId));
        jdbc.update("UPDATE record_control_request SET workflow_instance_id=?,workflow_snapshot_hash=? WHERE id=? AND tenant_id=?",
                started.workflowInstanceId(), started.workflowSnapshotHash(), requestId, TENANT);
        audit(requestId, "SUBMIT", null, signed, command.reason().trim(), requestNo, applicant);
        return requestDetail(str(requestId));
    }

    @Override
    @Transactional
    public void handle(WorkflowResultEvent event) {
        if (event == null || event.eventId() == null || event.eventId().isBlank() || event.result() == null
                || event.businessId() == null || event.businessType() == null) throw invalid("审批结果不完整");
        var references = jdbc.queryForList("SELECT record_id FROM record_control_request WHERE tenant_id=? AND id=?", TENANT, id(event.businessId()));
        if (references.isEmpty()) throw invalid("审批申请不存在");
        long recordId = ((Number) references.getFirst().get("record_id")).longValue();
        var source = jdbc.queryForList("SELECT object_id FROM form_instance_record WHERE tenant_id=? AND id=?", TENANT, recordId);
        if (source.isEmpty()) throw invalid("来源表单不存在");
        lockSource(((Number) source.getFirst().get("object_id")).longValue());
        Map<String, Object> record = lockedRecord(recordId);
        var requests = jdbc.queryForList("SELECT * FROM record_control_request WHERE tenant_id=? AND id=? FOR UPDATE", TENANT, id(event.businessId()));
        Map<String, Object> request = requests.getFirst();
        var previous = jdbc.queryForList("SELECT request_id,result FROM record_control_result_event WHERE event_id=?", event.eventId());
        if (!previous.isEmpty()) {
            if (!Objects.equals(str(previous.getFirst().get("request_id")), event.businessId())
                    || !Objects.equals(str(previous.getFirst().get("result")), event.result().name())) throw invalid("审批事件标识冲突");
            return;
        }
        if (!"IN_REVIEW".equals(request.get("status"))
                || !Objects.equals(request.get("workflow_instance_id"), event.workflowInstanceId())
                || !Objects.equals(request.get("workflow_version_id"), event.workflowVersionId())
                || !Objects.equals(request.get("workflow_definition_id"), event.workflowDefinitionId())
                || !Objects.equals(request.get("workflow_snapshot_hash"), event.workflowSnapshotHash())
                || !Objects.equals(request.get("request_type"), event.businessType().name())) throw invalid("审批结果与当前申请不匹配");
        ObjectNode before = mapper.createObjectNode().put("status", str(record.get("status")))
                .put("currentRevisionId", str(record.get("current_revision_id")));
        ObjectNode after = before.deepCopy();
        if (event.result() == Result.APPROVED) {
            if (!Objects.equals(str(record.get("current_revision_id")), str(request.get("source_revision_id")))
                    || !"COMPLETED".equals(record.get("status"))) throw invalid("来源表单已变化，审批结果不能落地");
            if ("CHANGE".equals(request.get("request_type"))) applyChange(record, request, after);
            else applyObsolete(record, request, after);
        }
        LocalDateTime resolvedAt = event.occurredAt() == null ? LocalDateTime.now() : event.occurredAt();
        jdbc.update("UPDATE record_control_request SET status=?,resolved_at=? WHERE id=? AND tenant_id=?",
                event.result().name(), resolvedAt, request.get("id"), TENANT);
        jdbc.update("INSERT INTO record_control_result_event(event_id,tenant_id,request_id,result,occurred_at) VALUES(?,?,?,?,?)",
                event.eventId(), TENANT, request.get("id"), event.result().name(), resolvedAt);
        audit(((Number) request.get("id")).longValue(), event.result().name(), before, after,
                str(request.get("reason_text")), str(request.get("request_no")), event.operatorId());
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessDetailProjection getByRequestId(String requestId) {
        var rows = jdbc.queryForList("SELECT * FROM record_control_request WHERE tenant_id=? AND id=?", TENANT, id(requestId));
        if (rows.isEmpty()) throw invalid("申请不存在");
        Map<String, Object> row = rows.getFirst();
        return new BusinessDetailProjection(str(row.get("id")), str(row.get("request_no")),
                BusinessType.valueOf(str(row.get("request_type"))), str(row.get("status")), str(row.get("record_id")),
                str(row.get("source_revision_id")), null, str(row.get("reason_text")), str(row.get("applicant_id")),
                str(row.get("applicant_name")), (LocalDateTime) row.get("submitted_at"), null,
                str(row.get("diff_json")), str(row.get("workflow_instance_id")));
    }

    private void applyChange(Map<String, Object> record, Map<String, Object> request, ObjectNode after) {
        long oldId = ((Number) request.get("source_revision_id")).longValue();
        Integer number = jdbc.queryForObject("SELECT revision_no FROM form_instance_revision WHERE tenant_id=? AND id=?", Integer.class, TENANT, oldId);
        long newId = ids.nextId();
        JsonNode proposal = json(request.get("proposed_values_json"));
        JsonNode executionValues = differences.stripRowIds(proposal);
        jdbc.update("UPDATE form_instance_revision SET status='SUPERSEDED' WHERE id=? AND tenant_id=? AND status='EFFECTIVE'", oldId, TENANT);
        jdbc.update("""
            INSERT INTO form_instance_revision(id,tenant_id,record_id,revision_no,status,values_json,content_hash,request_id,created_by,created_at)
            VALUES(?,?,?,?,'EFFECTIVE',?,?,?,?,?)
            """, newId, TENANT, record.get("id"), number + 1, proposal.toString(), hash(proposal.toString()), request.get("id"),
                request.get("applicant_id"), LocalDateTime.now());
        jdbc.update("UPDATE form_instance_record SET current_revision_id=?,values_json=?,updated_by=?,updated_at=? WHERE id=? AND tenant_id=?",
                newId, executionValues.toString(), request.get("applicant_name"), LocalDateTime.now(), record.get("id"), TENANT);
        updateExecution(record, executionValues, "COMPLETED");
        after.put("currentRevisionId", str(newId)).put("revisionNo", number + 1);
    }

    private void applyObsolete(Map<String, Object> record, Map<String, Object> request, ObjectNode after) {
        jdbc.update("UPDATE form_instance_revision SET status='VOIDED' WHERE id=? AND tenant_id=? AND status='EFFECTIVE'",
                record.get("current_revision_id"), TENANT);
        jdbc.update("UPDATE form_instance_record SET status='OBSOLETE',obsolete_request_id=?,obsoleted_at=?,updated_by=?,updated_at=? WHERE id=? AND tenant_id=?",
                request.get("id"), LocalDateTime.now(), request.get("applicant_name"), LocalDateTime.now(), record.get("id"), TENANT);
        updateExecution(record, json(record.get("values_json")), "OBSOLETE");
        after.put("status", "OBSOLETE").put("obsoleteRequestId", str(request.get("id")));
    }

    private void updateExecution(Map<String, Object> record, JsonNode values, String status) {
        var rows = jdbc.queryForList("SELECT state_json FROM production_execution WHERE object_id=?", record.get("object_id"));
        if (rows.isEmpty()) throw invalid("来源执行记录不存在");
        ObjectNode state = (ObjectNode) json(rows.getFirst().get("state_json"));
        JsonNode form = state.path("operations").path(str(record.get("operation_id"))).path("forms").path(str(record.get("copy_id")));
        if (!(form instanceof ObjectNode formState)) throw invalid("来源执行表单已不存在");
        formState.set("values", values.deepCopy()); formState.put("status", status);
        jdbc.update("UPDATE production_execution SET state_json=?,revision=revision+1,updated_at=? WHERE object_id=?",
                state.toString(), LocalDateTime.now(), record.get("object_id"));
    }

    private long sign(long requestId, ObjectNode signed, String account, String password) {
        var user = users.findById(id(actor())).orElseThrow(() -> invalid("签署用户不存在"));
        if (!Objects.equals(user.getUsername(), account) || !"ACTIVE".equals(user.getStatus())
                || (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now()))
                || password == null || !passwords.matches(password, user.getPasswordHash()))
            throw invalid("签署账户或密码不正确，或账户不可用");
        long signatureId = ids.nextId();
        signatures.saveAndFlush(Signature.builder().id(signatureId).tenantId(TENANT).targetType("RECORD_CONTROL_REQUEST")
                .targetId(str(requestId)).meaning("记录变更/作废申请提交").signerId(actor()).signerName(user.getDisplayName())
                .authMethod("PASSWORD").snapshotData(signed.toString()).snapshotHash(hash(signed.toString()))
                .signedAt(LocalDateTime.now()).build());
        return signatureId;
    }

    private void audit(long requestId, String action, JsonNode before, JsonNode after, String reason, String summary, String operatorId) {
        boolean currentOperator = Objects.equals(operatorId, AuditContext.getOperatorId());
        audits.save(AuditEvent.builder().id(ids.nextId()).tenantId(TENANT).entityType("RECORD_CONTROL_REQUEST")
                .entityId(str(requestId)).action(action).contentBefore(before == null ? null : before.toString())
                .contentAfter(after == null ? null : after.toString()).operatorId(operatorId)
                .operatorName(currentOperator ? AuditContext.getOperatorName() : operatorId)
                .operatorAccount(currentOperator ? AuditContext.getOperatorAccount() : null)
                .source("SUBMIT".equals(action) ? AuditContext.getSource() : "WORKFLOW")
                .moduleName("记录").menuName("变更管理").functionName(action)
                .dataSummary(summary).reason(reason).ipAddress(AuditContext.getIpAddress()).createdAt(LocalDateTime.now()).build());
    }

    /** Match production execution's work-order → object → execution → form-record lock order. */
    private void lockSource(long objectId) {
        Long orderId = jdbc.queryForObject("SELECT work_order_id FROM production_object WHERE tenant_id=? AND id=?",
                Long.class, TENANT, objectId);
        if (orderId == null) throw invalid("来源生产对象不存在");
        if (jdbc.queryForList("SELECT id FROM work_order WHERE tenant_id=? AND id=? FOR UPDATE", TENANT, orderId).isEmpty())
            throw invalid("来源工单不存在");
        if (jdbc.queryForList("SELECT id FROM production_object WHERE tenant_id=? AND id=? FOR UPDATE", TENANT, objectId).isEmpty())
            throw invalid("来源生产对象不存在");
        if (jdbc.queryForList("SELECT object_id FROM production_execution WHERE object_id=? FOR UPDATE", objectId).isEmpty())
            throw invalid("来源执行记录不存在");
    }

    private Map<String, Object> recordByNumber(String number) {
        var rows = jdbc.queryForList("SELECT * FROM form_instance_record WHERE tenant_id=? AND instance_no=?", TENANT, number.trim());
        if (rows.isEmpty()) throw invalid("未找到该表单流水号");
        return rows.getFirst();
    }

    private Map<String, Object> lockedRecord(long recordId) {
        var rows = jdbc.queryForList("SELECT * FROM form_instance_record WHERE tenant_id=? AND id=? FOR UPDATE", TENANT, recordId);
        if (rows.isEmpty()) throw invalid("表单记录不存在");
        return rows.getFirst();
    }

    private ObjectNode requestSummary(Map<String, Object> row) {
        ObjectNode result = mapper.createObjectNode();
        for (String key : List.of("id", "request_no", "request_type", "status", "reason_text", "applicant_id",
                "applicant_name", "submitted_at", "resolved_at", "workflow_instance_id", "instance_no", "record_status"))
            put(result, key, row.get(key));
        return result;
    }

    private void put(ObjectNode node, String key, Object value) {
        if (value == null) node.putNull(key); else node.put(key, str(value));
    }

    private JsonNode json(Object raw) {
        try { return mapper.readTree(str(raw)); } catch (Exception ex) { throw invalid("记录快照无法读取"); }
    }

    private String actor() {
        String value = AuditContext.getOperatorId();
        if (value == null || value.isBlank()) throw invalid("请重新登录"); return value;
    }

    private long id(String value) {
        try { return Long.parseLong(value); } catch (Exception ex) { throw invalid("标识格式不正确"); }
    }

    private static String str(Object value) { return value == null ? "" : value.toString(); }

    private String hash(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception ex) { throw new IllegalStateException("SHA-256 unavailable", ex); }
    }

    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
