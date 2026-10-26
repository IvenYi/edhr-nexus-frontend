package audit;
import com.zencas.edhr.masterdata.entity.RouteNode;
import com.zencas.edhr.masterdata.entity.RouteRelation;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.cfg.Configuration;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.springframework.data.jpa.repository.support.SimpleJpaRepository;
import java.sql.*;
import java.nio.file.*;
import java.util.*;

/** Actual Spring Data saveAll/JPA/PG for assigned IDs; synthetic schema, not full HTTP save. */
public class RouteSaveAllProbe {
    public static void main(String[] args) throws Exception {
        String url=System.getenv("GROWTH_DATABASE_URL");
        if(url==null || !url.matches("jdbc:postgresql://(?:localhost|127\\.0\\.0\\.1):[0-9]+/edhr_growth_test")) throw new IllegalArgumentException("Owned growth test DB only");
        try(var c=DriverManager.getConnection(url,"edhr","")){c.createStatement().execute("CREATE SCHEMA route_save_probe");}
        List<String> sql=new ArrayList<>();
        var cfg=new Configuration().addAnnotatedClass(RouteNode.class).addAnnotatedClass(RouteRelation.class)
                .setProperty("hibernate.connection.url",url+"?currentSchema=route_save_probe")
                .setProperty("hibernate.connection.username","edhr").setProperty("hibernate.connection.password","")
                .setProperty("hibernate.hbm2ddl.auto","create-drop").setProperty("hibernate.jdbc.batch_size","20");
        cfg.getProperties().put("hibernate.session_factory.statement_inspector",(StatementInspector)s->{sql.add(s);return s;});
        try(var factory=cfg.buildSessionFactory()) {
            for(int count:new int[]{10,100,1000}) {
                try(var em=factory.createEntityManager()) {
                    var tx=em.getTransaction();tx.begin();
                    var nodes=new ArrayList<RouteNode>();var relations=new ArrayList<RouteRelation>();
                    long base=count*10000L;
                    for(int i=0;i<count;i++)nodes.add(RouteNode.builder().id(base+i).routeVersionId(1L).nodeKey("n"+i)
                            .nodeType(i==0?"START":i==count-1?"END":"OPERATION").positionX(0).positionY(0).sortOrder(i).build());
                    for(int i=0;i<count-1;i++)relations.add(RouteRelation.builder().id(base+count+i).routeVersionId(1L)
                            .sourceNodeKey("n"+i).targetNodeKey("n"+(i+1)).relationType("SEQUENTIAL").priority(i).build());
                    sql.clear();
                    new SimpleJpaRepository<RouteNode,Long>(RouteNode.class,em).saveAll(nodes);
                    new SimpleJpaRepository<RouteRelation,Long>(RouteRelation.class,em).saveAll(relations);
                    em.flush();
                    long selects=sql.stream().filter(s->s.toLowerCase().startsWith("select ")).count();
                    if(selects!=2L*count-1)throw new AssertionError("Unexpected assigned-ID query behavior: "+selects);
                    var result=Map.of("nodes",count,"relations",count-1,"existenceSelects",selects,
                            "statementInspectorCalls",sql.size(),"jdbcBatchSize",20,
                            "qualification","Actual entities + Spring Data saveAll + Hibernate + native PG; no full HTTP, deletion, audit, fresh-baseline FK or latency claim. Insert batching does not remove existence selects.");
                    Files.writeString(Path.of(args[0]),new ObjectMapper().writeValueAsString(result)+"\n",StandardOpenOption.CREATE,StandardOpenOption.APPEND);
                    tx.rollback();
                }
            }
        } finally {try(var c=DriverManager.getConnection(url,"edhr","")){c.createStatement().execute("DROP SCHEMA route_save_probe CASCADE");}}
    }
}
