import client from './client';

export const listTemplates = (params?: Record<string, unknown>) =>
  client.get('/workflow/transaction-templates', { params });
export const getTemplate = (id: number) =>
  client.get(`/workflow/transaction-templates/${id}`);
export const createTemplate = (body: Record<string, unknown>) =>
  client.post('/workflow/transaction-templates', body);
export const updateTemplate = (id: number, body: Record<string, unknown>) =>
  client.put(`/workflow/transaction-templates/${id}`, body);
