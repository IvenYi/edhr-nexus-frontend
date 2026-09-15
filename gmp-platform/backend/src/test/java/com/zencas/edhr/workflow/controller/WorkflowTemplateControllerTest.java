package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.compliance.repository.AuditEventRepository;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import com.zencas.edhr.workflow.repository.WorkflowEdgeRepository;
import com.zencas.edhr.workflow.repository.WorkflowNodeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

@ExtendWith(MockitoExtension.class)
class WorkflowTemplateControllerTest {

    @Mock private WorkflowDefinitionRepository workflowDefinitionRepository;
    @Mock private WorkflowDefinitionVersionRepository versionRepository;
    @Mock private WorkflowNodeRepository nodeRepository;
    @Mock private WorkflowEdgeRepository edgeRepository;
    @Mock private AuditEventRepository auditEventRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private WorkflowTemplateController controller;

    @Test
    void protectsReviewTemplateReadsEditsAndPublishingWithExistingPermissions() throws Exception {
        assertThat(WorkflowTemplateController.class.getAnnotation(PreAuthorize.class).value())
                .isEqualTo("hasAuthority('workflow.review-templates')");
        assertThat(WorkflowTemplateController.class.getDeclaredMethod("create", WorkflowDefinition.class)
                .getAnnotation(PreAuthorize.class).value()).contains("workflow.template.edit");
        assertThat(WorkflowTemplateController.class.getDeclaredMethod("saveGraph", Long.class, Long.class, Map.class)
                .getAnnotation(PreAuthorize.class).value()).contains("workflow.template.edit");
        assertThat(WorkflowTemplateController.class.getDeclaredMethod("publishVersion", Long.class, Long.class)
                .getAnnotation(PreAuthorize.class).value()).contains("workflow.template.publish");
        assertThat(WorkflowTemplateController.class.getDeclaredMethod("revokeVersion", Long.class, Long.class)
                .getAnnotation(PreAuthorize.class).value()).contains("workflow.template.publish");
    }

    @Test
    void listsOnlyRecordControlDefinitions() {
        WorkflowDefinition review = WorkflowDefinition.builder().id(101L).name("表单变更").type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion current = WorkflowDefinitionVersion.builder()
                .id(201L).definitionId(101L).versionNumber(2).status("PUBLISHED").isCurrent(true).build();
        WorkflowDefinitionVersion draft = WorkflowDefinitionVersion.builder()
                .id(202L).definitionId(101L).versionNumber(3).status("DRAFT").isCurrent(false).build();
        when(workflowDefinitionRepository.findReviewTemplates(eq("RECORD_CONTROL"), eq("CHANGE"), eq(""), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(review)));
        when(versionRepository.findByDefinitionIdOrderByVersionNumberDesc(101L))
                .thenReturn(List.of(draft, current));

        var response = controller.list(1, 20, "createdAt", "desc", "CHANGE", "");

        assertThat(response.getData().getContent()).singleElement().satisfies(summary -> {
            assertThat(summary.id()).isEqualTo(101L);
            assertThat(summary.businessType()).isEqualTo("CHANGE");
            assertThat(summary.currentVersionNumber()).isEqualTo(2);
            assertThat(summary.draftVersionNumber()).isEqualTo(3);
            assertThat(summary.versionCount()).isEqualTo(2);
        });
        verify(workflowDefinitionRepository).findReviewTemplates(eq("RECORD_CONTROL"), eq("CHANGE"), eq(""), any(Pageable.class));
    }

