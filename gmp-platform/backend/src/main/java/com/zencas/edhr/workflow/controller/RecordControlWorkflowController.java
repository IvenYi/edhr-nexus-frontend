package com.zencas.edhr.workflow.controller;

import com.zencas.edhr.common.dto.ApiResponse;
import com.zencas.edhr.common.exception.BusinessException;
import com.zencas.edhr.common.exception.ErrorCode;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.PublishedCandidate;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowPort;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;

/** Read boundary used by record-control application screens to select a published workflow. */
@RestController
@RequestMapping("/api/v1/workflow/record-control")
@RequiredArgsConstructor
public class RecordControlWorkflowController {

    private final RecordControlWorkflowPort workflowPort;

    @GetMapping("/candidates")
    @PreAuthorize("#businessType != null and "
            + "((#businessType.equalsIgnoreCase('CHANGE') and hasAuthority('record-control.corrections.create')) "
            + "or (#businessType.equalsIgnoreCase('OBSOLETE') and hasAuthority('record-control.voids.create')))" )
    public ApiResponse<List<PublishedCandidate>> listCandidates(@RequestParam String businessType) {
        return ApiResponse.success(workflowPort.listPublishedCandidates(parseBusinessType(businessType)));
    }

    private BusinessType parseBusinessType(String value) {
        try {
            return BusinessType.valueOf(value == null ? "" : value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(ErrorCode.WF_013);
        }
    }
}
