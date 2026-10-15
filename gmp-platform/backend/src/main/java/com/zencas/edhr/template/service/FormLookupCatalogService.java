package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.AuditEvent;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Lookup meanings are configuration, not entity resolvers or statistical models. */
@Service
@RequiredArgsConstructor
public class FormLookupCatalogService {
    private static final Set<String> LEGACY_LOOKUP_IDS = Set.of("materialLotText", "serialNumberText", "equipmentText", "teamText", "documentNumberText");
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final SnowflakeIdGenerator ids;
    private final AuditEventRepository audits;

    public record Item(String id, String name, String description, String type, boolean builtin,
                       long revision, String createdBy, String createdAt, String updatedBy, String updatedAt) {}
    public record WriteRequest(String name, String description, Long revision, String type) {
        public WriteRequest(String name, String description, Long revision) { this(name, description, revision, null); }
    }
    public record Binding(String templateId, String versionId, long revision, String bindingId, String tableId, String fieldId,
                          String templateName, String version, String location, String fieldName) {}
    public record BindingSelection(long versionId, long revision, String bindingId, String fieldId) {}
    public record BindingPreview(String id, String templateId, String name, String version, String modelDesignJson, String canvasDesignJson) {}
    private record Version(long id, long revision, String templateId, String name, String label, String json) {}

    public List<Item> list() {
        return jdbc.query("SELECT * FROM form_lookup_item WHERE tenant_id='default' ORDER BY builtin DESC,created_at,id",
                (rs, row) -> new Item(rs.getString("id"), rs.getString("name"), rs.getString("description"),
                        rs.getString("value_type"), rs.getBoolean("builtin"), rs.getLong("revision"),
                        rs.getString("created_by"), rs.getString("created_at"), rs.getString("updated_by"), rs.getString("updated_at")));
    }

    public ObjectNode projectionCatalog() {
        ObjectNode result = FormProjectionInterpreter.catalog();
        for (JsonNode model : result.path("models")) if ("formTrace".equals(model.path("id").asText())) {
            ((ObjectNode) model).set("attributes", mapper.valueToTree(list()));
            for (JsonNode attribute : model.path("attributes"))
                ((ObjectNode) attribute).set("referenceSources", mapper.valueToTree(FormProjectionInterpreter.referenceSources(attribute.path("id").asText())));
        }
        return result;
    }

