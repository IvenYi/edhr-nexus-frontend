package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.zencas.edhr.common.audit.AuditContext;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import java.nio.file.*;

/** Reproducible controlled planner observation; no production SLA or automatic index choice. */
public class EdhrDhrPageIndexProbe {
    private static final ObjectMapper mapper = new ObjectMapper();
    public static void main(String[] args) throws Exception {
        var fixture = new DhrReviewPaginationPostgresTest();
        ArrayNode observations = mapper.createArrayNode();
        Path output = Path.of(args[0]); Files.createDirectories(output);
        try {
            fixture.setup();
            var jdbc = (JdbcTemplate) ReflectionTestUtils.getField(fixture, "jdbc");
            var service = (DhrReviewService) ReflectionTestUtils.getField(fixture, "service");
            var counted = (DhrReviewPaginationPostgresTest.CountingJdbc) ReflectionTestUtils.getField(fixture, "counted");
            jdbc.execute("""
                INSERT INTO dhr_summary_version SELECT 100000+i,tenant_id,dhr_instance_id,i+1,status,review_mode,
                  review_workflow_definition_id,review_workflow_version_id,base_directory_snapshot,overlay_directory_snapshot,candidate_snapshot,
                  md5(i::text),submitted_by,submitted_at,created_at,check_result_snapshot,attachment_snapshot
                FROM dhr_summary_version CROSS JOIN generate_series(1,50000) i WHERE id=10
                """);
            jdbc.execute("INSERT INTO dhr_summary_review SELECT 100000+i,100000+i,CASE WHEN i%1000=0 THEN 'PENDING_REVIEW' ELSE 'APPROVED' END,'9',CURRENT_TIMESTAMP FROM generate_series(1,50000) i");
            jdbc.execute("""
                INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot)
                SELECT 100000+i,100000+i,1,CASE WHEN i%1000=0 THEN 'PENDING' ELSE 'COMPLETED' END,
                  CASE WHEN i%997=0 THEN '7' ELSE '99' END,
                  jsonb_build_object('userIds',jsonb_build_array(CASE WHEN i%997=0 THEN '7' ELSE '99' END)) FROM generate_series(1,50000) i
                """);
            jdbc.execute("""
                INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot)
                SELECT 200000+i,200000+i,1,'PENDING','99','{"userIds":["99"]}'::jsonb FROM generate_series(1,100000) i
                """);
            jdbc.execute("ANALYZE");
            String metadata = jdbc.queryForObject("SELECT json_build_object('version',version(),'collation',(SELECT datcollate FROM pg_database WHERE datname=current_database()),'icu',pg_collation_actual_version(oid))::text FROM pg_collation WHERE collname='und-x-icu'", String.class);
            Files.writeString(output.resolve("metadata.json"), metadata);
            Files.writeString(output.resolve("existing-indexes.json"), mapper.writeValueAsString(jdbc.queryForList("SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='dhr_review_page_test' ORDER BY tablename,indexname")));
            for (String actor : new String[]{"7", "99"}) for (String view : new String[]{"PENDING", "DONE"})
                record(observations, output, "history-baseline", actor, view, "", service, counted, jdbc);
            record(observations, output, "history-search", "7", "DONE", "i\u0307", service, counted, jdbc);
            jdbc.execute("CREATE INDEX trial_dhr_pending ON dhr_summary_review(workflow_instance_id) WHERE status='PENDING_REVIEW'");
            jdbc.execute("ANALYZE dhr_summary_review");
            for (String actor : new String[]{"7", "99"})
                record(observations, output, "history-pending-index", actor, "PENDING", "", service, counted, jdbc);
            jdbc.execute("CREATE INDEX trial_task_done ON workflow_task(assignee_id,id DESC) INCLUDE(instance_id,node_id) WHERE status IN ('COMPLETED','REJECTED')");
            jdbc.execute("ANALYZE workflow_task");
            for (String actor : new String[]{"7", "99"})
                record(observations, output, "history-done-index", actor, "DONE", "", service, counted, jdbc);
            Files.writeString(output.resolve("trial-index-sizes.json"), mapper.writeValueAsString(jdbc.queryForList("SELECT relname,pg_relation_size(oid) bytes FROM pg_class WHERE relnamespace='dhr_review_page_test'::regnamespace AND relname IN ('trial_dhr_pending','trial_task_done') ORDER BY relname")));
            jdbc.execute("UPDATE dhr_summary_review SET status='PENDING_REVIEW' WHERE summary_version_id>100000");
            jdbc.execute("UPDATE workflow_task SET status='PENDING' WHERE id>100000");
            jdbc.execute("ANALYZE");
            record(observations, output, "all-pending-index", "7", "PENDING", "", service, counted, jdbc);
            jdbc.execute("DROP INDEX trial_dhr_pending");
            record(observations, output, "all-pending-without-index", "7", "PENDING", "", service, counted, jdbc);
            Files.writeString(output.resolve("observations.json"), mapper.writerWithDefaultPrettyPrinter().writeValueAsString(observations));
            System.out.println(mapper.writeValueAsString(observations));
        } finally { fixture.cleanup(); AuditContext.clear(); }
    }
    private static void record(ArrayNode output, Path dir, String scenario, String actor, String view, String keyword,
            DhrReviewService service, DhrReviewPaginationPostgresTest.CountingJdbc counted, JdbcTemplate jdbc) throws Exception {
        AuditContext.setOperator(actor, "受控容量用户"); counted.reset();
        var page = service.list(view, keyword, 0, 20);
        String prefix=scenario+"-"+actor+"-"+view;
        Files.writeString(dir.resolve(prefix+".sql"),counted.sql);
        Files.writeString(dir.resolve(prefix+".args.json"),mapper.writeValueAsString(counted.args));
        String raw=jdbc.queryForObject("EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) "+counted.sql,String.class,counted.args);
        Files.writeString(dir.resolve(prefix+".plan.json"),raw);
        var plan=mapper.readTree(raw).get(0);
        output.addObject().put("scenario",scenario).put("actor",actor).put("view",view).put("keyword",keyword)
                .put("total",page.getTotalElements()).put("returned",page.getContent().size())
                .put("sqlCalls",counted.calls).put("rowsTransferred",counted.rows)
                .put("executionMsObservation",plan.path("Execution Time").asDouble())
                .put("sharedHitBlocks",plan.path("Plan").path("Shared Hit Blocks").asLong())
                .put("plan",prefix+".plan.json");
    }
}
