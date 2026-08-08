package com.zencas.edhr.knowledge;

import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.zencas.edhr.knowledge.BusinessKnowledgeModel.invalid;
import static com.zencas.edhr.knowledge.BusinessKnowledgeModel.stringKeyedMap;
import static com.zencas.edhr.knowledge.BusinessKnowledgeModelLoader.display;

final class BusinessKnowledgeModelValidator {

    private static final Set<String> SUPPORTED_LITERAL_DESCRIPTORS = Set.of(
            "string", "integer", "condition-expression", "rule-result"
    );
    private static final Pattern ENUM_DESCRIPTOR = Pattern.compile("enum:([A-Za-z][A-Za-z0-9]*)");
    private static final Pattern ARRAY_DESCRIPTOR = Pattern.compile("array<([A-Za-z][A-Za-z0-9]*)>");

    private BusinessKnowledgeModelValidator() {
    }

    static void validate(BusinessKnowledgeModel model) {
        Map<String, Object> schema = model.schema();
        validateVersions(model, schema);
        SchemaStructure structure = validateSchemaStructure(schema);
        RecordIndex records = collectRecords(model, structure);
        validateRecordsAgainstSchema(schema, structure, records);
        validateIdPrefixes(schema, structure, records);
        validateUniqueIds(records);
        validateReferences(schema, structure, records);
        validateEvidencePaths(model.repositoryRoot(), schema, records.records("evidence"));
        validateRules(schema, records.records("rule"));
        validateRuleProjections(schema, records.records("rule"));
        validateExecutionContracts(schema, structure, records);
    }

    static Map<String, List<Map<String, Object>>> records(BusinessKnowledgeModel model) {
        SchemaStructure structure = validateSchemaStructure(model.schema());
        return collectRecords(model, structure).asMaps();
    }

    private static void validateVersions(BusinessKnowledgeModel model, Map<String, Object> schema) {
        String schemaId = "docs/knowledge/schema.yaml";
        String schemaVersion = requiredString(schema, "schemaVersion", schemaId);
        if (schemaVersion.isBlank()) {
            throw invalid(schemaId, "schemaVersion", "must be non-empty");
        }
        String expectedVersion = requiredString(schema, "knowledgeModelVersion", schemaId);
        if (expectedVersion.isBlank()) {
            throw invalid(schemaId, "knowledgeModelVersion", "must be non-empty");
        }
        model.documents().forEach((path, document) -> {
            String documentId = display(path);
            Object actualVersion = document.get("knowledgeModelVersion");
            if (!expectedVersion.equals(actualVersion)) {
                throw invalid(documentId, "knowledgeModelVersion",
                        "must equal schema.yaml value " + expectedVersion + " but was " + actualVersion);
            }
        });
    }

    private static SchemaStructure validateSchemaStructure(Map<String, Object> schema) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> recordTypes = mapValue(schema, "recordTypes", schemaId);
        Map<String, String> collectionTypes = stringMapping(schema, "collectionTypes", schemaId);
        Map<String, String> nestedCollectionTypes = stringMapping(schema, "nestedCollectionTypes", schemaId);
        Set<String> recordTypeNames = new TreeSet<>(recordTypes.keySet());

        Set<String> overlappingCollections = new TreeSet<>(collectionTypes.keySet());
        overlappingCollections.retainAll(nestedCollectionTypes.keySet());
        if (!overlappingCollections.isEmpty()) {
            throw invalid(schemaId, "collectionTypes",
                    "top-level and nested collection names overlap " + overlappingCollections);
        }

        List<String> mappedTypes = new ArrayList<>(collectionTypes.values());
        mappedTypes.addAll(nestedCollectionTypes.values());
        Set<String> unknownTargets = new TreeSet<>(mappedTypes);
        unknownTargets.removeAll(recordTypeNames);
        if (!unknownTargets.isEmpty()) {
            throw invalid(schemaId, "collectionTypes", "unknown record type targets " + unknownTargets);
        }
        Set<String> mappedTypeSet = new TreeSet<>(mappedTypes);
        Set<String> missingMappings = new TreeSet<>(recordTypeNames);
        missingMappings.removeAll(mappedTypeSet);
        if (!missingMappings.isEmpty()) {
            throw invalid(schemaId, "collectionTypes", "missing mappings for record types " + missingMappings);
        }
        Set<String> duplicateTargets = duplicates(mappedTypes);
        if (!duplicateTargets.isEmpty()) {
            throw invalid(schemaId, "collectionTypes", "record types mapped more than once " + duplicateTargets);
        }