    public boolean contains(String id) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM form_lookup_item WHERE tenant_id='default' AND id=?)", Boolean.class, id));
    }

    @Transactional
    public Item create(WriteRequest request) {
        String id = "lookup_" + ids.nextId();
        String name = name(request.name());
        String description = description(request.description());
        String type = request.type() == null ? "text" : request.type();
        if (!FormLookupValue.TYPES.contains(type)) throw invalid("请选择文本、数字或日期类型");
        try {
            jdbc.update("INSERT INTO form_lookup_item(id,name,description,value_type,created_by,updated_by) VALUES (?,?,?,?,?,?)",
                    id, name, description, type, AuditContext.getOperatorName(), AuditContext.getOperatorName());
        } catch (DuplicateKeyException ex) { throw invalid("追溯项名称已存在，请使用已有项或填写不同含义的名称"); }
        Item saved = item(id);
        audit(id, "CREATE", null, saved);
        return saved;
    }

    @Transactional
    public Item update(String id, WriteRequest request) {
        Item before = item(id);
        if (request.type() != null && !request.type().equals(before.type())) throw invalid("追溯项类型创建后不可修改，请新建不同含义的追溯项");
        if (request.revision() == null) throw invalid("缺少追溯项版本，请刷新后重试");
        int changed;
        try {
            changed = jdbc.update("""
                    UPDATE form_lookup_item SET name=?,description=?,revision=revision+1,updated_by=?,updated_at=CURRENT_TIMESTAMP
                    WHERE tenant_id='default' AND id=? AND revision=?
                    """, name(request.name()), description(request.description()), AuditContext.getOperatorName(), id, request.revision());
        } catch (DuplicateKeyException ex) { throw invalid("追溯项名称已存在"); }
        if (changed != 1) throw invalid("追溯项已被修改，请刷新后重试");
        Item saved = item(id);
        audit(id, "UPDATE", before, saved);
        return saved;
    }

    @Transactional
    public void delete(String id, long revision) {
        lockItem(id, false);
        Item before = item(id);
        if (before.builtin()) throw invalid("预置追溯项不可删除");
        if (before.revision() != revision) throw invalid("追溯项已被修改，请刷新后重试");
        if (!bindings(id).isEmpty()) throw invalid("追溯项仍被表单配置使用，请先在“关联配置”中解除关联");
        jdbc.update("DELETE FROM form_lookup_item WHERE tenant_id='default' AND id=?", id);
        audit(id, "DELETE", before, null);
    }

    public List<Binding> bindings(String id) {
        item(id);
        List<Binding> result = new ArrayList<>();
        for (Version version : jdbc.query("""
                SELECT v.id,v.template_id,COALESCE(v.lock_version,0) revision,t.name,v.version_label,v.model_design_json
                FROM form_template_version v JOIN form_template t ON t.id=v.template_id AND t.tenant_id=v.tenant_id
                WHERE v.tenant_id='default' AND position(? in v.model_design_json)>0 ORDER BY t.name,v.id
                """, (rs, n) -> new Version(rs.getLong("id"), rs.getLong("revision"), rs.getString("template_id"), rs.getString("name"),
                rs.getString("version_label"), rs.getString("model_design_json")), id)) {
            JsonNode model = model(parse(version.json()));
            for (JsonNode binding : model.path("projection").path("bindings")) {
                if (!"formTrace".equals(binding.path("modelId").asText()) || !binding.path("sources").has(id)) continue;
                String tableId = binding.path("tableId").asText("");
                String fieldId = binding.path("sources").path(id).asText();
                JsonNode table = field(model.path("fields"), tableId);
                JsonNode source = field(tableId.isBlank() ? model.path("fields") : table.path("typeConfig").path("columns"), fieldId);
                result.add(new Binding(version.templateId(), Long.toString(version.id()), version.revision(), binding.path("id").asText(), tableId, fieldId,
                        version.name(), version.label(), tableId.isBlank() ? "主表" : "子表 · " + table.path("name").asText(tableId), source.path("name").asText(fieldId)));
            }
        }
        return result;
    }

    public BindingPreview preview(String id, long versionId, String bindingId, String fieldId) {
        item(id);
        if (bindingId == null || bindingId.isBlank() || fieldId == null || fieldId.isBlank()) throw invalid("关联配置选择无效，请刷新后重试");
        var rows = jdbc.query("""
                SELECT v.id,v.template_id,t.name,v.version_label,v.model_design_json,v.canvas_design_json
                FROM form_template_version v JOIN form_template t ON t.id=v.template_id AND t.tenant_id=v.tenant_id
                WHERE v.tenant_id='default' AND v.id=?
                """, (rs, n) -> new BindingPreview(rs.getString("id"), rs.getString("template_id"), rs.getString("name"),
                rs.getString("version_label"), rs.getString("model_design_json"), rs.getString("canvas_design_json")), versionId);
        if (!rows.isEmpty()) for (JsonNode binding : model(parse(rows.getFirst().modelDesignJson())).path("projection").path("bindings")) {
            if ("formTrace".equals(binding.path("modelId").asText()) && binding.path("sources").has(id) && binding.path("id").asText().equals(bindingId)
                    && binding.path("sources").path(id).asText().equals(fieldId)) return rows.getFirst();
        }
        throw invalid("关联配置已变化，请刷新关联配置后重试");
    }

    @Transactional
    public void unlink(String id, List<BindingSelection> selected) {
        lockItem(id, true);
        if (selected == null || selected.isEmpty()) throw invalid("请勾选需要解除的关联配置");
        Map<Long, List<BindingSelection>> groups = new java.util.TreeMap<>();
        Set<List<String>> unique = new LinkedHashSet<>();
        for (var selection : selected) {
            if (selection == null || selection.bindingId() == null || selection.bindingId().isBlank() || selection.fieldId() == null || selection.fieldId().isBlank()
                    || !unique.add(List.of(Long.toString(selection.versionId()), selection.bindingId(), selection.fieldId())))
                throw invalid("关联配置选择无效或重复，请刷新后重试");
            groups.computeIfAbsent(selection.versionId(), ignored -> new ArrayList<>()).add(selection);
        }
        for (var group : groups.entrySet()) {
            var versions = jdbc.query("SELECT id,COALESCE(lock_version,0) revision,version_label,model_design_json FROM form_template_version WHERE tenant_id='default' AND id=? FOR UPDATE",
                    (rs, n) -> new Version(rs.getLong("id"), rs.getLong("revision"), "", "", rs.getString("version_label"), rs.getString("model_design_json")), group.getKey());
            if (versions.isEmpty()) throw invalid("表单配置已变化，请刷新关联配置后重试");
            Version version = versions.getFirst();
            ObjectNode root = (ObjectNode) parse(version.json());
            JsonNode model = model(root);
            JsonNode bindings = model.path("projection").path("bindings");
            for (var selection : group.getValue()) {
                if (version.revision() != selection.revision()) throw invalid("表单配置已变化，请刷新关联配置后重试");
                List<JsonNode> matches = new ArrayList<>();
                for (JsonNode binding : bindings) if ("formTrace".equals(binding.path("modelId").asText()) && binding.path("sources").has(id)
                        && selection.bindingId().equals(binding.path("id").asText())
                        && selection.fieldId().equals(binding.path("sources").path(id).asText())) matches.add(binding);
                if (matches.size() != 1) throw invalid("表单配置已变化，请刷新关联配置后重试");
                ((ObjectNode) matches.getFirst().path("sources")).remove(id);
            }
            for (int index = bindings.size() - 1; index >= 0; index--) {
                JsonNode binding = bindings.get(index);
                if ("formTrace".equals(binding.path("modelId").asText()) && binding.path("sources").isEmpty()) ((ArrayNode) bindings).remove(index);
            }
            boolean remaining = false;
            for (JsonNode binding : bindings) if (binding.path("sources").has(id)) remaining = true;
            if (!remaining && model.path("projection").path("lookupItems").isObject()) ((ObjectNode) model.path("projection").path("lookupItems")).remove(id);
            String after = root.toString();
            jdbc.update("UPDATE form_template_version SET model_design_json=?,lock_version=COALESCE(lock_version,0)+1,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE tenant_id='default' AND id=?",
                    after, AuditContext.getOperatorName(), version.id());
            audits.save(AuditEvent.builder().id(ids.nextId()).tenantId("default").entityType("FORM_TEMPLATE_VERSION")
                    .entityId(Long.toString(version.id())).action("UPDATE")
                    .contentBefore(mapper.createObjectNode().put("modelDesignJson", version.json()).toString())
                    .contentAfter(mapper.createObjectNode().put("modelDesignJson", after).toString())
                    .operatorId(AuditContext.getOperatorId()).operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                    .source(AuditContext.getSource()).ipAddress(AuditContext.getIpAddress()).moduleName("数据").menuName("表单模板")
                    .functionName("解除追溯关联").dataSummary(item(id).name() + " · " + version.label()).createdAt(LocalDateTime.now()).build());
        }
    }

    private JsonNode parse(String json) {
        try {
            JsonNode result = mapper.readTree(json);
            if (result == null || !result.isObject()) throw invalid("表单配置格式异常，请先在表单设计中修复");
            return result;
        }
        catch (Exception ex) { throw invalid("表单配置格式异常，请先在表单设计中修复"); }
    }
    private static JsonNode model(JsonNode root) { return root.has("payload") ? root.path("payload") : root; }
    private static JsonNode field(JsonNode fields, String id) {
        for (JsonNode field : fields) if (id.equals(field.path("id").asText())) return field;
        return com.fasterxml.jackson.databind.node.MissingNode.getInstance();
    }
    private void lockItem(String id, boolean shared) {
        if (jdbc.queryForList("SELECT id FROM form_lookup_item WHERE tenant_id='default' AND id=? FOR " + (shared ? "SHARE" : "UPDATE"), String.class, id).isEmpty())
            throw invalid("追溯项不存在或已退出目录，请按字段含义重新选择");
    }

    // Capture server-owned definitions; runtime reads this copy, never the current directory.
    public JsonNode withLookupSnapshot(JsonNode model) {
        return withLookupSnapshot(model, false);
    }
    private JsonNode withLookupSnapshot(JsonNode model, boolean lock) {
        Set<String> keys = new LinkedHashSet<>();
        for (JsonNode binding : model.path("projection").path("bindings")) {
            if (!"formTrace".equals(binding.path("modelId").asText())) continue;
            binding.path("sources").fieldNames().forEachRemaining(key -> {
                if (key.startsWith("lookup_") || LEGACY_LOOKUP_IDS.contains(key)) keys.add(key);
            });
        }
        if (keys.isEmpty()) return model;
        // Coordinate a new source binding with deletion until the outer design-save transaction commits.
        if (lock) for (String key : keys.stream().sorted().toList()) lockItem(key, true);
        ObjectNode copy = model.deepCopy();
        ObjectNode definitions = ((ObjectNode) copy.path("projection")).putObject("lookupItems");
        var available = list();
        for (String key : keys) {
            Item item = available.stream().filter(candidate -> candidate.id().equals(key)).findFirst()
                    .orElseThrow(() -> invalid("追溯项不存在或已退出目录，请按字段含义重新选择：" + key));
            definitions.putObject(key).put("name", item.name()).put("type", item.type()).put("revision", item.revision())
                    .set("referenceSources", mapper.valueToTree(FormProjectionInterpreter.referenceSources(key)));
        }
        return copy;
    }

    @Transactional
    public String prepareDesign(String json) {
        if (json == null || !json.contains("\"projection\"")) return json;
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode model = root.has("payload") ? root.path("payload") : root;
            JsonNode prepared = withLookupSnapshot(model, true);
            ObjectNode configured = prepared.deepCopy();
            for (JsonNode binding : configured.path("projection").path("bindings")) {
                ((ObjectNode) binding).put("enabled", true).remove("rowKeyFieldId");
            }
            FormProjectionInterpreter.validate(configured);
            if (root.has("payload")) { ((ObjectNode) root).set("payload", configured); return root.toString(); }
            return configured.toString();
        } catch (com.fasterxml.jackson.core.JsonProcessingException ex) { throw invalid("字段模型格式不正确"); }
    }

    private Item item(String id) {
        return list().stream().filter(item -> item.id().equals(id)).findFirst().orElseThrow(() -> invalid("追溯项不存在"));
    }
    private String name(String value) {
        if (value == null || value.isBlank() || value.trim().length() > 80) throw invalid("请填写追溯项名称，最多80字");
        return value.trim();
    }
    private String description(String value) {
        if (value != null && value.length() > 512) throw invalid("追溯项说明最多512字");
        return value == null ? "" : value.trim();
    }
    private void audit(String id, String action, Item before, Item after) {
        audits.save(AuditEvent.builder().id(ids.nextId()).tenantId("default").entityType("FORM_LOOKUP_ITEM")
                .entityId(id).action(action).contentBefore(before == null ? null : mapper.valueToTree(before).toString())
                .contentAfter(after == null ? null : mapper.valueToTree(after).toString()).operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).ipAddress(AuditContext.getIpAddress())
                .moduleName("系统").menuName("追溯项管理").functionName("CREATE".equals(action) ? "新增追溯项" : "DELETE".equals(action) ? "删除追溯项" : "修改显示信息")
                .dataSummary(after == null ? before.name() : after.name()).createdAt(LocalDateTime.now()).build());
    }
    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
