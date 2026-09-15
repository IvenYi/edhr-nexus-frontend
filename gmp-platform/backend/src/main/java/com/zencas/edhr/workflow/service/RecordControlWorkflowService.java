package com.zencas.edhr.workflow.service;

import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.PublishedCandidate;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.StartCommand;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.StartResult;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowPort;
import com.zencas.edhr.workflow.engine.WorkflowEngine;
import com.zencas.edhr.workflow.entity.WorkflowDefinition;
import com.zencas.edhr.workflow.entity.WorkflowDefinitionVersion;
import com.zencas.edhr.workflow.entity.WorkflowInstance;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionRepository;
import com.zencas.edhr.workflow.repository.WorkflowDefinitionVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/** Workflow-side implementation of the record-control integration boundary. */
@Service
@RequiredArgsConstructor
public class RecordControlWorkflowService implements RecordControlWorkflowPort {

    private static final String DEFINITION_TYPE = "RECORD_CONTROL";
    private static final String PUBLISHED = "PUBLISHED";

    private final WorkflowDefinitionRepository definitionRepository;
    private final WorkflowDefinitionVersionRepository versionRepository;
    private final WorkflowEngine workflowEngine;

    @Override
    @Transactional(readOnly = true)
    public List<PublishedCandidate> listPublishedCandidates(BusinessType businessType) {
        if (businessType == null) {
            throw new BusinessException(ErrorCode.WF_013);
        }
        return definitionRepository
                .findByTypeAndBusinessTypeAndStatusOrderByNameAsc(DEFINITION_TYPE, businessType.name(), PUBLISHED)
                .stream()
                .map(this::toPublishedCandidate)
                .flatMap(java.util.Optional::stream)
                .toList();
    }

    @Override
    @Transactional
    public StartResult start(StartCommand command) {
        validateStartCommand(command);
        WorkflowInstance instance = workflowEngine.createRecordControlInstance(
                parseId(command.workflowDefinitionId(), ErrorCode.WF_001),
                parseId(command.workflowVersionId(), ErrorCode.WF_010),
                command.businessType().name(),
                command.requestId(),
                command.applicantId(),
                parseNullableId(command.applicantSignatureId(), ErrorCode.SIG_003),
                command.idempotencyKey(),
                command.auditCorrelationId());
        return new StartResult(
                command.requestId(),
                instance.getId().toString(),
                instance.getDefinitionId().toString(),
                instance.getVersionId().toString(),
                instance.getStatus(),
                splitNodeIds(instance.getCurrentNodeIds()),
                instance.getStartedAt(),
                instance.getAuditCorrelationId(),
                instance.getWorkflowSnapshotHash());
    }

    private java.util.Optional<PublishedCandidate> toPublishedCandidate(WorkflowDefinition definition) {
        return versionRepository.findByDefinitionIdAndIsCurrentTrue(definition.getId())
                .filter(version -> PUBLISHED.equals(version.getStatus()))
                .map(version -> new PublishedCandidate(
                        definition.getId().toString(),
                        version.getId().toString(),
                        definition.getName(),
                        definition.getCode(),
                        version.getVersionNumber(),
                        BusinessType.valueOf(definition.getBusinessType()),
                        version.getStatus()));
    }

    private void validateStartCommand(StartCommand command) {
        if (command == null || command.businessType() == null) {
            throw new BusinessException(ErrorCode.WF_013);
        }
        requireText(command.requestId(), ErrorCode.GENERAL_001, "申请 ID 不能为空");
        requireText(command.workflowDefinitionId(), ErrorCode.WF_001, "流程定义 ID 不能为空");
        requireText(command.workflowVersionId(), ErrorCode.WF_010, "流程版本 ID 不能为空");
        requireText(command.applicantId(), ErrorCode.AUTH_004, "申请人不能为空");
        requireText(command.applicantSignatureId(), ErrorCode.SIG_003, "申请人签名不能为空");
        requireText(command.idempotencyKey(), ErrorCode.WF_015, "幂等键不能为空");
        requireText(command.auditCorrelationId(), ErrorCode.GENERAL_001, "审计关联 ID 不能为空");
    }

    private void requireText(String value, ErrorCode errorCode, String message) {
        if (value == null || value.isBlank()) {
            throw new BusinessException(errorCode, message);
        }
    }

    private Long parseId(String value, ErrorCode errorCode) {
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException exception) {
            throw new BusinessException(errorCode);
        }
    }

    private Long parseNullableId(String value, ErrorCode errorCode) {
        return value == null ? null : parseId(value, errorCode);
    }

    private List<String> splitNodeIds(String currentNodeIds) {
        if (currentNodeIds == null || currentNodeIds.isBlank()) {
            return List.of();
        }
        return Arrays.stream(currentNodeIds.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
}
