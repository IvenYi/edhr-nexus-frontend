package com.zencas.edhr.workflow.contract;

import static com.zencas.edhr.workflow.contract.RecordControlWorkflowContracts.BusinessDetailProjection;

/** Business projection supplied by record-control for workflow task and instance views. */
public interface RecordControlBusinessProjectionPort {

    BusinessDetailProjection getByRequestId(String requestId);
}
