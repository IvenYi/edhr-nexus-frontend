package com.zencas.edhr.workflow.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.util.SnowflakeIdGenerator;
import com.zencas.edhr.identity.dto.ResolvedSubjectUser;
import com.zencas.edhr.identity.dto.SubjectReference;
import com.zencas.edhr.identity.dto.SubjectResolution;
import com.zencas.edhr.identity.entity.UserAccount;
import com.zencas.edhr.identity.repository.UserAccountRepository;
import com.zencas.edhr.identity.service.SubjectResolver;
import com.zencas.edhr.workflow.entity.*;
import com.zencas.edhr.workflow.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkflowEngineTest {
    @Mock private WorkflowInstanceRepository instanceRepository;
    @Mock private WorkflowTaskRepository taskRepository;
    @Mock private WorkflowActionLogRepository actionLogRepository;
    @Mock private WorkflowBindingRuleRepository bindingRuleRepository;
    @Mock private WorkflowDefinitionRepository definitionRepository;
    @Mock private WorkflowDefinitionVersionRepository versionRepository;
    @Mock private WorkflowNodeRepository nodeRepository;
    @Mock private WorkflowEdgeRepository edgeRepository;
    @Mock private SnowflakeIdGenerator idGenerator;
    @Mock private StateMachineService stateMachineService;
    @Mock private SubjectResolver subjectResolver;
    @Mock private UserAccountRepository userAccountRepository;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks private WorkflowEngine workflowEngine;

    @Test
    void createsOneLogicalTaskForOneHundredResolvedCandidates() throws Exception {
        WorkflowBindingRule rule = WorkflowBindingRule.builder().definitionId(100L).versionId(200L).build();
        WorkflowNode start = WorkflowNode.builder().id(300L).versionId(200L).nodeType("START").name("开始填报")
                .properties("{\"config\":{\"permissionGroupRules\":[{\"subjects\":[{\"type\":\"ROLE\",\"id\":3}]}]}}").build();
        List<ResolvedSubjectUser> users = IntStream.rangeClosed(1, 100)
                .mapToObj(id -> new ResolvedSubjectUser((long) id, Set.of(new SubjectReference(SubjectReference.SubjectType.ROLE, 3L, null))))
                .toList();
        AtomicLong ids = new AtomicLong(1);
        when(idGenerator.nextId()).thenAnswer(invocation -> ids.getAndIncrement());
        when(bindingRuleRepository.findByBusinessTypeAndIsActiveTrue("FORM")).thenReturn(List.of(rule));
        when(definitionRepository.findById(100L)).thenReturn(Optional.of(WorkflowDefinition.builder().id(100L).type("FORM_PROCESS").build()));
        when(versionRepository.findById(200L)).thenReturn(Optional.of(WorkflowDefinitionVersion.builder().id(200L).definitionId(100L).build()));
        when(nodeRepository.findByVersionIdAndNodeType(200L, "START")).thenReturn(List.of(start));
        when(instanceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(UserAccount.builder().id(1L).tenantId(9L).status("ACTIVE").build()));
        when(subjectResolver.resolve(eq(9L), any())).thenReturn(new SubjectResolution(users, Set.of()));

        workflowEngine.createInstance("FORM", "form-1", "1");

        ArgumentCaptor<WorkflowTask> taskCaptor = ArgumentCaptor.forClass(WorkflowTask.class);
        verify(taskRepository, times(1)).save(taskCaptor.capture());
        JsonNode snapshot = objectMapper.readTree(taskCaptor.getValue().getCandidateSnapshot());
        assertThat(snapshot.path("userIds")).hasSize(100);
        assertThat(snapshot.path("sources").size()).isEqualTo(100);
        assertThat(snapshot.path("unresolvedSubjects")).isEmpty();
        assertThat(taskCaptor.getValue().getTaskType()).isEqualTo("FORM_FILL");
    }

    @Test
    void createsOneUnrestrictedTaskWhenFormProcessHasNoSubjects() throws Exception {
        WorkflowBindingRule rule = WorkflowBindingRule.builder().definitionId(100L).versionId(200L).build();
        WorkflowNode start = WorkflowNode.builder().id(300L).versionId(200L).nodeType("START").name("开始填报")
                .properties("{\"config\":{\"permissionGroupRules\":[],\"defaultPermission\":\"EDIT\"}}").build();
        when(idGenerator.nextId()).thenReturn(1L, 2L);
        when(bindingRuleRepository.findByBusinessTypeAndIsActiveTrue("FORM")).thenReturn(List.of(rule));
        when(definitionRepository.findById(100L)).thenReturn(Optional.of(WorkflowDefinition.builder().id(100L).type("FORM_PROCESS").build()));
        when(versionRepository.findById(200L)).thenReturn(Optional.of(WorkflowDefinitionVersion.builder().id(200L).definitionId(100L).build()));
        when(nodeRepository.findByVersionIdAndNodeType(200L, "START")).thenReturn(List.of(start));
        when(instanceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(UserAccount.builder().id(1L).tenantId(9L).status("ACTIVE").build()));

        workflowEngine.createInstance("FORM", "form-1", "1");

        ArgumentCaptor<WorkflowTask> taskCaptor = ArgumentCaptor.forClass(WorkflowTask.class);
        verify(taskRepository).save(taskCaptor.capture());
        JsonNode snapshot = objectMapper.readTree(taskCaptor.getValue().getCandidateSnapshot());
        assertThat(snapshot.path("unrestricted").asBoolean()).isTrue();
        assertThat(snapshot.path("userIds")).isEmpty();
    }

    @Test
    void unrestrictedTaskCanBeCompletedByAnyAuthenticatedOperator() {
        WorkflowTask task = WorkflowTask.builder().id(10L).instanceId(20L).nodeId(30L).status("PENDING")
                .candidateSnapshot("{\"unrestricted\":true,\"userIds\":[]}").build();
        WorkflowInstance instance = WorkflowInstance.builder().id(20L).status("RUNNING").build();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(instance));
        when(taskRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(task));
        when(nodeRepository.findById(30L)).thenReturn(Optional.of(
                WorkflowNode.builder().id(30L).nodeType("END").name("结束").build()));

        workflowEngine.completeTask(10L, "APPROVE", null, "user-any", null);

        assertThat(task.getAssigneeId()).isEqualTo("user-any");
        assertThat(task.getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    void emptyFormProcessStartConfigCreatesUnrestrictedLogicalTask() throws Exception {
        WorkflowBindingRule rule = WorkflowBindingRule.builder().definitionId(100L).versionId(200L).build();
        WorkflowDefinition definition = WorkflowDefinition.builder().id(100L).type("FORM_PROCESS").build();
        WorkflowNode start = WorkflowNode.builder().id(300L).versionId(200L).nodeType("START").name("填报").properties(null).build();
        AtomicLong ids = new AtomicLong(1);
        when(idGenerator.nextId()).thenAnswer(invocation -> ids.getAndIncrement());
        when(bindingRuleRepository.findByBusinessTypeAndIsActiveTrue("FORM")).thenReturn(List.of(rule));
        when(definitionRepository.findById(100L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(200L)).thenReturn(Optional.of(WorkflowDefinitionVersion.builder().id(200L).definitionId(100L).build()));
        when(nodeRepository.findByVersionIdAndNodeType(200L, "START")).thenReturn(List.of(start));
        when(instanceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(UserAccount.builder().id(1L).tenantId(9L).status("ACTIVE").build()));

        workflowEngine.createInstance("FORM", "form-1", "1");

        ArgumentCaptor<WorkflowTask> taskCaptor = ArgumentCaptor.forClass(WorkflowTask.class);
        verify(taskRepository).save(taskCaptor.capture());
        assertThat(objectMapper.readTree(taskCaptor.getValue().getCandidateSnapshot()).path("unrestricted").asBoolean()).isTrue();
    }

    @Test
    void candidateCanCompleteAndActualActorIsPersisted() {
        WorkflowTask task = pendingCandidateTask("user-a", "user-b");
        WorkflowInstance instance = WorkflowInstance.builder().id(20L).status("RUNNING").build();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(instance));
        when(taskRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(task));
        when(edgeRepository.findByTargetNodeId(30L)).thenReturn(List.of());

        workflowEngine.completeTask(10L, "REJECT", "补充资料", "user-b", null);

        assertThat(task.getStatus()).isEqualTo("REJECTED");
        assertThat(task.getAssigneeId()).isEqualTo("user-b");
        assertThat(instance.getStatus()).isEqualTo("TERMINATED");
        verify(taskRepository).save(task);
    }

    @Test
    void rejectsUserOutsideFrozenCandidateSnapshot() {
        WorkflowTask task = pendingCandidateTask("user-a");
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(WorkflowInstance.builder().id(20L).status("RUNNING").build()));
        when(taskRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> workflowEngine.completeTask(10L, "APPROVE", null, "user-b", null))
                .isInstanceOf(BusinessException.class).hasMessageContaining("不是该任务的待处理人");
        verify(taskRepository, never()).save(any());
    }

    @Test
    void terminationLocksInstanceAndClosesEveryActiveLogicalTask() {
        WorkflowInstance terminated = WorkflowInstance.builder().id(20L).status("RUNNING").build();
        WorkflowTask task = pendingCandidateTask("user-a");
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(terminated));
        when(taskRepository.findByInstanceId(20L)).thenReturn(List.of(task));

        workflowEngine.terminateInstance(20L, "人工终止", "admin", null);

        assertThat(terminated.getStatus()).isEqualTo("TERMINATED");
        assertThat(task.getStatus()).isEqualTo("TERMINATED");
        verify(instanceRepository).findByIdForUpdate(20L);
    }

    @Test
    void transferKeepsOneLogicalTaskAndUpdatesTargetSnapshot() throws Exception {
        WorkflowTask task = pendingCandidateTask("user-a");
        WorkflowInstance instance = WorkflowInstance.builder().id(20L).initiatorId("1").status("RUNNING").build();
        AtomicLong ids = new AtomicLong(50L);
        when(idGenerator.nextId()).thenAnswer(invocation -> ids.getAndIncrement());
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(instance));
        when(taskRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(task));
        when(userAccountRepository.findById(2L)).thenReturn(Optional.of(UserAccount.builder().id(2L).tenantId(9L).status("ACTIVE").build()));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(UserAccount.builder().id(1L).tenantId(9L).status("ACTIVE").build()));

        workflowEngine.transferTask(10L, "2", "user-a");

        verify(taskRepository).save(task);
        assertThat(task.getStatus()).isEqualTo("PENDING");
        assertThat(task.getAssigneeId()).isEqualTo("2");
        assertThat(task.getCandidateSnapshot()).contains("\"2\"");
        assertThat(objectMapper.readTree(task.getCandidateSnapshot()).path("userIds")).hasSize(1);
    }

    private WorkflowTask pendingCandidateTask(String... candidates) {
        String ids = String.join(",", java.util.Arrays.stream(candidates).map(value -> "\"" + value + "\"").toList());
        return WorkflowTask.builder().id(10L).instanceId(20L).nodeId(30L).status("PENDING")
                .candidateSnapshot("{\"userIds\":[" + ids + "]}").build();
    }
}
