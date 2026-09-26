package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Public service + real JDBC/transactions, isolated from the running development database. */
@SpringJUnitConfig(DhrSummaryPersistenceTest.Config.class)
class DhrSummaryPersistenceTest {
    private static final String DIRECTORY_ID = "377634999500804097";
    @Autowired DhrSummaryService service;
    @Autowired DhrInstanceService instances;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired AuditEventRepository audits;
    @Autowired com.zencas.edhr.workflow.engine.WorkflowEngine engine;
    @Autowired DhrAttachmentService attachments;
    private ObjectNode base;
    private ObjectNode detail;

    @BeforeEach void setup() throws Exception {
        reset(instances, audits, engine, attachments);
        when(attachments.snapshot(anyLong())).thenAnswer(ignored -> mapper.createArrayNode());
        jdbc.execute("DROP ALL OBJECTS");
        jdbc.execute("CREATE TABLE dhr_instance(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),status VARCHAR(32),summary_status VARCHAR(32),dhr_review_mode VARCHAR(32),directory_snapshot TEXT,production_object_id BIGINT,dhr_review_workflow_definition_id BIGINT,dhr_review_workflow_version_id BIGINT,updated_by VARCHAR(128),updated_at TIMESTAMP)");
        jdbc.execute("CREATE TABLE dhr_summary_draft(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),dhr_instance_id BIGINT UNIQUE,overlay_directory_json TEXT,evidence_placement_json TEXT,source_scope_hash VARCHAR(64),revision INT,created_by VARCHAR(128),created_at TIMESTAMP,updated_by VARCHAR(128),updated_at TIMESTAMP)");
        jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),dhr_instance_id BIGINT,version_no INT,status VARCHAR(32),review_mode VARCHAR(32),review_workflow_definition_id BIGINT,review_workflow_version_id BIGINT,base_directory_snapshot TEXT,overlay_directory_snapshot TEXT,candidate_snapshot TEXT,attachment_snapshot TEXT DEFAULT '[]',snapshot_hash VARCHAR(64),submitted_by VARCHAR(128),submitted_at TIMESTAMP,created_at TIMESTAMP,evidence_model_version SMALLINT DEFAULT 1,check_result_snapshot TEXT,UNIQUE(dhr_instance_id,version_no))");
        jdbc.execute("CREATE TABLE dhr_summary_evidence(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),summary_version_id BIGINT,source_record_id BIGINT,target_node_key VARCHAR(128),before_node_key VARCHAR(128),display_order INT,display_name VARCHAR(120),origin_kind VARCHAR(32),source_snapshot TEXT,source_hash VARCHAR(64),created_at TIMESTAMP,UNIQUE(summary_version_id,source_record_id))");
        jdbc.execute("CREATE TABLE dhr_summary_review(summary_version_id BIGINT PRIMARY KEY,workflow_instance_id BIGINT,status VARCHAR(32),submitted_by_id VARCHAR(64),updated_at TIMESTAMP)");
        // Numeric IDs model an already frozen snapshot. Reads must not rewrite it.
        base = (ObjectNode) mapper.readTree("{\"directories\":[{\"id\":" + DIRECTORY_ID + ",\"parentId\":null,\"name\":\"生产\",\"items\":[{\"id\":20,\"required\":true,\"displayName\":\"必填记录\",\"records\":[]}]}]}");
        jdbc.update("INSERT INTO dhr_instance(id,tenant_id,status,summary_status,dhr_review_mode,directory_snapshot) VALUES(1,'default','COMPLETED','NOT_STARTED','NONE',?)", base.toString());
        detail = mapper.createObjectNode().put("id", "1");
        detail.set("directorySnapshot", DhrInstanceService.directoryForResponse(base));
        ObjectNode origins = detail.putObject("recordsByOrigin");
        origins.putArray("directory").add(record("100", "DIRECTORY"));
        origins.putArray("work").add(record("101", "WORK"));
        origins.putArray("custom").add(record("102", "CUSTOM"));
        ((com.fasterxml.jackson.databind.node.ArrayNode) detail.at("/directorySnapshot/directories/0/items/0/records")).add(record("100", "DIRECTORY"));
        when(instances.detail(1L)).thenAnswer(ignored -> detail.deepCopy());
    }

    @Test void directoryProjectionKeepsLongIdsExactWithoutMutatingFrozenData() throws Exception {
        String original = base.toString();
        ObjectNode child = ((com.fasterxml.jackson.databind.node.ArrayNode) base.path("directories")).addObject()
                .put("id", 377634999500804098L).put("parentId", Long.parseLong(DIRECTORY_ID));
        child.putArray("items");
        JsonNode projected = mapper.readTree(DhrInstanceService.directoryForResponse(base).toString());
        assertThat(projected.at("/directories/0/id").isTextual()).isTrue();
        assertThat(projected.at("/directories/0/id").asText()).isEqualTo(DIRECTORY_ID);
        assertThat(projected.at("/directories/1/id").asText()).isEqualTo("377634999500804098");
        assertThat(projected.at("/directories/1/parentId").asText()).isEqualTo(DIRECTORY_ID);
        assertThat(base.at("/directories/0/id").isIntegralNumber()).isTrue();
        assertThat(jdbc.queryForObject("SELECT directory_snapshot FROM dhr_instance", String.class)).isEqualTo(original);
        service.saveDraft(1L, command(null)); // exact projected target is accepted against numeric snapshot
    }

    @Test void savesRecordBeforeAndAfterAndRejectStaleRevisionWithoutChangingData() throws Exception {
        ObjectNode first = command(null);
        assertThat(service.saveDraft(1L, first).path("revision").asInt()).isEqualTo(1);
        ObjectNode second = command(1);
        second.putArray("placements");
        assertThat(service.saveDraft(1L, second).path("revision").asInt()).isEqualTo(2);
        ArgumentCaptor<AuditEvent> captured = ArgumentCaptor.forClass(AuditEvent.class);
        verify(audits, times(2)).save(captured.capture());
        assertThat(captured.getAllValues().get(0).getContentBefore()).isNull();
        JsonNode before = mapper.readTree(captured.getAllValues().get(1).getContentBefore());
        JsonNode after = mapper.readTree(captured.getAllValues().get(1).getContentAfter());
        assertThat(before.path("placements")).isEqualTo(first.path("placements"));
        assertThat(before.path("overlayDirectories")).isEqualTo(first.path("overlayDirectories"));
        assertThat(after.path("placements").size()).isZero();
        assertThat(after.path("revision").asInt()).isEqualTo(2);
        assertThat(after.path("dhrId").asText()).isEqualTo("1");
        assertThatThrownBy(() -> service.saveDraft(1L, first)).hasMessageContaining("其他操作创建");
        assertThat(service.workspace(1L).at("/draft/revision").asInt()).isEqualTo(2);
        verify(audits, times(2)).save(any());
    }

    @Test void auditFailureRollsBackDraftAndStatus() {
        when(audits.save(any())).thenThrow(new IllegalStateException("audit unavailable"));
        assertThatThrownBy(() -> service.saveDraft(1L, command(null))).hasMessageContaining("audit unavailable");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_draft", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("NOT_STARTED");
    }

    @Test void failedSubmitRetainsSavedRevisionAndSuccessfulRetryFreezesEvidence() throws Exception {
        service.saveDraft(1L, command(null));
        ((ObjectNode) detail.at("/directorySnapshot/directories/0/items/0")).putArray("records");
        assertThatThrownBy(() -> service.submit(1L, submitCommand(1)))
                .hasMessageContaining("缺少已完成记录");
        assertThat(service.workspace(1L).at("/draft/revision").asInt()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version", Integer.class)).isZero();
        ((ObjectNode) detail.at("/directorySnapshot/directories/0/items/0")).putArray("records").add(record("100", "DIRECTORY"));
        ObjectNode saved = service.saveDraft(1L, command(1));
        assertThatThrownBy(() -> service.submit(1L, submitCommand(1))).hasMessageContaining("其他操作更新");
        ObjectNode submitted = service.submit(1L, submitCommand(saved.path("revision").asInt()));
        long versionId = submitted.path("id").asLong();
        String frozenBase = jdbc.queryForObject("SELECT base_directory_snapshot FROM dhr_summary_version", String.class);
        String frozenCandidates = jdbc.queryForObject("SELECT candidate_snapshot FROM dhr_summary_version", String.class);
        String hash = submitted.path("snapshotHash").asText();
        assertThat(frozenBase).isEqualTo(base.toString());
        assertThat(service.workspace(1L).path("draft").isNull()).isTrue();
        assertThat(service.workspace(1L).path("versions").size()).isEqualTo(1);
        detail.withObject("/recordsByOrigin").putArray("work"); // later live changes cannot rewrite a version
        ObjectNode version = service.version(1L, versionId);
        assertThat(version.at("/version/baseDirectory/directories/0/id").asText()).isEqualTo(DIRECTORY_ID);
        assertThat(version.at("/version/candidates")).isEqualTo(mapper.readTree(frozenCandidates));
        assertThat(version.at("/version/snapshotHash").asText()).isEqualTo(hash);
        assertThat(version.path("placements").size()).isEqualTo(3); // Every actual source record is evidence.
        assertThat(version.at("/version/evidenceModelVersion").asInt()).isEqualTo(2);
        assertThat(version.at("/version/checkResult/actualRecordCount").asInt()).isEqualTo(3);
        assertThatThrownBy(() -> service.saveDraft(1L, command(2))).hasMessageContaining("不能修改已冻结版本");
        assertThatThrownBy(() -> service.submit(1L, submitCommand(2))).hasMessageContaining("不能修改已冻结版本");
        assertThat(jdbc.queryForObject("SELECT base_directory_snapshot FROM dhr_summary_version", String.class)).isEqualTo(frozenBase);
    }

    @Test void submitRequiresAuditableManualCheckBeforeFreezing() {
        service.saveDraft(1L, command(null));
        ObjectNode withoutReview = submitCommand(1);
        withoutReview.remove("manualReview");
        assertThatThrownBy(() -> service.submit(1L, withoutReview)).hasMessageContaining("人工核查");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version", Integer.class)).isZero();
    }

    @Test void submitAuditFailureRollsBackVersionEvidenceAndDraftDeletion() {
        service.saveDraft(1L, command(null));
        when(audits.save(any())).thenThrow(new IllegalStateException("audit unavailable"));
        assertThatThrownBy(() -> service.submit(1L, submitCommand(1))).hasMessageContaining("audit unavailable");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_evidence", Integer.class)).isZero();
        assertThat(service.workspace(1L).at("/draft/revision").asInt()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("DRAFT");
    }

    @Test void requiredReviewUsesFrozenBindingAndFailedWorkflowRollsBackSubmission() {
        com.zencas.edhr.common.audit.AuditContext.setOperator("7", "提交人");
        try {
            jdbc.update("UPDATE dhr_instance SET dhr_review_mode='REQUIRED',dhr_review_workflow_definition_id=50,dhr_review_workflow_version_id=51");
            service.saveDraft(1L, command(null));
            when(engine.createDhrSummaryInstance(eq(50L), eq(51L), anyString(), eq("7"))).thenThrow(new IllegalStateException("workflow unavailable"));
            assertThatThrownBy(() -> service.submit(1L, submitCommand(1))).hasMessageContaining("workflow unavailable");
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version", Integer.class)).isZero();
            assertThat(service.workspace(1L).at("/draft/revision").asInt()).isEqualTo(1);
            when(engine.createDhrSummaryInstance(eq(50L), eq(51L), anyString(), eq("7"))).thenReturn(com.zencas.edhr.workflow.entity.WorkflowInstance.builder().id(70L).status("RUNNING").build());
            ObjectNode result = service.submit(1L, submitCommand(1));
            assertThat(result.path("status").asText()).isEqualTo("PENDING_REVIEW");
            assertThat(jdbc.queryForObject("SELECT workflow_instance_id FROM dhr_summary_review", Long.class)).isEqualTo(70L);
            jdbc.update("UPDATE dhr_summary_review SET status='APPROVED'");
            assertThat(service.version(1L, result.path("id").asLong()).at("/version/reviewOutcome").asText()).isEqualTo("APPROVED");
            assertThat(jdbc.queryForObject("SELECT status FROM dhr_summary_version", String.class)).isEqualTo("PENDING_REVIEW");
        } finally { com.zencas.edhr.common.audit.AuditContext.clear(); }
    }

    @Test void explicitReorganizationPreservesOriginalEvidenceAndChecksVersionAndReason() {
        service.saveDraft(1L, command(null));
        ObjectNode oldSave = command(1), oldSubmit = submitCommand(1);
        ObjectNode submitted = service.submit(1L, oldSubmit);
        String frozen = jdbc.queryForObject("SELECT candidate_snapshot FROM dhr_summary_version", String.class);
        ObjectNode request = mapper.createObjectNode().put("expectedVersionId", submitted.path("id").asText()).put("reason", "追加证据");
        assertThatThrownBy(() -> service.reorganize(1L, request.deepCopy().put("reason", ""))).hasMessageContaining("原因");
        assertThatThrownBy(() -> service.reorganize(1L, request.deepCopy().put("expectedVersionId", "wrong"))).hasMessageContaining("版本已变化");
        assertThat(service.reorganize(1L, request).at("/draft/revision").asInt()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance", String.class)).isEqualTo("DRAFT");
        assertThat(jdbc.queryForObject("SELECT candidate_snapshot FROM dhr_summary_version", String.class)).isEqualTo(frozen);
        assertThat(service.workspace(1L).at("/draft/placements/0/recordId").asText()).isEqualTo("101");
        assertThatThrownBy(() -> service.saveDraft(1L, oldSave)).hasMessageContaining("替换");
        assertThatThrownBy(() -> service.submit(1L, oldSubmit)).hasMessageContaining("替换");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version", Integer.class)).isEqualTo(1);
        assertThat(service.workspace(1L).at("/draft/revision").asInt()).isEqualTo(1);
        assertThatThrownBy(() -> service.reorganize(1L, request)).hasMessageContaining("只有已定稿");
    }

    @Test void optionalInstanceOrderSurvivesDraftFreezeReadAndReorganization() {
        ((com.fasterxml.jackson.databind.node.ArrayNode) detail.at("/recordsByOrigin/work")).add(record("103", "WORK"));
        ObjectNode command = command(null);
        ((ObjectNode) command.at("/placements/0")).put("beforeNodeKey", "base-item-20").put("displayOrder", 0);
        ((com.fasterxml.jackson.databind.node.ArrayNode) command.path("placements")).addObject()
                .put("recordId", "103").put("targetNodeKey", "base-dir-" + DIRECTORY_ID)
                .put("beforeNodeKey", "base-item-20").put("displayOrder", 1);
        service.saveDraft(1L, command);
        assertThat(service.workspace(1L).at("/draft/placements")).isEqualTo(command.path("placements"));

        ObjectNode submitted = service.submit(1L, submitCommand(1));
        long versionId = submitted.path("id").asLong();
        ObjectNode version = service.version(1L, versionId);
        assertThat(version.path("placements").findValuesAsText("recordId")).contains("101", "103");
        assertThat(version.path("placements").findValuesAsText("beforeNodeKey")).containsExactlyInAnyOrder("base-item-20", "base-item-20");
        assertThat(jdbc.queryForList("SELECT display_order FROM dhr_summary_evidence WHERE origin_kind='WORK' AND display_order IS NOT NULL ORDER BY display_order", Integer.class))
                .containsExactly(0, 1);
        ObjectNode request = mapper.createObjectNode().put("expectedVersionId", Long.toString(versionId)).put("reason", "调整归档");
        ObjectNode reorganized = service.reorganize(1L, request);
        assertThat(reorganized.at("/draft/placements")).isEqualTo(command.path("placements"));
        ObjectNode reordered = command(1);
        ((ObjectNode) reordered.at("/placements/0")).put("beforeNodeKey", "base-item-20").put("displayOrder", 1);
        ((com.fasterxml.jackson.databind.node.ArrayNode) reordered.path("placements")).addObject()
                .put("recordId", "103").put("targetNodeKey", "base-dir-" + DIRECTORY_ID)
                .put("beforeNodeKey", "base-item-20").put("displayOrder", 0);
        ObjectNode saved = service.saveDraft(1L, reordered);
        ObjectNode next = service.submit(1L, submitCommand(saved.path("revision").asInt()));
        assertThat(next.path("snapshotHash").asText()).isNotEqualTo(submitted.path("snapshotHash").asText());
        assertThat(service.version(1L, versionId).path("placements")).isEqualTo(version.path("placements"));
    }

    @Test void summaryDisplayNameIsFrozenWithoutChangingSourceAndSurvivesReorganization() {
        ObjectNode renamed = command(null);
        ((ObjectNode) renamed.at("/placements/0")).put("displayName", "来料检验记录（汇总）");
        service.saveDraft(1L, renamed);
        assertThat(service.workspace(1L).at("/draft/placements/0/displayName").asText()).isEqualTo("来料检验记录（汇总）");
        ObjectNode submitted = service.submit(1L, submitCommand(1));
        long versionId = submitted.path("id").asLong();
        assertThat(jdbc.queryForObject("SELECT display_name FROM dhr_summary_evidence WHERE source_record_id=101", String.class))
                .isEqualTo("来料检验记录（汇总）");
        assertThat(service.version(1L, versionId).at("/placements/1/displayName").asText()).isEqualTo("来料检验记录（汇总）");
        assertThat(service.version(1L, versionId).at("/version/candidates/1/displayName").isMissingNode()).isTrue();
        ObjectNode request = mapper.createObjectNode().put("expectedVersionId", Long.toString(versionId)).put("reason", "调整归档文档名称");
        assertThat(service.reorganize(1L, request).at("/draft/placements/0/displayName").asText()).isEqualTo("来料检验记录（汇总）");
        ObjectNode changed = command(1);
        ((ObjectNode) changed.at("/placements/0")).put("displayName", "新汇总文档名称");
        service.saveDraft(1L, changed);
        ObjectNode second = service.submit(1L, submitCommand(2));
        assertThat(second.path("snapshotHash").asText()).isNotEqualTo(submitted.path("snapshotHash").asText());
        assertThat(service.version(1L, versionId).at("/placements/1/displayName").asText()).isEqualTo("来料检验记录（汇总）");
    }

    @Test void directoryDisplayNameSurvivesDraftFreezeAndReorganizationWithoutChangingBase() {
        ObjectNode command = command(null);
        ((com.fasterxml.jackson.databind.node.ArrayNode) command.path("placements")).addObject()
                .put("recordId", "100").put("targetNodeKey", "base-item-20").put("displayName", "目录归档名称");
        service.saveDraft(1L, command);
        assertThat(service.workspace(1L).at("/draft/placements/1/displayName").asText()).isEqualTo("目录归档名称");
        ObjectNode submitted = service.submit(1L, submitCommand(1));
        long versionId = submitted.path("id").asLong();
        ObjectNode version = service.version(1L, versionId);
        assertThat(version.at("/placements/0/displayName").asText()).isEqualTo("目录归档名称");
        assertThat(version.at("/version/baseDirectory/directories/0/items/0/displayName").asText()).isEqualTo("必填记录");
        ObjectNode request = mapper.createObjectNode().put("expectedVersionId", Long.toString(versionId)).put("reason", "更新归档名称");
        ObjectNode nextDraft = service.reorganize(1L, request);
        assertThat(nextDraft.at("/draft/placements/0/displayName").asText()).isEqualTo("目录归档名称");
        ObjectNode changed = command(1);
        changed.set("placements", nextDraft.at("/draft/placements").deepCopy());
        ((ObjectNode) changed.at("/placements/0")).put("displayName", "新的目录归档名称");
        service.saveDraft(1L, changed);
        ObjectNode nextVersion = service.submit(1L, submitCommand(2));
        assertThat(nextVersion.path("snapshotHash").asText()).isNotEqualTo(submitted.path("snapshotHash").asText());
        assertThat(service.version(1L, versionId).path("placements")).isEqualTo(version.path("placements"));
    }

    @Test void directoryRenameCannotMoveReorderDuplicateOrUseInvalidNames() {
        ObjectNode command = command(null);
        var placements = (com.fasterxml.jackson.databind.node.ArrayNode) command.path("placements");
        ObjectNode directory = placements.addObject().put("recordId", "100").put("targetNodeKey", "base-dir-" + DIRECTORY_ID);
        assertThatThrownBy(() -> service.saveDraft(1L, command)).hasMessageContaining("原目录归属");
        directory.put("targetNodeKey", "base-item-20").put("displayOrder", 0);
        assertThatThrownBy(() -> service.saveDraft(1L, command)).hasMessageContaining("原目录归属");
        directory.remove("displayOrder");
        directory.put("displayName", " ");
        assertThatThrownBy(() -> service.saveDraft(1L, command)).hasMessageContaining("汇总文档名称");
        directory.put("displayName", "字".repeat(121));
        assertThatThrownBy(() -> service.saveDraft(1L, command)).hasMessageContaining("汇总文档名称");
        directory.put("displayName", "目录归档名称");
        placements.add(directory.deepCopy());
        assertThatThrownBy(() -> service.saveDraft(1L, command)).hasMessageContaining("只能归入一个");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_draft", Integer.class)).isZero();
    }

    @Test void summaryDisplayNameRejectsBlankAndOversizedValues() {
        ObjectNode blank = command(null);
        ((ObjectNode) blank.at("/placements/0")).put("displayName", "  ");
        assertThatThrownBy(() -> service.saveDraft(1L, blank)).hasMessageContaining("汇总文档名称");
        ObjectNode oversized = command(null);
        ((ObjectNode) oversized.at("/placements/0")).put("displayName", "字".repeat(121));
        assertThatThrownBy(() -> service.saveDraft(1L, oversized)).hasMessageContaining("汇总文档名称");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_draft", Integer.class)).isZero();
    }

    @Test void partialDisplayPlacementStillFreezesAllActualEvidence() throws Exception {
        ((ObjectNode) detail.at("/recordsByOrigin/work/0")).put("operationId", "op-1").put("formId", "node-a");
        var work = (com.fasterxml.jackson.databind.node.ArrayNode) detail.at("/recordsByOrigin/work");
        work.add(record("103", "WORK").put("operationId", "op-1").put("formId", "node-a"));
        work.add(record("104", "WORK").put("operationId", "op-1").put("formId", "node-a").put("status", "ACTIVE"));
        ((ObjectNode) detail.at("/recordsByOrigin/custom/0")).put("operationId", "op-1").put("formId", "custom-a");
        ((com.fasterxml.jackson.databind.node.ArrayNode) detail.at("/recordsByOrigin/custom"))
                .add(record("105", "CUSTOM").put("operationId", "op-1").put("formId", "custom-a"));
        ObjectNode selected = command(null);
        ((com.fasterxml.jackson.databind.node.ArrayNode) selected.path("placements")).addObject()
                .put("recordId", "102").put("targetNodeKey", "summary-dir-a");
        service.saveDraft(1L, selected);
        assertThat(service.workspace(1L).at("/draft/placements")).isEqualTo(selected.path("placements"));
        ObjectNode submitted = service.submit(1L, submitCommand(1));
        ObjectNode frozen = service.version(1L, submitted.path("id").asLong());
        assertThat(frozen.at("/version/candidates").findValuesAsText("id")).contains("100", "101", "102", "103", "104", "105");
        assertThat(frozen.path("placements").findValuesAsText("recordId")).containsExactlyInAnyOrder("100", "101", "102", "103", "104", "105");
        String frozenCandidates = frozen.at("/version/candidates").toString();
        ((ObjectNode) work.get(2)).put("status", "COMPLETED");
        assertThat(service.version(1L, submitted.path("id").asLong()).at("/version/candidates").toString()).isEqualTo(frozenCandidates);
    }

    @Test void newSourceRecordAfterDraftRequiresFreshCheckAndIsNeverSilentlyOmitted() {
        service.saveDraft(1L, command(null));
        ((com.fasterxml.jackson.databind.node.ArrayNode) detail.at("/recordsByOrigin/work")).add(record("103", "WORK"));
        assertThatThrownBy(() -> service.submit(1L, submitCommand(1)))
                .hasMessageContaining("来源记录或附件在核查后发生变化");
        ObjectNode refreshed = service.saveDraft(1L, command(1));
        ObjectNode submitted = service.submit(1L, submitCommand(refreshed.path("revision").asInt()));
        assertThat(service.version(1L, submitted.path("id").asLong()).path("placements").findValuesAsText("recordId"))
                .containsExactlyInAnyOrder("100", "101", "102", "103");
    }

    @Test void sourceCopiesMayFreezeAtSeparateDirectoriesOrInterleavedPositions() {
        ((ObjectNode) detail.at("/recordsByOrigin/work/0")).put("operationId", "op-1").put("formId", "node-a");
        var work = (com.fasterxml.jackson.databind.node.ArrayNode) detail.at("/recordsByOrigin/work");
        work.add(record("103", "WORK").put("operationId", "op-1").put("formId", "node-a"));
        work.add(record("104", "WORK").put("operationId", "op-1").put("formId", "node-a"));
        ObjectNode selected = command(null);
        var placements = selected.putArray("placements");
        placements.addObject().put("recordId", "101").put("targetNodeKey", "base-dir-" + DIRECTORY_ID).put("displayOrder", 0);
        placements.addObject().put("recordId", "102").put("targetNodeKey", "base-dir-" + DIRECTORY_ID).put("displayOrder", 1);
        placements.addObject().put("recordId", "103").put("targetNodeKey", "base-dir-" + DIRECTORY_ID).put("displayOrder", 2);
        placements.addObject().put("recordId", "104").put("targetNodeKey", "summary-dir-a").put("displayOrder", 0);
        service.saveDraft(1L, selected);
        ObjectNode submitted = service.submit(1L, submitCommand(1));
        assertThat(jdbc.queryForList("SELECT source_record_id FROM dhr_summary_evidence WHERE target_node_key=? ORDER BY display_order", Long.class, "base-dir-" + DIRECTORY_ID))
                .containsExactly(101L, 102L, 103L);
        assertThat(jdbc.queryForList("SELECT source_record_id FROM dhr_summary_evidence WHERE target_node_key='summary-dir-a'", Long.class)).containsExactly(104L);
        assertThat(service.version(1L, submitted.path("id").asLong()).path("placements").findValuesAsText("recordId"))
                .containsExactlyInAnyOrder("100", "101", "102", "103", "104");
    }

    @Test void staleScopeAndIncompleteSupplementBlockSubmission() {
        service.saveDraft(1L, command(null));
        ((ObjectNode) detail.at("/recordsByOrigin/work/0")).put("status", "ACTIVE");
        assertThatThrownBy(() -> service.submit(1L, submitCommand(1))).hasMessageContaining("来源记录或附件在核查后发生变化");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version", Integer.class)).isZero();
        ((ObjectNode) detail.at("/recordsByOrigin/work/0")).put("status", "COMPLETED");
        detail.put("productionObjectId", "10");
        jdbc.execute("CREATE TABLE production_execution(object_id BIGINT,state_json TEXT)");
        jdbc.update("INSERT INTO production_execution VALUES(10,?)", "{\"operations\":[{\"forms\":[{\"supplement\":{},\"status\":\"ACTIVE\"}]}]}");
        assertThatThrownBy(() -> service.submit(1L, submitCommand(1))).hasMessageContaining("尚未完成的补录");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version", Integer.class)).isZero();
        assertThat(service.workspace(1L).at("/draft/revision").asInt()).isEqualTo(1);
    }

    private ObjectNode command(Integer revision) {
        ObjectNode command = mapper.createObjectNode().put("expectedScopeHash", service.workspace(1L).path("sourceScopeHash").asText());
        if (revision != null) {
            command.put("revision", revision);
            var rows = jdbc.queryForList("SELECT id FROM dhr_summary_draft", Long.class);
            if (!rows.isEmpty()) command.put("draftId", rows.getFirst().toString());
        }
        command.putArray("overlayDirectories").addObject().put("key", "summary-dir-a").put("name", "附录").put("parentKey", "base-dir-" + DIRECTORY_ID);
        command.putArray("placements").addObject().put("recordId", "101").put("targetNodeKey", "base-dir-" + DIRECTORY_ID);
        return command;
    }

    private ObjectNode submitCommand(int revision) {
        var rows = jdbc.queryForList("SELECT id FROM dhr_summary_draft", Long.class);
        ObjectNode command = mapper.createObjectNode().put("expectedRevision", revision).put("expectedDraftId", rows.isEmpty() ? "stale" : rows.getFirst().toString());
        command.putObject("manualReview").put("qualityAndExceptionsReviewed", true)
                .put("sourceSignaturesReviewed", true).put("completeScopeReviewed", true)
                .put("note", "已核对质量结论、异常处置及源签署");
        return command;
    }

    private ObjectNode record(String id, String origin) {
        ObjectNode record = mapper.createObjectNode().put("id", id).put("originKind", origin).put("status", "COMPLETED");
        if (origin.equals("DIRECTORY")) record.putObject("snapshot").put("dhrItemId", "20");
        return record;
    }

    @Configuration @EnableTransactionManagement
    static class Config {
        @Bean DataSource dataSource() { return new DriverManagerDataSource("jdbc:h2:mem:dhr-summary-persistence;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", ""); }
        @Bean JdbcTemplate jdbc(DataSource source) { return new JdbcTemplate(source); }
        @Bean PlatformTransactionManager transactions(DataSource source) { return new DataSourceTransactionManager(source); }
        @Bean ObjectMapper mapper() { return new ObjectMapper(); }
        @Bean AuditEventRepository audits() { return mock(AuditEventRepository.class); }
        @Bean DhrInstanceService instances() { return mock(DhrInstanceService.class); }
        @Bean com.zencas.edhr.workflow.engine.WorkflowEngine engine() { return mock(com.zencas.edhr.workflow.engine.WorkflowEngine.class); }
        @Bean DhrAttachmentService attachments() { return mock(DhrAttachmentService.class); }
        @Bean DhrSummaryService service(JdbcTemplate jdbc, ObjectMapper mapper, DhrInstanceService instances, AuditEventRepository audits, com.zencas.edhr.workflow.engine.WorkflowEngine engine, DhrAttachmentService attachments) {
            return new DhrSummaryService(jdbc, mapper, instances, audits, new SnowflakeIdGenerator(1), engine, mock(DhrEvidenceImpactService.class), attachments);
        }
    }
}
