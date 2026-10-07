package com.zencas.edhr.template.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import java.util.List;
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
    public record WriteRequest(String name, String description, Long revision) {}

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
        try {
            jdbc.update("INSERT INTO form_lookup_item(id,name,description,created_by,updated_by) VALUES (?,?,?,?,?)",
                    id, name, description, AuditContext.getOperatorName(), AuditContext.getOperatorName());
        } catch (DuplicateKeyException ex) { throw invalid("追溯项名称已存在，请使用已有项或填写不同含义的名称"); }
        Item saved = item(id);
        audit(id, "CREATE", null, saved);
        return saved;
    }

    @Transactional
    public Item update(String id, WriteRequest request) {
        Item before = item(id);
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

    // Capture server-owned definitions; runtime reads this copy, never the current directory.
    public JsonNode withLookupSnapshot(JsonNode model) {
        Set<String> keys = new LinkedHashSet<>();
        for (JsonNode binding : model.path("projection").path("bindings")) {
            binding.path("sources").fieldNames().forEachRemaining(key -> {
                if (key.startsWith("lookup_") || LEGACY_LOOKUP_IDS.contains(key)) keys.add(key);
            });
        }
        if (keys.isEmpty()) return model;
        ObjectNode copy = model.deepCopy();
        ObjectNode definitions = ((ObjectNode) copy.path("projection")).putObject("lookupItems");
        var available = list();
        for (String key : keys) {
            Item item = available.stream().filter(candidate -> candidate.id().equals(key)).findFirst()
                    .orElseThrow(() -> invalid("追溯项不存在，请重新选择：" + key));
            definitions.putObject(key).put("name", item.name()).put("type", item.type()).put("revision", item.revision())
                    .set("referenceSources", mapper.valueToTree(FormProjectionInterpreter.referenceSources(key)));
        }
        return copy;
    }

    public String prepareDesign(String json) {
        if (json == null || !json.contains("\"projection\"")) return json;
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode model = root.has("payload") ? root.path("payload") : root;
            JsonNode prepared = withLookupSnapshot(model);
            if (prepared == model) return json;
            if (root.has("payload")) { ((ObjectNode) root).set("payload", prepared); return root.toString(); }
            return prepared.toString();
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
                .contentAfter(mapper.valueToTree(after).toString()).operatorId(AuditContext.getOperatorId())
                .operatorName(AuditContext.getOperatorName()).operatorAccount(AuditContext.getOperatorAccount())
                .source(AuditContext.getSource()).ipAddress(AuditContext.getIpAddress())
                .moduleName("系统").menuName("追溯项管理").functionName("CREATE".equals(action) ? "新增追溯项" : "修改显示信息")
                .dataSummary(after.name()).createdAt(LocalDateTime.now()).build());
    }
    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
