package com.zencas.edhr.recordcontrol.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.production.service.ExecutionAccess;
import com.zencas.edhr.production.service.ProductionExecutionEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.*;

/** Stable field/row identities for a proposed revision; never mutates the effective source. */
@Component
@RequiredArgsConstructor
public class RecordControlDiff {
    private static final String ROW_ID = "__recordRowId";
    private static final String SOURCE_ROW_ID = "__rowId";
    private final ObjectMapper mapper;
    private final ProductionExecutionEngine engine;
    private final ExecutionAccess evidence;

    public record Proposal(JsonNode values, ArrayNode differences) {}

    public JsonNode identifyRows(JsonNode values, JsonNode snapshot, String revisionId) {
        if (!(values instanceof ObjectNode)) throw invalid("表单值格式不正确");
        ObjectNode result = ((ObjectNode) values).deepCopy();
        for (JsonNode field : snapshot.path("fields")) {
            if (!"subTable".equals(field.path("type").asText())) continue;
            String fieldId = field.path("id").asText();
            JsonNode value = result.path(fieldId);
            if (!value.isArray()) continue;
            ArrayNode rows = mapper.createArrayNode();
            for (int index = 0; index < value.size(); index++) {
                if (!(value.get(index) instanceof ObjectNode oldRow)) throw invalid("子表行格式不正确");
                ObjectNode row = oldRow.deepCopy();
                if (!row.hasNonNull(ROW_ID)) row.put(ROW_ID, UUID.nameUUIDFromBytes(
                        (revisionId + ":" + fieldId + ":" + index).getBytes(StandardCharsets.UTF_8)).toString());
                rows.add(row);
            }
            result.set(fieldId, rows);
        }
        return result;
    }

    public Proposal prepare(JsonNode snapshot, JsonNode source, JsonNode incoming, String objectId) {
        if (!(incoming instanceof ObjectNode) || !(source instanceof ObjectNode)) throw invalid("拟变更数据格式不正确");
        ObjectNode proposed = ((ObjectNode) source).deepCopy();
        ObjectNode validationForm = ((ObjectNode) snapshot).deepCopy();
        clearSignatureRequirements(validationForm.path("fields"));
        ArrayNode differences = mapper.createArrayNode();
        Set<String> known = new HashSet<>();
        for (JsonNode field : snapshot.path("fields")) {
            String fieldId = field.path("id").asText(); known.add(fieldId);
            JsonNode old = source.path(fieldId), next = incoming.path(fieldId);
            boolean signature = "signature".equals(field.path("type").asText());
            boolean immutable = signature || field.path("readOnly").asBoolean()
                    || "disabled".equals(field.path("status").asText()) || "formula".equals(field.path("type").asText());
            if (immutable) {
                if (!next.isMissingNode() && !Objects.equals(next, old))
                    throw invalid("字段「" + field.path("name").asText(fieldId) + "」不可修改");
                if (signature) {
                    // A Rev.1 business signature is historical evidence, not a signature on Rev.2.
                    proposed.remove(fieldId);
                }
                continue;
            }
            if (next.isMissingNode()) {
                if ("subTable".equals(field.path("type").asText()) && old.isArray())
                    proposed.set(fieldId, normalizeSubtable(field, old, old));
                continue;
            }
            JsonNode value = "subTable".equals(field.path("type").asText())
                    ? normalizeSubtable(field, old, next) : next.deepCopy();
            evidence.validateEvidence(field, stripRowIds(value), objectId);
            if (!equivalent(field, old, value)) addDifferences(differences, field, old, value);
            proposed.set(fieldId, value);
        }
        for (Iterator<String> keys = incoming.fieldNames(); keys.hasNext();) if (!known.contains(keys.next()))
            throw invalid("拟变更数据包含未知字段");
        List<String> issues = engine.validateValues(validationForm, stripRowIds(proposed));
        if (!issues.isEmpty()) throw invalid(String.join("；", issues));
        return new Proposal(proposed, differences);
    }

