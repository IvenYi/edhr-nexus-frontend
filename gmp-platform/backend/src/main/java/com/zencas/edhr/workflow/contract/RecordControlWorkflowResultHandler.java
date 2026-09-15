package com.zencas.edhr.workflow.contract;

import com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.WorkflowResultEvent;

/**
 * Synchronous P0 result boundary implemented by record-control.
 * The workflow transaction calls this handler before committing a terminal review result.
 */
public interface RecordControlWorkflowResultHandler {

    void handle(WorkflowResultEvent event);
}
