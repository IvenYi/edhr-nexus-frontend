package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import jdk.jfr.Recording;
import jdk.jfr.consumer.RecordingFile;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.imageio.ImageIO;
import javax.sql.DataSource;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.lang.management.ManagementFactory;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;

import static org.assertj.core.api.Assertions.*;

/** Real successful summary submissions, canonical migration/constraints and native read costs. */
@EnabledIfSystemProperty(named = "edhr.audit.summaryAttachments", matches = "true")
@EnabledIfEnvironmentVariable(named = "DHR_SUMMARY_ATTACHMENT_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_summary_attachment_test_[a-z0-9_]+")
@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.liquibase.enabled=true", "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false"})
@Import(DhrSummaryAttachmentObservationPostgresTest.Config.class)
class DhrSummaryAttachmentObservationPostgresTest {
    private static final ThreadLocal<Reads> CURRENT = new ThreadLocal<>();
    @Autowired CountingJdbc jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired DhrSummaryService summaries;
    @Autowired DhrAttachmentService attachments;
    @Autowired DhrEvidenceImpactService impacts;
    @Autowired DhrReviewService reviews;
    @Autowired DhrFrozenEvidenceIntegrity integrity;
    @Autowired PlatformTransactionManager manager;
    @MockBean FormProjectionWorker worker;
    @TempDir Path directory;
    private final Map<Long, Path> originals = new LinkedHashMap<>();
    private ObjectNode expectedAttachments;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        String url = System.getenv("DHR_SUMMARY_ATTACHMENT_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_summary_attachment_test_[a-z0-9_]+")) throw new IllegalStateException("Disposable summary attachment database required");
        p.add("spring.datasource.url", () -> url); p.add("spring.datasource.username", () -> System.getenv("PGUSER"));
        p.add("spring.datasource.password", () -> ""); p.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @BeforeEach void setup() {
        jdbc.gate.set(null); originals.clear();
        jdbc.execute("TRUNCATE workflow_action_log,workflow_task,workflow_instance,workflow_edge,workflow_node,workflow_definition_version,workflow_definition,audit_event,dhr_attachment,dhr_summary_review,dhr_summary_evidence,dhr_summary_version,dhr_summary_draft,dhr_instance,form_instance_record,production_execution,production_object,work_order,product_process_version,product_process,material,form_template,route,dhr_template CASCADE");
        jdbc.update("INSERT INTO material(id,code,name) VALUES(910101,'SUMMARY-PRODUCT','汇总产品')");
        jdbc.update("INSERT INTO route(id,code,name) VALUES(910102,'SUMMARY-ROUTE','汇总路线')");
        jdbc.update("INSERT INTO route_version(id,route_id,version,code) VALUES(910103,910102,'1','SUMMARY-RV')");
        jdbc.update("INSERT INTO dhr_template(id,code,name) VALUES(910104,'SUMMARY-DHR','汇总目录')");
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES(910105,910104,'1')");
        jdbc.update("INSERT INTO product_process(id,owner_type,owner_id) VALUES(910106,'PRODUCT',910101)");
        jdbc.update("INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES(910107,910106,'1','量产','批次',910103,910105)");
        jdbc.update("INSERT INTO work_order(id,order_no,product_id,planned_quantity) VALUES(910108,'SUMMARY-WO',910101,2)");
        jdbc.update("INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity,status) VALUES(77,910108,'SUMMARY-BATCH','BATCH',910107,1,'COMPLETED'),(78,910108,'OTHER-BATCH','BATCH',910107,1,'COMPLETED')");
        jdbc.update("INSERT INTO production_execution(object_id,snapshot_json,state_json,started_at,updated_at) VALUES(77,'{\"operations\":[]}','{\"operations\":[]}',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        jdbc.update("INSERT INTO form_template(id,code,name) VALUES(910110,'SUMMARY-FORM','汇总表单')");
        jdbc.update("INSERT INTO form_template_version(id,template_id) VALUES(910111,910110)");
        jdbc.update("INSERT INTO form_instance_record(id,tenant_id,instance_no,object_id,operation_id,form_id,copy_id,template_id,version_id,snapshot_json,values_json,status,updated_at,template_name,source_type) VALUES(500001,'default','FR-20261105-500001',77,'op','form','form',910110,910111,'{\"required\":true,\"workId\":\"work\"}','{}','COMPLETED',CURRENT_TIMESTAMP,'实际源记录','PRODUCTION_EXECUTION')");
        for (long id : new long[]{1, 2}) jdbc.update("INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,status,summary_status,created_at,updated_at) VALUES(?,'default',?,?,?,'BATCH',910108,'SUMMARY-WO',910101,910107,910103,910104,910105,'{}','{\"directories\":[]}','COMPLETED','NOT_STARTED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", id, "DHR-SUMMARY-" + id, id == 1 ? 77 : 78, id == 1 ? "SUMMARY-BATCH" : "OTHER-BATCH");
        AuditContext.setOperator("41", "汇总观察员");
    }
    @AfterEach void clear() { CURRENT.remove(); AuditContext.clear(); jdbc.gate.set(null); }

    @ParameterizedTest @ValueSource(ints = {0, 1, 10, 100, 300})
    void successfulSubmitFreezesAllAttachmentsAndRealSource(int count) throws Exception {
        seedAttachments(count, 0); ObjectNode command = saveDraft();
        var result = observe("submit_" + count, Map.of("attachments", count, "fileBytes", count == 0 ? 0 : Files.size(originals.values().iterator().next())), null, () -> summaries.submit(1L, command));
        assertFrozen(result, count);
        long expectedBytes = 0; for (Path path : originals.values()) expectedBytes += Files.size(path);
        var observation = mapper.readTree(Files.readString(output().resolve("submit_" + count + ".json")));
        assertThat(observation.path("trackedLogicalReadBytes").asLong()).isEqualTo(expectedBytes);
        assertThat(observation.path("selectStatements").asLong()).isLessThanOrEqualTo(13);
    }

    @Test void fiftyMiBOriginalIsFullyReadWithoutWholeFileDigestBuffer() throws Exception {
        seedAttachments(1, 50 * 1024 * 1024); ObjectNode command = saveDraft();
        var result = observe("submit_50mib", Map.of("attachments", 1, "fileBytes", 50 * 1024 * 1024), null, () -> summaries.submit(1L, command));
        assertFrozen(result, 1);
        var observation = mapper.readTree(Files.readString(output().resolve("submit_50mib.json")));
        assertThat(observation.path("trackedLogicalReadBytes").asLong()).isEqualTo(50L * 1024 * 1024);
        assertThat(observation.path("threadAllocatedBytes").asLong()).isLessThan(25L * 1024 * 1024);
        assertThat(observation.path("selectStatements").asLong()).isLessThanOrEqualTo(13);
    }

    @Test void submissionExcludesOtherDhrTenantAndInactiveOriginals() throws Exception {
        seedAttachments(1, 0);
        jdbc.update("INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,sha256,source_kind,purpose,active,verification_status,linked_at) VALUES(2000,'default',2,'other-dhr.png','/not-read/other-dhr.png','image/png',1,repeat('0',64),'OTHER','excluded',TRUE,'VERIFIED',CURRENT_TIMESTAMP),(2001,'other',1,'other-tenant.png','/not-read/other-tenant.png','image/png',1,repeat('0',64),'OTHER','excluded',TRUE,'VERIFIED',CURRENT_TIMESTAMP),(2002,'default',1,'inactive.png','/not-read/inactive.png','image/png',1,repeat('0',64),'OTHER','excluded',FALSE,'VERIFIED',CURRENT_TIMESTAMP)");
        ObjectNode command = saveDraft();
        var result = observe("submit_scope", Map.of("attachments", 1, "excludedMissingOriginals", 3), null, () -> summaries.submit(1L, command));
        assertFrozen(result, 1);
    }

    @ParameterizedTest @ValueSource(booleans = {true, false})
    void originalAndVerificationFailuresKeepSnapshotOrder(boolean missingFirst) throws Exception {
        seedAttachments(2, 0);
        jdbc.update("UPDATE dhr_attachment SET verification_status='PENDING' WHERE id=?", missingFirst ? 1001L : 1000L);
        ObjectNode command = saveDraft(); Files.delete(originals.get(missingFirst ? 1000L : 1001L));
        observe("reject_order_" + missingFirst, Map.of("missingFirst", missingFirst), missingFirst ? "附件丢失或摘要不一致" : "尚未核验", () -> summaries.submit(1L, command));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_summary_version", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_summary_draft", Integer.class)).isEqualTo(1);
    }

    @ParameterizedTest @ValueSource(strings = {"missing", "tampered", "pending", "source_changed", "manual_review", "stale_revision"})
    void failedSubmitRetainsDraftAndDoesNotCreateFrozenOrAudit(String failure) throws Exception {
        seedAttachments(2, 0);
        if (failure.equals("pending")) jdbc.update("UPDATE dhr_attachment SET verification_status='PENDING' WHERE id=1000");
        ObjectNode command = saveDraft(); String message;
        switch (failure) {
            case "missing" -> { Files.delete(originals.get(1000L)); message = "附件丢失或摘要不一致"; }
            case "tampered" -> { Files.writeString(originals.get(1000L), "modified"); message = "附件丢失或摘要不一致"; }
            case "pending" -> message = "尚未核验";
            case "source_changed" -> { jdbc.update("UPDATE dhr_attachment SET purpose='changed after draft' WHERE id=1000"); message = "来源记录或附件在核查后发生变化"; }
            case "manual_review" -> { command.remove("manualReview"); message = "请确认质量结论"; }
            case "stale_revision" -> { command.put("expectedRevision", 0); message = "汇总草稿已被其他操作更新"; }
            default -> throw new IllegalArgumentException(failure);
        }
        observe("reject_" + failure, Map.of("failure", failure), message, () -> summaries.submit(1L, command));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_summary_version", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_summary_draft", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance WHERE id=1", String.class)).isEqualTo("DRAFT");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE entity_type='DHR_SUMMARY_VERSION' AND action='SUBMIT'", Integer.class)).isZero();
    }

    @ParameterizedTest @ValueSource(booleans = {true, false})
    void parentLockRechecksUnlinkAfterSuccessfulOrRolledBackSubmit(boolean succeeds) throws Exception {
        seedAttachments(1, 0); ObjectNode command = saveDraft();
        if (!succeeds) command.remove("manualReview");
        var reached = new CountDownLatch(1); var release = new CountDownLatch(1); var executor = Executors.newFixedThreadPool(2);
        jdbc.gate.set(() -> { reached.countDown(); try { assertThat(release.await(15, TimeUnit.SECONDS)).isTrue(); }
            catch (InterruptedException ex) { Thread.currentThread().interrupt(); throw new IllegalStateException(ex); } });
        try {
            Future<ObjectNode> submit = executor.submit(() -> { AuditContext.setOperator("41", "汇总观察员"); try {
                return observe("lock_submit_" + succeeds, Map.of("successfulSubmit", succeeds), succeeds ? null : "请确认质量结论", () -> summaries.submit(1L, command));
            } finally { AuditContext.clear(); } });
            assertThat(reached.await(10, TimeUnit.SECONDS)).isTrue();
            Future<?> unlink = executor.submit(() -> { AuditContext.setOperator("42", "关联观察员"); try {
                Supplier<ObjectNode> action = () -> { attachments.unlink(1L, 1000L, "lock observation"); return mapper.createObjectNode(); };
                return observe("lock_unlink_" + succeeds, Map.of("successfulSubmit", succeeds), succeeds ? "当前 DHR 不能修改附件" : null, action);
            } finally { AuditContext.clear(); } });
            boolean waiting = false; long until = System.nanoTime() + TimeUnit.SECONDS.toNanos(10);
            while (System.nanoTime() < until) {
                waiting = Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND application_name=? AND wait_event_type='Lock')", Boolean.class, "audit_summary_lock_unlink_" + succeeds));
                if (waiting) break; Thread.sleep(20);
            }
            assertThat(waiting).isTrue(); assertThat(jdbc.queryForObject("SELECT active FROM dhr_attachment WHERE id=1000", Boolean.class)).isTrue();
            release.countDown(); ObjectNode result = submit.get(20, TimeUnit.SECONDS); unlink.get(20, TimeUnit.SECONDS);
            if (succeeds) assertFrozen(result, 1);
            assertThat(jdbc.queryForObject("SELECT active FROM dhr_attachment WHERE id=1000", Boolean.class)).isEqualTo(succeeds);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE entity_type='DHR_ATTACHMENT' AND action='UNLINK'", Integer.class)).isEqualTo(succeeds ? 0 : 1);
            assertThat(originals.get(1000L)).exists();
            write("parent-lock-" + succeeds + ".json", Map.of("actualPgLockWait", true, "successfulSubmit", succeeds, "unlinkRejectedAfterFormalization", succeeds, "originalRetained", true));
        } finally { release.countDown(); executor.shutdownNow(); jdbc.gate.set(null); }
    }

    @Test void existingIndexesBoundActiveScopeInMixedHistory() throws Exception {
        seedAttachments(300, 0);
        jdbc.update("INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,sha256,source_kind,purpose,active,verification_status,linked_at) SELECT 400000+g,'default',CASE WHEN g<=5000 THEN 1 ELSE 2 END,'history.png','/not-read/history.png','image/png',1,repeat('0',64),'OTHER','index fixture',CASE WHEN g<=5000 THEN FALSE ELSE g%2=0 END,'VERIFIED',CURRENT_TIMESTAMP FROM generate_series(1,10000) g");
        jdbc.execute("ANALYZE dhr_attachment");
        assertThat(attachments.snapshot(1L)).hasSize(300);
        var definitions = jdbc.queryForList("SELECT indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='dhr_attachment' ORDER BY indexname");
        String active = jdbc.queryForObject("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT * FROM dhr_attachment WHERE tenant_id='default' AND dhr_instance_id=? AND active=TRUE ORDER BY linked_at,id", String.class, 1L);
        String identity = jdbc.queryForObject("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) SELECT stored_path,sha256 FROM dhr_attachment WHERE tenant_id='default' AND dhr_instance_id=? AND id=?", String.class, 1L, 1000L);
        write("existing-index-plans.json", Map.of("unrelatedOrInactive", 10000, "activeInScope", 300, "indexes", definitions, "activePlan", mapper.readTree(active), "identityPlan", mapper.readTree(identity), "limits", "Synthetic complete-schema distribution; not production SLA. Plans are not service request SQL."));
    }

    @ParameterizedTest @ValueSource(ints = {0, 1, 100, 300})
    void frozenAttachmentComparisonObservesAllOriginalsWithoutWriting(int count) throws Exception {
        seedAttachments(count, 0); long version = summaries.submit(1L, saveDraft()).path("id").asLong();
        var before = contentDigests();
        for (boolean lock : new boolean[]{false, true}) {
            String name = "impact_count_" + count + "_" + lock;
            var result = observe(name, Map.of("attachments", count, "lock", lock, "entry", "changes"), null,
                    () -> mapper.createObjectNode().set("evidenceChanges", impacts.changes(version, lock)));
            assertThat(result.path("evidenceChanges")).isEmpty();
            var data = mapper.readTree(Files.readString(output().resolve(name + ".json")));
            assertThat(data.path("trackedLogicalReadBytes").asLong()).isEqualTo(count == 0 ? 0 : (long) count * Files.size(directory.resolve("original-0.png")));
            assertThat(data.path("selectStatements").asInt()).isEqualTo(6);
            assertReadState(name, before);
        }
    }

    @ParameterizedTest @ValueSource(strings = {"tampered", "missing", "pending", "new", "unlinked", "metadata", "outside", "source_changed"})
    void frozenComparisonReportsChangesWithoutRepairingEvidence(String change) throws Exception {
        seedAttachments(2, 0); long version = summaries.submit(1L, saveDraft()).path("id").asLong();
        String changedId = "1000";
        switch (change) {
            case "tampered" -> Files.write(originals.get(1000L), new byte[]{1, 2, 3});
            case "missing" -> Files.delete(originals.get(1000L));
            case "pending" -> jdbc.update("UPDATE dhr_attachment SET verification_status='PENDING' WHERE id=1000");
            case "unlinked" -> jdbc.update("UPDATE dhr_attachment SET active=FALSE WHERE id=1000");
            case "metadata" -> jdbc.update("UPDATE dhr_attachment SET sha256=repeat('0',64) WHERE id=1000");
            case "new" -> {
                jdbc.update("INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,sha256,source_kind,purpose,active,verification_status,linked_at) VALUES(1002,'default',1,'new.png','/not-read/new.png','image/png',1,repeat('0',64),'OTHER','new member',TRUE,'VERIFIED',CURRENT_TIMESTAMP)");
                changedId = "1002";
            }
            case "outside" -> jdbc.update("INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,sha256,source_kind,purpose,active,verification_status,linked_at) VALUES(2000,'default',2,'foreign-dhr.png','/not-read/dhr.png','image/png',1,repeat('0',64),'OTHER','excluded',TRUE,'VERIFIED',CURRENT_TIMESTAMP),(2001,'other',1,'foreign-tenant.png','/not-read/tenant.png','image/png',1,repeat('0',64),'OTHER','excluded',TRUE,'VERIFIED',CURRENT_TIMESTAMP),(2002,'default',1,'inactive.png','/not-read/inactive.png','image/png',1,repeat('0',64),'OTHER','excluded',FALSE,'VERIFIED',CURRENT_TIMESTAMP)");
            case "source_changed" -> jdbc.update("UPDATE form_instance_record SET values_json='{\"changed\":true}' WHERE id=500001");
            default -> throw new IllegalArgumentException(change);
        }
        var before = contentDigests();
        for (boolean lock : new boolean[]{false, true}) {
            String name = "impact_change_" + change + "_" + lock;
            var result = observe(name, Map.of("change", change, "lock", lock), null,
                    () -> mapper.createObjectNode().set("evidenceChanges", impacts.changes(version, lock)));
            var changes = result.path("evidenceChanges");
            if (change.equals("outside")) assertThat(changes).isEmpty();
            else {
                assertThat(changes).hasSize(1);
                assertThat(changes.get(0).path(change.equals("source_changed") ? "recordId" : "attachmentId").asText())
                        .isEqualTo(change.equals("source_changed") ? "500001" : changedId);
            }
            assertReadState(name, before);
        }
    }

    @Test void largeOriginalReadCostsAreObservedThroughRealFrozenReviewTask() throws Exception {
        seedReview(); seedAttachments(1, 50 * 1024 * 1024);
        var submitted = summaries.submit(1L, saveDraft()); long version = submitted.path("id").asLong();
        assertThat(submitted.path("status").asText()).isEqualTo("PENDING_REVIEW");
        long task = jdbc.queryForObject("SELECT id FROM workflow_task", Long.class);
        String frozenAttachments = jdbc.queryForObject("SELECT attachment_snapshot::text FROM dhr_summary_version WHERE id=?", String.class, version);
        var before = contentDigests();
        var versionRead = observe("impact_50mib_version", Map.of("entry", "version", "fileBytes", 50 * 1024 * 1024), null, () -> summaries.version(1L, version));
        var detail = observe("impact_50mib_review", Map.of("entry", "reviewDetail", "fileBytes", 50 * 1024 * 1024), null, () -> reviews.detail(task));
        assertThat(versionRead.path("evidenceChanges")).isEmpty(); assertThat(detail.path("evidenceChanges")).isEmpty();
        assertThat(detail.path("canAct").asBoolean()).isTrue();
        assertReadState("impact_50mib_read", before);
        for (String name : List.of("impact_50mib_version", "impact_50mib_review")) {
            var data = mapper.readTree(Files.readString(output().resolve(name + ".json")));
            assertThat(data.path("trackedLogicalReadBytes").asLong()).isGreaterThanOrEqualTo(50L * 1024 * 1024);
        }
        // Approval uses its own locked comparison; a read response never authorizes stale evidence.
        Files.copy(originals.get(1000L), directory.resolve("replacement.png"));
        Files.write(originals.get(1000L), new byte[]{1, 2, 3});
        var command = mapper.createObjectNode().put("expectedSnapshotHash", submitted.path("snapshotHash").asText()).put("action", "APPROVE").put("opinion", "isolated stale-file observation");
        var afterFileChange = contentDigests();
        observe("impact_stale_approve", Map.of("entry", "approve", "fileChangedAfterRead", true), "不能按过时证据批准", () -> reviews.act(task, command));
        assertReadState("impact_stale_approve", afterFileChange);
        Files.copy(directory.resolve("replacement.png"), originals.get(1000L), StandardCopyOption.REPLACE_EXISTING);
        var approved = observe("impact_50mib_approve", Map.of("entry", "approve", "originalRestored", true), null, () -> reviews.act(task, command));
        assertThat(approved.path("outcome").asText()).isEqualTo("APPROVED");
        assertThat(jdbc.queryForObject("SELECT status FROM workflow_task WHERE id=?", String.class, task)).isEqualTo("COMPLETED");
        assertThat(jdbc.queryForObject("SELECT attachment_snapshot::text FROM dhr_summary_version WHERE id=?", String.class, version))
                .isEqualTo(frozenAttachments);
        write("impact-frozen-review.json", Map.of("submitted", submitted, "taskId", task, "configuredSignatureRequired", false,
                "frozenAttachmentsBefore", mapper.readTree(frozenAttachments), "frozenAttachmentsAfter", mapper.readTree(jdbc.queryForObject("SELECT attachment_snapshot::text FROM dhr_summary_version WHERE id=?", String.class, version)), "approved", approved));
    }

    @ParameterizedTest @ValueSource(strings = {"detail", "approve", "stale_hash"})
    void rejectedReviewReadsDoNotReadOriginalsOrWriteBusinessState(String entry) throws Exception {
        seedReview(); seedAttachments(1, 0);
        var submitted = summaries.submit(1L, saveDraft()); long task = jdbc.queryForObject("SELECT id FROM workflow_task", Long.class);
        var command = mapper.createObjectNode().put("expectedSnapshotHash", entry.equals("stale_hash") ? "wrong-hash" : submitted.path("snapshotHash").asText()).put("action", "APPROVE");
        if (!entry.equals("stale_hash")) AuditContext.setOperator("910142", "其他人员");
        var before = contentDigests(); String name = "impact_denied_" + entry;
        String message = entry.equals("detail") ? "无此 DHR 审批任务权限" : entry.equals("approve") ? "当前用户不是审批处理人" : "审批版本已变化";
        observe(name, Map.of("entry", entry), message, () -> entry.equals("detail") ? reviews.detail(task) : reviews.act(task, command));
        assertThat(mapper.readTree(Files.readString(output().resolve(name + ".json"))).path("trackedLogicalReadBytes").asLong()).isZero();
        assertReadState(name, before);
    }

    private void seedReview() {
        jdbc.update("DELETE FROM user_account WHERE id IN (910141,910142)");
        jdbc.update("INSERT INTO user_account(id,tenant_id,username,display_name,password_hash,status) VALUES(910141,0,'impact-reviewer','证据审核员','unused-test-password-hash','ACTIVE'),(910142,0,'impact-other','其他人员','unused-test-password-hash','ACTIVE')");
        AuditContext.setOperator("910141", "证据审核员");
        jdbc.update("INSERT INTO workflow_definition(id,type,business_type,name,code,status) VALUES(910120,'RECORD_CONTROL','DHR_SUMMARY','证据观察审批','IMPACT-REVIEW','ACTIVE')");
        jdbc.update("INSERT INTO workflow_definition_version(id,definition_id,version_number,status,is_current,nodes_json,edges_json) VALUES(910121,910120,1,'PUBLISHED',true,'[]','[]')");
        jdbc.update("INSERT INTO workflow_node(id,version_id,node_type,name,properties) VALUES(910122,910121,'START','开始','{}'),(910123,910121,'APPROVAL','审批','{\"approverSubjects\":[{\"type\":\"USER\",\"id\":\"910141\"}]}'),(910124,910121,'END','结束','{}')");
        jdbc.update("INSERT INTO workflow_edge(id,version_id,source_node_id,target_node_id) VALUES(910125,910121,910122,910123),(910126,910121,910123,910124)");
        jdbc.update("UPDATE dhr_instance SET dhr_review_mode='REQUIRED',dhr_review_workflow_definition_id=910120,dhr_review_workflow_version_id=910121 WHERE id=1");
    }

    private Map<String, String> contentDigests() {
        Map<String, String> result = new LinkedHashMap<>();
        for (String table : List.of("dhr_instance", "dhr_summary_version", "dhr_summary_evidence", "dhr_summary_review", "dhr_attachment", "form_instance_record", "workflow_instance", "workflow_task", "workflow_action_log", "audit_event", "signature"))
            result.put(table, jdbc.queryForObject("SELECT md5(COALESCE(string_agg(row_json,E'\\n' ORDER BY row_json),'')) FROM (SELECT to_jsonb(t)::text AS row_json FROM " + table + " t) rows", String.class));
        return result;
    }

    private void assertReadState(String name, Map<String, String> before) throws Exception {
        var after = contentDigests();
        write(name + "-state.json", Map.of("before", before, "after", after, "identical", before.equals(after)));
        assertThat(after).isEqualTo(before);
    }

    private void seedAttachments(int count, int paddedBytes) throws Exception {
        byte[] png;
        try (var out = new ByteArrayOutputStream()) { assertThat(ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", out)).isTrue(); png = out.toByteArray(); }
        for (int i = 0; i < count; i++) {
            Path file = directory.resolve("original-" + i + ".png"); var digest = MessageDigest.getInstance("SHA-256");
            try (var out = Files.newOutputStream(file)) {
                out.write(png); digest.update(png); byte[] buffer = new byte[65536];
                for (int remaining = Math.max(paddedBytes - png.length, 0); remaining > 0;) {
                    int length = Math.min(remaining, buffer.length); out.write(buffer, 0, length); digest.update(buffer, 0, length); remaining -= length;
                }
            }
            long id = 1000L + i; originals.put(id, file);
            jdbc.update("INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,sha256,source_kind,purpose,active,verification_status,linked_by,linked_at,verified_by,verified_at) VALUES(?,'default',1,?,?,'image/png',?,?,'OTHER','native summary observation',TRUE,'VERIFIED','41','2026-01-01','42','2026-01-02')", id, file.getFileName().toString(), file.toString(), Files.size(file), HexFormat.of().formatHex(digest.digest()));
        }
    }

    private ObjectNode saveDraft() {
        var workspace = summaries.workspace(1L); expectedAttachments = mapper.createObjectNode(); expectedAttachments.set("items", workspace.path("attachments").deepCopy());
        var command = mapper.createObjectNode().put("expectedScopeHash", workspace.path("sourceScopeHash").asText()); command.putArray("overlayDirectories"); command.putArray("placements");
        var draft = summaries.saveDraft(1L, command);
        var submit = mapper.createObjectNode().put("expectedDraftId", draft.path("id").asText()).put("expectedRevision", draft.path("revision").asInt());
        submit.putObject("manualReview").put("qualityAndExceptionsReviewed", true).put("sourceSignaturesReviewed", true).put("completeScopeReviewed", true).put("note", "隔离原生读取观察，全部证据已人工确认");
        return submit;
    }

    private void assertFrozen(ObjectNode result, int count) throws Exception {
        long version = result.path("id").asLong(); assertThat(result.path("status").asText()).isEqualTo("FORMALIZED");
        var row = jdbc.queryForMap("SELECT attachment_snapshot,candidate_snapshot,check_result_snapshot,submitted_by_id FROM dhr_summary_version WHERE id=?", version);
        integrity.verify(version, mapper.readTree(row.get("candidate_snapshot").toString()));
        var frozen = mapper.readTree(row.get("attachment_snapshot").toString());
        assertThat(row.get("attachment_snapshot").toString()).isEqualTo(expectedAttachments.path("items").toString()); assertThat(frozen).hasSize(count);
        for (var attachment : frozen) assertThat(attachment.has("stored_path")).isFalse();
        assertThat(mapper.readTree(row.get("candidate_snapshot").toString())).hasSize(1);
        assertThat(mapper.readTree(row.get("check_result_snapshot").toString()).path("verifiedAttachmentCount").asInt()).isEqualTo(count);
        assertThat(row.get("submitted_by_id")).isEqualTo("41");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_summary_draft", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_summary_evidence WHERE summary_version_id=?", Integer.class, version)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT summary_status FROM dhr_instance WHERE id=1", String.class)).isEqualTo("FORMALIZED");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE entity_type='DHR_SUMMARY_VERSION' AND action='SUBMIT' AND entity_id=?", Integer.class, Long.toString(version))).isEqualTo(1);
    }

    private ObjectNode observe(String name, Map<String, Object> data, String expectedRejection, Supplier<ObjectNode> action) throws Exception {
        var read = new Reads(); ObjectNode result = null; RuntimeException rejection = null;
        var allocation = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean(); assertThat(allocation.isThreadAllocatedMemorySupported()).isTrue(); allocation.setThreadAllocatedMemoryEnabled(true);
        long allocated; long elapsed; long heapBefore; long heapAfter; long threadId = Thread.currentThread().threadId(); Path jfrPath = output().resolve(name + ".jfr");
        try (var jfr = new Recording()) {
            jfr.enable("jdk.FileRead").withThreshold(Duration.ZERO); jfr.start();
            heapBefore = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed(); long before = allocation.getThreadAllocatedBytes(Thread.currentThread().threadId()); long start = System.nanoTime(); CURRENT.set(read);
            try { result = new TransactionTemplate(manager).execute(status -> { jdbc.execute("SET LOCAL application_name='audit_summary_" + name + "'"); return action.get(); }); }
            catch (BusinessException | org.springframework.security.access.AccessDeniedException ex) { rejection = ex; }
            finally { CURRENT.remove(); }
            allocated = allocation.getThreadAllocatedBytes(Thread.currentThread().threadId()) - before; elapsed = System.nanoTime() - start;
            heapAfter = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed(); jfr.stop(); jfr.dump(jfrPath);
        }
        Set<String> tracked = new HashSet<>(); originals.values().forEach(p -> tracked.add(p.toString())); long bytes = 0; int events = 0;
        for (var event : RecordingFile.readAllEvents(jfrPath)) if (event.getEventType().getName().equals("jdk.FileRead") && event.getThread().getJavaThreadId() == threadId && tracked.contains(event.getString("path"))) { bytes += event.getLong("bytesRead"); events++; }
        var event = mapper.createObjectNode().put("name", name).put("applicationName", "audit_summary_" + name).put("measuredThreadId", threadId).put("elapsedNanos", elapsed).put("threadAllocatedBytes", allocated)
                .put("heapBefore", heapBefore).put("heapAfter", heapAfter).put("trackedLogicalReadBytes", bytes).put("trackedReadEvents", events).put("rejection", rejection == null ? null : rejection.getMessage());
        event.set("data", mapper.valueToTree(data)); event.set("jdbcSql", mapper.valueToTree(read.jdbc)); event.set("hibernateSql", mapper.valueToTree(read.hibernate));
        event.set("result", result == null ? mapper.nullNode() : result);
        event.put("selectStatements", java.util.stream.Stream.concat(read.jdbc.stream(), read.hibernate.stream()).filter(sql -> sql.stripLeading().toLowerCase(Locale.ROOT).startsWith("select")).count());
        write(name + ".json", event);
        if (expectedRejection == null) assertThat(rejection).isNull(); else assertThat(rejection).isNotNull().hasMessageContaining(expectedRejection);
        return result;
    }

    private Path output() throws Exception { Path p = Path.of(System.getProperty("edhr.audit.summaryAttachmentOutput")); Files.createDirectories(p); return p; }
    private void write(String name, Object value) throws Exception { mapper.writerWithDefaultPrettyPrinter().writeValue(output().resolve(name).toFile(), value); }
    private static class Reads { final List<String> jdbc = new ArrayList<>(); final List<String> hibernate = new ArrayList<>(); }
    static class CountingJdbc extends JdbcTemplate {
        final AtomicReference<Runnable> gate = new AtomicReference<>();
        CountingJdbc(DataSource source) { super(source); }
        @Override public <T> T query(PreparedStatementCreator creator, PreparedStatementSetter setter, ResultSetExtractor<T> extractor) {
            String sql = creator instanceof SqlProvider provider ? provider.getSql() : "<unknown>";
            return super.query(creator, setter, rs -> {
                T result = extractor.extractData(rs); if (CURRENT.get() != null) CURRENT.get().jdbc.add(sql);
                if (CURRENT.get() != null && sql.startsWith("SELECT * FROM dhr_attachment ")) { Runnable pause = gate.getAndSet(null); if (pause != null) pause.run(); }
                return result;
            });
        }
    }
    @TestConfiguration static class Config {
        @Bean CountingJdbc countingJdbc(DataSource source) { return new CountingJdbc(source); }
        @Bean HibernatePropertiesCustomizer inspector() { return p -> p.put("hibernate.session_factory.statement_inspector", (StatementInspector) sql -> { if (CURRENT.get() != null) CURRENT.get().hibernate.add(sql); return sql; }); }
    }
}
