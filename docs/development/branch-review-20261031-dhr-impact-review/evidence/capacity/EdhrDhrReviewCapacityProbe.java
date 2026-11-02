package com.zencas.edhr.production.service;

import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;
import java.util.Map;

/** Controlled read-mechanism observation, not a performance SLA or regression assertion. */
public class EdhrDhrReviewCapacityProbe {
    static class CountingJdbc extends JdbcTemplate {
        long queries, rows;
        CountingJdbc(JdbcTemplate source) { super(source.getDataSource()); }
        @Override public List<Map<String, Object>> queryForList(String sql, Object... args) {
            var result = super.queryForList(sql, args);
            if (sql.contains("FROM dhr_summary_review r JOIN workflow_task")) {
                queries++; rows += result.size();
            }
            return result;
        }
    }
    public static void main(String[] args) throws Exception {
        try (var context = new AnnotationConfigApplicationContext(DhrReviewServiceTest.Config.class)) {
            var fixture = new DhrReviewServiceTest();
            context.getAutowireCapableBeanFactory().autowireBean(fixture);
            fixture.setup();
            var jdbc = new CountingJdbc(fixture.jdbc);
            var service = new DhrReviewService(jdbc, fixture.mapper, fixture.summaries, fixture.engine,
                    fixture.workflows, fixture.access, fixture.audits, new SnowflakeIdGenerator(2),
                    new DhrEvidenceImpactService(jdbc, fixture.mapper));
            for (int other : new int[]{0, 500, 5000}) {
                fixture.jdbc.update("DELETE FROM workflow_task WHERE id<>5");
                fixture.jdbc.batchUpdate("INSERT INTO workflow_task(id,instance_id,node_id,status,assignee_id,candidate_snapshot,created_at) VALUES(?,3,4,'PENDING',?,?,CURRENT_TIMESTAMP)",
                        java.util.stream.IntStream.range(0, other + 20).mapToObj(i -> new Object[]{100L + i,
                                i < other ? "8" : "7", i < other ? "{\"userIds\":[\"8\"]}" : "{\"userIds\":[\"7\"]}"}).toList());
                jdbc.queries = 0; jdbc.rows = 0;
                var result = service.list("PENDING", "", 0, 20);
                System.out.println(fixture.mapper.createObjectNode().put("otherUserTasks", other)
                        .put("allTasks", other + 21).put("pageSize", 20)
                        .put("returned", result.getContent().size()).put("personalTotal", result.getTotalElements())
                        .put("listSqlCallsIncludingEmptyTerminator", jdbc.queries).put("taskRowsLoaded", jdbc.rows));
            }
        } finally { AuditContext.clear(); }
    }
}
