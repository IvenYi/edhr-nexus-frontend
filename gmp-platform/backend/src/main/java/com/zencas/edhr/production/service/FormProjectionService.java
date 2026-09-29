package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.template.service.FormProjectionInterpreter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Service
@RequiredArgsConstructor
public class FormProjectionService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    /** Joins the same transaction which makes the source COMPLETED. */
    @Transactional
    public void completed(long instanceId, String tenant, JsonNode form, JsonNode values, JsonNode context,
                          String operationId) {
        if (!form.path("projection").path("bindings").isArray() || form.path("projection").path("bindings").isEmpty()) return;
        ObjectNode model = mapper.createObjectNode();
        model.set("fields", form.path("fields")); model.set("projection", form.path("projection"));
        FormProjectionInterpreter.preview(model, values); // Domain errors abort completion, operational processing is separate.
        ObjectNode source = mapper.createObjectNode().put("operationId", operationId);
        source.set("form", form.deepCopy()); source.set("model", model); source.set("values", values.deepCopy());
        source.set("context", context.deepCopy());
        jdbc.update("""
            INSERT INTO form_projection_batch(tenant_id,form_instance_id,final_revision,rule_version,source_json)
            VALUES (?,?,1,?,CAST(? AS jsonb)) ON CONFLICT (form_instance_id,final_revision,rule_version) DO NOTHING
            """, tenant, instanceId, FormProjectionInterpreter.VERSION, source.toString());
    }

    @Transactional
    public void process(long batchId) {
        var rows = jdbc.queryForList("SELECT source_json::text AS source,status,rule_version FROM form_projection_batch WHERE id=? AND status='PENDING' FOR UPDATE SKIP LOCKED", batchId);
        if (rows.isEmpty()) return;
        if (!FormProjectionInterpreter.VERSION.equals(rows.getFirst().get("rule_version"))) throw invalid("投影规则版本不可用");
        JsonNode source = parse(rows.getFirst().get("source").toString());
        var records = FormProjectionInterpreter.preview(source.path("model"), source.path("values"));
        for (JsonNode record : records) jdbc.update("""
            INSERT INTO form_projection_record(batch_id,binding_id,row_key,model_id,attributes,sources,table_id)
            VALUES (?,?,?,?,CAST(? AS jsonb),CAST(? AS jsonb),?)
            """, batchId, record.path("bindingId").asText(), record.path("rowKey").asText(), record.path("modelId").asText(),
                record.path("attributes").toString(), record.path("sources").toString(), record.path("tableId").asText());
        jdbc.update("UPDATE form_projection_batch SET status='SUCCEEDED',attempts=attempts+1,error_message=NULL,processed_at=CURRENT_TIMESTAMP WHERE id=?", batchId);
    }

    @Transactional
    public void failed(long batchId) {
        // Do not expose SQL or source contents in error messages. A failed transaction leaves no partial results.
        jdbc.update("UPDATE form_projection_batch SET status='FAILED',attempts=attempts+1,error_message='投影处理失败，请重试或联系管理员',processed_at=CURRENT_TIMESTAMP WHERE id=? AND status='PENDING'", batchId);
    }

    private JsonNode parse(String json) {
        try { return mapper.readTree(json); } catch (Exception ex) { throw invalid("投影快照无法读取"); }
    }
}
