package com.zencas.edhr.ai;

import com.fasterxml.jackson.core.JsonPointer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/** Bounded JSON Pointer edits of a design document; no object identity or metadata paths. */
final class AiDesignPatch {
    private AiDesignPatch() {}
    static JsonNode apply(JsonNode original, JsonNode edits) {
        if (!original.isObject() || !edits.isArray() || edits.isEmpty() || edits.size() > 100) throw invalid();
        JsonNode result = original.deepCopy();
        for (JsonNode edit : edits) {
            String op = edit.path("op").asText(), path = edit.path("path").asText();
            if (!java.util.Set.of("add", "replace", "remove", "test").contains(op)
                    || !path.startsWith("/") || path.length() > 500 || path.matches(".*~([^01]|$).*")) throw invalid();
            JsonPointer pointer;
            try { pointer = JsonPointer.compile(path); } catch (IllegalArgumentException e) { throw invalid(); }
            JsonNode parent = result.at(pointer.head());
            String key = pointer.last().getMatchingProperty();
            if (!parent.isContainerNode() || (!op.equals("remove") && !edit.has("value"))) throw invalid();
            JsonNode value = edit.get("value");
            if (op.equals("test")) {
                if (!result.at(pointer).equals(value)) throw new AiException(409, "PATCH_TEST_FAILED");
            } else if (parent instanceof ObjectNode object) {
                if (!op.equals("add") && !object.has(key)) throw invalid();
                if (op.equals("remove")) object.remove(key); else object.set(key, value.deepCopy());
            } else if (parent instanceof ArrayNode array) {
                int index = key.equals("-") && op.equals("add") ? array.size() : pointer.last().getMatchingIndex();
                if (index < 0 || index > array.size() || (!op.equals("add") && index == array.size())) throw invalid();
                switch (op) {
                    case "add" -> array.insert(index, value.deepCopy());
                    case "replace" -> array.set(index, value.deepCopy());
                    case "remove" -> array.remove(index);
                    default -> throw invalid();
                }
            }
        }
        if (result.toString().length() > 2_000_000) throw invalid();
        return result;
    }
    private static AiException invalid() { return new AiException(400, "INVALID_DESIGN_PATCH"); }
}
