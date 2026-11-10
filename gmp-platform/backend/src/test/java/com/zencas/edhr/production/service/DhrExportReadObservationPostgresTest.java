package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import jdk.jfr.Recording;
import jdk.jfr.consumer.RecordingFile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import javax.imageio.ImageIO;
import javax.sql.DataSource;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.lang.management.ManagementFactory;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.zip.ZipFile;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Opt-in actual readers. Costs are observations, never requirements to retain inefficient work. */
@EnabledIfSystemProperty(named = "edhr.audit.dhrExportReads", matches = "true")
@EnabledIfEnvironmentVariable(named = "DHR_EXPORT_READ_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_export_read_test_[a-z0-9_]+")
@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.liquibase.enabled=true", "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false"})
@Import(DhrExportReadObservationPostgresTest.Config.class)
class DhrExportReadObservationPostgresTest {
    private static final ThreadLocal<Reads> CURRENT = new ThreadLocal<>();
    @Autowired JdbcTemplate jdbc;
    @Autowired DhrFormFiles formFiles;
    @Autowired DhrArchiveService archives;
    @Autowired ObjectMapper mapper;
    @MockBean DhrPdfRenderer renderer;
    @MockBean FormProjectionWorker worker;
    @TempDir Path files;
    private Path original;
    private byte[] imageBytes;
    private ObjectNode lastObservation;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        String url = System.getenv("DHR_EXPORT_READ_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_export_read_test_[a-z0-9_]+")) throw new IllegalStateException("Disposable export observation database required");
        p.add("spring.datasource.url", () -> url); p.add("spring.datasource.username", () -> System.getenv("PGUSER"));
        p.add("spring.datasource.password", () -> ""); p.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @BeforeEach void setup() throws Exception {
        jdbc.execute("TRUNCATE file_object,audit_event,dhr_summary_review,dhr_summary_evidence,dhr_summary_version,dhr_summary_draft,dhr_instance,form_instance_record,production_execution,production_object,work_order,product_process_version,product_process,material,form_template,route,dhr_template CASCADE");
        var image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        try (var output = new ByteArrayOutputStream()) { assertThat(ImageIO.write(image, "png", output)).isTrue(); imageBytes = Arrays.copyOf(output.toByteArray(), 256 * 1024); }
        original = files.resolve("registered.png"); Files.write(original, imageBytes);
        jdbc.update("INSERT INTO file_object(id,tenant_id,original_name,stored_path,mime_type,file_size,md5_hash,target_type,target_id,created_at) VALUES(400001,'default','认证图片.png',?,'image/png',?,?,'SIGNATURE_EVIDENCE','41','2026-01-01'),(400002,'default','原始图片.png',?,'image/png',?,?,'PRODUCTION_EXECUTION','77','2026-01-01')",
                original.toString(), imageBytes.length, hash("MD5", imageBytes), original.toString(), imageBytes.length, hash("MD5", imageBytes));
        AuditContext.setOperator("41", "归档观察员");
    }
    @AfterEach void clear() { CURRENT.remove(); AuditContext.clear(); }

    @ParameterizedTest @ValueSource(ints = {0, 1, 10, 100})
    void repeatedSignatureImageReadsPreserveEveryFrozenField(int count) throws Exception { observeFields(count, true); }

    @ParameterizedTest @ValueSource(ints = {0, 1, 10, 100})
    void repeatedOrdinaryOriginalsRemainIncludedOnce(int count) throws Exception { observeFields(count, false); }

    private void observeFields(int count, boolean signatures) throws Exception {
        var record = fieldRecord(count, signatures); var before = record.deepCopy();
        formFiles.resolve(fieldRecord(1, signatures), "77", java.time.LocalDateTime.of(2026, 1, 2, 0, 0)); // warm native metadata/file cache outside measurement
        var result = observe((signatures ? "signature" : "ordinary") + "-" + count,
                Map.of("fields", count, "sameFileIdentity", true, "imageBytes", imageBytes.length, "kind", signatures ? "signature" : "ordinary"),
                () -> formFiles.resolve(record, "77", java.time.LocalDateTime.of(2026, 1, 2, 0, 0)), original);
        assertThat(record).isEqualTo(before);
        assertThat(result.renderingRecord().path("fieldValues")).hasSize(count);
        assertThat(result.attachments()).hasSize(signatures || count == 0 ? 0 : 1);
        assertThat(lastObservation.path("selectStatements").asLong()).isEqualTo(count == 0 ? 0 : 1);
        assertThat(lastObservation.path("trackedLogicalReadBytes").asLong()).isEqualTo(count == 0 ? 0 : imageBytes.length);
        if (!signatures && count > 0) assertThat(result.attachments().getFirst().bytes()).isEqualTo(imageBytes);
        if (signatures) for (JsonNode field : result.renderingRecord().path("fieldValues")) {
            String url = field.path("signatureImageObjectUrl").asText(); assertThat(url).startsWith("data:image/png;base64,");
            assertThat(Base64.getDecoder().decode(url.substring(url.indexOf(',') + 1))).isEqualTo(imageBytes);
        }
    }

    @Test void signatureOriginalScopeAndIntegrityRemainEnforced() throws Exception {
        var record = fieldRecord(1, true);
        for (String mutation : List.of("tenant_id='other'", "target_type='PRODUCTION_EXECUTION'", "created_at='2026-01-03'", "file_size=file_size+1", "md5_hash='00000000000000000000000000000000'")) {
            jdbc.update("UPDATE file_object SET tenant_id='default',target_type='SIGNATURE_EVIDENCE',created_at='2026-01-01',file_size=?,md5_hash=? WHERE id=400001", imageBytes.length, hash("MD5", imageBytes));
            jdbc.execute("UPDATE file_object SET " + mutation + " WHERE id=400001");
            assertThatThrownBy(() -> formFiles.resolve(record, "77", java.time.LocalDateTime.of(2026, 1, 2, 0, 0)))
                    .isInstanceOf(com.zencas.edhr.common.exception.BusinessException.class);
            assertThat(record.path("fieldValues").path("field-0").has("signatureImageObjectUrl")).isFalse();
        }
    }

    @ParameterizedTest @ValueSource(ints = {1, 10, 100})
    void archivePdfAccumulationProducesReadableExtractableFrozenEvidence(int count) throws Exception {
        var records = seedFrozenVersion(count); byte[] pdf = validPdf();
        var session = mock(DhrPdfRenderer.Session.class); when(renderer.open()).thenReturn(session);
        when(session.order(any())).thenAnswer(call -> {
            var order = mapper.createArrayNode();
            for (JsonNode record : records) order.addObject().put("id", record.path("id").asText()).put("title", record.path("templateName").asText()).put("archivePath", "作业表单/" + record.path("id").asText());
            return order;
        });
        when(session.form(any(), anyString())).thenAnswer(call -> pdf.clone());
        when(session.index(anyString(), anyString(), anyList())).thenAnswer(call -> pdf.clone());
        Path zip = observe("archive-" + count, Map.of("forms", count, "pdfBytesPerForm", pdf.length, "rendering", "valid synthetic PDF, renderer mocked; actual frozen integrity/archive/merge/audit"),
                () -> archives.export(1L, 10L, "FULL", Set.of(), Set.of()), null);
        try (var archive = new ZipFile(zip.toFile())) {
            Path extracted = files.resolve("extracted"); Files.createDirectories(extracted);
            var entries = archive.entries();
            while (entries.hasMoreElements()) {
                var entry = entries.nextElement(); Path target = extracted.resolve(entry.getName()).normalize(); assertThat(target.startsWith(extracted)).isTrue();
                for (String part : entry.getName().split("/")) assertThat(part.getBytes(StandardCharsets.UTF_8).length).isLessThanOrEqualTo(255);
                if (entry.isDirectory()) Files.createDirectories(target);
                else { Files.createDirectories(target.getParent()); try (var input = archive.getInputStream(entry)) { Files.copy(input, target); } }
            }
            var manifest = mapper.readTree(Files.readString(extracted.resolve("追溯资料/清单.json")));
            assertThat(manifest.path("formCount").asInt()).isEqualTo(count);
            assertThat(manifest.path("archiveOrder")).hasSize(count);
            int formPdfs = 0;
            for (var file : manifest.path("files")) {
                Path path = extracted.resolve(file.path("path").asText()); byte[] bytes = Files.readAllBytes(path);
                assertThat(bytes.length).isEqualTo(file.path("size").asInt()); assertThat(hash("SHA-256", bytes)).isEqualTo(file.path("sha256").asText());
                if (file.path("kind").asText().equals("FORM_PDF")) { formPdfs++; assertThat(bytes).isEqualTo(pdf); }
                if (file.path("kind").asText().equals("DHR_PDF")) try (var document = Loader.loadPDF(bytes)) { assertThat(document.getNumberOfPages()).isEqualTo(count + 1); }
            }
            assertThat(formPdfs).isEqualTo(count);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE entity_type='DHR_SUMMARY_EXPORT' AND entity_id='10' AND action='EXPORT'", Long.class)).isEqualTo(1);
        } finally { Files.deleteIfExists(zip); }
        verify(session).close();
    }

    private ObjectNode fieldRecord(int count, boolean signatures) {
        var record = mapper.createObjectNode().put("id", "500001"); var values = record.putObject("fieldValues");
        for (int i = 0; i < count; i++) {
            var value = values.putObject("field-" + i);
            if (signatures) value.put("type", "signature").put("signatureId", "7000" + i).put("signerId", "41").put("signerName", "观察员").put("signedAt", "2026-01-01T12:00:00").put("signatureImageFileId", "400001").put("certificationId", "8000");
            else value.put("fileId", "400002").put("originalName", "原始图片.png");
        }
        return record;
    }

    private com.fasterxml.jackson.databind.node.ArrayNode seedFrozenVersion(int count) throws Exception {
        jdbc.update("INSERT INTO material(id,code,name) VALUES(910101,'EXPORT-PRODUCT','归档产品')");
        jdbc.update("INSERT INTO route(id,code,name) VALUES(910102,'EXPORT-ROUTE','归档路线')");
        jdbc.update("INSERT INTO route_version(id,route_id,version,code) VALUES(910103,910102,'1','EXPORT-RV')");
        jdbc.update("INSERT INTO dhr_template(id,code,name) VALUES(910104,'EXPORT-DHR','归档目录')");
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES(910105,910104,'1')");
        jdbc.update("INSERT INTO product_process(id,owner_type,owner_id) VALUES(910106,'PRODUCT',910101)");
        jdbc.update("INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES(910107,910106,'1','量产','批次',910103,910105)");
        jdbc.update("INSERT INTO work_order(id,order_no,product_id,planned_quantity) VALUES(910108,'EXPORT-WO',910101,1)");
        jdbc.update("INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity,status) VALUES(77,910108,'EXPORT-BATCH','BATCH',910107,1,'COMPLETED')");
        jdbc.update("INSERT INTO form_template(id,code,name) VALUES(910110,'EXPORT-FORM','归档表单')");
        jdbc.update("INSERT INTO form_template_version(id,template_id) VALUES(910111,910110)");
        jdbc.update("INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,status,summary_status,created_at,updated_at) VALUES(1,'default','DHR-EXPORT',77,'EXPORT-BATCH','BATCH',910108,'EXPORT-WO',910101,910107,910103,910104,910105,'{}','{\"directories\":[]}','COMPLETED','FORMALIZED',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        var records = mapper.createArrayNode(); var placements = mapper.createArrayNode();
        for (int i = 0; i < count; i++) {
            String id = String.valueOf(count == 1 ? Long.MAX_VALUE : 500001L + i);
            var record = DhrPrintTestFixtures.record(mapper, id).put("instanceNo", "FR-20261105-" + id).put("templateName", "冻结检验".repeat(25))
                    .put("templateId", "910110").put("templateVersionId", "910111").put("operationId", "op").put("formId", "form-" + i).put("copyId", "form-" + i); records.add(record);
            jdbc.update("INSERT INTO form_instance_record(id,tenant_id,instance_no,object_id,operation_id,form_id,copy_id,template_id,version_id,snapshot_json,values_json,status,updated_at,template_name,source_type) VALUES(?,'default',?,77,'op',?,?,910110,910111,?,'{}','COMPLETED',CURRENT_TIMESTAMP,?,'PRODUCTION_EXECUTION')", Long.valueOf(id), record.path("instanceNo").asText(), "form-" + i, "form-" + i, record.path("snapshot").toString(), record.path("templateName").asText());
            placements.addObject().put("recordId", id).put("targetNodeKey", "source-work").put("displayOrder", i + 1);
        }
        var frozen = mapper.createObjectNode().put("dhrInstanceId", 1L).put("versionNo", 1).put("status", "FORMALIZED").put("reviewMode", "NONE");
        frozen.putObject("reviewBinding").put("mode", "NONE"); frozen.putObject("baseDirectory").putArray("directories");
        frozen.putArray("overlayDirectories"); frozen.set("candidates", records); frozen.putArray("attachments"); frozen.putObject("checkResult"); frozen.set("placements", placements);
        jdbc.update("INSERT INTO dhr_summary_version(id,tenant_id,dhr_instance_id,version_no,status,review_mode,base_directory_snapshot,overlay_directory_snapshot,candidate_snapshot,snapshot_hash,submitted_at,created_at,check_result_snapshot,attachment_snapshot) VALUES(10,'default',1,1,'FORMALIZED','NONE','{\"directories\":[]}','[]',?,?,'2026-01-02',CURRENT_TIMESTAMP,'{}','[]')", records.toString(), hash("SHA-256", frozen.toString().getBytes(StandardCharsets.UTF_8)));
        for (int i = 0; i < count; i++) {
            String snapshot = records.get(i).toString();
            jdbc.update("INSERT INTO dhr_summary_evidence(id,tenant_id,summary_version_id,source_record_id,target_node_key,origin_kind,created_at,display_order,source_snapshot,source_hash) VALUES(?,'default',10,?,'source-work','WORK',CURRENT_TIMESTAMP,?,?,?)", 1000 + i, Long.valueOf(records.get(i).path("id").asText()), i + 1, snapshot, hash("SHA-256", snapshot.getBytes(StandardCharsets.UTF_8)));
        }
        return records;
    }

    private byte[] validPdf() throws Exception {
        var image = new BufferedImage(256, 256, BufferedImage.TYPE_INT_RGB); var random = new Random(73);
        for (int y = 0; y < 256; y++) for (int x = 0; x < 256; x++) image.setRGB(x, y, random.nextInt());
        try (var pdf = new PDDocument()) {
            var page = new PDPage(); pdf.addPage(page);
            try (var content = new PDPageContentStream(pdf, page)) { content.drawImage(LosslessFactory.createFromImage(pdf, image), 20, 20, 256, 256); }
            return DhrPdfRenderer.bytes(pdf);
        }
    }

    private <T> T observe(String name, Map<String, Object> data, CheckedSupplier<T> action, Path tracked) throws Exception {
        Path output = Path.of(System.getProperty("edhr.audit.dhrExportReadOutput")); Files.createDirectories(output);
        var allocation = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
        assertThat(allocation.isThreadAllocatedMemorySupported()).isTrue(); allocation.setThreadAllocatedMemoryEnabled(true);
        var read = new Reads(); T value; long allocated; long elapsed; long heapBefore; long heapAfter;
        Path recording = output.resolve(name + ".jfr");
        try (var jfr = new Recording()) {
            jfr.enable("jdk.FileRead").withThreshold(Duration.ZERO); jfr.start();
            heapBefore = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed();
            long startAllocation = allocation.getThreadAllocatedBytes(Thread.currentThread().threadId()); long started = System.nanoTime(); CURRENT.set(read);
            try { value = action.get(); }
            finally { CURRENT.remove(); }
            elapsed = System.nanoTime() - started; allocated = allocation.getThreadAllocatedBytes(Thread.currentThread().threadId()) - startAllocation;
            heapAfter = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed();
            jfr.stop(); jfr.dump(recording);
        }
        Path watched = tracked != null ? tracked : value instanceof Path path ? path : null; long fileBytes = 0; int fileEvents = 0;
        for (var event : RecordingFile.readAllEvents(recording)) if (event.getEventType().getName().equals("jdk.FileRead") && watched != null && watched.toString().equals(event.getString("path"))) { fileBytes += event.getLong("bytesRead"); fileEvents++; }
        var event = mapper.createObjectNode().put("name", name).put("elapsedNanos", elapsed).put("threadAllocatedBytes", allocated)
                .put("heapBefore", heapBefore).put("heapAfter", heapAfter)
                .put("trackedLogicalReadBytes", fileBytes).put("trackedReadEvents", fileEvents);
        event.set("data", mapper.valueToTree(data)); event.set("jdbcSql", mapper.valueToTree(read.jdbc)); event.set("hibernateSql", mapper.valueToTree(read.hibernate));
        event.put("selectStatements", read.jdbc.size() + read.hibernate.stream().filter(sql -> sql.stripLeading().toLowerCase(Locale.ROOT).startsWith("select")).count());
        if (value instanceof Path path) event.put("outputArchiveBytes", Files.size(path));
        Files.writeString(output.resolve("observations.jsonl"), event + "\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        lastObservation = event;
        return value;
    }

    private static String hash(String algorithm, byte[] value) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance(algorithm).digest(value)); }
    private interface CheckedSupplier<T> { T get() throws Exception; }
    private static class Reads { final List<String> jdbc = new ArrayList<>(); final List<String> hibernate = new ArrayList<>(); }
    @TestConfiguration static class Config {
        @Bean JdbcTemplate observedJdbc(DataSource source) {
            return new JdbcTemplate(source) {
                @Override public List<Map<String, Object>> queryForList(String sql, Object... args) { if (CURRENT.get() != null) CURRENT.get().jdbc.add(sql); return super.queryForList(sql, args); }
                @Override public void query(String sql, RowCallbackHandler handler, Object... args) { if (CURRENT.get() != null) CURRENT.get().jdbc.add(sql); super.query(sql, handler, args); }
            };
        }
        @Bean HibernatePropertiesCustomizer statementInspector() {
            return p -> p.put("hibernate.session_factory.statement_inspector", (StatementInspector) sql -> { if (CURRENT.get() != null) CURRENT.get().hibernate.add(sql); return sql; });
        }
    }
}
