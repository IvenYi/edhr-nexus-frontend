import client from './client';

export const getAuditLogs = (params?: Record<string, unknown>) =>
  client.get('/audit/logs', { params });
export const getAuditLog = (id: number) =>
  client.get(`/audit/logs/${id}`);
export const exportAuditLogs = (params?: Record<string, unknown>) =>
  client.get('/audit/logs/export', { params });
