package audit;
import java.sql.*;
import java.nio.file.*;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import liquibase.*;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;

/** Disposable fresh/existing-sentinel databases only; no original values exported. */
public class BaselineProbe {
    static long scalar(Connection c,String sql) throws Exception {
        try(var s=c.createStatement();var r=s.executeQuery(sql)){r.next();return r.getLong(1);}
    }
    public static void main(String[] args) throws Exception {
        String prefix=System.getenv("GROWTH_BASELINE_PREFIX");
        if(prefix==null || !prefix.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_growth_")) throw new IllegalArgumentException("Owned databases only");
        Map<String,Object> out=new LinkedHashMap<>();
        try(var c=DriverManager.getConnection(prefix+"fresh","edhr","");var l=new Liquibase("db/changelog/db.changelog-master.yaml",new ClassLoaderResourceAccessor(),new JdbcConnection(c))) {
            l.update(new Contexts(),new LabelExpression());
            long changes=scalar(c,"SELECT count(*) FROM databasechangelog");
            long validForeignKeys=scalar(c,"SELECT count(*) FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace AND convalidated");
            long invalidForeignKeys=scalar(c,"SELECT count(*) FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace AND NOT convalidated");
            long businessRows=0;
            for(String table:List.of("form_template","form_template_version","production_object","production_execution","form_instance_record","dhr_instance","dhr_summary_version","signature","audit_event")) businessRows+=scalar(c,"SELECT count(*) FROM "+table);
            long traceItems=scalar(c,"SELECT count(*) FROM form_lookup_item");
            l.update(new Contexts(),new LabelExpression());
            if(changes!=2 || invalidForeignKeys!=0 || businessRows!=0 || scalar(c,"SELECT count(*) FROM databasechangelog")!=changes) throw new AssertionError("Fresh baseline mismatch");
            out.put("changesets",changes);out.put("validatedForeignKeys",validForeignKeys);out.put("unvalidatedForeignKeys",invalidForeignKeys);
            out.put("selectedBusinessTablesRows",businessRows);out.put("traceItems",traceItems);out.put("secondUpdateNewChangesets",0);
        }
        try(var c=DriverManager.getConnection(prefix+"existing","edhr","");var l=new Liquibase("db/changelog/db.changelog-master.yaml",new ClassLoaderResourceAccessor(),new JdbcConnection(c))) {
            c.createStatement().execute("CREATE TABLE existing_business_sentinel(id int primary key); INSERT INTO existing_business_sentinel VALUES(1)");
            boolean blocked=false;
            try{l.update(new Contexts(),new LabelExpression());}catch(liquibase.exception.LiquibaseException expected){blocked=true;}
            if(!blocked || scalar(c,"SELECT count(*) FROM existing_business_sentinel")!=1 || scalar(c,"SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='form_instance_record'")!=0) throw new AssertionError("Nonempty database protection failed");
            out.put("nonemptyDatabaseBlocked",true);out.put("sentinelPreserved",true);
        }
        Files.writeString(Path.of(args[0]),new ObjectMapper().writeValueAsString(out)+"\n");
    }
}
