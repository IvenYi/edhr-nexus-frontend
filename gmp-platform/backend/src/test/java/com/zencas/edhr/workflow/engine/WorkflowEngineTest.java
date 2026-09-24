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
    void explicitlyStartsPublishedRecordControlVersionWithoutStartTaskAndExcludesApplicant() throws Exception {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(100L).type("RECORD_CONTROL").businessType("CHANGE").status("PUBLISHED").build();
        WorkflowDefinitionVersion version = WorkflowDefinitionVersion.builder()
                .id(200L).definitionId(100L).status("PUBLISHED").isCurrent(true)
                .nodesJson("[{\"id\":300}]").edgesJson("[{\"source\":300,\"target\":301}]").build();
        WorkflowNode start = WorkflowNode.builder()
                .id(300L).versionId(200L).nodeType("START").name("发起").build();
        WorkflowNode approval = WorkflowNode.builder()
                .id(301L).versionId(200L).nodeType("APPROVAL").name("审批")
                .properties("{\"config\":{\"approverSubjects\":[{\"type\":\"ROLE\",\"id\":9}]}}")
                .build();
        WorkflowEdge edge = WorkflowEdge.builder().sourceNodeId(300L).targetNodeId(301L).build();
        AtomicLong ids = new AtomicLong(1L);
        when(idGenerator.nextId()).thenAnswer(invocation -> ids.getAndIncrement());
        when(instanceRepository.findByIdempotencyKey("idem-1")).thenReturn(Optional.empty());
        when(definitionRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(200L)).thenReturn(Optional.of(version));
        when(nodeRepository.findByVersionIdAndNodeType(200L, "START")).thenReturn(List.of(start));
        when(nodeRepository.findByVersionId(200L)).thenReturn(List.of(start, approval));
        when(edgeRepository.findBySourceNodeId(300L)).thenReturn(List.of(edge));
        when(instanceRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(instanceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(taskRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(actionLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(
                UserAccount.builder().id(1L).tenantId(5L).status("ACTIVE").build()));
        when(subjectResolver.resolve(eq(5L), any())).thenReturn(new SubjectResolution(
                List.of(
                        new ResolvedSubjectUser(1L, Set.of(new SubjectReference(SubjectReference.SubjectType.ROLE, 9L, null))),
                        new ResolvedSubjectUser(2L, Set.of(new SubjectReference(SubjectReference.SubjectType.ROLE, 9L, null)))),
                Set.of()));

        WorkflowInstance instance = workflowEngine.createRecordControlInstance(
                100L, 200L, "CHANGE", "request-1", "1", 700L, "idem-1", "audit-1");

        ArgumentCaptor<WorkflowTask> taskCaptor = ArgumentCaptor.forClass(WorkflowTask.class);
        verify(taskRepository, times(1)).save(taskCaptor.capture());
        WorkflowTask firstTask = taskCaptor.getValue();
        assertThat(firstTask.getNodeId()).isEqualTo(301L);
        assertThat(objectMapper.readTree(firstTask.getCandidateSnapshot()).path("userIds").toString())
                .isEqualTo("[\"2\"]");
        assertThat(instance.getDefinitionId()).isEqualTo(100L);
        assertThat(instance.getVersionId()).isEqualTo(200L);
        assertThat(instance.getCurrentNodeIds()).isEqualTo("301");
        assertThat(instance.getAuditCorrelationId()).isEqualTo("audit-1");
        assertThat(instance.getWorkflowSnapshotHash()).hasSize(64);
        assertThat(instance.getContextSnapshot()).contains("\"applicantSignatureId\":\"700\"");
        verifyNoInteractions(bindingRuleRepository);
    }

    @Test
    void explicitRecordControlStartIsIdempotentForSameFrozenRequest() {
        WorkflowInstance existing = WorkflowInstance.builder()
                .id(1L).definitionId(100L).versionId(200L).businessType("CHANGE")
                .businessId("request-1").initiatorId("1").auditCorrelationId("audit-1")
                .idempotencyKey("idem-1").contextSnapshot("{\"applicantSignatureId\":\"700\"}")
                .status("RUNNING").build();
        when(instanceRepository.findByIdempotencyKey("idem-1")).thenReturn(Optional.of(existing));

        WorkflowInstance result = workflowEngine.createRecordControlInstance(
                100L, 200L, "CHANGE", "request-1", "1", 700L, "idem-1", "audit-1");

        assertThat(result).isSameAs(existing);
        verify(instanceRepository, never()).saveAndFlush(any());
        verifyNoInteractions(definitionRepository, versionRepository, nodeRepository, taskRepository);
    }

    @Test
    void dhrUsesFrozenPublishedVersionEvenWhenNoLongerCurrent() {
        var definition = WorkflowDefinition.builder().id(100L).type("RECORD_CONTROL").businessType("DHR_SUMMARY").status("PUBLISHED").build();
        var version = WorkflowDefinitionVersion.builder().id(200L).definitionId(100L).status("PUBLISHED").isCurrent(false).nodesJson("[]").edgesJson("[]").build();
        var start = WorkflowNode.builder().id(300L).versionId(200L).nodeType("START").build();
        var approval = WorkflowNode.builder().id(301L).versionId(200L).nodeType("APPROVAL").name("质量审核").properties("{}").build();
        when(definitionRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(200L)).thenReturn(Optional.of(version));
        when(nodeRepository.findByVersionIdAndNodeType(200L,"START")).thenReturn(List.of(start));
        when(nodeRepository.findByVersionId(200L)).thenReturn(List.of(start,approval));
        when(edgeRepository.findBySourceNodeId(300L)).thenReturn(List.of(WorkflowEdge.builder().targetNodeId(301L).build()));
        when(instanceRepository.saveAndFlush(any())).thenAnswer(i -> i.getArgument(0));
        when(userAccountRepository.findById(1L)).thenReturn(Optional.of(UserAccount.builder().tenantId(5L).build()));
        var result = workflowEngine.createDhrSummaryInstance(100L,200L,"900","1");
        assertThat(result.getVersionId()).isEqualTo(200L);
        assertThat(result.getBusinessId()).isEqualTo("900");
        assertThat(result.getIdempotencyKey()).isEqualTo("DHR_SUMMARY:900");
        verify(taskRepository).save(argThat(task -> task.getNodeId().equals(301L)));
        verifyNoInteractions(bindingRuleRepository);
    }

    @Test
    void genericTaskCompletionCannotBypassDhrDomainChecks() {
        var task = WorkflowTask.builder().id(2L).instanceId(3L).build();
        var instance = WorkflowInstance.builder().id(3L).businessType("DHR_SUMMARY").status("RUNNING").build();
        when(taskRepository.findById(2L)).thenReturn(Optional.of(task));
        when(instanceRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(instance));
        assertThatThrownBy(() -> workflowEngine.completeTask(2L,"APPROVE","","1",null)).hasMessageContaining("DHR 审核入口");
        verify(taskRepository,never()).save(any());
        assertThatThrownBy(() -> workflowEngine.createInstance("DHR_SUMMARY","900","1")).hasMessageContaining("DHR 汇总");
    }

    @Test
    void explicitRecordControlStartRejectsMismatchedIdempotencyReuse() {
        WorkflowInstance existing = WorkflowInstance.builder()
                .id(1L).definitionId(100L).versionId(200L).businessType("CHANGE")
                .businessId("request-1").initiatorId("1").auditCorrelationId("audit-1")
                .idempotencyKey("idem-1").contextSnapshot("{\"applicantSignatureId\":\"700\"}")
                .status("RUNNING").build();
        when(instanceRepository.findByIdempotencyKey("idem-1")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> workflowEngine.createRecordControlInstance(
                100L, 201L, "CHANGE", "request-1", "1", 700L, "idem-1", "audit-1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("幂等键冲突");
    }

    @Test
    void explicitRecordControlStartRejectsDraftOrMismatchedVersion() {
        WorkflowDefinition definition = WorkflowDefinition.builder()
                .id(100L).type("RECORD_CONTROL").businessType("CHANGE").status("PUBLISHED").build();
        WorkflowDefinitionVersion draft = WorkflowDefinitionVersion.builder()
                .id(200L).definitionId(100L).status("DRAFT").isCurrent(false).build();
        when(instanceRepository.findByIdempotencyKey("idem-1")).thenReturn(Optional.empty());
        when(definitionRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(definition));
        when(versionRepository.findById(200L)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> workflowEngine.createRecordControlInstance(
                100L, 200L, "CHANGE", "request-1", "1", 700L, "idem-1", "audit-1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不可用于发起");
    }

    @Test
    void explicitRecordControlStartRejectsMissingApplicantSignatureAtEngineBoundary() {
        assertThatThrownBy(() -> workflowEngine.createRecordControlInstance(
                100L, 200L, "CHANGE", "request-1", "1", null, "idem-1", "audit-1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("发起参数不完整");

        verifyNoInteractions(definitionRepository, versionRepository, nodeRepository, taskRepository);
    }

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
    void parallelBranchesJoinOnlyAfterEveryApprovalCompletes() {
        WorkflowTask branchA = WorkflowTask.builder().id(11L).instanceId(20L).nodeId(31L).status("PENDING")
                .candidateSnapshot("{\"unrestricted\":true}").build();
        WorkflowTask branchB = WorkflowTask.builder().id(12L).instanceId(20L).nodeId(32L).status("PENDING")
                .candidateSnapshot("{\"unrestricted\":true}").build();
        WorkflowInstance instance = WorkflowInstance.builder().id(20L).versionId(200L).status("RUNNING").currentNodeIds("31,32").build();
        WorkflowNode nodeA = WorkflowNode.builder().id(31L).versionId(200L).nodeType("APPROVAL").name("审核A").build();
        WorkflowNode nodeB = WorkflowNode.builder().id(32L).versionId(200L).nodeType("APPROVAL").name("审核B").build();
        WorkflowNode join = WorkflowNode.builder().id(33L).versionId(200L).nodeType("PARALLEL_JOIN").name("聚合").build();
        WorkflowNode end = WorkflowNode.builder().id(34L).versionId(200L).nodeType("END").name("结束").build();
        WorkflowEdge aJoin = WorkflowEdge.builder().sourceNodeId(31L).targetNodeId(33L).build();
        WorkflowEdge bJoin = WorkflowEdge.builder().sourceNodeId(32L).targetNodeId(33L).build();
        WorkflowEdge joinEnd = WorkflowEdge.builder().sourceNodeId(33L).targetNodeId(34L).build();
        when(taskRepository.findById(11L)).thenReturn(Optional.of(branchA));
        when(taskRepository.findById(12L)).thenReturn(Optional.of(branchB));
        when(taskRepository.findByIdForUpdate(11L)).thenReturn(Optional.of(branchA));
        when(taskRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(branchB));
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(instance));
        when(nodeRepository.findById(31L)).thenReturn(Optional.of(nodeA));
        when(nodeRepository.findById(32L)).thenReturn(Optional.of(nodeB));
        when(nodeRepository.findByVersionId(200L)).thenReturn(List.of(nodeA, nodeB, join, end));
        when(edgeRepository.findBySourceNodeId(31L)).thenReturn(List.of(aJoin));
        when(edgeRepository.findBySourceNodeId(32L)).thenReturn(List.of(bJoin));
        when(edgeRepository.findBySourceNodeId(33L)).thenReturn(List.of(joinEnd));
        when(edgeRepository.findByTargetNodeId(33L)).thenReturn(List.of(aJoin, bJoin));
        when(taskRepository.findByInstanceId(20L)).thenReturn(List.of(branchA, branchB));

        workflowEngine.completeTask(11L, "APPROVE", null, "user-a", null);
        assertThat(instance.getStatus()).isEqualTo("RUNNING");
        assertThat(instance.getCurrentNodeIds()).isEqualTo("32");

        workflowEngine.completeTask(12L, "APPROVE", null, "user-b", null);
        assertThat(instance.getStatus()).isEqualTo("COMPLETED");
        assertThat(instance.getCurrentNodeIds()).isNull();
    }

    @Test
    void rejectingParallelBranchTerminatesOtherPendingBranch() {
        WorkflowTask rejected = pendingCandidateTask("user-a");
        WorkflowTask sibling = WorkflowTask.builder().id(12L).instanceId(20L).nodeId(32L).status("PENDING").build();
        WorkflowInstance instance = WorkflowInstance.builder().id(20L).status("RUNNING").build();
        WorkflowNode split = WorkflowNode.builder().id(29L).nodeType("PARALLEL_SPLIT").name("并行拆分").build();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(rejected));
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(instance));
        when(taskRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(rejected));
        when(taskRepository.findByInstanceId(20L)).thenReturn(List.of(rejected, sibling));
        when(edgeRepository.findByTargetNodeId(30L)).thenReturn(List.of(WorkflowEdge.builder().sourceNodeId(29L).targetNodeId(30L).build()));
        when(nodeRepository.findById(29L)).thenReturn(Optional.of(split));

        workflowEngine.completeTask(10L, "REJECT", "退回", "user-a", null);

        assertThat(sibling.getStatus()).isEqualTo("TERMINATED");
        assertThat(instance.getStatus()).isEqualTo("TERMINATED");
        verify(taskRepository).save(sibling);
    }

    @Test
    void rejectingDeepParallelBranchTerminatesRoundInsteadOfReopeningPreviousApproval() {
        WorkflowTask rejected = pendingCandidateTask("user-a");
        WorkflowTask sibling = WorkflowTask.builder().id(12L).instanceId(20L).nodeId(40L).status("PENDING").build();
        WorkflowInstance instance = WorkflowInstance.builder().id(20L).status("RUNNING").currentNodeIds("30,40").build();
        WorkflowNode firstApproval = WorkflowNode.builder().id(31L).nodeType("APPROVAL").name("分支A一级审核").build();
        WorkflowNode split = WorkflowNode.builder().id(29L).nodeType("PARALLEL_SPLIT").name("并行拆分").build();
        when(taskRepository.findById(10L)).thenReturn(Optional.of(rejected));
        when(instanceRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(instance));
        when(taskRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(rejected));
        when(taskRepository.findByInstanceId(20L)).thenReturn(List.of(rejected, sibling));
        when(edgeRepository.findByTargetNodeId(30L)).thenReturn(List.of(
                WorkflowEdge.builder().sourceNodeId(31L).targetNodeId(30L).build()));
        when(edgeRepository.findByTargetNodeId(31L)).thenReturn(List.of(
                WorkflowEdge.builder().sourceNodeId(29L).targetNodeId(31L).build()));
        when(nodeRepository.findById(31L)).thenReturn(Optional.of(firstApproval));
        when(nodeRepository.findById(29L)).thenReturn(Optional.of(split));

        workflowEngine.completeTask(10L, "REJECT", "退回", "user-a", null);

        assertThat(sibling.getStatus()).isEqualTo("TERMINATED");
        assertThat(instance.getStatus()).isEqualTo("TERMINATED");
        assertThat(instance.getCurrentNodeIds()).isNull();
        verify(taskRepository, times(2)).save(any(WorkflowTask.class));
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
