package com.zencas.edhr.production.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/** Uses the real clean baseline, resolvers, repositories, locks and HTTP authorization. */
@EnabledIfSystemProperty(named = "batch.test.url", matches = "jdbc:postgresql:.*edhr_batch_process_.*")
@SpringBootTest(properties = {
    "spring.datasource.url=${batch.test.url}", "spring.datasource.username=${batch.test.user:ivenwang}", "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=validate", "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF",
    "logging.level.org.springframework.security=ERROR", "logging.level.com.zencas.edhr=INFO"
})
@AutoConfigureMockMvc
class BatchProcessIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired JwtTokenProvider tokens;
    @SpyBean AuditEventRepository audits;
    static final AtomicLong sequence = new AtomicLong(-System.currentTimeMillis());
    long b;
    String order;

    @BeforeEach void seed() throws Exception {
        b = sequence.addAndGet(-100);
        jdbc.update("INSERT INTO material(id,tenant_id,code,name,status,unit,material_type_id) VALUES (?,'default',?,'精密导管','ACTIVE','件',(SELECT id FROM material_type WHERE tenant_id='default' AND code='MT-FINISHED'))", b, "BP-" + b);
        jdbc.update("INSERT INTO route(id,tenant_id,code,name) VALUES (?,'default',?,'装配路线')", b+10, "R-"+b);
        jdbc.update("INSERT INTO route_version(id,tenant_id,route_id,version,code,version_status) VALUES (?,'default',?,'V1',?,'ACTIVE')", b+11,b+10,"RV-"+b);
        jdbc.update("INSERT INTO operation(id,tenant_id,code,name) VALUES (?,'default',?,'装配')", b+14,"OP-"+b);
        jdbc.update("INSERT INTO route_node(id,route_version_id,node_key,operation_id,operation_name,node_type) VALUES (?,?,'a',?,'装配','OPERATION')",b+15,b+11,b+14);
        jdbc.update("INSERT INTO dhr_template(id,tenant_id,code,name) VALUES (?,'default',?,'导管批记录')", b+12,"DHR-"+b);
        jdbc.update("INSERT INTO dhr_template_version(id,dhr_template_id,version_label) VALUES (?,?,'V1')", b+13,b+12);
        jdbc.update("INSERT INTO dhr_directory(id,version_id,name,sort_order) VALUES (?,?,'生产记录',1)",b+16,b+13);
        jdbc.update("INSERT INTO form_template(id,tenant_id,code,name) VALUES (?,'default',?,'补充记录')",b+17,"FORM-"+b);
        jdbc.update("INSERT INTO form_template_version(id,template_id,version_number,version_label,status,model_design_json,canvas_design_json) VALUES (?,?,1,'V1','PUBLISHED','{}','{}')",b+18,b+17);
        jdbc.update("INSERT INTO dhr_template_item(id,directory_id,form_template_id,form_template_version_id,display_name,is_required) VALUES (?,?,?,?,'补充记录',false)",b+19,b+16,b+17,b+18);
        jdbc.update("INSERT INTO product_process(id,tenant_id,owner_type,owner_id) VALUES (?,'default','PRODUCT',?)",b+1,b);
        version(b+2,b+1,"V1","BATCH"); version(b+3,b+1,"V2","BATCH"); version(b+4,b+1,"SN1","SN");
        order = ok(post("/api/v1/production/work-orders"), orderBody("10")).path("id").asText();
    }

    void version(long id,long owner,String label,String form) {
        jdbc.update("INSERT INTO product_process_version(id,tenant_id,product_process_id,version_label,production_mode,production_form,route_version_id,dhr_template_version_id) VALUES (?,'default',?,?,'量产',?,?,?)", id,owner,label,form,b+11,b+13);
    }
    Map<String,Object> orderBody(String quantity) { return Map.of("orderNo","WO-"+b,"productId",b,"plannedQuantity",new BigDecimal(quantity),"remark","验证计划"); }
    Map<String,Object> batchBody(long version,String quantity) { return Map.of("processVersionId",version,"targetQuantity",new BigDecimal(quantity)); }
    JsonNode split(long version,String quantity) throws Exception { return ok(post("/api/v1/production/work-orders/"+order+"/objects"),batchBody(version,quantity)); }
    JsonNode action(String id,String action,long revision) throws Exception { return ok(post("/api/v1/production/execution/"+id+"/actions"),Map.of("action",action,"revision",revision,"operationId","a")); }
    int send(MockHttpServletRequestBuilder request,Object body) throws Exception {
        return mvc.perform(auth(request).contentType("application/json").content(mapper.writeValueAsString(body))).andReturn().getResponse().getStatus();
    }
    JsonNode ok(MockHttpServletRequestBuilder request,Object body) throws Exception {
        var response=mvc.perform(auth(request).contentType("application/json").content(mapper.writeValueAsString(body))).andReturn().getResponse();
        assertThat(response.getStatus()).as(response.getContentAsString(java.nio.charset.StandardCharsets.UTF_8)).isEqualTo(200);
        return mapper.readTree(response.getContentAsString(java.nio.charset.StandardCharsets.UTF_8)).path("data");
    }
    MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder request) { return request.header("Authorization","Bearer "+tokens.generateToken("1","batch-qa","批次验证",5,List.of("production.work-orders","production.batches","production.execution","audit.logs","master-data.products"))); }
    String orderStatus() { return jdbc.queryForObject("SELECT status FROM work_order WHERE id=?",String.class,Long.valueOf(order)); }
    BigDecimal quantity(String id) { return jdbc.queryForObject("SELECT target_quantity FROM production_object WHERE id=?",BigDecimal.class,Long.valueOf(id)); }

    @Test void batchOwnsVersionAndQuantityWhileCreatedOrderLocksOnlyIdentity() throws Exception {
        assertThat(ok(get("/api/v1/production/work-orders/"+order),Map.of()).has("processVersionId")).isFalse();
        JsonNode first=split(b+2,"3"), second=split(b+3,"2");
        assertThat(first.path("processVersionId").asLong()).isEqualTo(b+2);
        assertThat(second.path("processVersionId").asLong()).isEqualTo(b+3);
        assertThat(send(post("/api/v1/production/work-orders/"+order+"/objects"),batchBody(b+4,"1"))).isEqualTo(400);
        ok(put("/api/v1/production/objects/"+first.path("id").asText()),batchBody(b+3,"8"));
        assertThat(send(put("/api/v1/production/objects/"+second.path("id").asText()),batchBody(b+3,"2.1"))).isEqualTo(400);
        ok(put("/api/v1/production/objects/"+first.path("id").asText()),batchBody(b+3,"0.5"));
        assertThat(quantity(first.path("id").asText())).isEqualByComparingTo("0.5");
        ok(put("/api/v1/production/work-orders/"+order),orderBody("8"));
        assertThat(send(put("/api/v1/production/work-orders/"+order),orderBody("2"))).isEqualTo(400);
        var changed=new HashMap<>(orderBody("8")); changed.put("orderNo","RENAMED");
        assertThat(send(put("/api/v1/production/work-orders/"+order),changed)).isEqualTo(400);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE entity_type='PRODUCTION_OBJECT' AND entity_id=? AND function_name='修改批次配置'",Integer.class,first.path("id").asText())).isEqualTo(2);
    }

    @Test void remainingPlanPreventsCompletionAndLaterBatchCanUseV2() throws Exception {
        String first=split(b+2,"1").path("id").asText();
        action(first,"START",0); action(first,"COMPLETE",1);
        assertThat(orderStatus()).isEqualTo("IN_PROCESS");
        assertThat(send(put("/api/v1/production/work-orders/"+order),orderBody("11"))).isEqualTo(400);
        String second=split(b+3,"9").path("id").asText();
        action(second,"START",0); action(second,"COMPLETE",1);
        assertThat(orderStatus()).isEqualTo("COMPLETED");
        assertThat(send(post("/api/v1/production/work-orders/"+order+"/objects"),batchBody(b+3,"1"))).isEqualTo(400);
    }

    @Test void manualOrderEndNeverCascadesAndRequiresReason() throws Exception {
        String first=split(b+2,"1").path("id").asText();
        assertThat(send(post("/api/v1/production/work-orders/"+order+"/end"),Map.of("reason","停止计划"))).isEqualTo(400);
        action(first,"START",0);
        assertThat(send(post("/api/v1/production/work-orders/"+order+"/end"),Map.of("reason","停止计划"))).isEqualTo(400);
        ok(post("/api/v1/production/objects/"+first+"/end"),Map.of("reason","批次结束"));
        assertThat(orderStatus()).isEqualTo("IN_PROCESS");
        assertThat(send(post("/api/v1/production/work-orders/"+order+"/end"),Map.of("reason"," "))).isEqualTo(400);
        ok(post("/api/v1/production/work-orders/"+order+"/end"),Map.of("reason","停止剩余计划"));
        assertThat(orderStatus()).isEqualTo("EARLY_TERMINATED");
        assertThat(jdbc.queryForObject("SELECT termination_reason FROM work_order WHERE id=?",String.class,Long.valueOf(order))).isEqualTo("停止剩余计划");
    }

    @Test void sameV1HasDifferentFrozenAuditContentsAndStartedBatchCannotChange() throws Exception {
        String first=split(b+2,"5").path("id").asText(), second=split(b+2,"5").path("id").asText();
        action(first,"START",0);
        jdbc.update("UPDATE route_node SET operation_name='更新后的装配' WHERE id=?",b+15);
        action(second,"START",0);
        JsonNode a=frozen(first), c=frozen(second);
        assertThat(a.path("processReference")).isEqualTo(c.path("processReference"));
        assertThat(a.at("/processSnapshot/operations/0/name").asText()).isEqualTo("装配");
        assertThat(c.at("/processSnapshot/operations/0/name").asText()).isEqualTo("更新后的装配");
        jdbc.update("UPDATE route_node SET operation_name='再次变化' WHERE id=?",b+15);
        assertThat(frozen(first)).isEqualTo(a); assertThat(frozen(second)).isEqualTo(c);
        assertThat(send(put("/api/v1/production/objects/"+first),batchBody(b+3,"4"))).isEqualTo(400);
    }
    JsonNode frozen(String id) throws Exception { return mapper.readTree(jdbc.queryForObject("SELECT content_after FROM audit_event WHERE entity_type='PRODUCTION_OBJECT' AND entity_id=? AND content_after::text LIKE '%processSnapshot%'",String.class,id)); }

    @Test void invalidTimeOrChangedFormBlocksFirstStartWithoutSnapshot() throws Exception {
        String id=split(b+2,"1").path("id").asText();
        jdbc.update("UPDATE product_process_version SET effective_to=CURRENT_TIMESTAMP - INTERVAL '1 day' WHERE id=?",b+2);
        assertThat(send(post("/api/v1/production/execution/"+id+"/actions"),Map.of("action","START","revision",0,"operationId","a"))).isEqualTo(400);
        assertThat(ok(get("/api/v1/production/work-orders/"+order+"/process-options"),Map.of()).toString()).doesNotContain("\"id\":\""+(b+2)+"\"");
        jdbc.update("UPDATE product_process_version SET effective_to=NULL,production_form='SN' WHERE id=?",b+2);
        assertThat(send(post("/api/v1/production/execution/"+id+"/actions"),Map.of("action","START","revision",0,"operationId","a"))).isEqualTo(400);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM production_execution WHERE object_id=?",Integer.class,Long.valueOf(id))).isZero();
    }

    @Test void existingFamilyReferenceSurvivesProductPriorityButNotFamilyTransfer() throws Exception {
        jdbc.update("INSERT INTO product_family(id,tenant_id,code,name) VALUES (?,'default',?,'簇A'),(?,'default',?,'簇B')",b+20,"FA-"+b,b+21,"FB-"+b);
        jdbc.update("INSERT INTO product_family_member(id,tenant_id,product_family_id,product_id) VALUES (?,'default',?,?)",b+22,b+20,b);
        jdbc.update("INSERT INTO product_process(id,tenant_id,owner_type,owner_id) VALUES (?,'default','PRODUCT_FAMILY',?)",b+23,b+20);
        version(b+24,b+23,"簇V1","BATCH");
        jdbc.update("UPDATE product_process_version SET effective_from=CURRENT_TIMESTAMP + INTERVAL '1 day' WHERE product_process_id=?",b+1);
        String first=split(b+24,"1").path("id").asText(), second=split(b+24,"1").path("id").asText();
        jdbc.update("UPDATE product_process_version SET effective_from=NULL WHERE product_process_id=?",b+1);
        action(first,"START",0);
        jdbc.update("UPDATE product_family_member SET product_family_id=? WHERE product_id=?",b+21,b);
        assertThat(send(post("/api/v1/production/execution/"+second+"/actions"),Map.of("action","START","revision",0,"operationId","a"))).isEqualTo(400);
        action(first,"COMPLETE",1);
        ok(put("/api/v1/production/objects/"+second),batchBody(b+3,"1")); action(second,"START",0);
    }

    @Test void concurrentEditsCannotOverAllocate() throws Exception {
        String first=split(b+2,"3").path("id").asText(), second=split(b+2,"3").path("id").asText();
        try(var pool=Executors.newFixedThreadPool(2)) {
            var gate=new CountDownLatch(1);
            var tasks=List.of(first,second).stream().map(id -> pool.submit(() -> {gate.await(); return send(put("/api/v1/production/objects/"+id),batchBody(b+2,"7"));})).toList();
            gate.countDown();
            assertThat(List.of(tasks.get(0).get(15,TimeUnit.SECONDS),tasks.get(1).get(15,TimeUnit.SECONDS))).containsExactlyInAnyOrder(200,400);
        }
        assertThat(quantity(first).add(quantity(second))).isEqualByComparingTo("10");
    }

    @Test void cancelledBatchesReleaseQuantityButDoNotUnlockOrderIdentity() throws Exception {
        var changed=new HashMap<>(orderBody("0.5")); changed.put("remark","拆分前调整计划");
        ok(put("/api/v1/production/work-orders/"+order),changed);
        assertThat(send(put("/api/v1/production/work-orders/"+order),orderBody("0.00001"))).isEqualTo(400);
        assertThat(send(put("/api/v1/production/work-orders/"+order),orderBody("100000000000"))).isEqualTo(400);
        String id=split(b+2,"0.5").path("id").asText();
        ok(post("/api/v1/production/objects/"+id+"/cancel"),Map.of());
        assertThat(ok(get("/api/v1/production/work-orders/"+order),Map.of()).path("allocatedQuantity").decimalValue()).isEqualByComparingTo("0");
        assertThat(send(put("/api/v1/production/objects/"+id),batchBody(b+3,"0.5"))).isEqualTo(400);
        changed.put("orderNo","NEW-"+b);
        assertThat(send(put("/api/v1/production/work-orders/"+order),changed)).isEqualTo(400);
        assertThat(send(post("/api/v1/production/work-orders/"+order+"/objects"),batchBody(b+4,"1"))).isEqualTo(400);
        split(b+3,"0.5");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event WHERE entity_type='WORK_ORDER' AND entity_id=? AND action='UPDATE'",Integer.class,order)).isGreaterThan(0);
    }

    @Test void batchPermissionCanEditBatchWithoutGrantingOrderMutation() throws Exception {
        String id=split(b+2,"1").path("id").asText();
        String token="Bearer "+tokens.generateToken("1","batch-qa","批次验证",5,List.of("production.batches"));
        assertThat(mvc.perform(get("/api/v1/production/work-orders/"+order).header("Authorization",token)).andReturn().getResponse().getStatus()).isEqualTo(200);
        assertThat(mvc.perform(get("/api/v1/production/work-orders/"+order+"/process-options").header("Authorization",token)).andReturn().getResponse().getStatus()).isEqualTo(200);
        assertThat(mvc.perform(put("/api/v1/production/objects/"+id).header("Authorization",token).contentType("application/json").content(mapper.writeValueAsString(batchBody(b+3,"2")))).andReturn().getResponse().getStatus()).isEqualTo(200);
        assertThat(mvc.perform(put("/api/v1/production/work-orders/"+order).header("Authorization",token).contentType("application/json").content(mapper.writeValueAsString(orderBody("12")))).andReturn().getResponse().getStatus()).isEqualTo(403);
    }

    @Test void concurrentStartAndEditCannotFreezeMixedVersionAndQuantity() throws Exception {
        String id=split(b+2,"1").path("id").asText();
        int startStatus;
        try(var pool=Executors.newFixedThreadPool(2)) {
            var gate=new CountDownLatch(1);
            var start=pool.submit(() -> {gate.await(); return send(post("/api/v1/production/execution/"+id+"/actions"),Map.of("action","START","revision",0,"operationId","a"));});
            var edit=pool.submit(() -> {gate.await(); return send(put("/api/v1/production/objects/"+id),batchBody(b+3,"2"));});
            gate.countDown(); startStatus=start.get(15,TimeUnit.SECONDS);
            assertThat(startStatus).isIn(200,400);
            assertThat(edit.get(15,TimeUnit.SECONDS)).isIn(200,400);
        }
        if(startStatus==400) action(id,"START",0);
        JsonNode frozen=mapper.readTree(jdbc.queryForObject("SELECT snapshot_json FROM production_execution WHERE object_id=?",String.class,Long.valueOf(id)));
        assertThat(frozen.path("context").path("targetQuantity").decimalValue()).isEqualByComparingTo(quantity(id));
        assertThat(frozen.path("processReference").path("processVersionId").asLong()).isEqualTo(jdbc.queryForObject("SELECT process_version_id FROM production_object WHERE id=?",Long.class,Long.valueOf(id)));
        assertThat(send(put("/api/v1/production/objects/"+id),batchBody(b+2,"3"))).isEqualTo(400);
    }

    @Test void cleanBaselineProtectsObjectProcessReferencesWithoutOrderProcessColumn() throws Exception {
        assertThat(jdbc.queryForObject("SELECT count(*) FROM information_schema.columns WHERE table_name='work_order' AND column_name='process_version_id'",Integer.class)).isZero();
        split(b+2,"1");
        assertThat(send(delete("/api/v1/master-data/product-modeling/process-owners/PRODUCT/"+b+"/versions/"+(b+2)),Map.of())).isEqualTo(409);
        assertThat(send(delete("/api/v1/master-data/product-modeling/process-owners/PRODUCT/"+b+"/versions/"+(b+3)),Map.of())).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM product_process_version WHERE id=?",Integer.class,b+2)).isEqualTo(1);
    }

    @Test void failedAuditRollsBackBatchEdit() throws Exception {
        String id=split(b+2,"1").path("id").asText();
        doThrow(new IllegalStateException("audit unavailable")).when(audits).save(argThat(event -> event != null && "修改批次配置".equals(event.getFunctionName())));
        try { assertThat(send(put("/api/v1/production/objects/"+id),batchBody(b+3,"2"))).isEqualTo(500); }
        finally { reset(audits); }
        assertThat(quantity(id)).isEqualByComparingTo("1");
        assertThat(jdbc.queryForObject("SELECT process_version_id FROM production_object WHERE id=?",Long.class,Long.valueOf(id))).isEqualTo(b+2);
    }
}
