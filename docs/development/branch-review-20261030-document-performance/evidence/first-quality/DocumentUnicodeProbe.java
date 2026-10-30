import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.zencas.edhr.identity.security.JwtTokenProvider;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.WebApplicationType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;
public class DocumentUnicodeProbe {
  public static void main(String[] args) throws Exception {
    Class<?> config=Class.forName("com.zencas.edhr.masterdata.controller.DocumentReadBoundaryIntegrationTest$Config");
    try(var ctx=new SpringApplicationBuilder(config).web(WebApplicationType.SERVLET).run(
      "--spring.liquibase.enabled=false","--spring.jpa.hibernate.ddl-auto=create-drop",
      "--spring.datasource.url="+System.getenv("EDHR_DOCUMENT_DATABASE_URL"),
      "--spring.datasource.username="+System.getenv("EDHR_DOCUMENT_DATABASE_USER"),
      "--spring.datasource.password="+System.getenv("EDHR_DOCUMENT_DATABASE_PASSWORD"),
      "--spring.datasource.driver-class-name=org.postgresql.Driver",
      "--spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect",
      "--spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect",
      "--server.port=0","--logging.level.root=WARN")) {
      var jdbc=ctx.getBean(JdbcTemplate.class);jdbc.execute("ALTER TABLE sop_document ALTER COLUMN code DROP NOT NULL");
      var mapper=ctx.getBean(ObjectMapper.class);var tokens=ctx.getBean(JwtTokenProvider.class);
      var mvc=MockMvcBuilders.webAppContextSetup((WebApplicationContext)ctx).apply(SecurityMockMvcConfigurers.springSecurity()).build();
      String bearer="Bearer "+tokens.generateToken("qa-probe","qa-probe","独立复验",5,List.of("master-data.documents"));
      var out=new LinkedHashMap<String,Object>();
      var created=mvc.perform(MockMvcRequestBuilders.post("/api/v1/master-data/documents").header("Authorization",bearer).contentType("application/json")
        .content(mapper.writeValueAsString(Map.of("title","İzmir work instruction","version","V1","code","IZMIR-PROBE")))).andReturn().getResponse();
      out.put("createStatus",created.getStatus());out.put("createBody",mapper.readTree(created.getContentAsString(StandardCharsets.UTF_8)));
      for(String keyword:List.of("İzmir","izmir")) {
        var response=mvc.perform(MockMvcRequestBuilders.get("/api/v1/master-data/documents").header("Authorization",bearer).param("keyword",keyword)).andReturn().getResponse();
        out.put(keyword,Map.of("status",response.getStatus(),"body",mapper.readTree(response.getContentAsString(StandardCharsets.UTF_8))));
      }
      out.put("javaNormalized", "İzmir".toLowerCase(java.util.Locale.ROOT));
      out.put("persistedTitle",jdbc.queryForObject("SELECT title FROM sop_document WHERE title=?",String.class,"İzmir work instruction"));
      mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of("/tmp/edhr-document-perf-qa-unicode-api.json").toFile(),out);
      System.out.println(mapper.writeValueAsString(out));
    }
  }
}
