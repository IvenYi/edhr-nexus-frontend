import client from './client';
import type { DeletionImpact } from './deletionProtection';

export interface DeletionTarget { type: string; id: string | number }

export async function checkDeletion(target: DeletionTarget, signal: AbortSignal) {
  const response = await client.get<{ data: { allowed: boolean; impact?: DeletionImpact } }>(
    `/master-data/deletion-check/${encodeURIComponent(target.type)}/${encodeURIComponent(target.id)}`, { signal },
  );
  return response.data.data;
}
