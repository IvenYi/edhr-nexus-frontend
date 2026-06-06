import client from './client';

// Tenants
export const getTenants = (params?: Record<string, unknown>) =>
  client.get('/identity/tenants', { params });
export const createTenant = (body: Record<string, unknown>) =>
  client.post('/identity/tenants', body);
export const updateTenant = (id: number, body: Record<string, unknown>) =>
  client.put(`/identity/tenants/${id}`, body);
export const deleteTenant = (id: number) =>
  client.delete(`/identity/tenants/${id}`);

// Users
export const getUsers = (params?: Record<string, unknown>) =>
  client.get('/identity/users', { params });
export const createUser = (body: Record<string, unknown>) =>
  client.post('/identity/users', body);
export const updateUser = (id: number, body: Record<string, unknown>) =>
  client.put(`/identity/users/${id}`, body);
export const deleteUser = (id: number) =>
  client.delete(`/identity/users/${id}`);

// Roles
export const getRoles = (params?: Record<string, unknown>) =>
  client.get('/identity/roles', { params });
export const createRole = (body: Record<string, unknown>) =>
  client.post('/identity/roles', body);
export const updateRole = (id: number, body: Record<string, unknown>) =>
  client.put(`/identity/roles/${id}`, body);
export const deleteRole = (id: number) =>
  client.delete(`/identity/roles/${id}`);

// Permissions
export const getPermissions = (params?: Record<string, unknown>) =>
  client.get('/identity/permissions', { params });

// Sites
export const getSites = (params?: Record<string, unknown>) =>
  client.get('/identity/sites', { params });
export const createSite = (body: Record<string, unknown>) =>
  client.post('/identity/sites', body);
export const updateSite = (id: number, body: Record<string, unknown>) =>
  client.put(`/identity/sites/${id}`, body);
export const deleteSite = (id: number) =>
  client.delete(`/identity/sites/${id}`);

// Departments
export const getDepartments = (params?: Record<string, unknown>) =>
  client.get('/identity/departments', { params });
export const createDepartment = (body: Record<string, unknown>) =>
  client.post('/identity/departments', body);
export const updateDepartment = (id: number, body: Record<string, unknown>) =>
  client.put(`/identity/departments/${id}`, body);
export const deleteDepartment = (id: number) =>
  client.delete(`/identity/departments/${id}`);
