import client from './client';

export type RecordControlBusinessType = 'CHANGE' | 'OBSOLETE';

export type PublishedRecordControlWorkflowCandidate = {
  workflowDefinitionId: string;
  workflowVersionId: string;
  templateName: string;
  templateCode?: string | null;
  versionNumber: number;
  businessType: RecordControlBusinessType;
  status: 'PUBLISHED';
};

/**
 * Public workflow query consumed by the record-control application wizard.
 * Application eligibility and source-record checks remain owned by record-control.
 */
export const listPublishedRecordControlWorkflowCandidates = (
  businessType: RecordControlBusinessType,
) =>
  client.get<PublishedRecordControlWorkflowCandidate[]>(
    '/workflow/record-control/candidates',
    { params: { businessType } },
  );
