package com.zencas.edhr.production.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.audit.AuditContext;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.entity.Signature;
import com.zencas.edhr.compliance.repository.SignatureRepository;
import com.zencas.edhr.identity.dto.SubjectReference;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.SubjectResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;

import static com.zencas.edhr.production.service.ExecutionSnapshotBuilder.invalid;

@Component
@RequiredArgsConstructor
public class ExecutionAccess {
    private final SubjectResolver subjects;
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final SignatureRepository signatures;
    private final SnowflakeIdGenerator ids;
    private final ObjectMapper mapper;
    private final JdbcTemplate jdbc;

    public List<Map<String, String>> references(JsonNode field, String keyword) {
        String source = field.path("typeConfig").path("sourceType").asText();
        String name = "user".equals(source) ? "display_name" : "name";
        String query = "%" + (keyword == null ? "" : keyword.toLowerCase(Locale.ROOT)) + "%";
        return jdbc.query(referenceSource(field) + " AND (LOWER(" + name + ") LIKE ? OR CAST(id AS VARCHAR) LIKE ?) ORDER BY id LIMIT 100",
                (rs, i) -> Map.of("id", rs.getString("id"), "name", rs.getString("name")), query, query);
    }

    private String referenceSource(JsonNode field) {
        return switch (field.path("typeConfig").path("sourceType").asText()) {
            case "user" -> "SELECT id, display_name AS name FROM user_account WHERE status='ACTIVE'";
            case "department" -> "SELECT id, name FROM department WHERE 1=1";
            case "equipment" -> "SELECT id, name FROM equipment WHERE status='ACTIVE'";
            case "material" -> "SELECT id, name FROM material WHERE status='ACTIVE'";
            case "product" -> "SELECT id, name FROM product WHERE status='ACTIVE'";
            default -> throw invalid("引用字段「" + field.path("name").asText() + "」尚未配置可用的数据来源");
        };
    }

    public void validateEvidence(JsonNode field, JsonNode value, String objectId) {
        if (value.isNull() || value.isMissingNode() || (value.isTextual() && value.asText().isBlank())) return;
        String type = field.path("type").asText();
        if ("subTable".equals(type) && value.isArray()) {
            for (JsonNode row : value) for (JsonNode column : field.path("typeConfig").path("columns"))
                validateEvidence(column, row.path(column.path("id").asText()), objectId);
        }
        if ("reference".equals(type)) {
            if (!value.isObject() || !value.hasNonNull("id")) throw invalid("引用字段必须从配置来源中选择");
            long referenceId;
            try { referenceId = Long.parseLong(value.path("id").asText()); } catch (NumberFormatException e) { throw invalid("引用记录标识不正确"); }
            boolean found = jdbc.query(referenceSource(field) + " AND id=?", (rs, i) -> rs.getString("name"), referenceId).stream().anyMatch(name -> name.equals(value.path("name").asText()));
            if (!found) throw invalid("引用记录已失效，请重新选择");
        }
        if (Set.of("attachment", "image").contains(type)) {
            if (!value.isArray()) throw invalid("附件字段必须使用上传文件记录");
            for (JsonNode file : value) {
                long fileId;
                try { fileId = Long.parseLong(file.path("fileId").asText()); } catch (NumberFormatException e) { throw invalid("文件标识不正确"); }
                List<String> names = jdbc.query("SELECT original_name FROM file_object WHERE id=? AND target_type='PRODUCTION_EXECUTION' AND target_id=?", (rs, i) -> rs.getString(1), fileId, objectId);
                if (names.isEmpty() || !names.get(0).equals(file.path("originalName").asText())) throw invalid("文件不属于当前生产对象或已不存在");
            }
        }
    }

    public Set<String> resolve(JsonNode configured) {
        if (!configured.isArray() || configured.isEmpty()) return Set.of();
        List<SubjectReference> refs = new ArrayList<>();
        for (JsonNode item : configured) {
            try { refs.add(new SubjectReference(SubjectReference.SubjectType.valueOf(item.path("type").asText()), Long.valueOf(item.path("id").asText()),
                    "SELF_ONLY".equals(item.path("departmentScope").asText()) ? SubjectReference.DepartmentScope.SELF_ONLY : SubjectReference.DepartmentScope.SELF_AND_CHILDREN)); }
            catch (Exception e) { throw invalid("表单主体配置无法解析"); }
        }
        Set<String> result = new LinkedHashSet<>();
        subjects.resolve(0L, refs).users().forEach(user -> result.add(user.userId().toString()));
        return result;
    }

    public void captureApprovers(JsonNode node, ObjectNode formState) {
        if (!"APPROVAL".equals(node.path("data").path("kind").asText())) return;
        JsonNode configured = configuredSubjects(node.path("data").path("config"), "approverSubjects", "approvers");
        ObjectNode approvals = formState.withObject("/approvers");
        if (approvals.has(node.path("id").asText())) return;
        approvals.set(node.path("id").asText(), mapper.valueToTree(resolve(configured)));
        formState.withObject("/restrictedApprovers").put(node.path("id").asText(), configured.isArray() && !configured.isEmpty());
    }

