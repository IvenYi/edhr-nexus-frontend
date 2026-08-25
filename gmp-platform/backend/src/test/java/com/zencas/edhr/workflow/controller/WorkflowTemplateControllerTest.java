package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkflowTemplateControllerTest {

    @Mock private WorkflowDefinitionRepository workflowDefinitionRepository;
    @Mock private WorkflowDefinitionVersionRepository versionRepository;
    @Mock private WorkflowNodeRepository nodeRepository;
    @Mock private WorkflowEdgeRepository edgeRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @InjectMocks private WorkflowTemplateController controller;

    @Test
    void listsOnlyReviewDefinitions() {
        WorkflowDefinition review = WorkflowDefinition.builder().id(101L).name("产品审核").type("REVIEW").build();
        when(workflowDefinitionRepository.findByType(eq("REVIEW"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(review)));

        var response = controller.list(1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).containsExactly(review);
        verify(workflowDefinitionRepository).findByType(eq("REVIEW"), any(Pageable.class));
    }

    @Test
    void rejectsWorkDefinitionsFromReviewEndpoints() {
        WorkflowDefinition work = WorkflowDefinition.builder().id(102L).name("清场作业").type("WORK").build();
        when(workflowDefinitionRepository.findById(102L)).thenReturn(Optional.of(work));

        assertThatThrownBy(() -> controller.getById(102L))
                .isInstanceOf(BusinessException.class);
    }
}
