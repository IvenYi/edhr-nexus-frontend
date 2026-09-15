package com.zencas.edhr.workflow.contract;

import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.WithdrawCommand;
import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.WorkflowResultEvent;

/**
 * Restricted withdrawal capability called by the record-control application service.
 * The record-control domain owns the external endpoint and business-state transaction;
 * the workflow domain owns withdrawal eligibility and pending-task invalidation.
 */
public interface RecordControlWorkflowWithdrawalPort {

    WorkflowResultEvent withdraw(WithdrawCommand command);
}
