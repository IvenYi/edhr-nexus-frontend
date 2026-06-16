import client from './client';

interface RequestOptions {
  skipAuthRedirect?: boolean;
}

// Auth
export const getCurrentUser = (options?: RequestOptions) =>
  client.get('/auth/me', options);
export const uploadUserAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/auth/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const uploadSignatureEvidence = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetType', 'SIGNATURE_EVIDENCE');
  return client.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateCurrentUserProfile = (body: Record<string, unknown>) =>
  client.put('/auth/me/profile', body);
export const changeCurrentUserPassword = (body: Record<string, unknown>) =>
  client.post('/auth/me/password', body);
export const createPersonalSignature = (body: Record<string, unknown>) =>
  client.post('/auth/me/signature', body);

// Users
export const getUsers = (params?: Record<string, unknown>) =>
  client.get('/identity/users', { params });
export const createUser = (body: Record<string, unknown>) =>
  client.post('/identity/users', body);
export const updateUser = (id: number | string, body: Record<string, unknown>) =>
  client.put(`/identity/users/${id}`, body);
export const deleteUser = (id: number | string) =>
  client.delete(`/identity/users/${id}`);
export const removeUserFromOrganization = (id: number | string) =>
  client.post(`/identity/users/${id}/remove-from-organization`);
export const resetUserPassword = (id: number | string, body: Record<string, unknown>) =>
  client.post(`/identity/users/${id}/reset-password`, body);

// Roles
export const getRoles = (params?: Record<string, unknown>) =>
  client.get('/identity/roles', { params });
export const createRole = (body: Record<string, unknown>) =>
  client.post('/identity/roles', body);
export const updateRole = (id: number | string, body: Record<string, unknown>) =>
  client.put(`/identity/roles/${id}`, body);
export const deleteRole = (id: number | string) =>
  client.delete(`/identity/roles/${id}`);
export const getRolePermissions = (id: number | string) =>
  client.get(`/identity/roles/${id}/permissions`);
export const updateRolePermissions = (id: number | string, body: Record<string, unknown>) =>
  client.put(`/identity/roles/${id}/permissions`, body);

// Permissions
export const getPermissions = (params?: Record<string, unknown>) =>
  client.get('/identity/roles/permissions', { params });

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
export const getDepartmentTree = () =>
  client.get('/identity/departments/tree');
export const createDepartment = (body: Record<string, unknown>) =>
  client.post('/identity/departments', body);
export const updateDepartment = (id: number | string, body: Record<string, unknown>) =>
  client.put(`/identity/departments/${id}`, body);
export const deleteDepartment = (id: number | string) =>
  client.delete(`/identity/departments/${id}`);
