package com.zencas.edhr.compliance.entity;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.StreamReadConstraints;
import com.fasterxml.jackson.core.StreamWriteConstraints;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.OutputStream;
import java.security.DigestOutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;

/** Versioned encoding of persisted event values, independent of JSONB text formatting. */
final class AuditEventHash {
    static final String VERSION = "audit-event-v2";
    // This local parser must not impose Jackson's smaller default limits on existing JSONB inputs.
    private static final JsonFactory JSON = JsonFactory.builder()
            .streamReadConstraints(StreamReadConstraints.builder().maxNumberLength(Integer.MAX_VALUE)
                    .maxStringLength(Integer.MAX_VALUE).maxNameLength(Integer.MAX_VALUE).maxNestingDepth(Integer.MAX_VALUE).build())
            .streamWriteConstraints(StreamWriteConstraints.builder().maxNestingDepth(Integer.MAX_VALUE).build()).build();
    private static final ObjectMapper MAPPER = new ObjectMapper(JSON)
            .enable(DeserializationFeature.USE_BIG_INTEGER_FOR_INTS, DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS,
                    DeserializationFeature.FAIL_ON_TRAILING_TOKENS);
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss.SSSSSS");

    private AuditEventHash() {}

    static String compute(AuditEvent event) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            try (var output = JSON.createGenerator(new DigestOutputStream(OutputStream.nullOutputStream(), digest))) {
                // Domain + the original eighteen fields, fixed order. JSON framing distinguishes text/null.
                output.writeStartArray(); output.writeString(VERSION);
                text(output, event.getId() == null ? null : event.getId().toString());
                text(output, event.getTenantId()); text(output, event.getEntityType()); text(output, event.getEntityId()); text(output, event.getAction());
                json(output, event.getContentBefore()); json(output, event.getContentAfter());
                text(output, event.getOperatorId()); text(output, event.getOperatorName()); text(output, event.getOperatorAccount());
                text(output, event.getSource()); text(output, event.getModuleName()); text(output, event.getMenuName()); text(output, event.getFunctionName());
                text(output, event.getDataSummary()); text(output, event.getReason()); text(output, event.getIpAddress());
                text(output, event.getCreatedAt() == null ? null : TIME.format(event.getCreatedAt()));
                output.writeEndArray();
            }
            return HexFormat.of().formatHex(digest.digest());
        } catch (IOException | NoSuchAlgorithmException failure) {
            throw new IllegalStateException("Unable to compute audit event hash", failure);
        }
    }

    private static void text(JsonGenerator output, String value) throws IOException {
        if (value == null) output.writeNull(); else output.writeString(value);
    }

    private static void json(JsonGenerator output, String value) throws IOException {
        if (value == null) { output.writeNull(); return; }
        // SQL null is null; a present JSON value is [value], including [null] for JSON null.
        output.writeStartArray(); writeJson(output, MAPPER.readTree(value)); output.writeEndArray();
    }

    private static void writeJson(JsonGenerator output, JsonNode current) throws IOException {
        var parents = new ArrayDeque<Frame>();
        while (true) {
            if (current.isObject() || current.isArray()) {
                if (current.isObject()) output.writeStartObject(); else output.writeStartArray();
                parents.push(new Frame(current));
            } else if (current.isNull()) output.writeNull();
            else if (current.isTextual()) output.writeString(current.textValue());
            else if (current.isBoolean()) output.writeBoolean(current.booleanValue());
            else if (current.isNumber()) output.writeNumber(current.decimalValue().stripTrailingZeros().toString());
            else throw new IllegalArgumentException("Expected a JSON value for audit content");

            while (!parents.isEmpty() && !parents.peek().hasNext()) {
                if (parents.pop().node.isObject()) output.writeEndObject(); else output.writeEndArray();
            }
            if (parents.isEmpty()) return;
            current = parents.peek().next(output);
        }
    }

    /** Explicit stack avoids a Java recursion limit on JSONB documents deeper than Jackson defaults. */
    private static final class Frame {
        final JsonNode node;
        final List<String> keys;
        int index;

        Frame(JsonNode node) {
            this.node = node;
            keys = new ArrayList<>();
            if (node.isObject()) { node.fieldNames().forEachRemaining(keys::add); keys.sort(Comparator.naturalOrder()); }
        }
        boolean hasNext() { return index < node.size(); }
        JsonNode next(JsonGenerator output) throws IOException {
            if (!node.isObject()) return node.get(index++);
            String key = keys.get(index++); output.writeFieldName(key); return node.get(key);
        }
    }
}
