package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.production.controller.DhrAttachmentController;
import jdk.jfr.Recording;
import jdk.jfr.consumer.RecordingFile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import javax.imageio.ImageIO;
import javax.sql.DataSource;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.lang.management.ManagementFactory;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;

/** Opt-in observations of the in-process controller/service/resource path, not HTTP or a production SLA. */
@EnabledIfEnvironmentVariable(named = "EDHR_DHR_ATTACHMENT_TX_DATABASE_URL", matches = "jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_attachment_transaction_test")
@EnabledIfEnvironmentVariable(named = "EDHR_ATTACHMENT_CAPACITY_OUTPUT", matches = "/tmp/.+")
@SpringBootTest(classes = {DhrAttachmentTransactionPostgresTest.Config.class, DhrAttachmentDownloadCapacityPostgresTest.Config.class},
        webEnvironment = SpringBootTest.WebEnvironment.NONE,
        properties = {"spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.open-in-view=false"})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class DhrAttachmentDownloadCapacityPostgresTest {
    private static final long SIZE = 50L * 1024 * 1024;
    @Autowired CountingJdbc jdbc;
    @Autowired DhrAttachmentService attachments;
    @TempDir Path directory;

    @DynamicPropertySource static void database(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_PASSWORD"));
        properties.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Test void observeCurrentAndFrozenGoodAndCorruptFilesAtOneFourSixteenConcurrency() throws Exception {
        Path output = Path.of(System.getenv("EDHR_ATTACHMENT_CAPACITY_OUTPUT")); Files.createDirectories(output);
        try (var paths = Files.list(output)) { assertThat(paths.findAny()).isEmpty(); }
        String schema = Files.readString(Path.of("src/main/resources/db/changelog/baseline/0001-current-schema.sql"));
        for (String table : new String[]{"dhr_summary_version", "audit_event", "dhr_attachment", "dhr_instance"}) {
            jdbc.execute("DROP TABLE IF EXISTS " + table + " CASCADE");
            var ddl = Pattern.compile("CREATE TABLE public\\." + table + " \\(.*?\\n\\);", Pattern.DOTALL).matcher(schema);
            assertThat(ddl.find()).isTrue(); jdbc.execute(ddl.group()); jdbc.execute("ALTER TABLE " + table + " ADD PRIMARY KEY(id)");
        }
        jdbc.update("""
            INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,
              work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,
              context_snapshot,directory_snapshot,status,summary_status,created_at,updated_at)
            VALUES(1,'default','DHR-1',77,'BATCH-1','BATCH',10,'WO-10',20,30,40,50,60,'{}','[]',
              'COMPLETED','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
            """);
        Path original = directory.resolve("capacity.png");
        try (var bytes = new ByteArrayOutputStream()) {
            assertThat(ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes)).isTrue();
            Files.write(original, bytes.toByteArray());
        }
        try (var channel = FileChannel.open(original, StandardOpenOption.WRITE)) {
            channel.position(SIZE - 1); channel.write(ByteBuffer.wrap(new byte[]{0}));
        }
        String digest;
        try (var input = Files.newInputStream(original)) {
            var hash = MessageDigest.getInstance("SHA-256"); byte[] buffer = new byte[65536]; int count;
            while ((count = input.read(buffer)) >= 0) if (count > 0) hash.update(buffer, 0, count);
            digest = HexFormat.of().formatHex(hash.digest());
        }
        jdbc.update("""
            INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,
              sha256,source_kind,purpose,active,verification_status,linked_at)
            VALUES(77,'default',1,'capacity.png',?,'image/png',?,?,'OTHER','capacity fixture',TRUE,'VERIFIED',CURRENT_TIMESTAMP)
            """, original.toString(), SIZE, digest);
        jdbc.update("""
            INSERT INTO dhr_summary_version(id,tenant_id,dhr_instance_id,version_no,status,review_mode,
              base_directory_snapshot,overlay_directory_snapshot,candidate_snapshot,snapshot_hash,
              submitted_at,created_at,check_result_snapshot,attachment_snapshot)
            VALUES(10,'default',1,1,'FORMALIZED','NONE','[]','[]','[]',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'{}',?)
            """, "0".repeat(64), "[{\"id\":\"77\",\"sha256\":\"" + digest + "\"}]");
        var allocated = (com.sun.management.ThreadMXBean) ManagementFactory.getThreadMXBean();
        assertThat(allocated.isThreadAllocatedMemorySupported()).isTrue(); allocated.setThreadAllocatedMemoryEnabled(true);
        var report = new LinkedHashMap<String, Object>(); var cases = new ArrayList<Map<String, Object>>();
        report.put("completed", false); report.put("cases", cases); report.put("bytesPerFile", SIZE);
        report.put("javaVersion", System.getProperty("java.version")); report.put("jvmArgs", ManagementFactory.getRuntimeMXBean().getInputArguments());
        report.put("processors", Runtime.getRuntime().availableProcessors()); report.put("database", jdbc.queryForObject("SELECT version()", String.class));
        report.put("limits", "Warm-page-cache synthetic padded PNG; four canonical tables/fixture version metadata; actual service proxy and controller/resource call, no HTTP/auth/network or production SLA. Allocations include JDBC/assertions/body checksum; heap/JFR sampling adds overhead. Explicit JdbcTemplate counts exclude driver/transaction setup. Body buffer64KiB. Query fixture snapshot does not certify full DHR freezing.");
        try {
            for (boolean frozen : new boolean[]{false, true}) for (boolean corrupt : new boolean[]{false, true}) {
                try (var channel = FileChannel.open(original, StandardOpenOption.WRITE)) {
                    channel.position(SIZE - 2); channel.write(ByteBuffer.wrap(new byte[]{(byte) (corrupt ? 1 : 0)}));
                }
                for (int concurrency : new int[]{1, 4, 16}) {
                    var observed = observe(original, output, frozen, corrupt, concurrency, digest, allocated);
                    cases.add(observed);
                    System.out.println("ATTACHMENT_CAPACITY " + new ObjectMapper().writeValueAsString(observed));
                }
            }
            report.put("completed", true);
        } finally { new ObjectMapper().writerWithDefaultPrettyPrinter().writeValue(output.resolve("capacity.json").toFile(), report); }
    }

    private Map<String, Object> observe(Path original, Path output, boolean frozen, boolean corrupt, int concurrency,
                                        String digest, com.sun.management.ThreadMXBean allocated) throws Exception {
        String label = (frozen ? "frozen" : "current") + (corrupt ? "-corrupt-" : "-good-") + concurrency;
        var recording = new Recording(); recording.enable("jdk.FileRead").withThreshold(Duration.ZERO).withoutStackTrace(); recording.start();
        var pool = Executors.newFixedThreadPool(concurrency); var sampler = Executors.newSingleThreadScheduledExecutor();
        var ready = new CountDownLatch(concurrency); var start = new CountDownLatch(1); var memory = ManagementFactory.getMemoryMXBean();
        var futures = new ArrayList<Future<Map<String, Object>>>(); var peak = new AtomicLong();
        long baseline = 0, wallStart = 0, wallNanos;
        try {
            for (int index = 0; index < concurrency; index++) futures.add(pool.submit(() -> {
                ready.countDown(); start.await();
                long thread = Thread.currentThread().threadId(), before = allocated.getThreadAllocatedBytes(thread), began = System.nanoTime();
                jdbc.begin(); long bytes = 0; boolean rejected = false;
                try {
                    var response = new DhrAttachmentController(attachments).download(1L, 77L, frozen ? 10L : null);
                    assertThat(corrupt).isFalse();
                    var hash = MessageDigest.getInstance("SHA-256"); byte[] buffer = new byte[65536]; int count;
                    try (var input = response.getBody().getInputStream()) {
                        while ((count = input.read(buffer)) >= 0) if (count > 0) { bytes += count; hash.update(buffer, 0, count); }
                    }
                    assertThat(bytes).isEqualTo(SIZE); assertThat(HexFormat.of().formatHex(hash.digest())).isEqualTo(digest);
                } catch (BusinessException failure) {
                    assertThat(corrupt).isTrue(); assertThat(failure.getMessage()).contains("丢失或摘要不一致"); rejected = true;
                }
                long allocation = allocated.getThreadAllocatedBytes(thread) - before;
                var item = new LinkedHashMap<String, Object>(); item.put("threadId", thread); item.put("durationMillis", (System.nanoTime() - began) / 1e6);
                item.put("allocatedBytes", allocation); item.put("bodyBytes", bytes); item.put("rejectedBeforeBody", rejected);
                item.put("jdbcQueries", jdbc.finish()); return item;
            }));
            assertThat(ready.await(30, TimeUnit.SECONDS)).isTrue();
            System.gc(); baseline = memory.getHeapMemoryUsage().getUsed(); peak.set(baseline);
            sampler.scheduleAtFixedRate(() -> peak.accumulateAndGet(memory.getHeapMemoryUsage().getUsed(), Math::max), 0, 5, TimeUnit.MILLISECONDS);
            wallStart = System.nanoTime(); start.countDown();
            var requests = new ArrayList<Map<String, Object>>();
            for (var future : futures) requests.add(future.get(90, TimeUnit.SECONDS));
            wallNanos = System.nanoTime() - wallStart;
            var observed = new LinkedHashMap<String, Object>(); observed.put("label", label); observed.put("concurrency", concurrency);
            observed.put("frozen", frozen); observed.put("corrupt", corrupt); observed.put("requests", requests);
            observed.put("wallMillis", wallNanos / 1e6); observed.put("heapBaselineBytes", baseline); observed.put("sampledPeakHeapBytes", peak.get());
            observed.put("sampledHeapIncreaseBytes", Math.max(0, peak.get() - baseline));
            return observed;
        } finally {
            start.countDown(); pool.shutdownNow(); sampler.shutdownNow();
            recording.stop(); Path file = output.resolve(label + ".jfr"); recording.dump(file); recording.close();
            long reads = 0, events = 0;
            for (var event : RecordingFile.readAllEvents(file)) if (event.getEventType().getName().equals("jdk.FileRead")
                    && original.toString().equals(event.getString("path"))) { reads += Math.max(0, event.getLong("bytesRead")); events++; }
            // Keep measured JFR bytes separately, including EOF events; no expected read-count assumption.
            Files.writeString(output.resolve(label + "-reads.json"), new ObjectMapper().writeValueAsString(Map.of("targetFileReadBytes", reads, "fileReadEvents", events, "measurementAvailable", events > 0)));
        }
    }

    static class CountingJdbc extends JdbcTemplate {
        private final ThreadLocal<List<String>> queries = new ThreadLocal<>();
        CountingJdbc(DataSource source) { super(source); }
        void begin() { queries.set(new ArrayList<>()); }
        List<String> finish() { var result = List.copyOf(queries.get()); queries.remove(); return result; }
        private void counted(String sql) { if (queries.get() != null) queries.get().add(sql); }
        @Override public List<Map<String, Object>> queryForList(String sql, Object... args) {
            var result = super.queryForList(sql, args); counted(sql); return result;
        }
        @Override public <T> T queryForObject(String sql, Class<T> type, Object... args) {
            T result = super.queryForObject(sql, type, args); counted(sql); return result;
        }
    }
    @Configuration static class Config { @Bean CountingJdbc jdbc(DataSource source) { return new CountingJdbc(source); } }
}
