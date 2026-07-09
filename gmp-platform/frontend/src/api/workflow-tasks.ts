import client from './client';

export const getTodo = (params?: Record<string, unknown>) => client.get('/workflow/tasks', { params });
export const getDone = (params?: Record<string, unknown>) => client.get('/workflow/tasks', { params });
export const getTask = (params?: Record<string, unknown>) => client.get('/workflow/tasks', { params });
export const approve = (params?: Record<string, unknown>) => client.get('/workflow/tasks', { params });
export const reject = (params?: Record<string, unknown>) => client.get('/workflow/tasks', { params });
export const transfer = (params?: Record<string, unknown>) => client.get('/workflow/tasks', { params });
export const submit = (params?: Record<string, unknown>) => client.get('/workflow/tasks', { params });
