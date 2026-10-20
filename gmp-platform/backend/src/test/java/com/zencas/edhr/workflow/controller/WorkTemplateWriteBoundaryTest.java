package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.template.entity.FormTemplateVersion;
import com.zencas.edhr.template.repository.FormTemplateVersionRepository;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.repository.WorkflowBindingRuleRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.service.FormFillSettingsService;
import com.zencas.edhr.workflow.service.FormProcessReferenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** New write commands must reject retired shapes without interpreting or repairing old sources. */
class WorkTemplateWriteBoundaryTest {
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
    private final WorkflowDefinitionRepository definitions = mock(WorkflowDefinitionRepository.class);
    private final WorkflowDefinitionVersionRepository versions = mock(WorkflowDefinitionVersionRepository.class);
    private final AuditEventRepository audits = mock(AuditEventRepository.class);
    private final FormProcessReferenceService references = mock(FormProcessReferenceService.class);
    private final FormTemplateVersionRepository forms = mock(FormTemplateVersionRepository.class);
    private final SnowflakeIdGenerator ids = mock(SnowflakeIdGenerator.class);
    private WorkTemplateController controller;
    private WorkflowDefinitionVersion draft;
    private WorkflowDefinitionVersion source;

    enum Command { SAVE, CREATE_DRAFT, OVERWRITE_DRAFT, COPY_NEW_DRAFT, PUBLISH }

