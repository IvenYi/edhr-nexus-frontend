package com.zencas.edhr.compliance.controller;

import com.zencas.edhr.common.dto.PageResult;
import com.zencas.edhr.compliance.dto.AuditLogItem;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.InvalidDataAccessApiUsageException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import java.nio.file.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;

/** Test-only proposal. No production endpoint, transaction, ordering or query implementation is changed. */
class AuditDatabasePagingProbePostgresTest extends AuditReadPostgresSupport {
    @Autowired AuditEventRepository events;
    record Query(String type, String id, String action, String name, String account, String module, String menu, String summary) {}
    static final Query EMPTY = new Query(null,null,null,null,null,null,null,null);

    static Stream<Arguments> filters() {
        return Stream.of(
                Arguments.of("all", EMPTY),
                Arguments.of("create", new Query(null,null,"CREATE",null,null,null,null,null)),
                Arguments.of("update", new Query(null,null,"UPDATE",null,null,null,null,null)),
                Arguments.of("cancel", new Query(null,null,"CANCEL",null,null,null,null,null)),
                Arguments.of("work_update", new Query("WORK_ORDER","target","UPDATE",null,null,null,null,null)),
                Arguments.of("old_name", new Query(null,null,null,"历史姓名1",null,null,null,null)),
                Arguments.of("account", new Query(null,null,null,null,"probe-4",null,null,null)),
                Arguments.of("module", new Query(null,null,null,null,null,"系统",null,null)),
                Arguments.of("menu", new Query(null,null,null,null,null,null,"组织管理 · 用户管理",null)),
                Arguments.of("summary", new Query(null,null,null,null,null,null,null,"#target")),
                Arguments.of("unicode_blank", new Query(null,null,null,null,null,"\u2000",null,null)),
                Arguments.of("unicode_text", new Query(null,null,null,null,null,"\u00a0",null,null)));
    }

    @ParameterizedTest @MethodSource("filters")
    void compareWholeDtosCountsAndExistingFilters(String name, Query query) throws Exception {
        seed(60,"distinct",0);
        jdbc.update("UPDATE audit_event SET entity_type=CASE id%4 WHEN 0 THEN 'WORK_ORDER' WHEN 1 THEN 'PRODUCTION_OBJECT' WHEN 2 THEN 'USER_ACCOUNT' ELSE 'ROLE' END,action=CASE id%3 WHEN 0 THEN 'CREATE' WHEN 1 THEN 'CANCEL' ELSE 'STATUS_CHANGE' END");
        var current = observe("paging_filter_current_"+name, () -> current(1,7,"createdAt","desc",query));
        var proposed = observe("paging_filter_prototype_"+name, () -> prototype(1,7,"createdAt","desc",query,false));
        sameResult(current,proposed);
    }

    @ParameterizedTest @CsvSource({"1,20,id,asc", "2,20,id,desc", "4,20,createdAt,desc", "2,2147483647,id,asc", "2147483647,20,createdAt,desc", "3,1073741824,id,desc"})
    void compareOrdinaryLastAndMaximumPositivePages(int page,int size,String sort,String order) throws Exception {
        seed(60,"distinct",0);
        var current = observe("paging_boundary_current_"+page+"_"+size, () -> current(page,size,sort,order,EMPTY));
        var proposed = observe("paging_boundary_prototype_"+page+"_"+size, () -> prototype(page,size,sort,order,EMPTY,false));
        sameResult(current,proposed);
    }

    static Stream<Arguments> sizes() {
        return Stream.of(Arguments.of(100,0),Arguments.of(1000,0),Arguments.of(5000,0),Arguments.of(1000,1024),Arguments.of(1000,131072));
    }
    @ParameterizedTest @MethodSource("sizes")
    void compareSmallPageEntityLoadsAndWideJson(int count,int width) throws Exception {
        seed(count,"shared",width);
        var current = observe("paging_scale_current_"+count+"_"+width, () -> current(1,20,"createdAt","desc",EMPTY));
        assertThat(stats().getEntityLoadCount()).isEqualTo(count+1); assertThat(stats().getPrepareStatementCount()).isEqualTo(2);
        var proposed = observe("paging_scale_prototype_"+count+"_"+width, () -> prototype(1,20,"createdAt","desc",EMPTY,false));
        sameResult(current,proposed);
        assertThat(stats().getEntityLoadCount()).isEqualTo(21); assertThat(stats().getPrepareStatementCount()).isEqualTo(3);
    }

