import client from './client';
import type { PageResult } from '@/types/common';

export interface AuditLogItem {
  id: string | number;
  entityType?: string;
  entityId?: string | number;
  action?: string;
  actionLabel?: string;
  operatorId?: string;
  operatorDisplayName?: string;
  operatorAccount?: string;
  operationTime?: string;
  triggerMethod?: string;
  triggerMethodLabel?: string;
  moduleName?: string;
  menuName?: string;
  functionName?: string;
  dataSummary?: string;
  contentBefore?: unknown;
  contentAfter?: unknown;
  snapshotHash?: string;
  reason?: string;
  ipAddress?: string;
  createdAt?: string;
}

export const getAuditLogs = (params?: Record<string, unknown>) =>
  client.get('/audit/logs', { params });
export const getMyAuditLogs = async (params?: Record<string, unknown>): Promise<PageResult<AuditLogItem>> => {
  const response = await client.get('/audit/logs/me', { params });
  return response.data.data as PageResult<AuditLogItem>;
};
export const getAuditLog = (id: number) =>
  client.get(`/audit/logs/${id}`);
export const exportAuditLogs = (params?: Record<string, unknown>) =>
  client.get('/audit/logs/export', { params });
