package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Part;
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
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;

import javax.imageio.ImageIO;
import javax.sql.DataSource;
import java.awt.image.BufferedImage;
import java.io.*;
import java.lang.management.ManagementFactory;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/** Actual Spring multipart adapter + disk Part fixture, not a servlet container/parser benchmark. */
@EnabledIfSystemProperty(named = "edhr.audit.attachmentUploadVerify", matches = "true")
@EnabledIfEnvironmentVariable(named = "DHR_ATTACHMENT_WRITE_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_attachment_write_test_[a-z0-9_]+")
@SpringBootTest(properties = {"spring.jpa.hibernate.ddl-auto=none", "spring.liquibase.enabled=true", "spring.jpa.open-in-view=false", "spring.jpa.show-sql=false"})
@Import(DhrAttachmentUploadVerifyObservationPostgresTest.Config.class)
class DhrAttachmentUploadVerifyObservationPostgresTest {
    private static final ThreadLocal<Reads> CURRENT = new ThreadLocal<>();
    @Autowired CountingJdbc jdbc;
    @Autowired DhrAttachmentService attachments;
    @Autowired ObjectMapper mapper;
    @Autowired PlatformTransactionManager manager;
    @Autowired EntityManager entityManager;
    @MockBean FormProjectionWorker worker;
    @TempDir Path directory;
    private Path store;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        String url = System.getenv("DHR_ATTACHMENT_WRITE_DATABASE_URL");
        if (url == null || !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_attachment_write_test_[a-z0-9_]+")) throw new IllegalStateException("Disposable attachment write database required");
        p.add("spring.datasource.url", () -> url); p.add("spring.datasource.username", () -> System.getenv("PGUSER"));
        p.add("spring.datasource.password", () -> ""); p.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @BeforeEach void setup() throws Exception {
        jdbc.execute("TRUNCATE audit_event,dhr_attachment,dhr_summary_review,dhr_summary_evidence,dhr_summary_version,dhr_summary_draft,dhr_instance,form_instance_record,production_execution,production_object,work_order,product_process_version,product_process,material,route,dhr_template CASCADE");
        jdbc.update("INSERT INTO material(id,code,name) VALUES(920101,'WRITE-PRODUCT','附件产品')");
        jdbc.update("INSERT INTO route(id,code,name) VALUES(920102,'WRITE-ROUTE','附件路线')");
        jdbc.update("INSERT INTO route_version(id,route_id,version,code) VALUES(920103,920102,'1','WRITE-RV')");
        jdbc.update("INSERT INTO dhr_template(id,code,name) VALUES(920104,'WRITE-DHR','附件目录')");
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES(920105,920104,'1')");
        jdbc.update("INSERT INTO product_process(id,owner_type,owner_id) VALUES(920106,'PRODUCT',920101)");
        jdbc.update("INSERT INTO product_process_version(id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES(920107,920106,'1','量产','批次',920103,920105)");
        jdbc.update("INSERT INTO work_order(id,order_no,product_id,planned_quantity) VALUES(920108,'WRITE-WO',920101,2)");
        jdbc.update("INSERT INTO production_object(id,work_order_id,object_no,object_type,process_version_id,target_quantity,status) VALUES(77,920108,'WRITE-BATCH','BATCH',920107,1,'COMPLETED'),(78,920108,'OTHER-BATCH','BATCH',920107,1,'COMPLETED')");
        for (long id : new long[]{1, 2}) jdbc.update("INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,directory_snapshot,status,summary_status,created_at,updated_at) VALUES(?,'default',?,?,?,'BATCH',920108,'WRITE-WO',920101,920107,920103,920104,920105,'{}','{\"directories\":[]}','COMPLETED','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)", id, "DHR-WRITE-" + id, id == 1 ? 77 : 78, id == 1 ? "WRITE-BATCH" : "OTHER-BATCH");
        store = directory.resolve("store"); Files.createDirectories(store); Files.writeString(store.resolve("unrelated"), "preserve");
        ReflectionTestUtils.setField(attachments, "storagePath", store.toString());
        AuditContext.setOperator("41", "附件观察员", "attachment-observer");
    }
    @AfterEach void clear() { CURRENT.remove(); AuditContext.clear(); }

    @ParameterizedTest @ValueSource(strings = {"pdf", "png", "jpg", "doc", "docx", "xls", "xlsx"})
    void sevenSmallFormatsKeepExactOriginalAndAtomicVerification(String extension) throws Exception {
        roundTrip("format_" + extension, fixture(extension), false);
    }

    @ParameterizedTest @ValueSource(ints = {1, 10, 50})
    void diskChannelMultipartAndVerificationAllocation(int mib) throws Exception {
        roundTrip("size_" + mib + "mib_channel", paddedPng(mib * 1024 * 1024), false);
    }

    @Test void genericInputStreamIsASeparateFiftyMiBAdapterAxis() throws Exception {
        roundTrip("size_50mib_generic", paddedPng(50 * 1024 * 1024), true);
    }

    private void roundTrip(String name, Path input, boolean generic) throws Exception {
        String digest = digest(input); long size = Files.size(input); var part = new DiskPart(input, generic); var file = multipart(part);
        ObjectNode linked = observe("upload_" + name, Map.of("bytes", size, "partInput", generic ? "synthetic generic InputStream" : "ChannelInputStream", "multipartClass", file.getClass().getName()), null, false,
                () -> attachments.upload(1L, file, "OTHER", "原件观察", null, null));
        long id = linked.path("attachmentId").asLong(); var row = row(id); Path original = Path.of(row.get("stored_path").toString());
        assertThat(Files.mismatch(input, original)).isEqualTo(-1); assertThat(row.get("sha256")).isEqualTo(digest); assertThat(((Number) row.get("file_size")).longValue()).isEqualTo(size);
        assertThat(row.get("verification_status")).isEqualTo("PENDING"); assertThat(part.opens).isEqualTo(1); assertAudits(id, List.of("LINK"));
        AuditContext.setOperator("42", "核验观察员", "verification-observer");
        observe("verify_" + name, Map.of("bytes", size), null, false, () -> { attachments.verify(1L, id); return mapper.createObjectNode(); });
        var verified = row(id); assertThat(verified.get("verification_status")).isEqualTo("VERIFIED"); assertThat(verified.get("verified_by")).isEqualTo("核验观察员"); assertThat(verified.get("verified_at")).isNotNull();
        assertThat(Files.mismatch(input, original)).isEqualTo(-1); assertAudits(id, List.of("LINK", "VERIFY"));
        observe("download_" + name, Map.of("bytes", size), null, false, () -> {
            var download = attachments.downloadableFile(1L, id, null); assertThat(download.path()).isEqualTo(original); assertThat(download.originalName()).isEqualTo(input.getFileName().toString()); return mapper.createObjectNode();
        });
        assertThat(observation("upload_" + name).path("fixtureReadBytes").asLong()).isEqualTo(size);
        assertThat(observation("upload_" + name).path("storedWriteBytes").asLong()).isEqualTo(size);
        assertThat(observation("verify_" + name).path("storedReadBytes").asLong()).isEqualTo(size);
        assertThat(observation("download_" + name).path("storedReadBytes").asLong()).isEqualTo(size);
        if (size >= 50L * 1024 * 1024 && row.get("mime_type").toString().startsWith("image/")) {
            assertThat(observation("verify_" + name).path("threadAllocatedBytes").asLong())
                    .as("large image verification must not allocate a whole-file byte array")
                    .isLessThan(25L * 1024 * 1024);
        }
        write("original_" + name + ".json", Map.of("attachmentId", id, "size", size, "sha256", digest, "exactBytesAfterVerify", true, "partInput", generic ? "generic synthetic" : "channel"));
    }

    @ParameterizedTest @ValueSource(strings = {"upload_sql", "upload_audit", "verify_audit", "outer_rollback"})
    void realDatabaseOrAuditRefusalAndFlushedOuterRollbackKeepOwnership(String failure) throws Exception {
        Path input = fixture("png"); ObjectNode existing = null;
        if (failure.equals("verify_audit")) existing = upload(input, false, "initial");
        try {
            if (failure.equals("upload_sql")) jdbc.execute("ALTER TABLE dhr_attachment ADD CONSTRAINT native_write_refusal CHECK(purpose <> 'refused')");
            if (failure.equals("upload_audit")) jdbc.execute("ALTER TABLE audit_event ADD CONSTRAINT native_audit_refusal CHECK(action <> 'LINK')");
            if (failure.equals("verify_audit")) jdbc.execute("ALTER TABLE audit_event ADD CONSTRAINT native_audit_refusal CHECK(action <> 'VERIFY')");
            ObjectNode originalLink = existing;
            observe("failure_" + failure, Map.of("fault", failure), failure.equals("outer_rollback") ? null : failure.equals("upload_sql") ? "native_write_refusal" : "native_audit_refusal", failure.equals("outer_rollback"), () -> {
                if (failure.equals("verify_audit")) { attachments.verify(1L, originalLink.path("attachmentId").asLong()); return mapper.createObjectNode(); }
                var result = upload(input, false, failure.equals("upload_sql") ? "refused" : "fault test");
                if (failure.equals("outer_rollback")) { entityManager.flush(); assertThat(Path.of(rowPathWithoutQuery(result))).exists(); }
                return result;
            });
            if (failure.equals("verify_audit")) {
                var before = row(existing.path("attachmentId").asLong()); assertThat(before.get("verification_status")).isEqualTo("PENDING"); assertThat(before.get("verified_by")).isNull(); assertThat(before.get("verified_at")).isNull();
                assertThat(digest(Path.of(before.get("stored_path").toString()))).isEqualTo(digest(input)); assertAudits(existing.path("attachmentId").asLong(), List.of("LINK"));
            } else {
                assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_attachment", Integer.class)).isZero(); assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class)).isZero(); assertThat(currentOriginals()).isEmpty();
            }
            assertThat(Files.readString(store.resolve("unrelated"))).isEqualTo("preserve");
        } finally {
            jdbc.execute("ALTER TABLE dhr_attachment DROP CONSTRAINT IF EXISTS native_write_refusal"); jdbc.execute("ALTER TABLE audit_event DROP CONSTRAINT IF EXISTS native_audit_refusal");
        }
    }

    @ParameterizedTest @ValueSource(strings = {"missing", "tampered", "invalid_format", "inactive", "other_dhr", "other_tenant", "formalized"})
    void verificationRefusalPreservesRegistrationAndOriginalOwnership(String reason) throws Exception {
        Path input = fixture("png"); var linked = upload(input, false, "verify guards"); long id = linked.path("attachmentId").asLong(); Path original = Path.of(row(id).get("stored_path").toString());
        String expected; long dhr = 1L; List<String> actions = List.of("LINK");
        switch (reason) {
            case "missing" -> { Files.delete(original); expected = "附件文件丢失或摘要不一致"; }
            case "tampered" -> { Files.writeString(original, "tampered"); expected = "附件文件丢失或摘要不一致"; }
            case "invalid_format" -> { Files.writeString(original, "not an image"); jdbc.update("UPDATE dhr_attachment SET sha256=?,file_size=? WHERE id=?", digest(original), Files.size(original), id); expected = "图片无法读取"; }
            case "inactive" -> { attachments.unlink(1L, id, "guard fixture"); expected = "附件已解除关联"; actions = List.of("LINK", "UNLINK"); }
            case "other_dhr" -> { dhr = 2L; expected = "附件不存在"; }
            case "other_tenant" -> { jdbc.update("UPDATE dhr_attachment SET tenant_id='other' WHERE id=?", id); expected = "附件不存在"; }
            case "formalized" -> { jdbc.update("UPDATE dhr_instance SET summary_status='FORMALIZED' WHERE id=1"); expected = "不能修改附件"; }
            default -> throw new IllegalArgumentException(reason);
        }
        Map<String, Object> before = row(id); String beforeBytes = Files.exists(original) ? digest(original) : null; long requestedDhr = dhr;
        observe("reject_verify_" + reason, Map.of("reason", reason), expected, false, () -> { attachments.verify(requestedDhr, id); return mapper.createObjectNode(); });
        assertThat(row(id)).isEqualTo(before); if (beforeBytes == null) assertThat(original).doesNotExist(); else assertThat(digest(original)).isEqualTo(beforeBytes);
        assertAudits(id, actions);
    }

    @ParameterizedTest @ValueSource(strings = {"IN_PROGRESS", "PENDING_REVIEW", "FORMALIZED"})
    void seededDhrWriteStatesRejectBeforeConsumingUploadOrOriginal(String state) throws Exception {
        Path input = fixture("png"); var linked = upload(input, false, "state fixture"); long id = linked.path("attachmentId").asLong(); var before = row(id);
        if (state.equals("IN_PROGRESS")) jdbc.update("UPDATE dhr_instance SET status='IN_PROGRESS',summary_status='NOT_STARTED' WHERE id=1");
        else jdbc.update("UPDATE dhr_instance SET summary_status=? WHERE id=1", state);
        var part = new DiskPart(input, false); var file = multipart(part);
        observe("reject_upload_" + state, Map.of("state", state), "不能修改附件", false, () -> attachments.upload(1L, file, "OTHER", "blocked", null, null));
        observe("reject_verify_" + state, Map.of("state", state), "不能修改附件", false, () -> { attachments.verify(1L, id); return mapper.createObjectNode(); });
        assertThat(part.opens).isZero(); assertThat(row(id)).isEqualTo(before); assertAudits(id, List.of("LINK")); assertThat(currentOriginals()).hasSize(1);
    }

    @ParameterizedTest @ValueSource(strings = {"oversize", "truncated"})
    void invalidUploadsNeverRegisterOrWriteAnOriginal(String kind) throws Exception {
        Path input;
        if (kind.equals("oversize")) input = paddedPng(50 * 1024 * 1024 + 1);
        else { input = directory.resolve("truncated.pdf"); Files.writeString(input, "%PDF-not-a-document"); }
        var part = new DiskPart(input, false); var file = multipart(part);
        observe("reject_upload_" + kind, Map.of("bytes", Files.size(input)), kind.equals("oversize") ? "不能超过" : "附件内容无法完整读取", false,
                () -> attachments.upload(1L, file, "OTHER", "invalid upload", null, null));
        if (kind.equals("oversize")) assertThat(part.opens).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM dhr_attachment", Integer.class)).isZero(); assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event", Integer.class)).isZero(); assertThat(currentOriginals()).isEmpty();
    }

    private ObjectNode upload(Path input, boolean generic, String purpose) throws IOException { return attachments.upload(1L, multipart(new DiskPart(input, generic)), "OTHER", purpose, null, null); }
    private String rowPathWithoutQuery(ObjectNode linked) { return store.resolve("dhr/" + linked.path("attachmentId").asText() + ".png").toString(); }
    private Map<String, Object> row(long id) { return jdbc.queryForMap("SELECT * FROM dhr_attachment WHERE id=?", id); }
    private List<Path> currentOriginals() throws IOException { if (!Files.isDirectory(store.resolve("dhr"))) return List.of(); try (var paths = Files.list(store.resolve("dhr"))) { return paths.toList(); } }
    private void assertAudits(long id, List<String> actions) {
        var rows = jdbc.queryForList("SELECT action,snapshot_hash,operator_id,operator_account FROM audit_event WHERE entity_type='DHR_ATTACHMENT' AND entity_id=? ORDER BY created_at,id", Long.toString(id));
        assertThat(rows.stream().map(r -> r.get("action")).toList()).containsExactlyElementsOf(actions);
        assertThat(rows).allSatisfy(r -> { assertThat(r.get("snapshot_hash").toString()).matches("[0-9a-f]{64}"); assertThat(r.get("operator_id")).isNotNull(); assertThat(r.get("operator_account")).isNotNull(); });
    }

    private Path fixture(String extension) throws Exception {
        Path file = directory.resolve("original." + extension);
        try (var out = Files.newOutputStream(file)) {
            switch (extension) {
                case "png", "jpg" -> assertThat(ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), extension, out)).isTrue();
                case "pdf" -> { try (var doc = new org.apache.pdfbox.pdmodel.PDDocument()) { doc.addPage(new org.apache.pdfbox.pdmodel.PDPage()); doc.save(out); } }
                case "doc" -> Files.copy(Path.of("../../docs/regulation/医疗器械生产质量管理规范（2025）.doc"), out);
                case "docx" -> { try (var doc = new org.apache.poi.xwpf.usermodel.XWPFDocument()) { doc.createParagraph().createRun().setText("原始报告"); doc.write(out); } }
                case "xls", "xlsx" -> { try (org.apache.poi.ss.usermodel.Workbook book = extension.equals("xls") ? new org.apache.poi.hssf.usermodel.HSSFWorkbook() : new org.apache.poi.xssf.usermodel.XSSFWorkbook()) { book.createSheet("报告").createRow(0).createCell(0).setCellValue("结果"); book.write(out); } }
                default -> throw new IllegalArgumentException(extension);
            }
        }
        return file;
    }
    private Path paddedPng(int bytes) throws Exception {
        Path file = fixture("png"); long remaining = bytes - Files.size(file);
        try (var out = Files.newOutputStream(file, StandardOpenOption.APPEND)) { byte[] buffer = new byte[65536]; while (remaining > 0) { int count = (int) Math.min(buffer.length, remaining); out.write(buffer, 0, count); remaining -= count; } }
        return file;
    }
    private String digest(Path path) throws Exception {
        var hash = MessageDigest.getInstance("SHA-256"); try (var in = Files.newInputStream(path)) { byte[] buffer = new byte[8192]; int n; while ((n = in.read(buffer)) != -1) hash.update(buffer, 0, n); } return HexFormat.of().formatHex(hash.digest());
    }
    private MultipartFile multipart(DiskPart part) {
        var request = new MockHttpServletRequest(); request.setMethod("POST"); request.setContentType("multipart/form-data; boundary=fixture"); request.addPart(part);
        MultipartFile file = new StandardMultipartHttpServletRequest(request).getFile("file"); assertThat(file).isNotNull(); return file;
    }
    private static class DiskPart implements Part {
        private final Path path; private final boolean generic; int opens;
        DiskPart(Path path, boolean generic) { this.path = path; this.generic = generic; }
        public InputStream getInputStream() throws IOException {
            opens++; InputStream input = Files.newInputStream(path);
            if (!generic) return input;
            return new InputStream() { public int read() throws IOException { return input.read(); } public int read(byte[] b, int o, int l) throws IOException { return input.read(b, o, l); } public void close() throws IOException { input.close(); } };
        }
        public String getContentType() { return "application/octet-stream"; } public String getName() { return "file"; }
        public String getSubmittedFileName() { return path.getFileName().toString(); } public long getSize() { try { return Files.size(path); } catch (IOException e) { throw new UncheckedIOException(e); } }
        public void write(String name) throws IOException { Files.copy(path, Path.of(name)); } public void delete() throws IOException { Files.delete(path); }
        public String getHeader(String name) { if (name.equalsIgnoreCase("content-disposition")) return "form-data; name=\"file\"; filename=\"" + getSubmittedFileName() + "\""; return name.equalsIgnoreCase("content-type") ? getContentType() : null; }
        public Collection<String> getHeaders(String name) { String value = getHeader(name); return value == null ? List.of() : List.of(value); } public Collection<String> getHeaderNames() { return List.of("content-disposition", "content-type"); }
    }

    private ObjectNode observe(String name, Map<String, Object> data, String expectedFailure, boolean rollback, Action action) throws Exception {
        var reads = new Reads(); ObjectNode result = null; Throwable failure = null; long thread = Thread.currentThread().threadId();
        var allocation = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean(); assertThat(allocation.isThreadAllocatedMemorySupported()).isTrue(); allocation.setThreadAllocatedMemoryEnabled(true);
        long allocated; long elapsed; long beforeHeap; long afterHeap; Path recording = output().resolve(name + ".jfr");
        try (var jfr = new Recording()) {
            jfr.enable("jdk.FileRead").withThreshold(Duration.ZERO); jfr.enable("jdk.FileWrite").withThreshold(Duration.ZERO); jfr.start();
            beforeHeap = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed(); long startBytes = allocation.getThreadAllocatedBytes(thread); long start = System.nanoTime(); CURRENT.set(reads);
            try { result = new TransactionTemplate(manager).execute(status -> { jdbc.execute("SET LOCAL application_name='audit_write_" + name + "'"); try { ObjectNode value = action.get(); if (rollback) status.setRollbackOnly(); return value; } catch (IOException ex) { throw new UncheckedIOException(ex); } }); }
            catch (Throwable ex) { failure = ex; }
            finally { CURRENT.remove(); }
            elapsed = System.nanoTime() - start; allocated = allocation.getThreadAllocatedBytes(thread) - startBytes; afterHeap = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed(); jfr.stop(); jfr.dump(recording);
        }
        long fixtureRead = 0, storedRead = 0, storedWrite = 0, snapshotRead = 0, snapshotWrite = 0; int ioEvents = 0;
        Set<String> snapshotPaths = new TreeSet<>();
        for (var event : RecordingFile.readAllEvents(recording)) {
            String type = event.getEventType().getName(); if (!(type.equals("jdk.FileRead") || type.equals("jdk.FileWrite")) || event.getThread().getJavaThreadId() != thread) continue;
            String path = event.getString("path"); if (path == null) continue;
            if (Path.of(path).getFileName().toString().startsWith("edhr-dhr-image-")) {
                snapshotPaths.add(path);
                if (type.equals("jdk.FileRead")) snapshotRead += event.getLong("bytesRead"); else snapshotWrite += event.getLong("bytesWritten");
                continue;
            }
            if (!Path.of(path).startsWith(directory)) continue;
            ioEvents++; boolean original = Path.of(path).startsWith(store);
            if (type.equals("jdk.FileRead")) { if (original) storedRead += event.getLong("bytesRead"); else fixtureRead += event.getLong("bytesRead"); }
            else if (original) storedWrite += event.getLong("bytesWritten");
        }
        var event = mapper.createObjectNode().put("name", name).put("applicationName", "audit_write_" + name).put("measuredThreadId", thread).put("elapsedNanos", elapsed).put("threadAllocatedBytes", allocated).put("heapBefore", beforeHeap).put("heapAfter", afterHeap)
                .put("fixtureReadBytes", fixtureRead).put("storedReadBytes", storedRead).put("storedWriteBytes", storedWrite).put("snapshotReadBytes", snapshotRead).put("snapshotWriteBytes", snapshotWrite).put("trackedIoEvents", ioEvents).put("requestedRollback", rollback).put("failureClass", failure == null ? null : failure.getClass().getName());
        event.set("snapshotPaths", mapper.valueToTree(snapshotPaths));
        event.put("snapshotsRemoved", snapshotPaths.stream().noneMatch(path -> Files.exists(Path.of(path))));
        if (failure != null) { var text = new StringWriter(); failure.printStackTrace(new PrintWriter(text)); event.put("failureStack", text.toString()); }
        event.set("data", mapper.valueToTree(data)); event.set("jdbcQuerySql", mapper.valueToTree(reads.jdbc)); event.set("hibernateAttemptSql", mapper.valueToTree(reads.hibernate));
        event.put("selectStatements", java.util.stream.Stream.concat(reads.jdbc.stream(), reads.hibernate.stream()).filter(sql -> sql.stripLeading().toLowerCase(Locale.ROOT).startsWith("select")).count());
        write(name + ".json", event);
        assertThat(event.path("snapshotsRemoved").asBoolean()).isTrue();
        if (expectedFailure == null) assertThat(failure).isNull(); else assertThat(failure).isInstanceOf(RuntimeException.class).hasStackTraceContaining(expectedFailure);
        return result;
    }
    private interface Action { ObjectNode get() throws IOException; }
    private Path output() throws IOException { Path folder = Path.of(System.getProperty("edhr.audit.attachmentWriteOutput")); Files.createDirectories(folder); return folder; }
    private ObjectNode observation(String name) throws IOException { return (ObjectNode) mapper.readTree(Files.readString(output().resolve(name + ".json"))); }
    private void write(String name, Object value) throws IOException { mapper.writerWithDefaultPrettyPrinter().writeValue(output().resolve(name).toFile(), value); }
    private static class Reads { final List<String> jdbc = new ArrayList<>(); final List<String> hibernate = new ArrayList<>(); }
    static class CountingJdbc extends JdbcTemplate {
        CountingJdbc(DataSource source) { super(source); }
        @Override public <T> T query(PreparedStatementCreator creator, PreparedStatementSetter setter, ResultSetExtractor<T> extractor) {
            String sql = creator instanceof SqlProvider provider ? provider.getSql() : "<unknown>";
            return super.query(creator, setter, rs -> { T result = extractor.extractData(rs); if (CURRENT.get() != null) CURRENT.get().jdbc.add(sql); return result; });
        }
    }
    @TestConfiguration static class Config {
        @Bean CountingJdbc countingJdbc(DataSource source) { return new CountingJdbc(source); }
        @Bean HibernatePropertiesCustomizer inspector() { return p -> p.put("hibernate.session_factory.statement_inspector", (StatementInspector) sql -> { if (CURRENT.get() != null) CURRENT.get().hibernate.add(sql); return sql; }); }
    }
}
