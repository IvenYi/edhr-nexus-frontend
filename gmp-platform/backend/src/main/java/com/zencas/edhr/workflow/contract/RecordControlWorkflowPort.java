package com.zencas.edhr.workflow.contract;

import java.util.List;

import static com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessType;
import static com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.PublishedCandidate;
import static com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.StartCommand;
import static com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.StartResult;

/** Public workflow capabilities consumed by the record-control application domain. */
public interface RecordControlWorkflowPort {

    List<PublishedCandidate> listPublishedCandidates(BusinessType businessType);

    StartResult start(StartCommand command);
}
