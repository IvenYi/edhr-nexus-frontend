import client from './client';

export interface DhrImpactNotification {
  id: string;
  dhrNo: string;
  versionNo: number;
  instanceNo: string;
  action: 'CHANGE' | 'OBSOLETE';
  occurredAt: string;
  read: boolean;
}

export async function listDhrImpactNotifications(page: number): Promise<{ content: DhrImpactNotification[]; total: number; unreadCount: number }> {
  return (await client.get('/dhr-impact-notifications', { params: { page } })).data.data;
}

export async function readDhrImpactNotification(id: string): Promise<void> {
  await client.post(`/dhr-impact-notifications/${encodeURIComponent(id)}/read`);
}
