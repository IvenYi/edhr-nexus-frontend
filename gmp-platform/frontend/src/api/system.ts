import client from './client';
import type { PageResult } from '@/types/common';

export interface IconGroup {
  id: string | number;
  name: string;
  sortOrder?: number;
  builtin?: boolean;
  iconCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface IconAsset {
  id: string | number;
  groupId?: string | number | null;
  fileId?: string | number | null;
  name: string;
  tags?: string[] | string;
  source?: string;
  builtinKey?: string | null;
  sortOrder?: number;
  previewUrl?: string;
  fileUrl?: string;
  uploadedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface IconQuery {
  groupId?: string | number | 'ALL';
  keyword?: string;
  page?: number;
  size?: number;
}

export interface SystemSettings {
  systemName: string;
  browserTitle: string;
  logoFileId?: string | number | null;
  logoUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  faviconFileId?: string | number | null;
  faviconUrl?: string;
}

export interface SystemSettingsUpdate {
  systemName: string;
  browserTitle: string;
  logoWidth: number;
  logoHeight: number;
}

function unwrap<T>(response: { data: { data: T } }): T {
  return response.data.data;
}

export const getIconGroups = async (): Promise<IconGroup[]> => {
  const response = await client.get('/system/icon-groups');
  return unwrap<IconGroup[]>(response);
};

export const createIconGroup = async (payload: { name: string }): Promise<IconGroup> => {
  const response = await client.post('/system/icon-groups', payload);
  return unwrap<IconGroup>(response);
};

export const updateIconGroup = async (id: string | number, payload: { name: string }): Promise<IconGroup> => {
  const response = await client.put(`/system/icon-groups/${id}`, payload);
  return unwrap<IconGroup>(response);
};

export const deleteIconGroup = async (id: string | number, options?: { cascade?: boolean }): Promise<void> => {
  await client.delete(`/system/icon-groups/${id}`, { params: { cascade: options?.cascade ?? false } });
};

export const reorderIconGroups = async (groupIds: Array<string | number>): Promise<void> => {
  await client.put('/system/icon-groups/order', { ids: groupIds });
};

export const getIcons = async (params: IconQuery = {}): Promise<IconAsset[]> => {
  const page = await getIconPage(params);
  return page.content;
};

export const getIconPage = async (params: IconQuery = {}): Promise<PageResult<IconAsset>> => {
  const query = {
    ...params,
    page: params.page ?? 1,
    size: params.size ?? 20,
    groupId: params.groupId === 'ALL' ? undefined : params.groupId,
  };
  const response = await client.get('/system/icons', { params: query });
  return unwrap<PageResult<IconAsset>>(response);
};

export const uploadIcon = async (payload: { file: File; groupId?: string | number | null; name?: string; tags?: string[] }): Promise<IconAsset> => {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.groupId) formData.append('groupId', String(payload.groupId));
  if (payload.name) formData.append('name', payload.name);
  if (payload.tags?.length) formData.append('tags', payload.tags.join(','));
  const response = await client.post('/system/icons/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<IconAsset>(response);
};

export const importIcons = async (payload: { files: File[]; groupId?: string | number | null }): Promise<IconAsset[]> => {
  const formData = new FormData();
  payload.files.forEach((file) => formData.append('files', file));
  if (payload.groupId) formData.append('groupId', String(payload.groupId));
  const response = await client.post('/system/icons/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<IconAsset[]>(response);
};

export const updateIcon = async (id: string | number, payload: Partial<Pick<IconAsset, 'name' | 'tags' | 'groupId' | 'sortOrder'>>): Promise<IconAsset> => {
  const response = await client.put(`/system/icons/${id}`, payload);
  return unwrap<IconAsset>(response);
};

export const deleteIcon = async (id: string | number): Promise<void> => {
  await client.delete(`/system/icons/${id}`);
};

export const batchDeleteIcons = async (iconIds: Array<string | number>): Promise<void> => {
  await client.post('/system/icons/batch-delete', { ids: iconIds });
};

export const reorderIcons = async (payload: { groupId?: string | number | null; iconIds: Array<string | number> }): Promise<void> => {
  await client.put('/system/icons/order', { groupId: payload.groupId, ids: payload.iconIds });
};

export const getPublicSystemSettings = async (): Promise<SystemSettings> => {
  const response = await client.get('/system/settings/public', { skipAuthRedirect: true });
  return unwrap<SystemSettings>(response);
};

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await client.get('/system/settings');
  return unwrap<SystemSettings>(response);
};

export const updateSystemSettings = async (payload: SystemSettingsUpdate): Promise<SystemSettings> => {
  const response = await client.put('/system/settings', payload);
  return unwrap<SystemSettings>(response);
};

export const uploadSystemLogo = async (file: File): Promise<SystemSettings> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/system/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<SystemSettings>(response);
};

export const uploadSystemFavicon = async (file: File): Promise<SystemSettings> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post('/system/settings/favicon', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<SystemSettings>(response);
};

export const deleteSystemLogo = async (): Promise<SystemSettings> => {
  const response = await client.delete('/system/settings/logo');
  return unwrap<SystemSettings>(response);
};

export const deleteSystemFavicon = async (): Promise<SystemSettings> => {
  const response = await client.delete('/system/settings/favicon');
  return unwrap<SystemSettings>(response);
};
