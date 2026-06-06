import client from './client';

export const listTemplates = (params?: Record<string, unknown>) =>
  client.get('/workflow/templates', { params });
export const getTemplate = (id: number) =>
  client.get(`/workflow/templates/${id}`);
export const createTemplate = (body: Record<string, unknown>) =>
  client.post('/workflow/templates', body);
export const updateTemplate = (id: number, body: Record<string, unknown>) =>
  client.put(`/workflow/templates/${id}`, body);
export const deleteTemplate = (id: number) =>
  client.delete(`/workflow/templates/${id}`);
export const getTemplateVersions = (id: number) =>
  client.get(`/workflow/templates/${id}/versions`);
export const createVersion = (id: number, body: Record<string, unknown>) =>
  client.post(`/workflow/templates/${id}/versions`, body);
export const publishVersion = (versionId: number) =>
  client.post(`/workflow/templates/versions/${versionId}/publish`);