    @Test
    void rejectsWorkDefinitionsFromReviewEndpoints() {
        WorkflowDefinition work = WorkflowDefinition.builder().id(102L).name("清场作业").type("WORK").build();
        when(workflowDefinitionRepository.findById(102L)).thenReturn(Optional.of(work));

        assertThatThrownBy(() -> controller.getById(102L))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void requiresBusinessCategoryWhenCreatingTemplate() {
        assertThatThrownBy(() -> controller.create(WorkflowDefinition.builder().name("未分类").build()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void createsRecordControlDefinitionForSupportedBusinessCategory() {
        WorkflowDefinition input = WorkflowDefinition.builder()
                .name("表单变更审核").type("UNSUPPORTED").businessType("CHANGE").build();
        when(idGenerator.nextId()).thenReturn(105L);
        when(workflowDefinitionRepository.save(any(WorkflowDefinition.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        WorkflowDefinition saved = controller.create(input).getData();

        assertThat(saved.getId()).isEqualTo(105L);
        assertThat(saved.getType()).isEqualTo("RECORD_CONTROL");
        assertThat(saved.getBusinessType()).isEqualTo("CHANGE");
        verify(auditEventRepository).save(any());
    }

    @Test
    void updatesOnlyEditablePropertiesAndPreservesCreationMetadata() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 9, 13, 9, 0);
        WorkflowDefinition existing = WorkflowDefinition.builder()
                .id(107L).tenantId("tenant-a").name("原名称").type("RECORD_CONTROL")
                .businessType("CHANGE").status("PUBLISHED").createdAt(createdAt).build();
        WorkflowDefinition request = WorkflowDefinition.builder()
                .name("新名称").code("CHANGE-001").description("新说明").businessType("CHANGE").build();
        when(workflowDefinitionRepository.findById(107L)).thenReturn(Optional.of(existing));
        when(workflowDefinitionRepository.save(existing)).thenReturn(existing);

        WorkflowDefinition saved = controller.update(107L, request).getData();

        assertThat(saved.getName()).isEqualTo("新名称");
        assertThat(saved.getStatus()).isEqualTo("PUBLISHED");
        assertThat(saved.getTenantId()).isEqualTo("tenant-a");
        assertThat(saved.getCreatedAt()).isEqualTo(createdAt);
        assertThat(saved.getUpdatedAt()).isNotNull();
        verify(auditEventRepository).save(any());
    }

    @Test
    void deletesDraftRelationsAndVersionsBeforeDefinition() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(108L).name("待删除模板").type("RECORD_CONTROL").businessType("OBSOLETE").build();
        WorkflowDefinitionVersion draft = WorkflowDefinitionVersion.builder()
                .id(208L).definitionId(108L).status("DRAFT").build();
        when(workflowDefinitionRepository.findById(108L)).thenReturn(Optional.of(definition));
        when(versionRepository.findByDefinitionIdOrderByVersionNumberDesc(108L)).thenReturn(List.of(draft));

        controller.delete(108L);

        verify(edgeRepository).deleteAll(List.of());
        verify(nodeRepository).deleteAll(List.of());
        verify(versionRepository).deleteAll(List.of(draft));
        verify(versionRepository).flush();
        verify(workflowDefinitionRepository).deleteById(108L);
        verify(auditEventRepository).save(any());
    }

    @Test
    void rejectsSecondDraftVersion() {
        WorkflowDefinition definition = WorkflowDefinition.builder().id(103L).type("RECORD_CONTROL").businessType("CHANGE").build();
        when(workflowDefinitionRepository.findById(103L)).thenReturn(Optional.of(definition));
        when(versionRepository.findByDefinitionIdAndStatus(103L, "DRAFT"))
                .thenReturn(Optional.of(WorkflowDefinitionVersion.builder().id(201L).definitionId(103L).status("DRAFT").build()));

        assertThatThrownBy(() -> controller.createDraftVersion(103L)).isInstanceOf(BusinessException.class);
    }

    @Test
    void savesIncompleteDraftGraphWithoutPublishValidation() {
        WorkflowDefinition definition = WorkflowDefinition.builder().id(104L).type("RECORD_CONTROL").businessType("OBSOLETE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder().id(202L).definitionId(104L).status("DRAFT").build();
        when(workflowDefinitionRepository.findById(104L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(202L)).thenReturn(Optional.of(version));

        when(versionRepository.save(version)).thenReturn(version);

        WorkflowDefinitionVersion saved = controller.saveGraph(
                104L, 202L, Map.of("nodes", List.of(), "edges", List.of())).getData();

        assertThat(saved.getNodesJson()).isEqualTo("[]");
        assertThat(saved.getEdgesJson()).isEqualTo("[]");
    }

    @Test
    void savesValidGraphAndSynchronizesRuntimeRelations() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(106L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(203L).definitionId(106L).status("DRAFT").build();
        when(workflowDefinitionRepository.findById(106L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(203L)).thenReturn(Optional.of(version));
        when(idGenerator.nextId()).thenReturn(301L, 302L, 303L, 401L, 402L);
        when(versionRepository.save(version)).thenReturn(version);

        List<Map<String, Object>> nodes = List.of(
                node("start", "START", "发起", 100, 80),
                node("approval", "APPROVAL", "审批", 100, 220, Map.of("approverSubjects", List.of(Map.of("type", "USER", "id", "u1")), "buttons", List.of(Map.of("id", "approve", "label", "审批", "action", "APPROVE"), Map.of("id", "return", "label", "退回", "action", "RETURN"), Map.of("id", "transfer", "label", "转办", "action", "TRANSFER")))),
                node("end", "END", "结束", 100, 360));
        List<Map<String, Object>> edges = List.of(
                Map.of("source", "start", "target", "approval"),
                Map.of("source", "approval", "target", "end"));

        WorkflowDefinitionVersion saved = controller.saveGraph(
                106L, 203L, Map.of("nodes", nodes, "edges", edges)).getData();

        assertThat(saved.getNodesJson()).contains("\"kind\":\"APPROVAL\"");
        assertThat(saved.getEdgesJson()).contains("\"source\":\"start\"");
        verify(edgeRepository).deleteAll(List.of());
        verify(nodeRepository).deleteAll(List.of());
        verify(nodeRepository, times(3)).save(any());
        verify(edgeRepository, times(2)).save(any());
    }

    @Test
    void rejectsPublishingApprovalWithoutApproverSubjects() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(109L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(209L).definitionId(109L).status("DRAFT")
                .nodesJson("[{\"id\":\"start\",\"data\":{\"kind\":\"START\",\"label\":\"发起\",\"config\":{}}},{\"id\":\"approval\",\"data\":{\"kind\":\"APPROVAL\",\"label\":\"质量审批\",\"config\":{\"buttons\":[{\"id\":\"approve\",\"label\":\"审批\",\"action\":\"APPROVE\"},{\"id\":\"return\",\"label\":\"退回\",\"action\":\"RETURN\"},{\"id\":\"transfer\",\"label\":\"转办\",\"action\":\"TRANSFER\"}]} }},{\"id\":\"end\",\"data\":{\"kind\":\"END\",\"label\":\"结束\"}}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"approval\"},{\"source\":\"approval\",\"target\":\"end\"}]")
                .build();
        when(workflowDefinitionRepository.findById(109L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(209L)).thenReturn(Optional.of(version));

        assertThatThrownBy(() -> controller.publishVersion(109L, 209L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("审批节点必须配置审批主体");
    }

    @Test
    void rejectsPublishingApprovalWithSerializedEmptyApproverArray() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(121L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(221L).definitionId(121L).status("DRAFT").versionNumber(1)
                .nodesJson("[{\"id\":\"start\",\"data\":{\"kind\":\"START\",\"label\":\"发起\",\"config\":{}}},{\"id\":\"approval\",\"data\":{\"kind\":\"APPROVAL\",\"label\":\"质量审批\",\"config\":{\"approverSubjects\":[],\"approvers\":\"[]\",\"buttons\":[{\"id\":\"approve\",\"label\":\"审批\",\"action\":\"APPROVE\"},{\"id\":\"return\",\"label\":\"退回\",\"action\":\"RETURN\"},{\"id\":\"transfer\",\"label\":\"转办\",\"action\":\"TRANSFER\"}]}}},{\"id\":\"end\",\"data\":{\"kind\":\"END\",\"label\":\"结束\"}}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"approval\"},{\"source\":\"approval\",\"target\":\"end\"}]")
                .build();
        when(workflowDefinitionRepository.findById(121L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(221L)).thenReturn(Optional.of(version));

        assertThatThrownBy(() -> controller.publishVersion(121L, 221L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("审批节点必须配置审批主体");
    }

    @Test
    void rejectsPublishingApprovalWithMalformedStructuredApprovers() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(122L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(222L).definitionId(122L).status("DRAFT").versionNumber(1)
                .nodesJson("[{\"id\":\"start\",\"data\":{\"kind\":\"START\",\"label\":\"发起\",\"config\":{}}},{\"id\":\"approval\",\"data\":{\"kind\":\"APPROVAL\",\"label\":\"质量审批\",\"config\":{\"approverSubjects\":[],\"approvers\":\"[{\",\"buttons\":[{\"id\":\"approve\",\"label\":\"审批\",\"action\":\"APPROVE\"},{\"id\":\"return\",\"label\":\"退回\",\"action\":\"RETURN\"},{\"id\":\"transfer\",\"label\":\"转办\",\"action\":\"TRANSFER\"}]}}},{\"id\":\"end\",\"data\":{\"kind\":\"END\",\"label\":\"结束\"}}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"approval\"},{\"source\":\"approval\",\"target\":\"end\"}]")
                .build();
        when(workflowDefinitionRepository.findById(122L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(222L)).thenReturn(Optional.of(version));

        assertThatThrownBy(() -> controller.publishVersion(122L, 222L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("审批节点必须配置审批主体");
    }

    @Test
    void publishesGraphWhenEveryApprovalHasApproverSubjects() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(110L).type("RECORD_CONTROL").businessType("CHANGE").status("DRAFT").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(210L).definitionId(110L).status("DRAFT").versionNumber(1)
                .nodesJson("[{\"id\":\"start\",\"data\":{\"kind\":\"START\",\"label\":\"发起\",\"config\":{}}},{\"id\":\"approval\",\"data\":{\"kind\":\"APPROVAL\",\"label\":\"质量审批\",\"config\":{\"approverSubjects\":[{\"type\":\"USER\",\"id\":\"u1\",\"nameSnapshot\":\"质量员\"}],\"buttons\":[{\"id\":\"approve\",\"label\":\"审批\",\"action\":\"APPROVE\"},{\"id\":\"return\",\"label\":\"退回\",\"action\":\"RETURN\"},{\"id\":\"transfer\",\"label\":\"转办\",\"action\":\"TRANSFER\"}]} }},{\"id\":\"end\",\"data\":{\"kind\":\"END\",\"label\":\"结束\"}}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"approval\"},{\"source\":\"approval\",\"target\":\"end\"}]")
                .build();
        when(workflowDefinitionRepository.findById(110L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(210L)).thenReturn(Optional.of(version));
        when(versionRepository.findByDefinitionIdOrderByVersionNumberDesc(110L)).thenReturn(List.of(version));
        when(versionRepository.save(any(WorkflowDefinitionVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(idGenerator.nextId()).thenReturn(311L, 312L, 313L, 411L, 412L, 511L, 611L);

        WorkflowDefinitionVersion published = controller.publishVersion(110L, 210L).getData();

        assertThat(published.getStatus()).isEqualTo("PUBLISHED");
        assertThat(published.getIsCurrent()).isTrue();
        verify(nodeRepository, times(3)).save(any());
        verify(edgeRepository, times(2)).save(any());
        verify(auditEventRepository).save(any());
    }

    @Test
    void publishesComplexParallelGraphAndCreatesIdenticalNextDraft() throws Exception {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(120L).type("RECORD_CONTROL").businessType("OBSOLETE").status("DRAFT").build();
        List<Map<String, Object>> nodes = List.of(
                node("start", "START", "发起", 360, 80),
                node("split", "PARALLEL_SPLIT", "并行拆分", 360, 200),
                node("a1", "APPROVAL", "分支 A 审批一", 120, 330, approvalConfig("u1")),
                node("a2", "APPROVAL", "分支 A 审批二", 120, 460, approvalConfig("u2")),
                node("b1", "APPROVAL", "分支 B 审批", 360, 330, approvalConfig("u3")),
                node("c1", "APPROVAL", "分支 C 审批", 600, 330, approvalConfig("u4")),
                node("join", "PARALLEL_JOIN", "并行聚合", 360, 590),
                node("end", "END", "结束", 360, 720));
        List<Map<String, Object>> edges = List.of(
                Map.of("source", "start", "target", "split"),
                Map.of("source", "split", "target", "a1"),
                Map.of("source", "a1", "target", "a2"),
                Map.of("source", "a2", "target", "join"),
                Map.of("source", "split", "target", "b1"),
                Map.of("source", "b1", "target", "join"),
                Map.of("source", "split", "target", "c1"),
                Map.of("source", "c1", "target", "join"),
                Map.of("source", "join", "target", "end"));
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        String nodesJson = mapper.writeValueAsString(nodes);
        String edgesJson = mapper.writeValueAsString(edges);
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(220L).definitionId(120L).status("DRAFT").versionNumber(1)
                .nodesJson(nodesJson).edgesJson(edgesJson).build();
        when(workflowDefinitionRepository.findById(120L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(220L)).thenReturn(Optional.of(version));
        when(versionRepository.findByDefinitionIdOrderByVersionNumberDesc(120L)).thenReturn(List.of(version));
        when(versionRepository.save(any(WorkflowDefinitionVersion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AtomicLong sequence = new AtomicLong(1000L);
        when(idGenerator.nextId()).thenAnswer(invocation -> sequence.getAndIncrement());

        controller.publishVersion(120L, 220L);

        ArgumentCaptor<WorkflowDefinitionVersion> captor = ArgumentCaptor.forClass(WorkflowDefinitionVersion.class);
        verify(versionRepository, times(2)).save(captor.capture());
        WorkflowDefinitionVersion nextDraft = captor.getAllValues().stream()
                .filter(candidate -> "DRAFT".equals(candidate.getStatus()))
                .findFirst().orElseThrow();
        assertThat(nextDraft.getVersionNumber()).isEqualTo(2);
        assertThat(nextDraft.getNodesJson()).isEqualTo(nodesJson);
        assertThat(nextDraft.getEdgesJson()).isEqualTo(edgesJson);
        verify(nodeRepository, times(8)).save(any());
        verify(edgeRepository, times(9)).save(any());
    }

    @Test
    void savesApprovalActionButtonStyleAndSignatureEvents() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(111L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(211L).definitionId(111L).status("DRAFT").nodesJson("[]").edgesJson("[]").build();
        when(workflowDefinitionRepository.findById(111L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(211L)).thenReturn(Optional.of(version));
        when(versionRepository.save(version)).thenReturn(version);
        when(idGenerator.nextId()).thenReturn(321L, 322L, 323L, 421L, 422L);

        List<Map<String, Object>> nodes = List.of(
                node("start", "START", "发起", 100, 80),
                node("approval", "APPROVAL", "审批", 100, 220, Map.of(
                        "approverSubjects", List.of(Map.of("type", "USER", "id", "u1", "nameSnapshot", "质量员")),
                        "buttons", List.of(
                                Map.of("id", "approve", "label", "审批", "action", "APPROVE", "visible", true, "style", "PRIMARY"),
                                Map.of("id", "return", "label", "退回", "action", "RETURN", "visible", true, "style", "DANGER"),
                                Map.of("id", "transfer", "label", "转办", "action", "TRANSFER", "visible", true, "style", "DEFAULT")),
                        "buttonEvents", List.of(Map.of(
                                "id", "event-2", "event", "BEFORE", "action", "APPROVE",
                                "builtin", "NONE", "signatureMethod", "ACCOUNT_PASSWORD")))),
                node("end", "END", "结束", 100, 360, Map.of()));
        List<Map<String, Object>> edges = List.of(
                Map.of("source", "start", "target", "approval"),
                Map.of("source", "approval", "target", "end"));

        WorkflowDefinitionVersion saved = controller.saveGraph(
                111L, 211L, Map.of("nodes", nodes, "edges", edges)).getData();

        assertThat(saved.getNodesJson()).contains("ACCOUNT_PASSWORD").contains("PRIMARY");
    }

    @Test
    void acceptsRenamedFixedReviewAction() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(112L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(212L).definitionId(112L).status("DRAFT").nodesJson("[]").edgesJson("[]").build();
        when(workflowDefinitionRepository.findById(112L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(212L)).thenReturn(Optional.of(version));
        when(versionRepository.save(version)).thenReturn(version);

        List<Map<String, Object>> nodes = List.of(
                node("start", "START", "发起", 100, 80),
                node("approval", "APPROVAL", "审批", 100, 220, Map.of(
                        "buttons", List.of(
                                Map.of("id", "approve", "label", "同意", "action", "APPROVE", "visible", true),
                                Map.of("id", "return", "label", "退回", "action", "RETURN", "visible", true),
                                Map.of("id", "transfer", "label", "转办", "action", "TRANSFER", "visible", true)))),
                node("end", "END", "结束", 100, 360, Map.of()));

        WorkflowDefinitionVersion saved = controller.saveGraph(
                112L, 212L, Map.of("nodes", nodes, "edges", List.of())).getData();

        assertThat(saved.getNodesJson()).contains("同意").contains("APPROVE");
    }

    @Test
    void rejectsButtonConfigurationOnRecordControlStartNode() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(115L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(215L).definitionId(115L).status("DRAFT").build();
        when(workflowDefinitionRepository.findById(115L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(215L)).thenReturn(Optional.of(version));

        List<Map<String, Object>> nodes = List.of(
                node("start", "START", "发起", 100, 80, Map.of(
                        "buttons", List.of(
                                Map.of("id", "save", "label", "保存", "action", "SAVE"),
                                Map.of("id", "submit", "label", "提交", "action", "SUBMIT")))));

        assertThatThrownBy(() -> controller.saveGraph(
                115L, 215L, Map.of("nodes", nodes, "edges", List.of())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("发起节点不配置按钮");
    }

    @Test
    void rejectsButtonEventConfigurationOnRecordControlStartNode() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(116L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(216L).definitionId(116L).status("DRAFT").build();
        when(workflowDefinitionRepository.findById(116L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(216L)).thenReturn(Optional.of(version));

        List<Map<String, Object>> nodes = List.of(
                node("start", "START", "发起", 100, 80, Map.of(
                        "buttonEvents", List.of(Map.of(
                                "id", "event-1", "event", "BEFORE", "action", "SUBMIT",
                                "builtin", "NONE", "signatureMethod", "ACCOUNT_PASSWORD")))));

        assertThatThrownBy(() -> controller.saveGraph(
                116L, 216L, Map.of("nodes", nodes, "edges", List.of())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("发起节点不配置按钮事件");
    }

    @Test
    void acceptsConfigurableTransferLabelAndStyleWithoutOpinionSetting() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(113L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(213L).definitionId(113L).status("DRAFT").nodesJson("[]").edgesJson("[]").build();
        when(workflowDefinitionRepository.findById(113L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(213L)).thenReturn(Optional.of(version));
        when(versionRepository.save(version)).thenReturn(version);

        List<Map<String, Object>> nodes = List.of(
                node("start", "START", "发起", 100, 80),
                node("approval", "APPROVAL", "审批", 100, 220, Map.of(
                        "buttons", List.of(
                                Map.of("id", "approve", "label", "同意", "action", "APPROVE"),
                                Map.of("id", "return", "label", "退回", "action", "RETURN"),
                                Map.of("id", "transfer", "label", "转交他人", "action", "TRANSFER", "style", "DEFAULT")))),
                node("end", "END", "结束", 100, 360, Map.of()));

        WorkflowDefinitionVersion saved = controller.saveGraph(
                113L, 213L, Map.of("nodes", nodes, "edges", List.of(
                        Map.of("source", "start", "target", "approval"),
                        Map.of("source", "approval", "target", "end")))).getData();

        assertThat(saved.getNodesJson()).contains("转交他人").contains("TRANSFER");
    }

    @Test
    void rejectsOpinionRequiredOnTransferAction() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(114L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(214L).definitionId(114L).status("DRAFT").build();
        when(workflowDefinitionRepository.findById(114L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(214L)).thenReturn(Optional.of(version));

        List<Map<String, Object>> nodes = List.of(
                node("approval", "APPROVAL", "审批", 100, 220, Map.of(
                        "buttons", List.of(
                                Map.of("id", "approve", "label", "审批", "action", "APPROVE"),
                                Map.of("id", "return", "label", "退回", "action", "RETURN"),
                                Map.of("id", "transfer", "label", "转办", "action", "TRANSFER", "requireOpinion", true)))));

        assertThatThrownBy(() -> controller.saveGraph(
                114L, 214L, Map.of("nodes", nodes, "edges", List.of())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("转办不支持审批意见必填配置");
    }

    @Test
    void rejectsPublishingGraphWithoutApprovalNode() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(117L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(217L).definitionId(117L).status("DRAFT").versionNumber(1)
                .nodesJson("[{\"id\":\"start\",\"data\":{\"kind\":\"START\",\"label\":\"发起\",\"config\":{}}},{\"id\":\"end\",\"data\":{\"kind\":\"END\",\"label\":\"结束\"}}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"end\"}]")
                .build();
        when(workflowDefinitionRepository.findById(117L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(217L)).thenReturn(Optional.of(version));

        assertThatThrownBy(() -> controller.publishVersion(117L, 217L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("流程必须包含至少一个审批节点");
    }

    @Test
    void rejectsPublishingApprovalWithMissingFixedAction() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(118L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(218L).definitionId(118L).status("DRAFT").versionNumber(1)
                .nodesJson("[{\"id\":\"start\",\"data\":{\"kind\":\"START\",\"label\":\"发起\",\"config\":{}}},{\"id\":\"approval\",\"data\":{\"kind\":\"APPROVAL\",\"label\":\"质量审批\",\"config\":{\"approverSubjects\":[{\"type\":\"USER\",\"id\":\"u1\"}],\"buttons\":[{\"id\":\"approve\",\"label\":\"审批\",\"action\":\"APPROVE\"},{\"id\":\"return\",\"label\":\"退回\",\"action\":\"RETURN\"}]}}},{\"id\":\"end\",\"data\":{\"kind\":\"END\",\"label\":\"结束\"}}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"approval\"},{\"source\":\"approval\",\"target\":\"end\"}]")
                .build();
        when(workflowDefinitionRepository.findById(118L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(218L)).thenReturn(Optional.of(version));

        assertThatThrownBy(() -> controller.publishVersion(118L, 218L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("固定动作不能增删");
    }

    @Test
    void rejectsPublishingApprovalWithHiddenFixedAction() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(119L).type("RECORD_CONTROL").businessType("CHANGE").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(219L).definitionId(119L).status("DRAFT").versionNumber(1)
                .nodesJson("[{\"id\":\"start\",\"data\":{\"kind\":\"START\",\"label\":\"发起\",\"config\":{}}},{\"id\":\"approval\",\"data\":{\"kind\":\"APPROVAL\",\"label\":\"质量审批\",\"config\":{\"approverSubjects\":[{\"type\":\"USER\",\"id\":\"u1\"}],\"buttons\":[{\"id\":\"approve\",\"label\":\"审批\",\"action\":\"APPROVE\",\"visible\":true},{\"id\":\"return\",\"label\":\"退回\",\"action\":\"RETURN\",\"visible\":true},{\"id\":\"transfer\",\"label\":\"转办\",\"action\":\"TRANSFER\",\"visible\":false}]}}},{\"id\":\"end\",\"data\":{\"kind\":\"END\",\"label\":\"结束\"}}]")
                .edgesJson("[{\"source\":\"start\",\"target\":\"approval\"},{\"source\":\"approval\",\"target\":\"end\"}]")
                .build();
        when(workflowDefinitionRepository.findById(119L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(219L)).thenReturn(Optional.of(version));

        assertThatThrownBy(() -> controller.publishVersion(119L, 219L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("固定动作不能隐藏");
    }

    private Map<String, Object> node(String id, String kind, String label, int x, int y) {
        return node(id, kind, label, x, y, Map.of());
    }

    private Map<String, Object> node(String id, String kind, String label, int x, int y, Map<String, Object> config) {
        return Map.of(
                "id", id,
                "position", Map.of("x", x, "y", y),
                "data", Map.of("kind", kind, "label", label, "config", config));
    }

    private Map<String, Object> approvalConfig(String userId) {
        return Map.of(
                "approverSubjects", List.of(Map.of("type", "USER", "id", userId)),
                "buttons", List.of(
                        Map.of("id", "approve", "label", "审批", "action", "APPROVE"),
                        Map.of("id", "return", "label", "退回", "action", "RETURN"),
                        Map.of("id", "transfer", "label", "转办", "action", "TRANSFER")));
    }
}
