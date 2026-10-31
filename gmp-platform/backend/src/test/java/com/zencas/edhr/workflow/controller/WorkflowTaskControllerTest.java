package com.zencas.edhr.workflow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.WorkflowTask;
import com.zencas.edhr.workflow.repository.WorkflowTaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkflowTaskControllerTest {
    @Mock private WorkflowTaskRepository workflowTaskRepository;
    @Mock private WorkflowEngine workflowEngine;
    @InjectMocks private WorkflowTaskController controller;
    @AfterEach void clearSecurityContext() { SecurityContextHolder.clearContext(); }

    @Test
    void todoUsesAuthenticatedOperatorAndOneDatabaseLookup() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("user-a", null, List.of()));
        WorkflowTask task = WorkflowTask.builder().id(1L).status("PENDING").build();
        when(workflowTaskRepository.findTodoForUser("user-a", "[\"user-a\"]", 50, 0L)).thenReturn(List.of(task));
        var response = controller.todo("user-b", 1, 50);
        assertThat(response.getData()).containsExactly(task);
        verify(workflowTaskRepository).findTodoForUser("user-a", "[\"user-a\"]", 50, 0L);
        verifyNoMoreInteractions(workflowTaskRepository);
    }

    @Test
    void genericTaskListUsesProjectionThatExcludesControlledDomains() {
        WorkflowTask task = WorkflowTask.builder().id(1L).status("PENDING").build();
        when(workflowTaskRepository.findGeneric(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(task)));

        var response = controller.list(1, 20, "createdAt", "desc");

        assertThat(response.getData().getContent()).containsExactly(task);
        verify(workflowTaskRepository).findGeneric(any(Pageable.class));
        verify(workflowTaskRepository, never()).findNonDhr(any(Pageable.class));
    }

    @Test
    void doneUsesAuthenticatedOperatorInsteadOfRequestParameter() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("user-a", null, List.of()));
        WorkflowTask task = WorkflowTask.builder().id(1L).status("COMPLETED").assigneeId("user-a").build();
        when(workflowTaskRepository.findDoneForUser("user-a", 50, 0L)).thenReturn(List.of(task));
        var response = controller.done("user-b", 1, 50);
        assertThat(response.getData()).containsExactly(task);
        verify(workflowTaskRepository).findDoneForUser("user-a", 50, 0L);
    }

    @Test
    void taskJsonSerializesSnowflakeIdsAsStringsToAvoidBrowserPrecisionLoss() throws Exception {
        WorkflowTask task = WorkflowTask.builder()
                .id(388708139656765440L)
                .instanceId(388708139602239488L)
                .nodeId(388706687165095936L)
                .signatureId(388708139656765441L)
                .status("PENDING")
                .build();

        var json = new ObjectMapper().readTree(new ObjectMapper().writeValueAsString(task));

        assertThat(json.get("id").isTextual()).isTrue();
        assertThat(json.get("id").asText()).isEqualTo("388708139656765440");
        assertThat(json.get("instanceId").asText()).isEqualTo("388708139602239488");
        assertThat(json.get("nodeId").asText()).isEqualTo("388706687165095936");
        assertThat(json.get("signatureId").asText()).isEqualTo("388708139656765441");
    }

    @Test
    void taskDetailUsesAuthenticatedOperatorForServerSideAccessCheck() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user-a", null, List.of()));
        WorkflowTask task = WorkflowTask.builder().id(1L).status("PENDING").build();
        when(workflowTaskRepository.findById(1L)).thenReturn(Optional.of(task));

        var response = controller.getById(1L);

        assertThat(response.getData()).isSameAs(task);
        verify(workflowEngine).assertTaskReadableBy(1L, "user-a");
    }
}
