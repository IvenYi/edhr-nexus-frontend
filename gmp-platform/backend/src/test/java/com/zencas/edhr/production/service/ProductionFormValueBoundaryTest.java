package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.SubjectResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.lang.management.ManagementFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.mock;

/** Domain/JSON and isolated H2 evidence fixture, not a production HTTP or native-PG test. */
class ProductionFormValueBoundaryTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private CountingJdbc jdbc;
    private ExecutionAccess access;
    private ProductionExecutionEngine engine;

    @BeforeEach void setup() {
        jdbc = new CountingJdbc(new DriverManagerDataSource("jdbc:h2:mem:w2_values_" + UUID.randomUUID()
                + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1", "sa", ""));
        jdbc.execute("CREATE TABLE file_object(id bigint primary key,target_type varchar,target_id varchar,original_name varchar)");
        jdbc.update("INSERT INTO file_object VALUES(9,'PRODUCTION_EXECUTION','101','原件.pdf'),(10,'PRODUCTION_EXECUTION','202','其他对象.pdf')");
        access = new ExecutionAccess(mock(SubjectResolver.class), mock(UserAccountRepository.class), new BCryptPasswordEncoder(4),
                mock(SignatureRepository.class), new SnowflakeIdGenerator(1), mapper, jdbc);
        engine = new ProductionExecutionEngine(mapper, access);
    }

    @AfterEach void closeOwnedDatabase() { if (jdbc != null) jdbc.execute("SHUTDOWN"); }

    @Test void draftJsonRoundTripPreservesClearsZeroAndRowIdentityUntilFinalCompletion() throws Exception {
        ObjectNode snapshot = snapshot(false), state = start(snapshot);
        String frozen = snapshot.toString();
        ObjectNode request = (ObjectNode) mapper.readTree("{\"note\":\"\",\"quantity\":0,\"entries\":[{}]}");
        String input = request.toString();
        action(snapshot, state, "SAVE", request);
        assertThat(request.toString()).isEqualTo(input);
        String rowId = state.at("/operations/op/forms/f/values/entries/0/__rowId").asText();
        assertThat(UUID.fromString(rowId).toString()).isEqualTo(rowId);
        assertThat(state.at("/operations/op/forms/f/values/entries/0/unit").asText()).isEqualTo("piece");
        ObjectNode reopened = (ObjectNode) mapper.readTree(state.toString());
        action(snapshot, reopened, "SAVE", mapper.createObjectNode());
        JsonNode saved = reopened.at("/operations/op/forms/f/values").deepCopy();
        assertThat(saved.path("note").asText()).isEmpty();
        assertThat(saved.path("quantity").decimalValue()).isEqualByComparingTo("0");
        String beforeInvalidSubmit = reopened.toString();
        assertThatThrownBy(() -> action(snapshot, reopened, "SUBMIT", mapper.createObjectNode())).hasMessageContaining("实际用量");
        assertThat(reopened.toString()).isEqualTo(beforeInvalidSubmit);
        ((ObjectNode) saved.path("entries").get(0)).put("quantity", 0);
        action(snapshot, reopened, "SAVE", (ObjectNode) saved);
        action(snapshot, reopened, "SUBMIT", mapper.createObjectNode());
        assertThat(reopened.at("/operations/op/forms/f/status").asText()).isEqualTo("COMPLETED");
        assertThat(reopened.at("/operations/op/forms/f/values/entries/0/__rowId").asText()).isEqualTo(rowId);
        engine.complete(snapshot, reopened, "op", "41", false);
        assertThat(reopened.at("/operations/op/status").asText()).isEqualTo("COMPLETED");
        assertThat(snapshot.toString()).isEqualTo(frozen);
        assertThat(jdbc.queries).isEmpty();
    }

    @Test void foreignFileCannotAdvanceDraftAndSameObjectEvidenceSurvivesReopen() throws Exception {
        ObjectNode snapshot = snapshot(true), state = start(snapshot);
        String before = state.toString();
        ObjectNode foreign = (ObjectNode) mapper.readTree("{\"entries\":[{\"files\":[{\"fileId\":\"10\",\"originalName\":\"其他对象.pdf\"}]}]}");
        assertThatThrownBy(() -> action(snapshot, state, "SAVE", foreign)).hasMessageContaining("不属于当前生产对象");
        assertThat(state.toString()).isEqualTo(before);
        ObjectNode allowed = (ObjectNode) mapper.readTree("{\"entries\":[{\"quantity\":0,\"files\":[{\"fileId\":\"9\",\"originalName\":\"原件.pdf\"}]}]}");
        action(snapshot, state, "SAVE", allowed);
        ObjectNode reopened = (ObjectNode) mapper.readTree(state.toString());
        action(snapshot, reopened, "SUBMIT", mapper.createObjectNode());
        assertThat(reopened.at("/operations/op/forms/f/status").asText()).isEqualTo("COMPLETED");
        assertThat(reopened.at("/operations/op/forms/f/values/entries/0/files/0/fileId").asText()).isEqualTo("9");
    }

    @ParameterizedTest @CsvSource({"0,false", "10,false", "100,false", "300,false", "10,true", "100,true", "300,true"})
    @EnabledIfSystemProperty(named="edhr.audit.w2Values", matches="true")
    void observeRealEvidenceValidationWithWideRows(int rows, boolean files) throws Exception {
        ObjectNode snapshot = snapshot(files);
        JsonNode table = snapshot.at("/operations/0/forms/0/fields/2");
        for (int i=0;i<12;i++) ((com.fasterxml.jackson.databind.node.ArrayNode)table.at("/typeConfig/columns"))
                .addObject().put("id","text"+i).put("name","说明"+i).put("type","text");
        ObjectNode values=mapper.createObjectNode().put("note","同次主值").put("quantity",0);
        var entries=values.putArray("entries");
        for (int i=0;i<rows;i++) {
            ObjectNode row=entries.addObject().put("__rowId",UUID.randomUUID().toString()).put("quantity",i).put("unit","piece");
            for(int column=0;column<12;column++) row.put("text"+column,"实际行说明-"+i+"-"+column);
            if(files) row.putArray("files").addObject().put("fileId","9").put("originalName","原件.pdf");
        }
        JsonNode previous=entries.deepCopy();String before=values.toString(), previousBefore=previous.toString();
        access.validateEvidence(table,mapper.createArrayNode(),"101",mapper.createObjectNode(),mapper.createArrayNode());
        jdbc.queries.clear();
        var memory=(com.sun.management.ThreadMXBean)ManagementFactory.getThreadMXBean();
        assertThat(memory.isThreadAllocatedMemorySupported()).isTrue();memory.setThreadAllocatedMemoryEnabled(true);
        long allocated=memory.getThreadAllocatedBytes(Thread.currentThread().threadId()),started=System.nanoTime();
        access.validateEvidence(table,entries,"101",values,previous);
        long elapsed=System.nanoTime()-started,bytes=memory.getThreadAllocatedBytes(Thread.currentThread().threadId())-allocated;
        assertThat(values.toString()).isEqualTo(before);assertThat(previous.toString()).isEqualTo(previousBefore);
        if(files && rows>0) assertThat(jdbc.queries).isNotEmpty();
        else assertThat(jdbc.queries).isEmpty();
        ObjectNode observation=mapper.createObjectNode().put("rows",rows).put("textColumns",12).put("repeatedFile",files)
                .put("inputJsonBytes",before.getBytes(java.nio.charset.StandardCharsets.UTF_8).length).put("elapsedNanos",elapsed)
                .put("threadAllocatedBytes",bytes).put("actualH2Queries",jdbc.queries.size()).put("inputUnchanged",true).put("previousUnchanged",true);
        observation.set("queries",mapper.valueToTree(jdbc.queries));
        String folder=System.getProperty("edhr.audit.w2ValueOutput");
        if(folder!=null){Path dir=Path.of(folder);Files.createDirectories(dir);mapper.writerWithDefaultPrettyPrinter()
                .writeValue(dir.resolve("rows-"+rows+"-files-"+files+".json").toFile(),observation);}
    }

    private ObjectNode snapshot(boolean files) throws Exception {
        ObjectNode result=(ObjectNode)mapper.readTree("""
          {"context":{"objectId":"101","objectType":"BATCH","objectNo":"B01"},
           "operations":[{"id":"op","name":"工序","type":"OPERATION","works":[],"forms":[
             {"id":"f","name":"现场记录","required":true,"fillMode":"DIRECT","entryNode":{"id":"entry","data":{"kind":"START","config":{}}},"fields":[
               {"id":"note","name":"说明","type":"text","typeConfig":{"defaultValue":"初始说明"}},
               {"id":"quantity","name":"数量","type":"number","required":true,"typeConfig":{"defaultValue":1,"min":0}},
               {"id":"entries","name":"明细","type":"subTable","typeConfig":{"columns":[
                 {"id":"unit","name":"单位","type":"singleSelect","readOnly":true,"typeConfig":{"options":"件:piece","defaultValue":"piece"}},
                 {"id":"quantity","name":"实际用量","type":"number","required":true,"typeConfig":{"min":0}}]}}]}]}],
           "routeNodes":[{"id":"op","type":"OPERATION"}],"routeEdges":[]}
          """);
        if(files)((com.fasterxml.jackson.databind.node.ArrayNode)result.at("/operations/0/forms/0/fields/2/typeConfig/columns"))
                .addObject().put("id","files").put("name","附件").put("type","attachment");
        return result;
    }
    private ObjectNode start(ObjectNode snapshot){ObjectNode state=engine.initialState(snapshot);engine.start(snapshot,state,"op","41");return state;}
    private void action(ObjectNode snapshot,ObjectNode state,String action,ObjectNode values){engine.formAction(snapshot,state,"op","f",action,values,null,null,null,"41");}
    private static class CountingJdbc extends JdbcTemplate {
        private final List<ObjectNode> queries=new ArrayList<>();
        private final ObjectMapper mapper=new ObjectMapper();
        CountingJdbc(DriverManagerDataSource source){super(source);}
        @Override public <T> List<T> query(String sql,RowMapper<T> rowMapper,Object... args){
            ObjectNode entry=mapper.createObjectNode().put("sql",sql);entry.set("parameters",mapper.valueToTree(args));queries.add(entry);
            return super.query(sql,rowMapper,args);
        }
    }
}
