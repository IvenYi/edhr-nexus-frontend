package com.zencas.edhr.knowledge;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

record BusinessKnowledgeModel(Path repositoryRoot, Map<Path, Map<String, Object>> documents) {

    private static final Path SCHEMA_PATH = Path.of("docs", "knowledge", "schema.yaml");

    BusinessKnowledgeModel {
        repositoryRoot = repositoryRoot.toAbsolutePath().normalize();
        documents = new LinkedHashMap<>(documents);
    }

    Map<String, Object> schema() {
        Map<String, Object> schema = documents.get(SCHEMA_PATH);
        if (schema == null) {
            throw invalid("docs/knowledge/schema.yaml", "document", "is missing");
        }
        return schema;
    }

    BusinessKnowledgeModel deepCopy() {
        Map<Path, Map<String, Object>> copiedDocuments = new LinkedHashMap<>();
        documents.forEach((path, document) -> copiedDocuments.put(path, deepCopyMap(document)));
        return new BusinessKnowledgeModel(repositoryRoot, copiedDocuments);
    }

    BusinessKnowledgeModel withRepositoryRoot(Path root) {
        return new BusinessKnowledgeModel(root, documents);
    }

    private static Map<String, Object> deepCopyMap(Map<String, Object> source) {
        Map<String, Object> copy = new LinkedHashMap<>();
        source.forEach((key, value) -> copy.put(key, deepCopyValue(value)));
        return copy;
    }

    private static Object deepCopyValue(Object value) {
        if (value instanceof Map<?, ?> map) {
            return deepCopyMap(stringKeyedMap(map, "deep-copy", "value"));
        }
        if (value instanceof List<?> list) {
            List<Object> copy = new ArrayList<>(list.size());
            list.forEach(item -> copy.add(deepCopyValue(item)));
            return copy;
        }
        return value;
    }

    @SuppressWarnings("unchecked")
    static Map<String, Object> stringKeyedMap(Map<?, ?> rawMap, String recordId, String field) {
        if (rawMap.keySet().stream().anyMatch(key -> !(key instanceof String))) {
            throw invalid(recordId, field, "map keys must be strings");
        }
        return (Map<String, Object>) rawMap;
    }

    static KnowledgeValidationException invalid(String recordId, String field, String reason) {
        return new KnowledgeValidationException("Record " + recordId + " field '" + field + "': " + reason);
    }
}
