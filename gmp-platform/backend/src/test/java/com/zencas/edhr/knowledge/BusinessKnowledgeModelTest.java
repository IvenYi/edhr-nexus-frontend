package com.zencas.edhr.knowledge;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BusinessKnowledgeModelTest {

    private static final Map<String, String> TOP_LEVEL_COLLECTIONS = Map.of(
            "terms", "term",
            "concepts", "concept",
            "relations", "relation",
            "rules", "rule",
            "decisions", "decision",
            "evidence", "evidence",
            "questions", "openQuestion"
    );

    private static final List<NestedCollection> NESTED_COLLECTIONS = List.of(
            new NestedCollection("decisionStatements", "decisionStatement"),
            new NestedCollection("acceptanceScenarios", "acceptanceScenario"),
            new NestedCollection("implementationDiscrepancies", "implementationDiscrepancy")
    );

    @Test
    void repositoryRootCanBeLocatedFromRootBackendAndIdeWorkingDirectories() {
        Path root = findRepositoryRoot(Path.of(System.getProperty("user.dir")));

        assertThat(findRepositoryRoot(root)).isEqualTo(root);
        assertThat(findRepositoryRoot(root.resolve("gmp-platform/backend"))).isEqualTo(root);
        assertThat(findRepositoryRoot(root.resolve("gmp-platform/backend/src/test/java"))).isEqualTo(root);
    }

    @Test
    void currentKnowledgeModelIsValid() throws Exception {
        var knowledgeModel = loadKnowledgeModel();

        assertThatCode(() -> validateKnowledgeModel(knowledgeModel)).doesNotThrowAnyException();
    }

    @Test
    void duplicateIdsAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        List<Map<String, Object>> concepts = records(model).get("concept");
        String duplicateId = idOf(concepts.getFirst());
        concepts.get(1).put("id", duplicateId);

        assertValidationFails(model, duplicateId, "id", "duplicate");
    }

    @Test
    void danglingTermIdsAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> concept = firstRecord(model, "concept");
        concept.put("termId", "term.does-not-exist");

        assertValidationFails(model, idOf(concept), "termId", "does not resolve");
    }

    @Test
    void danglingEvidenceIdsAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("evidenceIds", List.of("evidence.does-not-exist"));

        assertValidationFails(model, idOf(rule), "evidenceIds", "does not resolve");
    }

    @Test
    void invalidStatusesAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "released");

        assertValidationFails(model, idOf(rule), "status", "must be one of");
    }

    @Test
    void invalidCardinalitiesAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> relation = firstRecord(model, "relation");
        relation.put("cardinality", "one-to-one");

        assertValidationFails(model, idOf(relation), "cardinality", "must be one of");
    }

    @Test
    void invalidConditionOperatorsAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        firstConditionClause(mapValue(rule, "condition", idOf(rule))).put("operator", "matches");

        assertValidationFails(model, idOf(rule), "operator", "must be one of");
    }

    @Test
    void invalidRuleResultTypesAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        mapValue(rule, "result", idOf(rule)).put("type", "unknown-result");

        assertValidationFails(model, idOf(rule), "result.type", "must be one of");
    }

    @Test
    void implementedRecordsCannotEnterCustomerProjection() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "implemented");
        rule.put("visibility", "customer");

        assertValidationFails(model, idOf(rule), "visibility", "requires internal");
    }

    @Test
    void verifiedInternalRecordsRequireExecutionContracts() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "verified");
        rule.put("visibility", "internal");
        rule.remove("executionContractId");

        assertValidationFails(model, idOf(rule), "executionContractId", "required");
    }

    @Test
    void verifiedRuntimeRecordsRequireEvidence() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "verified");
        rule.put("visibility", "runtime");
        rule.put("executionContractId", "execution.test");
        rule.put("evidenceIds", List.of());

        assertValidationFails(model, idOf(rule), "evidenceIds", "non-empty");
    }

    @Test
    void missingEvidencePathsAreRejected() throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> evidence = firstRecord(model, "evidence");
        evidence.put("path", "does/not/exist.java");

        assertValidationFails(model, idOf(evidence), "path", "does not exist");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidNestedRecords")
    void nestedRecordsUseSchemaRequiredFieldsEnumsAndBasicTypes(
            String description,
            String recordType,
            String field,
            Object invalidValue,
            boolean removeField,
            String reason
    ) throws Exception {
        KnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> record = firstRecord(model, recordType);
        if (removeField) {
            record.remove(field);
        } else {
            record.put(field, invalidValue);
        }

        assertValidationFails(model, idOf(record), field, reason);
    }

    private static Stream<Arguments> invalidNestedRecords() {
        return Stream.of(
                Arguments.of("invalid discrepancy severity", "implementationDiscrepancy", "severity", "urgent", false, "must be one of"),
                Arguments.of("invalid decision statement status", "decisionStatement", "status", "released", false, "must be one of"),
                Arguments.of("invalid decision statement visibility", "decisionStatement", "visibility", "public", false, "must be one of"),
                Arguments.of("missing acceptance scenario field", "acceptanceScenario", "then", null, true, "required"),
                Arguments.of("non-integer discrepancy line hint", "implementationDiscrepancy", "lineHint", "166", false, "integer"),
                Arguments.of("non-string nested evidence id", "acceptanceScenario", "evidenceIds", List.of(123), false, "array of strings")
        );
    }

    private static KnowledgeModel loadKnowledgeModel() throws IOException {
        Path repositoryRoot = findRepositoryRoot(Path.of(System.getProperty("user.dir")));
        Path knowledgeRoot = repositoryRoot.resolve("docs/knowledge");
        Map<Path, Map<String, Object>> documents = new LinkedHashMap<>();

        LoaderOptions loaderOptions = new LoaderOptions();
        loaderOptions.setAllowDuplicateKeys(false);
        Yaml yaml = new Yaml(new SafeConstructor(loaderOptions));
        try (Stream<Path> paths = Files.walk(knowledgeRoot)) {
            for (Path path : paths.filter(Files::isRegularFile)
                    .filter(candidate -> candidate.getFileName().toString().endsWith(".yaml"))
                    .sorted()
                    .toList()) {
                Object loaded;
                try (Reader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
                    loaded = yaml.load(reader);
                }
                String documentId = repositoryRoot.relativize(path).toString();
                if (!(loaded instanceof Map<?, ?> loadedMap) || loadedMap.isEmpty()) {
                    throw invalid(documentId, "document", "must be a non-empty map");
                }
                documents.put(path.normalize(), stringKeyedMap(loadedMap, documentId, "document"));
            }
        }
        if (documents.isEmpty()) {
            throw invalid("docs/knowledge", "documents", "no YAML documents found");
        }
        return new KnowledgeModel(repositoryRoot, documents);
    }

    private static Path findRepositoryRoot(Path start) {
        Path current = start.toAbsolutePath().normalize();
        if (!Files.isDirectory(current)) {
            current = current.getParent();
        }
        while (current != null) {
            if (Files.isDirectory(current.resolve("docs/knowledge"))
                    && Files.isDirectory(current.resolve("gmp-platform"))) {
                return current;
            }
            current = current.getParent();
        }
        throw invalid(start.toString(), "user.dir", "cannot locate repository root containing docs/knowledge and gmp-platform");
    }

    private static void validateKnowledgeModel(KnowledgeModel model) {
        Map<String, Object> schema = model.schema();
        Object schemaVersion = schema.get("schemaVersion");
        if (!(schemaVersion instanceof String version) || version.isBlank()) {
            throw invalid("schema.yaml", "schemaVersion", "must exist and be a non-empty string");
        }
        Object knowledgeModelVersion = schema.get("knowledgeModelVersion");
        if (!(knowledgeModelVersion instanceof String expectedVersion) || expectedVersion.isBlank()) {
            throw invalid("schema.yaml", "knowledgeModelVersion", "must exist and be a non-empty string");
        }
        for (Map.Entry<Path, Map<String, Object>> document : model.documents().entrySet()) {
            String documentId = model.repositoryRoot().relativize(document.getKey()).toString();
            Object actualVersion = document.getValue().get("knowledgeModelVersion");
            if (!expectedVersion.equals(actualVersion)) {
                throw invalid(documentId, "knowledgeModelVersion",
                        "must equal schema.yaml value " + expectedVersion + " but was " + actualVersion);
            }
        }

        Map<String, List<Map<String, Object>>> records = records(model);
        validateRecordsAgainstSchema(schema, records);
        validateUniqueIds(records);
        validateReferences(records);
        validateEvidencePaths(model.repositoryRoot(), records.getOrDefault("evidence", List.of()));
        validateRules(schema, records.getOrDefault("rule", List.of()));
        validateProjectionInvariants(schema, records);
    }

    private static void validateRecordsAgainstSchema(
            Map<String, Object> schema,
            Map<String, List<Map<String, Object>>> records
    ) {
        Map<String, Object> recordTypes = mapValue(schema, "recordTypes", "schema.yaml");
        for (Map.Entry<String, List<Map<String, Object>>> entry : records.entrySet()) {
            if (entry.getValue().isEmpty()) {
                continue;
            }
            Map<String, Object> definition = mapValue(recordTypes, entry.getKey(), "schema.yaml");
            List<String> requiredFields = stringList(definition.get("requiredFields"), "schema.yaml",
                    "recordTypes." + entry.getKey() + ".requiredFields");
            Map<String, Object> fieldTypes = mapValue(definition, "fieldTypes", "schema.yaml");
            for (Map<String, Object> record : entry.getValue()) {
                String id = String.valueOf(record.getOrDefault("id", "<missing-id>"));
                for (String field : requiredFields) {
                    if (!record.containsKey(field)) {
                        throw invalid(id, field, "is required by schema record type " + entry.getKey());
                    }
                }
                for (Map.Entry<String, Object> fieldType : fieldTypes.entrySet()) {
                    if (record.containsKey(fieldType.getKey())) {
                        validateFieldType(schema, id, fieldType.getKey(), record.get(fieldType.getKey()),
                                String.valueOf(fieldType.getValue()));
                    }
                }
            }
        }
    }

    private static void validateFieldType(
            Map<String, Object> schema,
            String id,
            String field,
            Object value,
            String type
    ) {
        if (type.startsWith("enum:")) {
            String enumName = type.substring("enum:".length());
            Set<String> allowed = enumValues(schema, enumName);
            if (!(value instanceof String stringValue) || !allowed.contains(stringValue)) {
                throw invalid(id, field, "must be one of " + allowed + " but was " + value);
            }
            return;
        }
        if (type.equals("string") && !(value instanceof String)) {
            throw invalid(id, field, "must be a string but was " + typeName(value));
        }
        if (type.equals("integer") && !(value instanceof Byte || value instanceof Short
                || value instanceof Integer || value instanceof Long)) {
            throw invalid(id, field, "must be an integer but was " + typeName(value));
        }
        if (type.equals("array<string>")) {
            if (!(value instanceof List<?> list) || list.stream().anyMatch(item -> !(item instanceof String))) {
                throw invalid(id, field, "must be an array of strings");
            }
        } else if (type.startsWith("array<") && !(value instanceof List<?>)) {
            throw invalid(id, field, "must be an array but was " + typeName(value));
        } else if ((type.equals("condition-expression") || type.equals("rule-result"))
                && !(value instanceof Map<?, ?>)) {
            throw invalid(id, field, "must be a map but was " + typeName(value));
        }
    }

    private static void validateUniqueIds(Map<String, List<Map<String, Object>>> records) {
        Set<String> seen = new HashSet<>();
        for (List<Map<String, Object>> typedRecords : records.values()) {
            for (Map<String, Object> record : typedRecords) {
                String id = idOf(record);
                if (!seen.add(id)) {
                    throw invalid(id, "id", "duplicate ID across knowledge records");
                }
            }
        }
    }

    private static void validateReferences(Map<String, List<Map<String, Object>>> records) {
        Set<String> termIds = ids(records.getOrDefault("term", List.of()));
        Set<String> conceptIds = ids(records.getOrDefault("concept", List.of()));
        Set<String> evidenceIds = ids(records.getOrDefault("evidence", List.of()));
        Set<String> decisionIds = ids(records.getOrDefault("decision", List.of()));

        for (Map<String, Object> concept : records.getOrDefault("concept", List.of())) {
            requireReference(concept, "termId", termIds);
        }
        for (Map<String, Object> relation : records.getOrDefault("relation", List.of())) {
            requireReference(relation, "source", conceptIds);
            requireReference(relation, "target", conceptIds);
        }
        for (List<Map<String, Object>> typedRecords : records.values()) {
            for (Map<String, Object> record : typedRecords) {
                if (record.containsKey("evidenceIds")) {
                    for (String evidenceId : stringList(record.get("evidenceIds"), idOf(record), "evidenceIds")) {
                        if (!evidenceIds.contains(evidenceId)) {
                            throw invalid(idOf(record), "evidenceIds", "reference " + evidenceId + " does not resolve");
                        }
                    }
                }
            }
        }
        for (Map<String, Object> decision : records.getOrDefault("decision", List.of())) {
            for (String supersededId : stringList(decision.get("supersedes"), idOf(decision), "supersedes")) {
                if (!decisionIds.contains(supersededId)) {
                    throw invalid(idOf(decision), "supersedes", "reference " + supersededId + " does not resolve");
                }
            }
        }
    }

    private static void validateEvidencePaths(Path repositoryRoot, List<Map<String, Object>> evidenceRecords) {
        for (Map<String, Object> evidence : evidenceRecords) {
            String path = stringValue(evidence, "path", idOf(evidence));
            if (!Files.isRegularFile(repositoryRoot.resolve(path).normalize())) {
                throw invalid(idOf(evidence), "path", "repository-relative file does not exist: " + path);
            }
        }
    }

    private static void validateRules(Map<String, Object> schema, List<Map<String, Object>> rules) {
        Map<String, Object> conditionSchema = mapValue(schema, "conditionExpression", "schema.yaml");
        Map<String, Object> resultSchema = mapValue(schema, "ruleResult", "schema.yaml");
        for (Map<String, Object> rule : rules) {
            String id = idOf(rule);
            validateCondition(schema, conditionSchema, id, "condition", mapValue(rule, "condition", id));
            Map<String, Object> result = mapValue(rule, "result", id);
            for (String field : stringList(resultSchema.get("requiredFields"), "schema.yaml", "ruleResult.requiredFields")) {
                if (!result.containsKey(field)) {
                    throw invalid(id, "result." + field, "is required by schema ruleResult");
                }
            }
            Map<String, Object> resultFieldTypes = mapValue(resultSchema, "fieldTypes", "schema.yaml");
            for (Map.Entry<String, Object> fieldType : resultFieldTypes.entrySet()) {
                if (result.containsKey(fieldType.getKey())) {
                    validateFieldType(schema, id, "result." + fieldType.getKey(), result.get(fieldType.getKey()),
                            String.valueOf(fieldType.getValue()));
                }
            }
        }
    }

    private static void validateCondition(
            Map<String, Object> schema,
            Map<String, Object> conditionSchema,
            String recordId,
            String field,
            Map<String, Object> expression
    ) {
        Set<String> groupKeys = new HashSet<>(stringList(conditionSchema.get("groupKeys"),
                "schema.yaml", "conditionExpression.groupKeys"));
        List<String> presentGroups = expression.keySet().stream().filter(groupKeys::contains).toList();
        if (!presentGroups.isEmpty()) {
            if (presentGroups.size() != 1 || expression.size() != 1) {
                throw invalid(recordId, field, "condition group must contain exactly one schema group key");
            }
            String group = presentGroups.getFirst();
            Object children = expression.get(group);
            if (group.equals("not")) {
                validateCondition(schema, conditionSchema, recordId, field + ".not",
                        stringKeyedMapValue(children, recordId, field + ".not"));
            } else {
                if (!(children instanceof List<?> childList)) {
                    throw invalid(recordId, field + "." + group, "must be an array of condition expressions");
                }
                for (int index = 0; index < childList.size(); index++) {
                    validateCondition(schema, conditionSchema, recordId, field + "." + group + "[" + index + "]",
                            stringKeyedMapValue(childList.get(index), recordId, field + "." + group + "[" + index + "]"));
                }
            }
            return;
        }

        for (String requiredField : stringList(conditionSchema.get("clauseRequiredFields"),
                "schema.yaml", "conditionExpression.clauseRequiredFields")) {
            if (!expression.containsKey(requiredField)) {
                throw invalid(recordId, field + "." + requiredField, "is required by schema conditionExpression");
            }
        }
        Map<String, Object> clauseFieldTypes = mapValue(conditionSchema, "clauseFieldTypes", "schema.yaml");
        for (Map.Entry<String, Object> fieldType : clauseFieldTypes.entrySet()) {
            if (expression.containsKey(fieldType.getKey())) {
                validateFieldType(schema, recordId, field + "." + fieldType.getKey(),
                        expression.get(fieldType.getKey()), String.valueOf(fieldType.getValue()));
            }
        }
    }

    private static void validateProjectionInvariants(
            Map<String, Object> schema,
            Map<String, List<Map<String, Object>>> records
    ) {
        Map<String, Object> recordTypes = mapValue(schema, "recordTypes", "schema.yaml");
        Map<String, Object> projectionRules = mapValue(schema, "projectionRules", "schema.yaml");
        Map<String, Object> maturity = mapValue(projectionRules, "maturityInvariants", "schema.yaml");
        Map<String, Object> nonVerified = mapValue(maturity, "nonVerified", "schema.yaml");
        Map<String, Object> verified = mapValue(maturity, "verified", "schema.yaml");
        Map<String, Object> deprecated = mapValue(maturity, "deprecated", "schema.yaml");

        for (Map.Entry<String, List<Map<String, Object>>> typedRecords : records.entrySet()) {
            Object typeDefinition = recordTypes.get(typedRecords.getKey());
            if (!(typeDefinition instanceof Map<?, ?>)) {
                continue;
            }
            Map<String, Object> fieldTypes = mapValue(stringKeyedMap((Map<?, ?>) typeDefinition,
                    "schema.yaml", "recordTypes." + typedRecords.getKey()), "fieldTypes", "schema.yaml");
            if (!"enum:statuses".equals(fieldTypes.get("status"))) {
                continue;
            }
            for (Map<String, Object> record : typedRecords.getValue()) {
                validateProjectionRecord(record, nonVerified, verified, deprecated, projectionRules);
            }
        }
    }

    private static void validateProjectionRecord(
            Map<String, Object> record,
            Map<String, Object> nonVerified,
            Map<String, Object> verified,
            Map<String, Object> deprecated,
            Map<String, Object> projectionRules
    ) {
        String id = idOf(record);
        String status = stringValue(record, "status", id);
        String visibility = stringValue(record, "visibility", id);
        if (stringList(nonVerified.get("statuses"), "schema.yaml", "nonVerified.statuses").contains(status)) {
            String requiredVisibility = String.valueOf(nonVerified.get("requiredVisibility"));
            if (!requiredVisibility.equals(visibility)) {
                throw invalid(id, "visibility", "status " + status + " requires " + requiredVisibility);
            }
        }
        if (stringList(verified.get("statuses"), "schema.yaml", "verified.statuses").contains(status)) {
            validateRequiredAndNonEmpty(record, verified, "verified");
        }
        if (stringList(deprecated.get("statuses"), "schema.yaml", "deprecated.statuses").contains(status)
                && stringList(deprecated.get("forbiddenVisibilities"), "schema.yaml",
                "deprecated.forbiddenVisibilities").contains(visibility)) {
            throw invalid(id, "visibility", "deprecated records cannot use " + visibility);
        }
        for (String projection : List.of("customer", "runtime")) {
            Map<String, Object> policy = mapValue(projectionRules, projection, "schema.yaml");
            if (!stringList(policy.get("acceptedVisibilities"), "schema.yaml",
                    projection + ".acceptedVisibilities").contains(visibility)) {
                continue;
            }
            if (!stringList(policy.get("allowedStatuses"), "schema.yaml",
                    projection + ".allowedStatuses").contains(status)) {
                throw invalid(id, "status", projection + " projection does not allow status " + status);
            }
            validateRequiredAndNonEmpty(record, policy, projection + " projection");
        }
    }

    private static void validateRequiredAndNonEmpty(
            Map<String, Object> record,
            Map<String, Object> policy,
            String policyName
    ) {
        String id = idOf(record);
        for (String field : stringList(policy.get("requiredFields"), "schema.yaml", policyName + ".requiredFields")) {
            if (!record.containsKey(field)) {
                throw invalid(id, field, "is required for " + policyName);
            }
        }
        for (String field : stringList(policy.get("nonEmptyFields"), "schema.yaml", policyName + ".nonEmptyFields")) {
            Object value = record.get(field);
            if (value == null || value instanceof String string && string.isBlank()
                    || value instanceof Collection<?> collection && collection.isEmpty()
                    || value instanceof Map<?, ?> map && map.isEmpty()) {
                throw invalid(id, field, "must be non-empty for " + policyName);
            }
        }
    }

    private static Map<String, List<Map<String, Object>>> records(KnowledgeModel model) {
        Map<String, List<Map<String, Object>>> records = new LinkedHashMap<>();
        for (String type : TOP_LEVEL_COLLECTIONS.values()) {
            records.put(type, new ArrayList<>());
        }
        for (NestedCollection nested : NESTED_COLLECTIONS) {
            records.put(nested.recordType(), new ArrayList<>());
        }
        for (Map.Entry<Path, Map<String, Object>> document : model.documents().entrySet()) {
            String documentId = model.repositoryRoot().relativize(document.getKey()).toString();
            for (Map.Entry<String, String> collection : TOP_LEVEL_COLLECTIONS.entrySet()) {
                if (document.getValue().containsKey(collection.getKey())) {
                    records.get(collection.getValue()).addAll(recordList(
                            document.getValue().get(collection.getKey()), documentId, collection.getKey()));
                }
            }
        }
        for (Map<String, Object> decision : records.get("decision")) {
            for (NestedCollection nested : NESTED_COLLECTIONS) {
                if (decision.containsKey(nested.field())) {
                    records.get(nested.recordType()).addAll(recordList(
                            decision.get(nested.field()), idOf(decision), nested.field()));
                }
            }
        }
        return records;
    }

    private static List<Map<String, Object>> recordList(Object value, String ownerId, String field) {
        if (!(value instanceof List<?> list)) {
            throw invalid(ownerId, field, "must be an array of records");
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (int index = 0; index < list.size(); index++) {
            result.add(stringKeyedMapValue(list.get(index), ownerId, field + "[" + index + "]"));
        }
        return result;
    }

    private static Set<String> enumValues(Map<String, Object> schema, String enumName) {
        Map<String, Object> enums = mapValue(schema, "enums", "schema.yaml");
        Object rawValues = enums.get(enumName);
        if (!(rawValues instanceof List<?> values)) {
            throw invalid("schema.yaml", "enums." + enumName, "must be an array");
        }
        Set<String> result = new HashSet<>();
        for (Object value : values) {
            if (value instanceof String stringValue) {
                result.add(stringValue);
            } else if (value instanceof Map<?, ?> map) {
                result.add(stringValue(stringKeyedMap(map, "schema.yaml", "enums." + enumName),
                        "id", "schema.yaml"));
            } else {
                throw invalid("schema.yaml", "enums." + enumName, "contains unsupported value " + value);
            }
        }
        return result;
    }

    private static void requireReference(Map<String, Object> record, String field, Set<String> validIds) {
        String reference = stringValue(record, field, idOf(record));
        if (!validIds.contains(reference)) {
            throw invalid(idOf(record), field, "reference " + reference + " does not resolve");
        }
    }

    private static Set<String> ids(List<Map<String, Object>> records) {
        Set<String> ids = new HashSet<>();
        records.forEach(record -> ids.add(idOf(record)));
        return ids;
    }

    private static String idOf(Map<String, Object> record) {
        Object id = record.get("id");
        if (!(id instanceof String stringId) || stringId.isBlank()) {
            throw invalid("<missing-id>", "id", "must be a non-empty string");
        }
        return stringId;
    }

    private static String stringValue(Map<String, Object> map, String field, String id) {
        Object value = map.get(field);
        if (!(value instanceof String stringValue)) {
            throw invalid(id, field, "must be a string but was " + typeName(value));
        }
        return stringValue;
    }

    private static List<String> stringList(Object value, String id, String field) {
        if (!(value instanceof List<?> list) || list.stream().anyMatch(item -> !(item instanceof String))) {
            throw invalid(id, field, "must be an array of strings");
        }
        return list.stream().map(String.class::cast).toList();
    }

    private static Map<String, Object> mapValue(Map<String, Object> map, String field, String id) {
        return stringKeyedMapValue(map.get(field), id, field);
    }

    private static Map<String, Object> stringKeyedMapValue(Object value, String id, String field) {
        if (!(value instanceof Map<?, ?> rawMap)) {
            throw invalid(id, field, "must be a map but was " + typeName(value));
        }
        return stringKeyedMap(rawMap, id, field);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> stringKeyedMap(Map<?, ?> rawMap, String id, String field) {
        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
            if (!(entry.getKey() instanceof String)) {
                throw invalid(id, field, "map keys must be strings");
            }
        }
        return (Map<String, Object>) rawMap;
    }

    private static Map<String, Object> firstConditionClause(Map<String, Object> expression) {
        for (String group : List.of("all", "any")) {
            if (expression.get(group) instanceof List<?> children && !children.isEmpty()) {
                return firstConditionClause(stringKeyedMapValue(children.getFirst(), "test mutation", group));
            }
        }
        if (expression.get("not") instanceof Map<?, ?> child) {
            return firstConditionClause(stringKeyedMap(child, "test mutation", "not"));
        }
        return expression;
    }

    private static KnowledgeModel mutableKnowledgeModel() throws IOException {
        KnowledgeModel source = loadKnowledgeModel();
        Map<Path, Map<String, Object>> copiedDocuments = new LinkedHashMap<>();
        source.documents().forEach((path, document) -> copiedDocuments.put(path, deepCopyMap(document)));
        return new KnowledgeModel(source.repositoryRoot(), copiedDocuments);
    }

    private static Map<String, Object> deepCopyMap(Map<String, Object> source) {
        Map<String, Object> copy = new LinkedHashMap<>();
        source.forEach((key, value) -> copy.put(key, deepCopy(value)));
        return copy;
    }

    private static Object deepCopy(Object value) {
        if (value instanceof Map<?, ?> map) {
            return deepCopyMap(stringKeyedMap(map, "deep-copy", "value"));
        }
        if (value instanceof List<?> list) {
            return list.stream().map(BusinessKnowledgeModelTest::deepCopy).collect(ArrayList::new,
                    ArrayList::add, ArrayList::addAll);
        }
        return value;
    }

    private static Map<String, Object> firstRecord(KnowledgeModel model, String recordType) {
        List<Map<String, Object>> typedRecords = records(model).get(recordType);
        assertThat(typedRecords).as("records of type %s", recordType).isNotEmpty();
        return typedRecords.getFirst();
    }

    private static void assertValidationFails(
            KnowledgeModel model,
            String recordId,
            String field,
            String reason
    ) {
        assertThatThrownBy(() -> validateKnowledgeModel(model))
                .isInstanceOf(KnowledgeValidationException.class)
                .hasMessageContaining(recordId)
                .hasMessageContaining(field)
                .hasMessageContaining(reason);
    }

    private static String typeName(Object value) {
        return value == null ? "null" : value.getClass().getSimpleName();
    }

    private static KnowledgeValidationException invalid(String recordId, String field, String reason) {
        return new KnowledgeValidationException("Record " + recordId + " field '" + field + "': " + reason);
    }

    private record KnowledgeModel(Path repositoryRoot, Map<Path, Map<String, Object>> documents) {
        private Map<String, Object> schema() {
            Path schemaPath = repositoryRoot.resolve("docs/knowledge/schema.yaml").normalize();
            Map<String, Object> schema = documents.get(schemaPath);
            if (schema == null) {
                throw invalid("schema.yaml", "document", "is missing");
            }
            return schema;
        }
    }

    private record NestedCollection(String field, String recordType) {
    }

    private static final class KnowledgeValidationException extends IllegalArgumentException {
        private KnowledgeValidationException(String message) {
            super(message);
        }
    }
}
