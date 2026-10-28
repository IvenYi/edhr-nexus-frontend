import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.recordcontrol.service.RecordControlDiff;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.production.service.ProductionExecutionEngine;
import java.util.List;
import static org.mockito.Mockito.*;

class SubtableRowIdentityProbe {
    public static void main(String[] args) throws Exception {
        var mapper = new ObjectMapper();
        var engine = mock(ProductionExecutionEngine.class);
        when(engine.validateValues(any(), any())).thenReturn(List.of());
        var difference = new RecordControlDiff(mapper, engine, mock(ExecutionAccess.class));
        var form = mapper.readTree("""
          {"fields":[{"id":"rows","type":"subTable","typeConfig":{"columns":[{"id":"value","type":"text"}]}}]}
          """);
        var source = (ObjectNode) difference.identifyRows(mapper.readTree("""
          {"rows":[{"__rowId":"1c3068b9-3faa-4c64-b584-18380b84fa9b","value":"original"}]}
          """), form, "123");
        var proposed = source.deepCopy();
        ((ObjectNode) proposed.path("rows").get(0)).put("value", "changed");
        try {
            difference.prepare(form, source, proposed, "109");
            throw new AssertionError("Expected the current candidate to reproduce the integration failure");
        } catch (com.zencas.edhr.common.exception.BusinessException exception) {
            System.out.println("Existing production row identity: " + source.path("rows").get(0).path("__rowId"));
            System.out.println("Actual result: " + exception.getMessage());
            if (!exception.getMessage().contains("子表包含未知字段")) throw exception;
        }
        ((ObjectNode) source.path("rows").get(0)).remove("__rowId");
        ((ObjectNode) proposed.path("rows").get(0)).remove("__rowId");
        int changes = difference.prepare(form, source, proposed, "109").differences().size();
        System.out.println("Control without production row identity: " + changes + " valid field change(s)");
        if (changes != 1) throw new AssertionError("Control should accept the same content modification");
        System.out.println("Confirmed: current production __rowId prevents record-control subtable changes.");
    }
}
