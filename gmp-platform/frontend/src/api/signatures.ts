import client from './client';

export const getSignatures = (params?: Record<string, unknown>) =>
  client.get('/signatures', { params });
export const getSignature = (id: number) =>
  client.get(`/signatures/${id}`);
export const createSignature = (body: Record<string, unknown>) =>
  client.post('/signatures', body);
export const verifySignature = (id: number) =>
  client.post(`/signatures/${id}/verify`);
