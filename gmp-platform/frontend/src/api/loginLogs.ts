import client from './client';
import type { PageResult } from '@/types/common';

export interface LoginLogItem {
  id: string | number;
  operatorId?: string | number | null;
  operatorName?: string | null;
  username?: string | null;
  eventType: string;
  eventTypeLabel: string;
  actionLabel: string;
  authMethod: string;
  authMethodLabel: string;
  occurredAt: string;
  platform: string;
  platformLabel: string;
  clientType: string;
  clientTypeLabel: string;
  browser?: string | null;
  ipAddress?: string | null;
}

export interface LoginLogQuery {
  page?: number;
  size?: number;
  eventType?: string;
  keyword?: string;
  startTime?: string;
  endTime?: string;
}

export const getLoginLogs = async (params: LoginLogQuery = {}): Promise<PageResult<LoginLogItem>> => {
  const response = await client.get('/identity/login-logs', { params });
  return response.data.data as PageResult<LoginLogItem>;
};
