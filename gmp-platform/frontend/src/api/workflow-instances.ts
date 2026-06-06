import client from './client';

export const listInstances = (params?: Record<string, unknown>) =>
  client.get('/workflow/instances', { params });
export const getInstance = (id: number) =>
  client.get(`/workflow/instances/${id}`);
export const createInstance = (body: Record<string, unknown>) =>
  client.post('/workflow/instances', body);
export const terminateInstance = (id: number) =>
  client.post(`/workflow/instances/${id}/terminate`);