    @Test void actualJpaOffsetLimitRequiresAnExplicitFallbackRatherThanANewPageCap() {
        seed(6,"shared",0);
        assertThatThrownBy(() -> events.search("","","","","","","","",
                PageRequest.of(Integer.MAX_VALUE-1,20,Sort.by("createdAt"))))
                .isInstanceOf(InvalidDataAccessApiUsageException.class).hasMessageContaining("Page offset exceeds Integer.MAX_VALUE");
    }

    @Test void compareCurrentProfileTargetAccountIncludingAdministratorChanges() throws Exception {
        seed(60,"shared",0);
        jdbc.update("UPDATE audit_event SET entity_id='910001',operator_id='administrator' WHERE id<=40");
        jdbc.update("UPDATE audit_event SET operator_id='910001' WHERE id>40");
        var original = observe("paging_profile_current", () -> controller.listMyProfileLogs("910001",2,7,"createdAt","desc").getData());
        var proposed = observe("paging_profile_prototype", () -> {
            com.zencas.edhr.identity.entity.UserAccount user = ReflectionTestUtils.invokeMethod(controller,"findCurrentUser","910001");
            return prototype(2,7,"createdAt","desc",new Query("USER_ACCOUNT",String.valueOf(user.getId()),null,null,null,null,null,null),false);
        });
        sameResult(original,proposed); assertThat(proposed.getTotalElements()).isEqualTo(40);
        assertThat(proposed.getContent()).extracting(AuditLogItem::getOperatorId).containsOnly("administrator");
    }

    @Test void measureTiedOrderingAndExplicitIdTieBreakerWithoutChangingProductionSort() throws Exception {
        seed(1000,"shared",0); jdbc.update("UPDATE audit_event SET created_at=TIMESTAMP '2026-01-01'");
        var current = observe("paging_ties_current", () -> current(1,20,"createdAt","desc",EMPTY));
        var first = observe("paging_ties_prototype_first", () -> prototype(1,20,"createdAt","desc",EMPTY,false));
        var second = observe("paging_ties_prototype_second", () -> prototype(2,20,"createdAt","desc",EMPTY,false));
        var stableFirst = observe("paging_ties_stable_first", () -> prototype(1,20,"createdAt","desc",EMPTY,true));
        var stableSecond = observe("paging_ties_stable_second", () -> prototype(2,20,"createdAt","desc",EMPTY,true));
        assertThat(stableFirst.getContent()).extracting(AuditLogItem::getId).containsExactlyElementsOf(java.util.stream.LongStream.iterate(1000,x->x-1).limit(20).boxed().toList());
        assertThat(stableSecond.getContent()).extracting(AuditLogItem::getId).containsExactlyElementsOf(java.util.stream.LongStream.iterate(980,x->x-1).limit(20).boxed().toList());
        var overlap = new HashSet<>(ids(first)); overlap.retainAll(ids(second));
        write("tied_order.json",Map.of("currentIds",ids(current),"prototypeFirstIds",ids(first),"prototypeSecondIds",ids(second),
                "currentPrototypeIdsEqual",ids(current).equals(ids(first)),"prototypePageOverlap",overlap,
                "stableFirstIds",ids(stableFirst),"stableSecondIds",ids(stableSecond),
                "scope","test-only explicit ID tie-breaker proposal; production sort unchanged, equal-key order previously unspecified"));
    }

