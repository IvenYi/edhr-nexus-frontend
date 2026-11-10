package com.zencas.edhr.masterdata.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.masterdata.entity.ProductFamilyMember;
import com.zencas.edhr.masterdata.repository.ProductFamilyMemberRepository;
import com.zencas.edhr.production.service.FormProjectionWorker;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.file.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/** Real canonical PG/JPA/proxy/audits. SQL comments observe calls; test-only triggers inject failures. */
@EnabledIfSystemProperty(named="edhr.audit.familyTransfer",matches="true")
@EnabledIfEnvironmentVariable(named="FAMILY_TRANSFER_DATABASE_URL",matches="jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_family_transfer_test_[a-z0-9_]+")
@SpringBootTest(properties={"spring.jpa.hibernate.ddl-auto=none","spring.liquibase.enabled=true","spring.jpa.open-in-view=false","spring.jpa.show-sql=false"})
@AutoConfigureMockMvc
@Import(ProductFamilyTransferPostgresTest.ObservationConfig.class)
class ProductFamilyTransferPostgresTest {
    private static final ThreadLocal<Observation> CURRENT=new ThreadLocal<>();
    private static final String TRANSFER="/api/v1/master-data/process-modeling/product-families/12/members/101/transfer";
    @Autowired ProductFamilyMembershipService service;
    @Autowired ProductFamilyMemberRepository members;
    @Autowired AuditEventRepository audits;
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager entityManager;
    @Autowired PlatformTransactionManager transactionManager;
    @Autowired ObjectMapper mapper;
    @Autowired MockMvc mvc;
    @Autowired JwtTokenProvider tokens;
    @MockBean FormProjectionWorker projectionWorker;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p){
        String url=System.getenv("FAMILY_TRANSFER_DATABASE_URL");
        if(url==null||!url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_family_transfer_test_[a-z0-9_]+"))throw new IllegalStateException("Disposable family transfer database required");
        p.add("spring.datasource.url",()->url);p.add("spring.datasource.username",()->System.getenv("PGUSER"));
        p.add("spring.datasource.password",()->"");p.add("spring.datasource.driver-class-name",()->"org.postgresql.Driver");
    }
    @BeforeEach void seed(){
        dropFailureFixtures();
        jdbc.execute("TRUNCATE product_family_member,product_family,material,audit_event CASCADE");
        jdbc.update("INSERT INTO product_family(id,tenant_id,code,name) VALUES(11,'default','PF-SOURCE','原产品簇'),(12,'default','PF-TARGET','目标产品簇')");
        jdbc.update("INSERT INTO material(id,tenant_id,code,name,material_type_id) VALUES(101,'default','PRODUCT-101','转移产品',(SELECT id FROM material_type WHERE code='MT-FINISHED' AND tenant_id='default')),(102,'default','MATERIAL-102','非产品物料',NULL),(103,'default','PRODUCT-103','未归属产品',(SELECT id FROM material_type WHERE code='MT-FINISHED' AND tenant_id='default'))");
        jdbc.update("INSERT INTO product_family_member(id,tenant_id,product_family_id,product_id,created_by,created_at,updated_by,updated_at) VALUES(201,'default',11,101,'旧记录人','2020-01-01','旧记录人','2020-01-01')");
        operator();
    }
    @AfterEach void cleanup(){CURRENT.remove();AuditContext.clear();dropFailureFixtures();}
    private void operator(){AuditContext.setOperator("901","簇成员审查员","family-transfer-qa");AuditContext.setIpAddress("127.0.0.1");}

    @Test void committedTransferPreservesNewIdentityAndThreeAccurateAudits()throws Exception{
        var transferred=observe("native-transfer",()->service.transferMember(12L,101L));
        assertTransferred(transferred.getId());
    }
    @Test void confirmedAuthorizedHttpTransferCommitsThroughActualProxy()throws Exception{
        var response=observe("http-transfer",()->mvc.perform(post(TRANSFER).param("confirmed","true").header("Authorization",bearer(List.of("master-data.product-families")))).andReturn().getResponse());
        assertThat(response.getStatus()).as(response.getContentAsString()).isEqualTo(200);
        assertTransferred(mapper.readTree(response.getContentAsString()).path("data").path("id").asLong());
    }
    @Test void confirmationIsStillRequiredWithoutAReasonField()throws Exception{
        String before=membershipSnapshot();
        var response=observe("unconfirmed",()->mvc.perform(post(TRANSFER).header("Authorization",bearer(List.of("master-data.product-families")))).andReturn().getResponse());
        assertThat(response.getStatus()).isEqualTo(400);assertUnchanged(before);
    }
    @Test void anonymousAndMissingPermissionCannotMutateMembership()throws Exception{
        String before=membershipSnapshot();
        assertThat(observe("anonymous",()->mvc.perform(post(TRANSFER).param("confirmed","true")).andReturn().getResponse()).getStatus()).isEqualTo(401);
        assertThat(observe("missing-authority",()->mvc.perform(post(TRANSFER).param("confirmed","true").header("Authorization",bearer(List.of("dhr.instances.view")))).andReturn().getResponse()).getStatus()).isEqualTo(403);
        assertUnchanged(before);
    }
    @Test void sameFamilyIsANoOpWithOriginalIdentityAndNoAudits()throws Exception{
        String before=membershipSnapshot();var unchanged=observe("same-family",()->service.transferMember(11L,101L));
        assertThat(unchanged.getId()).isEqualTo(201L);assertUnchanged(before);
    }
    @Test void ineligibleMaterialAndUnassignedProductAreStillRejected()throws Exception{
        String before=membershipSnapshot();
        assertThatThrownBy(()->observe("ineligible",()->service.transferMember(12L,102L))).hasMessageContaining("半成品或产成品");
        assertThatThrownBy(()->observe("unassigned",()->service.transferMember(12L,103L))).hasMessageContaining("未归属");assertUnchanged(before);
    }
    @Test void missingFamilyOrProductDoesNotChangeExistingMembership()throws Exception{
        String before=membershipSnapshot();
        assertThatThrownBy(()->observe("missing-family",()->service.transferMember(999999L,101L))).isInstanceOf(com.zencas.edhr.common.exception.BusinessException.class);
        assertThatThrownBy(()->observe("missing-product",()->service.transferMember(12L,999999L))).isInstanceOf(com.zencas.edhr.common.exception.BusinessException.class);assertUnchanged(before);
    }
    @Test void thirdAuditInsertFailureRollsBackMemberAndEarlierAudits()throws Exception{
        String before=membershipSnapshot();
        jdbc.execute("CREATE SEQUENCE edhr_test_family_audit_attempts");
        jdbc.execute("CREATE FUNCTION edhr_test_family_audit_failure() RETURNS trigger LANGUAGE plpgsql AS $$ DECLARE n bigint; BEGIN IF NEW.function_name='编辑产品簇成员' THEN n:=nextval('edhr_test_family_audit_attempts'); IF n=3 THEN RAISE EXCEPTION 'edhr_test_family_audit_failure' USING ERRCODE='23514'; END IF; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER edhr_test_family_audit_failure BEFORE INSERT ON audit_event FOR EACH ROW EXECUTE FUNCTION edhr_test_family_audit_failure()");
        assertThatThrownBy(()->observe("audit-failure",()->service.transferMember(12L,101L))).hasStackTraceContaining("edhr_test_family_audit_failure");
        assertThat(jdbc.queryForObject("SELECT last_value FROM edhr_test_family_audit_attempts",Long.class)).isEqualTo(3L);
        assertUnchanged(before);
    }
    @Test void newMemberInsertFailureStillRestoresTheDeletedOldMember()throws Exception{
        String before=membershipSnapshot();
        jdbc.execute("CREATE FUNCTION edhr_test_family_member_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.product_family_id=12 THEN RAISE EXCEPTION 'edhr_test_family_member_failure' USING ERRCODE='23514'; END IF; RETURN NEW; END $$");
        jdbc.execute("CREATE TRIGGER edhr_test_family_member_failure BEFORE INSERT ON product_family_member FOR EACH ROW EXECUTE FUNCTION edhr_test_family_member_failure()");
        assertThatThrownBy(()->observe("member-failure",()->service.transferMember(12L,101L))).hasStackTraceContaining("edhr_test_family_member_failure");assertUnchanged(before);
    }
    @Test void externalReaderSeesOldMembershipUntilWholeTransferCommits()throws Exception{
        var prepared=new CountDownLatch(1);var release=new CountDownLatch(1);var pool=Executors.newSingleThreadExecutor();
        var result=CompletableFuture.runAsync(()->{
            operator();
            try{
                observe("uncommitted-transfer",()->new TransactionTemplate(transactionManager).execute(status->{
                    service.transferMember(12L,101L);entityManager.flush();prepared.countDown();
                    try{if(!release.await(8,TimeUnit.SECONDS))throw new IllegalStateException("fixture release timeout");}catch(InterruptedException ex){Thread.currentThread().interrupt();throw new IllegalStateException(ex);}return null;
                }));
            }catch(Exception ex){throw new CompletionException(ex);}finally{AuditContext.clear();CURRENT.remove();}
        },pool);
        try{
            org.awaitility.Awaitility.await().atMost(Duration.ofSeconds(6)).until(()->prepared.getCount()==0||result.isDone());
            assertThat(result.isCompletedExceptionally()).as("transfer must reach the pre-commit gate without unique failure").isFalse();
            assertThat(prepared.getCount()).isZero();
            assertThat(jdbc.queryForObject("SELECT product_family_id FROM product_family_member WHERE product_id=101",Long.class)).isEqualTo(11L);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event",Integer.class)).isZero();
            release.countDown();result.get(6,TimeUnit.SECONDS);assertTransferred(members.findByTenantIdAndProductId("default",101L).orElseThrow().getId());
        }finally{release.countDown();pool.shutdown();assertThat(pool.awaitTermination(10,TimeUnit.SECONDS)).isTrue();}
    }
    @ParameterizedTest @ValueSource(ints={1,10,100})
    void bulkAddReadsAreObservedWithoutChangingTheExistingAlgorithm(int count)throws Exception{
        for(int i=0;i<count;i++)jdbc.update("INSERT INTO material(id,tenant_id,code,name,material_type_id) VALUES(?,'default',?,'批量产品',(SELECT id FROM material_type WHERE code='MT-FINISHED' AND tenant_id='default'))",1000L+i,"BULK-"+i);
        var ids=java.util.stream.LongStream.range(1000,1000+count).boxed().toList();
        var added=observe("bulk-"+count,()->service.addMembers(12L,ids));
        assertThat(added).hasSize(count);assertThat(members.countByTenantIdAndProductFamilyId("default",12L)).isEqualTo(count);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event",Integer.class)).isEqualTo(2*count);
        for(var event:audits.findAll())assertThat(event.getSnapshotHash()).isEqualTo(event.computeSnapshotHash());
    }
    private void assertTransferred(Long id)throws Exception{
        var saved=members.findByTenantIdAndProductId("default",101L).orElseThrow();
        assertThat(saved.getId()).isEqualTo(id).isNotEqualTo(201L);assertThat(saved.getProductFamilyId()).isEqualTo(12L);
        assertThat(saved.getCreatedBy()).isEqualTo("簇成员审查员");assertThat(saved.getCreatedAt()).isAfter(java.time.LocalDateTime.of(2020,1,1,0,0));
        assertThat(members.findById(201L)).isEmpty();assertThat(jdbc.queryForObject("SELECT count(*) FROM product_family_member WHERE product_id=101",Integer.class)).isEqualTo(1);
        List<AuditEvent> events=audits.findAll();assertThat(events).hasSize(3);
        assertThat(events).extracting(e->e.getEntityType()+":"+e.getEntityId()).containsExactlyInAnyOrder("PRODUCT:101","PRODUCT_FAMILY:11","PRODUCT_FAMILY:12");
        for(var e:events){
            assertThat(e.getAction()).isEqualTo("UPDATE");assertThat(e.getOperatorId()).isEqualTo("901");assertThat(e.getOperatorName()).isEqualTo("簇成员审查员");
            assertThat(e.getSnapshotHashVersion()).isEqualTo("audit-event-v2");assertThat(e.getSnapshotHash()).isEqualTo(e.computeSnapshotHash());
            var before=mapper.readTree(e.getContentBefore());var after=mapper.readTree(e.getContentAfter());
            if(e.getEntityType().equals("PRODUCT")){assertThat(before.path("productFamilyId").asLong()).isEqualTo(11);assertThat(after.path("productFamilyId").asLong()).isEqualTo(12);}
            else if(e.getEntityId().equals("11")){assertThat(before.path("memberProductId").asLong()).isEqualTo(101);assertThat(after.isEmpty()).isTrue();}
            else{assertThat(before.isEmpty()).isTrue();assertThat(after.path("memberProductId").asLong()).isEqualTo(101);}
        }
    }
    private String bearer(List<String> permissions){return "Bearer "+tokens.generateToken("901","family-transfer-qa","簇成员审查员",5,permissions);}
    private String membershipSnapshot(){return jdbc.queryForObject("SELECT coalesce(jsonb_agg(to_jsonb(m) ORDER BY id),'[]'::jsonb)::text FROM product_family_member m",String.class);}
    private void assertUnchanged(String before){assertThat(membershipSnapshot()).isEqualTo(before);assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event",Integer.class)).isZero();}
    private void dropFailureFixtures(){
        jdbc.execute("DROP TRIGGER IF EXISTS edhr_test_family_audit_failure ON audit_event");jdbc.execute("DROP TRIGGER IF EXISTS edhr_test_family_member_failure ON product_family_member");
        jdbc.execute("DROP FUNCTION IF EXISTS edhr_test_family_audit_failure()");jdbc.execute("DROP FUNCTION IF EXISTS edhr_test_family_member_failure()");jdbc.execute("DROP SEQUENCE IF EXISTS edhr_test_family_audit_attempts");
    }
    private <T>T observe(String name,Callable<T> body)throws Exception{
        var observation=new Observation(name);CURRENT.set(observation);long start=System.nanoTime();
        try{return body.call();}catch(Exception|Error ex){observation.failure=ex.getClass().getName();throw ex;}
        finally{
            CURRENT.remove();observation.elapsedNanos=System.nanoTime()-start;
            observation.committedMembers=membershipSnapshot();
            observation.committedAudits=jdbc.queryForObject("SELECT coalesce(jsonb_agg(to_jsonb(a) ORDER BY id),'[]'::jsonb)::text FROM audit_event a",String.class);
            Path output=Path.of(System.getProperty("edhr.audit.familyTransferOutput"));Files.createDirectories(output);
            mapper.writerWithDefaultPrettyPrinter().writeValue(output.resolve(name+".json").toFile(),observation);
        }
    }
    static final class Observation{
        public final String name;public int selectCalls;public final Map<String,Integer> preparedSql=new LinkedHashMap<>();public String failure;public long elapsedNanos;public String committedMembers;public String committedAudits;
        public final String scope="calling-thread Hibernate statements with server tags; JDBC fixtures/assertions excluded, not all-network SQL or production latency";
        Observation(String name){this.name=name;}
    }
    @TestConfiguration static class ObservationConfig{
        @Bean HibernatePropertiesCustomizer familyTransferSql(){return properties->properties.put("hibernate.session_factory.statement_inspector",(org.hibernate.resource.jdbc.spi.StatementInspector)sql->{
            var observation=CURRENT.get();if(observation==null)return sql;
            String shape=sql.strip().replaceAll("\\s+"," ");observation.preparedSql.merge(shape,1,Integer::sum);
            if(shape.toLowerCase(Locale.ROOT).startsWith("select"))observation.selectCalls++;
            return "/* family-transfer:"+observation.name+" */ "+sql;
        });}
    }
}