        validateDescriptorGrammar(schema, recordTypes, nestedCollectionTypes);
        return new SchemaStructure(recordTypes, collectionTypes, nestedCollectionTypes);
    }

    private static void validateDescriptorGrammar(
            Map<String, Object> schema,
            Map<String, Object> recordTypes,
            Map<String, String> nestedCollectionTypes
    ) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> policy = mapValue(schema, "allowedFieldTypeDescriptors", schemaId);
        Set<String> configuredLiterals = new TreeSet<>(stringList(policy.get("literals"), schemaId,
                "allowedFieldTypeDescriptors.literals"));
        if (!configuredLiterals.equals(new TreeSet<>(SUPPORTED_LITERAL_DESCRIPTORS))) {
            throw invalid(schemaId, "allowedFieldTypeDescriptors.literals",
                    "must equal supported descriptors " + new TreeSet<>(SUPPORTED_LITERAL_DESCRIPTORS));
        }
        if (!"forbidden".equals(policy.get("unknownDescriptors"))) {
            throw invalid(schemaId, "allowedFieldTypeDescriptors.unknownDescriptors", "must be forbidden");
        }
        Map<String, Object> parameterized = mapValue(policy, "parameterized", schemaId);
        validateParameterizedDescriptorPolicy(parameterized, "enum", "enums", schemaId);
        Map<String, Object> arrayPolicy = validateParameterizedDescriptorPolicy(
                parameterized, "array", "recordTypes", schemaId);
        Set<String> scalarArrayTypes = new TreeSet<>(stringList(arrayPolicy.get("scalarItemTypes"), schemaId,
                "allowedFieldTypeDescriptors.parameterized.array.scalarItemTypes"));
        if (!scalarArrayTypes.equals(Set.of("string"))) {
            throw invalid(schemaId, "allowedFieldTypeDescriptors.parameterized.array.scalarItemTypes",
                    "must equal [string]");
        }

        Set<String> enumNames = mapValue(schema, "enums", schemaId).keySet();
        Set<String> recordTypeNames = recordTypes.keySet();
        Set<String> describedNestedFields = new TreeSet<>();
        for (String recordType : new TreeSet<>(recordTypes.keySet())) {
            Map<String, Object> definition = mapValue(recordTypes, recordType, schemaId);
            Map<String, Object> fieldTypes = mapValue(definition, "fieldTypes", schemaId);
            Set<String> requiredFields = new TreeSet<>(stringList(definition.get("requiredFields"), schemaId,
                    "recordTypes." + recordType + ".requiredFields"));
            Set<String> missingDescriptors = new TreeSet<>(requiredFields);
            missingDescriptors.removeAll(fieldTypes.keySet());
            if (!missingDescriptors.isEmpty()) {
                throw invalid(schemaId, "recordTypes." + recordType + ".fieldTypes",
                        "required fields missing descriptors " + missingDescriptors);
            }
            for (String field : new TreeSet<>(fieldTypes.keySet())) {
                Object rawDescriptor = fieldTypes.get(field);
                if (!(rawDescriptor instanceof String descriptor)) {
                    throw invalid(schemaId, "recordTypes." + recordType + ".fieldTypes." + field,
                            "descriptor must be a string");
                }
                if (configuredLiterals.contains(descriptor)) {
                    continue;
                }
                Matcher enumMatcher = ENUM_DESCRIPTOR.matcher(descriptor);
                if (enumMatcher.matches()) {
                    if (!enumNames.contains(enumMatcher.group(1))) {
                        throw invalid(schemaId, "recordTypes." + recordType + ".fieldTypes." + field,
                                "enum descriptor references unknown enum " + enumMatcher.group(1));
                    }
                    continue;
                }
                Matcher arrayMatcher = ARRAY_DESCRIPTOR.matcher(descriptor);
                if (arrayMatcher.matches()) {
                    String itemType = arrayMatcher.group(1);
                    if (scalarArrayTypes.contains(itemType)) {
                        continue;
                    }
                    if (!recordTypeNames.contains(itemType)) {
                        throw invalid(schemaId, "recordTypes." + recordType + ".fieldTypes." + field,
                                "array descriptor references unknown record type " + itemType);
                    }
                    String mappedType = nestedCollectionTypes.get(field);
                    if (!itemType.equals(mappedType)) {
                        throw invalid(schemaId, "recordTypes." + recordType + ".fieldTypes." + field,
                                "nested collection mapping must target " + itemType + " but was " + mappedType);
                    }
                    describedNestedFields.add(field);
                    continue;
                }
                throw invalid(schemaId, "recordTypes." + recordType + ".fieldTypes." + field,
                        "unsupported descriptor " + descriptor);
            }
        }
        Set<String> undescribedNestedFields = new TreeSet<>(nestedCollectionTypes.keySet());
        undescribedNestedFields.removeAll(describedNestedFields);
        if (!undescribedNestedFields.isEmpty()) {
            throw invalid(schemaId, "nestedCollectionTypes",
                    "mappings are not backed by array record descriptors " + undescribedNestedFields);
        }
    }

    private static Map<String, Object> validateParameterizedDescriptorPolicy(
            Map<String, Object> parameterized,
            String name,
            String expectedRegistry,
            String schemaId
    ) {
        Map<String, Object> descriptor = mapValue(parameterized, name, schemaId);
        if (!expectedRegistry.equals(descriptor.get("referencedRegistry"))) {
            throw invalid(schemaId, "allowedFieldTypeDescriptors.parameterized." + name + ".referencedRegistry",
                    "must be " + expectedRegistry);
        }
        if (!"forbidden".equals(descriptor.get("unknownReferences"))) {
            throw invalid(schemaId, "allowedFieldTypeDescriptors.parameterized." + name + ".unknownReferences",
                    "must be forbidden");
        }
        return descriptor;
    }

    private static RecordIndex collectRecords(BusinessKnowledgeModel model, SchemaStructure structure) {
        Map<String, List<RecordRef>> records = new TreeMap<>();
        structure.recordTypes().keySet().forEach(type -> records.put(type, new ArrayList<>()));
        Path schemaPath = Path.of("docs", "knowledge", "schema.yaml");

        for (Map.Entry<Path, Map<String, Object>> document : model.documents().entrySet()) {
            if (document.getKey().equals(schemaPath)) {
                continue;
            }
            String documentId = display(document.getKey());
            for (String collection : new TreeSet<>(document.getValue().keySet())) {
                if (collection.equals("knowledgeModelVersion")) {
                    continue;
                }
                String recordType = structure.collectionTypes().get(collection);
                if (recordType == null) {
                    throw invalid(documentId, collection, "unknown top-level collection; allowed collections "
                            + new TreeSet<>(structure.collectionTypes().keySet()));
                }
                for (Map<String, Object> record : recordList(document.getValue().get(collection), documentId, collection)) {
                    records.get(recordType).add(new RecordRef(recordType, record, documentId));
                }
            }
        }

        ArrayDeque<RecordRef> queue = new ArrayDeque<>();
        structure.collectionTypes().values().stream().distinct()
                .flatMap(type -> records.get(type).stream()).forEach(queue::add);
        while (!queue.isEmpty()) {
            RecordRef parent = queue.removeFirst();
            for (String field : new TreeSet<>(parent.data().keySet())) {
                Object value = parent.data().get(field);
                if (value instanceof List<?> list && list.stream().anyMatch(item -> item instanceof Map<?, ?>)
                        && !structure.nestedCollectionTypes().containsKey(field)) {
                    throw invalid(idOf(parent.data()), field, "unknown nested record collection");
                }
            }
            for (String field : new TreeSet<>(structure.nestedCollectionTypes().keySet())) {
                if (!parent.data().containsKey(field)) {
                    continue;
                }
                String recordType = structure.nestedCollectionTypes().get(field);
                for (Map<String, Object> child : recordList(parent.data().get(field), idOf(parent.data()), field)) {
                    RecordRef childRef = new RecordRef(recordType, child, parent.sourcePath());
                    records.get(recordType).add(childRef);
                    queue.add(childRef);
                }
            }
        }
        return new RecordIndex(records);
    }

    private static void validateRecordsAgainstSchema(
            Map<String, Object> schema,
            SchemaStructure structure,
            RecordIndex records
    ) {
        for (String recordType : new TreeSet<>(structure.recordTypes().keySet())) {
            Map<String, Object> definition = mapValue(structure.recordTypes(), recordType,
                    "docs/knowledge/schema.yaml");
            List<String> requiredFields = stringList(definition.get("requiredFields"),
                    "docs/knowledge/schema.yaml", "recordTypes." + recordType + ".requiredFields");
            Map<String, Object> fieldTypes = mapValue(definition, "fieldTypes", "docs/knowledge/schema.yaml");
            for (RecordRef record : records.refs(recordType)) {
                String id = displayId(record);
                for (String field : requiredFields) {
                    if (!record.data().containsKey(field)) {
                        throw invalid(id, field, "is required by schema record type " + recordType);
                    }
                }
                for (String field : new TreeSet<>(fieldTypes.keySet())) {
                    if (record.data().containsKey(field)) {
                        validateFieldType(schema, id, field, record.data().get(field),
                                String.valueOf(fieldTypes.get(field)));
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
            String descriptor
    ) {
        if (descriptor.equals("string")) {
            if (!(value instanceof String)) {
                throw invalid(id, field, "must be a string but was " + typeName(value));
            }
            return;
        }
        if (descriptor.equals("integer")) {
            if (!(value instanceof Byte || value instanceof Short || value instanceof Integer
                    || value instanceof Long || value instanceof BigInteger)) {
                throw invalid(id, field, "must be an integer but was " + typeName(value));
            }
            return;
        }
        if (descriptor.equals("condition-expression") || descriptor.equals("rule-result")) {
            if (!(value instanceof Map<?, ?>)) {
                throw invalid(id, field, "must be a map but was " + typeName(value));
            }
            return;
        }
        Matcher enumMatcher = ENUM_DESCRIPTOR.matcher(descriptor);
        if (enumMatcher.matches()) {
            Set<String> allowed = enumValues(schema, enumMatcher.group(1));
            if (!(value instanceof String stringValue) || !allowed.contains(stringValue)) {
                throw invalid(id, field, "must be one of " + allowed + " but was " + value);
            }
            return;
        }
        Matcher arrayMatcher = ARRAY_DESCRIPTOR.matcher(descriptor);
        if (arrayMatcher.matches()) {
            if (!(value instanceof List<?> list)) {
                throw invalid(id, field, "must be an array but was " + typeName(value));
            }
            String itemType = arrayMatcher.group(1);
            if (itemType.equals("string") && list.stream().anyMatch(item -> !(item instanceof String))) {
                throw invalid(id, field, "must be an array of strings");
            }
            if (!itemType.equals("string") && list.stream().anyMatch(item -> !(item instanceof Map<?, ?>))) {
                throw invalid(id, field, "must be an array of " + itemType + " records");
            }
            return;
        }
        throw invalid(id, field, "unsupported descriptor " + descriptor);
    }

    private static void validateIdPrefixes(
            Map<String, Object> schema,
            SchemaStructure structure,
            RecordIndex records
    ) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, String> prefixes = stringMapping(schema, "idPrefixes", schemaId);
        Set<String> missing = new TreeSet<>(structure.recordTypes().keySet());
        missing.removeAll(prefixes.keySet());
        Set<String> extra = new TreeSet<>(prefixes.keySet());
        extra.removeAll(structure.recordTypes().keySet());
        if (!missing.isEmpty() || !extra.isEmpty()) {
            throw invalid(schemaId, "idPrefixes", "must cover recordTypes exactly; missing " + missing + ", extra " + extra);
        }
        for (String recordType : new TreeSet<>(structure.recordTypes().keySet())) {
            String prefix = prefixes.get(recordType);
            if (prefix.isBlank()) {
                throw invalid(schemaId, "idPrefixes." + recordType, "must be non-empty");
            }
            for (RecordRef record : records.refs(recordType)) {
                String id = idOf(record.data());
                if (!id.startsWith(prefix)) {
                    throw invalid(id, "id", "record type " + recordType + " requires prefix " + prefix);
                }
            }
        }
    }

    private static void validateUniqueIds(RecordIndex records) {
        Set<String> seen = new HashSet<>();
        for (String recordType : new TreeSet<>(records.types())) {
            for (RecordRef record : records.refs(recordType)) {
                String id = idOf(record.data());
                if (!seen.add(id)) {
                    throw invalid(id, "id", "duplicate ID across knowledge records");
                }
            }
        }
    }

    private static void validateReferences(
            Map<String, Object> schema,
            SchemaStructure structure,
            RecordIndex records
    ) {
        Set<String> termIds = ids(records.records("term"));
        Set<String> conceptIds = ids(records.records("concept"));
        Set<String> evidenceIds = ids(records.records("evidence"));
        Set<String> decisionIds = ids(records.records("decision"));

        records.records("concept").forEach(record -> requireReference(record, "termId", termIds));
        for (Map<String, Object> relation : records.records("relation")) {
            requireReference(relation, "source", conceptIds);
            requireReference(relation, "target", conceptIds);
        }
        for (String recordType : new TreeSet<>(records.types())) {
            for (Map<String, Object> record : records.records(recordType)) {
                if (record.containsKey("evidenceIds")) {
                    for (String evidenceId : stringList(record.get("evidenceIds"), idOf(record), "evidenceIds")) {
                        if (!evidenceIds.contains(evidenceId)) {
                            throw invalid(idOf(record), "evidenceIds",
                                    "reference " + evidenceId + " does not resolve");
                        }
                    }
                }
            }
        }
        for (Map<String, Object> decision : records.records("decision")) {
            for (String supersededId : stringList(decision.get("supersedes"), idOf(decision), "supersedes")) {
                if (!decisionIds.contains(supersededId)) {
                    throw invalid(idOf(decision), "supersedes",
                            "reference " + supersededId + " does not resolve");
                }
            }
        }
        validateExecutionContractReferences(schema, structure, records);
    }

    private static void validateExecutionContractReferences(
            Map<String, Object> schema,
            SchemaStructure structure,
            RecordIndex records
    ) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> projectionRules = mapValue(schema, "projectionRules", schemaId);
        Map<String, Object> policy = mapValue(projectionRules, "executionContract", schemaId);
        Map<String, Object> referencedBy = mapValue(policy, "referencedBy", schemaId);
        String sourceType = requiredString(referencedBy, "recordType", schemaId);
        String field = requiredString(referencedBy, "field", schemaId);
        String targetCollection = requiredString(referencedBy, "targetCollection", schemaId);
        String targetType = requiredString(referencedBy, "targetRecordType", schemaId);
        if (!structure.recordTypes().containsKey(sourceType)) {
            throw invalid(schemaId, "projectionRules.executionContract.referencedBy.recordType",
                    "unknown record type " + sourceType);
        }
        if (!targetType.equals(structure.collectionTypes().get(targetCollection))) {
            throw invalid(schemaId, "projectionRules.executionContract.referencedBy.targetCollection",
                    "must map to target record type " + targetType);
        }
        if (!structure.recordTypes().containsKey(targetType)) {
            throw invalid(schemaId, "projectionRules.executionContract.referencedBy.targetRecordType",
                    "unknown record type " + targetType);
        }
        if (!Boolean.TRUE.equals(referencedBy.get("mustResolve"))) {
            throw invalid(schemaId, "projectionRules.executionContract.referencedBy.mustResolve", "must be true");
        }
        Set<String> requiredStatuses = new TreeSet<>(stringList(referencedBy.get("requiredForStatuses"), schemaId,
                "projectionRules.executionContract.referencedBy.requiredForStatuses"));
        Set<String> contractIds = ids(records.records(targetType));
        for (Map<String, Object> source : records.records(sourceType)) {
            String status = requiredString(source, "status", idOf(source));
            if (requiredStatuses.contains(status) && !source.containsKey(field)) {
                throw invalid(idOf(source), field, "is required for status " + status);
            }
            if (!source.containsKey(field)) {
                continue;
            }
            String contractId = requiredString(source, field, idOf(source));
            if (contractId.isBlank()) {
                throw invalid(idOf(source), field, "must be non-empty");
            }
            if (!contractIds.contains(contractId)) {
                throw invalid(idOf(source), field, "reference " + contractId + " does not resolve");
            }
        }
    }

    private static void validateEvidencePaths(
            Path repositoryRoot,
            Map<String, Object> schema,
            List<Map<String, Object>> evidenceRecords
    ) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> policy = mapValue(schema, "evidencePathPolicy", schemaId);
        boolean relativeOnly = requiredBoolean(policy, "relativeOnly", schemaId);
        boolean remainWithinRepository = requiredBoolean(policy, "mustRemainWithinRepository", schemaId);
        Set<String> mustExistForTypes = new TreeSet<>(stringList(policy.get("mustExistForTypes"), schemaId,
                "evidencePathPolicy.mustExistForTypes"));
        Set<String> allowedEvidenceTypes = enumValues(schema, "evidenceTypes");
        Set<String> unknownTypes = new TreeSet<>(mustExistForTypes);
        unknownTypes.removeAll(allowedEvidenceTypes);
        if (!unknownTypes.isEmpty()) {
            throw invalid(schemaId, "evidencePathPolicy.mustExistForTypes",
                    "contains unknown evidence types " + unknownTypes);
        }

        Path normalizedRoot = repositoryRoot.toAbsolutePath().normalize();
        Path realRoot = realPath(normalizedRoot, schemaId, "evidencePathPolicy.mustRemainWithinRepository");
        for (Map<String, Object> evidence : evidenceRecords) {
            String id = idOf(evidence);
            String type = requiredString(evidence, "type", id);
            if (!mustExistForTypes.contains(type)) {
                continue;
            }
            String configuredPath = requiredString(evidence, "path", id);
            Path relativePath;
            try {
                relativePath = Path.of(configuredPath);
            } catch (InvalidPathException exception) {
                throw new KnowledgeValidationException(
                        "Record " + id + " field 'path': invalid path " + configuredPath, exception);
            }
            if (relativeOnly && relativePath.isAbsolute()) {
                throw invalid(id, "path", "must be repository-relative: " + configuredPath);
            }
            Path normalizedPath = normalizedRoot.resolve(relativePath).normalize();
            if (remainWithinRepository && !normalizedPath.startsWith(normalizedRoot)) {
                throw invalid(id, "path", "normalized path escapes repository: " + configuredPath);
            }
            if (!Files.isRegularFile(normalizedPath)) {
                throw invalid(id, "path", "repository-relative file does not exist: " + configuredPath);
            }
            if (remainWithinRepository) {
                Path realPath = realPath(normalizedPath, id, "path");
                if (!realPath.startsWith(realRoot)) {
                    throw invalid(id, "path", "real path escapes repository: " + configuredPath);
                }
            }
        }
    }

    private static Path realPath(Path path, String id, String field) {
        try {
            return path.toRealPath();
        } catch (IOException exception) {
            throw new KnowledgeValidationException(
                    "Record " + id + " field '" + field + "': cannot resolve real path " + path,
                    exception);
        }
    }

    private static void validateRules(Map<String, Object> schema, List<Map<String, Object>> rules) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> conditionSchema = mapValue(schema, "conditionExpression", schemaId);
        validateConditionSchema(conditionSchema);
        Map<String, Object> resultSchema = mapValue(schema, "ruleResult", schemaId);
        String additionalResultFields = requiredString(resultSchema, "additionalFields", schemaId);
        if (!Set.of("allowed", "forbidden").contains(additionalResultFields)) {
            throw invalid(schemaId, "ruleResult.additionalFields", "must be allowed or forbidden");
        }
        for (Map<String, Object> rule : rules) {
            String id = idOf(rule);
            validateCondition(schema, conditionSchema, id, "condition", mapValue(rule, "condition", id));
            Map<String, Object> result = mapValue(rule, "result", id);
            List<String> requiredFields = stringList(resultSchema.get("requiredFields"), schemaId,
                    "ruleResult.requiredFields");
            for (String field : requiredFields) {
                if (!result.containsKey(field)) {
                    throw invalid(id, "result." + field, "is required by schema ruleResult");
                }
            }
            if (additionalResultFields.equals("forbidden")
                    && !new TreeSet<>(result.keySet()).equals(new TreeSet<>(requiredFields))) {
                throw invalid(id, "result", "must contain exactly fields " + new TreeSet<>(requiredFields));
            }
            Map<String, Object> fieldTypes = mapValue(resultSchema, "fieldTypes", schemaId);
            for (String field : new TreeSet<>(fieldTypes.keySet())) {
                if (result.containsKey(field)) {
                    validateFieldType(schema, id, "result." + field, result.get(field),
                            String.valueOf(fieldTypes.get(field)));
                }
            }
        }
    }

    private static void validateConditionSchema(Map<String, Object> conditionSchema) {
        String schemaId = "docs/knowledge/schema.yaml";
        if (!"forbidden".equals(conditionSchema.get("additionalFields"))) {
            throw invalid(schemaId, "conditionExpression.additionalFields", "must be forbidden");
        }
        Set<String> groupKeys = new TreeSet<>(stringList(conditionSchema.get("groupKeys"), schemaId,
                "conditionExpression.groupKeys"));
        Map<String, Object> groupNode = mapValue(conditionSchema, "groupNode", schemaId);
        if (!groupKeys.equals(new TreeSet<>(stringList(groupNode.get("exactlyOneOf"), schemaId,
                "conditionExpression.groupNode.exactlyOneOf")))) {
            throw invalid(schemaId, "conditionExpression.groupNode.exactlyOneOf", "must equal groupKeys");
        }
        if (!groupKeys.equals(new TreeSet<>(stringList(groupNode.get("allowedFields"), schemaId,
                "conditionExpression.groupNode.allowedFields")))) {
            throw invalid(schemaId, "conditionExpression.groupNode.allowedFields", "must equal groupKeys");
        }
        if (!"non-empty-array-of-condition-expressions".equals(groupNode.get("allValue"))
                || !"non-empty-array-of-condition-expressions".equals(groupNode.get("anyValue"))
                || !"one-condition-expression".equals(groupNode.get("notValue"))) {
            throw invalid(schemaId, "conditionExpression.groupNode", "contains unsupported group value policy");
        }
        List<String> requiredFields = stringList(conditionSchema.get("clauseRequiredFields"), schemaId,
                "conditionExpression.clauseRequiredFields");
        Map<String, Object> clauseNode = mapValue(conditionSchema, "clauseNode", schemaId);
        if (!new TreeSet<>(requiredFields).equals(new TreeSet<>(stringList(clauseNode.get("allowedFields"), schemaId,
                "conditionExpression.clauseNode.allowedFields")))) {
            throw invalid(schemaId, "conditionExpression.clauseNode.allowedFields",
                    "must equal clauseRequiredFields");
        }
        if (!"clauseRequiredFields".equals(clauseNode.get("exactFieldsFrom"))) {
            throw invalid(schemaId, "conditionExpression.clauseNode.exactFieldsFrom",
                    "must reference clauseRequiredFields");
        }
    }

    private static void validateCondition(
            Map<String, Object> schema,
            Map<String, Object> conditionSchema,
            String recordId,
            String field,
            Map<String, Object> expression
    ) {
        Set<String> groupKeys = new TreeSet<>(stringList(conditionSchema.get("groupKeys"),
                "docs/knowledge/schema.yaml", "conditionExpression.groupKeys"));
        Set<String> presentGroups = new TreeSet<>(expression.keySet());
        presentGroups.retainAll(groupKeys);
        if (!presentGroups.isEmpty()) {
            if (presentGroups.size() != 1 || expression.size() != 1) {
                throw invalid(recordId, field, "group node must contain exactly one key from " + groupKeys
                        + " but had " + new TreeSet<>(expression.keySet()));
            }
            String group = presentGroups.iterator().next();
            Object children = expression.get(group);
            if (group.equals("not")) {
                validateCondition(schema, conditionSchema, recordId, field + ".not",
                        stringKeyedMapValue(children, recordId, field + ".not"));
                return;
            }
            if (!(children instanceof List<?> childList) || childList.isEmpty()) {
                throw invalid(recordId, field + "." + group,
                        "must be a non-empty array of condition expressions");
            }
            for (int index = 0; index < childList.size(); index++) {
                validateCondition(schema, conditionSchema, recordId, field + "." + group + "[" + index + "]",
                        stringKeyedMapValue(childList.get(index), recordId,
                                field + "." + group + "[" + index + "]"));
            }
            return;
        }

        Set<String> requiredFields = new TreeSet<>(stringList(conditionSchema.get("clauseRequiredFields"),
                "docs/knowledge/schema.yaml", "conditionExpression.clauseRequiredFields"));
        Set<String> actualFields = new TreeSet<>(expression.keySet());
        if (!actualFields.equals(requiredFields)) {
            throw invalid(recordId, field, "clause node must contain exactly fields " + requiredFields
                    + " but had " + actualFields);
        }
        Map<String, Object> fieldTypes = mapValue(conditionSchema, "clauseFieldTypes",
                "docs/knowledge/schema.yaml");
        for (String clauseField : new TreeSet<>(fieldTypes.keySet())) {
            validateFieldType(schema, recordId, field + "." + clauseField, expression.get(clauseField),
                    String.valueOf(fieldTypes.get(clauseField)));
        }
        String valueType = conditionValueType(expression.get("value"));
        Set<String> allowedValueTypes = new TreeSet<>(stringList(conditionSchema.get("clauseValueTypes"),
                "docs/knowledge/schema.yaml", "conditionExpression.clauseValueTypes"));
        if (!allowedValueTypes.contains(valueType)) {
            throw invalid(recordId, field + ".value", "type " + valueType + " is not one of " + allowedValueTypes);
        }
    }

    private static String conditionValueType(Object value) {
        if (value == null) {
            return "null";
        }
        if (value instanceof String) {
            return "string";
        }
        if (value instanceof Byte || value instanceof Short || value instanceof Integer
                || value instanceof Long || value instanceof BigInteger) {
            return "integer";
        }
        if (value instanceof Boolean) {
            return "boolean";
        }
        if (value instanceof List<?>) {
            return "array";
        }
        return typeName(value);
    }

    private static void validateRuleProjections(Map<String, Object> schema, List<Map<String, Object>> rules) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> projectionRules = mapValue(schema, "projectionRules", schemaId);
        Map<String, Object> maturity = mapValue(projectionRules, "maturityInvariants", schemaId);
        Map<String, Object> nonVerified = mapValue(maturity, "nonVerified", schemaId);
        Map<String, Object> verified = mapValue(maturity, "verified", schemaId);
        Map<String, Object> deprecated = mapValue(maturity, "deprecated", schemaId);
        for (Map<String, Object> rule : rules) {
            String id = idOf(rule);
            String status = requiredString(rule, "status", id);
            String visibility = requiredString(rule, "visibility", id);
            if (stringList(nonVerified.get("statuses"), schemaId, "nonVerified.statuses").contains(status)) {
                String requiredVisibility = requiredString(nonVerified, "requiredVisibility", schemaId);
                if (!requiredVisibility.equals(visibility)) {
                    throw invalid(id, "visibility", "status " + status + " requires " + requiredVisibility);
                }
            }
            if (stringList(verified.get("statuses"), schemaId, "verified.statuses").contains(status)) {
                validateRequiredAndNonEmpty(rule, verified, "verified");
            }
            if (stringList(deprecated.get("statuses"), schemaId, "deprecated.statuses").contains(status)
                    && stringList(deprecated.get("forbiddenVisibilities"), schemaId,
                    "deprecated.forbiddenVisibilities").contains(visibility)) {
                throw invalid(id, "visibility", "deprecated records cannot use " + visibility);
            }
            for (String projection : List.of("customer", "runtime")) {
                Map<String, Object> policy = mapValue(projectionRules, projection, schemaId);
                if (!stringList(policy.get("acceptedVisibilities"), schemaId,
                        projection + ".acceptedVisibilities").contains(visibility)) {
                    continue;
                }
                if (!stringList(policy.get("allowedStatuses"), schemaId,
                        projection + ".allowedStatuses").contains(status)) {
                    throw invalid(id, "status", projection + " projection does not allow status " + status);
                }
                validateRequiredAndNonEmpty(rule, policy, projection + " projection");
            }
        }
    }

    private static void validateExecutionContracts(
            Map<String, Object> schema,
            SchemaStructure structure,
            RecordIndex records
    ) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> projectionRules = mapValue(schema, "projectionRules", schemaId);
        Map<String, Object> policy = mapValue(projectionRules, "executionContract", schemaId);
        Map<String, Object> referencedBy = mapValue(policy, "referencedBy", schemaId);
        String targetType = requiredString(referencedBy, "targetRecordType", schemaId);
        if (!structure.recordTypes().containsKey(targetType)) {
            throw invalid(schemaId, "projectionRules.executionContract.referencedBy.targetRecordType",
                    "unknown record type " + targetType);
        }
        String requiredStatus = requiredString(policy, "requiredStatus", schemaId);
        Set<String> acceptedVisibilities = new TreeSet<>(stringList(policy.get("acceptedVisibilities"), schemaId,
                "projectionRules.executionContract.acceptedVisibilities"));
        for (Map<String, Object> contract : records.records(targetType)) {
            String id = idOf(contract);
            if (!requiredStatus.equals(contract.get("status"))) {
                throw invalid(id, "status", "execution contract requires " + requiredStatus);
            }
            if (!acceptedVisibilities.contains(contract.get("visibility"))) {
                throw invalid(id, "visibility", "execution contract must be one of " + acceptedVisibilities);
            }
            validateRequiredAndNonEmpty(contract, policy, "execution contract");
        }
    }

    private static void validateRequiredAndNonEmpty(
            Map<String, Object> record,
            Map<String, Object> policy,
            String policyName
    ) {
        String id = idOf(record);
        for (String field : stringList(policy.get("requiredFields"), "docs/knowledge/schema.yaml",
                policyName + ".requiredFields")) {
            if (!record.containsKey(field)) {
                throw invalid(id, field, "is required for " + policyName);
            }
        }
        for (String field : stringList(policy.get("nonEmptyFields"), "docs/knowledge/schema.yaml",
                policyName + ".nonEmptyFields")) {
            Object value = record.get(field);
            if (isEmpty(value)) {
                throw invalid(id, field, "must be non-empty for " + policyName);
            }
        }
    }

    private static boolean isEmpty(Object value) {
        return value == null
                || value instanceof String string && string.isBlank()
                || value instanceof Collection<?> collection && collection.isEmpty()
                || value instanceof Map<?, ?> map && map.isEmpty();
    }

    private static List<Map<String, Object>> recordList(Object value, String ownerId, String field) {
        if (!(value instanceof List<?> list)) {
            throw invalid(ownerId, field, "must be an array of records");
        }
        List<Map<String, Object>> records = new ArrayList<>(list.size());
        for (int index = 0; index < list.size(); index++) {
            records.add(stringKeyedMapValue(list.get(index), ownerId, field + "[" + index + "]"));
        }
        return records;
    }

    private static Map<String, String> stringMapping(Map<String, Object> owner, String field, String ownerId) {
        Map<String, Object> raw = mapValue(owner, field, ownerId);
        Map<String, String> result = new TreeMap<>();
        for (String key : new TreeSet<>(raw.keySet())) {
            Object value = raw.get(key);
            if (!(value instanceof String stringValue) || stringValue.isBlank()) {
                throw invalid(ownerId, field + "." + key, "must be a non-empty string");
            }
            result.put(key, stringValue);
        }
        return result;
    }

    private static Set<String> enumValues(Map<String, Object> schema, String enumName) {
        String schemaId = "docs/knowledge/schema.yaml";
        Map<String, Object> enums = mapValue(schema, "enums", schemaId);
        Object rawValues = enums.get(enumName);
        if (!(rawValues instanceof List<?> values)) {
            throw invalid(schemaId, "enums." + enumName, "must be an array");
        }
        Set<String> result = new TreeSet<>();
        for (Object value : values) {
            if (value instanceof String stringValue) {
                result.add(stringValue);
            } else if (value instanceof Map<?, ?> map) {
                result.add(requiredString(stringKeyedMap(map, schemaId, "enums." + enumName), "id", schemaId));
            } else {
                throw invalid(schemaId, "enums." + enumName, "contains unsupported value " + value);
            }
        }
        return result;
    }

    private static void requireReference(Map<String, Object> record, String field, Set<String> validIds) {
        String reference = requiredString(record, field, idOf(record));
        if (!validIds.contains(reference)) {
            throw invalid(idOf(record), field, "reference " + reference + " does not resolve");
        }
    }

    private static Set<String> ids(List<Map<String, Object>> records) {
        Set<String> ids = new TreeSet<>();
        records.forEach(record -> ids.add(idOf(record)));
        return ids;
    }

    private static String displayId(RecordRef record) {
        Object id = record.data().get("id");
        return id instanceof String stringId && !stringId.isBlank() ? stringId : record.sourcePath();
    }

    private static String idOf(Map<String, Object> record) {
        Object id = record.get("id");
        if (!(id instanceof String stringId) || stringId.isBlank()) {
            throw invalid("<missing-id>", "id", "must be a non-empty string");
        }
        return stringId;
    }

    private static String requiredString(Map<String, Object> map, String field, String id) {
        Object value = map.get(field);
        if (!(value instanceof String stringValue)) {
            throw invalid(id, field, "must be a string but was " + typeName(value));
        }
        return stringValue;
    }

    private static boolean requiredBoolean(Map<String, Object> map, String field, String id) {
        Object value = map.get(field);
        if (!(value instanceof Boolean booleanValue)) {
            throw invalid(id, field, "must be a boolean but was " + typeName(value));
        }
        return booleanValue;
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

    private static String typeName(Object value) {
        return value == null ? "null" : value.getClass().getSimpleName();
    }

    private static Set<String> duplicates(List<String> values) {
        Set<String> seen = new HashSet<>();
        Set<String> duplicates = new TreeSet<>();
        values.forEach(value -> {
            if (!seen.add(value)) {
                duplicates.add(value);
            }
        });
        return duplicates;
    }

    private record SchemaStructure(
            Map<String, Object> recordTypes,
            Map<String, String> collectionTypes,
            Map<String, String> nestedCollectionTypes
    ) {
    }

    private record RecordRef(String recordType, Map<String, Object> data, String sourcePath) {
    }

    private record RecordIndex(Map<String, List<RecordRef>> byType) {
        List<RecordRef> refs(String recordType) {
            return byType.getOrDefault(recordType, List.of());
        }

        List<Map<String, Object>> records(String recordType) {
            return refs(recordType).stream().map(RecordRef::data).toList();
        }

        Set<String> types() {
            return byType.keySet();
        }

        Map<String, List<Map<String, Object>>> asMaps() {
            Map<String, List<Map<String, Object>>> result = new TreeMap<>();
            byType.forEach((type, refs) -> result.put(type, refs.stream().map(RecordRef::data).toList()));
            return result;
        }
    }
}
