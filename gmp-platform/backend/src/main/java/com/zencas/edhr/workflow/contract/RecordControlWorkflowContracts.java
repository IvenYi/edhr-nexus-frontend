package com.zencas.edhr.workflow.contract;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Stable boundary objects shared by the workflow and record-control domains.
 * Record-control owns applications and business effects; workflow owns routing and tasks.
 */
public final class RecordControlWorkflowContracts {

    public static final String CHANGE_PAGE_PERMISSION = "record-control.corrections";
    public static final String CHANGE_CREATE_PERMISSION = "record-control.corrections.create";
    public static final String OBSOLETE_PAGE_PERMISSION = "record-control.voids";
    public static final String OBSOLETE_CREATE_PERMISSION = "record-control.voids.create";
    public static final String VIEW_ALL_PERMISSION = "record-control.requests.all";

    private RecordControlWorkflowContracts() {
    }

    public enum BusinessType {
        CHANGE,
        OBSOLETE
    }

    public enum TaskAction {
        APPROVE,
        RETURN,
        TRANSFER
    }

    public enum Result {
        APPROVED,
        RETURNED,
        WITHDRAWN
    }

    public record PublishedCandidate(
            String workflowDefinitionId,
            String workflowVersionId,
            String templateName,
            String templateCode,
            Integer versionNumber,
            BusinessType businessType,
            String status
    ) {
    }

    public record StartCommand(
            String requestId,
            BusinessType businessType,
            String workflowDefinitionId,
            String workflowVersionId,
            String applicantId,
            String applicantSignatureId,
            String idempotencyKey,
            String auditCorrelationId
    ) {
    }

    public record StartResult(
            String requestId,
            String workflowInstanceId,
            String workflowDefinitionId,
            String workflowVersionId,
            String workflowStatus,
            List<String> currentNodeIds,
            LocalDateTime startedAt,
            String auditCorrelationId,
            String workflowSnapshotHash
    ) {
    }

    public record CompleteTaskCommand(
            String taskId,
            TaskAction action,
            String opinion,
            String signatureId
    ) {
    }

    public record TransferTaskCommand(
            String taskId,
            String targetUserId,
            String reason,
            String signatureId
    ) {
    }

    public record WithdrawCommand(
            String requestId,
            String workflowInstanceId,
            String reason,
            String auditCorrelationId
    ) {
    }

    public record ManagerialReassignmentCommand(
            String workflowInstanceId,
            String taskId,
            String targetUserId,
            String reason,
            String signatureId,
            String auditCorrelationId
    ) {
    }

    public record WorkflowResultEvent(
            String eventId,
            String workflowInstanceId,
            String workflowDefinitionId,
            String workflowVersionId,
            BusinessType businessType,
            String businessId,
            Result result,
            LocalDateTime occurredAt,
            String operatorId,
            String signatureId,
            String auditCorrelationId,
            String workflowSnapshotHash
    ) {
    }

    public record BusinessDetailProjection(
            String requestId,
            String requestNo,
            BusinessType requestType,
            String requestStatus,
            String sourceRecordId,
            String sourceRevisionId,
            String reasonCode,
            String reasonText,
            String applicantId,
            String applicantName,
            LocalDateTime submittedAt,
            String impactAssessmentSummary,
            String correctionDiffSummary,
            String workflowInstanceId
    ) {
    }
}