    private JsonNode normalizeSubtable(JsonNode field, JsonNode old, JsonNode next) {
        if (!next.isArray()) throw invalid("子表字段必须为数组");
        Map<String, JsonNode> oldRows = new HashMap<>();
        for (JsonNode row : old) oldRows.put(row.path(ROW_ID).asText(), row);
        Map<String, String> existingSourceIds = new HashMap<>();
        for (JsonNode row : old) if (row.hasNonNull(SOURCE_ROW_ID))
            existingSourceIds.put(row.path(SOURCE_ROW_ID).asText(), row.path(ROW_ID).asText());
        Set<String> seen = new HashSet<>();
        Set<String> sourceRowIds = new HashSet<>();
        Set<String> columns = new HashSet<>();
        for (JsonNode column : field.path("typeConfig").path("columns")) columns.add(column.path("id").asText());
        ArrayNode rows = mapper.createArrayNode();
        for (JsonNode item : next) {
            if (!(item instanceof ObjectNode)) throw invalid("子表行格式不正确");
            ObjectNode row = ((ObjectNode) item).deepCopy();
            String rowId = row.path(ROW_ID).asText();
            String existingId = existingSourceIds.get(row.path(SOURCE_ROW_ID).asText());
            if (existingId != null) {
                if (!rowId.isBlank() && !existingId.equals(rowId)) throw invalid("已有子表来源行标识不可修改");
                rowId = existingId;
            }
            if (rowId.isBlank()) rowId = UUID.randomUUID().toString();
            else if (!oldRows.containsKey(rowId)) {
                try { UUID.fromString(rowId); } catch (IllegalArgumentException ex) { throw invalid("子表新行标识格式不正确"); }
            }
            if (!seen.add(rowId)) throw invalid("子表行标识重复");
            row.put(ROW_ID, rowId);
            for (Iterator<String> keys = row.fieldNames(); keys.hasNext();) {
                String key = keys.next();
                if (!ROW_ID.equals(key) && !SOURCE_ROW_ID.equals(key) && !columns.contains(key)) throw invalid("子表包含未知字段");
            }
            JsonNode previous = oldRows.get(rowId);
            if (previous != null) {
                if (row.has(SOURCE_ROW_ID) && !Objects.equals(row.get(SOURCE_ROW_ID), previous.get(SOURCE_ROW_ID)))
                    throw invalid("已有子表来源行标识不可修改");
                if (previous.hasNonNull(SOURCE_ROW_ID)) row.set(SOURCE_ROW_ID, previous.get(SOURCE_ROW_ID).deepCopy());
            }
            if (row.has(SOURCE_ROW_ID) && (!row.path(SOURCE_ROW_ID).isTextual()
                    || row.path(SOURCE_ROW_ID).asText().isBlank() || !sourceRowIds.add(row.path(SOURCE_ROW_ID).asText())))
                throw invalid("子表来源行标识无效或重复");
            for (JsonNode column : field.path("typeConfig").path("columns")) {
                String key = column.path("id").asText();
                boolean locked = column.path("readOnly").asBoolean()
                        || "signature".equals(column.path("type").asText())
                        || "disabled".equals(column.path("status").asText());
                if (locked && previous == null && row.hasNonNull(key))
                    throw invalid("子表字段「" + column.path("name").asText(key) + "」不可修改");
                if (locked && previous != null && row.has(key) && !Objects.equals(row.path(key), previous.path(key)))
                    throw invalid("子表字段「" + column.path("name").asText(key) + "」不可修改");
                if ("signature".equals(column.path("type").asText())) row.remove(key);
                else if (locked && previous != null && !row.has(key) && previous.has(key)) row.set(key, previous.get(key).deepCopy());
            }
            rows.add(row);
        }
        return rows;
    }

    private boolean equivalent(JsonNode field, JsonNode old, JsonNode next) {
        if (Set.of("attachment", "image").contains(field.path("type").asText()) && old.isArray() && next.isArray())
            return files(old).equals(files(next));
        if ("subTable".equals(field.path("type").asText()) && old.isArray() && next.isArray()) {
            Map<String, JsonNode> before = new HashMap<>(), after = new HashMap<>();
            Set<String> signatures = new HashSet<>();
            for (JsonNode column : field.path("typeConfig").path("columns"))
                if ("signature".equals(column.path("type").asText())) signatures.add(column.path("id").asText());
            for (JsonNode row : old) before.put(row.path(ROW_ID).asText(), without(row, signatures));
            for (JsonNode row : next) after.put(row.path(ROW_ID).asText(), without(row, signatures));
            return before.equals(after);
        }
        return Objects.equals(old, next);
    }