    public boolean canAct(JsonNode form, JsonNode node, JsonNode state, String operator) {
        if (operator == null || operator.isBlank()) return false;
        if ("APPROVAL".equals(node.path("data").path("kind").asText())) {
            if (!state.path("restrictedApprovers").path(node.path("id").asText()).asBoolean()) return true;
            for (JsonNode id : state.path("approvers").path(node.path("id").asText())) if (operator.equals(id.asText())) return true;
            return false;
        }
        JsonNode groups = node.path("data").path("config").path("permissionGroupRules");
        if ((!groups.isArray() || groups.isEmpty()) && !node.path("data").path("config").path("permissionGroups").isEmpty()
                && node.path("data").path("config").has("permissionGroups")) throw invalid("旧版填报主体配置需要明确转换后才能执行");
        if (!groups.isArray() || groups.isEmpty()) return true;
        for (JsonNode group : groups) if (resolve(configuredSubjects(group, "subjects", "group")).contains(operator)) return true;
        return false;
    }

    public ObjectNode permissions(JsonNode form, JsonNode node, JsonNode state, String operator) {
        ObjectNode result = mapper.createObjectNode();
        boolean allowed = canAct(form, node, state, operator);
        JsonNode config = node.path("data").path("config");
        JsonNode groups = config.path("permissionGroupRules");
        List<JsonNode> matched = new ArrayList<>();
        if ("START".equals(node.path("data").path("kind").asText())) {
            for (JsonNode group : groups) if (resolve(configuredSubjects(group, "subjects", "group")).contains(operator)) matched.add(group);
        }
        for (JsonNode field : form.path("fields")) {
            String id = field.path("id").asText();
            boolean edit = allowed && !"signature".equals(field.path("type").asText()) && !field.path("readOnly").asBoolean();
            if (!matched.isEmpty()) {
                for (JsonNode group : matched) {
                    String key = "start:" + group.path("id").asText();
                    JsonNode override = form.path("binding").path("fieldPermissions").path(key);
                    edit &= editable(group, override, id);
                }
            } else {
                String key = "APPROVAL".equals(node.path("data").path("kind").asText()) ? "approval:" + node.path("id").asText() : "start:open";
                edit &= editable(config, form.path("binding").path("fieldPermissions").path(key), id);
            }
            result.put(id, edit ? "EDIT" : "READ_ONLY");
        }
        return result;
    }

    private boolean editable(JsonNode config, JsonNode override, String id) {
        boolean edit = !"READ_ONLY".equals(override.path("defaultPermission").asText(config.path("defaultPermission").asText("EDIT")));
        for (JsonNode field : override.path("editableFieldIds")) if (id.equals(field.asText())) edit = true;
        for (JsonNode field : override.path("readOnlyFieldIds")) if (id.equals(field.asText())) edit = false;
        return edit;
    }

    private JsonNode configuredSubjects(JsonNode config, String field, String legacy) {
        if (config.path(field).isArray()) return config.path(field);
        String value = config.path(legacy).asText("");
        if (value.isBlank()) return mapper.createArrayNode();
        try { JsonNode parsed = mapper.readTree(value); if (parsed.isArray()) return parsed; }
        catch (Exception ignored) { }
        throw invalid("旧版主体配置无法可靠解析，请先在表单流程中更新主体配置");
    }

    public String sign(String objectId, String formId, String action, JsonNode values, String account, String password) {
        String operator = AuditContext.getOperatorId();
        if (operator == null) throw invalid("请重新登录后签署");
        var user = users.findById(Long.valueOf(operator)).orElseThrow(() -> invalid("签署用户不存在"));
        if (!Objects.equals(account, user.getUsername()) || !"ACTIVE".equals(user.getStatus())
                || (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now()))
                || password == null || !passwords.matches(password, user.getPasswordHash())) {
            throw invalid("签署账户或密码不正确，或账户不可用");
        }
        ObjectNode evidence = mapper.createObjectNode().put("objectId", objectId).put("formId", formId).put("action", action);
        evidence.set("values", values.deepCopy());
        try {
            String payload = mapper.writeValueAsString(evidence);
            String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload.getBytes(StandardCharsets.UTF_8)));
            long id = ids.nextId();
            signatures.save(Signature.builder().id(id).targetType("PRODUCTION_EXECUTION").targetId(objectId)
                    .meaning(action + " · " + formId).signerId(operator).signerName(user.getDisplayName())
                    .authMethod("PASSWORD").snapshotHash(hash).snapshotData(payload).signedAt(LocalDateTime.now()).build());
            return String.valueOf(id);
        } catch (Exception e) { throw invalid("签署记录保存失败"); }
    }
}
