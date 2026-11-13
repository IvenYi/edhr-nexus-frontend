package com.zencas.edhr.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.config.SecurityConfig;
import com.zencas.edhr.common.exception.GlobalExceptionHandler;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.security.JwtAuthenticationFilter;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.template.controller.TemplateModelingController;
import com.zencas.edhr.template.controller.FormLookupCatalogController;
import com.zencas.edhr.template.dto.TemplateModelingRequest;
import com.zencas.edhr.template.service.*;
import com.zencas.edhr.masterdata.deletion.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.net.URI;
import java.net.http.*;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;

/** Real HTTP, identities, JPA domain actions, audits and canonical PostgreSQL migrations. */
@EnabledIfEnvironmentVariable(named="AI_TASK_DATABASE_URL", matches="jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_ai_task_test_[a-z0-9_]+")
@SpringBootTest(classes=AiFormPostgresTest.Application.class, webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties={"spring.liquibase.enabled=true", "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
                "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.open-in-view=false",
                "app.jwt.secret=ai-native-test-secret-not-for-production-1234567890", "app.jwt.expiration-ms=3600000"})
class AiFormPostgresTest {
    private static final long OWNER=920001, OTHER=920002;
    private static final String KEY="local-ai-native-worker-test-only-1234567890";
    @Configuration @EnableAutoConfiguration
    @EntityScan({"com.zencas.edhr.template.entity", "com.zencas.edhr.compliance.entity"})
    @EnableJpaRepositories({"com.zencas.edhr.template.repository", "com.zencas.edhr.compliance.repository"})
    @Import({AiTaskService.class,AiAccess.class,AiController.class,AiWorkerController.class,AiFormController.class,AiFormService.class,
            AiExceptionHandler.class, SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,GlobalExceptionHandler.class,
            TemplateModelingController.class,TemplateModelingService.class,FormEditGuard.class,FormLookupCatalogService.class,
            TemplateLegacyWordImportService.class,SnowflakeIdGenerator.class,FormLookupCatalogController.class,
            DeletionProtectionAspect.class,DeletionProtectionService.class})
    static class Application {}
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired AiTaskService tasks;
    @Autowired AiFormService forms;
    @Autowired AiProperties config;
    @Autowired JwtTokenProvider tokens;
    @LocalServerPort int port;

