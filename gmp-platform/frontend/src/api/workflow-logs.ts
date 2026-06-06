import client from './client';

export const getInstanceLogs = (instanceId: number, params?: Record<string, unknown>) =>
  client.get(`/workflow/instances/${instanceId}/logs`, { params });
export const getLog = (logId: number) =>
  client.get(`/workflow/logs/${logId}`);
