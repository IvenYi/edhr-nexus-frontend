import client from './client';

export const login = (body: Record<string, unknown>) => client.post('/auth/login', body);
export const logout = () => client.post('/auth/logout');
export const getMe = () => client.get('/auth/me', { skipAuthRedirect: true });
