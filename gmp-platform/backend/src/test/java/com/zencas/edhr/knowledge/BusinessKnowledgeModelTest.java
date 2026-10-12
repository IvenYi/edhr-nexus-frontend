package com.zencas.edhr.knowledge;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BusinessKnowledgeModelTest {

    @Test
    void repositoryRootCanBeLocatedFromRootBackendAndIdeWorkingDirectories() {
        Path root = BusinessKnowledgeModelLoader.findRepositoryRoot(Path.of(System.getProperty("user.dir")));

        assertThat(BusinessKnowledgeModelLoader.findRepositoryRoot(root)).isEqualTo(root);
        assertThat(BusinessKnowledgeModelLoader.findRepositoryRoot(root.resolve("gmp-platform/backend"))).isEqualTo(root);
        assertThat(BusinessKnowledgeModelLoader.findRepositoryRoot(root.resolve("gmp-platform/backend/src/test/java")))
                .isEqualTo(root);
    }

    @Test
    void currentKnowledgeModelIsValid() throws Exception {
        BusinessKnowledgeModel model = BusinessKnowledgeModelLoader.load();

        assertThatCode(() -> BusinessKnowledgeModelValidator.validate(model)).doesNotThrowAnyException();
    }

    @Test
    void currentKnowledgeBaselineUsesTheTypedFactSchema() throws Exception {
        BusinessKnowledgeModel model = BusinessKnowledgeModelLoader.load();

        assertThat(model.schema()).containsEntry("knowledgeModelVersion", "0.3.25")
                .containsEntry("schemaVersion", "1.2.0");
    }

    @Test
    void factCatalogRejectsUnknownSemanticAlias() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = records(model, "rule").stream()
                .filter(candidate -> "rule.form-process.binding-requires-form-and-flow".equals(idOf(candidate)))
                .findFirst()
                .orElseThrow();
        Map<String, Object> clause = firstConditionClause(asMap(rule.get("condition")));
        clause.put("fact", "missing.form-process.fact");

        assertValidationFails(model, "rule.form-process.binding-requires-form-and-flow",
                "condition.fact", "does not resolve in the fact catalog");
    }

    @Test
    void factCatalogCannotBeBypassedByOmittingProfile() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = records(model, "rule").stream()
                .filter(candidate -> "rule.identity.runtime-subject-resolution".equals(idOf(candidate)))
                .findFirst()
                .orElseThrow();
        rule.remove("factCatalogProfile");
        firstConditionClause(asMap(rule.get("condition")))
                .put("fact", "missing.unprofiled.fact");

        assertValidationFails(model, "rule.identity.runtime-subject-resolution",
                "condition.fact", "does not resolve in the fact catalog");
    }

    @Test
    void factCatalogRejectsOperatorNotAllowedByFact() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = records(model, "rule").stream()
                .filter(candidate -> "rule.form-process.binding-requires-form-and-flow".equals(idOf(candidate)))
                .findFirst()
                .orElseThrow();
        Map<String, Object> clause = firstConditionClause(asMap(rule.get("condition")));
        clause.put("operator", "greater-than-or-equal");

        assertValidationFails(model, "rule.form-process.binding-requires-form-and-flow",
                "condition.operator", "is not allowed for fact");
    }

    @Test
    void factValueTypesMustComeFromTheControlledVocabulary() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> fact = firstRecord(model, "fact");
        fact.put("valueType", "number-ish");

        assertValidationFails(model, idOf(fact), "valueType", "must be one of");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("incompatibleFactOperands")
    void ruleOperandsMustMatchTheirDeclaredFacts(
            String description, String fact, String operator, Object value, String reason
    ) throws Exception {
        BusinessKnowledgeModel model = modelWithClause(fact, operator, value);

        assertValidationFails(model, idOf(firstRecord(model, "rule")), "condition.value", reason);
    }

    private static Stream<Arguments> incompatibleFactOperands() {
        return Stream.of(
                Arguments.of("string is not boolean", "audit.entityType", "equals", true, "incompatible with string"),
                Arguments.of("boolean is not text", "formBinding.required", "equals", "true", "incompatible with boolean"),
                Arguments.of("number is not numeric text", "product.productFamilyCount", "greater-than-or-equal", "2", "incompatible with integer"),
                Arguments.of("membership needs an array", "audit.entityType", "in", "PRODUCT", "requires an array"),
                Arguments.of("membership checks each item", "audit.entityType", "in", List.of("PRODUCT", true), "incompatible with string"),
                Arguments.of("enum membership is case sensitive", "productionWorkFlowVersion.status", "equals", "published", "incompatible with enum"),
                Arguments.of("enum membership checks each item", "productionWorkFlowVersion.status", "in", List.of("DRAFT", "UNKNOWN"), "incompatible with enum"),
                Arguments.of("presence expectation is not text", "audit.entityType", "is-present", "true", "requires boolean"),
                Arguments.of("custom predicate expectation is boolean", "audit.entityType", "explicitly-selected", "true", "must be boolean"),
                Arguments.of("equality does not interpret null as missing", "audit.entityType", "equals", null, "incompatible with string")
        );
    }

    @Test
    void numericComparisonRejectsStringFactEvenWhenItsOperatorIsListed() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("audit.entityType", "greater-than-or-equal", 1);

        assertValidationFails(model, idOf(factByReference(model, "audit.entityType")),
                "allowedOperators", "requires numeric valueType");
    }

    @Test
    void stringOperatorsRejectNonStringFacts() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("formBinding.required", "contains", "true");

        assertValidationFails(model, idOf(factByReference(model, "formBinding.required")),
                "allowedOperators", "requires string valueType");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("compatibleFactOperands")
    void typedComparisonsPreserveNumericAndPredicateSemantics(
            String description, String fact, String operator, Object value
    ) throws Exception {
        BusinessKnowledgeModel model = modelWithClause(fact, operator, value);

        assertThatCode(() -> BusinessKnowledgeModelValidator.validate(model)).doesNotThrowAnyException();
    }

    private static Stream<Arguments> compatibleFactOperands() {
        return Stream.of(
                Arguments.of("integer compared with decimal threshold", "product.productFamilyCount", "greater-than-or-equal", new BigDecimal("1.5")),
                Arguments.of("decimal quantity compared with fraction", "split.targetQuantity", "greater-than-or-equal", new BigDecimal("0.25")),
                Arguments.of("string presence uses boolean expectation", "audit.entityType", "is-present", true),
                Arguments.of("legacy null placeholder is retained", "audit.entityType", "is-present", null),
                Arguments.of("null predicate retains input type", "product.productFamilyCount", "is-null", true),
                Arguments.of("reference has textual identifier", "fact.form-process-binding.form-template-version-id", "equals", "template-v1"),
                Arguments.of("reference has integer identifier", "fact.form-process-binding.form-template-version-id", "equals", 42),
                Arguments.of("enum uses known value", "productionWorkFlowVersion.status", "equals", "PUBLISHED")
        );
    }

    @Test
    void explicitFactOperandsResolveIdsAndAliasesWithoutBeingTreatedAsClauses() throws Exception {
        for (String reference : List.of("fact.catalog.documentbinding-pagestart", "documentBinding.pageStart")) {
            BusinessKnowledgeModel model = modelWithClause("documentBinding.pageEnd", "greater-than-or-equal",
                    Map.of("fact", reference));

            assertThatCode(() -> BusinessKnowledgeModelValidator.validate(model)).doesNotThrowAnyException();
        }
    }

    @Test
    void explicitFactOperandsRejectUnknownReferences() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("documentBinding.pageEnd", "greater-than-or-equal",
                Map.of("fact", "fact.missing-right-operand"));

        assertValidationFails(model, idOf(firstRecord(model, "rule")),
                "condition.value.fact", "does not resolve in the fact catalog");
    }

    @Test
    void explicitFactOperandsMustHaveCompatibleTypes() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("documentBinding.pageEnd", "greater-than-or-equal",
                Map.of("fact", "audit.entityType"));

        assertValidationFails(model, idOf(firstRecord(model, "rule")),
                "condition.value", "fact-reference type string is incompatible with integer");
    }

    @Test
    void factNamesInStringsAreNeverImplicitlyDereferenced() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("documentBinding.pageEnd", "greater-than-or-equal",
                "documentBinding.pageStart");

        assertValidationFails(model, idOf(firstRecord(model, "rule")),
                "condition.value", "incompatible with integer");
    }

    @Test
    void explicitFactReferencesCannotBeUsedAsPredicateExpectations() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("audit.entityType", "is-present",
                Map.of("fact", "audit.entityType"));

        assertValidationFails(model, idOf(firstRecord(model, "rule")),
                "condition.value", "fact-reference is not supported");
    }

    @Test
    void factReferenceObjectsMustUseTheExactOperandShape() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("documentBinding.pageEnd", "greater-than-or-equal",
                Map.of("fact", "documentBinding.pageStart", "fallback", 1));

        assertValidationFails(model, idOf(firstRecord(model, "rule")), "condition.value", "is not one of");
    }

    @Test
    void numericOperandsMustBeFinite() throws Exception {
        BusinessKnowledgeModel model = modelWithClause("split.targetQuantity", "greater-than-or-equal", Double.NaN);

        assertValidationFails(model, idOf(firstRecord(model, "rule")), "condition.value", "is not one of");
    }

    @Test
    void enumFactsRequireAnExplicitNonEmptyValueSet() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> fact = factByReference(model, "productionWorkFlowVersion.status");
        fact.put("enumValues", List.of());

        assertValidationFails(model, idOf(fact), "enumValues", "unique non-empty enum values");
    }

    @Test
    void aliasesCannotShadowAnotherFactIdInEitherCollectionOrder() throws Exception {
        for (boolean reverse : List.of(false, true)) {
            BusinessKnowledgeModel model = mutableKnowledgeModel();
            List<Map<String, Object>> facts = records(model, "fact");
            Map<String, Object> first = facts.getFirst();
            Map<String, Object> last = facts.getLast();
            Map<String, Object> owner = reverse ? last : first;
            Map<String, Object> target = reverse ? first : last;
            listValue(owner, "aliases").add(idOf(target));

            assertThatThrownBy(() -> BusinessKnowledgeModelValidator.validate(model))
                    .isInstanceOf(KnowledgeValidationException.class)
                    .hasMessageContaining("duplicates fact")
                    .hasMessageContaining(idOf(owner))
                    .hasMessageContaining(idOf(target));
        }
    }

    @Test
    void factsRequireProvenanceFields() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> fact = firstRecord(model, "fact");
        fact.remove("sourceLocator");

        assertValidationFails(model, idOf(fact), "sourceLocator", "must be a string");
    }

    @Test
    void implementationAnchorsRejectUnknownProvenanceReviewStatus() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> anchor = firstRecord(model, "implementationAnchor");
        anchor.put("reviewStatus", "unverified");

        assertValidationFails(model, idOf(anchor), "reviewStatus", "must be one of");
    }

    @Test
    void topLevelCollectionsAreDiscoveredFromSchemaMappings() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> collectionTypes = mapValue(model.schema(), "collectionTypes");
        collectionTypes.put("vocabulary", collectionTypes.remove("terms"));
        Map<String, Object> glossary = document(model, "docs/knowledge/glossary.yaml");
        glossary.put("vocabulary", glossary.remove("terms"));

        assertThatCode(() -> BusinessKnowledgeModelValidator.validate(model)).doesNotThrowAnyException();
    }

    @Test
    void nestedCollectionsAreDiscoveredFromSchemaMappings() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        for (Map<String, Object> decision : records(model, "decision")) {
            decision.put("statements", decision.remove("decisionStatements"));
        }
        Map<String, Object> nestedTypes = mapValue(model.schema(), "nestedCollectionTypes");
        nestedTypes.put("statements", nestedTypes.remove("decisionStatements"));
        Map<String, Object> decisionDefinition = recordType(model, "decision");
        replaceString(listValue(decisionDefinition, "requiredFields"), "decisionStatements", "statements");
        Map<String, Object> decisionFieldTypes = mapValue(decisionDefinition, "fieldTypes");
        decisionFieldTypes.put("statements", decisionFieldTypes.remove("decisionStatements"));

        assertThatCode(() -> BusinessKnowledgeModelValidator.validate(model)).doesNotThrowAnyException();
    }

    @Test
    void schemaCollectionMappingsMustCoverEveryRecordType() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        mapValue(model.schema(), "collectionTypes").remove("terms");

        assertValidationFails(model, "docs/knowledge/schema.yaml", "collectionTypes", "missing mappings");
    }

    @Test
    void schemaCollectionMappingsRejectUnknownRecordTypes() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        mapValue(model.schema(), "collectionTypes").put("terms", "missingType");

        assertValidationFails(model, "docs/knowledge/schema.yaml", "collectionTypes", "unknown record type targets");
    }

    @Test
    void schemaCollectionMappingsRejectDuplicateTargetsDeterministically() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        mapValue(model.schema(), "collectionTypes").put("termAliases", "term");

        assertValidationFailsExactly(model,
                "Record docs/knowledge/schema.yaml field 'collectionTypes': record types mapped more than once [term]");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidDescriptors")
    void schemaRejectsInvalidFieldTypeDescriptors(
            String description,
            String field,
            String descriptor,
            String reason
    ) throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        mapValue(recordType(model, "term"), "fieldTypes").put(field, descriptor);

        assertValidationFails(model, "docs/knowledge/schema.yaml", "recordTypes.term.fieldTypes." + field, reason);
    }

    private static Stream<Arguments> invalidDescriptors() {
        return Stream.of(
                Arguments.of("unknown literal", "name", "decimal", "unsupported descriptor"),
                Arguments.of("unknown enum registry", "status", "enum:missingEnums", "unknown enum"),
                Arguments.of("unknown array record", "aliases", "array<missingRecord>", "unknown record type")
        );
    }

    @Test
    void schemaRejectsNestedDescriptorMappingMismatch() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        mapValue(recordType(model, "decision"), "fieldTypes")
                .put("decisionStatements", "array<acceptanceScenario>");

        assertValidationFails(model, "docs/knowledge/schema.yaml",
                "recordTypes.decision.fieldTypes.decisionStatements", "must target acceptanceScenario");
    }

    @Test
    void schemaIdPrefixesMustCoverEveryRecordType() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        mapValue(model.schema(), "idPrefixes").remove("term");

        assertValidationFails(model, "docs/knowledge/schema.yaml", "idPrefixes", "missing [term]");
    }

    @Test
    void unknownTopLevelCollectionsReportTheirDocumentAndSortedAllowedCollections() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        document(model, "docs/knowledge/glossary.yaml").put("zeta", List.of());

        assertValidationFailsExactly(model,
                "Record docs/knowledge/glossary.yaml field 'zeta': unknown top-level collection; allowed collections "
                        + "[concepts, decisions, evidence, executionContracts, facts, implementationAnchors, questions, relations, rules, terms]");
    }

    @Test
    void malformedTopLevelCollectionsReportTheirDocument() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        document(model, "docs/knowledge/glossary.yaml").put("terms", "not-a-list");

        assertValidationFails(model, "docs/knowledge/glossary.yaml", "terms", "array of records");
    }

    @Test
    void unknownNestedRecordCollectionsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> decision = firstRecord(model, "decision");
        decision.put("unknownChildren", List.of(Map.of("id", "unknown.child")));

        assertValidationFails(model, idOf(decision), "unknownChildren",
                "collection field is not declared by record type decision");
    }

    @Test
    void unknownEmptyCollectionsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> term = firstRecord(model, "term");
        term.put("unknownEmpty", List.of());

        assertValidationFails(model, idOf(term), "unknownEmpty",
                "collection field is not declared by record type term");
    }

    @Test
    void unknownScalarCollectionsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> term = firstRecord(model, "term");
        term.put("unknownScalars", List.of("value"));

        assertValidationFails(model, idOf(term), "unknownScalars",
                "collection field is not declared by record type term");
    }

    @Test
    void knownNestedCollectionsCannotAppearOnUndeclaredParentRecordTypes() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> term = firstRecord(model, "term");
        term.put("acceptanceScenarios", List.of());

        assertValidationFails(model, idOf(term), "acceptanceScenarios",
                "collection field is not declared by record type term");
    }

    @Test
    void yamlParserErrorsContainTheRepositoryRelativeFilePath(@TempDir Path tempDirectory) throws Exception {
        Path repositoryRoot = tempDirectory.resolve("repository");
        Path brokenYaml = repositoryRoot.resolve("docs/knowledge/broken.yaml");
        Files.createDirectories(brokenYaml.getParent());
        Files.writeString(brokenYaml, "knowledgeModelVersion: [unterminated", StandardCharsets.UTF_8);

        assertThatThrownBy(() -> BusinessKnowledgeModelLoader.load(repositoryRoot))
                .isInstanceOf(KnowledgeValidationException.class)
                .hasMessageContaining("docs/knowledge/broken.yaml")
                .hasMessageContaining("invalid YAML");
    }

    @Test
    void duplicateIdsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        List<Map<String, Object>> concepts = records(model, "concept");
        String duplicateId = idOf(concepts.getFirst());
        concepts.get(1).put("id", duplicateId);

        assertValidationFails(model, duplicateId, "id", "duplicate");
    }

    @Test
    void nestedDuplicateIdsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        List<Map<String, Object>> scenarios = records(model, "acceptanceScenario");
        String duplicateId = idOf(scenarios.getFirst());
        scenarios.get(1).put("id", duplicateId);

        assertValidationFails(model, duplicateId, "id", "duplicate");
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("prefixMutations")
    void recordIdsMustUseSchemaPrefixes(String description, String recordType) throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> record = firstRecord(model, recordType);
        record.put("id", "wrong-prefix-id");

        assertValidationFails(model, "wrong-prefix-id", "id", "requires prefix");
    }

    private static Stream<Arguments> prefixMutations() {
        return Stream.of(
                Arguments.of("top-level record prefix", "term"),
                Arguments.of("nested record prefix", "acceptanceScenario")
        );
    }

    @Test
    void executionContractIdsUseSchemaPrefixes() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> contract = addValidExecutionContract(model);
        contract.put("id", "contract.invalid");

        assertValidationFails(model, "contract.invalid", "id", "requires prefix execution.");
    }

    @Test
    void danglingTermIdsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> concept = firstRecord(model, "concept");
        concept.put("termId", "term.does-not-exist");

        assertValidationFails(model, idOf(concept), "termId", "does not resolve");
    }

    @Test
    void danglingEvidenceIdsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("evidenceIds", List.of("evidence.does-not-exist"));

        assertValidationFails(model, idOf(rule), "evidenceIds", "does not resolve");
    }

    @Test
    void executionContractReferencesMustResolveEvenForNonVerifiedRules() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("executionContractId", "execution.does-not-exist");

        assertValidationFails(model, idOf(rule), "executionContractId", "does not resolve");
    }

    @Test
    void verifiedRulesCanReferenceValidRegisteredExecutionContracts() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> contract = addValidExecutionContract(model);
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "verified");
        rule.put("executionContractId", idOf(contract));

        assertThatCode(() -> BusinessKnowledgeModelValidator.validate(model)).doesNotThrowAnyException();
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidExecutionContracts")
    void referencedExecutionContractsMustSatisfySchemaPolicy(
            String description,
            String field,
            Object value,
            String reason
    ) throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> contract = addValidExecutionContract(model);
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "verified");
        rule.put("executionContractId", idOf(contract));
        contract.put(field, value);

        assertValidationFails(model, idOf(contract), field, reason);
    }

    private static Stream<Arguments> invalidExecutionContracts() {
        return Stream.of(
                Arguments.of("contract status", "status", "implemented", "requires verified"),
                Arguments.of("contract visibility", "visibility", "internal", "must be one of"),
                Arguments.of("contract evidence", "evidenceIds", List.of(), "non-empty")
        );
    }

    @Test
    void invalidStatusesAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "released");

        assertValidationFails(model, idOf(rule), "status", "must be one of");
    }

    @Test
    void invalidCardinalitiesAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> relation = firstRecord(model, "relation");
        relation.put("cardinality", "one-to-one");

        assertValidationFails(model, idOf(relation), "cardinality", "must be one of");
    }

    @Test
    void invalidConditionOperatorsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        firstConditionClause(mapValue(rule, "condition")).put("operator", "matches");

        assertValidationFails(model, idOf(rule), "condition.all[0].operator", "must be one of");
    }

    @Test
    void conditionLeavesRejectAdditionalFields() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        firstConditionClause(mapValue(rule, "condition")).put("comment", "not allowed");

        assertValidationFails(model, idOf(rule), "condition", "exactly fields");
    }

    @Test
    void conditionGroupsRejectAdditionalFields() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        mapValue(rule, "condition").put("comment", "not allowed");

        assertValidationFails(model, idOf(rule), "condition", "exactly one key");
    }

    @Test
    void conditionGroupsMustBeNonEmpty() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("condition", new LinkedHashMap<>(Map.of("all", List.of())));

        assertValidationFails(model, idOf(rule), "condition.all", "non-empty array");
    }

    @Test
    void conditionNotGroupsRequireOneExpression() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("condition", new LinkedHashMap<>(Map.of("not", List.of())));

        assertValidationFails(model, idOf(rule), "condition.not", "must be a map");
    }

    @Test
    void conditionValuesMustUseSchemaValueTypes() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        firstConditionClause(mapValue(rule, "condition")).put("value", Map.of("unsupported", true));

        assertValidationFails(model, idOf(rule), "condition", "is not one of");
    }

    @Test
    void invalidRuleResultTypesAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        mapValue(rule, "result").put("type", "unknown-result");

        assertValidationFails(model, idOf(rule), "result.type", "must be one of");
    }

    @Test
    void implementedRecordsCannotEnterCustomerProjection() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "implemented");
        rule.put("visibility", "customer");

        assertValidationFails(model, idOf(rule), "visibility", "requires internal");
    }

    @Test
    void verifiedInternalRecordsRequireExecutionContracts() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "verified");
        rule.remove("executionContractId");

        assertValidationFails(model, idOf(rule), "executionContractId", "required");
    }

    @Test
    void verifiedRuntimeRecordsRequireEvidence() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> contract = addValidExecutionContract(model);
        Map<String, Object> rule = firstRecord(model, "rule");
        rule.put("status", "verified");
        rule.put("visibility", "runtime");
        rule.put("executionContractId", idOf(contract));
        rule.put("evidenceIds", List.of());

        assertValidationFails(model, idOf(rule), "evidenceIds", "non-empty");
    }

    @Test
    void missingEvidencePathsAreRejected() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> evidence = firstRecord(model, "evidence");
        evidence.put("path", "does/not/exist.java");

        assertValidationFails(model, idOf(evidence), "path", "does not exist");
    }

    @Test
    void absoluteEvidencePathsAreRejectedEvenWhenTheyExist() throws Exception {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> evidence = firstRecord(model, "evidence");
        String originalPath = String.valueOf(evidence.get("path"));
        evidence.put("path", model.repositoryRoot().resolve(originalPath).toString());

        assertValidationFails(model, idOf(evidence), "path", "repository-relative");
    }

    @Test
    void normalizedEvidencePathsCannotEscapeRepository(@TempDir Path tempDirectory) throws Exception {
        Path repositoryRoot = Files.createDirectory(tempDirectory.resolve("repository"));
        Files.writeString(tempDirectory.resolve("outside.txt"), "outside", StandardCharsets.UTF_8);
        BusinessKnowledgeModel model = isolatedEvidencePathModel(repositoryRoot, "../outside.txt");
        Map<String, Object> evidence = firstRecord(model, "evidence");

        assertValidationFails(model, idOf(evidence), "path", "normalized path escapes repository");
    }

    @Test
    void realEvidencePathsCannotEscapeRepositoryThroughSymlinks(@TempDir Path tempDirectory) throws Exception {
        Path repositoryRoot = Files.createDirectory(tempDirectory.resolve("repository"));
        Path outside = Files.writeString(tempDirectory.resolve("outside.txt"), "outside", StandardCharsets.UTF_8);
        Path link = repositoryRoot.resolve("linked-evidence.txt");
        try {
            Files.createSymbolicLink(link, outside);
        } catch (IOException | UnsupportedOperationException exception) {
            Assumptions.assumeTrue(false, "Symbolic links are unavailable: " + exception.getMessage());
        }
        BusinessKnowledgeModel model = isolatedEvidencePathModel(repositoryRoot, "linked-evidence.txt");
        Map<String, Object> evidence = firstRecord(model, "evidence");

        assertValidationFails(model, idOf(evidence), "path", "real path escapes repository");
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
        BusinessKnowledgeModel model = mutableKnowledgeModel();
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

    private static BusinessKnowledgeModel isolatedEvidencePathModel(Path repositoryRoot, String evidencePath)
            throws IOException {
        BusinessKnowledgeModel model = mutableKnowledgeModel().withRepositoryRoot(repositoryRoot);
        listValue(mapValue(model.schema(), "enums"), "evidenceTypes").add("escape-test");
        mapValue(model.schema(), "evidencePathPolicy").put("mustExistForTypes", List.of("escape-test"));
        Map<String, Object> evidence = firstRecord(model, "evidence");
        evidence.put("type", "escape-test");
        evidence.put("path", evidencePath);
        return model;
    }

    private static Map<String, Object> addValidExecutionContract(BusinessKnowledgeModel model) {
        String evidenceId = idOf(firstRecord(model, "evidence"));
        Map<String, Object> contract = new LinkedHashMap<>();
        contract.put("id", "execution.test");
        contract.put("name", "Test execution contract");
        contract.put("status", "verified");
        contract.put("visibility", "runtime");
        contract.put("actionType", "test-action");
        contract.put("handler", "test-handler");
        contract.put("evidenceIds", List.of(evidenceId));
        listValue(document(model, "docs/knowledge/execution-contracts.yaml"), "executionContracts").add(contract);
        return contract;
    }

    private static BusinessKnowledgeModel mutableKnowledgeModel() throws IOException {
        return BusinessKnowledgeModelLoader.load().deepCopy();
    }

    private static BusinessKnowledgeModel modelWithClause(String reference, String operator, Object value)
            throws IOException {
        BusinessKnowledgeModel model = mutableKnowledgeModel();
        Map<String, Object> fact = factByReference(model, reference);
        List<Object> operators = listValue(fact, "allowedOperators");
        if (!operators.contains(operator)) {
            operators.add(operator);
        }
        Map<String, Object> clause = new LinkedHashMap<>();
        clause.put("fact", reference);
        clause.put("operator", operator);
        clause.put("value", value);
        firstRecord(model, "rule").put("condition", clause);
        return model;
    }

    private static Map<String, Object> factByReference(BusinessKnowledgeModel model, String reference) {
        return records(model, "fact").stream()
                .filter(fact -> reference.equals(idOf(fact)) || listValue(fact, "aliases").contains(reference))
                .findFirst().orElseThrow();
    }

    private static Map<String, Object> recordType(BusinessKnowledgeModel model, String recordType) {
        return mapValue(mapValue(model.schema(), "recordTypes"), recordType);
    }

    private static Map<String, Object> firstRecord(BusinessKnowledgeModel model, String recordType) {
        List<Map<String, Object>> records = records(model, recordType);
        assertThat(records).as("records of type %s", recordType).isNotEmpty();
        return records.getFirst();
    }

    private static List<Map<String, Object>> records(BusinessKnowledgeModel model, String recordType) {
        return BusinessKnowledgeModelValidator.records(model).get(recordType);
    }

    private static Map<String, Object> document(BusinessKnowledgeModel model, String path) {
        Map<String, Object> document = model.documents().get(Path.of(path));
        assertThat(document).as("document %s", path).isNotNull();
        return document;
    }

    private static Map<String, Object> firstConditionClause(Map<String, Object> expression) {
        for (String group : List.of("all", "any")) {
            if (expression.get(group) instanceof List<?> children && !children.isEmpty()) {
                return firstConditionClause(asMap(children.getFirst()));
            }
        }
        if (expression.get("not") instanceof Map<?, ?> child) {
            return firstConditionClause(asMap(child));
        }
        return expression;
    }

    private static void assertValidationFails(
            BusinessKnowledgeModel model,
            String recordId,
            String field,
            String reason
    ) {
        assertThatThrownBy(() -> BusinessKnowledgeModelValidator.validate(model))
                .isInstanceOf(KnowledgeValidationException.class)
                .hasMessageContaining(recordId)
                .hasMessageContaining(field)
                .hasMessageContaining(reason);
    }

    private static void assertValidationFailsExactly(BusinessKnowledgeModel model, String message) {
        assertThatThrownBy(() -> BusinessKnowledgeModelValidator.validate(model))
                .isInstanceOf(KnowledgeValidationException.class)
                .hasMessage(message);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> mapValue(Map<String, Object> map, String field) {
        return (Map<String, Object>) map.get(field);
    }

    @SuppressWarnings("unchecked")
    private static List<Object> listValue(Map<String, Object> map, String field) {
        return (List<Object>) map.get(field);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        return (Map<String, Object>) value;
    }

    private static void replaceString(List<Object> values, String oldValue, String newValue) {
        int index = values.indexOf(oldValue);
        assertThat(index).as("index of %s", oldValue).isNotNegative();
        values.set(index, newValue);
    }

    private static String idOf(Map<String, Object> record) {
        return String.valueOf(record.get("id"));
    }
}
