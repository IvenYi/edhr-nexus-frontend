import client from './client';

export const listTemplates = (params?: Record<string, unknown>) =>
  client.get('/workflow/review-templates', { params });
export const getTemplate = (id: number) =>
  client.get(`/workflow/review-templates/${id}`);
export const createTemplate = (body: Record<string, unknown>) =>
  client.post('/workflow/review-templates', body);
export const updateTemplate = (id: number, body: Record<string, unknown>) =>
  client.put(`/workflow/review-templates/${id}`, body);
export const deleteTemplate = (id: number) =>
  client.delete(`/workflow/review-templates/${id}`);
export const getTemplateVersions = (id: number) =>
  client.get(`/workflow/review-templates/${id}/versions`);
export const createVersion = (id: number, body: Record<string, unknown>) =>
  client.post(`/workflow/review-templates/${id}/versions`, body);
export const publishVersion = (definitionId: number, versionId: number) =>
  client.post(`/workflow/review-templates/${definitionId}/versions/${versionId}/publish`);
