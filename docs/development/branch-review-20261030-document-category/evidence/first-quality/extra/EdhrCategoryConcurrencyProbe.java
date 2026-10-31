import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.web.context.WebServerApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;
import java.net.URI;
import java.net.http.*;
import java.nio.file.*;
import java.sql.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

/** External independent runtime probe; no project source, test or fixture file is edited. */
public class EdhrCategoryConcurrencyProbe {
  static final ObjectMapper JSON = new ObjectMapper().findAndRegisterModules();
  static Map<String,Object> response(HttpResponse<String> value) throws Exception {
    return Map.of("status", value.statusCode(), "body", JSON.readTree(value.body()));
  }
  static int waiters(JdbcTemplate jdbc) {
    return jdbc.queryForObject("SELECT COUNT(*) FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query ILIKE '%document_category%'", Integer.class);
  }
  static void awaitWaiters(JdbcTemplate jdbc,int expected) throws Exception {
    long end=System.nanoTime()+TimeUnit.SECONDS.toNanos(15);
    while(System.nanoTime()<end) { if(waiters(jdbc)>=expected)return; Thread.sleep(20); }
    throw new IllegalStateException("Expected controlled waiting writers="+expected+" actual="+waiters(jdbc));
  }
  public static void main(String[] args) throws Exception {
    ConfigurableApplicationContext ctx=null;
    Connection blocker=null;
    var out=new LinkedHashMap<String,Object>();
    try (var writers=Executors.newFixedThreadPool(2)) {
      var app=new SpringApplication(Class.forName("com.zencas.edhr.masterdata.controller.DocumentCategoryAuditPostgresTest$Config"));
      ctx=app.run("--spring.datasource.url="+args[0],"--spring.datasource.username="+args[1],"--spring.datasource.password="+args[2],
        "--spring.datasource.driver-class-name=org.postgresql.Driver","--spring.liquibase.enabled=false","--spring.jpa.hibernate.ddl-auto=none",
        "--spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect","--spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect",
        "--spring.jpa.show-sql=false","--logging.level.org.hibernate.SQL=OFF","--logging.level.org.springframework=ERROR","--server.port=0");
      var jdbc=ctx.getBean(JdbcTemplate.class);
      jdbc.execute("ALTER TABLE audit_event DROP CONSTRAINT IF EXISTS ck_category_audit_failure");
      for(String table:List.of("document_version","sop_document","document_category","file_object","audit_event"))jdbc.update("DELETE FROM "+table);
      jdbc.update("INSERT INTO document_category(id,tenant_id,name,system_category,sort_order) VALUES(201,'default','A',false,30),(202,'default','B',false,40)");
      out.put("before",jdbc.queryForList("SELECT id,sort_order FROM document_category ORDER BY id"));
      blocker=ctx.getBean(DataSource.class).getConnection();blocker.setAutoCommit(false);
      try(var lock=blocker.prepareStatement("SELECT id FROM document_category WHERE id=201 FOR UPDATE")) { lock.executeQuery().close(); }
      int port=((WebServerApplicationContext)ctx).getWebServer().getPort();
      String uri="http://127.0.0.1:"+port+"/api/v1/master-data/documents/categories/order";
      var provider=ctx.getBean(JwtTokenProvider.class);
      var client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
      String firstToken=provider.generateToken("qa-A","qa-A","A",5,List.of("master-data.documents"));
      String secondToken=provider.generateToken("qa-B","qa-B","B",5,List.of("master-data.documents"));
      var a=HttpRequest.newBuilder(URI.create(uri)).timeout(Duration.ofSeconds(25)).header("Authorization","Bearer "+firstToken).header("Content-Type","application/json").PUT(HttpRequest.BodyPublishers.ofString("{\"ids\":[\"202\",\"201\"]}")).build();
      var b=HttpRequest.newBuilder(URI.create(uri)).timeout(Duration.ofSeconds(25)).header("Authorization","Bearer "+secondToken).header("Content-Type","application/json").PUT(HttpRequest.BodyPublishers.ofString("{\"ids\":[\"201\",\"202\"]}")).build();
      var first=writers.submit(()->client.send(a,HttpResponse.BodyHandlers.ofString()));
      awaitWaiters(jdbc,1);out.put("firstWriterWaiting",true);
      var second=writers.submit(()->client.send(b,HttpResponse.BodyHandlers.ofString()));
      awaitWaiters(jdbc,2);out.put("bothWritersReadAndWaiting",true);
      blocker.commit();blocker.close();blocker=null;
      out.put("first",response(first.get(30,TimeUnit.SECONDS)));
      out.put("second",response(second.get(30,TimeUnit.SECONDS)));
      out.put("after",jdbc.queryForList("SELECT id,sort_order FROM document_category ORDER BY id"));
      var audits=jdbc.queryForList("SELECT entity_id,action,operator_account,content_before::text,content_after::text FROM audit_event ORDER BY id");
      out.put("audits",audits);out.put("auditRows",audits.size());
      out.put("auditsBySecondActor",jdbc.queryForObject("SELECT COUNT(*) FROM audit_event WHERE operator_account='qa-B'",Integer.class));
      out.put("qualification","Own synthetic canonical DB; real controller HTTP/JWT/transactions. External row lock ensures two legitimate requests read the same before-values before serial writes; no project source or fixture edits.");
    } catch(Exception exception) {
      out.put("probeError",exception.toString());throw exception;
    } finally {
      if(blocker!=null){blocker.rollback();blocker.close();}
      if(ctx!=null)ctx.close();
      Files.writeString(Path.of("/tmp/edhr-document-category-q1-concurrency-result.json"),JSON.writeValueAsString(out)+"\n");
    }
  }
}