    @ParameterizedTest @ValueSource(ints={TransactionDefinition.ISOLATION_READ_COMMITTED,TransactionDefinition.ISOLATION_REPEATABLE_READ})
    void representativeTwoStatementSnapshotExperiment(int isolation) throws Exception {
        seed(40,"shared",0); String name=isolation==TransactionDefinition.ISOLATION_READ_COMMITTED ? "rc" : "rr";
        var tx=new TransactionTemplate(transactions); tx.setReadOnly(true); tx.setIsolationLevel(isolation);
        var result=tx.execute(status -> {
            var page=jdbc.queryForList("/*paging_snapshot_"+name+"*/ SELECT id FROM audit_event WHERE entity_type=? ORDER BY created_at DESC LIMIT ?",Long.class,"USER_ACCOUNT",20);
            int inserted=CompletableFuture.supplyAsync(() -> jdbc.update("/*paging_fixture_writer_"+name+"*/ INSERT INTO audit_event(id,tenant_id,entity_type,entity_id,action,snapshot_hash,created_at) VALUES(?,'default','USER_ACCOUNT','target','UPDATE',repeat('a',64),CURRENT_TIMESTAMP)",100001L)).orTimeout(10,TimeUnit.SECONDS).join();
            assertThat(inserted).isEqualTo(1);
            Long count=jdbc.queryForObject("/*paging_snapshot_"+name+"*/ SELECT count(*) FROM audit_event WHERE entity_type=?",Long.class,"USER_ACCOUNT");
            return Map.of("ids",page,"count",count,"isolation",isolation);
        });
        assertThat(result.get("count")).isEqualTo(isolation==TransactionDefinition.ISOLATION_READ_COMMITTED ? 41L : 40L);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_event",Long.class)).isEqualTo(41L);
        write("snapshot_"+name+".json",Map.of("result",result,"fixtureWriterInserted",1,
                "scope","representative JDBC two-stage content/count experiment with a separate-connection fixture writer; not actual repository-count interception or a production transaction change"));
    }

    private PageResult<AuditLogItem> current(int page,int size,String sort,String order,Query q) {
        return controller.list(page,size,sort,order,q.type,q.id,q.action,q.name,q.account,q.module,q.menu,q.summary).getData();
    }

    private PageResult<AuditLogItem> prototype(int page,int size,String sort,String order,Query q,boolean tieBreaker) {
        int safePage=Math.max(page,1),safeSize=Math.max(size,1);
        long offset=(long)(safePage-1)*safeSize;
        if (StringUtils.hasText(q.module)||StringUtils.hasText(q.menu)||StringUtils.hasText(q.summary)||offset>Integer.MAX_VALUE) {
            return current(page,size,sort,order,q);
        }
        Sort.Direction direction="asc".equalsIgnoreCase(order)?Sort.Direction.ASC:Sort.Direction.DESC;
        Sort sorting=Sort.by(direction,sort); if(tieBreaker&&!"id".equals(sort))sorting=sorting.and(Sort.by(direction,"id"));
        var rows=events.search(blank(q.type),blank(q.id),blank(q.action),blank(q.name),blank(q.account),"","","",PageRequest.of(safePage-1,safeSize,sorting));
        Map<String,String> names=ReflectionTestUtils.invokeMethod(controller,"loadOperatorNames",rows.getContent());
        var items=rows.getContent().stream().map(event -> (AuditLogItem)ReflectionTestUtils.invokeMethod(controller,"toAuditLogItem",event,names)).toList();
        return PageResult.of(items,page,size,rows.getTotalElements());
    }

    private String blank(String value){return StringUtils.hasText(value)?value:"";}
    private org.hibernate.stat.Statistics stats(){return factory.unwrap(SessionFactoryImplementor.class).getStatistics();}
    private List<Long> ids(PageResult<AuditLogItem> p){return p.getContent().stream().map(AuditLogItem::getId).toList();}
    private void sameResult(PageResult<AuditLogItem> a,PageResult<AuditLogItem> b){
        assertThat(b.getContent()).isEqualTo(a.getContent()); assertThat(b.getTotalElements()).isEqualTo(a.getTotalElements());
        assertThat(b.getPage()).isEqualTo(a.getPage()); assertThat(b.getSize()).isEqualTo(a.getSize()); assertThat(b.getTotalPages()).isEqualTo(a.getTotalPages());
    }
    private void write(String name,Object value)throws Exception{
        Path p=Path.of(System.getProperty("edhr.audit.readOutput"));Files.createDirectories(p);mapper.writerWithDefaultPrettyPrinter().writeValue(p.resolve(name).toFile(),value);
    }
}
