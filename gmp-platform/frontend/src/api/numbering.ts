import client from './client';

export const getNumberingRules = (params?: Record<string, unknown>) =>
  client.get('/numbering-rules', { params });
export const getNumberingRule = (id: number) =>
  client.get(`/numbering-rules/${id}`);
export const createNumberingRule = (body: Record<string, unknown>) =>
  client.post('/numbering-rules', body);
export const updateNumberingRule = (id: number, body: Record<string, unknown>) =>
  client.put(`/numbering-rules/${id}`, body);
export const deleteNumberingRule = (id: number) =>
  client.delete(`/numbering-rules/${id}`);
export const previewNumberingRule = (id: number) =>
  client.get(`/numbering-rules/${id}/preview`);
export const generateNumber = (ruleCode: string) =>
  client.post('/numbering-rules/generate', { ruleCode });
