import client from './client';

export type ReviewTemplateId = string | number;

export const listTemplates = (params?: Record<string, unknown>) =>
  client.get('/workflow/review-templates', { params });
export const getTemplate = (id: ReviewTemplateId) =>
  client.get(`/workflow/review-templates/${id}`);
export const createTemplate = (body: Record<string, unknown>) =>
  client.post('/workflow/review-templates', body);
export const updateTemplate = (id: ReviewTemplateId, body: Record<string, unknown>) =>
  client.put(`/workflow/review-templates/${id}`, body);
export const deleteTemplate = (id: ReviewTemplateId) =>
  client.delete(`/workflow/review-templates/${id}`);
export const getTemplateVersions = (id: ReviewTemplateId) =>
  client.get(`/workflow/review-templates/${id}/versions`);
export const createVersion = (id: ReviewTemplateId, body: Record<string, unknown>) =>
  client.post(`/workflow/review-templates/${id}/versions`, body);
export const publishVersion = (definitionId: ReviewTemplateId, versionId: ReviewTemplateId) =>
  client.post(`/workflow/review-templates/${definitionId}/versions/${versionId}/publish`);
export const saveTemplateGraph = (definitionId: ReviewTemplateId, versionId: ReviewTemplateId, graph: Record<string, unknown>) =>
  client.put(`/workflow/review-templates/${definitionId}/versions/${versionId}/graph`, graph);

export const getReviewTemplate = getTemplate;
export const getReviewTemplateVersions = getTemplateVersions;
export const getReviewTemplateVersion = (id: ReviewTemplateId, versionId: ReviewTemplateId) =>
  client.get(`/workflow/review-templates/${id}/versions/${versionId}`);
export const createReviewTemplateVersion = (id: ReviewTemplateId) =>
  client.post(`/workflow/review-templates/${id}/versions`);
export const saveReviewTemplateGraph = saveTemplateGraph;
export const publishReviewTemplateVersion = publishVersion;
