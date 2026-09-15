package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.PublishedCandidate;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowPort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecordControlWorkflowControllerTest {

    @Mock private RecordControlWorkflowPort workflowPort;
    @InjectMocks private RecordControlWorkflowController controller;

    @Test
    void candidateEndpointRequiresMatchingRecordControlCreatePermission() throws Exception {
        PreAuthorize authorization = RecordControlWorkflowController.class
                .getMethod("listCandidates", String.class)
                .getAnnotation(PreAuthorize.class);

        assertThat(authorization.value())
                .contains("record-control.corrections.create")
                .contains("record-control.voids.create");
    }

    @Test
    void mapsChineseApplicationRequestToTypedPublishedCandidates() {
        PublishedCandidate candidate = new PublishedCandidate(
                "10", "20", "作废审核", "VOID-01", 2,
                BusinessType.OBSOLETE, "PUBLISHED");
        when(workflowPort.listPublishedCandidates(BusinessType.OBSOLETE)).thenReturn(List.of(candidate));

        var response = controller.listCandidates("obsolete");

        assertThat(response.getData()).containsExactly(candidate);
        verify(workflowPort).listPublishedCandidates(BusinessType.OBSOLETE);
    }

    @Test
    void rejectsUnsupportedBusinessType() {
        assertThatThrownBy(() -> controller.listCandidates("REVIEW"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("业务类型无效");
    }
}
