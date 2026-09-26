package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.zip.ZipFile;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class DhrAttachmentAndArchiveTest {
    @TempDir Path temp;
    private JdbcTemplate jdbc;
    private ObjectMapper mapper;
    private DhrAttachmentService attachments;
    private DhrArchiveService archives;
    private AuditEventRepository audits;

    @BeforeEach void setup() {
        jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:dhr-archive-" + System.nanoTime() + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", ""));
        mapper = new ObjectMapper();
        audits = mock(AuditEventRepository.class);
        var ids = new SnowflakeIdGenerator(1);
        attachments = new DhrAttachmentService(jdbc, mapper, ids, audits);
        ReflectionTestUtils.setField(attachments, "storagePath", temp.toString());
        archives = new DhrArchiveService(jdbc, mapper, attachments, audits, ids);
        jdbc.execute("CREATE TABLE dhr_instance(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),status VARCHAR(32),summary_status VARCHAR(32),dhr_no VARCHAR(64),object_no VARCHAR(64),object_type VARCHAR(32),production_object_id BIGINT)");
        jdbc.execute("INSERT INTO dhr_instance VALUES(1,'default','COMPLETED','DRAFT','DHR-1','BATCH-1','BATCH',77)");
        jdbc.execute("CREATE TABLE dhr_attachment(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),dhr_instance_id BIGINT,original_name VARCHAR(512),stored_path VARCHAR(1024),mime_type VARCHAR(64),file_size BIGINT,sha256 VARCHAR(64),source_kind VARCHAR(32),purpose VARCHAR(500),original_recorded_at TIMESTAMP,custody_location VARCHAR(500),active BOOLEAN,verification_status VARCHAR(32),verified_by VARCHAR(192),verified_at TIMESTAMP,linked_by VARCHAR(192),linked_at TIMESTAMP,unlinked_by VARCHAR(192),unlinked_at TIMESTAMP,unlink_reason VARCHAR(500))");
        AuditContext.setOperator("7", "测试操作员");
    }

    @AfterEach void clear() { AuditContext.clear(); }

    @Test void attachmentRequiresReadableBytesAndPreservesUnlinkedHistory() throws Exception {
        var fake = new MockMultipartFile("file", "fake.pdf", "application/pdf", "%PDF-not-a-document".getBytes());
        assertThatThrownBy(() -> attachments.upload(1L, fake, "EXTERNAL_REPORT", "委外检验", null, null))
                .hasMessageContaining("无法完整读取");
        var image = png();
        assertThatThrownBy(() -> attachments.upload(1L, image, "PAPER_SCAN", "历史原始记录", null, null))
                .hasMessageContaining("原记录形成时间");
        var linked = attachments.upload(1L, image, "PAPER_SCAN", "历史原始记录", LocalDateTime.of(2025, 1, 2, 12, 0), "纸档柜 A");
        Long id = Long.valueOf(linked.path("attachmentId").asText());
        assertThat(attachments.active(1L)).hasSize(1);
        assertThat(attachments.snapshot(1L).get(0).path("verificationStatus").asText()).isEqualTo("PENDING");
        attachments.verify(1L, id);
        assertThat(attachments.snapshot(1L).get(0).path("verificationStatus").asText()).isEqualTo("VERIFIED");
        attachments.unlink(1L, id, "误关联");
        assertThat(attachments.active(1L)).isEmpty();
        assertThat(Files.isRegularFile(attachments.file(1L, id))).isTrue();
        assertThatThrownBy(() -> attachments.downloadableFile(1L, id, null)).hasMessageContaining("已解除关联");
        verify(audits, times(3)).save(any());
    }

    @Test void fullAndSelectedArchivesUseOneFrozenVersionAndFailOnCorruptAttachment() throws Exception {
        var attachment = attachments.upload(1L, png(), "EXTERNAL_REPORT", "委外检验", null, null);
        Long attachmentId = Long.valueOf(attachment.path("attachmentId").asText());
        attachments.verify(1L, attachmentId);
        String attachmentJson = attachments.snapshot(1L).toString();
        var records = mapper.createArrayNode();
        records.addObject().put("id", "100").put("instanceNo", "FR-100").put("templateName", "上料检查")
                .put("status", "COMPLETED").putObject("fieldValues").put("quantity", "12");
        records.addObject().put("id", "101").put("instanceNo", "FR-101").put("templateName", "来料检查")
                .put("status", "COMPLETED").putObject("fieldValues").put("result", "通过");
        jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),dhr_instance_id BIGINT,version_no INT,status VARCHAR(32),snapshot_hash VARCHAR(64),evidence_model_version SMALLINT,candidate_snapshot TEXT,attachment_snapshot TEXT,base_directory_snapshot TEXT,overlay_directory_snapshot TEXT,check_result_snapshot TEXT,submitted_at TIMESTAMP)");
        jdbc.update("INSERT INTO dhr_summary_version VALUES(10,'default',1,1,'FORMALIZED','frozen-hash',2,?,?,?,?,'{}',TIMESTAMP '2026-01-02 12:00:00')",
                records.toString(), attachmentJson, "{\"directories\":[]}", "[]");
        jdbc.execute("CREATE TABLE dhr_summary_evidence(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),summary_version_id BIGINT,source_record_id BIGINT,target_node_key VARCHAR(128),before_node_key VARCHAR(128),display_order INT,display_name VARCHAR(120))");
        jdbc.execute("INSERT INTO dhr_summary_evidence VALUES(20,'default',10,100,'source-work',NULL,1,NULL),(21,'default',10,101,'source-custom',NULL,2,NULL)");
        jdbc.execute("CREATE TABLE audit_event(id BIGINT,tenant_id VARCHAR(64),entity_type VARCHAR(64),entity_id VARCHAR(64),action VARCHAR(32),content_before TEXT,content_after TEXT,snapshot_hash VARCHAR(64),operator_id VARCHAR(64),operator_name VARCHAR(64),created_at TIMESTAMP,data_summary VARCHAR(64))");
        jdbc.execute("INSERT INTO audit_event VALUES(30,'default','PRODUCTION_EXECUTION','77','SAVE',NULL,'{\"copyId\":\"a\"}',NULL,'7','测试操作员',TIMESTAMP '2026-01-02 11:00:00','上料 · a')");
        jdbc.execute("INSERT INTO audit_event VALUES(31,'default','PRODUCTION_EXECUTION','77','SAVE',NULL,'{\"copyId\":\"b\"}',NULL,'7','测试操作员',TIMESTAMP '2026-01-03 11:00:00','后续操作 · b')");
        jdbc.execute("CREATE TABLE dhr_summary_review(summary_version_id BIGINT,workflow_instance_id BIGINT)");
        jdbc.execute("CREATE TABLE workflow_task(id BIGINT,instance_id BIGINT,signature_id BIGINT,action VARCHAR(32),opinion VARCHAR(500))");
        jdbc.execute("CREATE TABLE signature(id BIGINT,tenant_id VARCHAR(64),target_type VARCHAR(64),target_id VARCHAR(64),meaning VARCHAR(64),signer_id VARCHAR(64),signer_name VARCHAR(64),auth_method VARCHAR(32),auth_event_ref VARCHAR(64),snapshot_hash VARCHAR(64),snapshot_data TEXT,signed_at TIMESTAMP)");
        String signedPayload = "{\"objectId\":\"77\",\"formId\":\"operation/a\",\"action\":\"SUBMIT\"}";
        String signedDigest = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(signedPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        jdbc.update("INSERT INTO signature VALUES(40,'default','PRODUCTION_EXECUTION','77','SUBMIT · operation/a','7','测试操作员','PASSWORD',NULL,?,?,TIMESTAMP '2026-01-02 11:30:00')", signedDigest, signedPayload);
        String reviewPayload = "{\"summaryVersionId\":\"10\",\"snapshotHash\":\"frozen-hash\"}";
        String reviewDigest = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(reviewPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        jdbc.update("INSERT INTO signature VALUES(41,'default','DHR_SUMMARY','10','APPROVE · 50','8','审核人','PASSWORD',NULL,?,?,TIMESTAMP '2026-01-02 13:00:00')", reviewDigest, reviewPayload);
        jdbc.execute("INSERT INTO dhr_summary_review VALUES(10,60)");
        jdbc.execute("INSERT INTO workflow_task VALUES(50,60,41,'APPROVE','同意')");
        Path full = archives.export(1L, 10L, "FULL", Set.of(), Set.of());
        try (ZipFile zip = new ZipFile(full.toFile())) {
            assertThat(zip.getEntry("forms/100.json")).isNotNull();
            assertThat(zip.getEntry("forms/101.html")).isNotNull();
            assertThat(zip.getEntry("attachments/" + attachmentId + ".png")).isNotNull();
            var manifest = mapper.readTree(zip.getInputStream(zip.getEntry("manifest.json")));
            assertThat(manifest.path("completeVersion").asBoolean()).isTrue();
            assertThat(manifest.path("formCount").asInt()).isEqualTo(2);
            assertThat(manifest.path("attachmentCount").asInt()).isEqualTo(1);
            assertThat(manifest.path("sourceAuditEvents")).hasSize(1);
            assertThat(manifest.path("sourceSignatures")).hasSize(1);
            assertThat(manifest.path("sourceSignatures").get(0).path("snapshotData").asText()).isEqualTo(signedPayload);
            assertThat(manifest.path("reviewSignatures").get(0).path("snapshotData").asText()).isEqualTo(reviewPayload);
        } finally { Files.deleteIfExists(full); }
        Path selected = archives.export(1L, 10L, "SELECTED", Set.of("100"), Set.of());
        try (ZipFile zip = new ZipFile(selected.toFile())) {
            assertThat(zip.getEntry("forms/101.json")).isNull();
            assertThat(zip.getEntry("attachments/" + attachmentId + ".png")).isNull();
            assertThat(mapper.readTree(zip.getInputStream(zip.getEntry("manifest.json"))).path("completeVersion").asBoolean()).isFalse();
        } finally { Files.deleteIfExists(selected); }
        assertThatThrownBy(() -> archives.export(1L, 10L, "SELECTED", Set.of("999"), Set.of())).hasMessageContaining("范围无效");
        jdbc.update("UPDATE signature SET snapshot_hash='wrong' WHERE id=41");
        assertThatThrownBy(() -> archives.export(1L, 10L, "FULL", Set.of(), Set.of())).hasMessageContaining("审批签署证据摘要不一致");
        jdbc.update("UPDATE signature SET snapshot_hash=? WHERE id=41", reviewDigest);
        attachments.unlink(1L, attachmentId, "更换报告");
        assertThat(attachments.downloadableFile(1L, attachmentId, 10L)).isRegularFile();
        assertThatThrownBy(() -> attachments.downloadableFile(1L, attachmentId, null)).hasMessageContaining("已解除关联");
        Files.write(attachments.file(1L, attachmentId), new byte[]{1, 2, 3});
        assertThatThrownBy(() -> archives.export(1L, 10L, "FULL", Set.of(), Set.of())).hasMessageContaining("摘要不一致");
    }

    private MockMultipartFile png() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", output);
        return new MockMultipartFile("file", "scan.png", "image/png", output.toByteArray());
    }
}
