import client from './client';

export const getBindingRules = (params?: Record<string, unknown>) =>
  client.get('/workflow/binding-rules', { params });
export const createBindingRule = (body: Record<string, unknown>) =>
  client.post('/workflow/binding-rules', body);
export const updateBindingRule = (id: number, body: Record<string, unknown>) =>
  client.put(`/workflow/binding-rules/${id}`, body);
export const deleteBindingRule = (id: number) =>
  client.delete(`/workflow/binding-rules/${id}`);
