import client from './client';

export const login = (params?: Record<string, unknown>) => client.get('/auth', { params });
export const logout = (params?: Record<string, unknown>) => client.get('/auth', { params });
export const getMe = (params?: Record<string, unknown>) => client.get('/auth', { params });
