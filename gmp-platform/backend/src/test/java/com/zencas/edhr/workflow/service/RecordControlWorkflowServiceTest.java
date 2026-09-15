package com.zencas.edhr.workflow.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.StartCommand;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.entity.WorkflowInstance;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecordControlWorkflowServiceTest {

    @Mock private WorkflowDefinitionRepository definitionRepository;
    @Mock private WorkflowDefinitionVersionRepository versionRepository;
    @Mock private WorkflowEngine workflowEngine;
    @InjectMocks private RecordControlWorkflowService service;

    @Test
    void listsOnlyCurrentPublishedCandidatesForRequestedBusinessType() {
        WorkflowDefinition available = WorkflowDefinition.builder()
                .id(10L).name("表单变更审核").code("CHANGE-01")
                .type("RECORD_CONTROL").businessType("CHANGE").status("PUBLISHED").build();
        WorkflowDefinition withoutCurrentVersion = WorkflowDefinition.builder()
                .id(11L).name("无当前版本").type("RECORD_CONTROL")
                .businessType("CHANGE").status("PUBLISHED").build();
        WorkflowDefinitionVersion current = WorkflowDefinitionVersion.builder()
                .id(20L).definitionId(10L).versionNumber(3)
                .status("PUBLISHED").isCurrent(true).build();
        when(definitionRepository.findByTypeAndBusinessTypeAndStatusOrderByNameAsc(
                "RECORD_CONTROL", "CHANGE", "PUBLISHED"))
                .thenReturn(List.of(available, withoutCurrentVersion));
        when(versionRepository.findByDefinitionIdAndIsCurrentTrue(10L)).thenReturn(Optional.of(current));
        when(versionRepository.findByDefinitionIdAndIsCurrentTrue(11L)).thenReturn(Optional.empty());

        var candidates = service.listPublishedCandidates(BusinessType.CHANGE);

        assertThat(candidates).hasSize(1);
        assertThat(candidates.get(0).workflowDefinitionId()).isEqualTo("10");
        assertThat(candidates.get(0).workflowVersionId()).isEqualTo("20");
        assertThat(candidates.get(0).versionNumber()).isEqualTo(3);
        assertThat(candidates.get(0).businessType()).isEqualTo(BusinessType.CHANGE);
        assertThat(candidates.get(0).status()).isEqualTo("PUBLISHED");
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
