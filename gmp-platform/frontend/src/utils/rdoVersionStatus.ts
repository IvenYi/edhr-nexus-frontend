import type { ChipProps } from '@mui/material';

export type RdoVersionStatusMeta = {
  label: string;
  color: ChipProps['color'];
};

const ACTIVE_STATUS: RdoVersionStatusMeta = { label: '生效', color: 'success' };
const EXPIRED_STATUS: RdoVersionStatusMeta = { label: '失效', color: 'error' };
const EMPTY_STATUS: RdoVersionStatusMeta = { label: '-', color: 'default' };

export const rdoVersionStatusOptions = [
  { value: 'ALL', label: '全部' },
  { value: 'ACTIVE', label: '生效' },
  { value: 'EXPIRED', label: '失效' },
] as const;

/**
 * MVP/1.0 presentation contract: RDO versions expose only two runtime states.
 * Legacy persisted lifecycle values remain compatible at the API boundary but
 * are non-referenceable. Future version-governance UI must build on this
 * shared mapping and must not imply a current/default version or an automatic
 * upgrade of concrete version references.
 */
export function getRdoVersionStatusMeta(status?: string | null): RdoVersionStatusMeta {
  if (!status) return EMPTY_STATUS;
  return status === 'ACTIVE' ? ACTIVE_STATUS : EXPIRED_STATUS;
}
