package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.*;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.imageio.ImageIO;
import javax.sql.DataSource;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Actual public submit prefix in an outer transaction; unrelated source/workflow dependencies are mocks. */
@EnabledIfEnvironmentVariable(named="EDHR_DHR_ATTACHMENT_TX_DATABASE_URL", matches="jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_attachment_transaction_test")
@SpringBootTest(classes={DhrAttachmentTransactionPostgresTest.Config.class,DhrAttachmentQueryObservationPostgresTest.Config.class},
        webEnvironment=SpringBootTest.WebEnvironment.NONE,
        properties={"spring.liquibase.enabled=false","spring.jpa.hibernate.ddl-auto=none","spring.jpa.open-in-view=false"})
@DirtiesContext(classMode=DirtiesContext.ClassMode.AFTER_CLASS)
class DhrAttachmentQueryObservationPostgresTest {
    @Autowired CountingJdbc jdbc;
    @Autowired PlatformTransactionManager manager;
    @Autowired DhrAttachmentService attachments;
    @Autowired AuditEventRepository audits;
    @TempDir Path directory;
    private final ObjectMapper mapper=new ObjectMapper();
    private DhrSummaryService summaries;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        p.add("spring.datasource.url",()->System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_URL"));
        p.add("spring.datasource.username",()->System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_USER"));
        p.add("spring.datasource.password",()->System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_PASSWORD"));
        p.add("spring.datasource.driver-class-name",()->"org.postgresql.Driver");
    }
    @BeforeEach void setup() throws Exception {
        jdbc.gate.set(null);
        String schema=Files.readString(Path.of("src/main/resources/db/changelog/baseline/0001-current-schema.sql"));
        for(String table:new String[]{"dhr_summary_review","dhr_summary_version","dhr_summary_draft","audit_event","dhr_attachment","dhr_instance","production_object"}) {
            jdbc.execute("DROP TABLE IF EXISTS "+table+" CASCADE");
            var ddl=Pattern.compile("CREATE TABLE public\\."+table+" \\(.*?\\n\\);",Pattern.DOTALL).matcher(schema);
            assertThat(ddl.find()).isTrue();jdbc.execute(ddl.group());
            if(!table.equals("dhr_summary_review"))jdbc.execute("ALTER TABLE "+table+" ADD PRIMARY KEY(id)");
        }
        jdbc.update("INSERT INTO production_object(id,tenant_id,work_order_id,object_no,object_type,process_version_id,target_quantity,status) VALUES(77,'default',10,'BATCH-1','BATCH',30,1,'COMPLETED')");
        jdbc.update("""
          INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,work_order_no,
            product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,context_snapshot,
            directory_snapshot,status,summary_status,created_at,updated_at)
          VALUES(1,'default','DHR-1',77,'BATCH-1','BATCH',10,'WO-10',20,30,40,50,60,'{}','{"directories":[]}',
            'COMPLETED','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
          """);
        var instances=mock(DhrInstanceService.class);var detail=mapper.createObjectNode().put("id","1");
        detail.putObject("directorySnapshot").putArray("directories");
        var origins=detail.putObject("recordsByOrigin");for(String name:new String[]{"directory","work","custom"})origins.putArray(name);
        when(instances.detail(1L)).thenAnswer(ignored->detail.deepCopy());
        summaries=new DhrSummaryService(jdbc,mapper,instances,audits,new SnowflakeIdGenerator(2),
                mock(com.zencas.edhr.workflow.engine.WorkflowEngine.class),mock(DhrEvidenceImpactService.class),
                attachments,mock(DhrFormFiles.class),mock(DhrFrozenEvidenceIntegrity.class));
    }
    private void seed(int count) throws Exception {
        jdbc.update("DELETE FROM dhr_attachment");jdbc.update("DELETE FROM dhr_summary_draft");
        byte[] bytes;
        try(var output=new ByteArrayOutputStream()) {
            assertThat(ImageIO.write(new BufferedImage(2,2,BufferedImage.TYPE_INT_RGB),"png",output)).isTrue();bytes=output.toByteArray();
        }
        String digest=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        for(int index=0;index<count;index++) {
            Path file=directory.resolve("original-"+index+".png");Files.write(file,bytes);
            jdbc.update("""
              INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,sha256,
                source_kind,purpose,active,verification_status,linked_at)
              VALUES(?,'default',1,?,?,'image/png',?,?,'OTHER','query observation',TRUE,'VERIFIED',CURRENT_TIMESTAMP)
              """,1000L+index,file.getFileName().toString(),file.toString(),bytes.length,digest);
        }
        String scope=summaries.workspace(1L).path("sourceScopeHash").asText();
        jdbc.update("INSERT INTO dhr_summary_draft(id,tenant_id,dhr_instance_id,overlay_directory_json,evidence_placement_json,revision,created_at,updated_at,source_scope_hash) VALUES(9000,'default',1,'[]','[]',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?)",scope);
    }
    private void submitUntilManualGuard() {
        ObjectNode command=mapper.createObjectNode().put("expectedDraftId","9000").put("expectedRevision",1);
        assertThatThrownBy(()->new TransactionTemplate(manager).executeWithoutResult(status->summaries.submit(1L,command)))
                .hasMessageContaining("请确认质量结论");
    }
    @Test void observeActualSubmitPrefixAcrossAttachmentCounts() throws Exception {
        var observations=new ArrayList<Map<String,Object>>();
        for(int count:new int[]{0,1,10,100,300}) {
            seed(count);jdbc.begin();long started=System.nanoTime();submitUntilManualGuard();
            var sql=jdbc.finish();assertThat(sql).noneMatch(s->s.equals("<unknown>"));
            var item=new LinkedHashMap<String,Object>();item.put("attachments",count);item.put("queries",sql.size());
            item.put("sql",sql);item.put("elapsedMillis",(System.nanoTime()-started)/1e6);observations.add(item);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_version",Integer.class)).isZero();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM dhr_summary_draft",Integer.class)).isEqualTo(1);
        }
        write("summary-prefix.json",Map.of("observations",observations,"limits","Actual public submit under explicit actual transaction to existing manual-review guard, no freeze writes. Seven canonical tables; detail/forms/impact/workflow dependencies mocked. Small actual PNGs; SQL count is successful JdbcTemplate statements, not driver setup, production latency, large-file SHA cost or full successful submit."));
    }
    @Test void parentDhrLockActuallySerializesLegitimateUnlink() throws Exception {
        seed(1);var reached=new CountDownLatch(1);var release=new CountDownLatch(1);var executor=Executors.newFixedThreadPool(2);
        jdbc.gate.set(()->{reached.countDown();try {assertThat(release.await(15,TimeUnit.SECONDS)).isTrue();}catch(InterruptedException e){Thread.currentThread().interrupt();throw new IllegalStateException(e);}});
        try {
            Future<?> submit=executor.submit(this::submitUntilManualGuard);assertThat(reached.await(10,TimeUnit.SECONDS)).isTrue();
            Future<?> unlink=executor.submit(()->attachments.unlink(1L,1000L,"concurrent observation"));
            boolean waiting=false;long deadline=System.nanoTime()+TimeUnit.SECONDS.toNanos(10);
            while(System.nanoTime()<deadline) {
                waiting=Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE 'SELECT status,summary_status FROM dhr_instance%FOR UPDATE%')",Boolean.class));
                if(waiting)break;Thread.sleep(20);
            }
            assertThat(waiting).isTrue();assertThat(jdbc.queryForObject("SELECT active FROM dhr_attachment WHERE id=1000",Boolean.class)).isTrue();
            release.countDown();submit.get(15,TimeUnit.SECONDS);unlink.get(15,TimeUnit.SECONDS);
            assertThat(jdbc.queryForObject("SELECT active FROM dhr_attachment WHERE id=1000",Boolean.class)).isFalse();
            assertThat(attachments.file(1L,1000L)).exists();
            write("parent-lock.json",Map.of("actualPgLockWaitObserved",true,"activeWhileParentLocked",true,"unlinkCommittedAfterRelease",true,"historicalOriginalRetained",true,"boundary","Legitimate service unlink vs submit preflight, not arbitrary SQL writers or all deployment concurrency."));
        } finally {release.countDown();executor.shutdownNow();jdbc.gate.set(null);}
    }
    private void write(String name,Object value) throws Exception {
        String output=System.getenv("EDHR_ATTACHMENT_QUERY_OUTPUT");
        if(output!=null) {Path folder=Path.of(output);Files.createDirectories(folder);mapper.writerWithDefaultPrettyPrinter().writeValue(folder.resolve(name).toFile(),value);}
    }
    static class CountingJdbc extends JdbcTemplate {
        final AtomicReference<Runnable> gate=new AtomicReference<>();
        private final ThreadLocal<List<String>> sql=new ThreadLocal<>();
        CountingJdbc(DataSource source){super(source);}
        void begin(){sql.set(new ArrayList<>());}
        List<String> finish(){var result=List.copyOf(sql.get());sql.remove();return result;}
        @Override public <T>T query(PreparedStatementCreator creator,PreparedStatementSetter setter,ResultSetExtractor<T> extractor) {
            String query=creator instanceof SqlProvider provider?provider.getSql():"<unknown>";
            return super.query(creator,setter,resultSet->{
                T result=extractor.extractData(resultSet);if(sql.get()!=null)sql.get().add(query);
                if(query.startsWith("SELECT * FROM dhr_attachment ")) {Runnable action=gate.getAndSet(null);if(action!=null)action.run();}
                return result;
            });
        }
    }
    @Configuration static class Config {@Bean CountingJdbc jdbc(DataSource source){return new CountingJdbc(source);}}
}