    @BeforeEach
    void setup() {
        controller = new WorkTemplateController(definitions, versions, mock(WorkflowBindingRuleRepository.class),
                audits, forms, references, new FormFillSettingsService(mapper, versions, definitions, forms), ids, mapper);
        WorkflowDefinition work = WorkflowDefinition.builder().id(101L).type("WORK").build();
        when(definitions.findByIdForUpdate(101L)).thenReturn(Optional.of(work));
        draft = version(201L, "DRAFT", "[]");
        source = version(202L, "PUBLISHED", "[]");
        when(versions.findById(201L)).thenReturn(Optional.of(draft));
        when(versions.findById(202L)).thenReturn(Optional.of(source));
        when(versions.findByDefinitionIdOrderByVersionNumberDesc(101L)).thenReturn(List.of(source));
        when(versions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        AtomicLong sequence = new AtomicLong(800L);
        when(ids.nextId()).thenAnswer(invocation -> sequence.getAndIncrement());
        when(forms.findById(702L)).thenReturn(Optional.of(FormTemplateVersion.builder().id(702L).status("DRAFT").build()));
        when(versions.findById(901L)).thenReturn(Optional.of(WorkflowDefinitionVersion.builder().id(901L)
                .definitionId(902L).status("PUBLISHED").nodesJson("[{\"data\":{\"kind\":\"START\"}},{\"data\":{\"kind\":\"END\"}}]").build()));
        when(definitions.findById(902L)).thenReturn(Optional.of(WorkflowDefinition.builder().id(902L).type("FORM_PROCESS").build()));
    }

    static Stream<Arguments> unsupportedWrites() {
        return Stream.of(Command.values()).flatMap(command ->
                Stream.of("completionCondition", "conditionRule", "conditionFieldCatalogVersion",
                        "conditionFieldSnapshot", "conditionExpression").flatMap(key ->
                        Stream.of("null", "\"retired\"", "{\"all\":[]}")
                                .map(value -> Arguments.of(command, key, value))));
    }

    @ParameterizedTest(name = "{0} rejects {1}={2}")
    @MethodSource("unsupportedWrites")
    void rejectsRetiredFieldsBeforeChangingGraphReferencesOrAudit(Command command, String key, String value) throws Exception {
        String kind = "completionCondition".equals(key) ? "FORM" : "CONDITION";
        ArrayNode graph = graph(kind);
        ((ObjectNode) graph.get(1).path("data").path("config")).set(key, mapper.readTree(value));
        prepare(command, graph);
        String sourceBefore = source.getNodesJson();
        String draftBefore = draft.getNodesJson();
        String sourceEdgesBefore = source.getEdgesJson();
        String draftEdgesBefore = draft.getEdgesJson();
        String message = "FORM".equals(kind) ? "不支持完成条件配置" : "条件节点包含不支持的旧配置字段";

        assertThatThrownBy(() -> execute(command, graph)).isInstanceOf(BusinessException.class).hasMessageContaining(message);

        assertThat(source.getNodesJson()).isEqualTo(sourceBefore);
        assertThat(source.getEdgesJson()).isEqualTo(sourceEdgesBefore);
        assertThat(source.getStatus()).isEqualTo("PUBLISHED");
        assertThat(source.getIsCurrent()).isTrue();
        assertThat(draft.getNodesJson()).isEqualTo(draftBefore);
        assertThat(draft.getEdgesJson()).isEqualTo(draftEdgesBefore);
        assertThat(draft.getStatus()).isEqualTo("DRAFT");
        assertThat(draft.getIsCurrent()).isFalse();
        verify(versions, never()).save(any());
        verify(versions, never()).flush();
        verify(references, never()).rebuildForWorkVersion(any());
        verify(audits, never()).save(any());
    }

    static Stream<Arguments> incompleteDraftWrites() {
        return Stream.of(Command.SAVE, Command.CREATE_DRAFT, Command.OVERWRITE_DRAFT, Command.COPY_NEW_DRAFT)
                .flatMap(command -> Stream.of("FORM", "CONDITION").map(kind -> Arguments.of(command, kind)));
    }

    @ParameterizedTest(name = "{0} preserves incomplete {1}")
    @MethodSource("incompleteDraftWrites")
    void stillWritesIncompleteCurrentShapesAndUnrelatedExtensionKeys(Command command, String kind) throws Exception {
        ArrayNode graph = graph(kind);
        ObjectNode config = (ObjectNode) graph.get(1).path("data").path("config");
        config.putObject("customerExtension").put("note", "keep exactly");
        if ("FORM".equals(kind)) config.remove(List.of("fillMode", "formTemplateVersionId", "formProcessVersionId"));
        prepare(command, graph);
        source.setEdgesJson("[]");

        var result = execute(command, graph);

        assertThat(mapper.readTree(result.getNodesJson())).isEqualTo(graph);
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        assertThat(result.getEdgesJson()).isEqualTo("[]");
        assertThat(source.getNodesJson()).isEqualTo(graph.toString());
        assertThat(source.getStatus()).isEqualTo("PUBLISHED");
        verify(references).rebuildForWorkVersion(result);
        verify(audits).save(any());
    }

    @Test
    void incompleteCanonicalConditionStillFailsOnlyWhenPublished() {
        ArrayNode graph = graph("CONDITION");
        prepare(Command.PUBLISH, graph);
        assertThatThrownBy(() -> execute(Command.PUBLISH, graph)).hasMessageContaining("尚未配置结构化条件规则");
        verify(versions, never()).save(any());
        verify(audits, never()).save(any());
    }

    @Test
    void currentFormPublishesAndNextDraftKeepsTheExactGraph() throws Exception {
        ArrayNode graph = graph("FORM");
        prepare(Command.PUBLISH, graph);
        var published = execute(Command.PUBLISH, graph);
        assertThat(published.getStatus()).isEqualTo("PUBLISHED");
        assertThat(published.getNodesJson()).isEqualTo(graph.toString());
        var saved = org.mockito.ArgumentCaptor.forClass(WorkflowDefinitionVersion.class);
        verify(versions, atLeastOnce()).save(saved.capture());
        assertThat(saved.getAllValues()).anySatisfy(next -> {
            assertThat(next.getStatus()).isEqualTo("DRAFT");
            assertThat(next.getNodesJson()).isEqualTo(published.getNodesJson());
            assertThat(next.getEdgesJson()).isEqualTo(published.getEdgesJson());
        });
    }

    private void prepare(Command command, ArrayNode graph) {
        source.setNodesJson(graph.toString());
        boolean condition = "CONDITION".equals(graph.get(1).path("data").path("kind").asText());
        String graphEdges = condition ? edges() : "[{\"source\":\"start\",\"target\":\"step\"},{\"source\":\"step\",\"target\":\"end\"}]";
        source.setEdgesJson(graphEdges);
        draft.setEdgesJson(graphEdges);
        if (command == Command.PUBLISH) draft.setNodesJson(graph.toString());
        when(versions.findByDefinitionIdAndStatus(101L, "DRAFT")).thenReturn(
                command == Command.OVERWRITE_DRAFT ? Optional.of(draft) : Optional.empty());
    }

    private WorkflowDefinitionVersion execute(Command command, JsonNode graph) {
        return switch (command) {
            case SAVE -> controller.saveGraph(101L, 201L, Map.of("nodes", graph, "edges", List.of())).getData();
            case CREATE_DRAFT -> controller.createDraftVersion(101L).getData();
            case OVERWRITE_DRAFT -> controller.copyPublishedVersionToDraft(101L, 202L, false).getData();
            case COPY_NEW_DRAFT -> controller.copyPublishedVersionToDraft(101L, 202L, true).getData();
            case PUBLISH -> controller.publishVersion(101L, 201L).getData();
        };
    }

    private ArrayNode graph(String kind) {
        ArrayNode nodes = mapper.createArrayNode();
        nodes.addObject().put("id", "start").putObject("data").put("kind", "START");
        ObjectNode config = nodes.addObject().put("id", "step").putObject("data").put("kind", kind).putObject("config");
        if ("FORM".equals(kind)) {
            config.put("fillMode", "PROCESS").put("formTemplateVersionId", "702").put("formProcessVersionId", "901");
        } else {
            config.putArray("conditionBranches").addObject().put("id", "condition-1").put("name", "条件 1").putNull("conditionRule");
            config.putObject("conditionDefaultBranch").put("id", "condition-default").put("name", "否则");
        }
        nodes.addObject().put("id", "end").putObject("data").put("kind", "END");
        return nodes;
    }

    private WorkflowDefinitionVersion version(long id, String status, String nodes) {
        return WorkflowDefinitionVersion.builder().id(id).definitionId(101L).versionNumber(id == 201L ? 2 : 1)
                .status(status).isCurrent("PUBLISHED".equals(status)).nodesJson(nodes).edgesJson(edges()).build();
    }

    private String edges() {
        return "[{\"source\":\"start\",\"target\":\"step\",\"targetHandle\":\"condition-input\"},"
                + "{\"source\":\"step\",\"sourceHandle\":\"condition-1\",\"target\":\"end\"},"
                + "{\"source\":\"step\",\"sourceHandle\":\"condition-default\",\"target\":\"end\"}]";
    }
}
