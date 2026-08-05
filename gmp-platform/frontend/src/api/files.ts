import client from './client';

export const upload = (params?: Record<string, unknown>) => client.get('/files', { params });
export const download = (params?: Record<string, unknown>) => client.get('/files', { params });
export const preview = (params?: Record<string, unknown>) => client.get('/files', { params });
export const deleteFile = (params?: Record<string, unknown>) => client.get('/files', { params });
export const getFiles = (params?: Record<string, unknown>) => client.get('/files', { params });
export const getFilePreviewBlob = (id: number | string) =>
  client.get(`/files/${id}/preview`, { responseType: 'blob' });

export const getFileDownloadBlob = (id: number | string) =>
  client.get(`/files/${id}/download`, { responseType: 'blob' });

export const uploadDocumentFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetType', 'DOCUMENT_VERSION');
  return client.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<{ data: { data: { fileId: string; originalName: string; mimeType: string } } }>;
};
