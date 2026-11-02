package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.production.controller.DhrAttachmentController;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.*;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import javax.imageio.ImageIO;
import javax.sql.DataSource;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;

/** Actual proxy/controller/resource/PG; no HTTP, full migration install or production SLA claim. */
@EnabledIfEnvironmentVariable(named="EDHR_DHR_ATTACHMENT_TX_DATABASE_URL", matches="jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_dhr_attachment_transaction_test")
@SpringBootTest(classes={DhrAttachmentTransactionPostgresTest.Config.class,DhrAttachmentDownloadMetadataPostgresTest.Config.class},
        webEnvironment=SpringBootTest.WebEnvironment.NONE,
        properties={"spring.liquibase.enabled=false","spring.jpa.hibernate.ddl-auto=none","spring.jpa.open-in-view=false"})
@DirtiesContext(classMode=DirtiesContext.ClassMode.AFTER_CLASS)
class DhrAttachmentDownloadMetadataPostgresTest {
    @Autowired CountingJdbc jdbc;
    @Autowired DhrAttachmentService attachments;
    @TempDir Path directory;
    private static final String NAME="委外 检验报告.png";
    private byte[] bytes;
    private Path original;
    private String digest;
    private final ObjectMapper mapper=new ObjectMapper();

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        p.add("spring.datasource.url",()->System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_URL"));
        p.add("spring.datasource.username",()->System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_USER"));
        p.add("spring.datasource.password",()->System.getenv("EDHR_DHR_ATTACHMENT_TX_DATABASE_PASSWORD"));
        p.add("spring.datasource.driver-class-name",()->"org.postgresql.Driver");
    }
    @BeforeEach void setup() throws Exception {
        String schema=Files.readString(Path.of("src/main/resources/db/changelog/baseline/0001-current-schema.sql"));
        for(String table:new String[]{"dhr_summary_version","audit_event","dhr_attachment","dhr_instance"}) {
            jdbc.execute("DROP TABLE IF EXISTS "+table+" CASCADE");
            var ddl=Pattern.compile("CREATE TABLE public\\."+table+" \\(.*?\\n\\);",Pattern.DOTALL).matcher(schema);
            assertThat(ddl.find()).isTrue();jdbc.execute(ddl.group());jdbc.execute("ALTER TABLE "+table+" ADD PRIMARY KEY(id)");
        }
        jdbc.update("""
            INSERT INTO dhr_instance(id,tenant_id,dhr_no,production_object_id,object_no,object_type,work_order_id,
              work_order_no,product_id,process_version_id,route_version_id,dhr_template_id,dhr_template_version_id,
              context_snapshot,directory_snapshot,status,summary_status,created_at,updated_at)
            SELECT id,'default','DHR-'||id,77,'BATCH-1','BATCH',10,'WO-10',20,30,40,50,60,'{}','[]',
              'COMPLETED','DRAFT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM generate_series(1,2) id
            """);
        try(var output=new ByteArrayOutputStream()) {
            assertThat(ImageIO.write(new BufferedImage(2,2,BufferedImage.TYPE_INT_RGB),"png",output)).isTrue();bytes=output.toByteArray();
        }
        original=directory.resolve("original.png");Files.write(original,bytes);
        digest=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        jdbc.update("""
            INSERT INTO dhr_attachment(id,tenant_id,dhr_instance_id,original_name,stored_path,mime_type,file_size,
              sha256,source_kind,purpose,active,verification_status,linked_at)
            VALUES(77,'default',1,?,?,'image/png',?,?,'OTHER','metadata read fixture',TRUE,'VERIFIED',CURRENT_TIMESTAMP)
            """,NAME,original.toString(),bytes.length,digest);
        var frozen=mapper.createArrayNode();frozen.addObject().put("id","77").put("sha256",digest);
        jdbc.update("""
            INSERT INTO dhr_summary_version(id,tenant_id,dhr_instance_id,version_no,status,review_mode,
              base_directory_snapshot,overlay_directory_snapshot,candidate_snapshot,snapshot_hash,
              submitted_at,created_at,check_result_snapshot,attachment_snapshot)
            VALUES(10,'default',1,1,'FORMALIZED','NONE','[]','[]','[]',?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'{}',?)
            ""","0".repeat(64),frozen.toString());
    }
    @ParameterizedTest @ValueSource(booleans={false,true})
    void validResponseReusesNameAndRetainsBothDhrReads(boolean frozen) throws Exception {
        jdbc.begin();
        var response=new DhrAttachmentController(attachments).download(1L,77L,frozen?10L:null);
        assertThat(response.getHeaders().getContentDisposition().toString()).isEqualTo(
                ContentDisposition.attachment().filename(NAME,StandardCharsets.UTF_8).build().toString());
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_OCTET_STREAM);
        assertThat(response.getHeaders().getFirst("X-Content-Type-Options")).isEqualTo("nosniff");
        try(var input=response.getBody().getInputStream()) {assertThat(input.readAllBytes()).isEqualTo(bytes);}
        List<String> sql=jdbc.finish();assertThat(sql).hasSize(frozen?5:4);
        assertThat(sql.stream().filter(s->s.startsWith("SELECT status,summary_status FROM dhr_instance ")).count()).isEqualTo(2);
        assertThat(sql).noneMatch(s->s.equals("<unknown>")||s.startsWith("SELECT original_name FROM "));
        assertThat(attachments.snapshot(1L).toString()).doesNotContain(directory.toString());
        write("valid-"+frozen+".json",Map.of("frozen",frozen,"sql",sql,"fullBytesAndHeadersPreserved",true));
    }
    @ParameterizedTest @ValueSource(booleans={false,true})
    void corruptOriginalStillRejectsBeforeResponse(boolean frozen) throws Exception {
        Files.write(original,new byte[]{1,2,3});
        assertThatThrownBy(()->new DhrAttachmentController(attachments).download(1L,77L,frozen?10L:null))
                .hasMessageContaining("附件丢失或摘要不一致");
    }
    @ParameterizedTest @ValueSource(booleans={false,true})
    void missingOriginalStillRejectsBeforeResponse(boolean frozen) throws Exception {
        Files.delete(original);
        assertThatThrownBy(()->new DhrAttachmentController(attachments).download(1L,77L,frozen?10L:null))
                .hasMessageContaining("附件丢失或摘要不一致");
    }
    @Test void unlinkedOriginalRequiresItsFrozenVersion() throws Exception {
        jdbc.update("UPDATE dhr_attachment SET active=FALSE WHERE id=77");
        assertThatThrownBy(()->new DhrAttachmentController(attachments).download(1L,77L,null)).hasMessageContaining("已解除关联");
        var response=new DhrAttachmentController(attachments).download(1L,77L,10L);
        assertThat(response.getHeaders().getContentDisposition().getFilename()).isEqualTo(NAME);
        try(var input=response.getBody().getInputStream()) {assertThat(input.readAllBytes()).isEqualTo(bytes);}
        assertThat(attachments.file(1L,77L)).isEqualTo(original);
    }
    @ParameterizedTest @ValueSource(strings={"[]","[{\"id\":\"78\",\"sha256\":\"DIGEST\"}]","[{\"id\":\"77\",\"sha256\":\"wrong\"}]"})
    void frozenMembershipStillRequiresBothIdAndHash(String snapshot) {
        jdbc.update("UPDATE dhr_summary_version SET attachment_snapshot=? WHERE id=10",snapshot.replace("DIGEST",digest));
        assertThatThrownBy(()->new DhrAttachmentController(attachments).download(1L,77L,10L)).hasMessageContaining("不属于指定的冻结版本");
    }
    @Test void wrongDhrVersionAndTenantDoNotResolveOriginal() {
        var controller=new DhrAttachmentController(attachments);
        assertThatThrownBy(()->controller.download(2L,77L,null)).hasMessageContaining("附件不存在");
        assertThatThrownBy(()->controller.download(1L,77L,20L)).hasMessageContaining("冻结版本不存在");
        jdbc.update("UPDATE dhr_summary_version SET dhr_instance_id=2 WHERE id=10");
        assertThatThrownBy(()->controller.download(1L,77L,10L)).hasMessageContaining("冻结版本不存在");
        jdbc.update("UPDATE dhr_attachment SET tenant_id='other' WHERE id=77");
        assertThatThrownBy(()->controller.download(1L,77L,null)).hasMessageContaining("附件不存在");
    }
    private void write(String name,Object data) throws Exception {
        String output=System.getenv("EDHR_DOWNLOAD_METADATA_OUTPUT");
        if(output!=null) {Path folder=Path.of(output);Files.createDirectories(folder);mapper.writerWithDefaultPrettyPrinter().writeValue(folder.resolve(name).toFile(),data);}
    }
    static class CountingJdbc extends JdbcTemplate {
        private final ThreadLocal<List<String>> sql=new ThreadLocal<>();
        CountingJdbc(DataSource source){super(source);}
        void begin(){sql.set(new ArrayList<>());}
        List<String> finish(){var list=List.copyOf(sql.get());sql.remove();return list;}
        @Override public <T>T query(PreparedStatementCreator creator,PreparedStatementSetter setter,ResultSetExtractor<T> extractor) {
            String query=creator instanceof SqlProvider provider?provider.getSql():"<unknown>";
            T result=super.query(creator,setter,extractor);if(sql.get()!=null)sql.get().add(query);return result;
        }
    }
    @Configuration static class Config {@Bean CountingJdbc jdbc(DataSource source){return new CountingJdbc(source);}}
}