    @DynamicPropertySource static void database(DynamicPropertyRegistry p) {
        String url=System.getenv("AI_TASK_DATABASE_URL");
        if(url==null || !url.matches("jdbc:postgresql://127\\.0\\.0\\.1:[0-9]+/edhr_ai_task_test_[a-z0-9_]+")) throw new IllegalStateException("Owned disposable database required");
        p.add("spring.datasource.url",()->url); p.add("spring.datasource.username",()->System.getenv("PGUSER")); p.add("spring.datasource.password",()->"");
    }
    @BeforeEach void setup() {
        jdbc.execute("TRUNCATE ai_task_event,ai_task_action,ai_model_reservation,ai_form_receipt,ai_run,ai_task,ai_capability,form_edit_lease CASCADE");
        jdbc.update("INSERT INTO user_account(id,username,password_hash,display_name) VALUES (920001,'ai-native-owner','unused','AI Native Owner'),(920002,'ai-native-other','unused','AI Native Other') ON CONFLICT DO NOTHING");
        jdbc.update("UPDATE user_account SET status='ACTIVE',locked_until=NULL,tenant_id=0 WHERE id IN (920001,920002)");
        jdbc.update("INSERT INTO role(id,code,name) VALUES (920001,'AI_NATIVE_TEST','AI native test') ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO user_role(id,user_id,role_id) VALUES (920001,920001,920001),(920002,920002,920001) ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO role_permission(id,role_id,permission_id) SELECT 920001,920001,id FROM permission WHERE code='master-data.form-templates' ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO role_permission(id,role_id,permission_id) SELECT 920002,920001,id FROM permission WHERE code='system.settings' ON CONFLICT DO NOTHING");
        jdbc.update("INSERT INTO template_category(id,tenant_id,template_type,name,sort_order) VALUES (920001,'default','FORM','AI隔离验证',0) ON CONFLICT DO NOTHING");
        config.setEnabled(true);config.setWorkerKey(KEY);config.setInstallationId("default");config.setLeaseSeconds(30);config.setRunSeconds(600);
        tasks.setEnabled(OWNER,true);
    }
    @Test void createIsAtomicIdempotentAuditedAndReadableOverHttp() throws Exception {
        var run=run(); long before=count("form_template");
        var command=command(run,"create-1","create",payload());
        var first=worker("POST","/forms/write",command,200).path("receipt");
        assertThat(first.path("revision").asLong()).isGreaterThanOrEqualTo(1);
        var replay=worker("POST","/forms/write",command,200);
        assertThat(replay.path("replayed").asBoolean()).isTrue(); assertThat(count("form_template")).isEqualTo(before+1);
        assertThat(count("ai_form_receipt")).isEqualTo(1);
        var audit=jdbc.queryForMap("SELECT operator_id,source,content_after::text FROM audit_event WHERE id=?", first.path("auditId").asLong());
        assertThat(audit.get("operator_id")).isEqualTo(Long.toString(OWNER));assertThat(audit.get("source")).isEqualTo("AI");
        assertThat(audit.get("content_after").toString()).contains("create-1",run.get("taskId").toString());
        var events=user("GET","/api/v1/ai/tasks/"+run.get("taskId")+"/events",null,OWNER,200);
        assertThat(events.toString()).contains("已创建表单并保存设计","auditId");
        var altered=payload();altered.setName("changed"); worker("POST","/forms/write",command(run,"create-1","create",altered),409);
        worker("POST","/forms/write",command(run,"new-operation","create",payload()),409);
        assertThat(count("form_template")).isEqualTo(before+1);
    }
    @Test void invalidInitialDesignRollsBackNativeObjectsAuditsTargetAndReceipt() throws Exception {
        var run=run();long before=count("form_template"),audits=count("audit_event");
        var payload=payload();payload.setCanvasDesignJson("[]");
        worker("POST","/forms/write",command(run,"invalid","create",payload),400);
        assertThat(count("form_template")).isEqualTo(before); assertThat(count("audit_event")).isEqualTo(audits);assertThat(count("ai_form_receipt")).isZero();
        assertThat(tasks.get(OWNER,id(run,"taskId")).get("versionId")).isNull();
    }
    @Test void concurrentRepeatedCreateCommitsOnce() throws Exception {
        var run=run();long before=count("form_template");var command=command(run,"same","create",payload());
        var results=race(()->worker("POST","/forms/write",command,200),()->worker("POST","/forms/write",command,200));
        assertThat(results.get(0).path("receipt").path("versionId")).isEqualTo(results.get(1).path("receipt").path("versionId"));
        assertThat(count("form_template")).isEqualTo(before+1);
    }
    @Test void takeoverRetainsCommittedDataAndOldWorkerCannotWrite() throws Exception {
        var run=run();var saved=create(run);String path=nativeVersion(saved);
        var edit=payload();edit.setExpectedRevision(saved.path("revision").asLong());
        user("PUT",path+"/design",edit,OWNER,409);
        user("POST","/api/v1/ai/tasks/"+run.get("taskId")+"/actions",Map.of("clientRequestId","other-stop","expectedRunId",run.get("runId"),"action","takeover"),OTHER,404);
        user("POST","/api/v1/ai/tasks/"+run.get("taskId")+"/actions",Map.of("clientRequestId","takeover","expectedRunId",run.get("runId"),"action","takeover"),OWNER,200);
        edit.setCanvasDesignJson("{\"layers\":[],\"human\":true}");var human=user("PUT",path+"/design",edit,OWNER,200);
        worker("POST","/forms/write",command(run,"late","save-design",edit),409);
        assertThat(user("GET",path,null,OWNER,200).path("canvasDesignJson").asText()).contains("human");
        var receipt=worker("GET","/forms/receipt?taskId="+run.get("taskId")+"&operationId=create",null,200);
        assertThat(receipt.path("receipt").path("revision")).isEqualTo(saved.path("revision"));
        user("POST","/api/v1/ai/tasks/"+run.get("taskId")+"/actions",Map.of("clientRequestId","continue","expectedRunId",run.get("runId"),"action","continue"),OWNER,200);
        var next=tasks.claim();edit.setExpectedRevision(human.path("revision").asLong());
        worker("POST","/forms/write",command(next,"unread","save-design",edit),409);
        assertThat(worker("POST","/forms/read",lease(next),200).path("version").path("canvasDesignJson").asText()).contains("human");
        worker("POST","/forms/write",command(next,"after-read","save-design",edit),200);
    }
    @Test void expiredLeaseAndReclaimRequireFreshReadAndPreserveHumanSave() throws Exception {
        var old=run();var saved=create(old);jdbc.update("UPDATE ai_run SET lease_until=clock_timestamp()-interval '1 second' WHERE id=?",old.get("runId"));
        jdbc.update("UPDATE form_edit_lease SET lease_until=clock_timestamp()-interval '1 second'");
        var edit=payload();edit.setExpectedRevision(saved.path("revision").asLong());edit.setCanvasDesignJson("{\"human\":true}");
        var human=user("PUT",nativeVersion(saved)+"/design",edit,OWNER,200);
        var current=tasks.claim();assertThat(((Number)current.get("leaseEpoch")).longValue()).isGreaterThan(((Number)old.get("leaseEpoch")).longValue());
        worker("POST","/forms/read",lease(old),409);
        worker("POST","/forms/write",command(current,"before-read","save-design",edit),409);
        var fresh=worker("POST","/forms/read",lease(current),200);
        assertThat(fresh.path("version").path("revision")).isEqualTo(human.path("revision"));
        worker("POST","/forms/write",command(current,"stale","save-design",edit),409);
    }
    @Test void disableAndPermissionRevocationBlockWritesAndReceiptDisclosure() throws Exception {
        var run=run();var saved=create(run);var edit=payload();edit.setExpectedRevision(saved.path("revision").asLong());
        tasks.setEnabled(OWNER,false);worker("POST","/forms/write",command(run,"disabled","save-design",edit),403);
        assertThat(count("form_edit_lease")).isZero();
        jdbc.update("UPDATE user_account SET status='DISABLED' WHERE id=?",OWNER);
        worker("GET","/forms/receipt?taskId="+run.get("taskId")+"&operationId=create",null,403);
    }
    @Test void nativeMissingStaleRevisionAndParentMutationsCannotBypassOccupancy() throws Exception {
        var run=run();var saved=create(run);String parent="/api/v1/master-data/template-modeling/form-templates/"+saved.path("templateId").asText();
        user("PUT",nativeVersion(saved)+"/design",payload(),OWNER,409);
        var edit=payload();edit.setCode("unrelated");edit.setName("new-name");edit.setExpectedRevision(0L);
        user("PUT",parent,edit,OWNER,409);user("POST",parent+"/versions",edit,OWNER,409);
        user("DELETE",parent+"?expectedRevision=0",null,OWNER,409);
        user("DELETE",nativeVersion(saved)+"?expectedRevision="+saved.path("revision").asLong(),null,OWNER,409);
        user("PUT","/api/v1/master-data/template-modeling/form-templates/categories/920001",Map.of("name","AI分类改名"),OWNER,409);
        tasks.action(OWNER,id(run,"taskId"),"stop",id(run,"runId"),"stop");
        edit.setExpectedRevision(saved.path("revision").asLong());user("PUT",nativeVersion(saved)+"/design",edit,OWNER,200);
        user("PUT",nativeVersion(saved)+"/design",edit,OWNER,409);
    }
    @Test void missingDeleteRevisionReturnsConflictWithoutDeletingNativeObjects() throws Exception {
        var run=run();var saved=create(run);
        tasks.action(OWNER,id(run,"taskId"),"stop",id(run,"runId"),"stop");
        user("DELETE",nativeVersion(saved),null,OWNER,409);
        user("DELETE","/api/v1/master-data/template-modeling/form-templates/"+saved.path("templateId").asText(),null,OWNER,409);
        assertThat(user("GET",nativeVersion(saved),null,OWNER,200).path("id").asText()).isEqualTo(saved.path("versionId").asText());
    }
    @Test void anotherTaskCannotReadOrAttachAnExistingTarget() throws Exception {
        var first=run();var saved=create(first);tasks.action(OWNER,id(first,"taskId"),"stop",id(first,"runId"),"stop");
        var second=run();
        worker("POST","/forms/read",lease(second),409);
        assertThat(tasks.get(OWNER,id(second,"taskId")).get("versionId")).isNull();
        var created=create(second);
        assertThat(created.path("versionId").asText()).isNotEqualTo(saved.path("versionId").asText());
    }
    @Test void taskWriteAvailabilityReflectsCurrentRunEligibility() {
        var queued=tasks.create(OWNER,UUID.randomUUID().toString(),"availability");
        assertThat(queued.get("businessWritesAvailable")).isEqualTo(false);
        var run=tasks.claim();
        assertThat(tasks.get(OWNER,id(run,"taskId")).get("businessWritesAvailable")).isEqualTo(true);
        tasks.action(OWNER,id(run,"taskId"),"takeover",id(run,"runId"),"takeover");
        assertThat(tasks.get(OWNER,id(run,"taskId")).get("businessWritesAvailable")).isEqualTo(false);
    }
    @Test void revokedPermissionCommitsStopAndReleasesLeaseBeforeReturningDenial() throws Exception {
        var run=run();create(run);long receipts=count("ai_form_receipt");
        jdbc.update("DELETE FROM role_permission WHERE role_id=920001 AND permission_id=(SELECT id FROM permission WHERE code='master-data.form-templates')");
        worker("POST","/forms/read",lease(run),403);
        assertThat(jdbc.queryForObject("SELECT state FROM ai_run WHERE id=?",String.class,id(run,"runId"))).isEqualTo("STOPPED");
        assertThat(count("form_edit_lease")).isZero();assertThat(count("ai_form_receipt")).isEqualTo(receipts);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM ai_task_event WHERE run_id=? AND action='STOPPED'",Long.class,id(run,"runId"))).isEqualTo(1);
    }
    @Test void timedOutWriteCommitsFailureButDoesNotCommitAFormOperation() throws Exception {
        var run=run();var saved=create(run);var edit=payload();edit.setExpectedRevision(saved.path("revision").asLong());
        jdbc.update("UPDATE ai_run SET deadline_at=clock_timestamp()-interval '1 second' WHERE id=?",id(run,"runId"));
        worker("POST","/forms/write",command(run,"too-late","save-design",edit),409);
        assertThat(jdbc.queryForObject("SELECT state FROM ai_run WHERE id=?",String.class,id(run,"runId"))).isEqualTo("FAILED");
        assertThat(count("form_edit_lease")).isZero();assertThat(count("ai_form_receipt")).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM ai_task_event WHERE run_id=? AND action='FAILED'",Long.class,id(run,"runId"))).isEqualTo(1);
    }
    @Test void workerKeyAndUserJwtCannotCrossEntrypoints() throws Exception {
        var run=run();user("POST","/api/v1/ai/internal/forms/write",command(run,"deny","create",payload()),OWNER,401);
        send("POST","/api/v1/master-data/template-modeling/form-templates",payload(),"X-EDHR-AI-Worker-Key",KEY,401);
    }
    @Test void stopRacingSaveHasNoCommitAfterStopReceipt() throws Exception {
        var run=run();var saved=create(run);var edit=payload();edit.setExpectedRevision(saved.path("revision").asLong());edit.setCanvasDesignJson("{\"race\":true}");
        race(()->{try {forms.write(id(run,"taskId"),id(run,"runId"),((Number)run.get("leaseEpoch")).longValue(),"racing-save","save-design",edit);}catch(AiException ignored){}return null;},
             ()->{tasks.action(OWNER,id(run,"taskId"),"stop-race",id(run,"runId"),"stop");return null;});
        assertThat(count("form_edit_lease")).isZero();
        var events=tasks.events(OWNER,id(run,"taskId"),0);boolean stopped=false;
        for(var event:events) {if("STOPPED".equals(event.get("action"))) stopped=true;else if(stopped) assertThat(event.get("action")).isNotEqualTo("FORM_DESIGN_SAVED");}
        worker("POST","/forms/write",command(run,"late-race","save-design",edit),409);
    }
    private Map<String,Object> run() {tasks.create(OWNER,UUID.randomUUID().toString(),"isolated native form fixture");return tasks.claim();}
    private TemplateModelingRequest payload() {return TemplateModelingRequest.builder().categoryName("AI隔离验证").modelDesignJson("{\"fields\":[]}").canvasDesignJson("{\"layers\":[]}").workflowDesignJson("{\"nodes\":[],\"edges\":[]}").build();}
    private Map<String,Object> command(Map<String,Object> run,String op,String action,TemplateModelingRequest form) {var c=new LinkedHashMap<>(lease(run));c.put("operationId",op);c.put("action",action);c.put("form",form);return c;}
    private Map<String,Object> lease(Map<String,Object> run) {return Map.of("taskId",run.get("taskId"),"runId",run.get("runId"),"leaseEpoch",run.get("leaseEpoch"));}
    private UUID id(Map<String,Object> run,String key) {return (UUID)run.get(key);}
    private JsonNode create(Map<String,Object> run) throws Exception {return worker("POST","/forms/write",command(run,"create","create",payload()),200).path("receipt");}
    private String nativeVersion(JsonNode receipt) {return "/api/v1/master-data/template-modeling/form-templates/"+receipt.path("templateId").asText()+"/versions/"+receipt.path("versionId").asText();}
    private long count(String table) {return jdbc.queryForObject("SELECT count(*) FROM "+table,Long.class);}
    private JsonNode worker(String method,String path,Object body,int status) throws Exception {return send(method,"/api/v1/ai/internal"+path,body,"X-EDHR-AI-Worker-Key",KEY,status);}
    private JsonNode user(String method,String path,Object body,long actor,int status) throws Exception {return send(method,path,body,"Authorization","Bearer "+tokens.generateToken(Long.toString(actor),"test","Test",60,List.of(AiAccess.FORM_PERMISSION,"system.settings")),status);}
    private JsonNode send(String method,String path,Object body,String header,String auth,int expected) throws Exception {
        try(var client=HttpClient.newHttpClient()) {
            var response=client.send(HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+port+path)).header(header,auth).header("Content-Type","application/json")
                    .method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body))).build(),HttpResponse.BodyHandlers.ofString());
            assertThat(response.statusCode()).as(response.body()).isEqualTo(expected);return mapper.readTree(response.body()).path("data");
        }
    }
    private <T> List<T> race(Callable<T> a,Callable<T> b) throws Exception {
        var start=new CountDownLatch(1);try(var executor=Executors.newFixedThreadPool(2)) {
            var first=executor.submit(()->{start.await();return a.call();});var second=executor.submit(()->{start.await();return b.call();});start.countDown();
            return Arrays.asList(first.get(30,TimeUnit.SECONDS),second.get(30,TimeUnit.SECONDS));
        }
    }
}