    private void addDifferences(ArrayNode differences, JsonNode field, JsonNode old, JsonNode next) {
        String fieldId = field.path("id").asText();
        String type = field.path("type").asText();
        if ("subTable".equals(type) && old.isArray() && next.isArray()) {
            Map<String, JsonNode> before = rowsById(old), after = rowsById(next);
            Set<String> ids = new LinkedHashSet<>(before.keySet()); ids.addAll(after.keySet());
            Set<String> signatures = new HashSet<>();
            for (JsonNode column : field.path("typeConfig").path("columns"))
                if ("signature".equals(column.path("type").asText())) signatures.add(column.path("id").asText());
            for (String rowId : ids) {
                JsonNode prior = before.get(rowId), current = after.get(rowId);
                if (prior == null || current == null) {
                    addDifference(differences, fieldId, type, fieldId + "/" + rowId,
                            prior == null ? "ROW_ADDED" : "ROW_REMOVED",
                            prior == null ? null : without(prior, signatures),
                            current == null ? null : without(current, signatures));
                    continue;
                }
                for (JsonNode column : field.path("typeConfig").path("columns")) {
                    String columnId = column.path("id").asText();
                    if (signatures.contains(columnId)) continue;
                    JsonNode left = prior.path(columnId), right = current.path(columnId);
                    if (!equivalent(column, left, right))
                        addDifference(differences, fieldId, type, fieldId + "/" + rowId + "/" + columnId,
                                "FIELD_CHANGED", left.isMissingNode() ? null : left, right.isMissingNode() ? null : right);
                }
            }
            return;
        }
        if (Set.of("attachment", "image").contains(type) && old.isArray() && next.isArray()) {
            Map<String, JsonNode> before = files(old), after = files(next);
            Set<String> ids = new LinkedHashSet<>(before.keySet()); ids.addAll(after.keySet());
            for (String fileId : ids) if (!Objects.equals(before.get(fileId), after.get(fileId)))
                addDifference(differences, fieldId, type, fieldId + "/" + fileId,
                        before.containsKey(fileId) ? after.containsKey(fileId) ? "FILE_CHANGED" : "FILE_REMOVED" : "FILE_ADDED",
                        before.get(fileId), after.get(fileId));
            return;
        }
        addDifference(differences, fieldId, type, fieldId, "FIELD_CHANGED", old, next);
    }

    private Map<String, JsonNode> rowsById(JsonNode values) {
        Map<String, JsonNode> result = new LinkedHashMap<>();
        for (JsonNode row : values) result.put(row.path(ROW_ID).asText(), row);
        return result;
    }

    private void addDifference(ArrayNode differences, String fieldId, String type, String path,
                               String changeType, JsonNode before, JsonNode after) {
        ObjectNode difference = differences.addObject().put("fieldId", fieldId).put("fieldType", type)
                .put("fieldPath", path).put("changeType", changeType);
        if (before == null || before.isMissingNode()) difference.putNull("before");
        else difference.set("before", before.deepCopy());
        if (after == null || after.isMissingNode()) difference.putNull("after");
        else difference.set("after", after.deepCopy());
    }

    private Map<String, JsonNode> files(JsonNode list) {
        Map<String, JsonNode> result = new HashMap<>();
        for (JsonNode file : list) result.put(file.path("fileId").asText(), file);
        return result;
    }

    private JsonNode without(JsonNode row, Set<String> keys) {
        ObjectNode result = ((ObjectNode) row).deepCopy();
        keys.forEach(result::remove);
        return result;
    }

    private void clearSignatureRequirements(JsonNode fields) {
        for (JsonNode field : fields) {
            if ("signature".equals(field.path("type").asText())) {
                ((ObjectNode) field).put("required", false);
                ((ObjectNode) field).withObject("/typeConfig").put("required", false);
            }
            clearSignatureRequirements(field.path("typeConfig").path("columns"));
        }
    }

    public JsonNode stripRowIds(JsonNode value) {
        if (value.isArray()) {
            ArrayNode result = mapper.createArrayNode(); for (JsonNode item : value) result.add(stripRowIds(item)); return result;
        }
        if (value.isObject()) {
            ObjectNode result = mapper.createObjectNode();
            value.fields().forEachRemaining(item -> { if (!ROW_ID.equals(item.getKey())) result.set(item.getKey(), stripRowIds(item.getValue())); });
            return result;
        }
        return value.deepCopy();
    }

    private static BusinessException invalid(String message) { return new BusinessException(ErrorCode.GENERAL_001, message); }
}
