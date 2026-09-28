package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
    private com.zencas.edhr.compliance.repository.FileObjectRepository formFiles;

    @BeforeEach void setup() {
        jdbc = new JdbcTemplate(new DriverManagerDataSource("jdbc:h2:mem:dhr-archive-" + System.nanoTime() + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", ""));
        mapper = new ObjectMapper();
        audits = mock(AuditEventRepository.class);
        var ids = new SnowflakeIdGenerator(1);
        attachments = new DhrAttachmentService(jdbc, mapper, ids, audits);
        ReflectionTestUtils.setField(attachments, "storagePath", temp.toString());
        formFiles = mock(com.zencas.edhr.compliance.repository.FileObjectRepository.class);
        archives = new DhrArchiveService(jdbc, mapper, attachments, audits, ids, new DhrPdfRenderer(mapper), new DhrFormFiles(formFiles), new DhrFrozenEvidenceIntegrity(jdbc, mapper));
        jdbc.execute("CREATE TABLE dhr_instance(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),status VARCHAR(32),summary_status VARCHAR(32),dhr_no VARCHAR(64),object_no VARCHAR(64),object_type VARCHAR(32),production_object_id BIGINT)");
        jdbc.execute("INSERT INTO dhr_instance VALUES(1,'default','COMPLETED','DRAFT','DHR-1','BATCH-1','BATCH',77)");
        jdbc.execute("CREATE TABLE dhr_attachment(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),dhr_instance_id BIGINT,original_name VARCHAR(512),stored_path VARCHAR(1024),mime_type VARCHAR(128),file_size BIGINT,sha256 VARCHAR(64),source_kind VARCHAR(32),purpose VARCHAR(500),original_recorded_at TIMESTAMP,custody_location VARCHAR(500),active BOOLEAN,verification_status VARCHAR(32),verified_by VARCHAR(192),verified_at TIMESTAMP,linked_by VARCHAR(192),linked_at TIMESTAMP,unlinked_by VARCHAR(192),unlinked_at TIMESTAMP,unlink_reason VARCHAR(500))");
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

    @ParameterizedTest
    @ValueSource(strings = {"pdf", "png", "jpg", "doc", "docx", "xls", "xlsx"})
    void fullAndSelectedArchivesUseOneFrozenVersionAndFailOnCorruptAttachment(String extension) throws Exception {
        var original = attachmentFile(extension);
        var attachment = attachments.upload(1L, original, "EXTERNAL_REPORT", "委外检验", null, null);
        Long attachmentId = Long.valueOf(attachment.path("attachmentId").asText());
        assertThat(Files.readAllBytes(attachments.downloadableFile(1L, attachmentId, null))).isEqualTo(original.getBytes());
        assertThat(attachments.snapshot(1L).get(0).path("name").asText()).isEqualTo(original.getOriginalFilename());
        var response = new com.zencas.edhr.production.controller.DhrAttachmentController(attachments).download(1L, attachmentId, null);
        assertThat(response.getHeaders().getContentDisposition().getFilename()).isEqualTo(original.getOriginalFilename());
        assertThat(response.getHeaders().getContentDisposition().getType()).isEqualTo("attachment");
        assertThat(response.getHeaders().getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(response.getBody().getInputStream().readAllBytes()).isEqualTo(original.getBytes());
        attachments.verify(1L, attachmentId);
        String attachmentJson = attachments.snapshot(1L).toString();
        var records = mapper.createArrayNode();
        records.addObject().put("originKind", "WORK").put("id", "100").put("instanceNo", "FR-100").put("templateName", "上料检查")
                .put("status", "COMPLETED").putObject("fieldValues").put("quantity", "12");
        records.addObject().put("originKind", "CUSTOM").put("id", "101").put("instanceNo", "FR-101").put("templateName", "来料检查")
                .put("status", "COMPLETED").putObject("fieldValues").put("result", "通过");
        records.forEach(record -> ((com.fasterxml.jackson.databind.node.ObjectNode) record).set("snapshot", DhrPrintTestFixtures.record(mapper, record.path("id").asText()).path("snapshot")));
        byte[] nativeBytes = "NATIVE_ATTACHMENT_BODY_NOT_IN_PDF".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        Path nativeFile = temp.resolve("form-original.xls"); Files.write(nativeFile, nativeBytes);
        when(formFiles.findById(501L)).thenReturn(java.util.Optional.of(com.zencas.edhr.compliance.entity.FileObject.builder()
                .id(501L).tenantId("default").targetType("PRODUCTION_EXECUTION").targetId("77").originalName("原始检测.xls")
                .mimeType("application/vnd.ms-excel").storedPath(nativeFile.toString()).fileSize((long) nativeBytes.length)
                .md5Hash(java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("MD5").digest(nativeBytes)))
                .createdAt(LocalDateTime.of(2026, 1, 1, 12, 0)).build()));
        ((com.fasterxml.jackson.databind.node.ObjectNode) records.get(0).path("fieldValues")).putArray("files").addObject().put("fileId", "501").put("originalName", "原始检测.xls");
        String nativePath = "作业表单/上料检查_FR-100_100/附件/501_原始检测.xls";
        jdbc.execute("CREATE TABLE dhr_summary_version(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),dhr_instance_id BIGINT,version_no INT,status VARCHAR(32),review_mode VARCHAR(32),review_workflow_definition_id BIGINT,review_workflow_version_id BIGINT,snapshot_hash VARCHAR(64),candidate_snapshot TEXT,attachment_snapshot TEXT,base_directory_snapshot TEXT,overlay_directory_snapshot TEXT,check_result_snapshot TEXT,submitted_at TIMESTAMP)");
        jdbc.update("INSERT INTO dhr_summary_version VALUES(10,'default',1,1,'FORMALIZED','NONE',NULL,NULL,'pending',?,?,?,?,'{}',TIMESTAMP '2026-01-02 12:00:00')",
                records.toString(), attachmentJson, "{\"directories\":[]}", "[]");
        jdbc.execute("CREATE TABLE dhr_summary_evidence(id BIGINT PRIMARY KEY,tenant_id VARCHAR(64),summary_version_id BIGINT,source_record_id BIGINT,target_node_key VARCHAR(128),before_node_key VARCHAR(128),display_order INT,display_name VARCHAR(120),source_snapshot TEXT,source_hash VARCHAR(64))");
        for (int index = 0; index < records.size(); index++) {
            String snapshot = records.get(index).toString();
            String digest = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(snapshot.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
            jdbc.update("INSERT INTO dhr_summary_evidence VALUES(?,?,?,?,?,NULL,?,?,?,?)", 20 + index, "default", 10, 100 + index,
                    index == 0 ? "source-work" : "source-custom", index + 1, null, snapshot, digest);
        }
        var frozen = mapper.createObjectNode().put("dhrInstanceId", 1L).put("versionNo", 1)
                .put("status", "FORMALIZED").put("reviewMode", "NONE");
        frozen.putObject("reviewBinding").put("mode", "NONE");
        frozen.set("baseDirectory", mapper.readTree("{\"directories\":[]}"));
        frozen.set("overlayDirectories", mapper.createArrayNode());
        frozen.set("candidates", records.deepCopy());
        frozen.set("attachments", mapper.readTree(attachmentJson));
        frozen.set("checkResult", mapper.createObjectNode());
        frozen.putArray("placements")
                .addObject().put("recordId", "100").put("targetNodeKey", "source-work").put("displayOrder", 1);
        frozen.withArray("placements")
                .addObject().put("recordId", "101").put("targetNodeKey", "source-custom").put("displayOrder", 2);
        String frozenHash = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest(frozen.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        jdbc.update("UPDATE dhr_summary_version SET snapshot_hash=? WHERE id=10", frozenHash);
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
            assertThat(zip.getInputStream(zip.getEntry(nativePath)).readAllBytes()).isEqualTo(nativeBytes);
            try (var pdf = org.apache.pdfbox.Loader.loadPDF(zip.getInputStream(zip.getEntry("完整DHR_DHR-1_V1.pdf")).readAllBytes())) {
                assertThat(pdf.getNumberOfPages()).isEqualTo(3); // index + two forms, never attachment pages
                String text = java.text.Normalizer.normalize(new org.apache.pdfbox.text.PDFTextStripper().getText(pdf), java.text.Normalizer.Form.NFKC);
                assertThat(text).contains("上料检查", "来料检查", "原始检测.xls").doesNotContain("NATIVE_ATTACHMENT_BODY_NOT_IN_PDF");
            }
            assertThat(zip.getEntry("追溯资料/表单快照/100.json")).isNotNull();
            assertThat(zip.getEntry("自定义表单/来料检查_FR-101_101/来料检查_FR-101_101.pdf")).isNotNull();
            assertThat(zip.getInputStream(zip.getEntry("汇总附件/" + attachmentId + "_" + original.getOriginalFilename())).readAllBytes()).isEqualTo(original.getBytes());
            var manifest = mapper.readTree(zip.getInputStream(zip.getEntry("追溯资料/清单.json")));
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
            assertThat(zip.getInputStream(zip.getEntry(nativePath)).readAllBytes()).isEqualTo(nativeBytes);
            assertThat(zip.getEntry("追溯资料/表单快照/101.json")).isNull();
            assertThat(zip.getEntry("汇总附件/" + attachmentId + "_" + original.getOriginalFilename())).isNull();
            var subset = mapper.readTree(zip.getInputStream(zip.getEntry("追溯资料/清单.json")));
            assertThat(subset.path("completeVersion").asBoolean()).isFalse();
            assertThat(subset.path("sourceAuditEvents")).hasSize(1);
            assertThat(subset.path("sourceAuditEvents").get(0).path("id").asText()).isEqualTo("30");
            assertThat(subset.path("sourceAuditEvents").get(0).has("after")).isFalse();
            assertThat(subset.path("sourceSignatures")).hasSize(1);
            assertThat(subset.path("sourceSignatures").get(0).path("snapshotHash").asText()).isEqualTo(signedDigest);
            assertThat(subset.path("sourceSignatures").get(0).has("snapshotData")).isFalse();
            assertThat(subset.path("sourceTraceBoundary").asText()).contains("NOT_INSTANCE_EXCLUSIVE", "RAW_PAYLOADS_EXCLUDED");
            assertThat(subset.path("selectedSourceRecords")).hasSize(1);
            assertThat(subset.path("selectedSourceRecords").get(0).path("recordId").asText()).isEqualTo("100");
        } finally { Files.deleteIfExists(selected); }
        Path mixed = archives.export(1L, 10L, "SELECTED", Set.of("101"), Set.of(attachmentId.toString()));
        try (ZipFile zip = new ZipFile(mixed.toFile())) {
            assertThat(zip.getEntry(nativePath)).isNull();
            assertThat(zip.getEntry("追溯资料/表单快照/100.json")).isNull();
            assertThat(zip.getEntry("追溯资料/表单快照/101.json")).isNotNull();
            assertThat(zip.getInputStream(zip.getEntry("汇总附件/" + attachmentId + "_" + original.getOriginalFilename())).readAllBytes()).isEqualTo(original.getBytes());
            var manifest = mapper.readTree(zip.getInputStream(zip.getEntry("追溯资料/清单.json")));
            assertThat(manifest.path("completeVersion").asBoolean()).isFalse();
            assertThat(manifest.path("formCount").asInt()).isEqualTo(1);
            assertThat(manifest.path("attachmentCount").asInt()).isEqualTo(1);
        } finally { Files.deleteIfExists(mixed); }
        Path attachmentOnly = archives.export(1L, 10L, "SELECTED", Set.of(), Set.of(attachmentId.toString()));
        try (ZipFile zip = new ZipFile(attachmentOnly.toFile())) {
            assertThat(zip.getEntry("追溯资料/表单快照/100.json")).isNull();
            assertThat(zip.getEntry("追溯资料/表单快照/101.json")).isNull();
            assertThat(zip.getInputStream(zip.getEntry("汇总附件/" + attachmentId + "_" + original.getOriginalFilename())).readAllBytes()).isEqualTo(original.getBytes());
        } finally { Files.deleteIfExists(attachmentOnly); }
        if ("pdf".equals(extension)) {
            var altered = records.deepCopy();
            ((com.fasterxml.jackson.databind.node.ObjectNode) altered.get(0).path("fieldValues")).remove("files");
            jdbc.update("UPDATE dhr_summary_version SET candidate_snapshot=? WHERE id=10", altered.toString());
            assertThatThrownBy(() -> archives.export(1L, 10L, "FULL", Set.of(), Set.of())).hasMessageContaining("冻结证据");
            jdbc.update("UPDATE dhr_summary_version SET candidate_snapshot=? WHERE id=10", records.toString());
            jdbc.update("UPDATE dhr_summary_version SET attachment_snapshot='[]' WHERE id=10");
            assertThatThrownBy(() -> archives.export(1L, 10L, "FULL", Set.of(), Set.of())).hasMessageContaining("冻结证据");
            jdbc.update("UPDATE dhr_summary_version SET attachment_snapshot=? WHERE id=10", attachmentJson);
        }
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

    @Test void acceptsExactly50MiBButRejectsOneByteOverBeforeReading() throws Exception {
        byte[] bytes = java.util.Arrays.copyOf(png().getBytes(), 50 * 1024 * 1024);
        var result = attachments.upload(1L, new MockMultipartFile("file", "large.png", "image/png", bytes), "OTHER", "容量边界", null, null);
        assertThat(attachments.snapshot(1L).get(0).path("size").asLong()).isEqualTo(bytes.length);
        assertThat(Files.size(attachments.file(1L, Long.valueOf(result.path("attachmentId").asText())))).isEqualTo(bytes.length);
        var tooLarge = mock(org.springframework.web.multipart.MultipartFile.class);
        when(tooLarge.getSize()).thenReturn((long) bytes.length + 1);
        assertThatThrownBy(() -> attachments.upload(1L, tooLarge, "OTHER", "超限", null, null)).hasMessageContaining("50MB");
        verify(tooLarge, never()).getBytes();
    }

    @Test void officeRejectsDisguisedUnsupportedCorruptEncryptedAndMacroFiles() throws Exception {
        rejects("report.docx", png().getBytes());
        rejects("report.xls", office("docx").getBytes());
        rejects("report.docx", office("xlsx").getBytes());
        rejects("report.doc", office("xls").getBytes());
        rejects("report.xlsm", office("xlsx").getBytes());
        rejects("report.pptx", office("docx").getBytes());
        rejects("report.doc", new byte[]{1, 2, 3});
        try (var fs = new org.apache.poi.poifs.filesystem.POIFSFileSystem()) {
            fs.createDocument(new java.io.ByteArrayInputStream(new byte[16]), "WordDocument");
            var out = new ByteArrayOutputStream();
            fs.writeFilesystem(out);
            rejects("report.doc", out.toByteArray());
        }
        try (var fs = new org.apache.poi.poifs.filesystem.POIFSFileSystem(new java.io.ByteArrayInputStream(office("xls").getBytes()))) {
            fs.getRoot().createDirectory("_VBA_PROJECT_CUR").createDirectory("VBA");
            var out = new ByteArrayOutputStream();
            fs.writeFilesystem(out);
            rejects("report.xls", out.toByteArray());
        }
        try (var fs = new org.apache.poi.poifs.filesystem.POIFSFileSystem(new java.io.ByteArrayInputStream(office("doc").getBytes()))) {
            fs.getRoot().createDirectory("Macros");
            var out = new ByteArrayOutputStream();
            fs.writeFilesystem(out);
            rejects("report.doc", out.toByteArray());
        }
        try (var workbook = new org.apache.poi.hssf.usermodel.HSSFWorkbook()) {
            workbook.createSheet("encrypted");
            org.apache.poi.hssf.record.crypto.Biff8EncryptionKey.setCurrentUserPassword("test");
            var out = new ByteArrayOutputStream();
            workbook.write(out);
            org.apache.poi.hssf.record.crypto.Biff8EncryptionKey.setCurrentUserPassword(null);
            rejects("report.xls", out.toByteArray());
        } finally { org.apache.poi.hssf.record.crypto.Biff8EncryptionKey.setCurrentUserPassword(null); }
        try (var pkg = org.apache.poi.openxml4j.opc.OPCPackage.open(new java.io.ByteArrayInputStream(office("docx").getBytes()))) {
            pkg.createPart(org.apache.poi.openxml4j.opc.PackagingURIHelper.createPartName("/word/vbaProject.bin"), "application/vnd.ms-office.vbaProject");
            var out = new ByteArrayOutputStream();
            pkg.save(out);
            rejects("report.docx", out.toByteArray());
        }
        try (var fs = new org.apache.poi.poifs.filesystem.POIFSFileSystem()) {
            var info = new org.apache.poi.poifs.crypt.EncryptionInfo(org.apache.poi.poifs.crypt.EncryptionMode.agile);
            var encryptor = info.getEncryptor();
            encryptor.confirmPassword("test");
            try (var stream = encryptor.getDataStream(fs)) { stream.write(office("xlsx").getBytes()); }
            var out = new ByteArrayOutputStream();
            fs.writeFilesystem(out);
            rejects("report.xlsx", out.toByteArray());
        }
        assertThat(attachments.snapshot(1L)).isEmpty();
        verifyNoInteractions(audits);
    }

    @Test void rejectsExcessiveOfficeZipExpansionBeforeParsing() throws Exception {
        var out = new ByteArrayOutputStream();
        try (var zip = new java.util.zip.ZipOutputStream(out)) {
            zip.putNextEntry(new java.util.zip.ZipEntry("word/document.xml"));
            byte[] block = new byte[1024 * 1024];
            for (int i = 0; i < 101; i++) zip.write(block);
        }
        assertThatThrownBy(() -> attachments.upload(1L, new MockMultipartFile("file", "bomb.docx", "application/octet-stream", out.toByteArray()),
                "OTHER", "展开限制", null, null)).hasMessageContaining("解压后过大");
        assertThat(attachments.snapshot(1L)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"docx", "xlsx"})
    void rejectsRenamedOfficeTemplatesAndTruncatedZipDirectory(String extension) throws Exception {
        byte[] original = office(extension).getBytes();
        var pkg = org.apache.poi.openxml4j.opc.OPCPackage.open(new java.io.ByteArrayInputStream(original));
        try {
            String partName = extension.equals("docx") ? "/word/document.xml" : "/xl/workbook.xml";
            String mainType = extension.equals("docx") ? "wordprocessingml.template.main+xml" : "spreadsheetml.template.main+xml";
            pkg.getPart(org.apache.poi.openxml4j.opc.PackagingURIHelper.createPartName(partName))
                    .setContentType("application/vnd.openxmlformats-officedocument." + mainType);
            var output = new ByteArrayOutputStream();
            pkg.save(output);
            rejects("template." + extension, output.toByteArray());
        } finally { pkg.revert(); }
        int centralOffset = -1;
        for (int i = original.length - 22; i >= 0; i--) {
            if (original[i] == 'P' && original[i + 1] == 'K' && original[i + 2] == 5 && original[i + 3] == 6) {
                centralOffset = java.nio.ByteBuffer.wrap(original, i + 16, 4).order(java.nio.ByteOrder.LITTLE_ENDIAN).getInt();
                break;
            }
        }
        assertThat(centralOffset).isPositive();
        rejects("damaged." + extension, java.util.Arrays.copyOf(original, centralOffset));
        assertThat(attachments.snapshot(1L)).isEmpty();
        verifyNoInteractions(audits);
    }

    private void rejects(String name, byte[] bytes) {
        assertThatThrownBy(() -> attachments.upload(1L, new MockMultipartFile("file", name, "application/octet-stream", bytes),
                "EXTERNAL_REPORT", "格式校验", null, null)).isInstanceOf(com.zencas.edhr.common.exception.BusinessException.class);
    }

    private MockMultipartFile office(String extension) throws Exception {
        var out = new ByteArrayOutputStream();
        switch (extension) {
            case "doc" -> {
                // Repository-owned real Word 97-2003 file, read only; no conversion of uploaded bytes.
                var source = Path.of("../../docs/regulation/医疗器械生产质量管理规范（2025）.doc");
                out.write(Files.readAllBytes(source));
            }
            case "docx" -> {
                try (var doc = new org.apache.poi.xwpf.usermodel.XWPFDocument()) {
                    doc.createParagraph().createRun().setText("委外报告");
                    doc.write(out);
                }
            }
            case "xls", "xlsx" -> {
                try (org.apache.poi.ss.usermodel.Workbook workbook = extension.equals("xls")
                        ? new org.apache.poi.hssf.usermodel.HSSFWorkbook() : new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
                    workbook.createSheet("结果").createRow(0).createCell(0).setCellValue("报告");
                    workbook.write(out);
                }
            }
            default -> throw new IllegalArgumentException(extension);
        }
        return new MockMultipartFile("file", "委外报告." + extension.toUpperCase(java.util.Locale.ROOT), "application/octet-stream", out.toByteArray());
    }

    private MockMultipartFile attachmentFile(String extension) throws Exception {
        if (extension.equals("png")) return png();
        var output = new ByteArrayOutputStream();
        if (extension.equals("pdf")) {
            try (var document = new org.apache.pdfbox.pdmodel.PDDocument()) {
                document.addPage(new org.apache.pdfbox.pdmodel.PDPage());
                document.save(output);
            }
        } else if (extension.equals("jpg")) {
            ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "jpg", output);
        } else return office(extension);
        return new MockMultipartFile("file", "委外报告." + extension, "application/octet-stream", output.toByteArray());
    }

    private MockMultipartFile png() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", output);
        return new MockMultipartFile("file", "scan.png", "image/png", output.toByteArray());
    }
}
