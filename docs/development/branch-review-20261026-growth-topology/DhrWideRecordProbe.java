package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import java.lang.management.ManagementFactory;
import java.lang.ref.Reference;
import java.nio.file.*;
import java.util.*;

/** Actual JDBC/service, synthetic PG rows, fixed SerialGC JVM. Retained checkpoints, not peak/SLA. */
public class DhrWideRecordProbe {
    static long retained() {
        System.gc();
        return ManagementFactory.getMemoryMXBean().getHeapMemoryUsage().getUsed();
    }
    static class ObservedJdbc extends JdbcTemplate {
        int reads; long evidenceHeap,currentHeap,currentJsonChars; int currentRows;
        List<Map<String,Object>> evidenceKeepAlive;
        ObservedJdbc(DriverManagerDataSource source) { super(source); }
        @Override public List<Map<String,Object>> queryForList(String sql,Object... args) {
            var rows=super.queryForList(sql,args); reads++;
            if(sql.startsWith("SELECT source_record_id,source_snapshot")) {
                evidenceKeepAlive=rows; evidenceHeap=retained(); Reference.reachabilityFence(rows);
            }
            if(currentRows==0 && (sql.startsWith("SELECT id,snapshot_json") || sql.startsWith("SELECT snapshot_json,values_json"))) {
                currentRows=rows.size();
                for(var row:rows) for(String key:List.of("snapshot_json","values_json")) currentJsonChars+=row.get(key).toString().length();
                currentHeap=retained(); Reference.reachabilityFence(rows); Reference.reachabilityFence(evidenceKeepAlive);
            }
            return rows;
        }
    }
    public static void main(String[] args) throws Exception {
        String url=System.getenv("GROWTH_DATABASE_URL");
        if(url==null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_growth_test")) throw new IllegalArgumentException("Owned growth test DB only");
        int count=Integer.parseInt(args[1]),width=Integer.parseInt(args[2]); String mode=args[0];
        var jdbc=new ObservedJdbc(new DriverManagerDataSource(url,"edhr",""));
        jdbc.execute("DROP SCHEMA IF EXISTS growth_probe CASCADE; CREATE SCHEMA growth_probe");
        jdbc=new ObservedJdbc(new DriverManagerDataSource(url+"?currentSchema=growth_probe","edhr",""));
        try {
            jdbc.execute("CREATE TABLE dhr_summary_evidence(tenant_id text,summary_version_id bigint,source_record_id bigint,source_snapshot jsonb)");
            jdbc.execute("CREATE TABLE form_instance_record(id bigint primary key,tenant_id text,snapshot_json jsonb,values_json jsonb,status text,version_id bigint,source_type text,object_id bigint,instance_no text)");
            jdbc.execute("CREATE TABLE dhr_summary_version(id bigint,tenant_id text,dhr_instance_id bigint,attachment_snapshot jsonb)");
            jdbc.execute("CREATE TABLE dhr_instance(id bigint,tenant_id text,production_object_id bigint)");
            jdbc.execute("CREATE TABLE dhr_attachment(id bigint,tenant_id text,dhr_instance_id bigint,active boolean,sha256 text,verification_status text,stored_path text)");
            jdbc.update("INSERT INTO dhr_instance VALUES(1,'default',100)");
            jdbc.update("INSERT INTO dhr_summary_version VALUES(2,'default',1,'[]')");
            jdbc.update("INSERT INTO form_instance_record SELECT n,'default','{}'::jsonb,jsonb_build_object('payload',repeat('x',?), 'row',n),'COMPLETED',10,'PRODUCTION_EXECUTION',100,'FR-'||n FROM generate_series(1,?) n",width,count);
            jdbc.update("INSERT INTO dhr_summary_evidence SELECT 'default',2,id,jsonb_build_object('snapshot',snapshot_json,'fieldValues',values_json,'status',status,'templateVersionId',version_id::text,'instanceNo',instance_no) FROM form_instance_record");
            var mapper=new ObjectMapper();
            Object service= mode.equals("current")?new DhrEvidenceImpactService(jdbc,mapper)
                    :Class.forName("com.zencas.edhr.production.service.DhrEvidenceImpactServiceLegacyProbe").getDeclaredConstructor(JdbcTemplate.class,ObjectMapper.class).newInstance(jdbc,mapper);
            var method=service.getClass().getDeclaredMethod("changes",Long.class,boolean.class);method.setAccessible(true);
            long before=retained(),start=System.nanoTime();
            var result=(com.fasterxml.jackson.databind.JsonNode)method.invoke(service,2L,false);
            if(!result.isEmpty()) throw new AssertionError("Synthetic matching evidence unexpectedly changed");
            Map<String,Object> out=new LinkedHashMap<>();
            out.put("mode",mode);out.put("records",count);out.put("payloadCharsPerRecord",width);
            out.put("queryCalls",jdbc.reads);out.put("currentRowsAtCheckpoint",jdbc.currentRows);out.put("currentJsonCharsAtCheckpoint",jdbc.currentJsonChars);
            out.put("heapBeforeBytes",before);out.put("heapWithFrozenEvidenceBytes",jdbc.evidenceHeap);out.put("heapWithFirstCurrentQueryBytes",jdbc.currentHeap);
            out.put("addedRetainedBytesAtCurrentQuery",jdbc.currentHeap-jdbc.evidenceHeap);
            out.put("elapsedNanosIncludingForcedGc",System.nanoTime()-start);out.put("maxHeapBytes",Runtime.getRuntime().maxMemory());
            out.put("changes",result.size());out.put("qualification","Forced-GC retained checkpoints in isolated single request; not allocation peak, production throughput, concurrent capacity, or SLA. Legacy samples first current row; current samples full returned batch before indexing.");
            Files.writeString(Path.of(args[3]),mapper.writeValueAsString(out)+"\n",StandardOpenOption.CREATE,StandardOpenOption.APPEND);
        } finally { jdbc.execute("DROP SCHEMA growth_probe CASCADE"); }
    }
}
