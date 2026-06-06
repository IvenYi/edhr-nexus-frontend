import client from './client';

export const getFormTemplates = (params?: Record<string, unknown>) =>
  client.get('/form-templates', { params });
export const getFormTemplate = (id: number) =>
  client.get(`/form-templates/${id}`);
export const createFormTemplate = (body: Record<string, unknown>) =>
  client.post('/form-templates', body);
export const updateFormTemplate = (id: number, body: Record<string, unknown>) =>
  client.put(`/form-templates/${id}`, body);
export const deleteFormTemplate = (id: number) =>
  client.delete(`/form-templates/${id}`);
export const getFormTemplateVersions = (id: number) =>
  client.get(`/form-templates/${id}/versions`);
