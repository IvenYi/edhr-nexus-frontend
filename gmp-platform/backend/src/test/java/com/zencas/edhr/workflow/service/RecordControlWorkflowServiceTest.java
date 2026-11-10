package com.zencas.edhr.workflow.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.StartCommand;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.WorkflowInstance;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecordControlWorkflowServiceTest {

    @Mock private WorkflowDefinitionRepository definitionRepository;
    @Mock private WorkflowDefinitionRepository.CandidateVersion available;
    @Mock private WorkflowDefinitionRepository.CandidateVersion draft;
    @Mock private WorkflowEngine workflowEngine;
    @InjectMocks private RecordControlWorkflowService service;

    @Test
    void listsOnlyCurrentPublishedCandidatesForRequestedBusinessType() {
        when(available.getDefinitionId()).thenReturn(10L);
        when(available.getVersionId()).thenReturn(20L);
        when(available.getName()).thenReturn("表单变更审核");
        when(available.getCode()).thenReturn("CHANGE-01");
        when(available.getVersionNumber()).thenReturn(3);
        when(available.getBusinessType()).thenReturn("CHANGE");
        when(available.getVersionStatus()).thenReturn("PUBLISHED");
        when(draft.getDefinitionId()).thenReturn(11L);
        when(draft.getVersionStatus()).thenReturn("DRAFT");
        when(definitionRepository.findCandidateVersions(
                "RECORD_CONTROL", "CHANGE", "PUBLISHED"))
                .thenReturn(List.of(available, draft));

        var candidates = service.listPublishedCandidates(BusinessType.CHANGE);

        assertThat(candidates).hasSize(1);
        assertThat(candidates.get(0).workflowDefinitionId()).isEqualTo("10");
        assertThat(candidates.get(0).workflowVersionId()).isEqualTo("20");
        assertThat(candidates.get(0).templateName()).isEqualTo("表单变更审核");
        assertThat(candidates.get(0).templateCode()).isEqualTo("CHANGE-01");
        assertThat(candidates.get(0).versionNumber()).isEqualTo(3);
        assertThat(candidates.get(0).businessType()).isEqualTo(BusinessType.CHANGE);
        assertThat(candidates.get(0).status()).isEqualTo("PUBLISHED");
    }

    @Test
    void rejectsMissingBusinessTypeBeforeReadingCandidates() {
        assertThatThrownBy(() -> service.listPublishedCandidates(null))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(definitionRepository, workflowEngine);
    }

    @Test
    void startsThroughExplicitVersionPortAndReturnsFrozenReferences() {
        StartCommand command = new StartCommand(
                "request-1", BusinessType.OBSOLETE, "10", "20", "30", "40",
                "idem-1", "audit-1");
        WorkflowInstance instance = WorkflowInstance.builder()
                .id(50L).definitionId(10L).versionId(20L).businessType("OBSOLETE")
                .businessId("request-1").status("RUNNING").currentNodeIds("60,61")
                .auditCorrelationId("audit-1").workflowSnapshotHash("hash")
                .startedAt(LocalDateTime.of(2026, 9, 15, 10, 0)).build();
        when(workflowEngine.createRecordControlInstance(
                10L, 20L, "OBSOLETE", "request-1", "30", 40L, "idem-1", "audit-1"))
                .thenReturn(instance);

        var result = service.start(command);

        assertThat(result.requestId()).isEqualTo("request-1");
        assertThat(result.workflowInstanceId()).isEqualTo("50");
        assertThat(result.workflowDefinitionId()).isEqualTo("10");
        assertThat(result.workflowVersionId()).isEqualTo("20");
        assertThat(result.currentNodeIds()).containsExactly("60", "61");
        assertThat(result.auditCorrelationId()).isEqualTo("audit-1");
        verify(workflowEngine).createRecordControlInstance(
                10L, 20L, "OBSOLETE", "request-1", "30", 40L, "idem-1", "audit-1");
    }

    @Test
    void rejectsIncompleteStartCommandBeforeCallingEngine() {
        StartCommand command = new StartCommand(
                "request-1", BusinessType.CHANGE, "10", "20", "30", null,
                "idem-1", "audit-1");

        assertThatThrownBy(() -> service.start(command))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("申请人签名不能为空");
    }
}
