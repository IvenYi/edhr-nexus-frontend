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
export const listPublishedRecordControlWorkflowCandidates = async (
  businessType: RecordControlBusinessType,
) =>
  (await client.get<{ data: PublishedRecordControlWorkflowCandidate[] }>(
    '/workflow/record-control/candidates',
    { params: { businessType } },
  )).data.data;
