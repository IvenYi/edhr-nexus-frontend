package com.zencas.edhr.workflow.controller;

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
import java.util.List;
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
        when(workflowTaskRepository.findTodoForUser("user-a", "[\"user-a\"]")).thenReturn(List.of(task));
        var response = controller.todo("user-b", 1, 50);
        assertThat(response.getData()).containsExactly(task);
        verify(workflowTaskRepository).findTodoForUser("user-a", "[\"user-a\"]");
        verifyNoMoreInteractions(workflowTaskRepository);
    }

    @Test
    void doneUsesAuthenticatedOperatorInsteadOfRequestParameter() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("user-a", null, List.of()));
        WorkflowTask task = WorkflowTask.builder().id(1L).status("COMPLETED").assigneeId("user-a").build();
        when(workflowTaskRepository.findDoneForUser("user-a")).thenReturn(List.of(task));
        var response = controller.done("user-b", 1, 50);
        assertThat(response.getData()).containsExactly(task);
        verify(workflowTaskRepository).findDoneForUser("user-a");
    }
}
