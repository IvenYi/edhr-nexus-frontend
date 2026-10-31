import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.recordcontrol.service.RecordControlDiff;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.production.service.ProductionExecutionEngine;
import java.util.List;
import static org.mockito.Mockito.*;

class RowIdentityFinalProbe {
    static void require(boolean condition, String description) {
        if (!condition) throw new AssertionError(description);
        System.out.println("PASS: " + description);
    }
    static void denied(String description, Runnable action) {
        try { action.run(); throw new AssertionError("Expected rejection: " + description); }
        catch (BusinessException expected) { System.out.println("PASS: " + description + " -> " + expected.getMessage()); }
    }
    public static void main(String[] args) throws Exception {
        var mapper = new ObjectMapper();
        var engine = mock(ProductionExecutionEngine.class);
        when(engine.validateValues(any(), any())).thenReturn(List.of());
        var difference = new RecordControlDiff(mapper, engine, mock(ExecutionAccess.class));
        var form = mapper.readTree("""
          {"fields":[{"id":"body","type":"text"},{"id":"rows","type":"subTable","typeConfig":{"columns":[{"id":"value","type":"text"}]}}]}
          """);
        String nativeA = "1c3068b9-3faa-4c64-b584-18380b84fa9b";
        String nativeB = "2c3068b9-3faa-4c64-b584-18380b84fa9b";
        String nativeC = "3c3068b9-3faa-4c64-b584-18380b84fa9b";
        var raw = mapper.createObjectNode().put("body", "old");
        raw.putArray("rows").addObject().put("__rowId", nativeA).put("value", "A");
        var source = (ObjectNode) difference.identifyRows(raw, form, "123");
        var proposal = source.deepCopy();
        ((ObjectNode) proposal.path("rows").get(0)).put("value", "changed");
        var prepared = difference.prepare(form, source, proposal, "109");
        require(prepared.differences().size() == 1, "original production-row business change is accepted");
        var saved = difference.stripRowIds(prepared.values()).path("rows").get(0);
        require(saved.path("__rowId").asText().equals(nativeA) && !saved.has("__recordRowId"), "native identity survives effective-value projection and private comparison identity is removed");
        var mainOnly = difference.prepare(form, source, mapper.createObjectNode().put("body", "new"), "109");
        require(mainOnly.differences().size() == 1 && mainOnly.values().path("rows").get(0).path("__rowId").asText().equals(nativeA), "main-only change keeps an omitted production subtable");
        proposal = source.deepCopy();
        ((ObjectNode) proposal.path("rows").get(0)).remove("__rowId");
        require(difference.prepare(form, source, proposal, "109").differences().isEmpty(), "omitted native identity is restored without a content difference");
        proposal = source.deepCopy();
        ((ObjectNode) proposal.path("rows").get(0)).remove("__recordRowId");
        require(difference.prepare(form, source, proposal, "109").differences().isEmpty(), "native identity resolves omitted comparison identity to the existing row");
        var forged = source.deepCopy();
        ((ObjectNode) forged.path("rows").get(0)).put("__rowId", nativeB);
        denied("existing native identity cannot be replaced", () -> difference.prepare(form, source, forged, "109"));
        var forgedComparison = source.deepCopy();
        ((ObjectNode) forgedComparison.path("rows").get(0)).put("__recordRowId", "4c3068b9-3faa-4c64-b584-18380b84fa9b");
        denied("existing native identity cannot claim a different comparison identity", () -> difference.prepare(form, source, forgedComparison, "109"));
        var duplicate = source.deepCopy();
        duplicate.withArray("rows").addObject().put("__rowId", nativeA).put("value", "duplicate");
        denied("a new row cannot reuse a source identity", () -> difference.prepare(form, source, duplicate, "109"));
        var unknown = source.deepCopy();
        ((ObjectNode) unknown.path("rows").get(0)).put("unknownBusinessColumn", "x");
        denied("unknown business columns remain rejected", () -> difference.prepare(form, source, unknown, "109"));
        var twoRaw = raw.deepCopy();
        twoRaw.withArray("rows").addObject().put("__rowId", nativeB).put("value", "B");
        var two = (ObjectNode) difference.identifyRows(twoRaw, form, "123");
        var reordered = two.deepCopy();
        reordered.set("rows", mapper.createArrayNode().add(two.path("rows").get(1)).add(two.path("rows").get(0)));
        require(difference.prepare(form, two, reordered, "109").differences().isEmpty(), "native row reordering is not a content change");
        var added = two.deepCopy();
        added.withArray("rows").addObject().put("__rowId", nativeC).put("value", "C");
        var addition = difference.prepare(form, two, added, "109");
        require(addition.differences().size() == 1 && addition.differences().get(0).path("changeType").asText().equals("ROW_ADDED"), "new native row yields one row-added difference");
        var removed = two.deepCopy();
        removed.withArray("rows").remove(1);
        var removal = difference.prepare(form, two, removed, "109");
        require(removal.differences().size() == 1 && removal.differences().get(0).path("changeType").asText().equals("ROW_REMOVED"), "removed native row yields one row-removed difference");
        var legacy = mapper.createObjectNode().put("body", "old");
        legacy.putArray("rows").addObject().put("value", "legacy");
        var legacySource = (ObjectNode) difference.identifyRows(legacy, form, "123");
        require(difference.prepare(form, legacySource, legacySource.deepCopy().put("body", "new"), "109").differences().size() == 1, "legacy row without native metadata remains supported");
        System.out.println("Independent probe completed: 13 checked outcomes, actual RecordControlDiff; engine/evidence validation are mocked and separately covered by PostgreSQL application tests.");
    }
}
