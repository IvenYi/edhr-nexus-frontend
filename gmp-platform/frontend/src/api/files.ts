import client from './client';

export const upload = (params?: Record<string, unknown>) => client.get('/files', { params });
export const download = (params?: Record<string, unknown>) => client.get('/files', { params });
export const preview = (params?: Record<string, unknown>) => client.get('/files', { params });
export const deleteFile = (params?: Record<string, unknown>) => client.get('/files', { params });
export const getFiles = (params?: Record<string, unknown>) => client.get('/files', { params });
