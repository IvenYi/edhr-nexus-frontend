export interface DeletionReference {
  id: string;
  name: string;
  code: string;
  version: string;
  status: string;
  context: string;
  path?: string;
  location?: string;
  navigationHint?: string;
}

export interface DeletionImpact {
  kind: 'DELETION_BLOCKED';
  targetName: string;
  targetCode: string;
  targetType: string;
  targetId: string;
  targetModule: string;
  groups: Array<{
    key: string;
    label: string;
    module: string;
    path?: string;
    guidance: string;
    count: number;
    restricted: boolean;
    dataType?: 'BUSINESS' | 'RETAINED' | 'ORPHAN';
    records: DeletionReference[];
  }>;
}

export const DELETION_BLOCKED_EVENT = 'edhr:deletion-blocked';

export function showDeletionProtection(data: unknown) {
  if (data && typeof data === 'object' && 'kind' in data && data.kind === 'DELETION_BLOCKED') {
    window.dispatchEvent(new CustomEvent(DELETION_BLOCKED_EVENT, { detail: data }));
  }
}
